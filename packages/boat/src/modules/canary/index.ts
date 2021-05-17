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

import type { Embed, EmbedField } from 'eris'
import type { WebappUpdateInfo, UpdatedExperiment } from './web.js'
import type { AppUpdateInfo, UpdateInfo } from './app.js'
import fetch from 'node-fetch'
import cron from 'node-cron'
import json5 from 'json5'
import checkAppUpdates from './app.js'
import checkWebUpdates from './web.js'
import state, { commitCanaryState, PLATFORMS, PLATFORM_WITH_NEW_UPDATER } from './state.js'
import { prettyPrintBytes, capitalize } from '../../util.js'
import config from '../../config.js'

const CANARY = 'https://cdn.discordapp.com/attachments/552938674837258242/843900865907785758/canary.png'
// @ts-ignore -- :pensive:
const CANARY_BUT_GOOD = 'https://cdn.discordapp.com/attachments/552938674837258242/843901034518020156/canary.png' // eslint-disable-line
const POWERCORD_PLUG = 'https://cdn.discordapp.com/attachments/552938674837258242/843928555591434280/c9029f938b4b46068aca7b8f7451a125.png'

const PLATFORM_NAMES = {
  win: 'Windows',
  linux: 'Linux',
  osx: 'MacOS',
}

function dispatchHonk (honk: string, payload: Record<string, unknown>): Promise<unknown> {
  return fetch(`https://discord.com/api/v9/webhooks/${honk}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      username: 'Powercord',
      avatar_url: POWERCORD_PLUG,
    }),
  })
}

function generateBuildEmbed (update: WebappUpdateInfo): Embed {
  return {
    type: 'rich',
    title: update.rollback ? 'Canary Build Rollback' : 'Canary Build Update',
    thumbnail: { url: CANARY },
    color: 0xfaad2b,
    fields: [
      {
        name: 'Build ID',
        value: update.build.hash.slice(0, 7),
        inline: true,
      },
      {
        name: 'Build Number',
        value: update.build.id,
        inline: true,
      },
      {
        name: 'Version Hash',
        value: update.build.hash,
      },
      {
        name: 'Base files',
        value: `• JS: [\`${update.assets.js.name}\`](https://canary.discord.com${update.assets.js.name}) (${prettyPrintBytes(update.assets.js.size)})\n`
          + `• CSS: [\`${update.assets.css.name}\`](https://canary.discord.com${update.assets.css.name}) (${prettyPrintBytes(update.assets.css.size)})\n`,
      },
    ],
  }
}

function generateExperimentEmbed (experiment: UpdatedExperiment): Embed {
  const base = {
    type: 'rich',
    title: `${capitalize(experiment.kind)} Experiment ${capitalize(experiment.update)}d`,
    thumbnail: { url: CANARY },
    color: 0xfaad2b,
  }

  if (experiment.update === 'delete') {
    return {
      ...base,
      fields: [
        { name: 'Experiment Label', value: experiment.label },
        { name: 'Experiment ID', value: experiment.id },
      ],
    }
  }

  const cfg = experiment.defaultConfig
    ? Object.keys(experiment.defaultConfig).length === 1
      ? json5.stringify(experiment.defaultConfig).replace(/([[{:])/g, '$1 ').replace(/([\]}])/g, ' $1')
      : json5.stringify(experiment.defaultConfig, null, 2)
    : null

  return {
    ...base,
    fields: [
      { name: 'Experiment Label', value: experiment.label },
      { name: 'Experiment ID', value: experiment.id },
      { name: 'Default config', value: cfg ? `\`\`\`js\n${cfg}\n\`\`\`` : '*None*' },
      { name: 'Bucket Overrides', value: experiment.treatments.map((t) => `Treatment ${t.id}: ${t.label}`).join('\n') },
    ],
  }
}

function generateHostEmbed (update: AppUpdateInfo): Embed | null {
  const fields: EmbedField[] = []
  for (const platform of PLATFORMS) {
    if (update.new[platform]?.host) {
      fields.push({
        name: PLATFORM_NAMES[platform],
        value: `\`${update.new[platform]!.host!.prev} => ${update.new[platform]!.host!.next}\``,
      })
    }

    if (update.legacy[platform]?.host) {
      console.log(`${PLATFORM_NAMES[platform]}${PLATFORM_WITH_NEW_UPDATER.includes(platform as any) ? ' (Legacy)' : ''}`)
      fields.push({
        name: `${PLATFORM_NAMES[platform]}${PLATFORM_WITH_NEW_UPDATER.includes(platform as any) ? ' (Legacy)' : ''}`,
        value: `\`${update.legacy[platform]!.host!.prev} => ${update.legacy[platform]!.host!.next}\``,
      })
    }
  }

  if (fields.length === 0) return null
  return {
    type: 'rich',
    title: 'Canary Host Update',
    thumbnail: { url: CANARY },
    color: 0xfaad2b,
    fields: fields,
  }
}

function makeModulesFields (modules: UpdateInfo['modules']): EmbedField[] {
  return Object.keys(modules).map((mdl) => ({
    name: mdl,
    value: `\`${modules[mdl].next} => ${modules[mdl].prev}\``,
    inline: true,
  }))
}

function generateModulesEmbeds (update: AppUpdateInfo): Embed[] {
  const embeds: Embed[] = []
  for (const platform of PLATFORMS) {
    if (platform in update.new) {
      const fields = makeModulesFields(update.new[platform]!.modules)
      if (fields.length === 0) continue

      embeds.push({
        type: 'rich',
        title: `Canary Module Updates - ${PLATFORM_NAMES[platform]}`,
        thumbnail: { url: CANARY },
        color: 0xfaad2b,
        fields: fields,
      })
    }

    if (platform in update.legacy) {
      const fields = makeModulesFields(update.legacy[platform]!.modules)
      if (fields.length === 0) continue

      embeds.push({
        type: 'rich',
        title: `Canary Module Updates - ${PLATFORM_NAMES[platform]}${PLATFORM_WITH_NEW_UPDATER.includes(platform as any) ? ' (Legacy)' : ''}`,
        thumbnail: { url: CANARY },
        color: 0xfaad2b,
        fields: fields,
      })
    }
  }

  return embeds
}

async function appUpdates () {
  const update = await checkAppUpdates()
  const host = generateHostEmbed(update)
  const modules = generateModulesEmbeds(update)
  const embeds: Embed[] = [ host, ...modules ].filter(Boolean) as Embed[]

  if (embeds.length) {
    dispatchHonk(config.honks.updootChannel, { embeds: embeds })
  }

  return commitCanaryState()
}

async function webUpdates () {
  const update = await checkWebUpdates()

  if (update) {
    const embeds = [ generateBuildEmbed(update), ...update.experiments.map((e) => generateExperimentEmbed(e)) ]
    dispatchHonk(config.honks.updootChannel, { embeds: embeds })
  }

  return commitCanaryState()
}

export default async function () {
  if (state.__empty) {
    delete state.__empty
    await Promise.all([ checkAppUpdates(), checkWebUpdates() ])
    await commitCanaryState()
  }

  cron.schedule('30 */30 * * * *', () => appUpdates())
  cron.schedule('*/5 * * * *', () => webUpdates())
  appUpdates()
}

// dev
export const __skip = process.env.NODE_ENV !== 'development'
