/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { Attributes } from 'preact'
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
          {/* @ts-ignore */}
          {links.map((l) => <a key={l.url} download={l.name} href={l.url} native>.{l.name.split('.').pop()}</a>)}
        </div>
      </footer>
    </section>
  )
}

export default function Branding (_: Attributes) {
  useTitle('Branding')

  return (
    <main>
      <h1>Branding</h1>
      <p>Please keep all assets in their original shape, proportion, orientation and colors. You are not allowed to
        re-use any asset and/or the Powercord name as a logo and/or name for your own project, or use it to imply our
        endorsement.</p>
      <p>Powercord is spelled with a capital P and all lowercase letters. It may also be spelled all uppercase.</p>

      <div className={style.assets}>
        <Asset
          name='Powercord Plug'
          copyrightYear={2018}
          copyrightHolder='Katlyn Lorimer'
          links={[
            { name: 'plug.png', url: powercord },
            { name: 'plug.svg', url: powercordSvg },
          ]}
        />
        <Asset
          name='Powercord Outlet'
          copyrightYear={2019}
          copyrightHolder='Katlyn Lorimer'
          links={[
            { name: 'outlet.png', url: outlet },
            { name: 'outlet.svg', url: outletSvg },
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
            { name: 'plog.png', url: plog },
          ]}
        />
        <Asset
          name='Spinning Plug'
          copyrightYear={2019}
          copyrightHolder='Cynthia K. Rey'
          links={[
            { name: 'spinning.gif', url: spinning },
          ]}
        />
        <Asset
          name='ms paint thing'
          copyrightYear={2019}
          copyrightHolder='aetheryx'
          links={[
            { name: 'mspaint.png', url: mspaint },
          ]}
        />
        <Asset
          name='Powercast Logo'
          copyrightYear={2019}
          copyrightHolder='Cynthia K. Rey'
          links={[
            { name: 'powercast.png', url: powercast },
            { name: 'powercast.svg', url: powercastSvg },
          ]}
        />
      </div>
    </main>
  )
}
