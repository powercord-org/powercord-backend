/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { SlashCommand, OptionUser } from 'crapcord/interactions'
import type { Penalties } from '../data/laws.js'
import { getCivilLaw } from '../data/laws.js'

type RuleArgs = {
  rule: number
  target?: OptionUser
}

function formatActions (actions: Penalties) {
  if (actions.type === 'branched') {
    let res = 'Actions:\n'
    for (const branch in actions.branches) {
      if (branch in actions.branches) {
        res += ` => ${branch}: ${actions.branches[branch].join(' -> ')}`
      }
    }
    return res
  }

  return `Actions: ${actions.entries.join(' -> ')}`
}

export default function rule (interaction: SlashCommand<RuleArgs>) {
  const law = getCivilLaw(interaction.args.rule)
  if (!law) {
    interaction.createMessage({ content: 'This rule does not exist.' }, true)
    return
  }

  const formatted = `**${law.law}**\n${law.article}${law.penalties ? `\n\n${formatActions(law.penalties)}` : ''}`
  if (interaction.args.target) {
    const userId = interaction.args.target.user.id
    interaction.createMessage({ content: `<@${userId}> ${formatted}`, allowedMentions: { users: [ userId ] } })
    return
  }

  interaction.createMessage({ content: formatted })
}

export const commandPayload = {
  type: 1,
  name: 'rule',
  description: 'Points out rules from the server',
  options: [
    {
      type: 4,
      name: 'rule',
      description: 'Rule you wish to point out',
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
