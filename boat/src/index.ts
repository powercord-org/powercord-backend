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

import { URL } from 'url'
import { basename } from 'path'
import { CommandClient } from 'eris'
import MongoClient from 'mongodb'

import { readdirRecursive } from './util.js'
import { loadLaws } from './laws.js'
import config from './config.js'

const bot = new CommandClient(config.discord.botToken, {
  intents: [ 'guilds', 'guildBans', 'guildMembers', 'guildPresences', 'guildMessages', 'guildMessageReactions' ]
}, { defaultHelpCommand: false, prefix: config.discord.prefix })

async function loadModule (module: string) {
  const mdl = await import(module)
  if (typeof mdl.default !== 'function') throw new TypeError(`Invalid module: ${basename(module)}`)
  mdl.default(bot)
}

async function loadCommand (command: string) {
  const cmd = await import(command)
  if (typeof cmd.executor !== 'function') throw new TypeError(`Invalid command: ${basename(command)}`)
  bot.registerCommand(basename(command, '.js'), cmd.executor, { description: cmd.description, aliases: cmd.aliases })
}

Promise.resolve()
  .then(() => MongoClient.connect(config.mango, { useUnifiedTopology: true }))
  .then((client) => bot.mongo = client.db('powercord'))
  .then(() => readdirRecursive(new URL('./modules/', import.meta.url)))
  .then((modules) => Promise.all(modules.map(loadModule)))
  .then(() => readdirRecursive(new URL('./commands/', import.meta.url)))
  .then((commands) => Promise.all(commands.map(loadCommand)))
  .then(() => bot.connect())
  .then(() => console.log('Bot logged in'))
  .then(() => loadLaws(bot))
  .catch((e) => console.error('An error occurred during startup', e))
