/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
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
