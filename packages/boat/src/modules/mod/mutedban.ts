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

import type { CommandClient, Guild, Member, MemberPartial } from 'eris'
import { ban } from '../../mod.js'
import config from '../../config.js'

const MAX_INFRACTIONS = 4

async function memberRemove (this: CommandClient, guild: Guild, member: Member | MemberPartial) {
  if (guild.id !== config.discord.ids.serverId || !('roles' in member) || !member.roles.includes(config.discord.ids.roleMuted)) return

  const bans = await guild.getBans().then((guildBans) => guildBans.map((guildBan) => guildBan.user.id))
  if (bans.includes(member.id)) return

  await this.mongo.collection('enforce').insertOne({
    userID: member.id, // todo: userID -> userId
    rule: -1,
    mod: `${this.user.username}#${this.user.discriminator}`, // todo: store id instead
  })

  const infractionCount = await this.mongo.collection('enforce').countDocuments({ userID: member.id })
  if (infractionCount > MAX_INFRACTIONS) {
    ban(guild, member.id, this.user, 'Left while muted one too many times.')
  }
}

export default function (bot: CommandClient) {
  bot.on('guildMemberRemove', memberRemove)
}
