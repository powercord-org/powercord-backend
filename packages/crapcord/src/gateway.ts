/*
 * Copyright (c) 2018-2021 aetheryx & Cynthia K. Rey
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { GatewayDispatchPayload, GatewayReceivePayload, GatewaySendPayload } from 'discord-api-types'
import type { Inflate } from 'zlib'
import type EventMap from './util/eventmap.js'
import { createInflate, constants as ZlibConstants } from 'zlib'
import { GatewayOpcodes, GatewayDispatchEvents } from 'discord-api-types'
import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter'
import WebSocket from 'ws'

import { handleGatewayPayload } from './interactions/handler.js'
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
        setTimeout(() => this.#connect(), (4 * Math.random()) + 1)
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
      case 0: // dispatch
        this.#sequence = data.s
        this.#handleDispatch(data)
        break
      case 1: // heartbeat
        this.#heartbeat()
        break
      case 7: // reconnect
        this.emit('reconnect')
        this.#expectingShutdown = true
        this.#ws.close()
        this.#connect()
        break
      case 9: // invalid session
        if (!data.d) this.#sessionId = null
        setTimeout(() => this.#identify(), 1 + Math.random())
        break
      case 10: // henlo
        this.#identify()
        this.#heartbeatInterval = setTimeout(() => {
          this.#heartbeat()
          this.#heartbeatInterval = setInterval(() => this.#heartbeat(), data.d.heartbeat_interval)
        }, data.d.heartbeat_interval * Math.random())
        break
      case 11: // heartbeat ack
        this.#pendingHeartbeats--
        break
    }
  }

  #handleDispatch (payload: GatewayDispatchPayload) {
    if (payload.t === GatewayDispatchEvents.InteractionCreate) {
      handleGatewayPayload(payload.d, { type: 'Bot', token: this.#options.token })
      return
    }

    // As easy as it gets, eh
    // as any is required because TS is yelling
    this.emit(payload.t, toCamelCase(payload.d) as any)
  }
}
