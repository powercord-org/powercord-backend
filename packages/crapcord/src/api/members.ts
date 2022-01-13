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
  RESTPatchAPIGuildMemberJSONBody as ModifyMemberPayloadSneak,
  RESTPatchAPIGuildMemberResult as ModifyMemberResponseSneak,
} from 'discord-api-types/v9'
import type { DiscordToken } from './internal/common.js'
import type { CamelCase } from '../util/case.js'
import { route, executeQuery } from './internal/common.js'

type ModifyMemberPayload = CamelCase<ModifyMemberPayloadSneak & { communication_disabled_until?: string }>
type ModifyMemberResponse = CamelCase<ModifyMemberResponseSneak & { communication_disabled_until?: string }>

const MODIFY_MEMBER = route`${'PATCH'}/guilds/${'guildId'}/members/${'userId'}`
const ADD_MEMBER_ROLE = route`${'PUT'}/guilds/${'guildId'}/members/${'userId'}/roles/${'roleId'}`
const REMOVE_MEMBER_ROLE = route`${'DELETE'}/guilds/${'guildId'}/members/${'userId'}/roles/${'roleId'}`

// todo: Get Guild Member

// todo: List Guild Members

// todo: Search Guild Members

// Modify Guild Member
export function modifyGuildMember (guildId: string, userId: string, member: ModifyMemberPayload, reason: string | null | undefined, token: DiscordToken): Promise<ModifyMemberResponse> {
  return executeQuery({
    route: MODIFY_MEMBER({ guildId: guildId, userId: userId }),
    body: member,
    reason: reason,
    token: token,
  })
}

// todo: Modify Current Member

// Add Guild Member Role
export function addGuildMemberRole (guildId: string, userId: string, roleId: string, reason: string | null | undefined, token: DiscordToken): Promise<void> {
  return executeQuery({
    route: ADD_MEMBER_ROLE({ guildId: guildId, userId: userId, roleId: roleId }),
    reason: reason,
    token: token,
  })
}

// Remove Guild Member Role
export function removeGuildMemberRole (guildId: string, userId: string, roleId: string, reason: string | null | undefined, token: DiscordToken): Promise<void> {
  return executeQuery({
    route: REMOVE_MEMBER_ROLE({ guildId: guildId, userId: userId, roleId: roleId }),
    reason: reason,
    token: token,
  })
}

// todo: Modify Current User Voice State

// todo: Modify User Voice State
