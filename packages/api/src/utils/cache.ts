/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
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
