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

import { memo, useState, useEffect } from 'react'
import Helmet from 'react-helmet'

import { Endpoints } from '@constants'
import Container from '@components/Container'
import Numbers from './Numbers'
import Chart from './Chart'
import { simpleChart, multipleChart, stackedChart } from './compute'

import style from '@styles/stats.scss'

let chartsCache = null

function Stats () {
  const [ charts, setCharts ] = useState(chartsCache)

  useEffect(() => {
    if (!charts) {
      fetch(Endpoints.STATS).then(r => r.json()).then(data => {
        chartsCache = {
          numbers: {
            total: data.users.count,
            month: data.users.month[49] - data.users.month[0],
            week: data.users.week[49] - data.users.week[0],
            helpers: data.helpers,
            plugins: data.plugins,
            themes: data.themes
          },
          users: {
            allTime: simpleChart(data.users.allTime, 'users', '#7289da'),
            month: simpleChart(data.users.month, 'users', '#7289da'),
            week: simpleChart(data.users.week, 'users', '#7289da')
          }
        }

        if (data.guild) {
          chartsCache.guild = {
            users: {
              month: simpleChart(data.guild.month.map(d => d.total), 'total', '#7289da'),
              week: simpleChart(data.guild.week.map(d => d.total), 'total', '#7289da'),
              day: simpleChart(data.guild.day.map(d => d.total), 'total', '#7289da')
            },
            messages: {
              month: multipleChart(data.guild.month, [ 'deletedMessages', 'sentMessages' ], [ '#f04747', '#7289da' ]),
              week: multipleChart(data.guild.week, [ 'deletedMessages', 'sentMessages' ], [ '#f04747', '#7289da' ]),
              day: multipleChart(data.guild.day, [ 'deletedMessages', 'sentMessages' ], [ '#f04747', '#7289da' ])
            },
            presences: {
              month: stackedChart(data.guild.month, [ 'dnd', 'idle', 'online' ], [ '#f04747', '#faa61a', '#43b581' ]),
              week: stackedChart(data.guild.week, [ 'dnd', 'idle', 'online' ], [ '#f04747', '#faa61a', '#43b581' ]),
              day: stackedChart(data.guild.day, [ 'dnd', 'idle', 'online' ], [ '#f04747', '#faa61a', '#43b581' ])
            }
          }
        }

        setCharts(chartsCache)
      })
    }
  }, [])

  return (
    <Container className={style.container}>
      <Helmet>
        <title>Statistics</title>
      </Helmet>
      <h1>Statistics</h1>
      <p>We love stats. So have stats. It's free. I think.</p>
      <p style={{ display: 'none' }}>it just cost my sanity doing boring maths. - bowoser</p>

      <Chart
        title='Registered Powercord accounts'
        dataset={charts && charts.users}
        modes={[
          { name: 'All Time', key: 'allTime' },
          { name: 'Last Month', key: 'month' },
          { name: 'Last Week', key: 'week' }
        ]}
      />
      <Numbers {...(charts ? charts.numbers : {})}/>

      {charts?.guild && (
        <>
          <h2>Powercord's Community Server</h2>
          <Chart
            legend={{ online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb' }}
            title='Online people'
            dataset={charts && charts.guild.presences}
            modes={[
              { name: 'Last Month', key: 'month' },
              { name: 'Last Week', key: 'week' },
              { name: 'Last Day', key: 'day' }
            ]}
          />

          <Chart
            title='Server members'
            dataset={charts && charts.guild.users}
            modes={[
              { name: 'Last Month', key: 'month' },
              { name: 'Last Week', key: 'week' },
              { name: 'Last Day', key: 'day' }
            ]}
          />

          <Chart
            title='Messages seen'
            legend={{ sentMessages: 'Messages Sent', deletedMessages: 'Messages Deleted' }}
            dataset={charts && charts.guild.messages}
            modes={[
              { name: 'Last Month', key: 'month' },
              { name: 'Last Week', key: 'week' },
              { name: 'Last Day', key: 'day' }
            ]}
          />
        </>
      )}
    </Container>
  )
}

Stats.displayName = 'Stats'
export default memo(Stats)
