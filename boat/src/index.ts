/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
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
  { command: 'Softban', handler: modCommands.softban },
])

createInteractionServer({
  port: config.interactionsPort,
  token: { type: 'Bot', token: config.discord.botToken },
  key: config.discord.botPublicKey,
})
