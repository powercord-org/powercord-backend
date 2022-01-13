/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { Attributes } from 'preact'
import { route } from 'preact-router'

type RedirectProps = Attributes & { to: string }

export default function Redirect ({ to }: RedirectProps) {
  route(to)
  return null
}
