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

import type { RoutableProps } from 'preact-router'
import { h } from 'preact'
import { useTitle } from 'hoofd/preact'

import { Routes } from '../constants'

import pawa404 from '../assets/pawa-404.png'

import style from './notfound.module.css'

type NotFoundProps = { ctx?: Record<string, any> } & RoutableProps

export default function NotFound ({ ctx }: NotFoundProps) {
  if (import.meta.env.SSR && ctx) ctx.notFound = true

  useTitle('404')

  return (
    <main className={style.container}>
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
