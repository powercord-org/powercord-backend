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
