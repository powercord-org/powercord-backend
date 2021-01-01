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
import { getCommerceDefinitions, getCommerceLaws } from '../laws.js'
import config from '../config.js'

const INFO_STR = 'You can read all of the guidelines at <https://powercord.dev/guidelines>.'
const USAGE_STR = `Usage: \`${config.discord.prefix}guideline <guideline id>\` or \`${config.discord.prefix}guideline defs\` `

export const aliases = [ 'guidelines' ]

export const description = 'Points out guidelines from https://powercord.dev/guidelines'

export function executor (msg: Message<GuildTextableChannel>, args: string[]): void {
  if (args.length === 0) {
    msg.channel.createMessage(`${USAGE_STR}\n\n${INFO_STR}`)
    return
  }

  if (args[0] === 'defs') {
    msg.channel.createMessage({
      embed: {
        title: 'Definitions',
        description: INFO_STR,
        fields: getCommerceDefinitions()
      }
    })
    return
  }

  const id = parseInt(args[0])
  const law = getCommerceLaws().get(id)
  if (!law) {
    msg.channel.createMessage(`This guideline doesn't exist.\n${USAGE_STR}\n\n${INFO_STR}`)
    return
  }

  msg.channel.createMessage({
    embed: {
      title: law.law,
      description: law.article,
      fields: [
        {
          name: 'Read all the guidelines',
          value: 'https://powercord.dev/guidelines'
        }
      ]
    }
  })
}
