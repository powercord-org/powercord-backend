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

import { createElement, memo, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Endpoints, Routes } from '@constants'
import Container from './Container'
import Spinner from './Spinner'
import NotFound from './NotFound'
import Prism from './Prism'

import style from '@styles/markdown.scss'

const rules = [
  [ /(\*\*|__)([^*_]+)\1/g, ([ ,, text ]) => (<b>{text}</b>) ],
  [ /([*_])([^*_]+)\1(?:[^*_]|$)/g, ([ ,, text ]) => (<i>{text}</i>) ],
  [ /(~~)([^~]+)\1/g, ([ ,, text ]) => (<del>{text}</del>) ],
  [ /(`)([^`]+)\1/g, ([ ,, text ]) => (<code className={style.inline}>{text}</code>) ],
  [ /!\[([^\]]+)\]\(((?:(?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9-]+\.?)+[^\s<]*)\)/g, ([ , alt, img ]) => (<img src={img} alt={alt}/>) ],
  [ /\[([^\]]+)\]\(((?:(?:##[\w\d-/]+)?#[\w\d-]+|(?:\/|https?:\/\/)[\w\d./?=#%&-]+))\)/g, ([ , label, link ]) => renderLink(link, label) ],
  [ /((?:(?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9-]+\.?)+[^\s<]*[a-z0-9-_&?])/g, ([ , link ]) => renderLink(link, link) ],
  [ /<br\/?>/g, () => <br/> ],
  [ /\\([\\*_-])/g, ([ , escaped ]) => escaped ]
]

function renderLink (link, display) {
  try {
    display = display || link
    const url = new URL(link)
    if (url.host === 'powercord.dev') {
      return <Link to={url.pathname + url.search + url.hash}>{display}</Link>
    }
    if (link.startsWith('##')) {
      const [ cat, doc ] = link.slice(2).split('#')[0].split('/')
      const anchor = link.slice(2).split('#')[1]

      return <Link to={`${Routes.DOCS_ITEM(cat, doc)}#${anchor}`}>{display}</Link>
    }
    if (link.startsWith('#')) {
      return (
        <a href={link}>{display}</a>
      )
    }
    return (
      <a href={link} target='_blank' rel='noreferrer'>{display}</a>
    )
  } catch (e) {
    return link
  }
}

function renderInline (md) {
  const react = []
  const matches = []
  for (const rule of rules) {
    for (const match of md.matchAll(rule[0])) {
      matches.push({
        match: [ ...match ],
        replace: rule[1].call(null, [ ...match ]),
        index: match.index,
        length: match[0].length
      })
    }
  }

  let cursor = 0
  matches.sort((a, b) => a.index > b.index ? 1 : a.index < b.index ? -1 : 0).forEach(m => {
    if (m.index - cursor < 0) return
    react.push(md.substring(cursor, m.index))
    react.push(m.replace)
    cursor = m.index + m.length
  })
  react.push(md.substring(cursor))
  return react.filter(Boolean)
}

function renderListItem (ordered, item) {
  if (typeof item === 'string') {
    return createElement('li', null, renderInline(item))
  } else if (Array.isArray(item)) {
    return createElement(ordered ? 'ol' : 'ul', null, item.map(i => renderListItem(ordered, i)))
  }
  return null
}

// eslint-disable-next-line react/display-name
const Markdown = memo(
  ({ contents }) =>
    contents.map(element => {
      switch (element.type) {
        case 'TITLE':
          return createElement(
            `h${element.depth}`,
            { id: element.content.replace(/[^\w]+/ig, '-').replace(/^-+|-+$/g, '').toLowerCase() },
            renderInline(element.content)
          )
        case 'TEXT':
          return (
            <p>{renderInline(element.content)}</p>
          )
        case 'LIST':
          return createElement(element.ordered ? 'ol' : 'ul', null, element.items.map(i => renderListItem(element.ordered, i)))
        case 'NOTE':
          if (element.quote) {
            return (
              <blockquote>{renderInline(element.content)}</blockquote>
            )
          }
          return createElement('div', { className: `${style.note} ${style[element.color.toLowerCase()]}` }, renderInline(element.content))
        case 'CODEBLOCK':
          return <Prism language={element.lang} code={element.code}/>
        case 'TABLE':
          return (
            <table cellSpacing='0'>
              <thead>
                <tr>
                  {element.thead.map((th, i) =>
                    <th key={`th-${i}`}>{renderInline(th)}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {element.tbody.map((tr, i) => <tr key={`tr-${i}`}>
                  {tr.map((td, i) => <td key={`td-${i}`} style={element.center[i] ? { textAlign: 'center' } : null}>
                    {renderInline(td)}
                  </td>)}
                </tr>)}
              </tbody>
            </table>
          )
      }

      return null
    })
)

const cache = {}
// Bypass cache during dev
const getCache = (d) => process.env.NODE_ENV === 'production' ? cache[d] : null

const MarkdownDocument = ({ document: mdDocument }) => {
  const [ firstLoaded, setFirstLoaded ] = useState(false)
  const [ doc, setDoc ] = useState(getCache(mdDocument))
  const { hash } = useLocation()

  useEffect(() => {
    const cached = getCache(mdDocument)
    if (firstLoaded) setDoc(cached)
    else setFirstLoaded(true)

    if (!cached) {
      fetch(Endpoints.DOCS_DOCUMENT(mdDocument))
        .then(r => r.json())
        .then(d => (cache[mdDocument] = d) | setDoc(d))
        .catch(() => (cache[mdDocument] = false) | setDoc(false))
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
            <Markdown contents={doc.contents}/>
          </div>
          )}
    </Container>
  )
}

MarkdownDocument.displayName = 'MarkdownDocument'
export default memo(MarkdownDocument)
