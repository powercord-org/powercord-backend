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
