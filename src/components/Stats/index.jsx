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

import React, { useState, useEffect } from 'react'
import Helmet from 'react-helmet'

import Container from '../Container'
import UsersGraph from './UsersGraph'
import { Endpoints } from '../../constants'

import style from '@styles/stats.scss'

const Stats = () => {
  const [ data, setData ] = useState(null)

  useEffect(() => {
    fetch(Endpoints.STATS).then(r => r.json()).then(setData)
  }, [])

  return (
    <Container className={style.container}>
      <Helmet>
        <title>Statistics</title>
      </Helmet>
      <h1>Statistics</h1>
      <p>We love stats. So have stats. It's free. I think.</p>
      <p style={{ display: 'none' }}>it just cost my sanity doing boring maths. - bowoser</p>
      <UsersGraph {...(data ? data.users : {})}/>
      <div className={style.group}>
        <div>
          <h3>Total users</h3>
          <span>{data ? data.users.count : 'Loading...'}</span>
        </div>
        <div>
          <h3>New users last month</h3>
          <span>{data ? data.users.month[49] - data.users.month[0] : 'Loading...'}</span>
        </div>
        <div>
          <h3>New users last week</h3>
          <span>{data ? data.users.week[49] - data.users.week[0] : 'Loading...'}</span>
        </div>
      </div>

      <div className={style.group}>
        <div>
          <h3>Helpers</h3>
          <span>{data ? data.helpers : 'Loading...'}</span>
        </div>
        <div>
          <h3>Published plugins</h3>
          <span>Soon!</span>
        </div>
        <div>
          <h3>Published themes</h3>
          <span>Soon!</span>
        </div>
      </div>
      <p>Helpers include community members who contributed in any way to Powercord: Code contributors,
        translators, bug hunters.</p>
    </Container>
  )
}

Stats.displayName = 'Stats'
export default React.memo(Stats)
