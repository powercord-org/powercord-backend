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
import { useEffect } from 'preact/hooks'
import { createPortal } from 'preact/compat'

import Spinner from './Spinner'

import X from 'feather-icons/dist/icons/x.svg'

import style from './modal.module.css'
import sharedStyle from '../shared.module.css'

type ModalProps = Attributes & {
  title: string
  children: ComponentChildren
  closeText?: string
  confirmText?: string
  onClose: () => void
  onConfirm?: () => void
  processing?: boolean
  danger?: boolean
}

export default function Modal (props: ModalProps) {
  useEffect(() => {
    // todo: a11y
  }, [])

  const btnStyle = `${sharedStyle.button}${props.danger ? ` ${style.danger}` : ''}`
  return createPortal(
    <div className={style.overlay} onClick={props.onClose}>
      <div className={style.container} onClick={(e) => e.stopPropagation()}>
        <header className={style.header}>
          <span className={style.title}>{props.title}</span>
          <X className={style.close} onClick={props.onClose}/>
        </header>
        <div className={style.inner}>{props.children}</div>
        {props.onConfirm && <footer className={style.footer}>
          <button className={sharedStyle.buttonLink} onClick={props.onClose}>
            {props.closeText ? props.closeText : 'Cancel'}
          </button>
          <button className={btnStyle} onClick={props.onConfirm} disabled={props.processing}>
            {props.processing ? <Spinner balls/> : props.confirmText ? props.confirmText : 'Confirm'}
          </button>
        </footer>}
      </div>
    </div>,
    document.body
  )
}
