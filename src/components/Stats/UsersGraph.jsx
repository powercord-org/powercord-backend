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

import React, { useState, useMemo } from 'react'

import style from '@styles/stats.scss'

const ViewMode = Object.freeze({
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  ALL_TIME: 'ALL_TIME'
})

function computeSvg (points) {
  const dots = []
  const line = []
  let side = []
  if (points) {
    const lowestValue = Math.min.apply(Math, points)
    const highestValue = Math.max.apply(Math, points)
    const maximum = highestValue - lowestValue
    points.forEach((point, i) => {
      const relativePoint = point - lowestValue
      const percentage = relativePoint * 100 / maximum
      line.push(`${i * 10 + 25},${100 - percentage}`)
      dots.push(
        <circle cx={i * 10 + 25} cy={100 - percentage} r={2} fill='#7289da'/>
      )
      console.log(percentage)
    })

    side = [
      Math.round(lowestValue),
      Math.round(lowestValue + maximum * 0.2),
      Math.round(lowestValue + maximum * 0.4),
      Math.round(lowestValue + maximum * 0.6),
      Math.round(lowestValue + maximum * 0.8),
      Math.round(lowestValue + maximum)
    ].reverse()
  }

  return [ dots, line.join(' '), side ]
}

const UsersGraph = ({ allTime, month, week }) => { // todo: render dates at the bottom
  const [ mode, setMode ] = useState(ViewMode.ALL_TIME)

  // SVG computing moment
  const [ dots, line, side ] = useMemo(
    () => computeSvg(mode === ViewMode.WEEK ? week : mode === ViewMode.MONTH ? month : allTime),
    [ allTime, month, week, mode ]
  )

  // Rendering moment
  return (
    <section className={style.graph}>
      <header>
        <div>Registered Powercord accounts</div>
        <button
          className={mode === ViewMode.ALL_TIME && style.selected}
          onClick={() => setMode(ViewMode.ALL_TIME)}
        >
          All time
        </button>
        <button
          className={mode === ViewMode.MONTH && style.selected}
          onClick={() => setMode(ViewMode.MONTH)}
        >
          Last month
        </button>
        <button
          className={mode === ViewMode.WEEK && style.selected}
          onClick={() => setMode(ViewMode.WEEK)}
        >
          Last week
        </button>
      </header>
      <div className={style.inner}>
        <svg viewBox='0 0 525 100'>
          {side.map((s, i) => ([
            <text key='t' x={20} y={2 + 20 * i} textAnchor='end' fontSize={6.5} fill='#707070'>{s}</text>,
            <line x1={25} x2={525} y1={20 * i} y2={20 * i} stroke-width='.4' stroke='#454545'/>
          ]))}
          <polyline fill='none' stroke='#7289da' stroke-width='1' points={line}/>
          {dots}
        </svg>
      </div>
    </section>
  )
}

UsersGraph.displayName = 'UsersGraph'
export default React.memo(UsersGraph)
