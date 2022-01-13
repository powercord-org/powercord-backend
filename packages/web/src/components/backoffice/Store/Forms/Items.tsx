/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
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
