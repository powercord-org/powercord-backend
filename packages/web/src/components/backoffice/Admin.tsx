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

import { h, Fragment } from 'preact'
import Router from 'preact-router'
import { Link } from 'preact-router/match'

import LayoutWithSidebar from '../util/LayoutWithSidebar'
import Redirect from '../util/Redirect'
import { SoonRoute } from '../util/Soon'
import Users from './Users/Manage'
import { Routes } from '../../constants'

import Smile from 'feather-icons/dist/icons/smile.svg'
import Activity from 'feather-icons/dist/icons/activity.svg'
import Layout from 'feather-icons/dist/icons/layout.svg'
import Inbox from 'feather-icons/dist/icons/inbox.svg'
import Flag from 'feather-icons/dist/icons/flag.svg'
import CodeSandbox from 'feather-icons/dist/icons/codesandbox.svg'

import style from './admin.module.css'

function Sidebar () {
  return (
    <Fragment>
      <h1>Administration</h1>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_USERS}>
        <Smile/>
        <span>Users</span>
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_MONITORING}>
        <Activity/>
        <span>Abuse Monitoring</span>
      </Link>
      <h3>Store management</h3>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_STORE_FRONT}>
        <Layout/>
        <span>Frontpage</span>
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_STORE_FORMS}>
        <Inbox/>
        <span>Forms</span>
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_STORE_REPORTS}>
        <Flag/>
        <span>Reports</span>
      </Link>
      <h3>Community</h3>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_EVENTS_SECRET}>
        <CodeSandbox/>
        <span>Super Secret Event</span>
      </Link>
    </Fragment>
  )
}

export default function Admin () {
  return (
    <LayoutWithSidebar>
      <Sidebar/>
      <Router>
        <Users path={Routes.BACKOFFICE_USERS}/>
        <SoonRoute path={Routes.BACKOFFICE_MONITORING}>
          <div>monitoring</div>
        </SoonRoute>

        <SoonRoute path={Routes.BACKOFFICE_STORE_FRONT}>
          <div>store front</div>
        </SoonRoute>
        <SoonRoute path={Routes.BACKOFFICE_STORE_FORMS}>
          <div>forms</div>
        </SoonRoute>
        <SoonRoute path={Routes.BACKOFFICE_STORE_REPORTS}>
          <div>reports</div>
        </SoonRoute>

        <SoonRoute path={Routes.BACKOFFICE_EVENTS_SECRET}>
          <div>eyes</div>
        </SoonRoute>
        <Redirect default to={Routes.BACKOFFICE_USERS}/>
      </Router>
    </LayoutWithSidebar>
  )
}
