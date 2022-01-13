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

import type { CommandClient, EmbedImage, EmbedVideo, PartialEmoji, GuildTextableChannel, Message, User } from 'eris'
import config from '../config.js'

type StarboardEntry = {
  _id: string
  messageId: string
  stars: number
  cute?: boolean
}

type BoardDecoration = Array<[ number, string, number ]>
type HasId = { id: string }

const BOARD_MINIMUM = 3
const CUTEBOARD_EMOTE = '🌺'
const STARBOARD_EMOTE = '⭐'
const GENERIC_STAR_OBJ = { messageId: '', stars: 0 }
const CUTE: BoardDecoration = [
  [ 0, CUTEBOARD_EMOTE, 0xffffff ],
  [ 5, CUTEBOARD_EMOTE, 0xfc32dc ],
  [ 10, CUTEBOARD_EMOTE, 0xf865ba ],
  [ 20, CUTEBOARD_EMOTE, 0xf49898 ],
]
const EMOTES: BoardDecoration = [
  [ 0, '⭐', 0xffffff ],
  [ 5, '🌟', 0xffffaa ],
  [ 10, '💫', 0xffff66 ],
  [ 20, '✨', 0xffff00 ],
]

function isProcessable (msg: Message<GuildTextableChannel>) {
  return !msg.channel.nsfw
    && msg.channel.id !== config.discord.ids.channelCuteboard
    && msg.channel.id !== config.discord.ids.channelStarboard
    && !(msg.content.length === 0 && msg.attachments.length === 0 && (!msg.embeds[0] || msg.embeds[0].type !== 'image'))
}

async function getAllReactions (msg: Message<GuildTextableChannel>, reaction: string): Promise<User[]> {
  const reactions = []
  let batch: User[] = []
  do {
    batch = await msg.getReaction(reaction, { limit: 100, after: batch[0]?.id })
    reactions.push(...batch)
  } while (batch.length === 100)

  return reactions
}

function extractMedia (msg: Message<GuildTextableChannel>): { image?: EmbedImage, video?: EmbedVideo } {
  if (msg.attachments.length > 0 && msg.attachments[0].width) {
    return { image: msg.attachments[0] }
  } else if (msg.embeds.length > 0 && msg.embeds[0].type === 'image') {
    return { image: msg.embeds[0].image || msg.embeds[0].thumbnail }
  }

  return {}
}

function generateMessage (stars: number, msg: Message<GuildTextableChannel>, cute: boolean) {
  const [ , star, color ] = (cute ? CUTE : EMOTES).filter((e) => e[0] < stars).pop()!
  return {
    content: `${star} **${stars}** - <#${msg.channel.id}>`,
    embed: {
      ...extractMedia(msg),
      color: color,
      author: {
        name: `${msg.author.username}#${msg.author.discriminator}`,
        icon_url: msg.author.avatarURL,
      },
      description: msg.content,
      fields: [
        {
          name: 'Jump to message',
          value: `[Click here](https://discord.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id})`,
        },
      ],
    },
  }
}

async function updateStarCount (msg: Message<GuildTextableChannel>, count: number, cute: boolean) {
  if (!msg.author) msg = await msg.channel.getMessage(msg.id)

  const channel = cute ? config.discord.ids.channelCuteboard : config.discord.ids.channelStarboard
  const entry = await msg._client.mongo.collection<StarboardEntry>('starboard').findOne({ _id: msg.id }) || {
    ...GENERIC_STAR_OBJ,
    cute: cute,
  }
  entry.stars = count

  if (entry.stars < BOARD_MINIMUM) {
    if (entry.messageId) {
      msg._client.mongo.collection<StarboardEntry>('starboard').deleteOne({ _id: msg.id })
      msg._client.deleteMessage(channel, entry.messageId)
    }
    return
  }

  if (!entry.messageId) {
    const starMsg = await msg._client.createMessage(channel, generateMessage(entry.stars, msg, cute))
    entry.messageId = starMsg.id
  } else {
    msg._client.editMessage(channel, entry.messageId, generateMessage(entry.stars, msg, cute))
  }

  msg._client.mongo.collection<StarboardEntry>('starboard').updateOne(
    { _id: msg.id },
    { $set: { ...entry } },
    { upsert: true }
  )
}

async function process (msg: Message<GuildTextableChannel>, emoji: PartialEmoji, user: HasId) {
  // Only process stars & cute
  if (emoji.name !== STARBOARD_EMOTE && emoji.name !== CUTEBOARD_EMOTE) return

  // eslint-disable-next-line require-atomic-updates
  if (!msg.author) msg = await msg.channel.getMessage(msg.id)

  if (msg.author.id === user.id) {
    // Don't let self-stargazers self-star altogether, because it'd tempt other people to also add a star
    msg.channel.removeMessageReaction(msg.id, emoji.name, user.id)
    return
  }

  const filter = (u: User) => u.id !== msg.author.id
  if (emoji.name === STARBOARD_EMOTE && isProcessable(msg)) {
    const reactions = await getAllReactions(msg, STARBOARD_EMOTE)
    updateStarCount(msg, reactions.filter(filter).length, false)
  }

  if (emoji.name === CUTEBOARD_EMOTE && isProcessable(msg)) {
    const reactions = await getAllReactions(msg, CUTEBOARD_EMOTE)
    updateStarCount(msg, reactions.filter(filter).length, true)
  }
}

export default function (bot: CommandClient) {
  if (!config.discord.ids.channelCuteboard || !config.discord.ids.channelStarboard) {
    console.log('no channel ids provided for starboard. module will be disabled.')
    return
  }

  bot.on('messageReactionAdd', (msg, emoji, user) => process(msg as Message<GuildTextableChannel>, emoji, user))
  bot.on('messageReactionRemove', (msg, emoji, user) => process(msg as Message<GuildTextableChannel>, emoji, { id: user }))
  bot.on('messageReactionRemoveAll', (msg) => updateStarCount(msg as Message<GuildTextableChannel>, 0, false))
  bot.on('messageDelete', (msg) => updateStarCount(msg as Message<GuildTextableChannel>, 0, false))
}
