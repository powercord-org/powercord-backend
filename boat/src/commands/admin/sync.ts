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

import type { GuildTextableChannel, Message } from 'eris'
import config from '../../config.js'

export async function executor (msg: Message<GuildTextableChannel>): Promise<void> {
  if (!msg.member) return // ???
  if (!msg.member.permissions.has('administrator')) {
    msg.channel.createMessage('haha no')
    return
  }

  const message = await msg.channel.createMessage('<a:loading:660094837437104138> Processing...')

  const { guild } = msg.channel
  const users = await msg._client.mongo.collection('users').find({}).toArray()
  await guild.fetchAllMembers()
  const filteredUsers = users.map((user) => ({
    ...user,
    member: guild.members.find((member) => member.id === user._id),
  })).filter((m) => m.member)

  for (const user of filteredUsers) {
    const originalRoles = user.member.roles
    let newRoles = [ ...user.member.roles ]

    if (!user.member.roles.includes(config.discord.ids.roleUser)) {
      newRoles.push(config.discord.ids.roleUser)
    }

    [ 'Hunter', 'Contributor', 'Translator' ].forEach((type) => {
      if (config.discord.ids[`role${type}`] && user.badges[type.toLowerCase()] && !user.member.roles.includes(config.discord.ids[`role${type}`])) {
        newRoles.push(config.discord.ids[`role${type}`])
      } else if (!user.badges[type.toLowerCase()] && user.member.roles.includes(config.discord.ids[`role${type}`])) {
        newRoles = newRoles.filter((r) => r !== config.discord.ids[`role${type}`])
      }
    })

    newRoles = [ ...new Set(newRoles) ]

    if (newRoles.length !== originalRoles.length || !newRoles.every((r) => originalRoles.includes(r))) {
      await guild.editMember(user._id, { roles: newRoles })
    }
  }

  message.edit('Done!')
}
