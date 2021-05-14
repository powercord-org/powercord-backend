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
import { tmpdir } from 'os'
import { existsSync, mkdirSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { basename } from 'path'
import fetch from 'node-fetch'

export type CacheResult = { success: false } | { success: true, data: Buffer }

const CACHE_PATH = new URL(`${tmpdir()}/powercord/`, 'file:')
if (!existsSync(CACHE_PATH)) mkdirSync(CACHE_PATH)

function generateKey (hourly?: boolean) {
  const today = new Date()
  return `${hourly ? 'h-' : 'd-'}${hourly ? today.getUTCHours() : ''}${today.getUTCDate()}${today.getUTCMonth()}${today.getUTCFullYear()}`
}

export async function remoteFile (url: URL): Promise<CacheResult> {
  const current = new Date().toDateString().toLowerCase().replace(/ /g, '_')
  const filename = basename(url.pathname)
  const cacheFile = new URL(`./${current}_${filename}`, CACHE_PATH)
  if (existsSync(cacheFile)) {
    return {
      success: true,
      data: await readFile(cacheFile),
    }
  }

  const res = await fetch(url)
  if (res.status !== 200) return { success: false }
  const buffer = await res.buffer()
  await writeFile(cacheFile, buffer)
  return {
    success: true,
    data: buffer,
  }
}

export async function getOrCompute<T = unknown> (key: string, compute: () => Promise<T> | T, hourly?: boolean): Promise<T> {
  const dateKey = generateKey(hourly)
  const cacheFile = new URL(`./${dateKey}_${key}.json`, CACHE_PATH)
  if (existsSync(cacheFile)) {
    const blob = await readFile(cacheFile, 'utf8')
    return JSON.parse(blob)
  }

  const data = await compute()
  await writeFile(cacheFile, JSON.stringify(data), 'utf8')
  return data
}
