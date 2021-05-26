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

import { h } from 'preact'
import { useMemo, useState, useContext } from 'preact/hooks'

import UserContext from './UserContext'
import Hamburger from './util/Hamburger'
import { Endpoints, Routes } from '../constants'

import powercordPlug from '../assets/powercord.svg?file'
import spookycordPlug from '../assets/spookycord.svg?file'
import Staff from '../assets/staff.svg'

import style from './header.module.css'
import sharedStyle from './shared.module.css'

function User () {
  const user = useContext(UserContext)

  if (!user) {
    return (
      /* @ts-expect-error */
      <a native href={Endpoints.LOGIN} className={sharedStyle.button}>Login with Discord</a>
    )
  }

  return (
    <div className={style.profile}>
      <img className={style.avatar} src={Endpoints.USER_AVATAR(user.id)} alt={`${user.username}'s avatar`}/>
      <div className={style.details}>
        <div className={style.name}>
          <div className={style.username}>{user.username}<span className={style.discriminator}>#{user.discriminator}</span></div>
          {user.badges.staff && <Staff className={style.badge}/>}
        </div>
        <div>
          <a className={style.link} href={Routes.ME}>Account</a>
          {/* @ts-expect-error */}
          <a className={style.link} href={Endpoints.LOGOUT} native>Logout</a>
        </div>
        {user.badges.staff && <a className={style.link} href={Routes.BACKOFFICE}>Admin panel</a>}
      </div>
    </div>
  )
}

export default function Header () {
  const isOctober = useMemo(() => new Date().getUTCMonth() === 9, [])
  const [ opened, setOpened ] = useState(false)

  return (
    <header className={`${style.container}${opened ? ` ${style.opened}` : ''}`}>
      <a className={style.logo} href={Routes.HOME}>
        <img className={style.plug} src={isOctober ? spookycordPlug : powercordPlug} alt='Powercord Logo'/>
        <div className={style.title}>Powercord</div>
      </a>

      <nav className={style.nav}>
        <a className={style.navLink} href={Routes.INSTALLATION}>Installation</a>
        <a className={style.navLink} href={Routes.FAQ}>FAQ</a>
        <a className={style.navLink} href={Routes.CONTRIBUTORS}>Contributors</a>
        <a className={style.navLink} href={Routes.DICKSWORD} target='_blank' rel='noreferrer'>Discord Server</a>
      </nav>

      <div className={style.account}>
        <User/>
      </div>

      <Hamburger opened={opened} setOpened={setOpened} className={style.b}/>
    </header>
  )
}
