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
import { Switch, Route } from 'react-router-dom'

import { Routes } from '../constants'
import Home from './Home'
import Contributors from './Contributors'
import PeopleAreDumb from './PeopleAreDumb'
import MarkdownDocument from './MarkdownDocument'
import Terms from './legal/Terms'
import Privacy from './legal/Privacy'

const Router = () => (
  <Switch>
    <Route path={Routes.HOME} exact>
      <Home/>
    </Route>
    <Route path={Routes.CONTRIBUTORS} exact>
      <Contributors/>
    </Route>
    <Route path={Routes.STATS} exact>
      <main>todo</main>
    </Route>
    <Route path={Routes.BRANDING} exact>
      <main>todo</main>
    </Route>
    {/* Documents */}
    <Route path={Routes.FAQ} exact>
      <PeopleAreDumb/>
    </Route>
    <Route path={Routes.INSTALLATION} exact>
      <MarkdownDocument document='installation'/>
    </Route>
    <Route path={Routes.GUIDELINES} exact>
      <MarkdownDocument document='guidelines'/>
    </Route>
    <Route path={Routes.LISTING_AGREEMENT} exact>
      <MarkdownDocument document='listing-agreement'/>
    </Route>
    {/* Legal */}
    <Route path={Routes.TERMS} exact>
      <Terms/>
    </Route>
    <Route path={Routes.PRIVACY} exact>
      <Privacy/>
    </Route>
    {/* Fallback */}
    <Route>
      <main>404</main>
    </Route>
  </Switch>
)

Router.displayName = 'Router'
export default React.memo(Router)