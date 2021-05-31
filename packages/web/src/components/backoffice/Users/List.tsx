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
import type { RestAdminUser } from '@powercord/types/users'
import { h } from 'preact'
import { useState, useEffect, useReducer } from 'preact/hooks'

import Paginator from '../../util/Paginator'
import Spinner from '../../util/Spinner'
import { Endpoints } from '../../../constants'

type UserStore = { [page: number]: RestAdminUser[] }
type UserStoreAction = { users: RestAdminUser[], page: number }
type ApiResponse = { data: RestAdminUser[], pages: number }

function userReducer (state: UserStore, action: UserStoreAction): UserStore {
  return { ...state, [action.page]: action.users }
}

function UserRow ({ user }: { user: RestAdminUser }) {
  return <p>{user.username}</p>
}

export default function List (_: Attributes) {
  const [ page, setPage ] = useState(1)
  const [ pages, setPages ] = useState(0)
  const [ usersStore, pushUsers ] = useReducer(userReducer, {})
  const users = usersStore[page]

  useEffect(() => {
    fetch(`${Endpoints.BACKOFFICE_USERS}?page=${page}`)
      .then((r) => r.json())
      .then((u: ApiResponse) => {
        pushUsers({ users: u.data, page: page })
        if (!pages) setPages(u.pages)
      })
  }, [ page ])

  console.log(users)

  return (
    <main>
      <h1>Manage users</h1>
      {users
        ? users.map((u) => <UserRow key={u.id} user={u}/>)
        : <Spinner/>}
      {pages > 1 && <Paginator current={page} total={pages} setPage={setPage}/>}
    </main>
  )
}
