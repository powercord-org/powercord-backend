/*
 * Copyright (c) 2018-2020 aetheryx & Bowser65
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

const { existsSync, mkdirSync } = require('fs')
const { readFile, writeFile } = require('fs/promises')
const { join } = require('path')
const fetch = require('node-fetch')

const CACHE_PATH = join(__dirname, '../../.cache')
if (!existsSync(CACHE_PATH)) {
  mkdirSync(CACHE_PATH)
}

// todo: Schedule cache cleanup
// just check if the file prefixes aren't new Date().toDateString().toLowerCase().replace(/ /g, '_')

async function remoteFile (url) {
  const current = new Date().toDateString().toLowerCase().replace(/ /g, '_')
  const filename = new URL(url).pathname.split('/').pop()
  const cacheFile = join(CACHE_PATH, `${current}_${filename}`)
  if (existsSync(cacheFile)) {
    return {
      success: true,
      data: await readFile(cacheFile)
    }
  }

  const res = await fetch(url)
  if (res.status !== 200) return { success: false }
  const buffer = await res.buffer()
  await writeFile(cacheFile, buffer)
  return {
    success: true,
    data: buffer
  }
}

async function getOrCompute (key, compute) {
  const current = new Date().toDateString().toLowerCase().replace(/ /g, '_')
  const cacheFile = join(CACHE_PATH, `${current}_${key}.json`)
  if (existsSync(cacheFile)) {
    return require(cacheFile)
  }

  const data = await compute()
  await writeFile(cacheFile, JSON.stringify(data), 'utf-8')
  return data
}

module.exports = {
  remoteFile,
  getOrCompute
}
