/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { JSX } from 'preact'
import { h } from 'preact'
import { useContext } from 'preact/hooks'
import { useRouter } from 'preact-router'
import { useTitleTemplate } from 'hoofd/preact'
import { UserFlags } from '@powercord/shared/flags'

import Spinner from './Spinner'
import Redirect from './Redirect'
import UserContext from '../UserContext'
import { Endpoints } from '../../constants'

type AuthBoundaryProps = { children: JSX.Element, staff?: boolean } & Record<string, unknown>

export default function AuthBoundary ({ children, staff }: AuthBoundaryProps) {
  const user = useContext(UserContext)
  const [ { url: path } ] = useRouter()

  if (user === void 0) {
    useTitleTemplate('Powercord')
    return (
      <main>
        <Spinner/>
      </main>
    )
  }

  if (!user) {
    return (
      <main>
        <h1>You must be authenticated to see this</h1>
        <p>
          {/* @ts-ignore */}
          <a href={`${Endpoints.LOGIN}?redirect=${path}`} native>Login</a>
        </p>
      </main>
    )
  }

  if (staff && ((user?.flags ?? 0) & UserFlags.STAFF)) {
    return <Redirect to='/'/>
  }

  return children
}
