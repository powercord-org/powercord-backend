import type { SlashCommand } from 'crapcord/interactions'
import { format } from './format.js'
import { tags } from '../../data/mongo.js'

export async function execute (interaction: SlashCommand<Record<string, string>>) {
  const tag = await tags.findOne({ name: interaction.subcommands[0] })
  if (!tag) {
    interaction.createMessage({ content: 'This tag does not exist. How did you even get there...' }, true)
    return
  }

  interaction.createMessage({ content: format(tag.contents, interaction.args) })
}

export const commandPayload = {
  type: 1,
  name: 't',
  description: 'Execute a tag',
}
