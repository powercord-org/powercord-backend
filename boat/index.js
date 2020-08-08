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
const sniper = require('./sniper')
const config = require('../config.json')

const bot = new CommandClient(config.discord.botToken, {
  // todo: do we need guild members? dont think so but that needs some testing (esp. for mod log(?))
  intents: [ 'guilds', 'guildBans', 'guildMembers', 'guildMessages', 'guildMessageReactions' ]
}, { defaultHelpCommand: false, prefix: config.discord.prefix })

// Commands
bot.registerCommand('ping', require('./commands/ping'))
bot.registerCommand('rule', require('./commands/rule'))
bot.registerCommand('guideline', require('./commands/guideline'))
bot.registerCommand('snipe', require('./commands/snipe'))
bot.registerCommand('tag', require('./commands/tag'))

bot.registerCommand('eval', require('./commands/admin/eval'))
bot.registerCommand('ssh', require('./commands/admin/ssh'))

// Other stuff
sniper.register(bot)

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
