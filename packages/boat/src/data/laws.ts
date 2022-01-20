/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import https from 'https'
import { messages } from 'crapcord/api'
import config from '@powercord/shared/config'

export type Penalties = |
  { type: 'simple', entries: string[] } |
  { type: 'branched', branches: Record<string, string[]> }

export type Law = {
  law: string
  article: string
  penalties?: Penalties
}

const GUIDELINES_URL = 'https://raw.githubusercontent.com/powercord-community/guidelines/master/README.md'

const civilLaws = new Map<number, Law>() // Rules
const commerceLaws = new Map<number, Law>() // Guidelines

const RULES_REGEX = /(\d{2}):: (.+)\n((?:.+\n)+?)(?: +Actions: ((?:=> )?.+(?:\n +=>.+)*))?\n[\n`]?/g
const ACTIONS_BRANCH_REGEX = / *=> (.*?): ?(.*)/g

async function fetchCivilCode (): Promise<void> {
  const [ channelId, messageId ] = config.discord.messages.rules
  const rulesMessage = await messages.fetchMessage(channelId, messageId, { type: 'Bot', token: config.discord.botToken })
  for (const [ , id, law, article, actionsRaw ] of rulesMessage.content.matchAll(RULES_REGEX)) {
    let penalties: Penalties | undefined = void 0
    if (actionsRaw) {
      if (actionsRaw.startsWith('=>')) {
        penalties = { type: 'branched', branches: {} }
        for (const [ , branch, actions ] of actionsRaw.matchAll(ACTIONS_BRANCH_REGEX)) {
          penalties.branches[branch] = actions.split(' -> ')
        }
      } else {
        penalties = { type: 'simple', entries: actionsRaw.split(' -> ') }
      }
    }

    const trimmedArticle = article.split('\n').map((s) => s.trim()).filter(Boolean).join('\n')
    civilLaws.set(Number(id), { law: law, article: trimmedArticle, penalties: penalties })
  }
}

async function fetchCommerceCode (): Promise<void> {
  return new Promise((resolve) => {
    https.get(GUIDELINES_URL, (res) => {
      let markdown = ''
      res.setEncoding('utf8')
      res.on('data', (d) => (markdown += d))
      res.on('end', () => {
        // todo: parse markdown
        resolve()
      })
    })
  })
}

export function getCivilLaw (rule: number) {
  return civilLaws.get(rule)
}

export function getCommerceLaw (guideline: number) {
  return commerceLaws.get(guideline)
}

export function hydrateStore () {
  return Promise.all([ fetchCivilCode(), fetchCommerceCode() ])
}
