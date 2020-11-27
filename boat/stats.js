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

const cron = require('node-cron')
const config = require('../config.json')

module.exports = {
  register (bot) {
    this.bot = bot
    this.messageSentCounter = 0
    this.messageDeletedCounter = 0

    bot.on('messageCreate', () => (this.messageSentCounter++))
    bot.on('messageDelete', () => (this.messageDeletedCounter++))
    bot.on('messageDeleteBulk', (messages) => (this.messageDeletedCounter += messages.length)) // Bans, mostly

    cron.schedule('*/30 * * * *', this.collectStats.bind(this))
    cron.schedule('0 0 * * *', this.purgeOldData.bind(this))
  },

  async collectStats () {
    const counts = { total: 0, online: 0, idle: 0, dnd: 0 }
    const members = await this.bot.guilds.get(config.discord.ids.serverId).fetchMembers({ presences: true })
    members.forEach(member => counts.total++ | (member.status && member.status !== 'offline' && counts[member.status]++))
    const sentMessages = this.messageSentCounter
    const deletedMessages = this.messageDeletedCounter
    this.messageSentCounter = 0
    this.messageDeletedCounter = 0

    this.bot.mongo.collection('guild-stats').insertOne({
      date: new Date(),
      sentMessages,
      deletedMessages,
      ...counts
    })
  },

  async purgeOldData () {
    // Only keep a month & a half of data
  }
}
