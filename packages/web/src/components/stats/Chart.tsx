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

import type { Point, Chart, StatsAll, StatsDay } from './useStats'
import { h } from 'preact'
import { useState, useRef, useEffect, useMemo } from 'preact/hooks'

import style from './stats.module.css'

type Legend = Record<string, string>

type LegendProps = { legend: Legend, dataset: Chart }
type ChartSideProps = { width: number, height: number, dataset: Chart }
type ChartBottomProps = {
  reduced: boolean
  mode: string
  width: number
  height: number
}
type ChartDatasetProps = {
  reduced: boolean
  width: number
  height: number
  dataset: Chart
}
type ChartLineProps = {
  reduced: boolean
  width: number
  height: number
  set: string
  color: string
  points: Point[]
}
type ChartProps = {
  title: string
  legend?: Legend
  dataset: StatsDay | StatsAll | false
  modes: Array<{ name: string, key: string }>
  defaultMode?: string
}

const HEIGHT_RATIO = 270 / 1210
const POWERCORD_EPOCH = 1546732800000
const SHOWN_DATES = 7
const MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec' ]

function ChartLegend ({ legend, dataset: { dataset } }: LegendProps) {
  return (
    <div className={style.legend}>
      {Object.entries(legend).map(([ key, value ]) => (
        <div className={style.legendEntry} key={key}>
          <svg xmlns='http://www.w3.org/2000/svg' width={16} height={8} viewBox='0 0 16 8'>
            <line x1={0} x2={16} y1={4} y2={4} stroke-width='2' stroke={dataset[key].color}/>
            <circle cx={8} cy={4} r={4} fill={dataset[key].color}/>
          </svg>
          <span>{value}</span>
        </div>
      ))}
    </div>
  )
}

function ChartSide ({ width, height, dataset }: ChartSideProps) {
  const topMargin = 15
  const delta = (height - topMargin - 35) / 4
  const linesDelta = dataset.max - dataset.min
  const lines = [
    dataset.min + linesDelta,
    dataset.min + (linesDelta / 4 * 3),
    dataset.min + (linesDelta / 4 * 2),
    dataset.min + (linesDelta / 4),
    dataset.min
  ].map(a => Math.round(a))

  return (
    <g>
      {lines.map((l, i) => (
        <g key={`${l}-${i}`}>
          <text className={style.gridText} x={40} y={4 + topMargin + (delta * i)} text-anchor='end'>{l}</text>
          <line className={style.gridLine} x1={50} x2={width - 10} y1={topMargin + (delta * i)} y2={topMargin + (delta * i)}/>
        </g>
      ))}
    </g>
  )
}

function ChartBottom ({ reduced, mode, width, height }: ChartBottomProps) {
  const now = Date.now()
  const baseHeight = height - 35
  const delta = (width - 50) / SHOWN_DATES
  const dates = useMemo(() => {
    const res = []
    let addHour = false
    let addYear = false
    let delta
    switch (mode) {
      case 'day':
        addHour = true
        delta = (24 * 3600e3) / SHOWN_DATES
        break
      case 'week':
        delta = (24 * 7 * 3600e3) / SHOWN_DATES
        break
      case 'month':
        addYear = true
        delta = (24 * 30 * 3600e3) / SHOWN_DATES
        break
      default: // all time
        addYear = true
        delta = (now - POWERCORD_EPOCH) / SHOWN_DATES
        break
    }

    for (let i = 0; i < SHOWN_DATES; i++) {
      const target = new Date(now - (delta * (i + 0.5)))
      let str = `${MONTHS[target.getMonth()]} ${target.getDate()}`
      if (addYear) str += `, ${target.getFullYear()}`
      if (addHour) {
        let hours = target.getHours()
        let minutes = Math.round(target.getMinutes() / 30) * 30
        if (minutes === 60) {
          hours++
          minutes = 0
        }
        str += ` ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      }
      res.unshift(str)
    }

    return res
  }, [ mode ])

  return (
    <g>
      {dates.map((d, i) => {
        if (reduced && i % 2 !== 0) return null
        const x = Math.round(50 + (delta * (i + 0.5)))
        return (
          <g key={d}>
            <text className={style.gridText} x={x} y={baseHeight + 25} text-anchor='middle'>{d}</text>
            <line className={style.gridLine} x1={x} x2={x} y1={baseHeight} y2={baseHeight + 10}/>
          </g>
        )
      })}
    </g>
  )
}

function ChartDataset ({ reduced, width, height, dataset }: ChartDatasetProps) {
  return (
    <g>
      {Object.entries(dataset.dataset).map(([ key, { color, points } ]) => (
        <ChartLine key={key} set={key} width={width} height={height} color={color} points={points} reduced={reduced}/>
      ))}
    </g>
  )
}

function ChartLine ({ reduced, width, height, set, color, points }: ChartLineProps) {
  const usableWidth = width - 60
  const usableHeight = height - 50
  const heightMargin = 15
  const widthMargin = 60

  const mappedPoints = useMemo(
    () =>
      points
        .filter((_, i) => !reduced || i % 2 === 0)
        .map((p) => ({ x: p.x * usableWidth + widthMargin, y: usableHeight - (p.y * usableHeight) + heightMargin })),
    [ width, height, points, reduced ]
  )

  const linePath = useMemo(() => mappedPoints.map(p => `${p.x},${p.y}`).join(' '), [ mappedPoints ])

  return (
    <g data-dataset={set}>
      <polyline fill='none' stroke={color} stroke-width='2' points={linePath}/>
      {mappedPoints.map(({ x, y }) => (
        <circle key={`${x},${y}`} cx={x} cy={y} r={4} fill={color}/>
      ))}
    </g>
  )
}

export default function Chart (props: ChartProps) {
  const ref = useRef<HTMLElement>()
  const [ reduced, setReduced ] = useState(typeof window === 'undefined' ? false : window.innerWidth < 810)
  const [ mode, setMode ] = useState(props.defaultMode || props.modes[0].key)
  const [ [ width, height ], setSize ] = useState([ 0, 0 ])
  const dataset = useMemo(() => props.dataset && props.dataset[mode as keyof typeof props.dataset], [ props.dataset, mode ])

  useEffect(() => {
    const computeSize = () => {
      if (ref.current) {
        const { width: w } = ref.current.getBoundingClientRect()
        setSize([ w, Math.round((w - 80) * HEIGHT_RATIO) + 50 ])

        if (!reduced && window.innerWidth < 810) {
          setReduced(true)
        } else if (reduced && window.innerWidth > 810) {
          setReduced(false)
        }
      }
    }

    computeSize()
    window.addEventListener('resize', computeSize)
    return () => window.removeEventListener('resize', computeSize)
  }, [ ref.current, reduced ])

  return (
    <section className={style.chart} ref={ref}>
      <header className={style.chartHeader}>
        <h3>{props.title}</h3>
        <div className={style.buttons}>
          {props.modes.map((m) => (
            <button
              key={m.key}
              className={`${style.button}${mode === m.key ? ` ${style.selected}` : ''}`}
              onClick={() => setMode(m.key)}
            >
              {m.name}
            </button>
          ))}
        </div>
      </header>
      {dataset && props.legend && <ChartLegend legend={props.legend} dataset={dataset}/>}
      <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {dataset && <ChartSide width={width} height={height} dataset={dataset}/>}
        {dataset && <ChartBottom reduced={reduced} mode={mode} width={width} height={height}/>}
        {dataset && <ChartDataset reduced={reduced} width={width} height={height} dataset={dataset}/>}
      </svg>
    </section>
  )
}
