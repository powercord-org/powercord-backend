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

function Wrapper () {
  const [ user, setUser ] = useState<User | null | undefined>(void 0)
  useEffect(() => {
    if (document.cookie.includes('token=')) {
      fetch(Endpoints.USER_SELF)
        .then((r) => r.json())
        .then((u) => {
          if (u.id) {
            const patch = (user: Partial<User>): void => setUser((u) => <User> ({ ...u, ...user, patch: patch }))
            setUser({ ...u, patch: patch })
            return
          }

          setUser(null)
        })
    } else {
      setUser(null)
    }
  }, [])

  return h(App, { user: user })
}

if (import.meta.env.DEV) {
  render(h(Wrapper, null), document.querySelector('#app')!)
} else {
  hydrate(h(Wrapper, null), document.querySelector('#app')!)
}
