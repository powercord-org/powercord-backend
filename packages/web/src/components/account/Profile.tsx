/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { User } from '../UserContext'

import { h, Fragment } from 'preact'
import { UserFlags } from '@powercord/shared/flags'

import Tooltip from '../util/Tooltip'
import Avatar from '../util/Avatar'

import HibiscusMono from '../../assets/badges/hibiscus-mono.svg?sprite=badges'
import Developer from '../../assets/badges/developer.svg?sprite=badges'
import Support from '../../assets/badges/support.svg?sprite=badges'
import Staff from '../../assets/badges/staff.svg?sprite=badges'
import Contributor from '../../assets/badges/contributor.svg?sprite=badges'
import Translator from '../../assets/badges/translator.svg?sprite=badges'
import Hunter from '../../assets/badges/hunter.svg?sprite=badges'
import Early from '../../assets/badges/early.svg?sprite=badges'

import style from './profile.module.css'
import sharedStyle from '../shared.module.css'

type ProfileProps = {
  user: User
  onEdit: () => void
}

type ProfileBadgesProps = Pick<User, 'flags' | 'cutiePerks'>

function ProfileBadges ({ flags, cutiePerks }: ProfileBadgesProps) {
  return (
    <div className={style.badges} style={{ color: `#${cutiePerks.color || '7289da'}` }}>
      <Tooltip text={cutiePerks.title ?? 'Powercord Cutie'} align='center'>
        {cutiePerks.badge && cutiePerks.badge !== 'default'
          ? <img src={cutiePerks.badge} className={style.badge}/>
          : <HibiscusMono className={style.badge}/>}
      </Tooltip>
      {Boolean(flags & UserFlags.DEVELOPER) && (
        <Tooltip text='Powercord Developer' align='center'>
          <Developer className={style.badge}/>
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.STAFF) && (
        <Tooltip text='Powercord Staff' align='center'>
          <Staff className={style.badge}/>
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.SUPPORT) && (
        <Tooltip text='Powercord Support' align='center'>
          <Support className={style.badge}/>
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.CONTRIBUTOR) && (
        <Tooltip text='Powercord Contributor' align='center'>
          <Contributor className={style.badge}/>
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.TRANSLATOR) && (
        <Tooltip text='Powercord Translator' align='center'>
          <Translator className={style.badge}/>
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.BUG_HUNTER) && (
        <Tooltip text='Powercord Bug Hunter' align='center'>
          <Hunter className={style.badge}/>
        </Tooltip>
      )}
      {Boolean(flags & UserFlags.EARLY_USER) && (
        <Tooltip text='Powercord Early User' align='center'>
          <Early className={style.badge}/>
        </Tooltip>
      )}
    </div>
  )
}

export default function Profile ({ user, onEdit }: ProfileProps) {
  return (
    <Fragment>
      <div className={style.container}>
        <div className={style.banner}/>
        <div className={style.section}>
          <div className={style.decorations}>
            <Avatar user={user} class={style.avatar}/>
            <ProfileBadges flags={user.flags} cutiePerks={user.cutiePerks}/>
          </div>
          <div className={style.props}>
            <span>{user.username}</span>
            <span className={style.discriminator}>#{user.discriminator}</span>
          </div>
        </div>
        <div className={style.section}>
          <h3 className={style.header}>Roles</h3>
          <div className={style.roles}>
            <div className={style.role}>
              <div className={`${style.roleRound} ${style.roleBlurple}`}/>
              <span>Powercord Cutie</span>
            </div>
            <div className={style.role}>
              <div className={`${style.roleRound} ${style.rolePink}`}/>
              <span>Tier {user.cutieStatus.pledgeTier} Cutie</span>
            </div>
          </div>
        </div>
      </div>
      <button className={sharedStyle.button} onClick={onEdit}>Edit perks</button>
    </Fragment>
  )
}
