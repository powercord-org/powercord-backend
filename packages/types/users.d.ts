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
    guild?: {
      id: string | null
      icon: string | null
      name: string | null
    }
  }
  cutieStatus?: CutieStatus
  createdAt: Date
  updatedAt?: Date

  /** @deprecated */
  patronTier?: number
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

export type RestUser = Omit<User, '_id' | 'accounts' | 'createdAt'> & {
  id: User['_id']
  donatorTier?: number
  accounts?: {
    spotify?: string
    github?: string
    patreon?: string
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
