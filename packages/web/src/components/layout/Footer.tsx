/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import { h } from 'preact'

import { Routes } from '../../constants'

import style from './footer.module.css'

export default function Footer () {
  return (
    <footer className={style.container}>
      <div className={style.section}>
        <span>Copyright &copy; 2018-{new Date().getFullYear()} Powercord</span>
        <span>Powercord is not affiliated or endorsed by Discord. Discord is a trademark of Discord Inc.</span>
      </div>
      <div className={style.section}>
        {import.meta.env.DEV && <a className={style.link} href={Routes.DOCS}>Docs</a>}
        <a className={style.link} href={Routes.PATREON} target='_blank' rel='noreferrer'>Patreon</a>
        <a className={style.link} href={Routes.STATS}>Stats</a>
        <a className={style.link} href={Routes.BRANDING}>Branding</a>
        <a className={style.link} href={Routes.GITHUB} target='_blank' rel='noreferrer'>GitHub</a>
        <a className={style.link} href={Routes.GUIDELINES}>Guidelines</a>
        <a className={style.link} href={Routes.TERMS}>Terms</a>
        <a className={style.link} href={Routes.PRIVACY}>Privacy</a>
      </div>
    </footer>
  )
}
