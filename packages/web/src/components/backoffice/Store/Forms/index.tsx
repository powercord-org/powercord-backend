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
import type { StoreForm } from '@powercord/types/store'
import { h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'

import Tooltip from '../../../util/Tooltip'
import Spinner from '../../../util/Spinner'
import { PublishForm, VerificationForm, HostingForm } from './Items'
import { Endpoints } from '../../../../constants'

import ExternalLink from 'feather-icons/dist/icons/external-link.svg'
import Check from 'feather-icons/dist/icons/check.svg'
import X from 'feather-icons/dist/icons/x.svg'

import style from '../../admin.module.css'
import sharedStyle from '../../../shared.module.css'

type FormProps = {
  form: StoreForm
  canViewDiscussions: boolean
}

function ReviewButtons ({ form, canViewDiscussions }: FormProps) {
  return (
    <div className={sharedStyle.buttons}>
      <Tooltip text={'Can\'t connect to Powercord'} disabled={canViewDiscussions}>
        <button className={sharedStyle.button} disabled={!canViewDiscussions}>
          <ExternalLink className={style.icon}/>
          <span>View discussion</span>
        </button>
      </Tooltip>
      {form.reviewed
        ? <div className={style.alignCenter}>
          {form.approved ? <Check className={style.icon}/> : <X className={style.icon}/>}
          <span>{form.approved ? 'Approved' : 'Rejected'} by {form.reviewer.username}#{form.reviewer.discriminator}</span>
        </div>
        : <Fragment>
          <button className={`${sharedStyle.button} ${sharedStyle.green}`}>
            <Check className={style.icon}/>
            <span>Accept</span>
          </button>
          <button className={`${sharedStyle.button} ${sharedStyle.red}`}>
            <X className={style.icon}/>
            <span>Reject</span>
          </button>
        </Fragment>}
    </div>
  )
}

function Form ({ form, canViewDiscussions }: FormProps) {
  let body = null
  switch (form.kind) {
    case 'publish':
      body = <PublishForm form={form}/>
      break
    case 'verification':
      body = <VerificationForm form={form}/>
      break
    case 'hosting':
      body = <HostingForm form={form}/>
      break
  }

  return (
    <section className={style.section}>
      <header className={style.sectionHeader}>
        <span className={style.sectionTitle}>{form.kind[0].toUpperCase()}{form.kind.slice(1)} form</span>
        <span className={style.sectionSubtitle}>Submitted by {form.submitter.username}#{form.submitter.discriminator}</span>
      </header>
      <div className={style.sectionBody}>
        {body}
        <hr className={style.sectionSeparator}/>
        <ReviewButtons form={form} canViewDiscussions={canViewDiscussions}/>
      </div>
      <footer className={style.sectionFooter}>
        Form ID: {form.id}
      </footer>
    </section>
  )
}

export default function ManageForms (_: Attributes) {
  const [ forms, setForms ] = useState<StoreForm[] | null>(null)
  useEffect(() => {
    fetch(Endpoints.BACKOFFICE_FORMS)
      .then((r) => r.json())
      .then((f) => setForms(f))
  }, [])

  return (
    <main>
      <h1 className={style.title}>Submitted forms</h1>

      {forms
        ? !forms.length
          ? <p>All clear!</p>
          : forms.map((f) => <Form key={f.id} form={f} canViewDiscussions={false}/>)
        : <Spinner/>}
    </main>
  )
}
