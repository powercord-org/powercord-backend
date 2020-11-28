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

import { memo, useEffect, useState, useMemo } from 'react'
import { Link, useRouteMatch } from 'react-router-dom'

import { Endpoints, Routes } from '@constants'
import Container from '@components/Container'
import Spinner from '@components/Spinner'
import Error from '@components/Error'
import NotFound from '@components/NotFound'
import { getRandomName, SEVERITY } from './util'

import style from '@styles/advisories.scss'

const States = Object.freeze({
  LOADING: 'LOADING',
  LOADED: 'LOADED',
  NOT_FOUND: 'NOT_FOUND',
  ERROR: 'ERROR'
})

function Advisory () {
  const { params: { id: advisoryId } } = useRouteMatch()
  const [ state, setState ] = useState(States.LOADING)
  const [ advisory, setAdvisory ] = useState(null)

  const random = useMemo(getRandomName, [])
  useEffect(() => {
    fetch(Endpoints.ADVISORY(advisoryId))
      .then(r => r.json())
      .then(data => {
        if (data.error === 404) {
          return setState(States.NOT_FOUND)
        }
        setAdvisory(data)
        setState(States.LOADED)
      })
      .catch(e => {
        console.error(`[Advisory] Failed to load advisory ${advisoryId}:`, e)
        setState(States.ERROR)
      })
  }, [ advisoryId ])

  if (state === States.LOADING) {
    return (
      <Container>
        <Spinner/>
      </Container>
    )
  }

  if (state === States.ERROR) {
    return (
      <Container>
        <Error message={`Failed to load advisory ${advisoryId}`}/>
      </Container>
    )
  }

  if (state === States.NOT_FOUND) {
    return <NotFound/>
  }

  return (
    <Container>
      <span className={style.id}>
        <Link to={Routes.ADVISORIES}>Powercord Security Advisories</Link> / {advisory.id}
      </span>
      <h1 className={style.title}>{advisory.title}</h1>
      <div className={style.subTitle}>
        <span className={style[`severity${advisory.level}`]}>{SEVERITY[advisory.level]} severity</span>{' - '}
        Published by {advisory.publisher || `an unknown ${random}`}
      </div>
      <h2>Vulnerability scope</h2>
      <ul>
        <li><b>Target:</b> {advisory.target.name}</li>
        <li><b>Developer:</b> {advisory.target.developer}</li>
        <li><b>Vulnerability:</b> {advisory.vulnerability}</li>
        <li><b>Versions:</b> {advisory.versions || 'all versions'}</li>
      </ul>
      <h2>Description</h2>
      <p>{advisory.description}</p>
      <h2>Resolution</h2>
      <p>{advisory.resolution}</p>
    </Container>
  )
}

Advisory.displayName = 'Advisory'
export default memo(Advisory)
