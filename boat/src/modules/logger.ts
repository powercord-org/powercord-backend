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
import { prettyPrintTimeSpan, stringifyDiscordMessage } from '../util.js'
import fetch from 'node-fetch'
import config from '../config.js'

type MessagePartial = { id: string, channel: GuildTextableChannel }

const ZWS = '\u200B'
const SINGLE_TEMPLATE = `Message deleted in <#$channelId>
Author: $username#$discrim ($userId; <@$userId>)
Timestamp: $time ($duration ago)
Message contents: \`\`\`
$message
\`\`\``
const LIST_TEMPLATE = `Message deleted in #$channel
Author: $username#$discrim ($userId)
Timestamp: $time ($duration ago)
Message contents:
$message`

async function messageDelete(this: CommandClient, msg: Message<GuildTextableChannel>) {
  if (!msg.author || msg.channel.guild.id !== config.discord.ids.serverId || msg.author.bot) {
    return // Message not cached; let's just ignore
  }

  this.createMessage(config.discord.ids.channelMessageLogs, {
    content: `${SINGLE_TEMPLATE
      .replace('$channelId', msg.channel.id)
      .replace('$username', msg.author.username.replace(/`/g, `\`${ZWS}`))
      .replace('$discrim', msg.author.discriminator)
      .replace(/\$userId/g, msg.author.id)
      .replace('$time', new Date(msg.timestamp).toUTCString())
      .replace('$duration', prettyPrintTimeSpan(Date.now() - msg.timestamp))
      .replace('$message', stringifyDiscordMessage(msg).replace(/`/g, `\`${ZWS}`) || '*No contents*')}${msg.attachments.length > 0 ?
        `Attachments:\n\`${msg.attachments.map(attachment => attachment.filename).join('`, `')}\`` :
        ''}`.trim(),
    allowedMentions: {}
  })
}

async function messageDeleteBulk(this: CommandClient, msgs: (Message<GuildTextableChannel> | MessagePartial)[]) {
  let list = ''
  msgs.forEach(msg => {
    if ('author' in msg) {
      list += `${LIST_TEMPLATE
        .replace('$channel', msg.channel.name)
        .replace('$username', msg.author.username.replace(/`/g, `\`${ZWS}`))
        .replace('$userId', msg.author.id)
        .replace('$discrim', msg.author.discriminator)
        .replace('$time', new Date(msg.timestamp).toUTCString())
        .replace('$duration', prettyPrintTimeSpan(Date.now() - msg.timestamp))
        .replace('$message', stringifyDiscordMessage(msg).replace(/`/g, `\`${ZWS}`) || '*No contents*')}\n${msg.attachments.length > 0 ?
          `Attachments:\n${msg.attachments.map(attachment => attachment.filename).join(', ')}` :
          ''}\n\n`
    } else {
      list += `A message in #${msg.channel.name} that was not cached\n\n`
    }
  })

  const res = await fetch('https://haste.powercord.dev/documents', { method: 'POST', body: list.trim() }).then(r => r.json())
  this.createMessage(config.discord.ids.channelMessageLogs, `${msgs.length} messages deleted:\n<https://haste.powercord.dev/${res.key}.txt>`)
}

export default function (bot: CommandClient) {
  bot.on('messageDelete', messageDelete)
  bot.on('messageDeleteBulk', messageDeleteBulk)
}
