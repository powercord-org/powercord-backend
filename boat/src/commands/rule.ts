/*
 * Copyright (c) 2018-2021 aetheryx & Cynthia K. Rey
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
