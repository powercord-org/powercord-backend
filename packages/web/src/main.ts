/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
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
