/*
 * Copyright (c) 2022 Cynthia K. Rey, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import type { GatewayDispatchPayload, GatewayReceivePayload, GatewaySendPayload } from 'discord-api-types'
import type { Inflate } from 'zlib'
import type EventMap from './util/eventmap.js'
import { createInflate, constants as ZlibConstants } from 'zlib'
import { GatewayOpcodes, GatewayDispatchEvents } from 'discord-api-types'
import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter'
import WebSocket from 'ws'

import { toCamelCase } from './util/case.js'
import { DISCORD_GATEWAY } from './constants.js'

type Events = EventMap & {
  // Lifecycle events
  reconnect: () => void
  zombie: () => void

  // Toggle-able events
  payload: (payload: GatewayReceivePayload) => void

  error: (err: Error) => void
}

type ConnectionOptions = {
  token: string
  intents: number
  emitPayloads?: boolean
}

// todo: support sharding
export default class GatewayConnection extends EventEmitter<Events> {
  #ws: WebSocket

  #inflate: Inflate

  #options: ConnectionOptions

  #sessionId: string | null = null

  #sequence: number = 0

  #pendingHeartbeats: number = 0

  #heartbeatInterval: NodeJS.Timeout | null = null

  #expectingShutdown: boolean = false

  #zlibChunks: Buffer[] = []

  constructor (options: ConnectionOptions) {
    super()
    this.#options = { ...options }

    this.#inflate = createInflate({ flush: ZlibConstants.Z_SYNC_FLUSH })
    this.#inflate.on('data', (data) => this.#zlibChunks.push(data))

    // Trick to make TS happy w/o ugly hacks
    this.#ws = this.#connect()
  }

  // todo: we probably don't even need to expose this in our impl
  send (data: GatewaySendPayload) {
    this.#ws.send(JSON.stringify(data))
  }

  #connect () {
    this.#inflate.reset()
    this.#ws = new WebSocket(DISCORD_GATEWAY)

    this.#ws.on('message', (data: Buffer) => {
      this.#inflate.write(data)
      if (data.length >= 4 && data.readUInt32BE(data.length - 4) === 0x0ffff) {
        this.#inflate.flush(ZlibConstants.Z_SYNC_FLUSH, () => this.#handleFlushComplete())
      }
    })

    this.#ws.on('close', () => {
      if (this.#heartbeatInterval) clearInterval(this.#heartbeatInterval)
      if (!this.#expectingShutdown) {
        setTimeout(() => this.#connect(), ((4 * Math.random()) + 1) * 1e3)
      }

      this.#expectingShutdown = false
    })

    return this.#ws
  }

  #identify () {
    if (this.#sessionId) {
      this.#resume()
      return
    }

    this.send({
      op: GatewayOpcodes.Identify,
      d: {
        token: this.#options.token,
        properties: {
          $os: process.platform,
          $browser: 'Crapcord',
          $device: 'Crapcord',
        },
        intents: this.#options.intents,
      },
    })
  }

  #resume () {
    if (!this.#sessionId) {
      this.#identify()
      return
    }

    this.send({
      op: GatewayOpcodes.Resume,
      d: {
        token: this.#options.token,
        session_id: this.#sessionId,
        seq: this.#sequence,
      },
    })
  }

  #heartbeat () {
    this.#pendingHeartbeats++
    if (this.#pendingHeartbeats === 3) {
      this.emit('zombie')
      this.#expectingShutdown = true
      this.#ws.close()
      this.#connect()
      return
    }

    this.send({
      op: GatewayOpcodes.Heartbeat,
      d: this.#sequence,
    })
  }

  #handleFlushComplete () {
    const data = this.#zlibChunks.length > 1
      ? Buffer.concat(this.#zlibChunks)
      : this.#zlibChunks[0]

    this.#zlibChunks = []
    this.#handleMessage(data.toString())
  }

  #handleMessage (message: string) {
    const data = JSON.parse(message) as GatewayReceivePayload
    if (this.#options.emitPayloads) this.emit('payload', data)

    switch (data.op) {
      case GatewayOpcodes.Dispatch: // dispatch
        this.#sequence = data.s
        this.#handleDispatch(data)
        break
      case GatewayOpcodes.Heartbeat: // heartbeat
        this.#heartbeat()
        break
      case GatewayOpcodes.Reconnect: // reconnect
        this.emit('reconnect')
        this.#expectingShutdown = true
        this.#ws.close()
        this.#connect()
        break
      case GatewayOpcodes.InvalidSession: // invalid session
        if (!data.d) this.#sessionId = null
        setTimeout(() => this.#identify(), (1 + Math.random()) * 1e3)
        break
      case GatewayOpcodes.Hello: // henlo
        this.#identify()
        this.#heartbeatInterval = setTimeout(() => {
          this.#heartbeat()
          this.#heartbeatInterval = setInterval(() => this.#heartbeat(), data.d.heartbeat_interval)
        }, data.d.heartbeat_interval * Math.random())
        break
      case GatewayOpcodes.HeartbeatAck: // heartbeat ack
        this.#pendingHeartbeats--
        break
    }
  }

  #handleDispatch (payload: GatewayDispatchPayload) {
    if (payload.t === GatewayDispatchEvents.Ready) {
      this.#sessionId = payload.d.session_id
    }

    // as any is required because TS is yelling
    const data = toCamelCase(payload.d) as any

    // Idea yoinked from catnip
    // https://github.com/mewna/catnip/blob/7634fc1/src/main/java/com/mewna/catnip/shard/DispatchEmitter.java#L121
    if (payload.t === GatewayDispatchEvents.MessageUpdate && !payload.d.author) {
      this.emit('MESSAGE_EMBED_UPDATE', data)
      return
    }

    // As easy as it gets, eh
    this.emit(payload.t, data)
  }
}
