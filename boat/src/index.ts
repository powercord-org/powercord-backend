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

import { registerCommands } from 'crapcord/interactions'
import { createInteractionServer } from 'crapcord/helpers'
import config from '@powercord/shared/config'

import { hydrateStore as hydrateLawStore } from './data/laws.js'

import ruleCommand from './commands/rule.js'
import guidelineCommand from './commands/guideline.js'
import * as tagCommands from './commands/tags.js'
import * as filterCommands from './commands/filter.js'
import * as modCommands from './commands/mod.js'

await hydrateLawStore()

// [Cynthia] yes we could make an autoloader for it, no i don't want to
registerCommands([
  // Slash commands
  { command: 'rule', handler: ruleCommand },
  { command: 'guideline', handler: guidelineCommand },
  { command: 't', handler: tagCommands.executeTag },
  {
    command: 'tag',
    sub: {
      create: { handler: tagCommands.createTag },
      edit: { handler: tagCommands.editTag },
      remove: { handler: tagCommands.removeTag },
    },
    // autocomplete: console.log
  },
  {
    command: 'filter',
    sub: {
      list: { handler: filterCommands.listFilters },
      add: { handler: filterCommands.addFilter },
      remove: { handler: filterCommands.removeFilter },
    },
    // autocomplete: console.log
  },
  {
    command: 'mod',
    sub: {
      ban: { handler: modCommands.ban },
      unban: { handler: modCommands.unban },
      softban: { handler: modCommands.softban },
      timeout: { handler: modCommands.timeout },
      editcase: { handler: modCommands.editcase },

      enforce: { handler: modCommands.enforce },
      lookup: { handler: modCommands.lookup },
      notes: {
        sub: {
          list: { handler: modCommands.listNotes },
          add: { handler: modCommands.addNote },
          edit: { handler: modCommands.editNote },
          remove: { handler: modCommands.removeNote },
        },
      },
    },
  },
  {
    command: 'admin',
    sub: {
      ssh: { handler: console.log },
      eval: { handler: console.log },
    },
  },

  // User commands
  { command: 'soft-ban', handler: modCommands.softban },
])

createInteractionServer({
  port: 4567, // todo: config
  token: { type: 'Bot', token: config.discord.botToken },
  key: config.discord.botPublicKey,
})
