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
import { useTitleTemplate } from 'hoofd/preact'

import { Routes } from '../constants'

import Feather from 'feather-icons/dist/icons/feather.svg'
import Home from 'feather-icons/dist/icons/home.svg'
import Update from 'feather-icons/dist/icons/refresh-cw.svg'
import Terminal from 'feather-icons/dist/icons/terminal.svg'
import Download from 'feather-icons/dist/icons/download-cloud.svg'
import PenTool from 'feather-icons/dist/icons/pen-tool.svg'

import style from './homepage.module.css'

type FeatureProps = { icon: any, title: string, desc: string, soon?: boolean }

function Feature ({ icon, title, desc, soon }: FeatureProps) {
  return (
    <div className={style.feature}>
      {h(icon, { className: style.featureIcon })}
      <h2 className={style.featureName}>{title}</h2>
      <p className={style.featureDescription}>{desc}</p>
      {soon && <span className={style.soon}>soon™️</span>}
    </div>
  )
}

export default function Homepage (_: RoutableProps) {
  useTitleTemplate('Powercord')

  return (
    <main>
      <h1 className={style.title}>Powerful and simple Discord client mod</h1>
      <div className={style.features}>
        <Feature
          icon={Feather}
          title='Lightweight'
          desc={'Powercord is designed to use low to no extra resources. You won\'t even notice it\'s here!*'}
        />
        <Feature
          icon={Home}
          title='Native Feeling'
          desc={'We put effort in making our UIs look the same as Discord\'s UIs and ensure high compatibility with themes.'}
        />
        <Feature
          icon={Update}
          title='Built-in Updater'
          desc='Get the newest features, the latest fixes, automatically. We even handle update conflicts for you!'
        />
        <Feature
          icon={Terminal}
          title='Robust APIs'
          desc='Develop great plugins with our powerful APIs. We even take care of error handling when we can!'
        />
        <Feature
          icon={Download}
          title='Plugin/Themes Installer'
          desc='Browse plugins and themes, and install the ones you like by a simple click. All without leaving Discord.'
          soon
        />
        <Feature
          icon={PenTool}
          title='Theme Customization'
          desc='Themes, redefined. Theme devs can let you make the theme *your* theme through an easy configuration screen.'
          soon
        />
      </div>
      <p className={style.performance}>
        *Powercord still runs on top of the official Discord client, so it won't magically make it consume less
        memory or CPU. However, we try our best to not consume even more resources.
      </p>
      <div className={style.install}>
        <h2>What are you waiting for???</h2>
        <p>Make your Discord spicier. <a href={Routes.INSTALLATION}>Install Powercord!</a></p>
      </div>
    </main>
  )
}
