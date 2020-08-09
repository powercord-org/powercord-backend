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

import React from 'react'
import Helmet from 'react-helmet'

import { Endpoints } from '../../constants'
import Container from '@components/Container'
import Spinner from '@components/Spinner'
import Contributor from './Contributor'

import style from '@styles/contributors.scss'

const Contributors = () => {
  const [ contributors, setContributors ] = React.useState(null)
  React.useEffect(() => {
    fetch(Endpoints.CONTRIBUTORS)
      .then(r => r.json())
      .then(c => setContributors(c))
      .catch(e => console.error(e))
  }, [])

  if (!contributors) {
    return (
      <Container>
        <Spinner/>
      </Container>
    )
  }

  return (
    <Container>
      <Helmet>
        <title>Contributors</title>
      </Helmet>
      <h2>Developers</h2>
      <div className={style.wrapper}>
        {contributors.developers.map(u => <Contributor key={u._id} {...u}/>)}
      </div>
      <h2>Powercord Staff & Support</h2>
      <div className={style.wrapper}>
        {contributors.staff.map(u => <Contributor key={u._id} {...u}/>)}
      </div>
      <h2>Contributors</h2>
      <div className={style.wrapper}>
        {contributors.contributors.map(u => <Contributor key={u._id} {...u}/>)}
      </div>
    </Container>
  )
}

Contributors.displayName = 'Contributors'
export default React.memo(Contributors)
