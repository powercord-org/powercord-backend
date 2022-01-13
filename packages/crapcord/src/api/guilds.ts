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

import type { DiscordToken } from './internal/common.js'
import { route, executeQuery } from './internal/common.js'

const REMOVE_GUILD_MEMBER = route`${'DELETE'}/guilds/${'guildId'}/members/${'userId'}`
const CREATE_GUILD_BAN = route`${'PUT'}/guilds/${'guildId'}/bans/${'userId'}`
const REMOVE_GUILD_BAN = route`${'DELETE'}/guilds/${'guildId'}/bans/${'userId'}`

// todo: Get Guild Audit Log

// todo: Create Guild

// todo: Get Guild

// todo: Get Guild Preview

// todo: Modify Guild

// todo: Delete Guild

// todo: Add Guild Member

// Remove Guild Member
export function removeGuildMember (guildId: string, userId: string, reason: string | null | undefined, token: DiscordToken): Promise<void> {
  return executeQuery({
    route: REMOVE_GUILD_MEMBER({ guildId: guildId, userId: userId }),
    reason: reason,
    token: token,
  })
}

// todo: Get Guild Bans

// todo: Get Guild Ban

// Create Guild Ban
export function createGuildBan (guildId: string, userId: string, deleteDays: number, reason: string | null | undefined, token: DiscordToken): Promise<void> {
  return executeQuery({
    route: CREATE_GUILD_BAN({ guildId: guildId, userId: userId }),
    body: { deleteMessageDays: deleteDays },
    reason: reason,
    token: token,
  })
}

// Remove Guild Ban
export function removeGuildBan (guildId: string, userId: string, reason: string | null | undefined, token: DiscordToken): Promise<void> {
  return executeQuery({
    route: REMOVE_GUILD_BAN({ guildId: guildId, userId: userId }),
    reason: reason,
    token: token,
  })
}

// todo: Get Guild Prune Count

// todo: Begin Guild Prune

// todo: Get Guild Voice Regions

// todo: Get Guild Integrations

// todo: Delete Guild Integration

// todo: Get Guild Widget Settings

// todo: Modify Guild Widget

// todo: Get Guild Widget

// todo: Get Guild Vanity URL

// todo: Get Guild Welcome Screen

// todo: Modify Guild Welcome Screen
