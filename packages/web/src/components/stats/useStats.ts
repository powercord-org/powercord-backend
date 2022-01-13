/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import { useState, useEffect } from 'preact/hooks'
import { Endpoints } from '../../constants'

export type Point = { x: number, y: number, value: number }
type RawDataset = Array<Record<string, number>>
type Dataset = { [key: string]: { color: string, points: Point[] } }

export type Chart = { min: number, max: number, dataset: Dataset }
export type StatsAll = { allTime: Chart, month: Chart, week: Chart }
export type StatsDay = { month: Chart, week: Chart, day: Chart }
export type CommunityStats = {
  numbers: Record<string, number>
  users: StatsAll
  guild: {
    users: StatsDay
    messages: StatsDay
    presences: StatsDay
  }
}

function roundMinMax (all: number[]) {
  const min = Math.min.apply(Math, all)
  const max = Math.max.apply(Math, all)
  const roundTo = (max - min) < 100 ? 50 : (max - min) < 250 ? 100 : 500
  return [ Math.floor(min / roundTo) * roundTo, Math.ceil(max / roundTo) * roundTo ]
}

function placePoints (points: number[], min: number, max: number): Point[] {
  let xBuf = 0
  const xDelta = 1 / points.length
  const pointsPosition = []
  for (const point of points) {
    const y = max - min === 0 ? 0 : (point - min) / (max - min)
    pointsPosition.push({ x: xBuf, y: y, value: point })
    xBuf += xDelta
  }

  return pointsPosition
}

function simpleChart<TKey extends string> (points: number[], key: TKey, color: string): Chart {
  const [ min, max ] = roundMinMax(points)
  return { min: min, max: max, dataset: { [key]: { color: color, points: placePoints(points, min, max) } } }
}

function multipleChart (dataset: RawDataset, keys: string[], colors: string[]): Chart {
  const all = keys.map((k) => dataset.map((d) => d[k])).flat()
  const [ min, max ] = roundMinMax(all)
  const dset: Dataset = {}

  keys.forEach((k, i) => (dset[k] = { color: colors[i], points: placePoints(dataset.map((d) => d[k]), min, max) }))
  return { min: min, max: max, dataset: dset }
}

function stackedChart (dataset: RawDataset, keys: string[], colors: string[]): Chart {
  // Make all values absolute
  dataset = dataset.map((d) => {
    let buf = 0
    const adj: Record<string, number> = {}
    for (const key of keys) {
      buf += d[key]
      adj[key] = buf
    }
    return adj
  })

  // Compute chart boundaries
  const points = dataset.map((d) => [ d[keys[0]], d[keys[keys.length - 1]] ]).flat()
  const [ min, max ] = roundMinMax(points)

  // Place points
  let xBuf = 0
  const xDelta = 1 / (points.length / 2)
  const finalDataset: Dataset = {}
  for (const data of dataset) {
    for (const key of keys) {
      if (!finalDataset[key]) {
        finalDataset[key] = {
          color: colors[keys.indexOf(key)],
          points: [],
        }
      }

      const y = (data[key] - min) / (max - min)
      finalDataset[key].points.push({ x: xBuf, y: y, value: data[key] })
    }

    xBuf += xDelta
  }
  return { min: min, max: max, dataset: finalDataset }
}

let chartsCache: void | any = void 0
export default function useStats (): CommunityStats {
  const [ charts, setCharts ] = useState(chartsCache)
  useEffect(() => {
    if (!charts) {
      fetch(Endpoints.STATS)
        .then((r) => r.json())
        .then((data) => {
          setCharts({
            numbers: {
              total: data.users.count,
              month: data.users.month[49] - data.users.month[0],
              week: data.users.week[49] - data.users.week[0],
              helpers: data.helpers,
              plugins: data.plugins,
              themes: data.themes,
            },
            users: {
              allTime: simpleChart(data.users.allTime, 'users', '#7289da'),
              month: simpleChart(data.users.month, 'users', '#7289da'),
              week: simpleChart(data.users.week, 'users', '#7289da'),
            },
            guild: data.guild
              ? {
                users: {
                  month: simpleChart(data.guild.month.map((d: any) => d.total), 'total', '#7289da'),
                  week: simpleChart(data.guild.week.map((d: any) => d.total), 'total', '#7289da'),
                  day: simpleChart(data.guild.day.map((d: any) => d.total), 'total', '#7289da'),
                },
                messages: {
                  month: multipleChart(data.guild.month, [ 'deletedMessages', 'sentMessages' ], [ '#f04747', '#7289da' ]),
                  week: multipleChart(data.guild.week, [ 'deletedMessages', 'sentMessages' ], [ '#f04747', '#7289da' ]),
                  day: multipleChart(data.guild.day, [ 'deletedMessages', 'sentMessages' ], [ '#f04747', '#7289da' ]),
                },
                presences: {
                  month: stackedChart(data.guild.month, [ 'dnd', 'idle', 'online' ], [ '#f04747', '#faa61a', '#43b581' ]),
                  week: stackedChart(data.guild.week, [ 'dnd', 'idle', 'online' ], [ '#f04747', '#faa61a', '#43b581' ]),
                  day: stackedChart(data.guild.day, [ 'dnd', 'idle', 'online' ], [ '#f04747', '#faa61a', '#43b581' ]),
                },
              }
              : null,
          })
        })
    }
  }, [])

  return charts
}
