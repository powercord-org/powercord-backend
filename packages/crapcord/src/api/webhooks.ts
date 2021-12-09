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
  RESTPostAPIWebhookWithTokenJSONBody as ExecutePayload,
  RESTPostAPIWebhookWithTokenWaitResult as ExecuteResponse,
  RESTGetAPIWebhookWithTokenMessageResult as FetchResponse,
  RESTPatchAPIWebhookWithTokenMessageJSONBody as UpdatePayload,
  RESTPatchAPIWebhookWithTokenMessageResult as UpdateResponse,
} from 'discord-api-types/v9'
import type { DiscordToken } from './common.js'
import { executeQuery } from './common.js'
import { API_BASE } from '../constants.js'

export type Webhook = { id: string, token: string }

export async function createMessage (message: ExecutePayload, hook: Webhook, token?: DiscordToken): Promise<ExecuteResponse> {
  const headers: Record<string, string> = token ? { authorization: `${token.type} ${token.token}` } : {}

  return executeQuery({
    method: 'POST',
    url: `${API_BASE}/webhooks/${hook.id}/${hook.token}?wait=true`,
    headers: headers,
    body: message,
  })
}

export async function fetchMessage (messageId: string, hook: Webhook, token?: DiscordToken): Promise<FetchResponse> {
  const headers: Record<string, string> = token ? { authorization: `${token.type} ${token.token}` } : {}

  return executeQuery({
    method: 'GET',
    url: `${API_BASE}/webhooks/${hook.id}/${hook.token}/messages/${messageId}`,
    headers: headers,
  })
}

export async function updateMessage (messageId: string, message: UpdatePayload, hook: Webhook, token?: DiscordToken): Promise<UpdateResponse> {
  const headers: Record<string, string> = token ? { authorization: `${token.type} ${token.token}` } : {}

  return executeQuery({
    method: 'POST',
    url: `${API_BASE}/webhooks/${hook.id}/${hook.token}/messages/${messageId}`,
    headers: headers,
    body: message,
  })
}

export async function deleteMessage (messageId: string, hook: Webhook, token?: DiscordToken): Promise<void> {
  const headers: Record<string, string> = token ? { authorization: `${token.type} ${token.token}` } : {}

  return executeQuery({
    method: 'DELETE',
    url: `${API_BASE}/webhooks/${hook.id}/${hook.token}/messages/${messageId}`,
    headers: headers,
  })
}
