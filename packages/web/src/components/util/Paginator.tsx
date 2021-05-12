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

import { h } from 'preact'

import ArrowHeadBackDouble from 'feather-icons/dist/icons/chevrons-left.svg'
import ArrowHeadBack from 'feather-icons/dist/icons/chevron-left.svg'
import ArrowHeadNext from 'feather-icons/dist/icons/chevron-right.svg'
import ArrowHeadNextDouble from 'feather-icons/dist/icons/chevrons-right.svg'

import style from './paginator.module.css'

type PaginatorProps = {
  current: number
  total: number
  setPage: (page: number) => void
}

export default function Paginator ({ current, total, setPage }: PaginatorProps) {
  const prevLocked = current === 1
  const nextLocked = current === total

  return (
    <div className={style.wrapper}>
      <div className={style.container}>
        <button className={style.button} disabled={prevLocked} onClick={() => setPage(1)}>
          <ArrowHeadBackDouble/>
        </button>
        <button className={style.button} disabled={prevLocked} onClick={() => setPage(current - 1)}>
          <ArrowHeadBack/>
        </button>
        <div className={style.pages}>Page {current} of {total}</div>
        <button className={style.button} disabled={nextLocked} onClick={() => setPage(current + 1)}>
          <ArrowHeadNext/>
        </button>
        <button className={style.button} disabled={nextLocked} onClick={() => setPage(total)}>
          <ArrowHeadNextDouble/>
        </button>
      </div>
    </div>
  )
}
