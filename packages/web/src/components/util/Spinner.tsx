/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import { h } from 'preact'

import style from './spinner.module.css'

type SpinnerProps = { balls?: boolean }

export default function Spinner ({ balls }: SpinnerProps) {
  if (balls) {
    return (
      <div className={style.balls}>
        <div className={style.ball}/>
        <div className={style.ball}/>
        <div className={style.ball}/>
      </div>
    )
  }

  return (
    <div className={style.container}/>
  )
}
