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

import type { CommandClient } from 'eris'
import cron from 'node-cron'
import config from '../config.js'

let sentCounter = 0
let deletedCounter = 0

async function collectStats (bot: CommandClient) {
  const guild = bot.guilds.get(config.discord.ids.serverId)
  if (!guild) return // Most likely Discord experiencing an outage -- skip collection

  const counts = { total: 0, online: 0, idle: 0, dnd: 0 }
  const members = await guild.fetchMembers({ presences: true })
  members.forEach(member => {
    counts.total++
    if (member.status && member.status !== 'offline') {
      counts[member.status]++
    }
  })

  const sentMessages = sentCounter
  const deletedMessages = deletedCounter
  sentCounter = 0
  deletedCounter = 0

  bot.mongo.collection('guild-stats').insertOne({ sentMessages, deletedMessages, ...counts })
}

export default function (bot: CommandClient) {
  bot.on('messageCreate', () => (sentCounter++))
  bot.on('messageDelete', () => (deletedCounter++))
  bot.on('messageDeleteBulk', (messages) => (deletedCounter += messages.length)) // Bans, mostly

  cron.schedule('*/30 * * * *', () => collectStats(bot))
}
