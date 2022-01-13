/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { Attributes } from 'preact'
import { h } from 'preact'
import { useTitle } from 'hoofd/preact'

import { Routes } from '../constants'

import pawa404 from '../assets/pawa-404.png'

import style from './notfound.module.css'

type NotFoundProps = Attributes & { ctx?: Record<string, any>, className?: string }

export default function NotFound ({ ctx, className }: NotFoundProps) {
  if (import.meta.env.SSR && ctx) ctx.notFound = true

  useTitle('404')

  return (
    <main className={`${style.container}${className ? ` ${className}` : ''}`}>
      <h1>Seems like you're lost...</h1>
      <p>Pawa looked far and wide, but couldn't find what you're looking for... Maybe she can bring you back home?</p>
      <p>
        <a href={Routes.HOME}>Go back home</a>
      </p>
      <div className={style.pawa}>
        <img src={pawa404} alt=''/>
      </div>
    </main>
  )
}
