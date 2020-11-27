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
import { Link } from 'react-router-dom'

import { Routes } from '../../../constants'
import Tooltip from '@components/Tooltip'
import * as Icons from '@components/Icons'

import style from '@styles/advisories.scss'

const Time = Object.freeze({
  SECOND: 1e3,
  MINUTE: 60e3,
  HOUR: 3600e3,
  DAY: 86400e3,
  WEEK: 86400e3 * 7,
  MONTH: 86400e3 * 30,
  YEAR: 86400e3 * 365
})

const TIME_UNITS = Object.freeze(Object.keys(Time))

const Severity = Object.freeze([ 'Low', 'Medium', 'High', 'Critical' ])

const pluralify = (c, w) => c === 1 ? w : `${w}s`
// Doesn't account for real month duration nor leap years, screw this
function formatDate (date) {
  const ms = new Date(date).getTime()
  const elapsed = Date.now() - ms
  if (elapsed <= 0) return 'just now'
  for (let i = 1; i < TIME_UNITS.length; i++) {
    if (elapsed < Time[TIME_UNITS[i]]) {
      const label = TIME_UNITS[i - 1].toLowerCase()
      const delta = Math.floor(elapsed / Time[TIME_UNITS[i - 1]])
      return `${delta} ${pluralify(delta, label)} ago`
    }
  }

  const delta = Math.floor(elapsed / Time.YEAR)
  return `${delta} ${pluralify(delta, 'year')} ago`
}

function TooltipInfoComponent ({ publisher }) {
  return (
    <div className={style.tooltip}>
      <img src={publisher.avatar}/>
      <div className={style.details}>
        <span className={style.name}>{publisher.name}</span>
        <div className={style.found}>
          <div className={`${style.foundKind} ${style.severity0}`}>
            <Icons.ShieldDanger className={style.shield}/> {publisher.low}
          </div>
          <div className={`${style.foundKind} ${style.severity1}`}>
            <Icons.ShieldDanger className={style.shield}/> {publisher.moderate}
          </div>
          <div className={`${style.foundKind} ${style.severity2}`}>
            <Icons.ShieldDanger className={style.shield}/> {publisher.high}
          </div>
          <div className={`${style.foundKind} ${style.severity3}`}>
            <Icons.ShieldDanger className={style.shield}/> {publisher.critical}
          </div>
        </div>
      </div>
    </div>
  )
}

TooltipInfoComponent.displayName = 'AdvisoryTooltipInfo'
const TooltipInfo = React.memo(TooltipInfoComponent)

function Item (props) {
  return (
    <div className={`${style.listItem} ${style[`severity${props.level}`]}`}>
      <Tooltip text={`${Severity[props.level]} severity`} align='left-center'>
        <Icons.ShieldDanger className={style.shield}/>
      </Tooltip>
      <div className={style.details}>
        <Link className={style.title} to={Routes.ADVISORY(props.id)}>{props.title}</Link>
        <div className={style.properties}>
          <div>{props.id}</div>
          <div>
            <Tooltip text='Vulnerable item'>
              <Icons.Extension/>
            </Tooltip>
            <span><b>{props.plugin.name}</b>{props.plugin.developer && `, by ${props.plugin.developer}`}</span>
          </div>
          <div>
            <Tooltip text='Vulnerable versions'>
              <Icons.Tag/>
            </Tooltip>
            <span>{props.version || 'all versions'}</span>
          </div>
          <div>
            <Tooltip text='Advisory publisher'>
              <Icons.Person/>
            </Tooltip>
            <span>
              Published {formatDate(props.date)}{' '}
              by <Tooltip text={<TooltipInfo publisher={props.publisher}/>}>{props.publisher.name}</Tooltip>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

Item.displayName = 'AdvisoryItem'
export default React.memo(Item)
