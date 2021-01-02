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

import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'

import { Routes } from '@constants'

import Tooltip from '@components/Tooltip'
import * as Icons from '@components/Icons'

import { formatDate } from '@util'
import { getRandomName, SEVERITY } from '../util'

import style from '@styles/advisories.scss'

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
const TooltipInfo = memo(TooltipInfoComponent)

function Item (props) {
  const random = useMemo(getRandomName, [])
  return (
    <div className={`${style.listItem} ${style[`severity${props.level}`]}`}>
      <Tooltip text={`${SEVERITY[props.level]} severity`} align='left-center'>
        <Icons.ShieldDanger className={style.shield}/>
      </Tooltip>
      <div className={style.details}>
        <Link className={style.listTitle} to={Routes.ADVISORY(props.id)}>{props.title}</Link>
        <div className={style.properties}>
          <div className={style.listId}>{props.id}</div>
          <div>
            <Tooltip text='Target'>
              <Icons.Extension/>
            </Tooltip>
            <span><b>{props.target.name}</b>{props.target.developer && `, by ${props.target.developer}`}</span>
          </div>
          <div>
            <Tooltip text='Affected versions'>
              <Icons.Tag/>
            </Tooltip>
            <span>{props.versions || 'all versions'}</span>
          </div>
          <div>
            <Tooltip text='Advisory publisher'>
              <Icons.Person/>
            </Tooltip>
            <span>
              Published {formatDate(props.date)} by{' '}
              {props.publisher
                ? <Tooltip text={<TooltipInfo publisher={props.publisher}/>}>{props.publisher.name}</Tooltip>
                : `an unknown ${random}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

Item.displayName = 'AdvisoryItem'
export default memo(Item)
