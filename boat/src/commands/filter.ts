import type { SlashCommand } from 'crapcord/interactions'
import { filter } from '../data/mongo.js'

type FilterArgs = { word: string }

export async function listFilters (interaction: SlashCommand<{}>) {
  interaction.createMessage({ content: 'This command cannot be used in DMs.' }, true)
}

export async function addFilter (interaction: SlashCommand<FilterArgs>) {
  try {
    await filter.insertOne({ word: interaction.args.word })
  } catch (e) {
    interaction.createMessage({ content: 'This word is already in the filter.' }, true)
    return
  }

  interaction.createMessage({ content: 'Word successfully added to the filter.' }, true)
}

export async function removeFilter (interaction: SlashCommand<FilterArgs>) {
  const res = await filter.deleteOne({ word: interaction.args.word })
  if (!res.deletedCount) {
    interaction.createMessage({ content: 'This word is not in the filter.' }, true)
    return
  }

  interaction.createMessage({ content: 'Word successfully removed from the filter.' }, true)
}

export function autocomplete () {
  console.log('what am i doing')
}

export const commandPayload = {
  type: 1,
  name: 'filter',
  description: 'Manage the word filter',
  options: [
    {
      type: 1,
      name: 'list',
      description: 'List words configured in the filter',
    },
    {
      type: 1,
      name: 'add',
      description: 'Add a word to the filter',
      options: [
        {
          type: 3,
          name: 'word',
          description: 'Word to filter',
          required: true,
        },
      ],
    },
    {
      type: 1,
      name: 'remove',
      description: 'Remove a word from the filter',
      options: [
        {
          type: 3,
          name: 'word',
          description: 'Word to remove',
          // todo: autocomplete: true,
          required: true,
        },
      ],
    },
  ],
  defaultPermission: false,
}
