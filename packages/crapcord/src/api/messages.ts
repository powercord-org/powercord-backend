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
  RESTPostAPIChannelMessageJSONBody as MessageCreatePayloadSneak,
  RESTPostAPIChannelMessageResult as MessageCreateResponseSneak,
  RESTGetAPIChannelMessageResult as MessageFetchResponseSneak,
} from 'discord-api-types/v9'

import type { DiscordToken } from './common.js'
import type { CamelCase } from '../util/case.js'
import { executeQuery } from './common.js'
import { API_BASE } from '../constants.js'

type MessageCreatePayload = CamelCase<MessageCreatePayloadSneak>
type MessageCreateResponse = CamelCase<MessageCreateResponseSneak>
type MessageFetchResponse = CamelCase<MessageFetchResponseSneak>

// todo: allow passing a function for components stuff and automatically register it behind the scenes
export async function createMessage (channelId: string, message: MessageCreatePayload, token: DiscordToken): Promise<MessageCreateResponse> {
  return executeQuery({
    method: 'POST',
    url: `${API_BASE}/channels/${channelId}/messages`,
    headers: { authorization: `${token.type} ${token.token}` },
    body: message,
  })
}

export async function fetchMessage (channelId: string, messageId: string, token: DiscordToken): Promise<MessageFetchResponse> {
  return executeQuery({
    method: 'GET',
    url: `${API_BASE}/channels/${channelId}/messages/${messageId}`,
    headers: { authorization: `${token.type} ${token.token}` },
  })
}
