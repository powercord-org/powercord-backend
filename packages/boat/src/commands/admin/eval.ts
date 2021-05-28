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

import type { GuildTextableChannel, Message } from 'eris'
import { builtinModules } from 'module'
import { URL } from 'url'
import { existsSync, readFileSync } from 'fs'
import { inspect } from 'util'
import fetch from 'node-fetch'
import config from '../../config.js'


const SECRETS = [
  config.honks.patreonSecret,
  config.honks.staffChannel,
  config.honks.updootChannel,
  config.discord.clientSecret,
  config.discord.botToken,
  config.spotify.clientSecret,
  config.mango,
  config.secret,
  config.ghToken,
].filter(Boolean)

const BASE_PATH = new URL('../../../', import.meta.url)
const SRC_PATH = new URL('../../', import.meta.url)
const NODE_MODULES = new URL('node_modules/', BASE_PATH)

const BASE_PATH_REGEX = new RegExp(BASE_PATH.href, 'g')
const IMPORT_REGEX = /import(.*? ?from)? ?(['"])(.*?)\2(?:;|\n)/g
const JS_REGEX = /```(?:js|javascript)|```/g
const SECRETS_REGEX = RegExp(SECRETS.join('|'), 'g')

function resolve (mdl: string): string | null {
  let strictNode = false
  if (mdl.startsWith('node:')) {
    strictNode = true
    mdl = mdl.slice(5)
  }

  if (builtinModules.includes(mdl)) return mdl
  if (strictNode) return null

  if (mdl.startsWith('.')) {
    const path = new URL(mdl, SRC_PATH)
    if (!existsSync(path)) return null
    return path.href
  }

  const installedModule = new URL(`${mdl}/`, NODE_MODULES)
  if (!existsSync(installedModule)) return null

  const pkgFile = new URL('package.json', installedModule)
  const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'))
  if (pkg.main) {
    return new URL(pkg.main, installedModule).href
  }

  return null
}

export async function executor (msg: Message<GuildTextableChannel>): Promise<void> {
  if (!msg.member) return // ???
  if (!msg.member.permissions.has('administrator')) {
    msg.channel.createMessage('haha no')
    return
  }

  const script = msg.content.slice(config.discord.prefix.length + 5).replace(JS_REGEX, '').trim()
  if (!script) {
    msg.channel.createMessage('do you expect me to suppose the code you want to run?')
    return
  }

  let imports = ''
  const fn = script.replace(IMPORT_REGEX, (_, what, __, mdl) => {
    const resolved = resolve(mdl)
    if (!resolved) {
      imports += `throw new Error('Cannot resolve module ${mdl}')\n`
      return ''
    }

    imports += `import${what} '${resolved}'\n`
    return ''
  })

  // [Cynthia] The eval is not strictly necessary here, but it allows dropping the need of a return
  const js = `${imports}\nexport default function (msg, bot, mongo, config) {\n return eval(${JSON.stringify(fn)})\n}`
  const blob = Buffer.from(js, 'utf8').toString('base64')
  const fakeMdl = `data:text/javascript;base64,${blob}`

  const m = await msg.channel.createMessage('<a:loading:660094837437104138> Computing...')
  const start = Date.now()
  let lang = 'js'
  let result
  try {
    const { default: runner } = await import(fakeMdl)
    result = await runner(msg, msg._client, msg._client.mongo, config)
  } catch (err) {
    result = err
    lang = ''
  }

  const src = new RegExp(fakeMdl.replace(/([+*?])/g, '\\$1'), 'g')
  result = inspect(result, { depth: 1 })
    .replace(BASE_PATH_REGEX, '[root]/')
    .replace(src, '[eval source]')
    .replace(SECRETS_REGEX, 'haha no')

  const processing = ((Date.now() - start) / 1000).toFixed(2)
  if (result.length > 1900) {
    const res = await fetch('https://haste.powercord.dev/documents', { method: 'POST', body: result }).then((r) => r.json())
    m.edit(`Result too long for Discord: <https://haste.powercord.dev/${res.key}.js>\nTook ${processing} seconds.`)
  } else {
    m.edit(`\`\`\`${lang}\n${result}\n\`\`\`\nTook ${processing} seconds.`)
  }
}
