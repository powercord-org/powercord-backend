/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { User, RestUser } from '@powercord/types/users'

type CustomBadges = Exclude<User['badges'], undefined>['custom']

function formatBadges (user: User): Exclude<CustomBadges, undefined> {
  // todo: drop fallback
  const pledgeInfo = user.accounts.patreon ?? { donated: false, pledgeTier: 69 }
  const badges = user.badges?.custom
  const donatorBadge: CustomBadges = {
    color: pledgeInfo.pledgeTier >= 1 ? badges?.color || null : null,
    icon: null,
    name: null,
  }

  const appliedColor = donatorBadge.color ?? '7289da'
  if (pledgeInfo.pledgeTier >= 2 || user.badges?.staff) {
    donatorBadge.icon = badges?.icon || `https://powercord.dev/api/v2/hibiscus/${appliedColor}.svg`
    donatorBadge.name = badges?.name || 'Powercord Cutie'
  } else if (pledgeInfo.pledgeTier === 1) {
    donatorBadge.icon = `https://powercord.dev/api/v2/hibiscus/${appliedColor}.svg`
    donatorBadge.name = 'Powercord Cutie'
  } else if (pledgeInfo.donated) {
    donatorBadge.icon = 'https://powercord.dev/api/v2/hibiscus/7289da.svg'
    donatorBadge.name = 'Former Powercord Cutie'
  }

  return donatorBadge
}

/** @deprecated */
export async function formatUser (user: User, bypassVisibility?: boolean): Promise<RestUser> {
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
      custom: formatBadges(user),
    },
    donatorTier: bypassVisibility ? user.accounts.patreon?.pledgeTier : 0,
    accounts: bypassVisibility
      ? {
        spotify: user.accounts.spotify?.name || void 0,
        github: user.accounts.github?.name || void 0,
        patreon: user.accounts.patreon?.name || void 0,
      }
      : void 0,
  }
}
