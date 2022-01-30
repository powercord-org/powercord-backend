/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { JSX } from 'preact'
import { h, Fragment } from 'preact'
import { useContext, useState, useEffect, useMemo } from 'preact/hooks'
import { useTitle } from 'hoofd/preact'

import Modal from './util/Modal'

import UserContext from './UserContext'
import { Endpoints, Routes } from '../constants'

import Spotify from 'simple-icons/icons/spotify.svg'
import Patreon from 'simple-icons/icons/patreon.svg'
import GitHub from 'simple-icons/icons/github.svg'
import PowercordCutieBanner from '../assets/donate/banner.svg?sprite=cutie'
import Hibiscus from '../assets/hibiscus.svg?sprite=cutie'
import cutieSvg from '../assets/donate/cutie.svg?file'

import blobkiss from '../assets/donate/blobkiss.png'
import blobsmilehearts from '../assets/donate/blobsmilehearts.png'
import blobhug from '../assets/donate/blobhug.png'

import style from './account.module.css'
import sharedStyle from './shared.module.css'

const includes = [
  'A custom role in our server, custom badge color',
  'A custom role in our server, custom badge color, custom profile badge',
  'A custom role in our server, custom badge color, custom profile badge, custom server badge',
]

function CutieOld ({ tier }: { tier: number }) {
  return (
    <>
      <div className={style.cutieOld}>
        <img className={style.cutieLogoOld} src={cutieSvg} alt='Powercord Cutie'/>
        <div className={style.cutieContentsOld}>
          <span>Thank you for supporting Powercord! You are a tier {tier} patron.</span>
          <span>Includes: {includes[tier - 1]}.</span>
        </div>
      </div>
      {/* Soon! <p>You can customize your perks directly within the Discord client, if you have Powercord injected.</p> */}
    </>
  )
}

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
      {Boolean(user.patronTier) && <CutieOld tier={user.patronTier!}/>}
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
          {Boolean(user.patronTier) && <p><b>Note:</b> You will lose your tier {user.patronTier} patron perks!</p>}
        </Modal>
      )}
    </main>
  )
}

// ----

type LinkedAccountProps = { platform: string, icon: typeof Spotify, account?: string, explainer: string | JSX.Element }

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

function ManagePerks () {
  return (
    <div className={style.cutieContainer}>
      <h2>Donator perks</h2>
    </div>
  )
}

function LinkedAccount ({ platform, icon, account, explainer }: LinkedAccountProps) {
  return (
    <div className={style.linkedAccount}>
      {h(icon, { className: style.linkedAccountIcon })}
      <div>
        {account
          // @ts-expect-error
          ? <div>{account} - <a native href={Endpoints.UNLINK_ACCOUNT(platform)}>Unlink</a></div>
          // @ts-expect-error
          : <div>No account linked - <a native href={Endpoints.LINK_ACCOUNT(platform)}>Link it now</a></div>}
        <div className={style.linkedAccountExplainer}>{explainer}</div>
      </div>
    </div>
  )
}

function Account () {
  useTitle('My Account')
  const user = useContext(UserContext)!
  const [ canDeleteAccount, setCanDeleteAccount ] = useState(true)
  const [ deletingAccount, setDeletingAccount ] = useState(false)

  useEffect(() => {
    // todo: check if the user can delete their account
    setCanDeleteAccount(true)
  }, [ user.id ])

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
          {import.meta.env.DEV && <LinkedAccount
            platform='github'
            icon={GitHub}
            account={user.accounts.github}
            explainer={<>
              Linking your GitHub is required in order to publish works in
              the <a href={Routes.STORE_PLUGINS}>Powercord Store</a>. If you are a contributor, it will be shown on
              the <a href={Routes.CONTRIBUTORS}>contributors page</a>.
            </>}
          />}
          {import.meta.env.DEV && <LinkedAccount
            platform='patreon'
            icon={Patreon}
            account={user.accounts.patreon}
            explainer={'Link your Patreon account to benefit from the Powercord Cutie perks, and manage them from here.'}
          />}

          <hr/>
          <h2>Delete my account</h2>
          {canDeleteAccount
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
              {Boolean(user.patronTier) && <p><b>Note:</b> You will lose your tier {user.patronTier} patron perks!</p>}
            </Modal>
          )}
        </div>
        {user.patronTier ? <ManagePerks/> : <PowercordCutie/>}
      </div>
    </main>
  )
}

export default function AccountWrapper () {
  return import.meta.env.DEV
    ? <Account/>
    : <AccountOld/>
}
