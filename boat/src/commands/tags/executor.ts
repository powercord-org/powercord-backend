/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type {
  APIApplicationCommandStringOption as DiscordStringOption,
  APIApplicationCommandSubcommandOption as DiscordSubcommand,
} from 'discord-api-types/v9'
import type { Interaction } from 'crapcord/interactions'
import type { TagChunk } from './format.js'

import { commands } from 'crapcord/api'

import { tags } from '../../data/mongo.js'

function chunksToArgs (chunks: TagChunk[]) {
  const res: DiscordStringOption[] = []
  for (const chunk of chunks) {
    if (chunk.type === 'argument') {
      res.push({
        type: 3,
        name: chunk.name,
        description: chunk.description,
        required: !chunk.default,
      })
    }
  }

  return res
}

async function buildSubcommands (): Promise<DiscordSubcommand[]> {
  return tags.find()
    .map((tag) => ({
      type: 1,
      name: tag.name,
      description: tag.description,
      options: chunksToArgs(tag.contents),
    }))
    .toArray()
}

export async function updateTagExecutor (interaction: Interaction) {
  if (!interaction.guildId) {
    interaction.createMessage({ content: 'This command only works in servers.' }, true)
    return
  }

  const command = {
    type: 1,
    name: 't',
    description: 'Execute a tag',
    options: await buildSubcommands(),
  }

  return commands.createGuildCommand(interaction.guildId, command, interaction.applicationId, interaction.applicationToken)
}
