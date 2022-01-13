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

import type { Dispatcher } from 'undici'
import { Client } from 'undici'
import { promisify } from 'util'
import { brotliDecompress as brotliDecompressCallback } from 'zlib'
import { API_HOST, API_BASE } from '../../constants.js'
import { toCamelCase, toSneakCase } from '../../util/case.js'
import { acquireRequest, consumeResponse } from './ratelimit.js'
const brotliDecompress = promisify(brotliDecompressCallback)

const DiscordClient = new Client(API_HOST)

const DISCORD_MAJOR_PARAMS = [ 'guildId', 'channelId', 'webhookId', 'webhookToken' ]

export type BotToken = { type: 'Bot', token: string }
export type OAuthToken = { type: 'Bearer', token: string } | { type: 'Bearer', token: string, expiry: number, refresh: string }
export type ClientCredentials = { type: 'Credentials', clientId: string, clientSecret: string }

export type AuthenticationToken = BotToken | OAuthToken
export type DiscordToken = BotToken | OAuthToken // todo: | ClientCredentials

export type Route = { method: Dispatcher.HttpMethod, path: string, key: string }

export type Query = {
  route: Route
  body?: any
  reason?: string | null
  token?: DiscordToken
}

export class DiscordError extends Error {
  constructor (message: string, public response: Dispatcher.ResponseData) { super(message) }
}

export type RouteFactory = (params: Record<string, string>, query?: Record<string, string | void>) => Route
export function route (chunks: TemplateStringsArray, method: Dispatcher.HttpMethod, ...params: string[]): RouteFactory {
  const parts: string[] = [ chunks[1] ]
  let routeKey = chunks[1]
  let i = 2

  for (const param of params) {
    routeKey += DISCORD_MAJOR_PARAMS.includes(param)
      ? `\${params.${param}}${chunks[i]}`
      : `:${param}${chunks[i]}`

    parts.push(`\${params.${param}}`, chunks[i++])
  }

  const path = parts.filter(Boolean).join('')
  return <RouteFactory> new Function('params', 'query', `return { method: '${method}', path: \`${API_BASE}${path}\${query ? '?' + new URLSearchParams(query).toString() : ''}\`, key: \`${method}${routeKey}\` }`)
}

async function readBody (response: Dispatcher.ResponseData) {
  if (response.headers['content-encoding'] === 'br') {
    const body = await response.body.arrayBuffer()
    const decompressed = await brotliDecompress(body)
    return JSON.parse(decompressed.toString('utf8'))
  }

  return response.body.json()
}

export async function executeQuery (query: Query): Promise<any> {
  const requestBody = query.body
    ? JSON.stringify(toSneakCase(query.body))
    : void 0

  const headers = {
    authorization: query.token ? `${query.token.type} ${query.token.token}` : void 0,
    accept: 'application/json',
    'accept-encoding': 'br',
    'user-agent': 'DiscordBot (https://www.youtube.com/watch?v=dQw4w9WgXcQ, 0.0.0)',
    'content-type': requestBody ? 'application/json' : void 0,
    'content-length': requestBody ? requestBody.length.toString(10) : void 0,
    'x-audit-log-reason': query.reason || void 0,
  }

  await acquireRequest(query.route.key)
  const response = await DiscordClient.request({
    path: query.route.path,
    method: query.route.method,
    body: requestBody,
    headers: headers,
  })

  consumeResponse(query.route.key, response)
  if (response.statusCode === 429) {
    // retry failed query
    return executeQuery(query)
  }

  if (response.statusCode === 204) {
    return
  }

  const body = await readBody(response)
  if (response.statusCode >= 400) {
    throw new DiscordError(`Discord API Error [${body.code}]: ${body.message}`, response)
  }

  return toCamelCase(body)
}
