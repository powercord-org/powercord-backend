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

import { readFile, writeFile } from 'fs/promises'

const typesFile = new URL('../node_modules/discord-api-types/gateway/v9.d.ts', import.meta.url)
const types = await readFile(typesFile, 'utf8')

const enumRegex = /enum GatewayDispatchEvents {((?:.|\r|\n)*?)}/
const enumType = types.match(enumRegex)[1]

const events = []
const eventRegex = /([A-Z].*?) = "(.*?)"/g
for (const match of enumType.matchAll(eventRegex)) events.push([ match[1], match[2] ])

const SEP = '\n  '
const imports = []
const items = []

for (const event of events) {
  if (event[0] === 'InteractionCreate') {
    continue
  }

  if (event[0] === 'Resumed') {
    items.push('RESUMED: (data: never) => void')
    continue
  }

  if (event[0] === 'MessageUpdate') {
    imports.push('APIMessage,')
    items.push(`MESSAGE_UPDATE: (data: CamelCase<APIMessage>) => void`)
    items.push(`MESSAGE_EMBED_UPDATE: (data: CamelCase<Pick<APIMessage, 'id' | 'embeds' | 'channel_id' | 'guild_id'>>) => void`)
    continue
  }

  imports.push(`Gateway${event[0]}DispatchData,`)
  items.push(`${event[1]}: (data: CamelCase<Gateway${event[0]}DispatchData>) => void`)
}

const code = `// Automatically generated on ${new Date().toUTCString()}

import type {
  ${imports.join(SEP)}
} from 'discord-api-types'
import type { CamelCase } from './case.js'

type EventMap = {
  ${items.join(SEP)}
}

export default EventMap
`

const outFile = new URL('../src/util/eventmap.ts', import.meta.url)
await writeFile(outFile, code)
console.log('Generated event map')
