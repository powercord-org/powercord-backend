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

import type { CommandClient, Message, GuildTextableChannel, TextableChannel, TextChannel, OldMessage, User } from 'eris'
import { getBlacklist } from '../blacklistCache.js'
import config from '../config.js'

// Thanks eris typings for sucking ass
type PossiblyUncachedMessage = Message<GuildTextableChannel> | { channel: TextableChannel | { id: string; guild: { id: string } }; guildID: string; id: string };
type MessageLike = { id: string, author: User, channel: { name: string }, content: string }

type SnipeRecord = { author: string, msg: string, channel: string, type: 'edit' | 'delete' }

export const SNIPE_LIFETIME = 20
const ZWS = '\u200B'
const buffer = new Map<number, SnipeRecord>()

function isPrivate (channel: TextChannel) {
  return Boolean((channel.permissionOverwrites.get(channel.guild.id)?.deny ?? 0n) & 1024n)
}

function containsBlacklist (content: string) : boolean {
  return getBlacklist().some(word => content.toLowerCase().includes(word))
}

async function store (msg: MessageLike, type: 'edit' | 'delete') {
  const id = Math.random()
  buffer.set(id, {
    author: `${msg.author.username}#${msg.author.discriminator}`,
    msg: msg.content ? msg.content.replace(/\(/g, `${ZWS}(`) : 'This message had no text content.',
    channel: msg.channel.name,
    type
  })

  setTimeout(() => buffer.delete(id), SNIPE_LIFETIME * 1e3)
}

function processEdit (msg: Message<GuildTextableChannel>, old: OldMessage | null) {
  if (!old || !msg.author || msg.channel.guild.id !== config.discord.ids.serverId || msg.author.bot || msg.content === old.content || isPrivate(msg.channel)) {
    return // Ignore
  }

  store({ ...msg, content: old.content }, 'edit')
}

function processDelete (msg: PossiblyUncachedMessage) {
  if (!('author' in msg) || msg.channel.guild.id !== config.discord.ids.serverId || msg.author.bot || isPrivate(msg.channel) || containsBlacklist(msg.content)) {
    return // Ignore
  }

  store(msg, 'delete')
}

export function getLastMessages () {
  const res = Array.from(buffer.values())
  buffer.clear()
  return res
}

export default function (bot: CommandClient) {
  bot.on('messageUpdate', processEdit)
  bot.on('messageDelete', processDelete)
}
