/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { SlashCommand } from 'crapcord/interactions'

import { parse, format } from './tags/format.js'
import { updateTagExecutor } from './tags/executor.js'
import { tags } from '../data/mongo.js'

type TagCreateArgs = { name: string, description: string, contents: string }
type TagEditDescriptionArgs = { name: string, description: string }
type TagEditContentArgs = { name: string, contents: string }
type TagArgsRemove = { name: string }

export async function executeTag (interaction: SlashCommand<Record<string, string>>) {
  const tag = await tags.findOne({ name: interaction.subcommands[0] })
  if (!tag) {
    interaction.createMessage({ content: 'This tag does not exist. How did you even get there...' }, true)
    return
  }

  interaction.createMessage({ content: format(tag.contents, interaction.args) })
}

export async function createTag (interaction: SlashCommand<TagCreateArgs>) {
  let tagContents
  try {
    tagContents = parse(interaction.args.contents)
  } catch {
    interaction.createMessage({ content: 'Tag template is invalid!' }, true)
    return
  }

  try {
    await tags.insertOne({
      name: interaction.args.name,
      description: interaction.args.description,
      contents: tagContents,
    })
  } catch (e) {
    interaction.createMessage({ content: 'A tag with the same name already exists.' }, true)
    return
  }

  await updateTagExecutor(interaction)
  interaction.createMessage({ content: 'Tag successfully created.' }, true)
}

export async function editTag (interaction: SlashCommand<TagEditDescriptionArgs | TagEditContentArgs>) {
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

  await updateTagExecutor(interaction)
  interaction.createMessage({ content: 'Tag successfully edited' }, true)
}

export async function removeTag (interaction: SlashCommand<TagArgsRemove>) {
  const res = await tags.deleteOne({ name: interaction.args.name })
  if (!res.deletedCount) {
    interaction.createMessage({ content: 'This tag does not exist.' }, true)
    return
  }

  await updateTagExecutor(interaction)
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
