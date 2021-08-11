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

import { h, Fragment } from 'preact'
import { useContext, useState, useEffect } from 'preact/hooks'
import { useTitle } from 'hoofd/preact'

import UserContext from './UserContext'
import { Endpoints, Routes } from '../constants'

import cutieSvg from '../assets/cutie.svg?file'

import style from './account.module.css'
import sharedStyle from './shared.module.css'
import Modal from './util/Modal'

const includes = [
  'A custom role in our server, custom badge color',
  'A custom role in our server, custom badge color, custom profile badge',
  'A custom role in our server, custom badge color, custom profile badge, custom server badge',
]

function Cutie ({ tier }: { tier: number }) {
  return (
    <>
      <div className={style.cutie}>
        <img className={style.cutieLogo} src={cutieSvg} alt='Powercord Cutie'/>
        <div className={style.cutieContents}>
          <span>Thank you for supporting Powercord! You are a tier {tier} patron.</span>
          <span>Includes: {includes[tier - 1]}.</span>
        </div>
      </div>
      {/* Soon! <p>You can customize your perks directly within the Discord client, if you have Powercord injected.</p> */}
    </>
  )
}

export default function Account () {
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
      {Boolean(user.patronTier) && <Cutie tier={user.patronTier!}/>}
      <h3 className={style.header}>Linked Spotify account</h3>
      {typeof user.accounts?.spotify === 'string'
        // @ts-expect-error
        ? <p>{user.accounts.spotify} - <a href={Endpoints.UNLINK_SPOTIFY} native>Unlink</a></p>
        // @ts-expect-error
        : <p>No account linked. <a href={Endpoints.LINK_SPOTIFY} native>Link it now!</a></p>}
      <p>
        Linking your Spotify account gives you an enhanced experience with the Spotify plugin. It'll let you add songs
        to your Liked Songs, add songs to playlists, see private playlists and more.
      </p>

      <h3 className={style.header}>Delete my Powercord account</h3>
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

      {deletingAccount && <Modal
        title='Delete my account'
        onClose={() => setDeletingAccount(false)}
        onConfirm={() => (location.pathname = Endpoints.YEET_ACCOUNT)}
        closeText='Cancel'
        confirmText='Delete'
        danger
      >
        <div>Are you sure you want to delete your account? This operation is irreversible!</div>
        {Boolean(user.patronTier) && <p><b>Note:</b> You will lose your tier {user.patronTier} patron perks!</p>}
      </Modal>}
    </main>
  )
}
