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
import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'

import Spinner from '../../../util/Spinner'
import { PublishForm, VerificationForm, HostingForm } from './Items'
import { Endpoints } from '../../../../constants'

import Check from 'feather-icons/dist/icons/check.svg'
import X from 'feather-icons/dist/icons/x.svg'

import style from '../../admin.module.css'
import sharedStyle from '../../../shared.module.css'

type FormProps<T = StoreForm> = { form: T }

// @ts-expect-error
function ReviewFields ({ form }: FormProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  return (
    <div className={style.line2}>
      <div>
        <div className={style.label}>Reviews</div>
        <ul className={style.reviews}>
          <li className={style.review}>
            <Check className={`${style.icon} ${style.green}`}/>
            <span>OwO#0000</span>
            <span>No remarks</span>
          </li>
          <li className={style.review}>
            <X className={`${style.icon} ${style.red}`}/>
            <span>UwU#0000</span>
            <span>No remarks</span>
          </li>
        </ul>
      </div>
      <div>
        <div className={style.label}>Actions</div>
        <ul className={style.actions}>
          <li>
            <button className={sharedStyle.buttonLink}>Submit a review</button>
          </li>
          <li>
            <button className={sharedStyle.buttonLink}>Approve the request</button>
          </li>
          <li>
            <button className={sharedStyle.buttonLink}>Deny the request</button>
          </li>
        </ul>
      </div>
    </div>
  )
}

function Form ({ form }: FormProps) {
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
        <ReviewFields form={form}/>
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
          : forms.map((f) => <Form key={f.id} form={f}/>)
        : <Spinner/>}
    </main>
  )
}
