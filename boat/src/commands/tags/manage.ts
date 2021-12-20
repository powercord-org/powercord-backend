import type {
  APIApplicationCommandStringArgumentOptions as DiscordStringOption,
  APIApplicationCommandSubCommandOptions as DiscordSubcommand,
} from 'discord-api-types'
import type { ObjectId } from 'mongodb'
import type { Interaction, SlashCommand } from 'crapcord/interactions'
import type { TagChunk } from './format.js'
import { commands } from 'crapcord/api'
import { parse } from './format.js'
import { commandPayload as tCommand } from './executor.js'
import { tags } from '../../data/mongo.js'

type TagCreateArgs = { name: string, description: string, contents: string }
type TagEditDescriptionArgs = { name: string, description: string }
type TagEditContentArgs = { name: string, contents: string }
type TagArgsRemove = { name: string }

export type Tag = {
  _id: ObjectId
  name: string
  description: string
  contents: TagChunk[]
}

function chunksToArgs (chunks: TagChunk[]) {
  const res: DiscordStringOption[] = []
  for (const chunk of chunks) {
    if (chunk.type === 'argument') {
      res.push({
        type: 3 as any,
        name: chunk.name,
        description: chunk.description,
        required: !chunk.default,
      })
    }
  }

  return res
}

async function buildSubcommands (): Promise<DiscordSubcommand[]> {
  return tags.find()
    .map<DiscordSubcommand>((tag) => ({
      type: 1,
      name: tag.name,
      description: tag.description,
      options: chunksToArgs(tag.contents),
    }))
    .toArray()
}

async function updateCommand (interaction: Interaction) {
  if (!interaction.guildId) {
    throw new Error('Attempted to update commands within DMs')
  }

  const command = { ...tCommand, options: await buildSubcommands() }
  commands.createGuildCommand(interaction.guildId, command, interaction.applicationId, interaction.applicationToken)
}

export async function create (interaction: SlashCommand<TagCreateArgs>) {
  if (!interaction.guildId) {
    interaction.createMessage({ content: 'This command cannot be used in DMs.' }, true)
    return
  }

  let tagContents
  try {
    tagContents = parse(interaction.args.contents)
  } catch {
    interaction.createMessage({ content: 'Tag template is invalid!' }, true)
    return
  }

  await tags.insertOne({
    name: interaction.args.name,
    description: interaction.args.description,
    contents: tagContents,
  })

  await updateCommand(interaction)
  interaction.createMessage({ content: 'Tag successfully created' }, true)
}

export async function edit (interaction: SlashCommand<TagEditDescriptionArgs | TagEditContentArgs>) {
  if (!interaction.guildId) {
    interaction.createMessage({ content: 'This command cannot be used in DMs.' }, true)
    return
  }

  let dbEdit = {}

  try {
    dbEdit = 'description' in interaction.args
      ? { description: interaction.args.description }
      : { contents: parse(interaction.args.contents) }
  } catch {
    interaction.createMessage({ content: 'Tag template is invalid!' }, true)
    return
  }

  const res = await tags.updateOne({ name: interaction.args.name }, { $set: dbEdit })
  if (!res.modifiedCount) {
    interaction.createMessage({ content: 'This tag does not exist.' }, true)
    return
  }

  await updateCommand(interaction)
  interaction.createMessage({ content: 'Tag successfully edited' }, true)
}

export async function remove (interaction: SlashCommand<TagArgsRemove>) {
  if (!interaction.guildId) {
    interaction.createMessage({ content: 'This command cannot be used in DMs.' }, true)
    return
  }

  const res = await tags.deleteOne({ name: interaction.args.name })
  if (!res.deletedCount) {
    interaction.createMessage({ content: 'This tag does not exist.' }, true)
    return
  }

  await updateCommand(interaction)
  interaction.createMessage({ content: 'Tag successfully deleted' }, true)
}

export function autocomplete () {
  console.log('what am i doing')
}

export const commandPayload = {
  type: 1,
  name: 'tag',
  description: 'Manage tags for the guild',
  options: [
    {
      type: 1,
      name: 'create',
      description: 'Create a new tag',
      options: [
        {
          type: 3,
          name: 'name',
          description: 'Tag name',
          required: true,
        },
        {
          type: 3,
          name: 'description',
          description: 'Tab description',
          required: true,
        },
        {
          type: 3,
          name: 'contents',
          description: 'Tab contents',
          required: true,
        },
      ],
    },
    {
      type: 2,
      name: 'edit',
      description: 'Edit a tag',
      options: [
        {
          type: 1,
          name: 'description',
          description: 'Edit the description of the tag',
          options: [
            {
              type: 3,
              name: 'name',
              description: 'Tag name',
              // todo: autocomplete: true,
              required: true,
            },
            {
              type: 3,
              name: 'description',
              description: 'Tab description',
              required: true,
            },
          ],
        },
        {
          type: 1,
          name: 'content',
          description: 'Edit the contents of the tag',
          options: [
            {
              type: 3,
              name: 'name',
              description: 'Tag name',
              // todo: autocomplete: true,
              required: true,
            },
            {
              type: 3,
              name: 'contents',
              description: 'Tab contents',
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 1,
      name: 'remove',
      description: 'Remove a tag',
      options: [
        {
          type: 3,
          name: 'name',
          description: 'Tag name',
          // todo: autocomplete: true,
          required: true,
        },
      ],
    },
  ],
  defaultPermission: false,
}
