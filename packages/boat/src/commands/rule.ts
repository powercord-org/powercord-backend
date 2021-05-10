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
import { getCivilLaws } from '../laws.js'
import config from '../config.js'

const INFO_STR = `You can read all of the server rules in <#${config.discord.ids.channelRules}>.`
const USAGE_STR = `Usage: ${config.discord.prefix}rule <rule id>`

export const aliases = [ 'rules' ]

export const description = 'Helps people unable to read #rules'

export async function executor (msg: Message<GuildTextableChannel>, args: string[]): Promise<void> {
  if (args.length === 0) {
    msg.channel.createMessage(`${USAGE_STR}\n\n${INFO_STR}`)
    return
  }

  const id = parseInt(args[0], 10)
  if (id === -1) {
    msg.channel.createMessage(`**Rule #-1**: we ban/kick/mute when we want\n\n${INFO_STR}`)
    return
  }

  const law = getCivilLaws().get(id)
  if (!law) {
    msg.channel.createMessage(`This rule doesn't exist.\n${USAGE_STR}\n\n${INFO_STR}`)
    return
  }

  const actions = law.penalties ? `\n**Actions**: ${law.penalties.join(' ➙ ')}` : ''
  msg.channel.createMessage(`**Rule #${id}**: ${law.law}${actions}\n\n${INFO_STR}`)
}
