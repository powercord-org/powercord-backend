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
const zws = '\u200B'

module.exports = {
  SNIPE_LIFETIME: 30,
  lastMessages: [],

  register (bot) {
    bot.on('messageDelete', (msg) => {
      if (!msg.author || msg.channel.guild.id !== config.discord.ids.serverId || msg.author.bot) {
        return // Let's ignore
      }

      this.catch(msg, 'delete')
    })

    bot.on('messageUpdate', (msg, old) => {
      if (!old || !msg.author || msg.channel.guild.id !== config.discord.ids.serverId || msg.author.bot) {
        return // Let's ignore
      }

      this.catch({ ...msg, content: old.content }, 'edit')
    })
  },

  catch (msg, type) {
    const id = Math.random()
    this.lastMessages.push({
      _id: id,
      author: `${msg.author.username}#${msg.author.discriminator}`,
      msg: msg.content.replace(/\(/g, `${zws}(`),
      type
    })

    setTimeout(() => (this.lastMessages = this.lastMessages.filter(m => m._id !== id)), this.SNIPE_LIFETIME * 1e3)
  }
}
