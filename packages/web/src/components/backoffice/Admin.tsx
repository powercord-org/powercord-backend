/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import { h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { useTitleTemplate } from 'hoofd/preact'
import Router from 'preact-router'
import { Link } from 'preact-router/match'

import LayoutWithSidebar from '../layout/LayoutWithSidebar'
import Redirect from '../util/Redirect'
import { SoonRoute } from '../util/Soon'
import Users from './UsersOld/Manage'
import UsersManage from './Users/Manage'
import Forms from './Store/Forms'

import { Endpoints, Routes } from '../../constants'

import Smile from 'feather-icons/dist/icons/smile.svg'
import Shield from 'feather-icons/dist/icons/shield.svg'
import Activity from 'feather-icons/dist/icons/activity.svg'

import Package from 'feather-icons/dist/icons/package.svg'
import Tag from 'feather-icons/dist/icons/tag.svg'
import Layout from 'feather-icons/dist/icons/layout.svg'
import Alert from 'feather-icons/dist/icons/alert-octagon.svg'

import Inbox from 'feather-icons/dist/icons/inbox.svg'
import Flag from 'feather-icons/dist/icons/flag.svg'

import CodeSandbox from 'feather-icons/dist/icons/codesandbox.svg'

import style from './admin.module.css'

function Sidebar () {
  // Unread badges
  const [ unread, setUnread ] = useState({ forms: 0, reports: 0 })
  useEffect(() => {
    fetch(Endpoints.BACKOFFICE_FORMS_COUNT).then((r) => r.json()).then((d) => {
      setUnread({
        forms: d.publish + d.verification + d.hosting,
        reports: d.reports,
      })
    })
  }, [])

  return (
    <Fragment>
      <h1>Administration</h1>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_USERS}>
        <Smile/>
        <span>Users</span>
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_BANS}>
        <Shield/>
        <span>Bans</span>
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_MONITORING}>
        <Activity/>
        <span>Abuse Monitoring</span>
      </Link>

      <h3>Store management</h3>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_STORE_ITEMS}>
        <Package/>
        <span>Items</span>
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_STORE_TAGS}>
        <Tag/>
        <span>Tags</span>
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_STORE_FRONT}>
        <Layout/>
        <span>Frontpage</span>
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_THREATS}>
        <Alert/>
        <span>Known Threats</span>
      </Link>

      <h3>Store submissions</h3>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_STORE_FORMS}>
        <Inbox/>
        <span>Forms</span>
        {Boolean(unread.forms) && <span className={style.unread}>{unread.forms}</span>}
      </Link>
      <Link class={style.item} activeClassName={style.active} href={Routes.BACKOFFICE_STORE_REPORTS}>
        <Flag/>
        <span>Reports</span>
        {Boolean(unread.reports) && <span className={style.unread}>{unread.reports}</span>}
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
  useTitleTemplate('Powercord Admin')

  return (
    <LayoutWithSidebar>
      <Sidebar/>
      <Router>
        <Users path={Routes.BACKOFFICE_USERS}/>
        <UsersManage path={Routes.BACKOFFICE_USERS_MANAGE(':id')}/>

        <SoonRoute path={Routes.BACKOFFICE_BANS}>
          <div>banned users</div>
        </SoonRoute>
        <SoonRoute path={Routes.BACKOFFICE_MONITORING}>
          <div>monitoring</div>
        </SoonRoute>

        <SoonRoute path={Routes.BACKOFFICE_STORE_ITEMS}>
          <div>store items</div>
        </SoonRoute>
        <SoonRoute path={Routes.BACKOFFICE_STORE_TAGS}>
          <div>store tags</div>
        </SoonRoute>
        <SoonRoute path={Routes.BACKOFFICE_STORE_FRONT}>
          <div>store front</div>
        </SoonRoute>
        <SoonRoute path={Routes.BACKOFFICE_THREATS}>
          <div>threats</div>
        </SoonRoute>

        <SoonRoute path={Routes.BACKOFFICE_STORE_FORMS}>
          <Forms path={Routes.BACKOFFICE_STORE_FORMS}/>
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
