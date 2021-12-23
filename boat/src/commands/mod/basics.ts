import { SlashCommand, UserCommand } from 'crapcord/interactions'

type BanArgs = {}
type UnbanArgs = {}
type SoftbanArgs = {}
type TimeoutArgs = {}
type EditCaseArgs = {}

export function ban (interaction: SlashCommand<BanArgs>) {
  interaction.createMessage({ content: '// todo:tm:' }, true)
}

export function unban (interaction: SlashCommand<UnbanArgs>) {
  interaction.createMessage({ content: '// todo:tm:' }, true)
}

export function softban (interaction: SlashCommand<SoftbanArgs> | UserCommand) {
  interaction.createMessage({ content: '// todo:tm:' }, true)
}

export function timeout (interaction: SlashCommand<TimeoutArgs>) {
  interaction.createMessage({ content: '// todo:tm:' }, true)
}

export function editcase (interaction: SlashCommand<EditCaseArgs>) {
  interaction.createMessage({ content: '// todo:tm:' }, true)
}
