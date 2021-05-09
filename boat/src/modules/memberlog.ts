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
import { prettyPrintTimeSpan } from '../util.js'
import config from '../config.js'

type OldMember = { nick?: string; premiumSince: number; roles: string[] } | null

function memberAdd (this: CommandClient, guild: Guild, member: Member) {
  if (guild.id !== config.discord.ids.serverId) return

  const date = new Date(member.createdAt).toUTCString()
  const elapsed = prettyPrintTimeSpan(Date.now() - member.createdAt)

  this.createMessage(config.discord.ids.channelMemberLogs, {
    embed: {
      title: `${member.username}#${member.discriminator} just joined`,
      // there are no typo in the next line
      description: `<@${member.id}> created their accout at ${date} (${elapsed})`,
      // there are no typo in the previous line
      timestamp: new Date().toISOString(),
      color: 0x7289da,
      thumbnail: { url: member.avatarURL },
      footer: { text: `Discord ID: ${member.id}` },
    },
  })
}

function memberUpdate (this: CommandClient, guild: Guild, newMember: Member, oldMember: OldMember) {
  if (guild.id !== config.discord.ids.serverId || !oldMember) return

  if (oldMember.nick !== newMember.nick) {
    this.createMessage(config.discord.ids.channelMemberLogs, {
      embed: {
        title: `${newMember.username}#${newMember.discriminator} changed their nickname`,
        color: 0x8f72da,
        fields: [
          {
            name: 'New nickname',
            value: newMember.nick ? newMember.nick : newMember.username,
            inline: true,
          }, {
            name: 'Old nickname',
            value: oldMember.nick || newMember.username,
            inline: true,
          },
        ],
        thumbnail: { url: newMember.avatarURL },
        footer: { text: `Discord ID: ${newMember.id}` },
      },
    })
  }

  if (newMember.roles.length !== oldMember.roles.length || !newMember.roles.every((r) => oldMember.roles.includes(r))) {
    const addedRoles = newMember.roles
      .filter((r) => !oldMember.roles.includes(r))
      .map((r) => guild.roles.get(r)!.name)

    const removedRoles = oldMember.roles
      .filter((r) => !newMember.roles.includes(r))
      .map((r) => guild.roles.get(r)!.name)

    const fields = []
    if (addedRoles.length > 0) {
      fields.push({
        name: 'Roles added',
        value: addedRoles.join('\n'),
        inline: true,
      })
    }
    if (removedRoles.length > 0) {
      fields.push({
        name: 'Roles removed',
        value: removedRoles.join('\n'),
        inline: true,
      })
    }

    this.createMessage(config.discord.ids.channelMemberLogs, {
      embed: {
        title: `${newMember.username}#${newMember.discriminator} had a role update`,
        color: 0xdf799d,
        fields: fields,
        thumbnail: { url: newMember.avatarURL },
        footer: { text: `Discord ID: ${newMember.id}` },
      },
    })
  }
}

function memberRemove (this: CommandClient, guild: Guild, member: Member | MemberPartial) {
  if (guild.id !== config.discord.ids.serverId) return

  const fields = []
  if ('roles' in member && member.roles.length > 0) {
    fields.push({
      name: 'Roles',
      value: member.roles.map((id) => guild.roles.get(id)!.mention).join(' '),
    })
  }

  this.createMessage(config.discord.ids.channelMemberLogs, {
    embed: {
      title: `${member.user.username}#${member.user.discriminator} just left`,
      description: 'joinedAt' in member
        ? `<@${member.id}> was here for ${prettyPrintTimeSpan(Date.now() - member.joinedAt)}`
        : `<@${member.id}> was not in the cache when they left`,
      fields: fields,
      color: 0xdac372,
      thumbnail: { url: member.user.avatarURL },
      timestamp: new Date().toISOString(),
      footer: { text: `Discord ID: ${member.user.id}` },
    },
  })
}

export default function (bot: CommandClient) {
  if (!config.discord.ids.channelMemberLogs) {
    console.log('no channel ids provided for member logs. module will be disabled.')
    return
  }

  bot.on('guildMemberAdd', memberAdd)
  bot.on('guildMemberUpdate', memberUpdate)
  bot.on('guildMemberRemove', memberRemove)
}
