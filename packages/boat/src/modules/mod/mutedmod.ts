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

import { CommandClient, Constants, Guild, Member, MemberPartial, Role, User } from 'eris'
import { ban } from '../../mod.js'
import { delayedFunction, extractEntryData } from '../../util.js'
import config from '../../config.js'

const MAX_INFRACTIONS = 4

async function memberRemove (this: CommandClient, guild: Guild, member: Member | MemberPartial) {
  if (guild.id !== config.discord.ids.serverId || !('roles' in member) || !member.roles.includes(config.discord.ids.roleMuted)) return

  const bans = await guild.getBans().then((guildBans) => guildBans.map((guildBan) => guildBan.user.id))
  if (bans.includes(member.id)) return

  await this.mongo.collection('enforce').insertOne({
    userId: member.id,
    modId: this.user.id,
    rule: -1,
  })

  const infractionCount = await this.mongo.collection('enforce').countDocuments({ userId: member.id })
  if (infractionCount > MAX_INFRACTIONS) {
    ban(guild, member.id, this.user, 'Left while muted one too many times.')
  }
}

async function processMemberUpdate (this: CommandClient, guild: Guild, user: User) {
  const channel = this.getChannel(config.discord.ids.channelModLogs)
  if (!channel || !('getMessages' in channel)) return

  const logs = await guild.getAuditLog({ actionType: Constants.AuditLogActions.MEMBER_ROLE_UPDATE, limit: 5 })

  for (const entry of logs.entries) {
    if (entry.targetID !== user.id
      || entry.user.id === config.discord.clientID
      || !entry.after
      || Date.now() - Number((BigInt(entry.id) >> BigInt('22')) + BigInt('1420070400000')) > 5000) {
      continue
    }

    const added = entry.after.$add as Role[] | null
    const removed = entry.after.$remove as Role[] | null

    const wasAdded = Boolean(added?.find((r) => r.id === config.discord.ids.roleMuted))
    const wasRemoved = Boolean(removed?.find((r) => r.id === config.discord.ids.roleMuted))

    if (wasRemoved || wasAdded === wasRemoved) {
      continue
    }

    const { modId } = extractEntryData(entry)

    if (modId === config.discord.clientID) {
      continue
    }

    this.mongo.collection('enforce').insertOne({
      userId: user.id,
      modId: modId,
      rule: -1,
    })

    break
  }
}

export default function (bot: CommandClient) {
  bot.on('guildMemberRemove', memberRemove)
  bot.on('guildMemberUpdate', delayedFunction(processMemberUpdate))
}
