import { SlashCommand } from 'crapcord/interactions'

type ListArgs = {}
type AddArgs = {}
type EditArgs = {}
type RemoveArgs = {}

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
