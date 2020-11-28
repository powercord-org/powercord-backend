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

import { memo, useContext } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { Endpoints } from '@constants'
import UserContext from '@components/UserContext'
import * as Icons from '@components/Icons'

import style from '@styles/backoffice/sidebar.scss'

function Sidebar () {
  const user = useContext(UserContext)

  return (
    <nav className={style.container}>
      <h1>Powercord Admin</h1>
      <div className={style.back}>
        <Link to='/'>
          <Icons.ArrowLeft/> <span>Go back to powercord.dev</span>
        </Link>
      </div>

      <div className={style.items}>
        <h2>Manage Powercord</h2>
        <NavLink className={style.item} to='/'>
          <Icons.Users/> <span>Users</span>
        </NavLink>
        <NavLink className={style.item} to='/'>
          <Icons.Document/> <span>Forms</span>
        </NavLink>
        <NavLink className={style.item} to='/'>
          <Icons.Extension/> <span>Plugins &amp; Themes</span>
        </NavLink>
        <NavLink className={style.item} to='/'>
          <Icons.Explore/> <span>Store Frontpage</span>
        </NavLink>
        <NavLink className={style.item} to='/'>
          <Icons.ShieldDanger/> <span>Advisories</span>
        </NavLink>

        <h2>Community Events</h2>
        <NavLink className={style.item} to='/'>
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
