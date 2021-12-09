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
import type { Data } from 'ws'
import { GatewayIntentBits, GatewayOpcodes } from 'discord-api-types'
import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter'
import WebSocket from 'ws'

import { DISCORD_GATEWAY } from './constants.js'

type Events = {
  // todo: map all the event names to event data
  error: (err: Error) => void
}

class GatewayConnection extends EventEmitter<Events> {
  #ws: WebSocket

  #token: string

  #sessionId: string | null = null

  #sequence: number = 0

  #pendingHeartbeats: number = 0

  #heartbeatInterval: NodeJS.Timeout | null = null

  #expectingShutdown: boolean = false

  constructor (token: string) {
    super()
    this.#token = token
    this.#ws = null as unknown as WebSocket // makes ts happy
    this.#connect()
  }

  // todo: we probably don't even need to expose this in our impl
  send (data: GatewaySendPayload) {
    this.#ws.send(JSON.stringify(data))
  }

  #connect () {
    this.#sequence = 0
    this.#ws = new WebSocket(DISCORD_GATEWAY)
    this.#ws.on('message', (m) => this.#handleMessage(m))
    this.#ws.on('close', () => {
      if (this.#heartbeatInterval) clearInterval(this.#heartbeatInterval)
      if (!this.#expectingShutdown) {
        setTimeout(() => this.#connect(), (4 * Math.random()) + 1)
      }

      this.#expectingShutdown = false
    })
  }

  #identify () {
    if (this.#sessionId) {
      this.#resume()
      return
    }

    this.send({
      op: GatewayOpcodes.Identify,
      d: {
        token: this.#token,
        properties: {
          $os: process.platform,
          $browser: 'Discord Client',
          $device: 'Discord Client',
        },
        intents: GatewayIntentBits.GuildMembers
          & GatewayIntentBits.GuildBans
          & GatewayIntentBits.GuildInvites
          & GatewayIntentBits.GuildMessages,
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
        token: this.#token,
        session_id: this.#sessionId,
        seq: this.#sequence,
      },
    })
  }

  #heartbeat () {
    this.#pendingHeartbeats++
    if (this.#pendingHeartbeats === 3) {
      console.log('Zombified gateway connection. Reconnecting.')
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

  #handleMessage (message: Data) {
    if (typeof message !== 'string') {
      this.#ws.close()
      this.emit('error', new Error('unexpected non-string payload'))
      return
    }

    const data = JSON.parse(message) as GatewayReceivePayload
    switch (data.op) {
      case 0: // dispatch
        this.#sequence = data.s
        this.#handleDispatch(data)
        break
      case 1: // heartbeat
        this.#heartbeat()
        break
      case 7: // reconnect
        this.#expectingShutdown = true
        this.#ws.close()
        this.#connect()
        break
      case 9: // invalid session
        if (!data.d) this.#sessionId = null
        setTimeout(() => this.#identify, 1 + Math.random())
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
    console.log(payload, this.#sequence)
  }
}

export function connect (token: string): GatewayConnection {
  return new GatewayConnection(token)
}
