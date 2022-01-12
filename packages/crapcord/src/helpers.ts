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

import type { DiscordToken } from './api/internal/common.js'

import http from 'http'
import { handlePayload } from './interactions/handler.js'

type ServerProps = {
  port: number
  key: string
  token: DiscordToken
}

export function createInteractionServer (props: ServerProps) {
  http.createServer((request, response) => {
    if (request.method !== 'POST') {
      response.writeHead(405).end('method not allowed')
      return
    }

    const sig = request.headers['x-signature-ed25519']
    const ts = request.headers['x-signature-timestamp']
    if (typeof sig !== 'string' || typeof ts !== 'string') {
      response.writeHead(401).end('missing security headers')
      return
    }

    let payload = ''
    request.setEncoding('utf8')
    request.on('error', () => void 0)
    request.on('data', (d) => (payload += d))
    request.on('end', async () => {
      const res = await handlePayload(payload, sig, ts, props.key, props.token)
      if ('code' in res) {
        response.writeHead(res.code).end(res.message)
        return
      }

      const data = JSON.stringify(res)
      response.setHeader('content-type', 'application/json')
      response.setHeader('content-length', Buffer.from(data).length)
      response.end(data)
    })
  }).listen(props.port)
}
