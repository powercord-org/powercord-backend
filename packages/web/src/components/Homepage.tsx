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

import type { Attributes } from 'preact'
import { h } from 'preact'
import { useTitleTemplate } from 'hoofd/preact'

import { Routes } from '../constants'

import ArrowRight from 'feather-icons/dist/icons/arrow-right.svg'
import Feather from 'feather-icons/dist/icons/feather.svg'
import Shield from 'feather-icons/dist/icons/shield.svg'
import Home from 'feather-icons/dist/icons/home.svg'
import Update from 'feather-icons/dist/icons/refresh-cw.svg'
import Terminal from 'feather-icons/dist/icons/terminal.svg'
import Download from 'feather-icons/dist/icons/download-cloud.svg'
import PenTool from 'feather-icons/dist/icons/pen-tool.svg'
import Plugin from '../assets/icons/plugin.svg'
import Theme from '../assets/icons/brush.svg'

import style from './homepage.module.css'

type FeatureOldProps = { icon: any, title: string, desc: string, soon?: boolean }

function FeatureOld ({ icon, title, desc, soon }: FeatureOldProps) {
  return (
    <div className={style.featureOld}>
      {h(icon, { className: style.featureIconOld })}
      <h2 className={style.featureNameOld}>{title}</h2>
      <p className={style.featureDescriptionOld}>{desc}</p>
      {soon && <span className={style.soonOld}>soon™️</span>}
    </div>
  )
}

function HomepageOld (_: Attributes) {
  useTitleTemplate('Powercord')

  return (
    <main>
      <h1 className={style.titleOld}>Powerful and simple Discord client mod</h1>
      <div className={style.featuresOld}>
        <FeatureOld
          icon={Feather}
          title='Lightweight'
          desc={'Powercord is designed to use low to no extra resources. You won\'t even notice it\'s here!*'}
        />
        <FeatureOld
          icon={Home}
          title='Native Feeling'
          desc={'We put effort in making our UIs look the same as Discord\'s UIs and ensure high compatibility with themes.'}
        />
        <FeatureOld
          icon={Update}
          title='Built-in Updater'
          desc='Get the newest features, the latest fixes, automatically. We even handle update conflicts for you!'
        />
        <FeatureOld
          icon={Terminal}
          title='Robust APIs'
          desc='Develop great plugins with our powerful APIs. We even take care of error handling when we can!'
        />
        <FeatureOld
          icon={Download}
          title='Plugin/Themes Installer'
          desc='Browse plugins and themes, and install the ones you like by a simple click. All without leaving Discord.'
          soon
        />
        <FeatureOld
          icon={PenTool}
          title='Theme Customization'
          desc='Themes, redefined. Theme devs can let you make the theme *your* theme through an easy configuration screen.'
          soon
        />
      </div>
      <p className={style.note}>
        *Powercord still runs on top of the official Discord client, so it won't magically make it consume less
        memory or CPU. However, we try our best to not consume even more resources.
      </p>
      <div className={style.installOld}>
        <h2>What are you waiting for???</h2>
        <p>Make your Discord spicier. <a href={Routes.INSTALLATION}>Install Powercord!</a></p>
      </div>
    </main>
  )
}

/** ------ **/

type FeatureProps = { icon: any, title: string, description: string, note?: string, link?: string }

function Feature ({ icon, title, description, note, link }: FeatureProps) {
  return (
    <section className={style.feature}>
      <div className={style.featureIcon}>{h(icon, null)}</div>
      <h3 className={style.featureTitle}>{title}</h3>
      <p className={style.featureDescription}>{description}</p>
      {note && <p className={style.note}>{note}</p>}
      {link && <a href={link} className={style.featureLink}>
        <ArrowRight/>
        <span>Explore available plugins</span>
      </a>}
    </section>
  )
}

function Homepage (_: Attributes) {
  useTitleTemplate('Powercord')

  return (
    <main className={style.container}>
      <div className={style.heading}>
        <div className={style.wrapper}>
          <h1 className={style.title}>Powerful and simple Discord client mod</h1>
          <p className={style.motto}>Enhance your Discord experience with new feature and looks. Make your Discord truly yours.</p>
        </div>
      </div>
      <div className={style.wrapper}>
        <section className={style.section}>
          <h2 className={style.sectionTitle}>Zero-compromise experience</h2>
          <div className={style.features}>
            <Feature
              icon={Plugin}
              title='Plugins'
              description={'Add new features to your Discord client, or enhance already existing ones by extending them. You can even write your own plugins!'}
              link={Routes.STORE_PLUGINS}
            />
            <Feature
              icon={Theme}
              title='Themes'
              description={'Give your Discord client a fresh new look, that matches your taste. You\'re no longer limited by what Discord gave you, only imagination!'}
              link={Routes.STORE_THEMES}
            />
            <Feature
              icon={PenTool}
              title='Customizable'
              description={'Plugins and themes are fully customizable, though easy-to-use interfaces, allowing you to turn your Discord client into what you want, whatever that is. Unnecessary feature? Disable it. Don\'t like the color? Change it.'}
            />
            <Feature
              icon={Feather}
              title='Lightweight'
              description={'Powercord is designed to consume as little resources as possible, and provides to plugin developers powerful tools to build efficient and robust plugins.'}
              note={'Note that Powercord still runs on top of the official client, and can\'t magically make it lighter. We just do our best to not consume even more resources.'}
            />
            <Feature
              icon={Shield}
              title='Secure by design'
              description={'Unlike on other mods, plugins have no way of reading your personal information or to access sensible parts of your Discord client, such as authentication tokens.'}
              note={'In addition, plugins are reviewed to ensure no malicious plugin can make its way through.'}
            />
            <Feature
              icon={Home}
              title='Feels like home'
              description={'We try to integrate as smoothly as possible within Discord\'s design language. Every modded element feels like it always has been there. You\'ll almost forget you\'re running a modded client!'}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

export default function HomepageWrapper (_: Attributes) {
  if (!import.meta.env.DEV) {
    return <HomepageOld/>
  }

  return <Homepage/>
}
