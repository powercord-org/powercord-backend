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
import { useState, useEffect, useReducer, useCallback, useRef } from 'preact/hooks'

import Spinner from '../../util/Spinner'
import Tooltip from '../../util/Tooltip'
import Paginator from '../../util/Paginator'
import Modal from '../../util/Modal'
import { TextField } from '../../util/Form'
import { ManageEdit, ManageModeration, ManageDelete } from './Modals'
import { Endpoints } from '../../../constants'

import Edit from 'feather-icons/dist/icons/edit.svg'
import Shield from 'feather-icons/dist/icons/shield.svg'
import Trash from 'feather-icons/dist/icons/trash-2.svg'

import style from '../admin.module.css'
import sharedStyle from '../../shared.module.css'

type UserStore = { [page: number]: RestAdminUser[] }
type UserStoreAction = { users: RestAdminUser[], page: number }
type ApiResponse = { data: RestAdminUser[], pages: number }
type ModalState = { kind: 'edit' | 'mod' | 'delete', user: RestAdminUser } | { kind: 'id' }

const Status = { IDLE: 0, PROCESSING: 1, NOT_FOUND: 2, FOUND: 3 }

function userReducer (state: UserStore, action: UserStoreAction): UserStore {
  return { ...state, [action.page]: action.users }
}

function EditById ({ onClose }: { onClose: () => void }) {
  const [ status, setStatus ] = useState(Status.IDLE)
  const [ user, setUser ] = useState<RestAdminUser | null>(null)
  const formRef = useRef<HTMLFormElement>()

  const doEditById = useCallback((e?: Event) => {
    if (e) e.preventDefault()

    if (!formRef.current.userId.value) return
    setStatus(Status.PROCESSING)
    fetch(Endpoints.BACKOFFICE_USER(formRef.current.userId.value))
      .then((r) => {
        if (r.status !== 200) return setStatus(Status.NOT_FOUND)
        r.json().then((u) => {
          setUser(u)
        })
      })
  }, [])

  useEffect(() => void formRef.current.querySelector('input')?.focus(), [])

  if (user) {
    return <ManageEdit user={user} onClose={onClose}/>
  }

  return (
    <Modal title='Edit a user by ID' onConfirm={doEditById} onClose={onClose} confirmText='Edit' processing={status === Status.PROCESSING}>
      <form className={style.loneForm} ref={formRef} onSubmit={doEditById}>
        <TextField
          label='User ID'
          name='userId'
          error={status === Status.NOT_FOUND ? 'This user cannot be found.' : void 0}
        />
      </form>
    </Modal>
  )
}

function UserAvatar ({ user }: { user: RestAdminUser }) {
  const avatar = user.avatar
    ? Endpoints.USER_AVATAR_DISCORD(user.id, user.avatar)
    : Endpoints.DEFAULT_AVATAR_DISCORD(Number(user.discriminator))

  const [ effectiveAvatar, setAvatar ] = useState(avatar)
  const onError = useCallback(() => setAvatar(Endpoints.DEFAULT_AVATAR_DISCORD(Number(user.discriminator))), [])

  return <img src={effectiveAvatar} alt={`${user.username}'s avatar`} onError={onError} className={style.avatar}/>
}

function UserRow ({ user, setModal }: { user: RestAdminUser, setModal: (s: ModalState) => void }) {
  const bans = user.banStatus
    ? Object.entries(user.banStatus)
      .filter(([ , isBanned ]) => isBanned)
      .map(([ key ]) => key)
    : []

  const editUser = useCallback(() => setModal({ kind: 'edit', user: user }), [ user, setModal ])
  const moderateUser = useCallback(() => setModal({ kind: 'mod', user: user }), [ user, setModal ])
  const deleteUser = useCallback(() => setModal({ kind: 'delete', user: user }), [ user, setModal ])

  return (
    <div className={style.row}>
      <UserAvatar user={user}/>
      <div className={style.rowInfo}>
        <span>{user.username}#{user.discriminator}</span>
        <span className={bans.length ? style.red : ''}>
          {bans.length ? `Active bans: ${bans.join(', ')}` : 'No active bans'}
        </span>
      </div>
      <div className={style.rowActions}>
        <Tooltip text='Edit user'>
          <button className={style.action} onClick={editUser}>
            <Edit/>
          </button>
        </Tooltip>
        <Tooltip text='Manage user bans'>
          <button className={style.action} onClick={moderateUser}>
            <Shield/>
          </button>
        </Tooltip>
        <Tooltip text='Delete user account'>
          <button className={style.action} onClick={deleteUser}>
            <Trash className={style.red}/>
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default function List (_: Attributes) {
  const [ page, setPage ] = useState(1)
  const [ pages, setPages ] = useState(0)
  const [ usersStore, pushUsers ] = useReducer(userReducer, {})
  const [ modal, setModal ] = useState<ModalState | null>(null)
  const editById = useCallback(() => setModal({ kind: 'id' }), [ setModal ])
  const users = usersStore[page]

  const fetchUserPage = useCallback(() => {
    fetch(`${Endpoints.BACKOFFICE_USERS}?page=${page}`)
      .then((r) => r.json())
      .then((u: ApiResponse) => {
        pushUsers({ users: u.data, page: page })
        if (!pages) setPages(u.pages)
      })
  }, [ page ])

  useEffect(fetchUserPage, [ page ])
  const onModalClose = useCallback(() => {
    setModal(null)
    fetchUserPage()
  }, [])

  return (
    <main>
      <h1>Manage users</h1>
      <div className={style.toolbar}>
        <button className={sharedStyle.button} onClick={editById}>Edit a user by ID</button>
      </div>
      {users ? users.map((u) => <UserRow key={u.id} user={u} setModal={setModal}/>) : <Spinner/>}
      {pages > 1 && <Paginator current={page} total={pages} setPage={setPage}/>}

      {modal?.kind === 'id' && <EditById onClose={onModalClose}/>}
      {modal?.kind === 'edit' && <ManageEdit user={modal.user} onClose={onModalClose}/>}
      {modal?.kind === 'mod' && <ManageModeration user={modal.user} onClose={onModalClose}/>}
      {modal?.kind === 'delete' && <ManageDelete user={modal.user} onClose={onModalClose}/>}
    </main>
  )
}
