/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { Attributes } from 'preact'
import { h, Fragment } from 'preact'
import { useState, useEffect, useMemo } from 'preact/hooks'
import { Link } from 'preact-router/match'

import Markdown from './Markdown'
import Spinner from '../util/Spinner'
import Redirect from '../util/Redirect'
import LayoutWithSidebar from '../util/LayoutWithSidebar'

import { Endpoints, Routes } from '../../constants'

import style from './documentation.module.css'

type DocProps = { categoryId?: string, documentId?: string } & Attributes
type SidebarProps = { categories: Category[] }
export type Document = { id: string, title: string, parts: string[] }
export type Category = { id: string, name: string, docs: Document[] }

function Sidebar ({ categories }: SidebarProps) {
  return <>
    <h1>Powercord Docs</h1>
    {categories.map((category) => (
      <Fragment key={category.id}>
        {category.id !== 'intro' && <h3>{category.name}</h3>}
        {category.docs.map((doc) => (
          <Link
            class={style.item}
            activeClassName={style.active}
            href={Routes.DOCS_ITEM(category.id, doc.id)}
            key={`${category.id}-${doc.id}`}
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
    return <Redirect to={Routes.DOCS_ITEM(categories[0].id, categories[0].docs[0].id)}/>
  }

  if (!documentId) {
    return <Redirect to={Routes.DOCS_ITEM(categoryId!, category.docs[0].id)}/>
  }

  return (
    <LayoutWithSidebar contentsClassName={style.contents}>
      <Sidebar categories={categories}/>
      <Fragment>
        <Markdown document={docKey} notFoundClassName={style.notfound}/>
        <div className={style.footer}>
          <hr/>
          <p>
            Want to add something? Fix a typo? You can contribute to the documentation on <a href={Routes.DOCS_GITHUB} target='_blank' rel='noreferrer'>GitHub</a>.
            Licensed under <a href='https://creativecommons.org/licenses/by-nd/4.0/' target='_blank' rel='noreferrer'>CC BY-ND 4.0</a>.
          </p>
        </div>
      </Fragment>
    </LayoutWithSidebar>
  )
}
