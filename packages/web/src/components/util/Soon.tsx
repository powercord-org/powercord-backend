/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { Attributes, JSX } from 'preact'
import { h, cloneElement } from 'preact'

import style from './soon.module.css'

export default function Soon (_: any) {
  return (
    <main className={style.container}>
      <img className={style.eyes} src='https://discord.com/assets/ccf4c733929efd9762ab02cd65175377.svg' alt=''/>
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
