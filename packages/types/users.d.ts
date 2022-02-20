/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

export type ExternalAccount = {
  tokenType: string
  accessToken: string
  refreshToken: string
  expiresAt: number
  name: string
}

export type CutieStatus = {
  pledgeTier: number
  perksExpireAt: number
  lastManualRefresh?: number
}

export type CutiePerks = {
  color: string | null
  badge: string | null
  title: string | null
}

export type User = {
  _id: string
  username: string
  discriminator: string
  avatar: string | null
  flags: number
  accounts: {
    discord: Omit<ExternalAccount, 'name'>
    spotify?: ExternalAccount
    patreon?: ExternalAccount
  }
  cutieStatus?: CutieStatus
  cutiePerks?: CutiePerks
  createdAt: Date
  updatedAt?: Date
}

export type GhostUser = {
  _id: string
  username: null
  discriminator: null
  avatar: string | null
  flags: number
}

export type RestUser = Omit<User, '_id' | 'accounts' | 'cutieStatus' | 'cutiePerks' | 'createdAt' | 'updatedAt'> & {
  id: User['_id']
  cutiePerks: Exclude<User['cutiePerks'], undefined>

  /** @deprecated */
  badges?: {
    developer?: boolean
    staff?: boolean
    support?: boolean
    contributor?: boolean
    hunter?: boolean
    early?: boolean
    translator?: boolean
    custom?: {
      color: string | null
      icon: string | null
      name: string | null
    }
  }
}

export type SelfRestUser = Omit<RestUser, 'id'> & {
  _id: User['_id']
  cutieStatus: CutieStatus
  accounts: {
    spotify: string | undefined
    patreon: string | undefined
  }
}

export type RestAdminUser = SelfRestUser

export type MinimalUser = {
  _id: string
  username: string
  discriminator: string
  avatar: string | null
}
