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
  RESTPostAPIWebhookWithTokenJSONBody as ExecutePayloadSneak,
  RESTPostAPIWebhookWithTokenWaitResult as ExecuteResponseSneak,
  RESTGetAPIWebhookWithTokenMessageResult as FetchResponseSneak,
  RESTPatchAPIWebhookWithTokenMessageJSONBody as UpdatePayloadSneak,
  RESTPatchAPIWebhookWithTokenMessageResult as UpdateResponseSneak,
} from 'discord-api-types/v9'
import type { DiscordToken } from './internal/common.js'
import type { CamelCase } from '../util/case.js'
import { route, executeQuery } from './internal/common.js'

type ExecutePayload = CamelCase<ExecutePayloadSneak>
type ExecuteResponse = CamelCase<ExecuteResponseSneak>
type FetchResponse = CamelCase<FetchResponseSneak>
type UpdatePayload = CamelCase<UpdatePayloadSneak>
type UpdateResponse = CamelCase<UpdateResponseSneak>

export type Webhook = { id: string, token: string }

const CREATE_MESSAGE = route`${'POST'}/webhooks/${'webhookId'}/${'webhookToken'}?wait=true`
const FETCH_MESSAGE = route`${'GET'}/webhooks/${'webhookId'}/${'webhookToken'}/messages/${'messageId'}`
const UPDATE_MESSAGE = route`${'PATCH'}/webhooks/${'webhookId'}/${'webhookToken'}/messages/${'messageId'}`
const DELETE_MESSAGE = route`${'DELETE'}/webhooks/${'webhookId'}/${'webhookToken'}/messages/${'messageId'}`

export async function createMessage (message: ExecutePayload, hook: Webhook, token?: DiscordToken): Promise<ExecuteResponse> {
  return executeQuery({
    route: CREATE_MESSAGE({ webhookId: hook.id, webhookToken: hook.token }),
    body: message,
    token: token,
  })
}

export async function fetchMessage (messageId: string, hook: Webhook, token?: DiscordToken): Promise<FetchResponse> {
  return executeQuery({
    route: FETCH_MESSAGE({ webhookId: hook.id, webhookToken: hook.token, messageId: messageId }),
    token: token,
  })
}

export async function updateMessage (messageId: string, message: UpdatePayload, hook: Webhook, token?: DiscordToken): Promise<UpdateResponse> {
  return executeQuery({
    route: UPDATE_MESSAGE({ webhookId: hook.id, webhookToken: hook.token, messageId: messageId }),
    body: message,
    token: token,
  })
}

export async function deleteMessage (messageId: string, hook: Webhook, token?: DiscordToken): Promise<void> {
  return executeQuery({
    route: DELETE_MESSAGE({ webhookId: hook.id, webhookToken: hook.token, messageId: messageId }),
    token: token,
  })
}
