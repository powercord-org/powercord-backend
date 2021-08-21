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

import type { Experiment } from './state.js'
import fetch from 'node-fetch'
import json5 from 'json5'
import state from './state.js'

export type UpdatedExperiment = Experiment & { update: 'add' | 'update' | 'delete' }

type Asset = { name: string, size: number }
type AssetsInfo = { js: Asset, css: Asset }
export type BuildInfo = { id: string, hash: string }
export type WebappUpdateInfo = { rollback: boolean, assets: AssetsInfo, build: BuildInfo, experiments: UpdatedExperiment[], date: Date }

const DISCORD_WEBAPP_ENDPOINT = 'https://canary.discord.com/assets/version.canary.json'
const STYLE_REGEX = /<link rel="stylesheet" href="([^"]+)/
const SCRIPT_REGEX = /<script src="([^"]+)/
const RESOURCE_REGEX = /\d+:"([^"]+)/
const SUBSCRIPT_REGEX = /([a-f0-9]{16,}\.js)(?!\.map)/
const EXPERIMENT_REGEX = /\.(default|createExperiment|register(?:User|Guild)Experiment)\)\(({.+?})\)(?:;|}|,[a-zA-Z_]{1,4}=)/

const SCRIPT_REGEX_G = new RegExp(SCRIPT_REGEX, 'g')
const RESOURCE_REGEX_G = new RegExp(RESOURCE_REGEX, 'g')
const SUBSCRIPT_REGEX_G = new RegExp(SUBSCRIPT_REGEX, 'g')
const EXPERIMENT_REGEX_G = new RegExp(EXPERIMENT_REGEX, 'g')

function processExperiments (rawExperiments: Experiment[]): UpdatedExperiment[] {
  const experiments: UpdatedExperiment[] = []
  for (const rawExperiment of rawExperiments) {
    if (!(rawExperiment.id in state.experiments)) {
      experiments.push({ ...rawExperiment, update: 'add' })
    } else {
      // todo: Compare to check if new updates
    }

    state.experiments[rawExperiment.id] = rawExperiment
  }

  const currentExperiments = rawExperiments.map((e) => e.id)
  for (const knownExp in state.experiments) {
    if (knownExp in state.experiments && !currentExperiments.includes(knownExp)) {
      experiments.push({ ...state.experiments[knownExp], update: 'delete' })
      delete state.experiments[knownExp]
    }
  }

  return experiments
}

function extractExperiments (js: string): UpdatedExperiment[] {
  const rawExperiments = js.match(EXPERIMENT_REGEX_G)
  if (!rawExperiments) return []

  const experiments: Experiment[] = []
  const seenIds: string[] = []
  for (const rawExperiment of rawExperiments) {
    const [ , registerMethod, experimentData ] = rawExperiment.match(EXPERIMENT_REGEX)!
    if (registerMethod === 'default' && !experimentData.includes('kind:')) continue

    try {
      const exp = json5.parse(
        experimentData
          .replace(/!0/g, 'true')
          .replace(/!1/g, 'false')
          .replace(/,clientFilter:.*/g, '}')
          .replace(/[a-zA-Z_]+\.ExperimentBuckets\.([A-Z0-9_]+)/g, (_, t) => t === 'CONTROL' ? 0 : t.slice(-1))
          .replace(/([:[{,]).(?:\.([a-zA-Z_]+))?\.([A-Z0-9_]+)/g, (_, prefix, namespace, constName) => {
            if (!namespace) return `${prefix}"${constName}"`
            const regex = new RegExp(`${constName}(?:=\\d+])?=(${namespace === 'Experiments' ? '"\\d{4}-\\d{2}' : '(?:"|\\d)'}[^,;]+)`)
            return prefix + js.match(regex)?.[1] ?? `"${constName}"`
          })
          .replace(/([a-zA-Z_]+:)([a-zA-Z_]+)([,}\]])/g, (og, prefix, identifier, suffix) => {
            if (identifier === 'true' || identifier === 'false' || identifier === 'null') return og

            const idx = js.indexOf(rawExperiment)
            const regex = new RegExp(`var ${identifier}=([^;,]+)`)
            return prefix + (js.substring(idx - 250, idx).match(regex)?.[1] ?? `"${identifier}"`) + suffix
          })
      )

      if (!seenIds.includes(exp.id)) {
        if (registerMethod === 'registerUserExperiment' || registerMethod === 'registerGuildExperiment') {
          experiments.push({
            kind: registerMethod === 'registerUserExperiment' ? 'user' : 'guild',
            id: exp.id,
            label: exp.title,
            defaultConfig: null,
            treatments: exp.buckets.slice(1).map((b: number) => ({
              id: b,
              config: null,
              label: exp.description.find((d: string) => d.startsWith(`Treatment ${b}: `)).slice(13).trim(),
            })),
          })
        } else {
          experiments.push(exp)
        }
      }
    } catch (e) {
      console.error('Failed to parse experiment')
      console.error(experimentData)
      console.error(e)
    }
  }

  return processExperiments(experiments)
}

async function downloadScript (script: string, seen: Set<string>): Promise<string> {
  const all = []
  const js = await fetch(`https://canary.discord.com/assets/${script}`)
    .then((r) => r.text())
    .then((t) => t.replace(/\n/g, ''))

  all.push(js)
  const newFiles = js.match(SUBSCRIPT_REGEX_G)
  if (newFiles) {
    for (const newFile of newFiles) {
      if (!seen.has(newFile)) {
        seen.add(newFile)
        all.push(await downloadScript(newFile, seen))
      }
    }
  }

  return all.join('\n')
}

async function downloadAllScripts (resourcesScript: string): Promise<string> {
  const jsResources = await fetch(`https://canary.discord.com${resourcesScript}`)
    .then((r) => r.text())
    .then((t) => t.replace(/\n/g, ''))

  const resourcesMatch = jsResources.match(RESOURCE_REGEX_G)
  if (!resourcesMatch) return ''

  const seen = new Set(resourcesMatch.map((r) => `${r.match(RESOURCE_REGEX)![1]}.js`))
  const scripts = Array.from(seen)

  const all = await Promise.all(scripts.map((s) => downloadScript(s, seen)))

  return all.join('\n')
}

async function extractWebappData (hash: string, date: Date): Promise<WebappUpdateInfo | null> {
  const html = await fetch(`https://canary.discord.com/app?_=${Date.now()}`).then((r) => r.text())
  const styleMatch = html.match(STYLE_REGEX)
  const scriptAllMatch = html.match(SCRIPT_REGEX_G)
  const scriptMainHtml = scriptAllMatch?.pop()
  const scriptResourcesHtml = scriptAllMatch?.shift()
  const scriptMatch = scriptMainHtml?.match(SCRIPT_REGEX)
  const resourcesMatch = scriptResourcesHtml?.match(SCRIPT_REGEX)
  if (!styleMatch || !scriptMatch || !resourcesMatch) return null

  const jsBuffer = await fetch(`https://canary.discord.com${scriptMatch[1]}`).then((r) => r.buffer())
  const cssBuffer = await fetch(`https://canary.discord.com${styleMatch[1]}`).then((r) => r.buffer())
  const resources = await downloadAllScripts(resourcesMatch[1])
  const js = jsBuffer.toString('utf8')
  const buildId = js.match(/Build Number: (\d+)/)?.[1] ?? ''
  const buildIdInt = Number(buildId) || -1
  const isRollback = state.webapp.id > buildIdInt
  state.webapp.id = buildIdInt

  return {
    rollback: isRollback,
    assets: {
      js: { name: scriptMatch[1], size: jsBuffer.length },
      css: { name: styleMatch[1], size: cssBuffer.length },
    },
    build: {
      id: buildId || '???',
      hash: hash,
    },
    experiments: extractExperiments(jsBuffer.toString('utf8').replace(/\n/g, '') + resources),
    date: date,
  }
}

export default async function checkWebUpdates (): Promise<WebappUpdateInfo | null> {
  const versionRes = await fetch(`${DISCORD_WEBAPP_ENDPOINT}?_=${Date.now()}`)
  const version = await versionRes.json()
  if (state.webapp.hash === version.hash) {
    return null
  }

  state.webapp.hash = version.hash
  return extractWebappData(version.hash, new Date(versionRes.headers.get('last-modified') ?? Date.now()))
}

// Don't load this file as a module
export const __skip = true
