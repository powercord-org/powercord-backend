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
  RESTPostAPIChannelMessageJSONBody as MessageCreatePayloadSneak,
  RESTPostAPIChannelMessageResult as MessageCreateResponseSneak,
  RESTGetAPIChannelMessageResult as MessageFetchResponseSneak,
} from 'discord-api-types/v9'

import type { DiscordToken } from './internal/common.js'
import type { CamelCase } from '../util/case.js'
import { route, executeQuery } from './internal/common.js'

type MessageCreatePayload = CamelCase<MessageCreatePayloadSneak>
type MessageCreateResponse = CamelCase<MessageCreateResponseSneak>
type MessageFetchResponse = CamelCase<MessageFetchResponseSneak>

const CREATE_MESSAGE_ROUTE = route`${'POST'}/channels/${'channelId'}/messages`
const FETCH_MESSAGE_ROUTE = route`${'GET'}/channels/${'channelId'}/messages/${'messageId'}`

// todo: Get Channel Messages

// Get Channel Message
export async function fetchMessage (channelId: string, messageId: string, token: DiscordToken): Promise<MessageFetchResponse> {
  return executeQuery({
    route: FETCH_MESSAGE_ROUTE({ channelId: channelId, messageId: messageId }),
    token: token,
  })
}

// Create Message
export async function createMessage (channelId: string, message: MessageCreatePayload, token: DiscordToken): Promise<MessageCreateResponse> {
  return executeQuery({
    route: CREATE_MESSAGE_ROUTE({ channelId: channelId }),
    token: token,
    body: message,
  })
}

// todo: Crosspost Message

// todo: Create Reaction

// todo: Delete Own Reaction

// todo: Delete User Reaction

// todo: Get Reactions

// todo: Delete All Reactions

// todo: Delete All Reactions for Emoji

// todo: Edit Message

// todo: Delete Message

// todo: Bulk Delete Messages
