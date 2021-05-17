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

import { URL } from 'url'
import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'

const CANARY_CACHE_FILE = new URL('.canary.cache.json', import.meta.url)
export const PLATFORMS = [ 'win', 'linux', 'osx' ] as const
export const PLATFORM_WITH_NEW_UPDATER = [ 'win' ] as const

export type Platform = typeof PLATFORMS[number]
export type PlatformedValue<TValue> = Record<Platform, TValue>

export type UpdaterAwarePlatform = typeof PLATFORMS[number] | `${typeof PLATFORM_WITH_NEW_UPDATER[number]}_new`
export type UpdaterAwarePlatformedValue<TValue> = Record<UpdaterAwarePlatform, TValue>

export type Treatment = { id: number, label: string, config: Record<string, unknown> | null }
export type Experiment = {
  kind: 'user' | 'guild'
  id: string
  label: string
  defaultConfig: Record<string, unknown> | null
  treatments: Treatment[]
}

export type CanaryCacheState = {
  host: UpdaterAwarePlatformedValue<string>
  modules: UpdaterAwarePlatformedValue<Record<string, number>>
  webapp: string
  experiments: Record<string, Experiment>
  __empty?: true
}

let canaryState: CanaryCacheState
try {
  canaryState = JSON.parse(readFileSync(CANARY_CACHE_FILE, 'utf8'))
} catch {
  canaryState = {
    host: { win_new: '', win: '', linux: '', osx: '' },
    modules: { win_new: {}, win: {}, linux: {}, osx: {} },
    webapp: '',
    experiments: {},
    __empty: true,
  }
}

export default canaryState

export const commitCanaryState = async () => writeFile(CANARY_CACHE_FILE, JSON.stringify(canaryState))

// Don't load this file as a module
export const __skip = true
