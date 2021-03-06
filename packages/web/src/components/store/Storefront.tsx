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
import type { EligibilityStatus } from '@powercord/types/store'
import { h, Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { useTitleTemplate } from 'hoofd/preact'
import { Router } from 'preact-router'
import { Link } from 'preact-router/match'

import Redirect from '../util/Redirect'
import LayoutWithSidebar from '../util/LayoutWithSidebar'
import MarkdownDocument from '../docs/Markdown'
import Store from './Store'
import PublishForm from './form/Publish'
import VerificationForm from './form/Verification'
import HostingForm from './form/Hosting'

import { Endpoints, Routes } from '../../constants'

import Plugin from '../../assets/icons/plugin.svg'
import Theme from '../../assets/icons/brush.svg'
import Yifi from '../../assets/icons/bulb.svg' // private jokes best jokes alexclickYifi
import Upload from 'feather-icons/dist/icons/upload.svg'
import Verified from '../../assets/icons/verified.svg'
import HardDisk from 'feather-icons/dist/icons/hard-drive.svg'

import style from './store.module.css'

type StoreProps = Attributes & { url?: string }
type ItemProps = Attributes & { icon: any, href: string, label: string }

let eligibilityCache: EligibilityStatus | null = null
function useEligibility () {
  const [ eligibility, setEligibility ] = useState(eligibilityCache)
  useEffect(() => {
    if (!eligibility) {
      fetch(Endpoints.STORE_FORM_ELIGIBILITY).then((res) => {
        if (res.status !== 200) {
          setEligibility({ publish: 1, verification: 1, hosting: 1, reporting: 1 })
          return
        }

        res.json().then((e) => setEligibility(e))
      })
    }
  }, [])

  return eligibility
}

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
    <Link class={style.item} activeClassName={style.active} href={href}>
      {h(icon, null)}
      <span>{label}</span>
    </Link>
  )
}

function Sidebar () {
  return (
    <Fragment>
      <h1>Powercord Store</h1>
      <Item icon={Plugin} label='Plugins' href={Routes.STORE_PLUGINS}/>
      <Item icon={Theme} label='Themes' href={Routes.STORE_THEMES}/>
      <Item icon={Yifi} label='Suggestions' href={Routes.STORE_SUGGESTIONS}/>

      <div className={style.subTitle}>Get in touch</div>
      <Item icon={Upload} label='Publish your work' href={Routes.STORE_PUBLISH}/>
      <Item icon={Verified} label='Get verified' href={Routes.STORE_VERIFICATION}/>
      <Item icon={HardDisk} label='Host a backend' href={Routes.STORE_HOSTING}/>

      <div className={style.sideFooter}>
        <a href={Routes.STORE_COPYRIGHT}>Copyright policy</a>
      </div>
    </Fragment>
  )
}

export default function Storefront (props: StoreProps) {
  const eligibility = useEligibility()
  useTitleTemplate('%s • Powercord Store')

  return (
    <LayoutWithSidebar>
      <Sidebar/>
      <Router url={props?.url}>
        <Store path={Routes.STORE_PLUGINS} kind='plugins'/>
        <Store path={Routes.STORE_THEMES} kind='themes'/>

        <PublishForm path={Routes.STORE_PUBLISH} eligibility={eligibility?.publish}/>
        <VerificationForm path={Routes.STORE_VERIFICATION} eligibility={eligibility?.verification}/>
        <HostingForm path={Routes.STORE_HOSTING} eligibility={eligibility?.hosting}/>

        <MarkdownDocument document='store/copyright' path={Routes.STORE_COPYRIGHT}/>
        <Redirect default to={Routes.STORE_PLUGINS}/>
      </Router>
    </LayoutWithSidebar>
  )
}
