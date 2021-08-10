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

import type { Attributes } from 'preact'
import type { CommunityStats } from './useStats'
import { h, Fragment } from 'preact'
import { useTitle } from 'hoofd/preact'

import Chart from './Chart'
import useStats from './useStats'

import style from './stats.module.css'

function Powercord ({ charts }: { charts?: CommunityStats }) {
  return (
    <>
      <Chart
        title='Registered Powercord accounts'
        dataset={charts ? charts.users : false}
        modes={[
          { name: 'All Time', key: 'allTime' },
          { name: 'Last Month', key: 'month' },
          { name: 'Last Week', key: 'week' },
        ]}
      />
      <div className={style.group}>
        <div>
          <h3>Total users</h3>
          <span>{typeof charts !== 'undefined' ? charts.numbers.total : 'Loading...'}</span>
        </div>
        <div>
          <h3>New users last month</h3>
          <span>{typeof charts !== 'undefined' ? charts.numbers.month : 'Loading...'}</span>
        </div>
        <div>
          <h3>New users last week</h3>
          <span>{typeof charts !== 'undefined' ? charts.numbers.week : 'Loading...'}</span>
        </div>
      </div>

      <div className={style.group}>
        <div>
          <h3>Helpers</h3>
          <span>{typeof charts !== 'undefined' ? charts.numbers.helpers : 'Loading...'}</span>
        </div>
        <div>
          <h3>Published plugins</h3>
          <span>Soon!</span>
        </div>
        <div>
          <h3>Published themes</h3>
          <span>Soon!</span>
        </div>
      </div>
      <p>
        Helpers include community members who contributed in any way to Powercord:
        Code contributors, translators, bug hunters.
      </p>
    </>
  )
}

function Community ({ charts }: { charts?: CommunityStats }) {
  if (!charts?.guild) return null

  return (
    <>
      <h2 className={style.sectionTitle}>Powercord's Community Server</h2>
      <Chart
        title='Online people'
        legend={{ online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb' }}
        dataset={charts && charts.guild.presences}
        modes={[
          { name: 'Last Month', key: 'month' },
          { name: 'Last Week', key: 'week' },
          { name: 'Last Day', key: 'day' },
        ]}
      />

      <Chart
        title='Server members'
        dataset={charts && charts.guild.users}
        modes={[
          { name: 'Last Month', key: 'month' },
          { name: 'Last Week', key: 'week' },
          { name: 'Last Day', key: 'day' },
        ]}
      />

      <Chart
        title='Messages seen'
        legend={{ sentMessages: 'Messages Sent', deletedMessages: 'Messages Deleted' }}
        dataset={charts && charts.guild.messages}
        modes={[
          { name: 'Last Month', key: 'month' },
          { name: 'Last Week', key: 'week' },
          { name: 'Last Day', key: 'day' },
        ]}
      />
    </>
  )
}

export default function Stats (_: Attributes) {
  useTitle('Statistics')
  const charts = useStats()

  return (
    <main>
      <h1>Statistics</h1>
      <p>We love stats. So have stats. It's free. I think.</p>
      <div className='sneaky'>
        <p>it just condemned an honest woman to do boring maths for a day</p>
        <p>and the story tells she then had to do more maths for displaying</p>
        <p>-- help me pls i'm just a stupid girl, it's painfullll - cynthia</p>
      </div>

      <Powercord charts={charts}/>
      <Community charts={charts}/>
    </main>
  )
}
