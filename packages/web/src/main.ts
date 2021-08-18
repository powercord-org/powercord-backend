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

import type { User } from './components/UserContext'
import { h, render, hydrate } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import App from './components/App'
import { Endpoints } from './constants'
import './main.css'

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-inner-declarations
  function Wrapper () {
    const [ user, setUser ] = useState<undefined | null | User>(void 0)
    useEffect(() => {
      if (document.cookie.includes('token=')) {
        fetch(Endpoints.USER_SELF)
          .then((r) => r.json())
          .then((u) => setUser(u.id ? u : null))
      } else {
        setUser(null)
      }
    }, [])

    return h(App, { user: user })
  }

  render(h(Wrapper, null), document.querySelector('#app')!)
} else {
  (async function () {
    const user = document.cookie.includes('token=')
      ? await fetch(Endpoints.USER_SELF).then((r) => r.json()).then((u) => u.id ? u : null)
      : null

    hydrate(h(App, { user: user }), document.querySelector('#app')!)
  }())
}
