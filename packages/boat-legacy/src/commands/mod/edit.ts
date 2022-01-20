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
import { isStaff, sanitizeMarkdown } from '../../util.js'
import config from '../../config.js'

const USAGE_STR = `Usage: ${config.discord.prefix}edit <caseId> <newReason>`

export async function executor (msg: Message<GuildTextableChannel>, args: string[]): Promise<void> {
  if (!msg.member) return // ???
  if (!isStaff(msg.member)) {
    msg.channel.createMessage('no')
    return
  }

  const caseId = parseInt(args.shift()!, 10)
  let newReason = args.join(' ')
  if (!caseId || !newReason) {
    msg.channel.createMessage(USAGE_STR)
    return
  }

  const channel = msg._client.getChannel(config.discord.ids.channelModLogs)
  if (!channel || !('rateLimitPerUser' in channel)) return // ???

  const messages = await channel.getMessages({ limit: 100 })
  const message = messages.find((m) => m.content.includes(`Case ${caseId}`))
  if (!message) {
    msg.channel.createMessage('This case doesn\'t exist or is too old.')
    return
  }

  const modId = message.content.match(/\n__Moderator(?:[^(]+)\((\d+)/)![1]
  if (modId !== msg.author.id && !msg.member.permissions.has('administrator')) {
    msg.channel.createMessage('You\'re not the responsible moderator.')
    return
  }

  const content = message.content.match(/([^]+)\n__Reason__/)![1]
  if (modId !== msg.author.id) {
    newReason += ` *(edited by ${sanitizeMarkdown(msg.author.username)}#${msg.author.discriminator})*`
  }

  await message.edit(`${content}\n__Reason__: ${newReason}`)
  msg.channel.createMessage('Updooted')
}
