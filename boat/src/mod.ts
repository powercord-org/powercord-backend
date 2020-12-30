/*
 * Copyright (c) 2018-2020 aetheryx & Bowser65
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

import { Guild, User } from 'eris'
import { schedule } from './modules/modtasks.js'
import { prettyPrintTimeSpan } from './util.js'
import config from './config.js'

function formatReason (mod: User, reason?: string, duration?: number) {
  let formatted = `[${mod.username}#${mod.discriminator}] ${reason ?? 'No reason specified.'}`
  if (duration) formatted += ` (duration: ${prettyPrintTimeSpan(duration)})`
  return formatted
}

export function mute (guild: Guild, userId: string, mod: User, reason?: string, duration?: number) {
  guild.addMemberRole(userId, config.discord.ids.roleMuted, formatReason(mod, reason, duration))
  if (duration) schedule('unmute', guild, userId, mod, duration)
}

export function unmute (guild: Guild, userId: string, mod: User, reason?: string) {
  guild.removeMemberRole(userId, config.discord.ids.roleMuted, formatReason(mod, reason))
}

export function kick (guild: Guild, userId: string, mod: User, reason?: string) {
  guild.kickMember(userId, formatReason(mod, reason))
}

export function ban (guild: Guild, userId: string, mod: User, reason?: string, duration?: number) {
  guild.banMember(userId, 0, formatReason(mod, reason, duration))
  if (duration) schedule('unban', guild, userId, mod, duration)
}

export function unban (guild: Guild, userId: string, mod: User, reason?: string) {
  guild.unbanMember(userId, formatReason(mod, reason))
}
