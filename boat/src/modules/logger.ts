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

import type { CommandClient, GuildTextableChannel, Message } from 'eris'
import { prettyPrintTimeSpan, stringifyDiscordMessage } from '../util.js'
import config from '../config.js'

const ZWS = '\u200B'
const TEMPLATE = `Message deleted in <#$channelId>
Author: $username#$discrim ($userId; <@$userId>)
Timestamp: $time ($duration ago)
Message contents: \`\`\`
$message
\`\`\``

async function process (this: CommandClient, msg: Message<GuildTextableChannel>) {
  if (!msg.author || msg.channel.guild.id !== config.discord.ids.serverId || msg.author.bot) {
    return // Message not cached; let's just ignore
  }

  // todo: log attachments
  this.createMessage(config.discord.ids.channelMessageLogs, {
    content: TEMPLATE
      .replace('$channelId', msg.channel.id)
      .replace('$username', msg.author.username.replace(/`/g, `\`${ZWS}`))
      .replace('$discrim', msg.author.discriminator)
      .replace(/\$userId/g, msg.author.id)
      .replace('$time', new Date(msg.timestamp).toUTCString())
      .replace('$duration', prettyPrintTimeSpan(Date.now() - msg.timestamp))
      .replace('$message', stringifyDiscordMessage(msg).replace(/`/g, `\`${ZWS}`) || '*No contents*'),
    allowedMentions: {}
  })
}

export default function (bot: CommandClient) {
  bot.on('messageDelete', process)
}
