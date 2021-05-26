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
import { h, Fragment } from 'preact'
import { useTitle, useTitleTemplate } from 'hoofd/preact'
import { Router } from 'preact-router'
import { Link } from 'preact-router/match'

import Redirect from '../util/Redirect'
import LayoutWithSidebar from '../util/LayoutWithSidebar'
import MarkdownDocument from '../docs/Markdown'
import Store from './Store'
import FormLayout from './FormLayout'

import { Routes } from '../../constants'

import Plugin from '../../assets/icons/plugin.svg'
import Theme from '../../assets/icons/brush.svg'
import Yifi from '../../assets/icons/bulb.svg' // private jokes best jokes
import Upload from 'feather-icons/dist/icons/upload.svg'
import Verified from '../../assets/icons/verified.svg'
import HardDisk from 'feather-icons/dist/icons/hard-drive.svg'

import style from './store.module.css'

type StoreProps = Attributes & { url?: string }
type ItemProps = Attributes & { icon: any, href: string, label: string }

function Item ({ icon, href, label }: ItemProps) {
  if (href.startsWith('https')) {
    return (
      <a className={style.item} href={href} target='_blank'>
        {h(icon, null)}
        <span>{label}</span>
      </a>
    )
  }

  return (
    <Link className={style.item} activeClassName={style.active} href={href}>
      {h(icon, null)}
      <span>{label}</span>
    </Link>
  )
}

function Sidebar () {
  return (
    <Fragment>
      <h1 className={style.title}>Powercord Store</h1>
      <Item icon={Plugin} label='Plugins' href={Routes.STORE_PLUGINS}/>
      <Item icon={Theme} label='Themes' href={Routes.STORE_THEMES}/>
      <Item icon={Yifi} label='Suggestions' href={Routes.STORE_SUGGESTIONS}/>

      <div className={style.subTitle}>Get in touch</div>
      <Item icon={Upload} label='Publish a work' href={Routes.STORE_PUBLISH}/>
      <Item icon={Verified} label='Get verified' href={Routes.STORE_VERIFICATION}/>
      <Item icon={HardDisk} label='Host a backend' href={Routes.STORE_HOSTING}/>

      <div className={style.sideFooter}>
        <a href={Routes.STORE_COPYRIGHT}>Copyright policy</a>
      </div>
    </Fragment>
  )
}

export default function Storefront (props: StoreProps) {
  let title = null
  switch (props?.url || typeof location !== 'undefined' ? location.pathname : '/') {
    case Routes.STORE_PLUGINS:
      title = 'Plugins'
      break
    case Routes.STORE_THEMES:
      title = 'Themes'
      break
    case Routes.STORE_PUBLISH:
      title = 'Publish a work'
      break
    case Routes.STORE_VERIFICATION:
      title = 'Get verified'
      break
    case Routes.STORE_HOSTING:
      title = 'Host a backend'
      break
  }

  useTitleTemplate(title ? '%s • Powercord Store' : '')
  useTitle(title ?? 'Powercord Store')

  return (
    <LayoutWithSidebar title={title ?? 'Store'}>
      <Sidebar/>
      <Router url={props?.url}>
        <Store path={Routes.STORE_PLUGINS} kind='plugins'/>
        <Store path={Routes.STORE_THEMES} kind='themes'/>

        <FormLayout id='publish' title='Publish a work' path={Routes.STORE_PUBLISH}>
          publish
        </FormLayout>
        <FormLayout id='verification' title='Get verified' path={Routes.STORE_VERIFICATION}>
          verify
        </FormLayout>
        <FormLayout id='hosting' title='Host a backend' path={Routes.STORE_HOSTING}>
          hosting
        </FormLayout>

        <MarkdownDocument document='store/copyright' path={Routes.STORE_COPYRIGHT}/>
        <Redirect default to={Routes.STORE_PLUGINS}/>
      </Router>
    </LayoutWithSidebar>
  )
}
