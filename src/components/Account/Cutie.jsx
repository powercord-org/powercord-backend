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

import style from '@styles/account.scss'

// todo: i18n
const includes = [
  'A custom role in our server, custom badge color',
  'A custom role in our server, custom badge color, custom profile badge',
  'A custom role in our server, custom badge color, custom profile badge, custom server badge'
]

const Cutie = ({ tier }) => (
  <>
    <div className={style.cutie}>
      <img src={require('@assets/cutie.svg').default} alt='Powercord Cutie'/>
      <div>
        <span>Thank you for supporting Powercord! You are a tier {tier} patron.</span>
        <span>Includes: {includes[tier - 1]}.</span>
      </div>
    </div>
    {/* Soon! <p>You can customize your perks directly within the Discord client, if you have Powercord injected.</p> */}
  </>
)

Cutie.displayName = 'Cutie'
export default React.memo(Cutie)
