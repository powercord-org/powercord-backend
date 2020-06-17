/*
 * Copyright (c) 2018-2020 aetheryx & Bowser65
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

import React from 'react'
import { Link } from 'react-router-dom'

import { Routes } from '../constants'

import style from '@styles/cookies.scss'

const AGREE_DATE = '2020-06-15'

const Cookies = () => {
  if (process.env.BUILD_SIDE === 'server') {
    return null
  }

  const [ hasAgreed, setHasAgreed ] = React.useState(localStorage.getItem('cookie-consent') === AGREE_DATE)
  const onAgree = () => {
    setHasAgreed(true)
    localStorage.setItem('cookie-consent', AGREE_DATE)
  }

  return !hasAgreed && (
    <div className={style.container}>
      <img src='https://cdn.discordapp.com/emojis/396521772855590916.png' alt='cookie'/>
      <p>Cookies help us deliver our Service. By using the website or clicking I agree, you agree to our <Link to={Routes.PRIVACY}>use of cookies</Link></p>
      <button onClick={onAgree}>Yea I agree</button>
    </div>
  )
}

Cookies.displayName = 'Cookies'
export default React.memo(Cookies)
