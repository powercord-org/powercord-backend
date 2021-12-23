import { SlashCommand, OptionUser } from 'crapcord/interactions'

type ListArgs = {
  user: OptionUser
}

type AddArgs = {
  user: OptionUser
  note: string
}
type EditArgs = {
  user: OptionUser
  id: number
  note: string
}

type RemoveArgs = {
  user: OptionUser
  id: number
}

export function listNotes (interaction: SlashCommand<ListArgs>) {
  interaction.createMessage({ content: '// todo:tm:' }, true)
}

export function addNote (interaction: SlashCommand<AddArgs>) {
  interaction.createMessage({ content: '// todo:tm:' }, true)
}

export function editNote (interaction: SlashCommand<EditArgs>) {
  interaction.createMessage({ content: '// todo:tm:' }, true)
}

export function removeNote (interaction: SlashCommand<RemoveArgs>) {
  interaction.createMessage({ content: '// todo:tm:' }, true)
}
