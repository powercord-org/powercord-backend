/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { SlashCommand, OptionUser } from 'crapcord/interactions'
import { getCommerceLaw } from '../data/laws.js'

type GuidelineArgs = {
  guideline: number
  target?: OptionUser
}

export default function guideline (interaction: SlashCommand<GuidelineArgs>) {
  const law = getCommerceLaw(interaction.args.guideline)
  if (!law) {
    interaction.createMessage({ content: 'This guideline does not exist.' }, true)
    return
  }

  const formatted = `**${law.law}**\n${law.article}`
  if (interaction.args.target) {
    const userId = interaction.args.target.user.id
    interaction.createMessage({ content: `<@${userId}> ${formatted}`, allowedMentions: { users: [ userId ] } })
    return
  }

  interaction.createMessage({ content: formatted })
}

export const commandPayload = {
  type: 1,
  name: 'guideline',
  description: 'Points out guidelines from https://powercord.dev/guidelines',
  options: [
    {
      type: 4,
      name: 'guideline',
      description: 'Guideline you wish to point out',
      minValue: 0,
      required: true,
    },
    {
      type: 6,
      name: 'target',
      description: 'User to mention',
      required: false,
    },
  ],
}
