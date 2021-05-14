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

import type { ComponentChild, Attributes } from 'preact'
import { h } from 'preact'
import { useState } from 'preact/hooks'

import Hamburger from './Hamburger'
import style from './layout.module.css'

type LayoutWithSidebarProps = Attributes & {
  title: string
  sidebarClassName?: string
  contentsClassName?: string
  children: [ ComponentChild, ComponentChild ]
}

export type Document = { id: string, title: string, parts: string[] }
export type Category = { id: string, name: string, docs: Document[] }

export default function LayoutWithSidebar ({ title, sidebarClassName, contentsClassName, children: [ sidebar, content ] }: LayoutWithSidebarProps) {
  const [ opened, setOpened ] = useState(false)

  return (
    <div className={style.container}>
      <div className={[ style.sidebar, opened && style.opened, sidebarClassName ].filter(Boolean).join(' ')}>
        <div className={style.title}>
          <Hamburger opened={opened} setOpened={setOpened} className={style.b}/>
          <span>{title}</span>
        </div>
        <div className={style.inner}>
          {sidebar}
        </div>
      </div>
      <div className={`${style.contents}${contentsClassName ? ` ${contentsClassName}` : ''}`}>
        {content}
      </div>
    </div>
  )
}
