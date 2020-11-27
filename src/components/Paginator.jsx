/*
 * Copyright (c) 2018-2020 aetheryx & Bowser65
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

import React from 'react'

import * as Icons from '@components/Icons'
import style from '@styles/paginator.scss'

function Paginator ({ current, total, setPage }) {
  const prevLocked = current === 1
  const nextLocked = current === total

  return (
    <div className={style.wrapper}>
      <div className={style.container}>
        <button className={style.button} disabled={prevLocked} onClick={() => setPage(1)}>
          <Icons.ArrowBackDouble/>
        </button>
        <button className={style.button} disabled={prevLocked} onClick={() => setPage(current - 1)}>
          <Icons.ArrowBack/>
        </button>
        <div className={style.pages}>Page {current} of {total}</div>
        <button className={style.button} disabled={nextLocked} onClick={() => setPage(current + 1)}>
          <Icons.ArrowNext/>
        </button>
        <button className={style.button} disabled={nextLocked} onClick={() => setPage(total)}>
          <Icons.ArrowNextDouble/>
        </button>
      </div>
    </div>
  )
}

Paginator.displayName = 'Paginator'
export default React.memo(Paginator)
