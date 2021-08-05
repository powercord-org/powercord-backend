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

import type { Attributes } from 'preact'
import type { MinimalUser } from '@powercord/types/users'
import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { useTitle } from 'hoofd/preact'

import Spinner from './util/Spinner'
import Avatar from './util/Avatar'

import { Endpoints } from '../constants'

import style from './contributors.module.css'

type AllContributors = {
  developers: MinimalUser[]
  staff: MinimalUser[]
  contributors: MinimalUser[]
}

function Contributor ({ user }: { user: MinimalUser }) {
  return (
    <div className={style.container}>
      <Avatar user={user}/>
      <div className={style.name}>
        <h3 className={style.username}>
          {user.username}<span className={style.discriminator} >#{user.discriminator}</span>
        </h3>
      </div>
    </div>
  )
}

export default function Contributors (_: Attributes) {
  useTitle('Contributors')

  const [ contributors, setContributors ] = useState<AllContributors | null>(null)
  useEffect(() => {
    fetch(Endpoints.CONTRIBUTORS)
      .then((r) => r.json())
      .then((c) => setContributors(c))
      .catch((e) => console.error(e))
  }, [])

  if (!contributors) {
    return (
      <main>
        <Spinner/>
      </main>
    )
  }

  return (
    <main>
      <h2 className={style.section}>Developers</h2>
      <div className={style.wrapper}>
        {contributors.developers.map((user) => <Contributor key={user.id} user={user}/>)}
      </div>
      <h2 className={style.section}>Powercord Staff &amp; Support</h2>
      <div className={style.wrapper}>
        {contributors.staff.map((user) => <Contributor key={user.id} user={user}/>)}
      </div>
      <h2 className={style.section}>Contributors</h2>
      <div className={style.wrapper}>
        {contributors.contributors.map((user) => <Contributor key={user.id} user={user}/>)}
      </div>
    </main>
  )
}
