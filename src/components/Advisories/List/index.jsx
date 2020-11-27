/*
 * Copyright (c) 2018-2020 aetheryx & Bowser65
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

import React, { useEffect, useMemo, useState } from 'react'

import Spinner from '@components/Spinner'
import Container from '@components/Container'
import Tooltip from '@components/Tooltip'
import Paginator from '@components/Paginator'
import AdvisoryItem from './Item'

import styles from '@styles/advisories.scss'

const fakeAdv = (lvl) => ({
  id: 'PC-2020-001',
  level: lvl,
  title: 'Fake advisory',
  date: '2020-11-13T10:55:32.490Z',
  plugin: {
    name: 'Fake plugin',
    developer: 'Fake developer'
  },
  publisher: {
    name: 'Fake publisher',
    avatar: 'https://cdn.discordapp.com/avatars/94762492923748352/ad72202b231eb0d8404dd0db15a5edd4.png?size=128',
    low: 1 + Math.floor(Math.random() * 5),
    moderate: 1 + Math.floor(Math.random() * 5),
    high: 1 + Math.floor(Math.random() * 5),
    critical: 1 + Math.floor(Math.random() * 5)
  }
})

function ListComponent ({ list }) {
  if (list.length === 0) {
    return <div className={styles.listItem}>Nothing to see here... yet.</div>
  }

  return list.map(item => (
    <AdvisoryItem
      key={item.id}
      {...item}
    />
  ))
}

ListComponent.displayName = 'AdvisoriesList'
const List = React.memo(ListComponent)

function Advisories () {
  const [ totalPages, setTotalPages ] = useState(0)
  const [ pages, sePages ] = useState({})
  const [ page, setPage ] = useState(1)
  const list = useMemo(() => pages[page], [ pages, page ])

  useEffect(() => {
    // todo: http
    setTotalPages(69)
    sePages({
      ...pages,
      [page]: [ fakeAdv(0), fakeAdv(1), fakeAdv(2), fakeAdv(3) ]
    })
  }, [ page ])

  return (
    <Container>
      <h1>Powercord Security Advisories</h1>
      <p>
        This database lists all of the discovered security vulnerabilities and threats discovered in the Powercord
        ecosystem. Advisories can be published by the Powercord Team, or by plugin maintainers.
      </p>
      <p>
        If a plugin has a known high severity vulnerability, Powercord will not load the plugin and alert users. For
        lower severity issues, users will still be warned but will have the choice to load the plugin anyway.
      </p>

      {!list
        ? <Spinner/>
        : (
          <>
            <div className={styles.listHeader}>
              <Tooltip text='Coming soon' align='center'>
                <a href='#'>Report a vulnerability</a>
              </Tooltip>
            </div>
            <List list={list}/>
          </>
        )}

      {totalPages > 1 && <Paginator current={page} total={totalPages} setPage={setPage}/>}
    </Container>
  )
}

Advisories.displayName = 'Advisories'
export default React.memo(Advisories)
