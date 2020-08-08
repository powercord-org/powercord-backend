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

const config = require('../../config.json')

async function listTags (msg) {
  const tags = await msg._client.mongo.collection('tags').find({}).toArray()
  msg.channel.createMessage(`Available tags: ${tags.map(t => t._id).join(', ')}`)
}

async function addTag (msg, args) {
  if (
    [ 'list', 'add', 'edit', 'delete' ].includes(args[1]) ||
    await msg._client.mongo.collection('tags').findOne({ _id: args[1] })
  ) {
    return msg.channel.createMessage('This tag already exists.')
  }

  await msg._client.mongo.collection('tags').insertOne({ _id: args[1], content: args.slice(2).join(' ') })
  msg.channel.createMessage('Tag created.')
}

async function editTag (msg, args) {
  if (!await msg._client.mongo.collection('tags').findOne({ _id: args[1] })) {
    return msg.channel.createMessage('This tag does not exist.')
  }

  await msg._client.mongo.collection('tags').updateOne({ _id: args[1] }, { $set: { content: args.slice(2).join(' ') } })
  msg.channel.createMessage('Tag updated.')
}

async function deleteTag (msg, args) {
  if (!await msg._client.mongo.collection('tags').findOne({ _id: args[1] })) {
    return msg.channel.createMessage('This tag does not exist.')
  }

  await msg._client.mongo.collection('tags').deleteOne({ _id: args[1] })
  msg.channel.createMessage('Tag deleted.')
}

async function sendTag (msg, args) {
  const tag = await msg._client.mongo.collection('tags').findOne({ _id: args[0] })
  if (!tag) {
    return msg.channel.createMessage('This tag does not exist.')
  }
  msg.channel.createMessage(tag.content)
}

module.exports = function (msg, args) {
  const elevated = msg.member.permission.has('manageMessages')
  if (args.length === 0) {
    const parts = [
      'Usage:',
      ` - ${config.discord.prefix}tag [tag]`,
      ` - ${config.discord.prefix}tag list`
    ]

    if (elevated) {
      parts.push(
        ` - ${config.discord.prefix}tag add [tag] [contents]`,
        ` - ${config.discord.prefix}tag edit [tag] [contents]`,
        ` - ${config.discord.prefix}tag delete [tag]`
      )
    }

    return msg.channel.createMessage(parts.join('\n'))
  }

  switch (args[0]) { // I could make use of Eris' subcommands but eh
    case 'list':
      return listTags(msg, args)
    case 'add':
      if (!elevated) return msg.channel.createMessage('you tried')
      return addTag(msg, args)
    case 'edit':
      if (!elevated) return msg.channel.createMessage('you tried')
      return editTag(msg, args)
    case 'delete':
      if (!elevated) return msg.channel.createMessage('you tried')
      return deleteTag(msg, args)
    default:
      return sendTag(msg, args)
  }
}
