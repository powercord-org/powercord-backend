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

const { CommandClient } = require('eris')
const { MongoClient } = require('mongodb')
const modlog = require('./modlog')
const sniper = require('./sniper')
const logger = require('./logger')
const roles = require('./roles')
const canary = require('./canary')
const starboard = require('./starboard')
const stats = require('./stats')
const config = require('../config.json')

const bot = new CommandClient(config.discord.botToken, {
  intents: [ 'guilds', 'guildBans', 'guildMembers', 'guildPresences', 'guildMessages', 'guildMessageReactions' ]
}, { defaultHelpCommand: false, prefix: config.discord.prefix })

// Commands
bot.registerCommand('ping', require('./commands/ping'), { description: 'Pong' })
bot.registerCommand('rule', require('./commands/rule'), { description: 'Helps people unable to read #rules' })
bot.registerCommand('guideline', require('./commands/guideline'), { description: 'Points out guidelines from https://powercord.dev/guidelines' })
bot.registerCommand('snipe', require('./commands/snipe'), { description: 'Sends a copy of messages deleted or edited in the last 30 seconds.' })
bot.registerCommand('tag', require('./commands/tag'), { description: 'Custom commands' })
bot.registerCommand('help', require('./commands/help'), { description: 'Shows this very help message' })

bot.registerCommand('edit', require('./commands/mod/edit'))

bot.registerCommand('eval', require('./commands/admin/eval'))
bot.registerCommand('ssh', require('./commands/admin/ssh'))
bot.registerCommand('sync', require('./commands/admin/sync'))
bot.registerCommand('syncFaq', require('./commands/admin/syncFaq'))

// Other stuff
modlog.register(bot)
sniper.register(bot)
logger.register(bot)
roles.register(bot)
canary.register(bot)
starboard.register(bot)
stats.register(bot)

// Events
bot.on('ready', () => console.log('Ready.'))

console.log('Connecting to Mongo')
MongoClient.connect(config.mango, { useUnifiedTopology: true })
  .then(c => c.db('powercord'))
  .then(mongo => {
    bot.mongo = mongo
    console.log('Connecting to the Discord App Gateway WebSocket powered by Elixir and Web Scale Technology')
    bot.connect()
  })
