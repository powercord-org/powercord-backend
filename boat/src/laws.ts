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

import type { CommandClient } from 'eris'
import fetch from 'node-fetch'
import { sleep } from './util.js'
import config from './config.js'

export type CivilLaw = { law: string, penalties?: string[] }
export type CommerceLaw = { law: string, article: string }
export type CommerceDefinition = { name: string, value: string }

let civilLaws: Map<number, CivilLaw> = new Map()
let commerceLaws: Map<number, CommerceLaw> = new Map()
let commerceDefinitions: CommerceDefinition[] = []

async function loadCivilLaws (bot: CommandClient) {
  await sleep(3e3)
  const guild = bot.guilds.get(config.discord.ids.serverId)
  if (!guild) return
  const civilCode = await bot.getMessages(config.discord.ids.channelRules).then((l) => l.map((m) => m.content).join('\n'))

  const matches = civilCode.matchAll(/\[(\d{2})]((?:[^`\n].+\n)+?)(?: +Actions: ([^\n]+))?(?:\n|`)/g)
  const entries: [ number, CivilLaw ][] = []
  for (const match of matches) {
    const replacer = (og: string, name: string) => guild.channels.find(c => c.name === name)?.mention ?? og
    const law = match[2].trim().replace(/\n */g, ' ').replace(/\[#[^a-z0-9-_]?([a-z0-9-_]+)\]/ig, replacer)
    entries.push([ Number(match[1]), { law: law, penalties: match[3]?.split(' -> ') } ])
  }

  civilLaws = new Map(entries)
}

async function loadCommerceLaws () {
  const commerceCode = await fetch('https://raw.githubusercontent.com/powercord-community/guidelines/master/README.md').then((r) => r.text())
  const [ , defs, code ] = commerceCode.match(/## .*\n((?:.|\n)+?)\n## .*\n((?:.|\n)+?)\n## /)!
  commerceDefinitions = defs.split('-').map((s) => s.trim()).filter(Boolean).map((d) => {
    const s = d.split(':')
    return { name: s.shift()!, value: s.join(':') }
  })

  const matches = code.matchAll(/### (\d+)\. ([^\n]+)\n([^#]+)/g)
  const entries: [ number, CommerceLaw ][] = []
  for (const match of matches) {
    const article = match[3].trim().replace(/\n\n/g, '<br><br>').replace(/\n/g, '').replace(/<br\/?>/g, '\n')
    entries.push([ Number(match[1]), { law: match[2].trim(), article: article } ])
  }

  commerceLaws = new Map(entries)
}

export function getCivilLaws (): Map<number, CivilLaw> {
  return civilLaws
}

export function getCommerceLaws (): Map<number, CommerceLaw> {
  return commerceLaws
}

export function getCommerceDefinitions (): CommerceDefinition[] {
  return commerceDefinitions
}

export async function loadLaws (bot: CommandClient): Promise<void[]> {
  return Promise.all([ loadCivilLaws(bot), loadCommerceLaws() ])
}
