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
