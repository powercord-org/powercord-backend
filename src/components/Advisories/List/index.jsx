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

import Error from '@components/Error'
import Spinner from '@components/Spinner'
import Container from '@components/Container'
import Tooltip from '@components/Tooltip'
import Paginator from '@components/Paginator'
import AdvisoryItem from './Item'

import { Endpoints } from '../../../constants'

import styles from '@styles/advisories.scss'

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

function IntroComponent () {
  return (
    <>
      <h1>Powercord Security Advisories</h1>
      <p>
        This database lists all of the discovered security vulnerabilities and threats discovered in the Powercord
        ecosystem. Advisories can be published by the Powercord Team, or by plugin maintainers.
      </p>
      <p>
        If a plugin has a known high severity vulnerability, Powercord will not load the plugin and alert users. For
        lower severity issues, users will still be warned but will have the choice to load the plugin anyway.
      </p>
    </>
  )
}

IntroComponent.displayName = 'AdvisoriesIntro'
const Intro = React.memo(IntroComponent)

function Advisories () {
  const [ pages, setPages ] = useState({ total: 0, items: {} })
  const [ page, setPage ] = useState(1)
  const list = useMemo(() => pages && pages.items[page], [ pages, page ])

  useEffect(() => {
    if (!pages.items[page]) {
      fetch(Endpoints.ADVISORIES)
        .then(r => r.json())
        .then(data => {
          setPages({
            ...pages,
            total: data.pages,
            items: {
              ...pages.items,
              [page]: data.advisories
            }
          })
        })
        .catch(e => {
          console.error('[Advisories] Failed to load advisories:', e)
          setPages(false)
        })
    }
  }, [ page ])

  if (!pages) {
    return (
      <Container>
        <Intro/>
        <Error message='Failed to load advisories'/>
      </Container>
    )
  }

  return (
    <Container>
      <Intro/>
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

      {pages.total > 1 && <Paginator current={page} total={pages.total} setPage={setPage}/>}
    </Container>
  )
}

Advisories.displayName = 'Advisories'
export default React.memo(Advisories)
