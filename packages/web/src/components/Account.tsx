/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { JSX } from 'preact'
import type { User } from './UserContext'
import { h, Fragment } from 'preact'
import { useContext, useState, useEffect, useMemo, useCallback } from 'preact/hooks'
import { useTitle } from 'hoofd/preact'

import Tooltip from './util/Tooltip'
import Avatar from './util/Avatar'
import Spinner from './util/Spinner'
import Modal from './util/Modal'

import UserContext from './UserContext'
import { Endpoints, Routes } from '../constants'

import Spotify from 'simple-icons/icons/spotify.svg'
import Patreon from 'simple-icons/icons/patreon.svg'
import Link from 'feather-icons/dist/icons/link.svg'
import Remove from 'feather-icons/dist/icons/x-circle.svg'
import Refresh from 'feather-icons/dist/icons/rotate-cw.svg'
import AlertCircle from 'feather-icons/dist/icons/alert-circle.svg'
import PowercordCutieBanner from '../assets/donate/banner.svg?sprite=cutie'
import Hibiscus from '../assets/hibiscus.svg?sprite=cutie'

import HibiscusMono from '../assets/badges/hibiscus-mono.svg?sprite=cutie'
import Developer from '../assets/badges/developer.svg?sprite=badges'
import Support from '../assets/badges/support.svg?sprite=badges'
import Staff from '../assets/badges/staff.svg?sprite=badges'
import Contributor from '../assets/badges/contributor.svg?sprite=badges'
import Translator from '../assets/badges/translator.svg?sprite=badges'
import Hunter from '../assets/badges/hunter.svg?sprite=badges'
import Early from '../assets/badges/early.svg?sprite=badges'

import blobkiss from '../assets/donate/blobkiss.png'
import blobsmilehearts from '../assets/donate/blobsmilehearts.png'
import blobhug from '../assets/donate/blobhug.png'

import style from './account.module.css'
import sharedStyle from './shared.module.css'

function AccountOld () {
  useTitle('My Account')
  const user = useContext(UserContext)!
  const [ canDeleteAccount, setCanDeleteAccount ] = useState(true)
  const [ deletingAccount, setDeletingAccount ] = useState(false)

  useEffect(() => {
    // todo: check if the user can delete their account (or return in /@me?)
    setCanDeleteAccount(true)
  }, [ user.id ])

  return (
    <main>
      <h1>Welcome back, {user.username}#{user.discriminator}</h1>
      <h3 className={style.headerOld}>Linked Spotify account</h3>
      {typeof user.accounts?.spotify === 'string'
        // @ts-expect-error
        ? <p>{user.accounts.spotify} - <a href={Endpoints.UNLINK_ACCOUNT('spotify')} native>Unlink</a></p>
        // @ts-expect-error
        : <p>No account linked. <a href={Endpoints.LINK_ACCOUNT('spotify')} native>Link it now!</a></p>}
      <p>
        Linking your Spotify account gives you an enhanced experience with the Spotify plugin. It'll let you add songs
        to your Liked Songs, add songs to playlists, see private playlists and more.
      </p>

      <h3 className={style.headerOld}>Delete my Powercord account</h3>
      {canDeleteAccount
        ? <Fragment>
          <p>
            You can choose to permanently delete your Powercord account. This action is irreversible and will be in effect
            immediately. We'll drop any data we have about you, and you'll no longer be able to benefit from features
            requiring a Powercord account (such as enhanced Spotify plugin, settings sync, and more).
          </p>
          <p>
            <button className={`${sharedStyle.buttonLink} ${sharedStyle.red}`} onClick={() => setDeletingAccount(true)}>
              Delete my account
            </button>
          </p>
        </Fragment>
        : <Fragment>
          <p>
            You cannot delete your account as you still have items in the Store. You have to either transfer them to
            someone else, or mark them as deprecated in order to delete your account.
          </p>
          <p>
            <a href={Routes.STORE_MANAGE}>Go to the Powercord Store</a>
          </p>
        </Fragment>}

      {deletingAccount && (
        <Modal
          title='Delete my account'
          onClose={() => setDeletingAccount(false)}
          onConfirm={() => (location.pathname = Endpoints.YEET_ACCOUNT)}
          closeText='Cancel'
          confirmText='Delete'
          color='red'
        >
          <div>Are you sure you want to delete your account? This operation is irreversible!</div>
        </Modal>
      )}
    </main>
  )
}

// ----

type LinkedAccountProps = {
  platform: string,
  icon: typeof Spotify,
  account?: string,
  explainer: string | JSX.Element
  refreshEndpoint?: string
}

const HEARTS = [ '❤️', '🧡', '💛', '💚', '💙', '💜', '💗', '💖', '💝' ]

function PowercordCutie () {
  const heart = useMemo(() => Math.floor(Math.random() * HEARTS.length), [])

  return (
    <div className={style.cutieContainer}>
      <div className={style.cutieAd}>
        <div className={style.cutieAdHeader}>
          <PowercordCutieBanner className={style.cutieAdBanner}/>
          <Hibiscus className={style.cutieAdHibiscusLeft}/>
          <Hibiscus className={style.cutieAdHibiscusCenter}/>
          <Hibiscus className={style.cutieAdHibiscusRight}/>
        </div>
        <div className={style.cutieAdBody}>
          <h3 className={style.cutieAdTitle}>Support Powercord's Development</h3>
          <div className={style.cutieAdSubtitle}>And get sweet perks</div>

          <div className={style.cutieAdTier}>
            <img className={style.cutieAdIcon} src={blobkiss} alt='Tier 1 icon'/>
            <div>
              <div className={style.cutieAdPrice}>$1/month</div>
              <p className={style.cutieAdDescription}>
                Get a <b>permanent hibiscus badge</b>, <b>custom badge colors</b> on your profile, and a custom role
                in our Discord server.
              </p>
            </div>
          </div>
          <div className={style.cutieAdTier}>
            <img className={style.cutieAdIcon} src={blobsmilehearts} alt='Tier 2 icon'/>
            <div>
              <div className={style.cutieAdPrice}>$5/month</div>
              <p className={style.cutieAdDescription}>
                Get a <b>customizable badge</b> (icon &amp; hover text) on your profile, instead of a simple hibiscus.
              </p>
            </div>
          </div>
          <div className={style.cutieAdTier}>
            <img className={style.cutieAdIcon} src={blobhug} alt='Tier 3 icon'/>
            <div>
              <div className={style.cutieAdPrice}>$10/month</div>
              <p className={style.cutieAdDescription}>
                Get a <b>fully customizable</b> badge for <b>one</b> of your servers, shown next to its name.
              </p>
            </div>
          </div>

          <div className={style.cutieAdButtons}>
            <a href={Routes.PATREON} target='_blank' rel='noreferrer'>Donate on Patreon {HEARTS[heart]}</a>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileBadges ({ badges: userBadges }: { badges: User['badges'] }) {
  return (
    <Fragment>
      <Tooltip text={userBadges.custom.name ?? 'Powercord Cutie'} align='center'>
        {userBadges.custom.icon
          ? <img src={userBadges.custom.icon} className={style.profileBadge}/>
          : <HibiscusMono className={style.profileBadge}/>}
      </Tooltip>
      {userBadges.developer && (
        <Tooltip text='Powercord Developer' align='center'>
          <Developer className={style.profileBadge}/>
        </Tooltip>
      )}
      {userBadges.staff && (
        <Tooltip text='Powercord Staff' align='center'>
          <Staff className={style.profileBadge}/>
        </Tooltip>
      )}
      {userBadges.support && (
        <Tooltip text='Powercord Support' align='center'>
          <Support className={style.profileBadge}/>
        </Tooltip>
      )}
      {userBadges.contributor && (
        <Tooltip text='Powercord Contributor' align='center'>
          <Contributor className={style.profileBadge}/>
        </Tooltip>
      )}
      {userBadges.translator && (
        <Tooltip text='Powercord Translator' align='center'>
          <Translator className={style.profileBadge}/>
        </Tooltip>
      )}
      {userBadges.hunter && (
        <Tooltip text='Powercord Bug Hunter' align='center'>
          <Hunter className={style.profileBadge}/>
        </Tooltip>
      )}
      {userBadges.early && (
        <Tooltip text='Powercord Early User' align='center'>
          <Early className={style.profileBadge}/>
        </Tooltip>
      )}
    </Fragment>
  )
}

function PerksPreview ({ onEdit }: { onEdit: () => void }) {
  const user = useContext(UserContext)!
  return (
    <Fragment>
      <div className={style.profile}>
        <div className={style.profileBanner}/>
        <div className={style.profileSection}>
          <div className={style.profileDecoration}>
            <Avatar user={user} class={style.profileAvatar}/>
            <div className={style.profileBadges} style={{ color: `#${user.badges.custom.color || '7289da'}` }}>
              <ProfileBadges badges={user.badges}/>
            </div>
          </div>
          <div className={style.profileProps}>
            <span>{user.username}</span>
            <span className={style.profileDiscriminator}>#{user.discriminator}</span>
          </div>
        </div>
        <div className={style.profileSection}>
          <h3 className={style.profileHeader}>Roles</h3>
          <div className={style.profileRoles}>
            <div className={style.profileRole}>
              <div className={`${style.profileRoleRound} ${style.profileRoleBlurple}`}/>
              <span>Powercord Cutie</span>
            </div>
            <div className={style.profileRole}>
              <div className={`${style.profileRoleRound} ${style.profileRolePink}`}/>
              <span>Tier {user.cutieStatus.pledgeTier} Cutie</span>
            </div>
          </div>
        </div>
      </div>
      <button className={sharedStyle.button} onClick={onEdit}>Edit perks</button>
    </Fragment>
  )
}

function PerksEdit ({ onReturn }: { onReturn: () => void }) {
  return null
}

function ManagePerks () {
  const [ editing, setEditing ] = useState(false)

  return (
    <div className={style.cutieContainer}>
      <h2>Powercord Cutie perks</h2>
      {editing
        ? <PerksEdit onReturn={() => setEditing(false)}/>
        : <PerksPreview onEdit={() => setEditing(true)}/>}
    </div>
  )
}

function LinkedAccount ({ platform, icon, account, explainer, refreshEndpoint }: LinkedAccountProps) {
  const user = useContext(UserContext)!
  const [ refreshing, setRefreshing ] = useState(false)
  const [ refreshError, setRefreshError ] = useState<string | null>(null)
  const refresh = useCallback(async () => {
    if (!refreshEndpoint) return

    setRefreshing(true)
    setRefreshError(null)
    const resp = await fetch(refreshEndpoint, { method: 'POST' })
    const body = await resp.json()
    setRefreshing(false)

    if (!resp.ok) {
      setRefreshError(body.message)
      return
    }

    user.patch({ cutieStatus: body })
  }, [ refreshEndpoint ])

  return (
    <div className={style.linkedAccount}>
      {h(icon, { className: style.linkedAccountIcon })}
      <div>
        <div className={style.linkedAccountInfo}>
          <span>{account ?? 'No account linked'}</span>
          <div className={style.linkedAccountActions}>
            {!account && (
              // @ts-expect-error
              <a native href={Endpoints.LINK_ACCOUNT(platform)} className={style.linkedAccountAction}>
                <Link/>
                <span>Link accounts</span>
              </a>
            )}
            {!refreshing && account && (
              // @ts-expect-error
              <a native href={Endpoints.UNLINK_ACCOUNT(platform)} className={style.linkedAccountAction}>
                <Remove/>
                <span>Unlink</span>
              </a>
            )}
            {!refreshing && account && refreshEndpoint && (
              <button className={`${sharedStyle.buttonLink} ${style.linkedAccountAction}`} onClick={refresh}>
                <Refresh/>
                <span>Refresh</span>
              </button>
            )}
            {refreshing && <div className={style.linkedAccountAction}>
              <Spinner balls/>
              <span>Refreshing...</span>
            </div>}
          </div>
        </div>
        <div className={style.linkedAccountExplainer}>{explainer}</div>
        {refreshError && <div className={style.linkedAccountError}>
          <AlertCircle/>
          <span>{refreshError}</span>
        </div>}
      </div>
    </div>
  )
}

function Account () {
  useTitle('My Account')
  const user = useContext(UserContext)!
  const [ deletingAccount, setDeletingAccount ] = useState(false)

  return (
    <main>
      <h1>Welcome back, {user.username}</h1>
      <div className={style.columns}>
        <div className={style.linkedAccounts}>
          <h2>Linked accounts</h2>
          <LinkedAccount
            platform='spotify'
            icon={Spotify}
            account={user.accounts.spotify}
            explainer={'Linking your Spotify account gives you an enhanced experience with the Spotify plugin. It\'ll let you add songs to your Liked Songs, add songs to playlists, see private playlists and more.'}
          />
          <LinkedAccount
            platform='patreon'
            icon={Patreon}
            account={user.accounts.patreon}
            explainer={'Link your Patreon account to benefit from the Powercord Cutie perks, and manage them from here.'}
            refreshEndpoint={Endpoints.USER_REFRESH_PLEDGE}
          />

          <hr/>
          <h2>Delete my account</h2>
          {user.canDeleteAccount
            ? <Fragment>
              <p>
                You can choose to permanently delete your Powercord account. Be careful, this action is irreversible and
                will take effect immediately.
              </p>
              <p>
                We will drop any data we have about you, and you'll no longer be able to benefit from features requiring
                a Powercord account (such as enhanced Spotify plugin, settings sync, and more).
              </p>
              <p>
                <button className={`${sharedStyle.buttonLink} ${sharedStyle.red}`} onClick={() => setDeletingAccount(true)}>
                  Delete my account
                </button>
              </p>
            </Fragment>
            : <Fragment>
              <p>
                You cannot delete your account right now as you still have items in the Store. You have to either
                transfer them to someone else, or mark them as deprecated in order to delete your account.
              </p>
              <p>
                <a href={Routes.STORE_MANAGE}>Go to the Powercord Store</a>
              </p>
            </Fragment>}

          {deletingAccount && (
            <Modal
              title='Delete my account'
              onClose={() => setDeletingAccount(false)}
              onConfirm={() => (location.pathname = Endpoints.YEET_ACCOUNT)}
              closeText='Cancel'
              confirmText='Delete'
              color='red'
            >
              <div>Are you sure you want to delete your account? This operation is irreversible!</div>
              {user.cutieStatus.donated && <p><b>Note:</b> You will lose access to your Powercord Cutie perks as well.</p>}
            </Modal>
          )}
        </div>
        {user.cutieStatus.pledgeTier ? <ManagePerks/> : <PowercordCutie/>}
      </div>
    </main>
  )
}

export default function AccountWrapper () {
  return import.meta.env.DEV
    ? <Account/>
    : <AccountOld/>
}
