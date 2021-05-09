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

import React, { useState, useEffect, useMemo } from 'react'
import { useRouteMatch, Redirect } from 'react-router'

import Sidebar from './Sidebar'
import Spinner from '../Spinner'
import MarkdownDocument from '../MarkdownDocument'

import { Endpoints, Routes } from '../../constants'

import style from '@styles/docs.scss'

const docsCache = {
  categories: null,
  docs: {}
}

function Docs () {
  const { params: { category, document: documentId } } = useRouteMatch()
  const docKey = useMemo(() => `${category}/${documentId}`, [ category, documentId ])
  const [ categories, setCategories ] = useState(docsCache.categories)
  const [ document, setDocument ] = useState(docsCache.docs[docKey])

  const exists = useMemo(
    () => !!categories?.find(c => c.id === category)?.docs?.find(d => d.id === documentId),
    [ categories, category, documentId ]
  )

  useEffect(() => {
    if (!categories) {
      fetch(Endpoints.DOCS_CATEGORIES).then(r => r.json()).then(cats => {
        docsCache.categories = cats
        setCategories(cats)
      })
    }
  }, [])

  useEffect(() => {
    if (exists) {
      if (!docsCache.docs[docKey]) {
        fetch(Endpoints.DOCS_CATEGORIZED(category, documentId)).then(r => r.json()).then(doc => {
          docsCache.docs[docKey] = doc
          setDocument(doc)
        })
      } else {
        setDocument(docsCache.docs[docKey])
      }
    }
  }, [ docKey, categories ])

  if (!categories) {
    return (
      <main>
        <Spinner/>
      </main>
    )
  }

  if (!category) {
    return <Redirect to={Routes.DOCS_ITEM(categories[0].id, categories[0].docs[0].id)}/>
  }

  return (
    <main className={style.container}>
      <Sidebar categories={categories} title={document?.title}/>
      <div className={style.contents}>
        <MarkdownDocument document={docKey}/>
      </div>
    </main>
  )
}

Docs.displayName = 'Documentation'
export default React.memo(Docs)
