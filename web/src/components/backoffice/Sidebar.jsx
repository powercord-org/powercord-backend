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

import { memo, useContext } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { Routes, Endpoints } from '@constants'
import UserContext from '@components/UserContext'
import * as Icons from '@components/Icons'

import style from '@styles/backoffice/sidebar.scss'

function Sidebar () {
  const user = useContext(UserContext)

  return (
    <nav className={style.container}>
      <h1>Powercord Admin</h1>
      <div className={style.back}>
        <Link to={Routes.HOME}>
          <Icons.ArrowLeft/>
          <span>Go back to {location.hostname}</span>
        </Link>
      </div>

      <div className={style.items}>
        <div className={style.section}>Manage Powercord</div>
        <NavLink className={style.item} exact activeClassName={style.active} to='/backoffice/users'>
          <Icons.Users/>
          <span>Users</span>
        </NavLink>

        <NavLink className={style.item} exact activeClassName={style.active} to='/backoffice/advisories'>
          <Icons.ShieldDanger/>
          <span>Advisories</span>
          <span className={style.badge}>69</span>
        </NavLink>

        <div className={style.section}>Powercord Store</div>
        <NavLink className={style.item} exact activeClassName={style.active} to='/backoffice/store-frontpage'>
          <Icons.Explore/>
          <span>Frontpage</span>
        </NavLink>

        <NavLink className={style.item} exact activeClassName={style.active} to='/backoffice/products'>
          <Icons.Tag/>
          <span>Products</span>
          <span className={style.badge}>69</span>
        </NavLink>

        <NavLink className={style.item} exact activeClassName={style.active} to='/backoffice/reports'>
          <Icons.Flag/>
          <span>Abuse Reports</span>
          <span className={style.badge}>69</span>
        </NavLink>

        <NavLink className={style.item} exact activeClassName={style.active} to='/backoffice/verification'>
          <Icons.Verified/>
          <span>Verification</span>
          <span className={style.badge}>69</span>
        </NavLink>

        <NavLink className={style.item} exact activeClassName={style.active} to='/backoffice/hosting'>
          <Icons.Server/>
          <span>Hosting</span>
          <span className={style.badge}>69</span>
        </NavLink>

        <div className={style.section}>Community Events</div>
        <NavLink className={style.item} exact activeClassName={style.active} to='/backoffice/super-secret-event'>
          <Icons.IntegrationInstruction/> <span>Super Secret Event</span>
        </NavLink>
      </div>

      <div className={style.user}>
        <img src={Endpoints.USER_AVATAR(user.id)} alt={`${user.username}'s avatar`}/>
        <div className={style.username}>
          <span>Logged in as</span>
          <span>{user.username}#{user.discriminator}</span>
        </div>
      </div>
    </nav>
  )
}

Sidebar.displayName = 'BackofficeSidebar'
export default memo(Sidebar)
