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

module.exports = async function (msg, args) {
  if (!msg.member.permission.has('manageMessages')) {
    return msg.channel.createMessage('no')
  }

  const caseId = parseInt(args.shift())
  let newReason = args.join(' ')
  if (!caseId || !newReason) {
    return msg.channel.createMessage(`Usage: ${config.discord.prefix}edit [caseId] [newReason]`)
  }

  const channel = msg._client.getChannel(config.discord.ids.channelModLogs)
  const messages = await channel.getMessages(100)
  const message = messages.find(m => m.content.includes(`Case ${caseId}`))
  if (!message) {
    return msg.channel.createMessage('This case doesn\'t exist or is too old')
  }

  const modId = message.content.match(/\n__Moderator(?:[^(]+)\((\d+)/)[1]
  if (modId !== msg.author.id && !msg.member.permission.has('administrator')) {
    return msg.channel.createMessage('You\'re not the responsible moderator')
  }

  const content = message.content.match(/([^]+)\n__Reason__/)[1]
  if (modId !== msg.author.id) {
    newReason += ` *(edited by ${msg.author.username}#${msg.author.discriminator})*`
  }

  await message.edit(`${content}\n__Reason__: ${newReason}`)
  msg.channel.createMessage('Updooted')
}
