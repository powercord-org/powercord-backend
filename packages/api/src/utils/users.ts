/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { User, RestUser, SelfRestUser } from '@powercord/types/users'
import { UserFlags, PrivateUserFlags } from '@powercord/shared/flags'

type DeprecatedCustomBadges = {
  color: string | null
  icon: string | null
  name: string | null
}

function formatBadges (user: User): DeprecatedCustomBadges {
  const appliedColor = user.cutiePerks?.color ?? '7289da'
  const donatorBadge: DeprecatedCustomBadges = {
    color: null,
    icon: null,
    name: null,
  }

  if (user.flags & UserFlags.HAS_DONATED) {
    donatorBadge.name = 'Former Powercord Cutie'
    donatorBadge.icon = 'https://powercord.dev/api/v2/hibiscus/7289da.svg'
  }

  if (user.flags & UserFlags.IS_CUTIE) {
    donatorBadge.name = 'Powercord Cutie'
    donatorBadge.icon = `https://powercord.dev/api/v2/hibiscus/${appliedColor}.svg`

    if ((user.cutieStatus?.pledgeTier ?? 1) >= 2) {
      donatorBadge.icon = user.cutiePerks?.badge || `https://powercord.dev/api/v2/hibiscus/${appliedColor}.svg`
      donatorBadge.name = user.cutiePerks?.title || 'Powercord Cutie'
    }
  }

  return donatorBadge
}

export async function formatUser (user: User, bypassVisibility?: boolean): Promise<RestUser | SelfRestUser> {
  const customBadges = formatBadges(user)
  const cutiePerks = {
    color: customBadges.color,
    badge: customBadges.icon?.startsWith('https://powercord.dev/api/v2/hibiscus') ? 'default' : customBadges.icon,
    title: customBadges.name,
  }

  if (!bypassVisibility) {
    return {
      id: user._id,
      username: 'Herobrine',
      discriminator: '0000',
      avatar: null,
      flags: 0,
      badges: {
        developer: (user.flags & UserFlags.DEVELOPER) !== 0,
        staff: (user.flags & UserFlags.STAFF) !== 0,
        support: (user.flags & UserFlags.SUPPORT) !== 0,
        contributor: (user.flags & UserFlags.CONTRIBUTOR) !== 0,
        translator: (user.flags & UserFlags.TRANSLATOR) !== 0,
        hunter: (user.flags & UserFlags.BUG_HUNTER) !== 0,
        early: (user.flags & UserFlags.EARLY_USER) !== 0,
        custom: customBadges,
      },
      cutiePerks: cutiePerks,
    }
  }

  return {
    _id: user._id,
    username: user.username,
    discriminator: user.discriminator,
    avatar: user.avatar,
    flags: user.flags & ~PrivateUserFlags,
    cutiePerks: cutiePerks,
    cutieStatus: {
      pledgeTier: user.flags & UserFlags.IS_CUTIE ? user.cutieStatus?.pledgeTier ?? 1 : 0,
      perksExpireAt: user.cutieStatus?.perksExpireAt ?? 0,
    },
    accounts: {
      spotify: user.accounts.spotify?.name || void 0,
      patreon: user.accounts.patreon?.name || void 0,
    },
  }
}
