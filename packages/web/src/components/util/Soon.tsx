/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { Attributes, JSX } from 'preact'
import { h, cloneElement } from 'preact'

import style from './soon.module.css'

export default function Soon (_: any) {
  return (
    <main className={style.container}>
      <img className={style.eyes} src='https://cdn.discordapp.com/emojis/649415462186254362.webp' alt=''/>
      <div className={style.soon}>Coming soon, come back later!</div>
      <div className={style.uwu}>u cute uwu</div>
    </main>
  )
}

export function SoonRoute ({ children, ...props }: Attributes & { children: JSX.Element }) {
  if (import.meta.env.PROD) {
    return <Soon/>
  }

  return cloneElement(children, props)
}
