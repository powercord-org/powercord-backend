/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { User } from './UserContext'
import { h } from 'preact'
import { useCallback } from 'preact/hooks'
import { useTitleTemplate, useMeta } from 'hoofd/preact'
import Router from 'preact-router'

import UserContext from './UserContext'
import Header from './Header'
import Footer from './Footer'

import AuthBoundary from './util/AuthBoundary'
import { SoonRoute } from './util/Soon'

import Homepage from './Homepage'
import Account from './account/Account'
import Contributors from './Contributors'
import Stats from './stats/Community'
import Branding from './Branding'
import Storefront from './store/Storefront'
import Documentation from './docs/Documentation'
import Markdown from './docs/Markdown'
import PorkordLicense from './legal/PorkordLicense'
import Terms from './legal/Terms'
import Privacy from './legal/Privacy'
import AdminWrapper from './backoffice/Wrapper'
import NotFound from './NotFound'

import { Routes } from '../constants'

import logo from '../assets/powercord.png'

type AppProps = { user?: null | User, url?: string, ctx?: Record<string, any> }

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
      <Header/>
      <Router url={props?.url} onChange={change}>
        <Homepage path={Routes.HOME}/>
        <AuthBoundary path={Routes.ME}><Account/></AuthBoundary>
        <Contributors path={Routes.CONTRIBUTORS}/>
        <Stats path={Routes.STATS}/>
        <Branding path={Routes.BRANDING}/>
        <SoonRoute path={`${Routes.STORE}/:path*`}>
          <Storefront path={`${Routes.STORE}/:path*`} url={props?.url}/>
        </SoonRoute>

        <SoonRoute path={Routes.DOCS_ITEM(':categoryId?', ':documentId?')}>
          <Documentation path={Routes.DOCS_ITEM(':categoryId?', ':documentId?')}/>
        </SoonRoute>
        <Markdown document='faq' path={Routes.FAQ}/>
        <Markdown document='installation' path={Routes.INSTALLATION}/>
        <Markdown document='guidelines' path={Routes.GUIDELINES}/>

        <PorkordLicense path={Routes.PORKORD_LICENSE}/>
        <Terms path={Routes.TERMS}/>
        <Privacy path={Routes.PRIVACY}/>

        <AuthBoundary staff path={`${Routes.BACKOFFICE}/:path*`}>
          <AdminWrapper/>
        </AuthBoundary>
        <NotFound ctx={props?.ctx} default/>
      </Router>
      <Footer/>
    </UserContext.Provider>
  )
}
