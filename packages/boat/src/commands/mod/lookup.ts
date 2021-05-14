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

import type { EmbedField, GuildTextableChannel, Message } from 'eris'
import { prettyPrintTimeSpan, makePluralDumb, isStaff } from '../../util.js'
import config from '../../config.js'

const USAGE_STR = `Usage: ${config.discord.prefix}lookup <mention || discord id>`

export async function executor (msg: Message<GuildTextableChannel>, args: string[]): Promise<void> {
  if (!msg.member) return // ???
  if (!isStaff(msg.member)) {
    msg.channel.createMessage('no')
    return
  }

  if (args.length === 0) {
    msg.channel.createMessage(USAGE_STR)
    return
  }

  // todo: rely on member cache?
  const fetchedMembers = await msg.channel.guild.fetchMembers({ userIDs: [ args.shift()!.replace(/<@!?(\d+)>/, '$1') ] })
  if (fetchedMembers.length === 0) {
    msg.channel.createMessage('Could not find requested member')
    return
  }

  const member = fetchedMembers[0]
  const createdAt = new Date(member.createdAt)
  const joinedAt = new Date(member.joinedAt)

  const infractions: Array<{ rule: string, count: number, occurrences: string[] }> = []
  // todo: userID -> userId
  await msg._client.mongo.collection('enforce').find({ userID: member.id }).forEach((doc) => {
    const infraction = infractions.find((inf) => inf.rule === doc.rule)

    if (infraction) {
      infractions[infractions.indexOf(infraction)].count++
      infractions[infractions.indexOf(infraction)].occurrences.push(`• ${doc._id.getTimestamp().toUTCString()}`)
    } else {
      infractions.push({
        rule: doc.rule,
        count: 1,
        occurrences: [ `• ${doc._id.getTimestamp().toUTCString()}` ],
      })
    }
  })

  const roles = member.roles.map((id) => msg.channel.guild.roles.get(id)!.mention)
  const fields: EmbedField[] = [ { name: 'Roles', value: roles.length > 0 ? roles.join(' ') : 'None' } ]

  infractions.forEach(({ rule, count, occurrences: occurences }) => {
    fields.push({
      name: `Rule ${rule} broken ${count} ${makePluralDumb('time', count)}`,
      value: occurences.join('\n'),
      inline: true,
    })
  })

  msg.channel.createMessage({
    embed: {
      author: {
        name: `${member.username}#${member.discriminator}`,
        icon_url: member.avatarURL,
      },
      description: `**Account created:** ${createdAt.toUTCString()} (${prettyPrintTimeSpan(Date.now() - member.createdAt)} ago)\n\n**Joined:** ${joinedAt.toUTCString()} (${prettyPrintTimeSpan(Date.now() - member.joinedAt)}`,
      timestamp: new Date().toISOString(),
      fields: fields,
      footer: { text: `Discord ID: ${member.id}` },
    },
  })
}
