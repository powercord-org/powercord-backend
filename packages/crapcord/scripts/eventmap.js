/*
 * Copyright (c) 2022 Cynthia K. Rey, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
  if (event[0] === 'Resumed') {
    items.push('RESUMED: (data: never) => void')
    continue
  }

  if (event[0] === 'MessageUpdate') {
    imports.push('APIMessage,')
    items.push('MESSAGE_UPDATE: (data: CamelCase<APIMessage>) => void')
    items.push('MESSAGE_EMBED_UPDATE: (data: CamelCase<Pick<APIMessage, \'id\' | \'embeds\' | \'channel_id\' | \'guild_id\'>>) => void')
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
