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

/* Ugly imports, but they do the trick for now */
import type { MarkdownNode } from '../../../api/src/api/docs/spoonfeed/src/types/markdown'
import { MarkdownType } from '../../../api/src/api/docs/spoonfeed/src/types/markdown'
import { flattenToText } from '../../../api/src/api/docs/spoonfeed/src/markdown/util'
import { sluggify } from '../../../api/src/api/docs/spoonfeed/src/util'

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
    case MarkdownType.HEADING:
      return h(`h${node.level}`, { id: sluggify(flattenToText(node) ?? '') }, renderMarkdown(node.content))
    case MarkdownType.PARAGRAPH:
      return h('p', null, renderMarkdown(node.content))
    case MarkdownType.QUOTE:
      return h('blockquote', null, renderMarkdown(node.content))
    case MarkdownType.NOTE:
      return h('div', { className: `${style.note} ${style[node.kind]}`}, renderMarkdown(node.content))
    case MarkdownType.CODE_BLOCK:
      return h(Prism, { language: node.language, code: node.code })
    case MarkdownType.LIST:
      return h(node.ordered ? 'ol' : 'ul', null, renderMarkdown(node.content))
    case MarkdownType.LIST_ITEM:
      return h('li', null, renderMarkdown(node.content))
    case MarkdownType.HTTP:
      return <mark>Http</mark> // todo
    case MarkdownType.TABLE:
      return h('table', null,
        h('thead', null, h('tr', null, node.thead.map((node) => h('th', null, renderMarkdown(node))))),
        // todo: centered stuff
        h('tbody', null, node.tbody.map((nodes) => h('tr', null, nodes.map((node) => h('td', null, renderMarkdown(node))))))
      )
    case MarkdownType.RULER:
      return h('hr')
    case MarkdownType.TEXT:
      return renderMarkdown(node.content)
    case MarkdownType.BOLD:
      return h('b', null, renderMarkdown(node.content))
    case MarkdownType.ITALIC:
      return h('i', null, renderMarkdown(node.content))
    case MarkdownType.UNDERLINE:
      return h('u', null, renderMarkdown(node.content))
    case MarkdownType.STRIKE_THROUGH:
      return h('s', null, renderMarkdown(node.content))
    case MarkdownType.CODE:
      return h('code', { className: style.inline }, renderMarkdown(node.content))
    case MarkdownType.LINK:
      if (node.href.startsWith('https://powercord.dev')) {
        return h(Link, { to: node.href.slice(21) }, renderMarkdown(node.label))
      }
      return h('a', { href: node.href, target: '_blank', rel: 'noreferrer' }, renderMarkdown(node.label))
    case MarkdownType.EMAIL:
      return h('a', { href: `mailto:${node.email}`, target: 'blank' }, node.email)
    case MarkdownType.ANCHOR:
      return h('a', { href: node.href }, renderMarkdown(node.label))
    case MarkdownType.DOCUMENT:
      return h(Link, { to: `${Routes.DOCS_ITEM(node.category!, node.document)}${node.anchor ?? ''}` }, renderMarkdown(node.label))
    case MarkdownType.IMAGE:
      return h('img', { src: node.src, alt: node.alt })
    case MarkdownType.VIDEO:
      if (node.kind === 'youtube') return h('iframe', {
        src: `https://www.youtube.com/embed/${node.src}`,
        allow: 'clipboard-write; encrypted-media; picture-in-picture',
        allowFullScreen: true,
        frameBorder: 0,
      })
      return h('video', { src: node.src })
    case MarkdownType.LINE_BREAK:
      return h('br')
    case MarkdownType.HTTP_METHOD:
      return <mark>HttpMethod</mark> // todo, currently unused
    case MarkdownType.HTTP_PARAM:
      return <mark>HttpParam</mark> // todo, currently unused
  }
  return null
}

function renderMarkdown (item: MarkdownNode | MarkdownNode[] | string): ReactNode | ReactNode[] {
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
        .then(d => setDoc(cache[mdDocument] = d))
        .catch(() => setDoc(cache[mdDocument] = false))
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
