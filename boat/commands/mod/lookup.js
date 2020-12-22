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

const config = require('../../../config.json')
const { humanTime, plurialify } = require('../../utils')

const USAGE_STR = `Usage: ${config.discord.prefix}lookup [mention || discord id]`

module.exports = async function (msg, args) {
  if (!msg.member.permission.has('manageMessages')) {
    return msg.channel.createMessage('no')
  }

  if (args.length === 0) {
    return msg.channel.createMessage(USAGE_STR)
  }

  const guild = msg._client.guilds.find(guild => guild.id === msg.guildID)
  const fetchedMembers = await guild.fetchMembers({ userIDs: [ args.shift().replace(/<@!?(\d+)>/, '$1') ] })

  if (fetchedMembers.length === 0) {
    return msg.channel.createMessage('Could not find requested member')
  }

  const member = fetchedMembers[0]

  const createdAt = new Date(member.createdAt)
  const joinedAt = new Date(member.joinedAt)
  const now = new Date()

  const roles = []
  guild.roles.filter(role => member.roles.includes(role.id)).forEach(role => {
    roles.push(role.mention)
  })

  const infractions = []
  await msg._client.mongo.collection('enforce').find({ userID: member.id }).forEach(function (doc) {
    const infraction = infractions.find(inf => inf.rule === doc.rule)

    if (infraction) {
      infractions[infractions.indexOf(infraction)].count++
    } else {
      infractions.push({
        rule: doc.rule,
        count: 1
      })
    }
  })

  let infractionString = ''

  infractions.forEach(({ rule, count }) => {
    infractionString += `Rule ${rule} broken ${count} ${plurialify(count, 'time')}\n`
  })

  const embed = {
    author: {
      name: `${member.username}#${member.discriminator}`,
      icon_url: member.avatarURL
    },
    description: `**Account created:** ${createdAt.toUTCString()} (${humanTime(now - createdAt)} ago)\n\n**Joined:** ${joinedAt.toUTCString()} (${humanTime(now - joinedAt)}`,
    timestamp: now.toISOString(),
    fields: [
      {
        name: 'Roles',
        value: roles.join()
      }, {
        name: 'Rule Infractions',
        value: infractionString === '' ? 'None' : infractionString
      }
    ],
    footer: { text: `Discord ID: ${member.id}` }
  }

  return msg.channel.createMessage({ embed })
}
