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
  donated: boolean
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
  accounts: {
    discord: Omit<ExternalAccount, 'name'>
    spotify?: ExternalAccount
    patreon?: ExternalAccount
  }
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
  cutieStatus?: CutieStatus
  cutiePerks?: CutiePerks
  createdAt: Date
  updatedAt?: Date
}

export type UserBanStatus = {
  _id: string
  account: boolean
  publish: boolean
  verification: boolean
  hosting: boolean
  reporting: boolean
  sync: boolean
  events: boolean
}

export type RestUser = Omit<User, '_id' | 'badges' | 'accounts' | 'cutieStatus' | 'createdAt' | 'updatedAt'> & {
  id: User['_id']
  badges: Required<Exclude<User['badges'], undefined>>
}

export type SelfRestUser = RestUser & {
  cutieStatus: CutieStatus
  canDeleteAccount: boolean
  accounts: {
    spotify: string | undefined
    patreon: string | undefined
  }
}

export type RestAdminUser = RestUser & { banStatus?: UserBanStatus }

export type RestAdminBans = UserBanStatus & { user?: RestAdminUser }

export type MinimalUser = {
  id: string
  username: string
  discriminator: string
  avatar: string | null
}
