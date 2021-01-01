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

import { memo, useContext } from 'react'
import { Link } from 'react-router-dom'

import { Endpoints, Routes } from '@constants'
import UserContext from './UserContext'

import style from '@styles/header.scss'

function LoginButton () {
  const user = useContext(UserContext)

  return (
    user
      ? <>
        <div className={style.profile}>
          <img src={Endpoints.USER_AVATAR(user.id)} alt={`${user.username}'s avatar`}/>
          <div className={style.details}>
            <div className={style.name}>
              <div>{user.username}<span>#{user.discriminator}</span></div>
              {user.badges.staff && <svg xmlns='http://www.w3.org/2000/svg' viewBox="0 0 24 24" width='16' height='16'>
                <path
                  fill='currentColor'
                  d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4m3.08 15L12 14.15L8.93 16l.81-3.5l-2.71-2.34l3.58-.31L12 6.55l1.39 3.29l3.58.31l-2.71 2.35l.82 3.5z'
                />
              </svg>}
            </div>
            <div>
              <Link to={Routes.ME}>Account</Link>
              <a href={Endpoints.LOGOUT}>Logout</a>
            </div>
            {user.badges.staff && <Link to={Routes.BACKOFFICE}>Admin panel</Link>}
          </div>
        </div>
      </>
      : <a href={Endpoints.LOGIN} className={style.button}>Login with Discord</a>
  )
}

LoginButton.displayName = 'LoginButton'
export default memo(LoginButton)
