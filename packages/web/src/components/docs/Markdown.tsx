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

import type { ComponentChildren, Attributes } from 'preact'
import type { MarkdownNode } from '@borkenware/spoonfeed/src/types/markdown'

import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { useTitle } from 'hoofd/preact'
import { MarkdownType } from '@borkenware/spoonfeed/src/types/markdown'
import { flattenToText } from '@borkenware/spoonfeed/src/markdown/util'

import Spinner from '../util/Spinner'
import NotFound from '../NotFound'
import Prism from './Prism'

import { Endpoints, Routes } from '../../constants'

import style from './markdown.module.css'

type Document = { title: string, parts: string[], contents: MarkdownNode[] }
type MarkdownProps = Attributes & { document: string, notFoundClassName?: string, children?: ComponentChildren }

function sluggify (string: string): string {
  return string.replace(/(^\d+-|\.(md|markdown)$)/ig, '')
    .replace(/[^a-z]+/ig, '-')
    .replace(/(^-+|-+$)/ig, '')
    .toLowerCase()
}

function renderMarkdown (item: MarkdownNode | MarkdownNode[] | string): ComponentChildren {
  if (typeof item === 'string') return item.replace(/\\([*-_~])/, '$1')
  // eslint-disable-next-line @typescript-eslint/no-use-before-define -- Recursive calls
  if (Array.isArray(item)) return item.map(renderMarkdownNode)
  // eslint-disable-next-line @typescript-eslint/no-use-before-define -- Recursive calls
  return renderMarkdownNode(item)
}

function renderMarkdownNode (node: MarkdownNode) {
  switch (node.type) {
    case MarkdownType.HEADING:
      return h(`h${node.level}`, { id: sluggify(flattenToText(node) ?? '') }, renderMarkdown(node.content))
    case MarkdownType.PARAGRAPH:
      return h('p', null, renderMarkdown(node.content))
    case MarkdownType.QUOTE:
      return h('blockquote', null, renderMarkdown(node.content))
    case MarkdownType.NOTE:
      return h('div', { className: `${style.note} ${style[node.kind]}` }, renderMarkdown(node.content))
    case MarkdownType.CODE_BLOCK:
      return h(Prism, { language: node.language, code: node.code })
    case MarkdownType.LIST:
      return h(node.ordered ? 'ol' : 'ul', null, renderMarkdown(node.content))
    case MarkdownType.LIST_ITEM:
      return h('li', null, renderMarkdown(node.content))
    case MarkdownType.HTTP:
      return <mark>Http</mark> // todo
    case MarkdownType.TABLE:
      return h(
        'table',
        null,
        h('thead', null, h('tr', null, node.thead.map((n) => h('th', null, renderMarkdown(n))))),
        // todo: centered stuff
        h('tbody', null, node.tbody.map((nodes) => h('tr', null, nodes.map((n) => h('td', null, renderMarkdown(n))))))
      )
    case MarkdownType.RULER:
      return h('hr', null)
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
        return h('a', { href: node.href.slice(21), native: node.href.startsWith('https://powercord.dev/link/') }, renderMarkdown(node.label))
      }
      return h('a', { href: node.href, target: '_blank', rel: 'noreferrer' }, renderMarkdown(node.label))
    case MarkdownType.EMAIL:
      return h('a', { href: `mailto:${node.email}`, target: 'blank' }, node.email)
    case MarkdownType.ANCHOR:
      return h('a', { href: node.href }, renderMarkdown(node.label))
    case MarkdownType.DOCUMENT:
      return h('a', { href: `${Routes.DOCS_ITEM(node.category!, node.document)}${node.anchor ?? ''}` }, renderMarkdown(node.label))
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
      return h('br', null)
    case MarkdownType.HTTP_METHOD:
      return <mark>HttpMethod</mark> // todo, currently unused
    case MarkdownType.HTTP_PARAM:
      return <mark>HttpParam</mark> // todo, currently unused
  }

  return null
}

const cache: Record<string, Document | false> = {}
const getCache = (d: string) => import.meta.env.PROD ? cache[d] : null // Bypass cache during dev

export default function MarkdownDocument ({ document: mdDocument, notFoundClassName, children }: MarkdownProps) {
  const [ firstLoaded, setFirstLoaded ] = useState(false)
  const [ doc, setDoc ] = useState(getCache(mdDocument))
  useTitle(doc === null ? 'Powercord' : doc ? doc.title : '', doc === null)

  useEffect(() => {
    const cached = getCache(mdDocument)
    if (firstLoaded) {
      setDoc(cached)
    } else {
      setFirstLoaded(true)
    }

    if (!cached) {
      fetch(Endpoints.DOCS_DOCUMENT(mdDocument))
        .then((r) => r.json())
        .then((d) => setDoc(cache[mdDocument] = d))
        .catch(() => setDoc(cache[mdDocument] = false))
    }
  }, [ mdDocument ])

  useEffect(() => {
    if (doc && window.location.hash) {
      const element = document.querySelector(window.location.hash)
      if (element) {
        setTimeout(() => element.scrollIntoView(), 10)
        return
      }
    }
  }, [ doc, typeof window !== 'undefined' ? window.location.hash : null ])

  if (doc === false) {
    return (
      <NotFound className={notFoundClassName}/>
    )
  }

  if (!doc) {
    return (
      <main>
        <Spinner/>
      </main>
    )
  }

  return (
    <main className={style.markdown}>
      <h1>{doc.title}</h1>
      {renderMarkdown(doc.contents)}
      {children}
    </main>
  )
}
