import { SlashCommand } from 'crapcord/interactions'

type EnforceArgs = {}
type LookupArgs = {}

export function enforce (interaction: SlashCommand<EnforceArgs>) {
  interaction.createMessage({ content: '// todo:tm:' }, true)
}

export function lookup (interaction: SlashCommand<LookupArgs>) {
  interaction.createMessage({ content: '// todo:tm:' }, true)
}
