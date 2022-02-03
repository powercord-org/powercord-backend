/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import { h } from 'preact'
import { useMemo } from 'preact/hooks'

import { Routes } from '../../constants'

import PowercordCutieBanner from '../../assets/donate/banner.svg?sprite=cutie'
import Hibiscus from '../../assets/hibiscus.svg?sprite=cutie'

import blobkiss from '../../assets/donate/blobkiss.png'
import blobsmilehearts from '../../assets/donate/blobsmilehearts.png'
import blobhug from '../../assets/donate/blobhug.png'

import style from './cutie.module.css'

const HEARTS = [ '❤️', '🧡', '💛', '💚', '💙', '💜', '💗', '💖', '💝' ]

export default function PowercordCutie () {
  const heart = useMemo(() => Math.floor(Math.random() * HEARTS.length), [])

  return (
    <div className={style.wrapper}>
      <div className={style.container}>
        <div className={style.header}>
          <PowercordCutieBanner className={style.banner}/>
          <Hibiscus className={style.hibiscusLeft}/>
          <Hibiscus className={style.hibiscusCenter}/>
          <Hibiscus className={style.hibiscusRight}/>
        </div>
        <div className={style.body}>
          <h3 className={style.title}>Support Powercord's Development</h3>
          <div className={style.subtitle}>And get sweet perks</div>

          <div className={style.tier}>
            <img className={style.icon} src={blobkiss} alt='Tier 1 icon'/>
            <div>
              <div className={style.price}>$1/month</div>
              <p className={style.description}>
                Get a <b>permanent hibiscus badge</b>, <b>custom badge colors</b> on your profile, and a custom role
                in our Discord server.
              </p>
            </div>
          </div>
          <div className={style.tier}>
            <img className={style.icon} src={blobsmilehearts} alt='Tier 2 icon'/>
            <div>
              <div className={style.price}>$5/month</div>
              <p className={style.description}>
                Get a <b>customizable badge</b> (icon &amp; hover text) on your profile, instead of a simple hibiscus.
              </p>
            </div>
          </div>
          <div className={style.tier}>
            <img className={style.icon} src={blobhug} alt='Tier 3 icon'/>
            <div>
              <div className={style.price}>$10/month</div>
              <p className={style.description}>
                Get a <b>fully customizable</b> badge for <b>one</b> of your servers, shown next to its name.
              </p>
            </div>
          </div>

          <div className={style.footer}>
            <a href={Routes.PATREON} target='_blank' rel='noreferrer'>Donate on Patreon {HEARTS[heart]}</a>
          </div>
        </div>
      </div>
    </div>
  )
}
