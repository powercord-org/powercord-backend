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

import type { User } from './UserContext'
import { h } from 'preact'
import { useCallback } from 'preact/hooks'
import { useTitleTemplate, useMeta } from 'hoofd/preact'
import Router from 'preact-router'
import { Match } from 'preact-router/match'

import UserContext from './UserContext'
import Header from './Header'
import Footer from './Footer'

import AuthBoundary from './util/AuthBoundary'
import { SoonRoute } from './util/Soon'

import Homepage from './Homepage'
import Account from './Account'
import Contributors from './Contributors'
import Stats from './stats/Community'
import Branding from './Branding'
import Storefront from './store/Storefront'
import Documentation from './docs/Documentation'
import Markdown from './docs/Markdown'
import PorkordLicense from './legal/PorkordLicense'
import Terms from './legal/Terms'
import Privacy from './legal/Privacy'
// Backoffice
import NotFound from './NotFound'

import { Routes } from '../constants'

import logo from '../assets/powercord.png'

type AppProps = { user?: void | null | User, url?: string, ctx?: Record<string, any> }

export default function App (props: null | AppProps) {
  const change = useCallback(() => typeof document !== 'undefined' && document.getElementById('app')?.scrollTo(0, 0), [])

  useTitleTemplate('%s • Powercord')
  useMeta({ name: 'og:image', content: logo })
  useMeta({ name: 'og:title', content: 'Powercord' })
  useMeta({ name: 'og:site_name', content: 'Powercord' })
  useMeta({ name: 'og:description', content: 'A lightweight Discord client mod focused on simplicity and performance.' })
  useMeta({ name: 'description', content: 'A lightweight Discord client mod focused on simplicity and performance.' })

  return (
    <UserContext.Provider value={props?.user}>
      <Match>{({ path }: { path: string }) => !path.startsWith('/backoffice') && <Header/>}</Match>
      <Router url={props?.url} onChange={change}>
        <Homepage path={Routes.HOME}/>
        <AuthBoundary path={Routes.ME}><Account/></AuthBoundary>
        <Contributors path={Routes.CONTRIBUTORS}/>
        <Stats path={Routes.STATS}/>
        <Branding path={Routes.BRANDING}/>
        <SoonRoute path={`${Routes.STORE}/:path*`}>
          <Storefront url={props?.url}/>
        </SoonRoute>

        <SoonRoute path={Routes.DOCS_ITEM(':categoryId?', ':documentId?')}>
          <Documentation/>
        </SoonRoute>
        <Markdown document='faq' path={Routes.FAQ}/>
        <Markdown document='installation' path={Routes.INSTALLATION}/>
        <Markdown document='guidelines' path={Routes.GUIDELINES}/>

        <PorkordLicense path={Routes.PORKORD_LICENSE}/>
        <Terms path={Routes.TERMS}/>
        <Privacy path={Routes.PRIVACY}/>

        <SoonRoute path={Routes.BACKOFFICE}>
          <main>todo</main>
        </SoonRoute>
        <NotFound ctx={props?.ctx} default/>
      </Router>
      <Match>{({ path }: { path: string }) => !path.startsWith('/backoffice') && <Footer/>}</Match>
    </UserContext.Provider>
  )
}
