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
