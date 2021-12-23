import { SlashCommand, UserCommand, OptionUser } from 'crapcord/interactions'

type BanArgs = {
  user: OptionUser
  reason?: string
  delete?: number
  duration?: string
}

type UnbanArgs = {
  user: OptionUser
  reason?: string
}

type SoftbanArgs = {
  user: OptionUser
  reason?: string
  delete?: number
}

type TimeoutArgs = {
  user: OptionUser
  reason?: string
  duration?: string
}

type EditCaseArgs = {
  case: number
  reason: string
}

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
