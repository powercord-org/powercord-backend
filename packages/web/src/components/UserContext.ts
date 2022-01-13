/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import { createContext } from 'preact'

export type User = {
  id: string
  username: string
  discriminator: string
  avatar: string
  patronTier?: 0 | 1 | 2 | 3
  badges: {
    developer: boolean
    staff: boolean
    support: boolean
    contributor: boolean
    translator: boolean
    hunter: boolean
    early: boolean
    custom: {
      color: string
      icon: string
      white: string
      name: string
    }
  }
  accounts: {
    spotify?: string
    github?: string
  }
}

export default createContext<User | null | undefined>(void 0)
