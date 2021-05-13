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

import type { Category } from './Documentation'
import { h, Fragment } from 'preact'
import { useState, useCallback, useEffect, useRef } from 'preact/hooks'
import { Link } from 'preact-router/match'

import { Routes } from '../../constants'
import style from './documentation.module.css'

type SidebarProps = { categories: Category[], title?: string }

export default function Sidebar ({ categories, title }: SidebarProps) {
  const [ opened, setOpened ] = useState(false)

  const sidebarRef = useRef<HTMLDivElement>()
  const toggle = useCallback(() => setOpened(!opened), [ opened ])
  useEffect(() => {
    if (opened && sidebarRef.current) {
      sidebarRef.current.addEventListener('click', toggle)
      return () => sidebarRef.current.removeEventListener('click', toggle)
    }
  }, [ opened, sidebarRef.current ])

  return (
    <div className={[ style.sidebar, opened && style.opened ].filter(Boolean).join(' ')} ref={sidebarRef}>
      <div className={style.title}>
        <div className={style.burgerking} onClick={toggle}>
          <span/>
          <span/>
          <span/>
        </div>
        <span>{title || 'Loading...'}</span>
      </div>
      <div className={style.inner}>
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
      </div>
    </div>
  )
}
