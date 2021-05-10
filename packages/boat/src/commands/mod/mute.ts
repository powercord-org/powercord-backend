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
import { mute } from '../../mod.js'
import { isStaff, parseDuration } from '../../util.js'
import config from '../../config.js'

const USAGE_STR = `Usage: ${config.discord.prefix}mute <mention || id> [reason]|[duration]`

export function executor (msg: Message<GuildTextableChannel>, args: string[]): void {
  if (!msg.member || !msg.guildID) return // ???
  if (!isStaff(msg.member)) {
    msg.channel.createMessage('no')
    return
  }

  if (args.length === 0) {
    msg.channel.createMessage(USAGE_STR)
    return
  }

  const target = args.shift()!.replace(/<@!?(\d+)>/, '$1')
  const reason = args.join(' ').split('|')[0] || void 0
  const rawDuration = msg.content.includes('|') ? msg.content.split('|')[1].trim().toLowerCase().match(/\d+(m|h|d)/) : null

  if (target === msg.author.id) {
    msg.channel.createMessage('You cannot be silenced')
    return
  }

  if (isStaff(target, msg.channel.guild)) {
    msg.channel.createMessage('You couldn\'t make them be quite if you tried.')
    return
  }

  let duration
  if (rawDuration) {
    duration = parseDuration(rawDuration[0])
    if (!duration) {
      msg.channel.createMessage('Invalid duration')
      return
    }
  }

  mute(msg.channel.guild, target, msg.author, reason, duration)
  msg.channel.createMessage('Shut')
  return
}
