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

import type { MarkdownNode } from './spoonfeed/src/types/markdown.js'
import { MarkdownType } from './spoonfeed/src/types/markdown.js'
import parseMarkup from './spoonfeed/src/markdown/parser.js'
import { flattenToText } from './spoonfeed/src/markdown/util.js'

export type Document = { title: string | null, contents: MarkdownNode[] }

export default function (markdown: string): Document {
  const parsed = parseMarkup(markdown)
  const title = flattenToText(parsed.find((node) => node.type === MarkdownType.HEADING && node.level === 1)!)

  return {
    title: title,
    contents: parsed.filter((node) => node.type !== MarkdownType.COMMENT && (node.type !== MarkdownType.HEADING || node.level !== 1)),
  }
}
