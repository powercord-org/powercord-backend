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

import type { UpdaterAwarePlatform, PlatformedValue } from './state.js'
import fetch from 'node-fetch'
import state, { PLATFORMS, PLATFORM_WITH_NEW_UPDATER } from './state.js'

export type UpdateInfo = { host?: { prev: string, next: string }, modules: Record<string, { prev: number, next: number }> }
export type AppUpdateInfo = { new: Partial<PlatformedValue<UpdateInfo>>, legacy: Partial<PlatformedValue<UpdateInfo>> }

const LEGACY_HOST_ENDPOINT = 'https://discord.com/api/updates/canary?platform=$platform'
const LEGACY_MODULE_ENDPOINT = 'https://discord.com/api/modules/canary/versions.json?platform=$platform&host_version=$host'
const UPDATE_ENDPOINT = 'https://discord.com/api/updates/distributions/app/manifests/latest?channel=canary&platform=$platform&arch=x86'

async function checkNewUpdates (): Promise<Partial<PlatformedValue<UpdateInfo>>> {
  const res: Partial<PlatformedValue<UpdateInfo>> = {}
  for (const platform of PLATFORM_WITH_NEW_UPDATER) {
    const update: UpdateInfo = { modules: {} }
    const meta = await fetch(UPDATE_ENDPOINT.replace('$platform', platform)).then((r) => r.json())
    const host = meta.full.host_version.join('.')

    if (host !== state.host[platform]) {
      update.host = {
        prev: state.host[platform],
        next: host,
      }

      state.host[platform] = host
    }

    for (const mdl in meta.modules) {
      if (mdl in meta.modules && state.modules[platform][mdl] !== meta.modules[mdl].full.module_version) {
        update.modules[mdl] = {
          prev: state.modules[platform][mdl],
          next: meta.modules[mdl].full.module_version,
        }

        state.modules[platform][mdl] = meta.modules[mdl].full.module_version
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
    const platformKey = `${platform}_legacy` as UpdaterAwarePlatform

    if (hostMeta.name !== state.host[platformKey]) {
      update.host = {
        prev: state.host[platformKey],
        next: hostMeta.name,
      }

      state.host[platformKey] = hostMeta.name
    }

    for (const mdl in modulesMeta) {
      if (mdl in modulesMeta && state.modules[platformKey][mdl] !== modulesMeta[mdl]) {
        update.modules[mdl] = {
          prev: state.modules[platformKey][mdl],
          next: modulesMeta[mdl],
        }

        state.modules[platformKey][mdl] = modulesMeta[mdl]
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
