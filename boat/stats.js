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

module.exports = {
  register (bot) {
    this.bot = bot
    this.messageCounter = 0

    bot.on('messageCreate', () => (this.messageCounter++))
    bot.on('messageDeleteBulk', (messages) => (this.messageCounter -= messages.length)) // Bans, mostly

    cron.schedule('*/30 * * * *', this.collectStats.bind(this))
    cron.schedule('0 0 * * *', this.purgeOldData.bind(this))
  },

  async collectStats () {
    const counts = { online: 0, idle: 0, dnd: 0 }
    const members = await this.bot.guilds.get('538759280057122817').fetchMembers({ presences: true })
    members.forEach(member => member.status && member.status !== 'offline' && counts[member.status]++)
    const seenMessages = this.messageCounter
    this.messageCounter = 0

    this.bot.mongo.collection('guild-stats').insertOne({
      date: new Date(),
      seenMessages,
      ...counts
    })
  },

  async purgeOldData () {
    // Only keep a month & a half of data
  }
}
