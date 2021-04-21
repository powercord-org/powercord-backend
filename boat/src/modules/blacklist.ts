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

import type { CommandClient, GuildTextableChannel, Message } from 'eris'
import { deleteMeta } from './logger.js'
import { skipSnipe } from './sniper.js'
import { getBlacklist } from '../blacklistCache.js'
import { isStaff } from '../util.js'

async function process (this: CommandClient, msg: Message<GuildTextableChannel>) {
  if (!msg.member || msg.author.bot || isStaff(msg.member)) return

  const blacklist = getBlacklist()
  if (blacklist.some((word) => msg.content.toLowerCase().includes(word))) {
    skipSnipe.add(msg.id)
    deleteMeta.set(msg.id, 'Contained a blacklisted word')
    msg.delete('Message contained a blacklisted word.')
    const warnMsg = await msg.channel.createMessage(`${msg.author.mention}, you used a word on the blacklist so I deleted your message.`)
    setTimeout(() => warnMsg.delete(), 10e3)
  }
}

export default function (bot: CommandClient) {
  bot.on('messageCreate', process)
}
