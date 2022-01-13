/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { Attributes, ComponentChildren } from 'preact'
import { h, cloneElement, toChildArray } from 'preact'
import { useMemo, useState } from 'preact/hooks'

import style from './tabs.module.css'

type TabProps = Attributes & {
  children: ComponentChildren
}

export default function Tabs ({ children: rawChildren }: TabProps) {
  const [ selected, setSelected ] = useState<string | null>(null)
  const children = toChildArray(rawChildren)

  const tabs = useMemo(() => {
    const res = []
    for (const child of children) {
      if (typeof child !== 'object') continue
      // @ts-ignore -- todo
      if (!('data-tab-id' in child.props) || typeof child.props['data-tab-id'] !== 'string') continue
      // @ts-ignore -- todo
      if (!('data-tab-name' in child.props) || typeof child.props['data-tab-name'] !== 'string') continue
      // @ts-ignore -- todo
      res.push({ id: child.props['data-tab-id'], name: child.props['data-tab-name'], element: child })
    }

    return res
  }, [ rawChildren ])

  return (
    <div className={style.container}>
      <div className={style.tabBar} role='tabbar'>
        {tabs.map(({ id, name }, i) => (
          <div
            role='tab'
            aria-controls={`${id}-tab`}
            aria-selected={(!selected && i === 0) || (id === selected)}
            onClick={() => setSelected(id)}
            className={style.tab}
          >
            {name}
          </div>
        ))}
      </div>
      {tabs.map(({ id, element }, i) => cloneElement(element, {
        id: `${id}-tab`,
        role: 'tabpanel',
        'aria-hidden': (selected || i !== 0) && (id !== selected),
      }))}
    </div>
  )
}
