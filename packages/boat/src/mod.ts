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

import type { Guild, Member, User } from 'eris'
import { schedule } from './modules/mod/modtasks.js'
import { prettyPrintTimeSpan } from './util.js'
import config from './config.js'

export enum Period {
  PROBATIONARY = 0,
  RECENT,
  KNOWN,
}

const PROBATIONARY_PERIOD = 24 * 3600e3 // 1 day
const RECENT_PERIOD = 7 * 24 * 3600e3 // 7 days
const NO_LOG_DURATION = 10 * 60e3 // 10 mins

function formatReason (mod: User | null, reason?: string, duration?: number, soft: boolean = false) {
  let formatted = `${mod ? `[${mod.username}#${mod.discriminator}] ` : ''}${soft ? '[soft] ' : ''}${reason ?? 'No reason specified.'}`
  if (duration) {
    formatted += ` (duration: ${prettyPrintTimeSpan(duration)})`
    if (duration <= NO_LOG_DURATION) formatted += ' [no log]'
  }

  return formatted
}

/**
 * Mute a member.
 * @param guild - the guild the user is to be muted in
 * @param userId - the ID of the user to be muted
 * @param mod - the moderator preforming the mute
 * @param reason - the reason the mute is occurring
 */
export function mute (guild: Guild, userId: string, mod: User | null, reason?: string, duration?: number) {
  guild.addMemberRole(userId, config.discord.ids.roleMuted, formatReason(mod, reason, duration))
  if (duration) schedule('unmute', guild, userId, mod, duration)
}

/**
 * Unmute a member.
 * @param guild - the guild the user is to be unmuted in
 * @param userId - the ID of the user to be unmuted
 * @param mod - the moderator preforming the unmute
 * @param reason - the reason the unmute is occurring
 */
export function unmute (guild: Guild, userId: string, mod: User | null, reason?: string) {
  guild.removeMemberRole(userId, config.discord.ids.roleMuted, formatReason(mod, reason))
}

/**
 * Kick a member from a guild.
 * @param guild - the guild the user is to be kicked from
 * @param userId - the ID of the user to be kicked
 * @param mod - the moderator preforming the kick
 * @param reason - the reason the kick is occurring
 */
export function kick (guild: Guild, userId: string, mod: User | null, reason?: string) {
  guild.kickMember(userId, formatReason(mod, reason))
}

/**
 * Ban a member from a guild.
 * @param guild - the guild the user is to be banned from
 * @param userId - the ID of the user to be banned
 * @param mod - the moderator preforming the ban
 * @param reason - the reason the ban is occurring
 * @param deleteDays - `default = 0` the number of days worth of messages to delete
 */
export function ban (guild: Guild, userId: string, mod: User | null, reason?: string, duration?: number, deleteDays: number = 0) {
  guild.banMember(userId, deleteDays, formatReason(mod, reason, duration))
  if (duration) schedule('unban', guild, userId, mod, duration)
}

/**
 * Unban a member from a guild.
 * @param guild - the guild the user is to be unbanned from
 * @param userId - the ID of the user to be unbanned
 * @param mod - the moderator preforming the unban
 * @param reason - the reason the unban is occurring
 */
export function unban (guild: Guild, userId: string, mod: User | null, reason?: string) {
  guild.unbanMember(userId, formatReason(mod, reason))
}

/**
 * Ban then unban a user. This is effectively a kick which deletes a users messages.
 * @param guild - the guild the user is to be soft banned from
 * @param userId - the ID of the user to be soft banned
 * @param mod - the moderator preforming the soft ban
 * @param reason - the reason the soft ban is occurring
 * @param deleteDays - `default = 0` the number of days worth of messages to delete
 */
export function softBan (guild: Guild, userId: string, mod: User | null, reason?: string, deleteDays: number = 0) {
  guild.banMember(userId, deleteDays, formatReason(mod, reason, 0, true))
    .then(() => guild.unbanMember(userId, formatReason(mod, reason, 0, true)))
}

export function getPeriod (user: Member): Period {
  const memberFor = Date.now() - user.joinedAt
  if (memberFor < PROBATIONARY_PERIOD) {
    return Period.PROBATIONARY
  }

  if (memberFor < RECENT_PERIOD) {
    return Period.RECENT
  }

  return Period.KNOWN
}

// As a function in case we want to expand it
export function shouldNotLog (time: number): boolean {
  return time <= NO_LOG_DURATION
}
