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

import type { Attributes, ComponentChildren } from 'preact'
import { h, cloneElement, toChildArray } from 'preact'
import { useMemo, useState } from 'preact/hooks'

import style from './tabs.module.css'

type TabProps = Attributes & {
  children: ComponentChildren
}

export default function Tabs ({ children: rawChildren }: TabProps) {
  const [ selected, setSelected ] = useState(null)
  const children = toChildArray(rawChildren)

  const tabs = useMemo(() => {
    const res = []
    for (const child of children) {
      if (typeof child !== 'object') continue
      if (!('data-tab-id' in child.props) || typeof child.props['data-tab-id'] !== 'string') continue
      if (!('data-tab-name' in child.props) || typeof child.props['data-tab-name'] !== 'string') continue
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
