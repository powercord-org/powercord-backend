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

import type { Ref } from 'preact'
import type { RestAdminUser } from '@powercord/types/users'
import { h } from 'preact'
import { useCallback, useRef, useState } from 'preact/hooks'

import Modal from '../../util/Modal'
import { CheckboxField, SelectField, TextField } from '../../util/Form'
import { Endpoints } from '../../../constants'

import style from '../admin.module.css'
import sharedStyle from '../../shared.module.css'

type ManageModalProps = { user: RestAdminUser, onClose: () => void }
type EditFormProps = { user: RestAdminUser, formRef: Ref<HTMLFormElement>, changeForm: () => void }

function EditForm ({ user, formRef, changeForm }: EditFormProps) {
  return (
    <form ref={formRef}>
      <div className={style.form2}>
        <CheckboxField
          name='badgeDeveloper'
          label='Developer'
          value={user.badges.developer}
        />
        <CheckboxField
          name='badgeStaff'
          label='Staff'
          value={user.badges.staff}
        />
        <CheckboxField
          name='badgeSupport'
          label='Support'
          value={user.badges.support}
        />
        <CheckboxField
          name='badgeContributor'
          label='Contributor'
          value={user.badges.contributor}
        />
        <CheckboxField
          name='badgeHunter'
          label='Hunter'
          value={user.badges.hunter}
        />
        <CheckboxField
          name='badgeEarly'
          label='Early'
          value={user.badges.early}
        />
        <CheckboxField
          name='badgeTranslator'
          label='Translator'
          value={user.badges.translator}
        />
      </div>
      <SelectField
        name='patronTier'
        label='Donator tier'
        value={String(user.patronTier ?? 0)}
        options={[
          { id: '0', name: 'Not donating' },
          { id: '1', name: '$1 Donator' },
          { id: '2', name: '$5 Donator' },
          { id: '3', name: '$10 Donator' },
        ]}
      />
      <button className={sharedStyle.buttonLink} onClick={changeForm} type='button'>Manage donator perks</button>
    </form>
  )
}

function EditPerks ({ user, formRef, changeForm }: EditFormProps) {
  return (
    <form ref={formRef}>
      <TextField
        name='color'
        label='Badges color'
        note='Defaults to blurple'
        value={user.badges.custom?.color ?? ''}
      />
      <TextField
        name='icon'
        label='Custom Badge'
        value={user.badges.custom?.icon ?? ''}
      />
      <TextField
        name='white'
        label='Custom Badge (white variant)'
        note='Defaults to the classic custom badge'
        value={user.badges.custom?.white ?? ''}
      />
      <TextField
        name='tooltip'
        label='Custom Badge Tooltip'
        value={user.badges.custom?.name ?? ''}
      />
      <button className={sharedStyle.buttonLink} onClick={changeForm} type='button'>Manage user properties</button>
    </form>
  )
}

export function ManageEdit ({ user, onClose }: ManageModalProps) {
  const [ processing, setProcessing ] = useState(false)
  const [ editPerks, setEditPerks ] = useState(false)
  const [ memoizedForm, setMemoizedForm ] = useState<Record<string, unknown>>({})
  const formRef = useRef<HTMLFormElement>()

  function processForm (): Record<string, unknown> {
    return {
      patronTier: Number(formRef.current.patronTier.value),
      'badges.developer': formRef.current.badgeDeveloper.checked,
      'badges.staff': formRef.current.badgeStaff.checked,
      'badges.support': formRef.current.badgeSupport.checked,
      'badges.contributor': formRef.current.badgeContributor.checked,
      'badges.hunter': formRef.current.badgeHunter.checked,
      'badges.early': formRef.current.badgeEarly.checked,
      'badges.translator': formRef.current.badgeTranslator.checked,
    }
  }

  function processPerksForm (): Record<string, unknown> {
    return {
      'badges.custom.color': formRef.current.color.value || null,
      'badges.custom.icon': formRef.current.icon.value || null,
      'badges.custom.white': formRef.current.white.value || null,
      'badges.custom.name': formRef.current.tooltip.value || null,
    }
  }

  const changeForm = useCallback(() => {
    setMemoizedForm(editPerks ? processPerksForm() : processForm())
    setEditPerks(!editPerks)
  }, [ editPerks ])

  const onSave = useCallback(() => {
    if (!formRef.current) return
    setProcessing(true)
    const data = Object.assign({}, editPerks ? processPerksForm() : processForm(), memoizedForm)

    fetch(Endpoints.BACKOFFICE_USER(user.id), {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    }).then(() => onClose())
  }, [ editPerks, memoizedForm ])

  return (
    <Modal title={`Modify user - ${user.username}#${user.discriminator}`} onClose={onClose} onConfirm={onSave} confirmText='Save' processing={processing}>
      {editPerks
        ? <EditPerks user={user} formRef={formRef} changeForm={changeForm}/>
        : <EditForm user={user} formRef={formRef} changeForm={changeForm}/>}
    </Modal>
  )
}

export function ManageModeration ({ user, onClose }: ManageModalProps) {
  const [ processing, setProcessing ] = useState(false)
  const formRef = useRef<HTMLFormElement>()
  const onApply = useCallback(() => {
    if (!formRef.current) return
    setProcessing(true)
    const userbans = {
      publish: formRef.current.publish.checked,
      verification: formRef.current.verification.checked,
      hosting: formRef.current.hosting.checked,
      reporting: formRef.current.reporting.checked,
      sync: formRef.current.sync.checked,
    }

    fetch(Endpoints.BACKOFFICE_USER_BANS(user.id), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(userbans),
    }).then(() => onClose())
  }, [])

  return (
    <Modal title={`User bans - ${user.username}#${user.discriminator}`} onClose={onClose} onConfirm={onApply} confirmText='Apply' processing={processing}>
      <form ref={formRef}>
        <CheckboxField
          name='publish'
          label='Store publish request'
          note='Forbids the user from sending publish requests.'
          value={user.banStatus?.publish}
        />
        <CheckboxField
          name='verification'
          label='Store verification request'
          note='Forbids the user from requesting to get a work verified'
          value={user.banStatus?.verification}
        />
        <CheckboxField
          name='hosting'
          label='Hosting request'
          note='Forbids the user from requesting free hosting for a plugin backend'
          value={user.banStatus?.hosting}
        />
        <CheckboxField
          name='reporting'
          label='Reporting features'
          note='Forbids the user from sending reports of contents in the store'
          value={user.banStatus?.reporting}
        />
        <CheckboxField
          name='sync'
          label='Setting sync'
          note='Forbids the user from using the Settings Sync feature on powercord.dev'
          value={user.banStatus?.sync}
        />
      </form>
    </Modal>
  )
}

export function ManageDelete ({ user, onClose }: ManageModalProps) {
  const [ processing, setProcessing ] = useState(false)
  const formRef = useRef<HTMLFormElement>()
  const onYeet = useCallback(() => {
    setProcessing(true)
    fetch(Endpoints.BACKOFFICE_USER(user.id), { method: 'DELETE' })
      .then(() => {
        if (formRef.current?.ban.checked) {
          fetch(Endpoints.BACKOFFICE_USER_BANS(user.id), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ account: true }),
          }).then(() => onClose())
        } else {
          onClose()
        }
      })
  }, [])

  return (
    <Modal title='Delete an account' onClose={onClose} onConfirm={onYeet} confirmText='Yeet' processing={processing} danger>
      <div>Are you sure you want to delete {user.username}'s account? <b>This action is irreversible</b>!</div>
      <hr/>
      <form ref={formRef}>
        <CheckboxField
          name='ban'
          label='Ban the user as well'
          note='The user will not be able to create a new Powercord account with this Discord account.'
          value={user.banStatus?.account}
        />
      </form>
    </Modal>
  )
}
