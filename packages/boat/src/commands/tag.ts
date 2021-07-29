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
import type { DatabaseTag } from '../db.js'
import config from '../config.js'

async function listTags (msg: Message<GuildTextableChannel>): Promise<void> {
  const tags = await msg._client.mongo.collection<DatabaseTag>('tags').find({}).toArray()
  msg.channel.createMessage(`Available tags: ${tags.map((t) => t._id).join(', ')}`)
}

async function addTag (msg: Message<GuildTextableChannel>, args: string[]): Promise<void> {
  if ([ 'list', 'add', 'edit', 'delete' ].includes(args[1])) {
    msg.channel.createMessage('Don\'t try to break me, silly.')
    return
  }

  if (await msg._client.mongo.collection<DatabaseTag>('tags').findOne({ _id: args[1] })) {
    msg.channel.createMessage('This tag already exists.')
    return
  }

  await msg._client.mongo.collection<DatabaseTag>('tags').insertOne({ _id: args[1], content: msg.content.slice(msg.content.indexOf(args[1]) + args[1].length).trim() })
  msg.channel.createMessage('Tag created.')
}

async function editTag (msg: Message<GuildTextableChannel>, args: string[]): Promise<void> {
  if (!await msg._client.mongo.collection<DatabaseTag>('tags').findOne({ _id: args[1] })) {
    msg.channel.createMessage('This tag does not exist.')
    return
  }

  await msg._client.mongo.collection<DatabaseTag>('tags').updateOne({ _id: args[1] }, { $set: { content: msg.content.slice(msg.content.indexOf(args[1]) + args[1].length).trim() } })
  msg.channel.createMessage('Tag updated.')
}

async function deleteTag (msg: Message<GuildTextableChannel>, args: string[]): Promise<void> {
  if (!await msg._client.mongo.collection<DatabaseTag>('tags').findOne({ _id: args[1] })) {
    msg.channel.createMessage('This tag does not exist.')
    return
  }

  await msg._client.mongo.collection<DatabaseTag>('tags').deleteOne({ _id: args[1] })
  msg.channel.createMessage('Tag deleted.')
}

async function sendTag (msg: Message<GuildTextableChannel>, args: string[]): Promise<void> {
  const tag = await msg._client.mongo.collection<DatabaseTag>('tags').findOne({ _id: args[0] })
  if (!tag) {
    msg.channel.createMessage('This tag does not exist.')
    return
  }

  msg.channel.createMessage(tag.content)
}

export const description = 'Custom commands'

export function executor (msg: Message<GuildTextableChannel>, args: string[]): void {
  if (!msg.member) return // ???

  const elevated = msg.member.permissions.has('manageMessages')
  if (args.length === 0) {
    const parts = [
      'Usage:',
      ` - ${config.discord.prefix}tag [tag]`,
      ` - ${config.discord.prefix}tag list`,
    ]

    if (elevated) {
      parts.push(
        ` - ${config.discord.prefix}tag add [tag] [contents]`,
        ` - ${config.discord.prefix}tag edit [tag] [contents]`,
        ` - ${config.discord.prefix}tag delete [tag]`
      )
    }

    msg.channel.createMessage(parts.join('\n'))
    return
  }

  switch (args[0]) { // I could make use of Eris' subcommands but eh - although it may help me get rid of _client, need to check that
    case 'list':
      listTags(msg)
      break
    case 'add':
      if (!elevated) return void msg.channel.createMessage('you tried')
      addTag(msg, args)
      break
    case 'edit':
      if (!elevated) return void msg.channel.createMessage('you tried')
      editTag(msg, args)
      break
    case 'delete':
      if (!elevated) return void msg.channel.createMessage('you tried')
      deleteTag(msg, args)
      break
    default:
      sendTag(msg, args)
      break
  }
}
