/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { MarkdownNode } from './spoonfeed/src/types/markdown.js'
import { createHash } from 'crypto'
import { MarkdownType } from './spoonfeed/src/types/markdown.js'
import parseMarkup from './spoonfeed/src/markdown/parser.js'
import { flattenToText } from './spoonfeed/src/markdown/util.js'

export type Document = { title: string | null, hash: string, contents: MarkdownNode[] }

export default function (markdown: string): Document {
  const parsed = parseMarkup(markdown)
  const title = flattenToText(parsed.find((node) => node.type === MarkdownType.HEADING && node.level === 1)!)

  return {
    title: title,
    hash: createHash('sha1').update(markdown).digest('base64'),
    contents: parsed.filter((node) => node.type !== MarkdownType.COMMENT && (node.type !== MarkdownType.HEADING || node.level !== 1)),
  }
}
