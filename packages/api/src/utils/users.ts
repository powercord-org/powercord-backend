/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { User, RestUser, SelfRestUser } from '@powercord/types/users'

type CustomBadges = Exclude<User['badges'], undefined>['custom']

// note: code should be dropped once enforce code kicked in
const ENFORCE_LINKING = new Date('2022-03-01').getTime()
const VIRTUAL_STATUS = { donated: false, pledgeTier: 69, perksExpireAt: Infinity }

function formatBadges (user: User): Exclude<CustomBadges, undefined> {
  const pledgeInfo = user.cutieStatus ?? (ENFORCE_LINKING > Date.now() ? VIRTUAL_STATUS : null)
  const effectiveTier = pledgeInfo && pledgeInfo.perksExpireAt > Date.now() ? pledgeInfo.pledgeTier : 0

  const isLegit = effectiveTier !== VIRTUAL_STATUS.pledgeTier
  const appliedColor = user.cutiePerks?.color ?? '7289da'
  const donatorBadge: CustomBadges = {
    color: effectiveTier >= 1 ? user.cutiePerks?.color || null : null,
    icon: null,
    name: null,
  }

  if (effectiveTier >= 2) {
    donatorBadge.icon = user.cutiePerks?.badge || (isLegit ? `https://powercord.dev/api/v2/hibiscus/${appliedColor}.svg` : null)
    donatorBadge.name = user.cutiePerks?.title || (isLegit ? 'Powercord Cutie' : null)
  } else if (effectiveTier === 1) {
    donatorBadge.icon = `https://powercord.dev/api/v2/hibiscus/${appliedColor}.svg`
    donatorBadge.name = 'Powercord Cutie'
  } else if (pledgeInfo?.donated) {
    donatorBadge.icon = 'https://powercord.dev/api/v2/hibiscus/7289da.svg'
    donatorBadge.name = 'Former Powercord Cutie'
  }

  return donatorBadge
}

/** @deprecated */
export async function formatUser (user: User, bypassVisibility?: boolean): Promise<RestUser | SelfRestUser> {
  const customBadges = formatBadges(user)
  return {
    id: user._id,
    username: bypassVisibility ? user.username : 'Herobrine',
    discriminator: bypassVisibility ? user.discriminator : '0000',
    avatar: bypassVisibility ? user.avatar : null,
    badges: {
      developer: Boolean(user.badges?.developer),
      staff: Boolean(user.badges?.staff),
      support: Boolean(user.badges?.support),
      contributor: Boolean(user.badges?.contributor),
      translator: Boolean(user.badges?.translator),
      hunter: Boolean(user.badges?.hunter),
      early: Boolean(user.badges?.early),
      custom: customBadges, // Legacy
    },
    cutiePerks: {
      color: customBadges.color,
      badge: customBadges.icon?.startsWith('https://powercord.dev/api/v2/hibiscus') ? 'default' : customBadges.icon,
      title: customBadges.name,
    },
    // todo: bind logic
    canDeleteAccount: bypassVisibility ? true : void 0,
    cutieStatus: bypassVisibility
      ? {
        donated: user.cutieStatus?.donated ?? false,
        pledgeTier: (user.cutieStatus?.perksExpireAt ?? 0) > Date.now() ? user.cutieStatus?.pledgeTier ?? 0 : 0,
        perksExpireAt: user.cutieStatus?.perksExpireAt ?? 0,
      }
      : void 0,
    accounts: bypassVisibility
      ? {
        spotify: user.accounts.spotify?.name || void 0,
        patreon: user.accounts.patreon?.name || void 0,
      }
      : void 0,
  }
}
