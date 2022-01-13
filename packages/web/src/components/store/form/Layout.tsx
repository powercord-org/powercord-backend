/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { Attributes, ComponentChild, VNode } from 'preact'
import type { Eligibility } from '@powercord/types/store'
import { h, cloneElement, Fragment } from 'preact'
import { useState, useContext, useCallback, useMemo, useLayoutEffect } from 'preact/hooks'

import Spinner from '../../util/Spinner'
import MarkdownDocument from '../../docs/Markdown'
import UserContext from '../../UserContext'
import { Endpoints, Routes } from '../../../constants'

import pawaKnockHead from '../../../assets/pawa-knock-head.png'

import style from '../store.module.css'
import sharedStyle from '../../shared.module.css'

type FormProps = { children: VNode<any>[], onNext: () => void, onError: () => void, onLimit: () => void, id: string }
type FormLayoutProps = Attributes & { id: string, title: string, children: VNode[], eligibility?: Eligibility }
type PawaScreenProps = { headline: ComponentChild, text: ComponentChild }

const button = `${sharedStyle.button} ${style.button}`

function Intro ({ id, onNext }: { id: string, onNext: () => void }) {
  const isLoggedIn = Boolean(useContext(UserContext))
  const path = typeof location !== 'undefined' ? location.pathname : ''

  return (
    <MarkdownDocument document={`store/${id}`} notFoundClassName={style.notfound}>
      <h2>Ready?</h2>
      {!isLoggedIn && (
        <p>
          Before you can submit a form, you must be authenticated. This is to prevent spam, and to know who to reach out
          about this submission.
        </p>
      )}

      <p>
        {isLoggedIn
          ? <button className={button} onClick={onNext}>Get started</button>
          // @ts-ignore
          : <a native href={`${Endpoints.LOGIN}?redirect=${path}`} className={button}>Login with Discord</a>}
      </p>
    </MarkdownDocument>
  )
}

function Form ({ children, onNext, onError, onLimit, id }: FormProps) {
  // [Cynthia] this is used to force re-render of form fields, to help with errors sometimes not showing up
  const [ renderKey, setRenderKey ] = useState(0)
  const [ isSubmitting, setSubmitting ] = useState(false)
  const [ errors, setErrorsRaw ] = useState<Record<string, string>>({})
  function setErrors (e: Record<string, string>) {
    setErrorsRaw(e)
    setRenderKey((k) => ++k)
    setSubmitting(false)
  }

  const names = useMemo<string[]>(() => children.map((c) => c.props.name), [ children ])

  const onSubmitHandler = useCallback(async (e: Event) => {
    e.preventDefault()
    setSubmitting(true)
    const form = e.target as HTMLFormElement
    const obj: Record<string, any> = {}
    const err: Record<string, string> = {}

    for (const name of names) {
      const val = form[name].type === 'checkbox' ? form[name].checked : form[name].value
      obj[name] = val

      if (name.startsWith('compliance') && !val) {
        err[name] = 'You must confirm this to continue.'
      }
    }

    if (Object.keys(err).length) {
      setErrors(err)
      return
    }

    const res = await fetch(Endpoints.STORE_FORM(id), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(obj),
    })

    if (res.status >= 500) {
      onError()
      return
    }

    if (res.status === 429) {
      onLimit()
      return
    }

    if (res.status !== 201) {
      const resp = await res.json()
      if (resp.errors) {
        setErrors(resp.errors)
        return
      }
    }

    onNext()
  }, [ onNext ])

  const statefulChildren = useMemo(
    () => children.map((c) => cloneElement(c, { error: errors[c.props.name], rk: renderKey })),
    [ children, errors, renderKey ]
  )

  return (
    <form onSubmit={onSubmitHandler}>
      {statefulChildren}
      <div className={style.note}>Make sure your form is complete and accurate before submitting. Once submitted, you won't be able to edit it!</div>
      <div>
        <button type='submit' className={button} disabled={isSubmitting}>
          {isSubmitting ? <Spinner balls/> : 'Submit'}
        </button>
      </div>
    </form>
  )
}

function PawaScreen ({ headline, text }: PawaScreenProps) {
  return (
    <div className={style.pawaScreen}>
      <img src={pawaKnockHead} alt=''/>
      <hr/>
      <h3>{headline}</h3>
      <p>{text}</p>
    </div>
  )
}

export default function FormLayout ({ id, title, children, eligibility }: FormLayoutProps) {
  const [ stage, setStage ] = useState(0)
  useLayoutEffect(() => {
    document.querySelector('header + div')!.scrollTop = 0
  }, [ stage ])

  if (typeof eligibility !== 'number') {
    return (
      <Spinner/>
    )
  }

  if (eligibility === 1) {
    return <PawaScreen headline='This form is closed for now!' text='We currently have paused submissions, try again later.'/>
  }

  if (eligibility === 2) {
    return (
      <PawaScreen
        headline={'Sorry not sorry, you\'ve been banned'}
        text={<>
          Powercord Staff banned you from submitting this form due to abuse. To appeal the ban, please join
          our <a href={Routes.DICKSWORD} target='_blank' rel='noreferrer'>support server</a>, and ask for help
          in #misc-support.
        </>}
      />
    )
  }

  if (stage === 0) {
    return <Intro id={id} onNext={() => setStage(1)}/>
  }

  let view: VNode
  switch (stage) {
    case 1:
      view = <Form children={children} onNext={() => setStage(2)} onError={() => setStage(3)} onLimit={() => setStage(429)} id={id}/>
      break
    case 2:
      view = <PawaScreen
        headline='Received!'
        text={<>
          The Powercord Staff will give your form the attention it deserves soon.<br/><br/>
          We highly recommend joining the <a href={Routes.DICKSWORD} target='_blank' rel='noreferrer'>Powercord Support server</a> and opening your DMs, so we can contact you directly.
        </>}
      />
      break
    case 3:
      view = <PawaScreen headline='Uh, what happened?' text={'It seems like we\'re unable to process your request at this time. Please try again later!'}/>
      break
    case 429:
      view = <PawaScreen headline='Woah, calm down!' text={'You have too many submissions currently pending review. Wait for the Powercord Staff to review them, and try again.'}/>
      break
    default:
      view = <PawaScreen headline='Hehe, how did you get there cutie?' text={'I\'d happily give you a cookie but I ate them all :3'}/>
      break
  }

  return (
    <main>
      <h1>{title}</h1>
      {view}
    </main>
  )
}
