/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { Attributes } from 'preact'
import { h } from 'preact'

type StoreProps = Attributes & { kind: 'plugins' | 'themes' }

export default function Store ({ kind }: StoreProps) {
  return <div>owo? {kind}</div>
}
