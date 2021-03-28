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

import type { CommandClient, Guild, GuildAuditLogEntry, Role, User } from 'eris'
import { Constants } from 'eris'
import config from '../config.js'

const TEMPLATE = `**$type | Case $case**
__User__: $user ($userid)
__Moderator__: $moderator ($modid)
__Reason__: $reason`

function delayedFunction (fn: Function): () => void {
  return function (this: CommandClient, ...args: unknown[]) {
    setTimeout(() => fn.apply(this, args), 2e3)
  }
}

function extractEntryData (entry: GuildAuditLogEntry): [ string, string, string ] {
  let modId: string = ''
  let modName: string = ''
  let reason: string = ''

  if (entry.user.id === config.discord.clientID && entry.reason) {
    const splittedReason = entry.reason.split(' ')
    modName = splittedReason.shift()!.replace('[', '').replace(']', '')
    reason = splittedReason.join(' ')
    const [ username, discrim ] = modName.split('#')
    const mod = entry.guild.members.find(m => m.username === username && m.discriminator === discrim)
    modId = mod ? mod.id : '<unknown>' // Should not happen
  } else {
    modId = entry.user.id
    modName = `${entry.user.username}#${entry.user.discriminator}`
    reason = entry.reason || 'No reason specified.'
  }

  return [ modId, modName, reason ]
}

function processBanFactory (type: 'add' | 'remove'): (guild: Guild, user: User) => Promise<void> {
  return async function (this: CommandClient, guild: Guild, user: User): Promise<void> {
    const channel = this.getChannel(config.discord.ids.channelModLogs)
    if (!channel || !('getMessages' in channel)) return

    const logs = await guild.getAuditLogs(10, void 0, type === 'add'
      ? Constants.AuditLogActions.MEMBER_BAN_ADD
      : Constants.AuditLogActions.MEMBER_BAN_REMOVE)
    const entry = logs.entries.find(entry => (entry.targetID = user.id))
    if (!entry) return

    const [ modId, modName, reason ] = extractEntryData(entry)
    // todo: unsafe non-null assertion
    const caseId = parseInt((await channel.getMessages(1))[0].content.match(/Case (\d+)/)![1]) + 1

    this.createMessage(config.discord.ids.channelModLogs, TEMPLATE
      .replace('$type', type === 'add' ? 'Ban' : 'Unban')
      .replace('$case', String(caseId))
      .replace('$user', `${user.username}#${user.discriminator}`)
      .replace('$userid', user.id)
      .replace('$moderator', modName)
      .replace('$modid', modId)
      .replace('$reason', reason)
    )
  }
}

async function processMemberLeave (this: CommandClient, guild: Guild, user: User) {
  const channel = this.getChannel(config.discord.ids.channelModLogs)
  if (!channel || !('getMessages' in channel)) return

  const logs = await guild.getAuditLogs(5, void 0, Constants.AuditLogActions.MEMBER_KICK)
  const entry = logs.entries.find(entry => (entry.targetID = user.id))
  if (entry && Date.now() - Number((BigInt(entry.id) >> BigInt('22')) + BigInt('1420070400000')) < 5000) {
    const [ modId, modName, reason ] = extractEntryData(entry)
    // todo: unsafe non-null assertion
    const caseId = parseInt((await channel.getMessages(1))[0].content.match(/Case (\d+)/)![1]) + 1

    this.createMessage(config.discord.ids.channelModLogs, TEMPLATE
      .replace('$type', 'Kick')
      .replace('$case', String(caseId))
      .replace('$user', `${user.username}#${user.discriminator}`)
      .replace('$userid', user.id)
      .replace('$moderator', modName)
      .replace('$modid', modId)
      .replace('$reason', reason)
    )
  }
}

async function processMemberUpdate (this: CommandClient, guild: Guild, user: User) {
  const channel = this.getChannel(config.discord.ids.channelModLogs)
  if (!channel || !('getMessages' in channel)) return

  const logs = await guild.getAuditLogs(5, void 0, Constants.AuditLogActions.MEMBER_ROLE_UPDATE)

  for (const entry of logs.entries) {
    if (entry.targetID !== user.id || !entry.after || Date.now() - Number((BigInt(entry.id) >> BigInt('22')) + BigInt('1420070400000')) > 5000) {
      continue
    }

    const added = entry.after.$add as Role[] | null
    const removed = entry.after.$remove as Role[] | null

    const wasAdded = Boolean(added?.find((r) => r.id === config.discord.ids.roleMuted))
    const wasRemoved = Boolean(removed?.find((r) => r.id === config.discord.ids.roleMuted))

    if (wasAdded === wasRemoved) {
      continue
    }

    const [ modId, modName, reason ] = extractEntryData(entry)
    const caseId = parseInt((await channel.getMessages(1))[0].content.match(/Case (\d+)/)![1]) + 1

    this.createMessage(config.discord.ids.channelModLogs, TEMPLATE
      .replace('$type', wasAdded ? 'Mute' : 'Unmute')
      .replace('$case', String(caseId))
      .replace('$user', `${user.username}#${user.discriminator}`)
      .replace('$userid', user.id)
      .replace('$moderator', modName)
      .replace('$modid', modId)
      .replace('$reason', reason)
    )

    break
  }
}

export default function (bot: CommandClient) {
  bot.on('guildBanAdd', delayedFunction(processBanFactory('add')))
  bot.on('guildBanRemove', delayedFunction(processBanFactory('remove')))
  bot.on('guildMemberRemove', delayedFunction(processMemberLeave))
  bot.on('guildMemberUpdate', delayedFunction(processMemberUpdate))
}
