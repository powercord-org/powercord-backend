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
