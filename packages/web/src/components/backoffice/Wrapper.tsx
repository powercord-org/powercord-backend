/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { VNode } from 'preact'
import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { useTitleTemplate } from 'hoofd/preact'

import Spinner from '../util/Spinner'

let Admin: null | (() => VNode) = null
export default function Wrapper () {
  useTitleTemplate('Powercord Admin')
  const forceUpdate = useState(false)[1]

  useEffect(() => {
    if (!Admin) {
      import('./Admin').then((mdl) => {
        Admin = mdl.default
        forceUpdate(true)
      })
    }
  }, [])

  if (!Admin) {
    return (
      <main>
        <Spinner/>
      </main>
    )
  }

  return <Admin/>
}
