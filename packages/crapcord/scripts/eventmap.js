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
    items.push(`${event[1]}: (data: never) => void`)
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
