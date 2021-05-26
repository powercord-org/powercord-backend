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

import type { Attributes, ComponentChildren } from 'preact'
import { h } from 'preact'
import { useState, useContext, useCallback } from 'preact/hooks'

import Spinner from '../util/Spinner'
import MarkdownDocument from '../docs/Markdown'
import UserContext from '../UserContext'
import { Endpoints } from '../../constants'

import pawaKnockHead from '../../assets/pawa-knock-head.png'

import style from './store.module.css'
import sharedStyle from '../shared.module.css'

type FormLayoutProps = Attributes & { id: string, title: string, children: ComponentChildren }
type PawaScreenProps = { headline: string, text: string }

function Intro ({ id, onNext }: { id: string, onNext: () => void }) {
  const isLoggedIn = Boolean(useContext(UserContext))
  const path = typeof location !== 'undefined' ? location.pathname : '/'

  return (
    <MarkdownDocument document={`store/${id}`}>
      <h2>Ready?</h2>
      {!isLoggedIn && (
        <p>
          Before you can submit a form, you must be authenticated. This is to prevent spam, and to know who to reach out
          about this submission.
        </p>
      )}

      <p>
        {isLoggedIn
          ? <button className={sharedStyle.button} onClick={onNext}>Get started</button>
          // @ts-ignore
          : <a native href={`${Endpoints.LOGIN}?redirect=${path}`} className={sharedStyle.button}>Login with Discord</a>}
      </p>
    </MarkdownDocument>
  )
}

function Form ({ children, onNext }: { children: ComponentChildren, onNext: () => void }) {
  const [ isSubmitting, setSubmitting ] = useState(false)
  const onSubmit = useCallback((e: Event) => {
    e.preventDefault()
    setSubmitting(true)
    const data = new FormData(e.target as HTMLFormElement)
    console.log(data)
    onNext()
  }, [ onNext ])

  return (
    <form onSubmit={onSubmit}>
      <input type='text' name='a'/>
      <input type='checkbox' name='b'/>
      OWO {children}
      <div>
        <button type='submit' className={sharedStyle.button}>
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

export default function FormLayout ({ id, title, children }: FormLayoutProps) {
  const [ stage, setStage ] = useState(0)

  if (stage === 0) {
    return <Intro id={id} onNext={() => setStage(1)}/>
  }

  return (
    <main>
      <h1>{title}</h1>
      {stage === 1
        ? <Form children={children} onNext={() => setStage(2)}/>
        : stage === 2
          ? <PawaScreen headline='Received!' text='Powercord Staff will give your form the attention it deserves soon.'/>
          : <PawaScreen headline='Hehe, how did you get there cutie?' text={'I\'d happily give you a cookie but I ate them all :3'}/>}
    </main>
  )
}
