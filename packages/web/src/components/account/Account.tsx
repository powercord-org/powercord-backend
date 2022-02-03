/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { JSX } from 'preact'
import { h, Fragment } from 'preact'
import { useContext, useState, useEffect, useCallback } from 'preact/hooks'
import { useTitle } from 'hoofd/preact'

import Spinner from '../util/Spinner'
import Modal from '../util/Modal'

import PowercordCutie from './Cutie'
import Profile from './Profile'

import UserContext from '../UserContext'
import { Endpoints, Routes } from '../../constants'

import Spotify from 'simple-icons/icons/spotify.svg'
import Patreon from 'simple-icons/icons/patreon.svg'
import Link from 'feather-icons/dist/icons/link.svg'
import Remove from 'feather-icons/dist/icons/x-circle.svg'
import Refresh from 'feather-icons/dist/icons/rotate-cw.svg'
import AlertCircle from 'feather-icons/dist/icons/alert-circle.svg'

import style from './account.module.css'
import sharedStyle from '../shared.module.css'

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

function PerksEdit ({ onReturn }: { onReturn: () => void }) {
  return null
}

function ManagePerks () {
  const user = useContext(UserContext)!
  const [ editing, setEditing ] = useState(false)

  return (
    <div>
      <h2 className={style.title}>Powercord Cutie perks</h2>
      {editing
        ? <PerksEdit onReturn={() => setEditing(false)}/>
        : <Profile user={user} onEdit={() => setEditing(true)}/>}
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
      <div className={style.linkedAccountInfo}>
        <div className={style.linkedAccountHeader}>
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
      <h1 className={style.title}>Welcome back, {user.username}</h1>
      <div className={style.columns}>
        <div className={style.linkedAccounts}>
          <h2 className={style.title}>Linked accounts</h2>
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

          <hr className={style.separator}/>
          <h2 className={style.title}>Delete my account</h2>
          {user.canDeleteAccount
            ? <Fragment>
              <p className={style.paragraph}>
                You can choose to permanently delete your Powercord account. Be careful, this action is irreversible and
                will take effect immediately.
              </p>
              <p className={style.paragraph}>
                We will drop any data we have about you, and you'll no longer be able to benefit from features requiring
                a Powercord account (such as enhanced Spotify plugin, settings sync, and more).
              </p>
              <p className={style.paragraph}>
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
