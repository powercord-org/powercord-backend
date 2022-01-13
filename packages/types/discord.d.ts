/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

export type User = {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  bot?: boolean
  system?: boolean
  mfa_enabled?: boolean
  locale?: string
  flags?: number
  premium_type?: number
  public_flags?: number
}

export type Member = {
  user: User
  nick?: string | null
  roles: string[]
  joined_at: string
  premium_since?: string | null
  deaf: boolean
  mute: boolean
  pending?: boolean
  permissions?: string
}

// Note: type is incomplete
export type ApiMessage = {
  id: string
  channel_id: string
  guild_id?: string
  author: User
  member?: Member
  content: string
  timestamp: string
  thread?: { id: string }
}
