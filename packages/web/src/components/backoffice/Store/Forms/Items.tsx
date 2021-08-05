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

import type { FormHosting, FormPublish, FormVerification, StoreForm } from '@powercord/types/store'
import { h, Fragment } from 'preact'

import style from '../../admin.module.css'

type FormProps<T = StoreForm> = { form: T }

export function PublishForm ({ form }: FormProps<FormPublish>) {
  return (
    <Fragment>
      <div className={style.line2}>
        <div>
          <div className={style.label}>Repository URL</div>
          <div className={style.singleLineText}>
            <a href={form.repoUrl} target='_blank' rel='noreferrer'>{form.repoUrl}</a>
          </div>
        </div>
        <div>
          <div className={style.label}>BetterDiscord Alternative</div>
          <div className={style.singleLineText}>
            {form.bdAlterative
              ? <a href={form.bdAlterative} target='_blank' rel='noreferrer'>{form.bdAlterative}</a>
              : 'N/A'}
          </div>
        </div>
      </div>
      <div>
        <div className={style.label}>Note for reviewers</div>
        <div>{form.reviewNotes || 'N/A'}</div>
      </div>
    </Fragment>
  )
}

export function VerificationForm ({ form }: FormProps<FormVerification>) {
  return (
    <Fragment>
      <div>
        <div className={style.label}>Work URL</div>
        <div className={style.singleLineText}>
          <a href={form.workUrl} target='_blank' rel='noreferrer'>{form.workUrl}</a>
        </div>
      </div>
      <div>
        <div className={style.label}>About the work</div>
        <div>{form.workAbout}</div>
      </div>
      <div>
        <div className={style.label}>About the developer</div>
        <div>{form.developerAbout}</div>
      </div>
      <div>
        <div className={style.label}>Project for the future</div>
        <div>{form.workFuture}</div>
      </div>
      <div>
        <div className={style.label}>Why they want verification</div>
        <div>{form.why}</div>
      </div>
    </Fragment>
  )
}

export function HostingForm ({ form }: FormProps<FormHosting>) {
  return (
    <Fragment>
      <div className={style.line2}>
        <div>
          <div className={style.label}>Repository URL</div>
          <div className={style.singleLineText}>
            <a href={form.repoUrl} target='_blank' rel='noreferrer'>{form.repoUrl}</a>
          </div>
        </div>
        <div>
          <div className={style.label}>Desired subdomain</div>
          <div className={style.singleLineText}>{form.subdomain}</div>
        </div>
      </div>
      <div className={style.line2}>
        <div>
          <div className={style.label}>Purpose</div>
          <div>{form.purpose}</div>
        </div>
        <div>
          <div className={style.label}>Technical details</div>
          <div>{form.technical}</div>
        </div>
      </div>
      <div>
        <div className={style.label}>Note for reviewers</div>
        <div>{form.reviewNotes || 'N/A'}</div>
      </div>
    </Fragment>
  )
}
