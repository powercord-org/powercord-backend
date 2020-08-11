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

const config = require('../config.json')

const CUTEBOARD_EMOTE = '🌺'
const STARBOARD_EMOTE = '⭐'
const GENERIC_STAR_OBJ = {
  messageId: null,
  stars: 0
}
const CUTE = [ 69, CUTEBOARD_EMOTE, 0xf49898 ]
const EMOTES = [
  [ 0, '⭐', 0xffffff ],
  [ 5, '🌟', 0xffffaa ],
  [ 10, '💫', 0xffff66 ],
  [ 20, '✨', 0xffff00 ]
]

module.exports = {
  register (bot) {
    bot.on('messageReactionAdd', (msg, emoji, user) => this.process(msg, emoji, user))
    bot.on('messageReactionRemove', (msg, emoji, user) => this.process(msg, emoji, user))
    bot.on('messageReactionRemoveAll', (msg) => this.updateStarCount(msg, 0))
    bot.on('messageDelete', (msg) => this.updateStarCount(msg, 0))
  },

  async process (msg, emoji, user) {
    if (!msg.author) {
      msg = await msg.channel.getMessage(msg.id)
    }

    if (emoji.name === STARBOARD_EMOTE && this._isProcessable(msg, user)) {
      const reactions = await msg.channel.getMessageReaction(msg.id, STARBOARD_EMOTE)
      this.updateStarCount(msg, reactions.filter(u => u.id !== msg.author.id).length)
    }

    if (emoji.name === CUTEBOARD_EMOTE && this._isProcessable(msg, user)) {
      const reactions = await msg.channel.getMessageReaction(msg.id, CUTEBOARD_EMOTE)
      this.updateStarCount(msg, reactions.filter(u => u.id !== msg.author.id).length, true)
    }
  },

  async updateStarCount (msg, count, cute) {
    const channel = cute ? config.discord.ids.channelCuteboard : config.discord.ids.channelStarboard
    const entry = await msg._client.mongo.collection('starboard').findOne({ _id: msg.id }) || {
      ...GENERIC_STAR_OBJ,
      cute
    }
    entry.stars = count

    if (entry.stars < 1) {
      if (entry.messageId) {
        msg._client.mongo.collection('starboard').deleteOne({ _id: msg.id })
        msg._client.deleteMessage(channel, entry.messageId)
      }
      return
    }

    if (!entry.messageId) {
      const starMsg = await msg._client.createMessage(channel, this._buildStarMessage(entry.stars, msg, cute))
      entry.messageId = starMsg.id
    } else {
      msg._client.editMessage(channel, entry.messageId, this._buildStarMessage(entry.stars, msg, cute))
    }

    msg._client.mongo.collection('starboard').updateOne(
      { _id: msg.id },
      { $set: { ...entry } },
      { upsert: true }
    )
  },

  _isProcessable (msg, stargazer) {
    return !msg.channel.nsfw &&
      msg.author.id !== stargazer.id &&
      msg.channel.id !== config.discord.ids.channelCuteboard &&
      msg.channel.id !== config.discord.ids.channelStarboard &&
      !(msg.content.length === 0 && msg.attachments.length === 0 && (!msg.embeds[0] || msg.embeds[0].type !== 'image'))
  },

  _buildStarMessage (stars, msg, cute) {
    const [ , star, color ] = cute ? CUTE : EMOTES.filter(e => e[0] < stars).pop()
    return {
      content: `${star} **${stars}** - <#${msg.channel.id}>`,
      embed: {
        color,
        author: {
          name: `${msg.author.username}#${msg.author.discriminator}`,
          icon_url: msg.author.avatarURL
        },
        description: msg.content,
        image: this._resolveAttachment(msg),
        fields: [
          {
            name: 'Jump to message',
            value: `[Click here](https://discord.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id})`
          }
        ]
      }
    }
  },

  _resolveAttachment (msg) {
    if (msg.attachments.length > 0 && msg.attachments[0].width) {
      return msg.attachments[0]
    } else if (msg.embeds.length > 0 && msg.embeds[0].type === 'image') {
      return msg.embeds[0].image || msg.embeds[0].thumbnail
    }

    return null
  }
}
