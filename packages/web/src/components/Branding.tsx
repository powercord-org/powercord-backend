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

import type { RoutableProps } from 'preact-router'
import { h } from 'preact'
import { useTitle } from 'hoofd/preact'

import powercord from '../assets/powercord.png'
import powercordSvg from '../assets/powercord.svg?file'
import outlet from '../assets/branding/outlet.png'
import outletSvg from '../assets/branding/outlet.svg?file'
import plog from '../assets/branding/plog.png'
import spinning from '../assets/branding/spinning.gif'
import mspaint from '../assets/branding/mspaint.png'
import powercast from '../assets/branding/powercast.png'
import powercastSvg from '../assets/branding/powercast.svg?file'

import style from './branding.module.css'

type AssetProps = {
  name: string
  copyrightYear: number
  copyrightHolder: string
  links: Array<{ name: string, url: string }>
}

function Asset ({ name, copyrightYear, copyrightHolder, links }: AssetProps) {
  return (
    <section className={style.assetContainer}>
      <h3 className={style.assetName}>{name}</h3>
      <img className={style.asset} src={links[links.length - 1].url} alt={name}/>
      <footer className={style.assetFooter}>
        <div className={style.copyright}>
          Copyright &copy; {copyrightYear} {copyrightHolder}, All Rights Reserved.
        </div>
        <div className={style.links}>
          {links.map(l => (
            <a key={l.url} download={l.name} href={l.url}>.{l.name.split('.').pop()}</a>
          ))}
        </div>
      </footer>
    </section>
  )
}

export default function Branding (_: RoutableProps) {
  useTitle('Branding')

  return (
    <main>
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
            { name: 'plug.png', url: powercord },
            { name: 'plug.svg', url: powercordSvg }
          ]}
        />
        <Asset
          name='Powercord Outlet'
          copyrightYear={2019}
          copyrightHolder='Katlyn Lorimer'
          links={[
            { name: 'outlet.png', url: outlet },
            { name: 'outlet.svg', url: outletSvg }
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
            { name: 'plog.png', url: plog }
          ]}
        />
        <Asset
          name='Spinning Plug'
          copyrightYear={2019}
          copyrightHolder='Cynthia K. Rey'
          links={[
            { name: 'spinning.gif', url: spinning }
          ]}
        />
        <Asset
          name='ms paint thing'
          copyrightYear={2019}
          copyrightHolder='aetheryx'
          links={[
            { name: 'mspaint.png', url: mspaint }
          ]}
        />
        <Asset
          name='Powercast Logo'
          copyrightYear={2019}
          copyrightHolder='Cynthia K. Rey'
          links={[
            { name: 'powercast.png', url: powercast },
            { name: 'powercast.svg', url: powercastSvg }
          ]}
        />
      </div>
    </main>
  )
}
