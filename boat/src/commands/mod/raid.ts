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

import { Message, GuildTextableChannel } from 'eris'
import config from '../../config.js'
import { enterRaidMode, getRaidStatus } from '../../raidMode.js'
import { isStaff, parseDuration } from '../../util.js'

const USAGE_STR = `Usage: ${config.discord.prefix}raid <duration>`

export async function executor (msg: Message<GuildTextableChannel>, [ rawDuration ]: [string]): Promise<Message | void> {
  if (!msg.member) return // ???
  if (!isStaff(msg.member)) {
    return msg.channel.createMessage('no')
  }

  if (getRaidStatus()) {
    return msg.channel.createMessage('Raid mode is currently active.')
  }

  if (!rawDuration) {
    return msg.channel.createMessage(USAGE_STR)
  }

  const duration = parseDuration(rawDuration)
  if (!duration) {
    return msg.channel.createMessage('Invalid duration')
  }

  enterRaidMode(msg.channel.guild, msg.author, duration)

  return msg.channel.createMessage('Raid mode activated.')
}