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

import type { Attributes } from 'preact'
import { h, Fragment } from 'preact'
import { useState, useEffect, useMemo } from 'preact/hooks'
import { route } from 'preact-router'
import { Link } from 'preact-router/match'

import Markdown from './Markdown'
import Spinner from '../util/Spinner'
import LayoutWithSidebar from '../util/LayoutWithSidebar'

import { Endpoints, Routes } from '../../constants'

import style from './documentation.module.css'

type DocProps = { categoryId?: string, documentId?: string } & Attributes
type SidebarProps = { categories: Category[] }
export type Document = { id: string, title: string, parts: string[] }
export type Category = { id: string, name: string, docs: Document[] }

function Sidebar ({ categories }: SidebarProps) {
  return <>
    {categories.map((category) => (
      <Fragment key={category.id}>
        <h3 className={style.categoryName}>{category.name}</h3>
        {category.docs.map((doc) => (
          <Link
            key={`${category.id}-${doc.id}`}
            href={Routes.DOCS_ITEM(category.id, doc.id)}
            className={style.item}
            activeClassName={style.active}
          >
            {doc.title}
          </Link>
        ))}
      </Fragment>
    ))}
  </>
}

let cache: Category[] | null = null
export default function Documentation ({ categoryId, documentId }: DocProps) {
  const docKey = useMemo(() => `${categoryId}/${documentId}`, [ categoryId, documentId ])
  const [ categories, setCategories ] = useState(cache)
  const category = useMemo(() => categories?.find((c) => c.id === categoryId), [ categories, categoryId ])
  const doc = useMemo(() => category?.docs.find((d) => d.id === documentId), [ categories, category, documentId ])

  useEffect(() => {
    if (!categories) {
      fetch(Endpoints.DOCS_CATEGORIES)
        .then((r) => r.json())
        .then((cats) => setCategories(cache = cats))
    }
  }, [])

  if (!categories) {
    return (
      <main>
        <Spinner/>
      </main>
    )
  }

  if (!category) {
    route(Routes.DOCS_ITEM(categories[0].id, categories[0].docs[0].id))
    return null
  }

  if (!documentId) {
    route(Routes.DOCS_ITEM(categoryId!, category.docs[0].id))
    return null
  }

  return (
    <LayoutWithSidebar title={doc?.title || 'Loading...'}>
      <Sidebar categories={categories}/>
      <Markdown document={docKey}/>
    </LayoutWithSidebar>
  )
}
