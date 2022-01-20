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

type Update<T> = { prev: T, next: T }
export type UpdateInfo = { host?: Update<string>, modules: Record<string, Update<number>>, dates: { host?: Date, modules?: Date } }
export type AppUpdateInfo = { new: Partial<PlatformedValue<UpdateInfo>>, legacy: Partial<PlatformedValue<UpdateInfo>> }

const LEGACY_HOST_ENDPOINT = 'https://discord.com/api/updates/canary?platform=$platform'
const LEGACY_MODULE_ENDPOINT = 'https://discord.com/api/modules/canary/versions.json?platform=$platform&host_version=$host'
const LEGACY_MODULE_DOWNLOAD = 'https://discord.com/api/modules/canary/$module/$version?platform=$platform&host_version=$host'
const UPDATE_ENDPOINT = 'https://discord.com/api/updates/distributions/app/manifests/latest?channel=canary&platform=$platform&arch=x86'

async function checkNewUpdates (): Promise<Partial<PlatformedValue<UpdateInfo>>> {
  const res: Partial<PlatformedValue<UpdateInfo>> = {}
  for (const platform of PLATFORM_WITH_NEW_UPDATER) {
    const update: UpdateInfo = { modules: {}, dates: {} }
    const meta = await fetch(UPDATE_ENDPOINT.replace('$platform', platform)).then((r) => r.json())
    const host = meta.full.host_version.join('.')

    if (host !== state.host[platform]) {
      const fileInfo = await fetch(meta.full.url, { method: 'HEAD' })
      update.host = {
        next: host,
        prev: state.host[platform],
      }

      update.dates.host = new Date(fileInfo.headers.get('last-modified') ?? Date.now())
      state.host[platform] = host
    }

    for (const mdl in meta.modules) {
      if (mdl in meta.modules && state.modules[platform][mdl] !== meta.modules[mdl].full.module_version) {
        if (!update.dates.modules) {
          const fileInfo = await fetch(meta.modules[mdl].full.url, { method: 'HEAD' })
          update.dates.modules = new Date(fileInfo.headers.get('last-modified') ?? Date.now())
        }

        update.modules[mdl] = {
          next: meta.modules[mdl].full.module_version,
          prev: state.modules[platform][mdl],
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
    const update: UpdateInfo = { modules: {}, dates: {} }
    const hostMeta = await fetch(LEGACY_HOST_ENDPOINT.replace('$platform', platform)).then((r) => r.json())
    const modulesMeta = await fetch(LEGACY_MODULE_ENDPOINT.replace('$platform', platform).replace('$host', hostMeta.name)).then((r) => r.json())
    const platformKey = `${platform}_legacy` as UpdaterAwarePlatform

    if (hostMeta.name !== state.host[platformKey]) {
      update.host = {
        next: hostMeta.name,
        prev: state.host[platformKey],
      }

      update.dates.host = new Date(hostMeta.pub_date)
      state.host[platformKey] = hostMeta.name
    }

    for (const mdl in modulesMeta) {
      if (mdl in modulesMeta && state.modules[platformKey][mdl] !== modulesMeta[mdl]) {
        if (!update.dates.modules) {
          const fileInfo = await fetch(
            LEGACY_MODULE_DOWNLOAD
              .replace('$module', mdl)
              .replace('$version', modulesMeta[mdl])
              .replace('$platform', platform)
              .replace('$host', hostMeta.name),
            { method: 'HEAD' }
          )

          update.dates.modules = new Date(fileInfo.headers.get('last-modified') ?? Date.now())
        }

        update.modules[mdl] = {
          next: modulesMeta[mdl],
          prev: state.modules[platformKey][mdl],
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
