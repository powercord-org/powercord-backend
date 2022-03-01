/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { User, LegacyRestUser } from '@powercord/types/users'
import { UserFlags } from '@powercord/shared/flags'

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
    donatorBadge.color = user.cutiePerks?.color || null

    if ((user.cutieStatus?.pledgeTier ?? 1) >= 2) {
      donatorBadge.icon = user.cutiePerks?.badge || `https://powercord.dev/api/v2/hibiscus/${appliedColor}.svg`
      donatorBadge.name = user.cutiePerks?.title || 'Powercord Cutie'
    }
  }

  return donatorBadge
}

/** @deprecated */
export async function formatUser (user: User, self?: boolean): Promise<LegacyRestUser> {
  const customBadges = formatBadges(user)
  const cutiePerks = {
    color: customBadges.color,
    badge: customBadges.icon?.startsWith('https://powercord.dev/api/v2/hibiscus') ? 'default' : customBadges.icon,
    title: customBadges.name,
  }

  return {
    _id: user._id,
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
    accounts: !self
      ? void 0
      : {
        spotify: user.accounts.spotify?.name,
        patreon: user.accounts.patreon?.name,
      },
  }
}
