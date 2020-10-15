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

const cache = require('../utils/cache')

const getDelta = (pointsCount) => ({
  day: (24 / pointsCount) * 3600e3,
  week: ((24 * 7) / pointsCount) * 3600e3,
  month: ((24 * 30) / pointsCount) * 3600e3,
  allTime: (Date.now() - 1546732800000) / pointsCount
})

function toObject (keys, values) {
  const obj = {}
  keys.forEach((key, i) => (obj[key] = values[i]))
  return obj
}

function padArray (array, to, withData = 0) {
  if (array.length >= to) return array
  return Array(to - array.length).fill(withData).concat(array)
}

function datesOverTime (dates, pointsCount = 50) {
  const delta = getDelta(pointsCount)
  const data = { count: dates.length, allTime: [ dates.length ], month: [ dates.length ], week: [ dates.length ] }
  const buffer = {
    count: dates.length
  }

  for (const date of dates) {
    for (const scale of [ 'allTime', 'month', 'week' ]) {
      if (!buffer[scale]) buffer[scale] = date
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

function formatPeriodicData (data, pointsCount = 50) {
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
  const ago = {
    month: Date.now() - 30 * 24 * 3600e3,
    week: Date.now() - 7 * 24 * 3600e3,
    day: Date.now() - 24 * 3600e3
  }

  const dataKeys = Object.keys(data[0]).filter(k => ![ '_id', 'date' ].includes(k))
  const graph = { month: [], week: [], day: [] }
  for (const scale of [ 'month', 'week', 'day' ]) {
    const interval = data.filter(d => d.date.getTime() > (ago[scale] - ago.day))
    for (let i = 0; i < pointsCount; i++) {
      const target = ago[scale] + (delta[scale] * (i + 1))
      const data1 = interval.find(d => d.date.getTime() > target)
      const data0 = interval[interval.indexOf(data1) - 1]

      if (data1 && !data0) { // We're lacking data; Fill with 0
        graph[scale].push(toObject(dataKeys, Array(dataKeys.length).fill(0)))
        continue
      }

      if (!data1) { // We reached the end
        const d = interval[interval.length - 1]
        const values = dataKeys.map(k => d[k])
        graph[scale].push(toObject(dataKeys, values))
        continue
      }

      const time0 = data0.date.getTime()
      const time1 = data1.date.getTime()
      const posInInterval = (target - time0) / (time1 - time0)

      // Remember: f(x) = (x1 - x0) * x + x0
      const values = dataKeys.map(key => Math.round((data1[key] - data0[key]) * posInInterval + data0[key]))
      graph[scale].push(toObject(dataKeys, values))
    }
  }

  return graph
}

async function computeUsersOverTime (mongo) {
  const cursor = mongo.db.collection('users').find({}, { projection: { createdAt: true } }).sort({ createdAt: -1 })
  const dates = (await cursor.toArray()).map(doc => doc.createdAt.getTime())
  cursor.close()

  return datesOverTime(dates)
}

async function computeGuildStats (mongo) {
  const monthAgo = new Date(Date.now() - 30 * 24 * 3600e3)
  const cursor = mongo.db.collection('guild-stats').find({ date: { $gte: monthAgo } }).sort({ date: 1 })
  const data = await cursor.toArray()
  cursor.close()

  const toKeep = data.filter(data => data.date.getMinutes() % 30 === 0)
  return formatPeriodicData(toKeep)
}

async function contributors () {
  const findUsers = (filters) =>
    this.mongo.db.collection('users').find(filters, {
      projection: {
        _id: true,
        username: true,
        discriminator: true,
        'accounts.github.login': true,
        'accounts.github.display': true
      }
    }).toArray()

  return {
    developers: await findUsers({ 'badges.developer': true }),
    staff: await findUsers({ $or: [ { 'badges.staff': true }, { 'badges.support': true } ], 'badges.developer': false }),
    contributors: await findUsers({ 'badges.contributor': true })
  }
}

async function numbers () {
  return {
    users: await cache.getOrCompute('account_stats', () => computeUsersOverTime(this.mongo)),
    // guild: await cache.getOrCompute('guild_stats', () => computeGuildStats(this.mongo), true),
    guild: await computeGuildStats(this.mongo),
    helpers: await this.mongo.db.collection('users').countDocuments({
      $or: [
        { 'badges.contributor': true },
        { 'badges.hunter': true },
        { 'badges.translator': true }
      ]
    }),
    plugins: 0,
    themes: 0
  }
}

module.exports = async function (fastify) {
  fastify.get('/contributors', contributors)
  fastify.get('/numbers', numbers)
}
