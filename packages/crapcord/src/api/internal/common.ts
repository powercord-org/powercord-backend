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

export type AuthenticationToken = { type: 'Bot' | 'Bearer', token: string }
export type DiscordToken = AuthenticationToken // todo: | { type: 'Credentials', clientId: string, clientSecret: string }

export type Route = { method: Dispatcher.HttpMethod, path: string, key: string }

export type Query = {
  route: Route
  body?: any
  reason?: string
  token?: DiscordToken
}

export class DiscordError extends Error {
  constructor (message: string, public response: Dispatcher.ResponseData) { super(message) }
}

export type RouteFactory = (params: Record<string, string>) => Route
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
  return <RouteFactory> new Function('params', `return { method: '${method}', path: \`${API_BASE}${path}\`, key: \`${method}${routeKey}\` }`)
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
    'x-audit-log-reason': query.reason,
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

  const body = await readBody(response)
  if (response.statusCode >= 400) {
    throw new DiscordError(`Discord API Error [${body.code}]: ${body.message}`, response)
  }

  return toCamelCase(body)
}
