import { SlashCommand, OptionUser } from 'crapcord/interactions'

type EnforceArgs = {
  user: OptionUser
  rule: number
}

type LookupArgs = {
  user: OptionUser
}

export function enforce (interaction: SlashCommand<EnforceArgs>) {
  // todo
  interaction.createMessage({ content: 'Not implemented, use pc/enforce.' }, true)
}

export function lookup (interaction: SlashCommand<LookupArgs>) {
  // todo
  interaction.createMessage({ content: 'Not implemented, use pc/lookup.' }, true)
}
