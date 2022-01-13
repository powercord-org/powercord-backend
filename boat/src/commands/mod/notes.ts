import type { SlashCommand, OptionUser } from 'crapcord/interactions'
import { notes } from '../../data/mongo.js'

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

export async function listNotes (interaction: SlashCommand<ListArgs>) {
  if (!interaction.args.user.member) {
    interaction.createMessage({ content: 'Target is not a server member.' }, true)
    return
  }

  const records = await notes.find({ target: interaction.args.user.user.id })
  if (!await records.count()) {
    interaction.createMessage({ content: 'This user doesn\'t have any notes.' }, true)
    records.close()
    return
  }

  const data = await records
    .map((d) => ` • #${d.id}: <t:${d._id.generationTime}> by <@${d.moderator}>: ${d.note}`).toArray()
    .then((a) => a.join('\n'))

  interaction.createMessage({ content: `Notes for <@${interaction.args.user.user.id}>:\n${data}` }, true)
  records.close()
}

export async function addNote (interaction: SlashCommand<AddArgs>) {
  if (!interaction.args.user.member) {
    interaction.createMessage({ content: 'Target is not a server member.' }, true)
    return
  }

  try {
    await notes.insertOne({
      id: await notes.countDocuments({ target: interaction.args.user.user.id }) + 1,
      target: interaction.args.user.user.id,
      moderator: interaction.invoker.id,
      note: interaction.args.note,
    })
  } catch (e) {
    interaction.createMessage({ content: 'Failed to add a note.' }, true)
    console.log(e)
    return
  }

  interaction.createMessage({ content: 'Note successfully added.' }, true)
}

export async function editNote (interaction: SlashCommand<EditArgs>) {
  if (!interaction.args.user.member) {
    interaction.createMessage({ content: 'Target is not a server member.' }, true)
    return
  }

  let res
  try {
    res = await notes.updateOne(
      { id: interaction.args.id, target: interaction.args.user.user.id },
      { $set: { note: interaction.args.note } }
    )
  } catch (e) {
    interaction.createMessage({ content: 'Failed to edit the note.' }, true)
    console.log(e)
    return
  }

  if (!res.matchedCount) {
    interaction.createMessage({ content: 'Note not found.' }, true)
    return
  }

  interaction.createMessage({ content: 'Note successfully edited.' }, true)
}

export async function removeNote (interaction: SlashCommand<RemoveArgs>) {
  if (!interaction.args.user.member) {
    interaction.createMessage({ content: 'Target is not a server member.' }, true)
    return
  }

  const res = await notes.deleteOne({ target: interaction.args.user.user.id, id: interaction.args.id })
  if (!res.deletedCount) {
    interaction.createMessage({ content: 'Note not found.' }, true)
    return
  }

  await notes.updateMany({ id: { $gt: interaction.args.id } }, { $inc: { id: -1 } })
  interaction.createMessage({ content: 'Note successfully removed.' }, true)
}
