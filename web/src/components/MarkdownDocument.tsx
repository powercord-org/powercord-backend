/*
 * Copyright (c) 2021 Borkenware, All rights reserved.
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

import type { MarkdownNode, MarkdownItem } from '../../../api/src/api/docs/spoonfeed/src/markdown/types'
import { MarkdownType } from '../../../api/src/api/docs/spoonfeed/src/markdown/types'
import { flattenToText } from '../../../api/src/api/docs/spoonfeed/src/markdown/util'
import { sluggify } from '../../../api/src/api/docs/spoonfeed/src/util'

/*
  Extracted from spoonfeed

  Heading = 'heading',
  Paragraph = 'paragraph',
  Quote = 'quote',
  Note = 'note',
  CodeBlock = 'code-block',
  List = 'list',
  ListItem = 'list-item',
  Http = 'http',
  Table = 'table',
  Ruler = 'ruler',

  // Inline
  Text = 'text',
  Bold = 'bold',
  Italic = 'italic',
  Underline = 'underline',
  StrikeThrough = 'strike-through',
  Code = 'code',
  Link = 'link',
  Email = 'email',
  Anchor = 'anchor',
  Document = 'document',
  Image = 'image',
  Video = 'video',

  // Specifics
  LineBreak = 'line-break',
  HttpMethod = 'http-method',
  HttpParam = 'http-param'
*/

import type { ReactNode } from 'react'
import { createElement as h, memo, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Endpoints, Routes } from '@constants'

// @ts-expect-error
import Container from './Container' // @ts-expect-error
import Spinner from './Spinner' // @ts-expect-error
import NotFound from './NotFound' // @ts-expect-error
import Prism from './Prism' // @ts-expect-error
import style from '@styles/markdown.scss'

type Document = { title: string, parts: string[], contents: MarkdownNode[] }

function renderMarkdownNode (node: MarkdownNode) {
  switch (node.type) {
    case MarkdownType.Heading:
      return h(`h${node.level}`, { id: sluggify(flattenToText(node) ?? '') }, renderMarkdown(node.content))
    case MarkdownType.Paragraph:
      return h('p', null, renderMarkdown(node.content))
    case MarkdownType.Quote:
      return h('blockquote', null, renderMarkdown(node.content))
    case MarkdownType.Note:
      return h('div', { className: `${style.note} ${style[node.kind]}`}, renderMarkdown(node.content))
    case MarkdownType.CodeBlock:
      return h(Prism, { language: node.language, code: node.content })
    case MarkdownType.List:
      return h(node.ordered ? 'ol' : 'ul', null, renderMarkdown(node.content))
    case MarkdownType.ListItem:
      return h('li', null, renderMarkdown(node.content))
    case MarkdownType.Http:
      return <mark>Http</mark> // todo
    case MarkdownType.Table:
      return h('table', null,
        h('thead', null, h('tr', null, node.thead.map((node) => h('th', null, renderMarkdown(node))))),
        // todo: centered stuff
        h('tbody', null, node.tbody.map((nodes) => h('tr', null, nodes.map((node) => h('td', null, renderMarkdown(node))))))
      )
    case MarkdownType.Ruler:
      return h('hr')
    case MarkdownType.Text:
      return renderMarkdown(node.content)
    case MarkdownType.Bold:
      return h('b', null, renderMarkdown(node.content))
    case MarkdownType.Italic:
      return h('i', null, renderMarkdown(node.content))
    case MarkdownType.Underline:
      return h('u', null, renderMarkdown(node.content))
    case MarkdownType.StrikeThrough:
      return h('s', null, renderMarkdown(node.content))
    case MarkdownType.Code:
      return h('code', { className: style.inline }, renderMarkdown(node.content))
    case MarkdownType.Link:
      if (node.href.startsWith('https://powercord.dev')) {
        return h(Link, { to: node.href.slice(21) }, renderMarkdown(node.label))
      }
      return h('a', { href: node.href, target: '_blank', rel: 'noreferrer' }, renderMarkdown(node.label))
    case MarkdownType.Email:
      return h('a', { href: `mailto:${node.content}`, target: 'blank' }, node.content)
    case MarkdownType.Anchor:
      return h('a', { href: node.anchor }, renderMarkdown(node.label))
    case MarkdownType.Document:
      return h(Link, { to: `${Routes.DOCS_ITEM(node.category!, node.document)}${node.anchor ? `#${node.anchor}` : ''}` }, renderMarkdown(node.label))
    case MarkdownType.Image:
      return h('img', { src: node.src, alt: node.alt })
    case MarkdownType.Video:
      if (node.kind === 'youtube') return h('iframe', {
        src: `https://www.youtube.com/embed/${node.src}`,
        allow: 'clipboard-write; encrypted-media; picture-in-picture',
        allowFullScreen: true,
        frameBorder: 0,
      })
      return h('video', { src: node.src })
    case MarkdownType.LineBreak:
      return h('br')
    case MarkdownType.HttpMethod:
      return <mark>HttpMethod</mark> // todo
    case MarkdownType.HttpParam:
      return <mark>HttpParam</mark> // todo
  }
  return null
}

function renderMarkdown (item: MarkdownItem): ReactNode | ReactNode[] {
  if (typeof item === 'string') return item.replace(/\\([*-_~])/, '$1')
  if (Array.isArray(item)) return item.map(renderMarkdownNode)
  return renderMarkdownNode(item)
}

const cache: Record<string, Document | false> = {}
const getCache = (d: string) => process.env.NODE_ENV === 'production' ? cache[d] : null // Bypass cache during dev

const MarkdownDocument = ({ document: mdDocument }: { document: string }) => {
  const [ firstLoaded, setFirstLoaded ] = useState(false)
  const [ doc, setDoc ] = useState(getCache(mdDocument))
  const { hash } = useLocation()

  useEffect(() => {
    const cached = getCache(mdDocument)
    if (firstLoaded) {
      setDoc(cached)
     } else {
       setFirstLoaded(true)
     }

    if (!cached) {
      fetch(Endpoints.DOCS_DOCUMENT(mdDocument))
        .then(r => r.json())
        .then(d => {
          cache[mdDocument] = d
          setDoc(d)
        })
        .catch(() => {
          cache[mdDocument] = false
          setDoc(false)
        })
    }
  }, [ mdDocument ])

  useEffect(() => {
    if (doc && hash) {
      const element = document.querySelector(hash)
      if (element) {
        setTimeout(() => element.scrollIntoView(), 10)
        return void 0
      }
    }
  }, [ doc, hash ])

  if (doc === false) {
    return <NotFound/>
  }

  return (
    <Container>
      {!doc
        ? <Spinner/>
        : (
          <div className={style.markdown}>
            <h1>{doc.title}</h1>
            {renderMarkdown(doc.contents)}
          </div>
          )}
    </Container>
  )
}

MarkdownDocument.displayName = 'MarkdownDocument'
export default memo(MarkdownDocument)
