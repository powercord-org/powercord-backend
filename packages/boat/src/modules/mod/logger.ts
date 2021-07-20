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
import fetch from 'node-fetch'
import { prettyPrintTimeSpan, stringifyDiscordMessage, sanitizeMarkdown } from '../../util.js'
import config from '../../config.js'

type MessagePartial = {
  id: string,
  channel: {
    id: string,
    guild: { id: string }
  },
  guildId: string
}

export const deleteMeta = new Map<string, string>()

const ZWS = '\u200B'
const SINGLE_TEMPLATE = `Message deleted in <#$channelId> $meta
Author: $username#$discrim ($userId; <@$userId>)
Timestamp: $time ($duration ago)
Message contents: \`\`\`
$message
\`\`\``
const LIST_TEMPLATE = `Message deleted in #$channel $meta
Author: $username#$discrim ($userId)
Timestamp: $time ($duration ago)
Message contents:
$message`

async function format (template: string, message: Message<GuildTextableChannel>, bulk: boolean = false): Promise<string> {
  const cleanContent = stringifyDiscordMessage(message)
  let extra = ''

  if (!bulk && cleanContent.length > 1700) {
    const res = await fetch('https://haste.powercord.dev/documents', {
      method: 'POST',
      body: cleanContent,
    }).then((r) => r.json())
    extra += `<https://haste.powercord.dev/${res.key}.txt>\n\n`
  }

  if (message.attachments.length > 0) {
    extra += `Attachments:\n${message.attachments.map((attachment) => attachment.filename).join(', ')}`
  }

  const meta = deleteMeta.has(message.id)
    ? `\nReason: ${deleteMeta.get(message.id)}`
    : ''

  const timestamp = bulk
    ? new Date(message.timestamp).toUTCString()
    : `<t:${Math.floor(message.timestamp / 1000)}>`

  deleteMeta.delete(message.id)
  return `${template
    .replace(/\$meta/g, meta)
    .replace(/\$userId/g, message.author.id)
    .replace(/\$channelId/g, message.channel.id)
    .replace(/\$channel/g, message.channel.name)
    .replace(/\$username/g, sanitizeMarkdown(message.author.username))
    .replace(/\$discrim/g, message.author.discriminator)
    .replace(/\$time/g, timestamp)
    .replace(/\$duration/g, prettyPrintTimeSpan(Date.now() - message.timestamp))
    .replace(/\$message/g, !bulk && cleanContent.length > 1700
      ? '*Message too long*'
      : cleanContent.replace(/`/g, `\`${ZWS}`)
      || '*No contents*')}${extra}`
}

async function messageDelete (this: CommandClient, msg: Message<GuildTextableChannel>) {
  if (!msg.author || msg.author.bot || msg.channel.guild.id !== config.discord.ids.serverId) {
    return // Let's just ignore
  }

  this.createMessage(config.discord.ids.channelMessageLogs, {
    content: await format(SINGLE_TEMPLATE, msg),
    allowedMentions: {},
  })
}

async function messageDeleteBulk (this: CommandClient, msgs: Array<Message<GuildTextableChannel> | MessagePartial>) {
  if (msgs[0].channel.guild.id !== config.discord.ids.serverId) {
    return // Let's just ignore
  }
  const channelName = this.guilds.get(config.discord.ids.serverId)?.channels.get(msgs[0].channel.id)?.name || msgs[0].channel.id

  const list = []
  for (const msg of msgs) {
    list.push('author' in msg
      ? await format(LIST_TEMPLATE, msg, true)
      : `A message in #${channelName} that was not cached`)
  }

  const res = await fetch('https://haste.powercord.dev/documents', { method: 'POST', body: list.join('\n\n').trim() }).then((r) => r.json())
  this.createMessage(config.discord.ids.channelMessageLogs, `${msgs.length} messages deleted:\n<https://haste.powercord.dev/${res.key}.txt>`)
}

export default function (bot: CommandClient) {
  if (!config.discord.ids.channelMessageLogs) {
    console.log('no channel ids provided for message logs. module will be disabled.')
    return
  }

  bot.on('messageDelete', messageDelete)
  bot.on('messageDeleteBulk', messageDeleteBulk)
}
