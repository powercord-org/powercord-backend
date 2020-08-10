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

const WEEKLY_DELTA = 3.36 * 3600e3
const MONTHLY_DELTA = 14.4 * 3600e3
const YEARLY_DELTA = () => (Date.now() - 1546732800000) / 50

async function computeGraphData (mongo) {
  const graphData = {}
  let count = await mongo.db.collection('users').countDocuments()
  graphData.count = count
  graphData.allTime = [ count ]
  graphData.month = [ count ]
  graphData.week = [ count ]

  const yd = YEARLY_DELTA()
  const cursor = mongo.db.collection('users').find({}, { projection: { createdAt: true } }).sort({ createdAt: -1 })

  let prevWeekDate, prevMonthDate, prevAllDate
  await cursor.forEach(doc => {
    if (graphData.week.length < 50) {
      if (!prevWeekDate) prevWeekDate = doc.createdAt.getTime()
      if (prevWeekDate - doc.createdAt.getTime() > WEEKLY_DELTA) {
        prevWeekDate = doc.createdAt.getTime()
        graphData.week.unshift(count)
      }
    }
    if (graphData.month.length < 50) {
      if (!prevMonthDate) prevMonthDate = doc.createdAt.getTime()
      if (prevMonthDate - doc.createdAt.getTime() > MONTHLY_DELTA) {
        prevMonthDate = doc.createdAt.getTime()
        graphData.month.unshift(count)
      }
    }
    if (graphData.allTime.length < 49) {
      if (!prevAllDate) prevAllDate = doc.createdAt.getTime()
      if (prevAllDate - doc.createdAt.getTime() > yd) {
        prevAllDate = doc.createdAt.getTime()
        graphData.allTime.unshift(count)
      }
    }
    count--
  })

  cursor.close()
  graphData.allTime.unshift(0)
  return graphData
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
    users: await cache.getOrCompute('account_stats', () => computeGraphData(this.mongo)),
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
