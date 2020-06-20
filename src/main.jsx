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
import ReactDOM from 'react-dom'
import UserContext from '@components/UserContext'
import { BrowserRouter as Router } from 'react-router-dom'

import('@components/App' /* webpackChunkName: "app" */).then(mdl => {
  const App = mdl.default
  if (process.env.NODE_ENV === 'production') {
    ReactDOM.hydrate(
      <Router>
        <UserContext.Provider value={window.USER}>
          <App/>
        </UserContext.Provider>
      </Router>, document.querySelector('#react-root')
    )
  } else {
    ReactDOM.render(
      <Router>
        <UserContext.Provider value={window.USER}>
          <App/>
        </UserContext.Provider>
      </Router>, document.querySelector('#react-root')
    )
  }
  document.getElementById('init').remove()
  delete window.USER
})
