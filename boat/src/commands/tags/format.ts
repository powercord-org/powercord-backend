type TagString = { type: 'string', value: string }
type TagArgument = { type: 'argument', name: string, description: string, default?: string }
export type TagChunk = TagString | TagArgument

const TAG_REGEX = /#\[([a-z0-9-_]*?):(.*?)(?:(?<!\\)((?:\\{2})*):(.*?))?]/g
const ESC_REGEX = /\\([\\:])/g

export function parse (tag: string): TagChunk[] {
  const res: TagChunk[] = []
  let cursor = 0
  let optionalConsumed = false
  let remove: [ number, number ] | null = null
  function extractString (start: number, end?: number) {
    const str = tag.slice(start, end)
    if (remove) {
      const rmStart = remove[0] - start
      const rmEnd = rmStart + remove[1]
      remove = null
      return str.slice(0, rmStart) + str.slice(rmEnd)
    }

    return str
  }

  for (const arg of tag.matchAll(TAG_REGEX)) {
    const { index, 0: match, 1: name, 2: desc, 3: esc, 4: def } = arg
    if (typeof index !== 'number') continue

    if (optionalConsumed && !def) {
      // todo: does discord truly forbid this?
      if (optionalConsumed) throw new Error('Cannot have a required argument after an optional argument')
      optionalConsumed = true
    }

    // Escaped tag
    if (index > 0) {
      let escaped = 0
      while (tag[index - ++escaped] === '\\');
      if (escaped > 1) remove = [ (index - escaped) + 1, Math.floor(escaped / 2) ]

      if (escaped % 2 === 0) continue
      res.push({ type: 'string', value: extractString(cursor, index) })
    }

    res.push({
      type: 'argument',
      name: name,
      description: desc.replace(ESC_REGEX, '$1') + (esc ? esc.slice(esc.length / 2) : ''),
      default: def,
    })

    optionalConsumed = Boolean(def)
    cursor = index + match.length
  }

  const end = extractString(cursor)
  if (end) res.push({ type: 'string', value: end })

  return res
}

export function format (chunks: TagChunk[], options: Record<string, string>) {
  return chunks
    .map((chunk) => chunk.type === 'string' ? chunk.value : options[chunk.name] ?? chunk.default ?? '[???]')
    .join('')
}
