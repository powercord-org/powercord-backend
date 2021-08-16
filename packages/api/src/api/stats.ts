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

import type { MinimalUser } from '@powercord/types/users'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { Db, ObjectId } from 'mongodb'
import mongo from 'mongodb'
import { getOrCompute } from '../utils/cache.js'

type Delta = { day: number, week: number, month: number }
type DeltaAll = Delta & { allTime: number }
type GraphOverTime = { count: number, allTime: number[], month: number[], week: number[] }
type GraphPeriodic = { month: Array<Record<string, number>>, week: Array<Record<string, number>>, day: Array<Record<string, number>> }
type PeriodicData = Record<string, number> & { _id: ObjectId }

function getDelta (pointsCount: number): DeltaAll {
  return {
    day: (24 / pointsCount) * 3600e3,
    week: ((24 * 7) / pointsCount) * 3600e3,
    month: ((24 * 30) / pointsCount) * 3600e3,
    allTime: (Date.now() - 1546732800000) / pointsCount,
  }
}

function toObject (keys: string[], values: number[]): Record<string, number> {
  const obj: Record<string, number> = {}
  keys.forEach((key, i) => (obj[key] = values[i]))
  return obj
}

function padArray (array: any[], to: number, withData: any = 0): any[] {
  if (array.length >= to) return array
  return Array(to - array.length).fill(withData).concat(array)
}

function datesOverTime (dates: number[], pointsCount: number = 50): GraphOverTime {
  const delta = getDelta(pointsCount)
  const data: GraphOverTime = { count: dates.length, allTime: [ dates.length ], month: [ dates.length ], week: [ dates.length ] }
  const buffer: { count: number, allTime: number, month: number, week: number } = { count: dates.length, allTime: 0, month: 0, week: 0 }

  for (const date of dates) {
    for (const scale of [ 'allTime', 'month', 'week' ] as Array<'allTime' | 'month' | 'week'>) {
      if (!buffer[scale]) buffer[scale] = date
      if (data[scale].length === 50) break
      if (buffer[scale] - date > delta[scale]) {
        buffer[scale] = date
        data[scale].unshift(buffer.count)
      }
    }

    buffer.count--
  }

  data.allTime = padArray(data.allTime, 50)
  data.month = padArray(data.month, 50)
  data.week = padArray(data.week, 50)
  data.allTime[0] = 0
  return data
}

function formatPeriodicData (data: PeriodicData[], pointsCount = 50): GraphPeriodic | null {
  /*
   * Interpolation (linear):
   * f(x) = ax + b
   * x in [0, 1]
   * x0 value for f(0)
   * x1 value for f(1)
   *
   * b = x0
   * a = ∆y / ∆x
   * ∆x = 1
   * ∆y = x1 - x0
   *
   * Since ∆x = 1;
   * a = x1 - x0
   * f(x) = (x1 - x0) * x + x0
   */

  if (data.length === 0) return null
  const delta = getDelta(pointsCount)
  const ago: Delta = {
    month: Date.now() - (30 * 24 * 3600e3),
    week: Date.now() - (7 * 24 * 3600e3),
    day: Date.now() - (24 * 3600e3),
  }

  const dataKeys = Object.keys(data[0]).filter((k) => ![ '_id', 'date' ].includes(k))
  const graph: GraphPeriodic = { month: [], week: [], day: [] }
  for (const scale of [ 'month', 'week', 'day' ] as Array<'month' | 'week' | 'day'>) {
    const interval = data.filter((d) => d._id.getTimestamp().getTime() > (ago[scale] - ago.day))
    for (let i = 0; i < pointsCount; i++) {
      const target = ago[scale] + (delta[scale] * (i + 1))
      const data1 = interval.find((d) => d._id.getTimestamp().getTime() > target)!
      const data0 = interval[interval.indexOf(data1) - 1]

      if (data1 && !data0) { // We're lacking data; Fill with 0
        graph[scale].push(toObject(dataKeys, Array(dataKeys.length).fill(0)))
        continue
      }

      if (!data1) { // We reached the end
        const d = interval[interval.length - 1]
        const values = dataKeys.map((k) => d[k])
        graph[scale].push(toObject(dataKeys, values))
        continue
      }

      const time0 = data0._id.getTimestamp().getTime()
      const time1 = data1._id.getTimestamp().getTime()
      const posInInterval = (target - time0) / (time1 - time0)

      // Remember: f(x) = ((x1 - x0) * x) + x0
      const values = dataKeys.map((key) => Math.round(((data1[key] - data0[key]) * posInInterval) + data0[key]))
      graph[scale].push(toObject(dataKeys, values))
    }
  }

  return graph
}

async function computeUsersOverTime (db: Db) {
  const cursor = db.collection('users').find<{ createdAt: Date }>({}, { projection: { createdAt: true } }).sort({ createdAt: -1 })
  const dates = (await cursor.toArray()).map((doc) => doc.createdAt.getTime())
  cursor.close()

  return datesOverTime(dates)
}

async function computeGuildStats (db: Db) {
  const cursor = db.collection('guild-stats').find({
    _id: { $gte: mongo.ObjectId.createFromTime(Math.round(Date.now() / 1000) - (30 * 24 * 3600)) },
    online: { $not: { $eq: 0 } },
  }).sort({ _id: 1 })
  const data = await cursor.toArray()
  cursor.close()

  return formatPeriodicData(data as PeriodicData[])
}

async function contributors (this: FastifyInstance, _request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  const res: Record<string, MinimalUser[]> = {
    developers: [],
    staff: [],
    contributors: [],
  }

  await this.mongo.db!.collection('users').aggregate([
    {
      $match: {
        $or: [
          { 'badges.developer': true },
          { 'badges.staff': true },
          { 'badges.support': true },
          { 'badges.contributor': true },
        ],
      },
    },
    {
      $set: {
        _rank: {
          $cond: {
            if: '$badges.developer',
            then: 'developers',
            else: {
              $cond: {
                if: { $or: [ '$badges.staff', '$badges.support' ] },
                then: 'staff',
                else: 'contributors',
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: '$_rank',
        users: {
          $push: {
            id: '$_id',
            username: '$username',
            discriminator: '$discriminator',
            avatar: '$avatar',
            github: '$accounts.github.name',
          },
        },
      },
    },
  ]).forEach((doc) => (res[doc._id] = doc.users))

  reply.header('cache-control', 'public, max-age=86400')
  return res
}

async function numbers (this: FastifyInstance, _request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  reply.header('cache-control', 'public, max-age=3600')

  return {
    users: await getOrCompute('account_stats', () => computeUsersOverTime(this.mongo.db!)),
    guild: await getOrCompute('guild_stats', () => computeGuildStats(this.mongo.db!), true),
    helpers: await this.mongo.db!.collection('users').countDocuments({
      $or: [
        { 'badges.contributor': true },
        { 'badges.hunter': true },
        { 'badges.translator': true },
      ],
    }),
    plugins: 0,
    themes: 0,
  }
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.mongo.db!.collection('users').createIndex('createdAt')
  fastify.get('/contributors', contributors)
  fastify.get('/numbers', numbers)
}
