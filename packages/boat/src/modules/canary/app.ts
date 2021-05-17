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

import type { Platform, UpdaterAwarePlatform, PlatformedValue } from './state.js'
import fetch from 'node-fetch'
import state, { PLATFORMS } from './state.js'

type UpdateInfo = { host?: string, modules: Record<string, number> }
type AppUpdateInfo = { new: Partial<PlatformedValue<UpdateInfo>>, legacy: Partial<PlatformedValue<UpdateInfo>> }

const LEGACY_HOST_ENDPOINT = 'https://discord.com/api/updates/canary?platform=$platform'
const LEGACY_MODULE_ENDPOINT = 'https://discord.com/api/modules/canary/versions.json?platform=$platform&host_version=$host'
const UPDATE_ENDPOINT = 'https://discord.com/api/updates/distributions/app/manifests/latest?channel=canary&platform=$platform&arch=x86'

const HAS_NEW_UPDATER: Platform[] = [ 'win' ]

async function checkNewUpdates (): Promise<Partial<PlatformedValue<UpdateInfo>>> {
  const res: Partial<PlatformedValue<UpdateInfo>> = {}
  for (const platform of HAS_NEW_UPDATER) {
    const platformKey = `${platform}_new` as UpdaterAwarePlatform
    const update: UpdateInfo = { modules: {} }
    const meta = await fetch(UPDATE_ENDPOINT.replace('$platform', platform)).then((r) => r.json())
    const host = meta.full.host_version.join('.')

    if (host !== state.host[platformKey]) {
      update.host = host
      state.host[platformKey] = host
    }

    for (const mdl in meta.modules) {
      if (mdl in meta.modules && state.modules[platformKey][mdl] !== meta.modules[mdl].full.module_version) {
        update.modules[mdl] = meta.modules[mdl].full.module_version
        state.modules[platformKey][mdl] = meta.modules[mdl].full.module_version
      }
    }

    res[platform] = update
  }

  return res
}

async function checkLegacyUpdates (): Promise<Partial<PlatformedValue<UpdateInfo>>> {
  const res: Partial<PlatformedValue<UpdateInfo>> = {}
  for (const platform of PLATFORMS) {
    const update: UpdateInfo = { modules: {} }
    const hostMeta = await fetch(LEGACY_HOST_ENDPOINT.replace('$platform', platform)).then((r) => r.json())
    const modulesMeta = await fetch(LEGACY_MODULE_ENDPOINT.replace('$platform', platform).replace('$host', hostMeta.name)).then((r) => r.json())

    if (hostMeta.name !== state.host[platform]) {
      update.host = hostMeta.name
      state.host[platform] = hostMeta.name
    }

    for (const mdl in modulesMeta) {
      if (mdl in modulesMeta && state.modules[platform][mdl] !== modulesMeta[mdl]) {
        update.modules[mdl] = modulesMeta[mdl]
        state.modules[platform][mdl] = modulesMeta[mdl]
      }
    }

    res[platform] = update
  }

  return res
}

export default async function checkAppUpdates (): Promise<AppUpdateInfo> {
  const [ newUpdates, legacyUpdates ] = await Promise.all([ checkNewUpdates(), checkLegacyUpdates() ])
  return {
    new: newUpdates,
    legacy: legacyUpdates,
  }
}

// Don't load this file as a module
export const __skip = true
