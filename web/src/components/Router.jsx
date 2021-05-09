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

import { memo, lazy, Suspense } from 'react'
import { Switch, Route } from 'react-router-dom'
import Helmet from 'react-helmet'

import { Routes } from '@constants'

import AuthBoundary from './AuthBoundary'
import Home from './Home'
import Account from './Account'
import Contributors from './Contributors'
import Stats from './Stats'
import Branding from './Branding'
import Documentation from './Documentation'
import Advisories from './Advisories/List'
import Advisory from './Advisories/Advisory'
import MarkdownDocument from './MarkdownDocument'
import PorkordLicense from './legal/PorkordLicense'
import Terms from './legal/Terms'
import Privacy from './legal/Privacy'
import NotFound from './NotFound'
import Soon from './Soon'

const Backoffice = lazy(() => import('./backoffice/Layout'))

function BackofficeWrapperComponent () { // Wrapper component is needed to ensure no suspense gets rendered server-side
  if (process.env.BUILD_SIDE === 'server') {
    return 'Loading...'
  }

  return (
    <AuthBoundary staff>
      <Suspense fallback='Loading...'>
        <Backoffice/>
      </Suspense>
    </AuthBoundary>
  )
}

BackofficeWrapperComponent.displayName = 'BackofficeWrapper'
const BackofficeWrapper = memo(BackofficeWrapperComponent)

function Router () {
  return (
    <Switch>
      <Route path={Routes.HOME} exact>
        <Home/>
      </Route>
      <Route path={Routes.ME} exact>
        <AuthBoundary>
          <Account/>
        </AuthBoundary>
      </Route>
      <Route path={Routes.CONTRIBUTORS} exact>
        <Contributors/>
      </Route>
      <Route path={Routes.STATS} exact>
        <Stats/>
      </Route>
      <Route path={Routes.BRANDING} exact>
        <Branding/>
      </Route>
      <Route path={Routes.STORE} exact>
        {process.env.NODE_ENV === 'development' ? <main>todo</main> : <Soon/>}
      </Route>
      <Route path={Routes.ADVISORIES} exact>
        {process.env.NODE_ENV === 'development' ? <Advisories/> : <Soon/>}
      </Route>
      <Route path={Routes.ADVISORY(':id')} exact>
        {process.env.NODE_ENV === 'development' ? <Advisory/> : <Soon/>}
      </Route>
      <Route path={Routes.BACKOFFICE}>
        {process.env.NODE_ENV === 'development' ? <BackofficeWrapper/> : <Soon/>}
      </Route>
      {/* Documents */}
      <Route path={[ Routes.DOCS, Routes.DOCS_ITEM(':category', ':document') ]} exact>
        {process.env.NODE_ENV === 'development' ? <Documentation/> : <Soon/>}
      </Route>
      <Route path={Routes.FAQ} exact>
        <Helmet>
          <title>Frequently Asked Questions</title>
        </Helmet>
        <MarkdownDocument document='faq'/>
      </Route>
      <Route path={Routes.INSTALLATION} exact>
        <Helmet>
          <title>Installation</title>
        </Helmet>
        <MarkdownDocument document='installation'/>
      </Route>
      <Route path={Routes.GUIDELINES} exact>
        <Helmet>
          <title>Guidelines</title>
        </Helmet>
        <MarkdownDocument document='guidelines'/>
      </Route>
      <Route path={Routes.LISTING_AGREEMENT} exact>
        <Helmet>
          <title>Listing Agreement</title>
        </Helmet>
        <MarkdownDocument document='listing-agreement'/>
      </Route>
      {/* Legal */}
      <Route path={Routes.PORKORD_LICENSE} exact>
        <PorkordLicense/>
      </Route>
      <Route path={Routes.TERMS} exact>
        <Terms/>
      </Route>
      <Route path={Routes.PRIVACY} exact>
        <Privacy/>
      </Route>
      {/* Fallback */}
      <Route>
        <NotFound/>
      </Route>
    </Switch>
  )
}

Router.displayName = 'Router'
export default memo(Router)
