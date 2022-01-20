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
import { kick } from '../../mod.js'
import { isStaff } from '../../util.js'
import config from '../../config.js'

const USAGE_STR = `Usage: ${config.discord.prefix}kick <mention || id> [reason]`

export function executor (msg: Message<GuildTextableChannel>, args: string[]): void {
  if (!msg.member) return // ???
  if (!isStaff(msg.member)) {
    msg.channel.createMessage('no')
    return
  }

  if (args.length === 0) {
    msg.channel.createMessage(USAGE_STR)
    return
  }

  const target = args.shift()!.replace(/<@!?(\d+)>/, '$1')

  if (target === msg.author.id) {
    msg.channel.createMessage('Don\'t do that to yourself, you\'ll break your leg')
    return
  }

  if (isStaff(target, msg.channel.guild)) {
    msg.channel.createMessage('Sorry, they\'re wearing shin guards')
    return
  }

  kick(msg.channel.guild, target, msg.author, args.length > 0 ? args.join(' ') : void 0)
  msg.channel.createMessage('Yeeted')
}
