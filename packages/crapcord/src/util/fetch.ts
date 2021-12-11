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

// todo: this is very discord specific and could live under src/api maybe?
// todo: consider migrating to https://github.com/nodejs/undici ?

import type { IncomingMessage } from 'http'
import type { Readable } from 'stream'
import type { Deferred } from './deferred.js'
import https from 'https'
import { createBrotliDecompress, createGunzip, createInflate } from 'zlib'
import { URL } from 'url'
import { makeDeferred } from './deferred.js'

// Ratelimit-aware fetch wrapper
// note: the implementation is super poor and dumb but serves the purpose:tm:

export type RequestProps = {
  url: string | URL
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
}

export type Response = {
  statusCode: number
  headers: Record<string, string | string[] | undefined>
  body: any
}

const remainingMap = new Map<string, number>()
const deferredMap = new Map<string, Deferred<void>>()

async function prepareRequest (url: string): Promise<void> {
  let skipDeferred = false
  let skipRemainingUpdate = false

  if (remainingMap.get(url) === -1) await deferredMap.get(url)?.promise
  if (!remainingMap.has(url)) {
    deferredMap.set(url, makeDeferred())
    remainingMap.set(url, -1)
    skipRemainingUpdate = true
    skipDeferred = true
  }

  if (remainingMap.get(url) === 1) {
    deferredMap.set(url, makeDeferred())
    skipDeferred = true
  }

  if (!skipDeferred && remainingMap.get(url) === 0) {
    deferredMap.set(url, makeDeferred())
  }

  if (!skipRemainingUpdate) remainingMap.set(url, Math.max(remainingMap.get(url)! - 1, 0))
  if (!skipDeferred) await deferredMap.get(url)?.promise
}

async function processResponse (url: string, res: IncomingMessage) {
  if (remainingMap.get(url) === -1) {
    remainingMap.set(url, Number(res.headers['x-ratelimit-remaining']))
    deferredMap.get(url)?.resolve()
  }

  if (res.headers['x-ratelimit-remaining'] === '0') {
    setTimeout(() => {
      remainingMap.set(url, Number(res.headers['x-ratelimit-limit']))
      deferredMap.get(url)?.resolve()
    }, Number(res.headers['x-ratelimit-reset-after']) * 1e3)
  }
}

export default async function fetch (request: RequestProps): Promise<Response> {
  if (request.body !== void 0 && request.body !== null && request.method === 'GET') {
    throw new TypeError('Cannot set a body for GET requests.')
  }

  // Deals with ratelimit and all
  await prepareRequest(request.url.toString())

  // Execute the request
  // [Cynthia] We could accept gzip/deflate, but I'm unsure if it's worth. todo: measure impact?
  const req = https.request(request.url, { method: request.method, headers: request.headers })
  req.setHeader('user-agent', 'DiscordBot (https://powercord.dev, RollingRelease)')
  req.setHeader('accept-encoding', 'br, gzip, deflate')

  if (request.body) {
    req.setHeader('content-type', 'application/json')
    req.write(JSON.stringify(request.body))
  }

  req.end()
  const res = await new Promise<IncomingMessage>((resolve) => req.on('response', resolve))

  // Deals with ratelimit and all (part 2)
  // todo: check if status is 429 and add extra logic here too
  processResponse(request.url.toString(), res)

  // Decompress response if necessary
  let bodyStream: Readable = res
  switch (res.headers['content-encoding']) {
    case 'br':
      bodyStream = res.pipe(createBrotliDecompress())
      break
    case 'gzip':
      bodyStream = res.pipe(createGunzip())
      break
    case 'deflate':
      bodyStream = res.pipe(createInflate())
      break
  }

  const chunks: Buffer[] = []
  bodyStream.on('data', (chk) => chunks.push(chk))
  await new Promise((resolve) => bodyStream.on('end', resolve))
  const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))

  return {
    statusCode: res.statusCode || 200,
    headers: res.headers,
    body: body,
  }
}
