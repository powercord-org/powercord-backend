import { SlashCommand, OptionUser } from 'crapcord/interactions'

type EnforceArgs = {
  user: OptionUser
  rule: number
}

type LookupArgs = {
  user: OptionUser
}

export function enforce (interaction: SlashCommand<EnforceArgs>) {
  interaction.createMessage({ content: '// todo:tm:' }, true)
}

export function lookup (interaction: SlashCommand<LookupArgs>) {
  interaction.createMessage({ content: '// todo:tm:' }, true)
}
