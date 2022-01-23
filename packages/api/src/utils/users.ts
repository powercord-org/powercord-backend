/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { User, RestUser } from '@powercord/types/users'

type CustomBadges = Exclude<User['badges'], undefined>['custom']

function paywallify (customBadges: CustomBadges, tier: number): Exclude<CustomBadges, undefined> {
  tier = 69 // todo: we don't keep track of patreon tier yet
  return {
    color: tier < 1 ? null : customBadges?.color || null,
    icon: tier < 2 ? null : customBadges?.icon || null,
    name: tier < 2 ? null : customBadges?.name || null,
  }
}

/** @deprecated */
export function formatUser (user: User, bypassVisibility?: boolean): RestUser {
  return {
    id: user._id,
    username: user.username,
    discriminator: user.discriminator,
    avatar: user.avatar,
    badges: {
      developer: Boolean(user.badges?.developer),
      staff: Boolean(user.badges?.staff),
      support: Boolean(user.badges?.support),
      contributor: Boolean(user.badges?.contributor),
      translator: user.badges?.translator || false, // Array of langs or false
      hunter: Boolean(user.badges?.hunter),
      early: Boolean(user.badges?.early),
      custom: paywallify(user.badges?.custom, user.patronTier || 0),
    },
    patronTier: bypassVisibility ? user.patronTier : void 0,
    accounts: bypassVisibility
      ? {
        spotify: user.accounts.spotify?.name || void 0,
        github: user.accounts.github?.name || void 0,
        patreon: user.accounts.patreon?.name || void 0,
      }
      : void 0,
  }
}
