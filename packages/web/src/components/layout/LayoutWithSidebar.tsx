/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { ComponentChild, Attributes } from 'preact'
import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import Hamburger from '../util/Hamburger'
import style from './layout.module.css'

type LayoutWithSidebarProps = Attributes & {
  sidebarClassName?: string
  contentsClassName?: string
  children: [ ComponentChild, ComponentChild ]
}

export type Document = { id: string, title: string, parts: string[] }
export type Category = { id: string, name: string, docs: Document[] }

function digTitle (preactNode: any): string | null {
  if (preactNode.type === 'h1') {
    return preactNode.props.children
  }

  if (preactNode.__k) {
    for (const node of preactNode.__k) {
      if (!node) continue
      const res = digTitle(node)
      if (res) return res
    }
  }

  return null
}

export default function LayoutWithSidebar ({ sidebarClassName, contentsClassName, children: [ sidebar, content ] }: LayoutWithSidebarProps) {
  const [ opened, setOpened ] = useState(false)
  const [ title, setTitle ] = useState('')

  useEffect(() => {
    let to: number | undefined = void 0
    let i = 0
    function fn () {
      if (i > 10) return setTitle('')
      i++

      if (!(content as any)?.__k) return void (to = setTimeout(fn as TimerHandler, 10))
      const res = digTitle(content)

      if (!res) return void (to = setTimeout(fn as TimerHandler, 10))
      setTitle(res)
    }

    to = setTimeout(fn as TimerHandler, 10)
    return () => clearTimeout(to)
  }, [ content ])

  return (
    <div className={style.container}>
      <div className={[ style.sidebar, opened && style.opened, sidebarClassName ].filter(Boolean).join(' ')}>
        <div className={style.title}>
          <Hamburger opened={opened} setOpened={setOpened} className={style.b}/>
          {title && <span>{title}</span>}
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
