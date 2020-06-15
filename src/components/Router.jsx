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

import Home from './Home'
import Terms from './legal/Terms'
import Privacy from './legal/Privacy'
import MarkdownDocument from './MarkdownDocument'

const Router = () => (
  <Switch>
    <Route path='/' exact>
      <Home/>
    </Route>
    <Route path='/legal/tos' exact>
      <Terms/>
    </Route>
    <Route path='/legal/privacy' exact>
      <Privacy/>
    </Route>
    <Route path='/installation' exact>
      <MarkdownDocument document=''/>
    </Route>
    <Route path='/guidelines' exact>
      <MarkdownDocument document=''/>
    </Route>
    <Route path='/listing-agreement' exact>
      <MarkdownDocument document=''/>
    </Route>
  </Switch>
)

Router.displayName = 'Router'
export default React.memo(Router)
