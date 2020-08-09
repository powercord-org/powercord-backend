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
import Helmet from 'react-helmet'

import Container from '../Container'
import Asset from './Asset'

import style from '@styles/branding.scss'

const Branding = () => {
  return (
    <Container>
      <Helmet>
        <title>Branding</title>
      </Helmet>
      <h1>Branding</h1>
      <p>Please keep all assets in their original shape, proportion, orientation and colors. You are not allowed to
        re-use any asset and/or the Powercord name as a logo and/or name for your own project, or use it to imply our
        endorsement.</p>

      <div className={style.assets}>
        <Asset
          name='Powercord Plug'
          copyrightYear={2018}
          copyrightHolder='Katlyn Lorimer'
          links={[
            { name: 'plug.png', url: require('@assets/powercord.png').default },
            { name: 'plug.svg', url: require('@assets/powercord.svg').default }
          ]}
        />
        <Asset
          name='Powercord Outlet'
          copyrightYear={2019}
          copyrightHolder='Katlyn Lorimer'
          links={[
            { name: 'outlet.png', url: require('@assets/branding/outlet.png').default },
            { name: 'outlet.svg', url: require('@assets/branding/outlet.svg').default }
          ]}
        />
      </div>

      <h3>Meme branding</h3>
      <p>Those logos are <b>not</b> meant for usage. We don't mind them being used for Powercord-related content,
        but do not use them as official ways of representing Powercord and its brand.</p>

      <div className={style.assets}>
        <Asset
          name='Porkord Plog'
          copyrightYear={2020}
          copyrightHolder='aetheryx'
          links={[
            { name: 'plog.png', url: require('@assets/branding/plog.png').default }
          ]}
        />
        <Asset
          name='Spinning Plug'
          copyrightYear={2019}
          copyrightHolder='Bowser65'
          links={[
            { name: 'spinning.gif', url: require('@assets/branding/spinning.gif').default }
          ]}
        />
        <Asset
          name='ms paint thing'
          copyrightYear={2019}
          copyrightHolder='aetheryx'
          links={[
            { name: 'mspaint.png', url: require('@assets/branding/mspaint.png').default }
          ]}
        />
        <Asset
          name='Powercast Logo'
          copyrightYear={2019}
          copyrightHolder='Bowser65'
          links={[
            { name: 'powercast.png', url: require('@assets/branding/powercast.png').default },
            { name: 'powercast.svg', url: require('@assets/branding/powercast.svg').default }
          ]}
        />
      </div>
    </Container>
  )
}

Branding.displayName = 'Branding'
export default React.memo(Branding)
