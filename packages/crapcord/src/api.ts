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

import type {
  RESTPostAPIChannelMessageJSONBody as MessageJSONPayload,
  APIMessage as Message,
} from 'discord-api-types/v9'

import type { Response } from './fetch.js'
import fetch from './fetch.js'

const API_BASE = 'https://discord.com/api/v9'

export type DiscordToken = { type: 'Bot' | 'Bearer', token: string }

class DiscordError extends Error {
  constructor (message: string, public response: Response) { super(message) }
}

export async function createMessage (channelId: string, message: MessageJSONPayload, token: DiscordToken): Promise<Message> {
  const res = await fetch({
    method: 'POST',
    url: `${API_BASE}/channels/${channelId}/messages`,
    headers: { authorization: `${token.type} ${token.token}` },
    body: message,
  })

  if (res.statusCode !== 200) {
    throw new DiscordError(`Discord API Error [${res.body.code}]: ${res.body.message}`, res)
  }

  return res.body
}

export function withToken (token: DiscordToken) {
  return {
    createMessage: (channelId: string, message: MessageJSONPayload) => createMessage(channelId, message, token),
  }
}
