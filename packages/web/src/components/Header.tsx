/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import { h } from 'preact'
import { useMemo, useState, useContext } from 'preact/hooks'

import UserContext from './UserContext'
import Avatar from './util/Avatar'
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
      <Avatar user={user}/>
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
        {user.badges.staff && <a className={style.link} href={Routes.BACKOFFICE}>Administration</a>}
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
        {import.meta.env.DEV && <a className={style.navLink} href={Routes.STORE}>Store</a>}
        <a className={style.navLink} href={Routes.CONTRIBUTORS}>Contributors</a>
        <a className={style.navLink} href={Routes.DICKSWORD} target='_blank' rel='noreferrer'>Discord Server</a>
        <a className={style.navLink} href={Routes.FAQ}>FAQ</a>
      </nav>

      <div className={style.account}>
        <User/>
      </div>

      <Hamburger opened={opened} setOpened={setOpened} className={style.b}/>
    </header>
  )
}
