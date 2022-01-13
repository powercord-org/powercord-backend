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

import type {
  RESTPostAPIWebhookWithTokenJSONBody as ExecutePayloadSneak,
  RESTPostAPIWebhookWithTokenWaitResult as ExecuteWaitResponseSneak,
  RESTGetAPIWebhookWithTokenMessageResult as FetchResponseSneak,
  RESTPatchAPIWebhookWithTokenMessageJSONBody as UpdatePayloadSneak,
  RESTPatchAPIWebhookWithTokenMessageResult as UpdateResponseSneak,
} from 'discord-api-types/v9'
import type { CamelCase } from '../util/case.js'
import { route, executeQuery } from './internal/common.js'

type ExecutePayload = CamelCase<ExecutePayloadSneak>
type ExecuteWaitResponse = CamelCase<ExecuteWaitResponseSneak>
type FetchResponse = CamelCase<FetchResponseSneak>
type UpdatePayload = CamelCase<UpdatePayloadSneak>
type UpdateResponse = CamelCase<UpdateResponseSneak>

export type Webhook = { id: string, token: string }

const EXECUTE_WEBHOOK = route`${'POST'}/webhooks/${'webhookId'}/${'webhookToken'}`
const FETCH_MESSAGE = route`${'GET'}/webhooks/${'webhookId'}/${'webhookToken'}/messages/${'messageId'}`
const UPDATE_MESSAGE = route`${'PATCH'}/webhooks/${'webhookId'}/${'webhookToken'}/messages/${'messageId'}`
const DELETE_MESSAGE = route`${'DELETE'}/webhooks/${'webhookId'}/${'webhookToken'}/messages/${'messageId'}`

// todo: Create Webhook

// todo: Get Channel Webhooks

// todo: Get Guild Webhooks

// todo: Get Webhook

// todo: Get Webhook with Token

// todo: Modify Webhook

// todo: Modify Webhook with Token

// todo: Delete Webhook

// todo: Delete Webhook with Token

// Execute Webhook (wait=false)
export async function executeWebhook (hook: Webhook, message: ExecutePayload, thread?: string): Promise<void> {
  return executeQuery({
    route: EXECUTE_WEBHOOK({ webhookId: hook.id, webhookToken: hook.token }, { wait: 'false', thread: thread }),
    body: message,
  })
}

// Execute Webhook (wait=true)
export async function executeWebhookAwaitMessage (hook: Webhook, message: ExecutePayload, thread?: string): Promise<ExecuteWaitResponse> {
  return executeQuery({
    route: EXECUTE_WEBHOOK({ webhookId: hook.id, webhookToken: hook.token }, { wait: 'true', thread: thread }),
    body: message,
  })
}

// Get Webhook Message
export async function fetchMessage (hook: Webhook, messageId: string): Promise<FetchResponse> {
  return executeQuery({ route: FETCH_MESSAGE({ webhookId: hook.id, webhookToken: hook.token, messageId: messageId }) })
}

// Edit Webhook Message
export async function updateMessage (hook: Webhook, messageId: string, message: UpdatePayload): Promise<UpdateResponse> {
  return executeQuery({
    route: UPDATE_MESSAGE({ webhookId: hook.id, webhookToken: hook.token, messageId: messageId }),
    body: message,
  })
}

// Delete Webhook Message
export async function deleteMessage (hook: Webhook, messageId: string): Promise<void> {
  return executeQuery({ route: DELETE_MESSAGE({ webhookId: hook.id, webhookToken: hook.token, messageId: messageId }) })
}
