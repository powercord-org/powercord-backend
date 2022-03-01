/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { User, CutieStatus, DatabaseUser } from '@powercord/types/users'
import type { MongoClient, UpdateFilter } from 'mongodb'
import type { OAuthToken } from './oauth.js'
import config from '@powercord/shared/config'
import { webhooks, members } from 'crapcord/api'
import { fetch } from 'undici'
import { refreshAuthTokens, toMongoFields } from './oauth.js'
import { UserFlags } from '@powercord/shared/flags'

const DONATION_TIERS = [ 100, 500, 1000, Infinity ]
const GRACE_PERIOD = 5 * 24 * 3600e3 // 5 days

export async function notifyStateChange (user: User, change: 'pledge' | 'perks') {
  // Update role - todo: keep track of custom role
  if (change === 'pledge') {
    if (user.cutieStatus?.pledgeTier) {
      members.addGuildMemberRole(config.discord.guildId, user._id, config.discord.roles.donator, 'Pledge status updated', config.discord.ccBotToken)
        .catch(() => void 0)
    } else {
      members.removeGuildMemberRole(config.discord.guildId, user._id, config.discord.roles.donator, 'Pledge status updated', config.discord.ccBotToken)
        .catch(() => void 0)
    }
  }

  // Dispatch info
  const tier = user.flags & UserFlags.IS_CUTIE ? user.cutieStatus?.pledgeTier ?? 1 : 0
  const donated = (user.flags & UserFlags.HAS_DONATED) !== 0

  webhooks.executeWebhook(config.honks.perksChannel, {
    embeds: [
      change === 'pledge'
        ? {
          title: 'Pledge status update',
          description: `${user.username}#${user.discriminator} (<@${user._id}>) is now tier ${tier} (donated: ${donated})`,
        }
        : {
          title: 'Perks update',
          description: `${user.username}#${user.discriminator} (<@${user._id}>, tier ${tier}) updated their perks:\n`
            + ` - Color: ${user.cutiePerks?.color ?? '`7289da`'}\n`
            + ` - Badge: ${user.cutiePerks?.badge ?? '`default`'}\n`
            + ` - Description: ${user.cutiePerks?.title ?? '`default`'}`,
        },
    ],
  }).catch(() => void 0)
}

export async function fetchPledgeStatus (token: OAuthToken): Promise<[ boolean, CutieStatus ]> {
  const query = new URLSearchParams()
  query.set('include', 'memberships')
  query.set('fields[member]', 'patron_status,currently_entitled_amount_cents,next_charge_date')
  const url = `https://patreon.com/api/oauth2/v2/identity?${query.toString()}`
  const response = await fetch(url, { headers: { authorization: `${token.tokenType} ${token.accessToken}` } })
    .then((r) => <any> r.json())

  let donated = false
  const data = { pledgeTier: 0, perksExpireAt: -1 }
  const pledgeData = response.included?.[0]?.attributes
  if (!pledgeData) return [ donated, data ]

  // Check if user donated at least once
  if (pledgeData.patron_status) donated = true

  // Check if they're currently donating
  if (pledgeData.patron_status !== 'active_patron') return [ donated, data ]

  // Get their current tier and next payment
  data.pledgeTier = DONATION_TIERS.findIndex((v) => v > pledgeData.currently_entitled_amount_cents)
  data.perksExpireAt = new Date(pledgeData.next_charge_date).getTime() + GRACE_PERIOD
  return [ donated, data ]
}

export async function prepareUpdateData (patreonAccount: OAuthToken): Promise<[ CutieStatus, Partial<User['accounts']['patreon']>, UpdateFilter<User> ]> {
  const userUpdate: Partial<User['accounts']['patreon']> = {}
  const mongoUpdate = {
    $set: <Record<string, any>> {},
    $bit: { flags: { or: 0, and: -1 } },
    $currentDate: { updatedAt: true },
  }

  // todo: ditch unix
  if (Date.now() > patreonAccount.expiresAt) {
    const newToken = await refreshAuthTokens('patreon', patreonAccount.refreshToken!)
    mongoUpdate.$set = toMongoFields(newToken, 'patreon')
    Object.assign(userUpdate, newToken)
  }

  const [ donated, cutieStatus ] = await fetchPledgeStatus(patreonAccount)
  mongoUpdate.$set['cutieStatus.pledgeTier'] = cutieStatus.pledgeTier
  mongoUpdate.$set['cutieStatus.perksExpireAt'] = cutieStatus.perksExpireAt

  if (donated) mongoUpdate.$bit.flags.or |= UserFlags.HAS_DONATED
  if (cutieStatus.pledgeTier) {
    mongoUpdate.$bit.flags.or |= UserFlags.IS_CUTIE
  } else {
    mongoUpdate.$bit.flags.and &= ~UserFlags.IS_CUTIE
  }

  return [
    cutieStatus,
    userUpdate,
    <UpdateFilter<User>> mongoUpdate,
  ]
}

export async function updateDonatorState (mongo: MongoClient, user: User, manual?: boolean) {
  const patreonAccount = user.accounts.patreon
  const perksExpireAt = user.cutieStatus?.perksExpireAt ?? 0
  const collection = mongo.db().collection<DatabaseUser>('users')

  if (!patreonAccount) {
    if (perksExpireAt <= Date.now()) {
      // Void the IS_CUTIE flag
      await collection.updateOne({ _id: user._id }, { $bit: { flags: { and: ~UserFlags.IS_CUTIE } } })
    }

    return
  }

  const [ cutieStatus, userUpdate, mongoUpdate ] = await prepareUpdateData(patreonAccount)
  const statusChange = user.cutieStatus?.pledgeTier !== cutieStatus.pledgeTier
  if (manual) mongoUpdate['cutieStatus.lastManualRefresh'] = Date.now()

  await collection.updateOne({ _id: user._id }, mongoUpdate)
  Object.assign(patreonAccount, userUpdate)
  Object.assign(user, { cutieStatus: cutieStatus })

  if (statusChange) notifyStateChange(user, 'pledge')
}

// The queue avoids tripping multiple updates if a query arrives during an ongoing update
const queue = new Map<string, Promise<void>>()
export async function refreshDonatorState (mongo: MongoClient, user: User, manual?: boolean) {
  const perksExpireAt = user.cutieStatus?.perksExpireAt ?? 0
  if (!manual && (perksExpireAt > Date.now() || user.flags & UserFlags.CUTIE_OVERRIDE)) return

  let promise = queue.get(user._id)
  if (!promise) {
    promise = updateDonatorState(mongo, user, manual)
    promise.finally(() => queue.delete(user._id))
    queue.set(user._id, promise)
  }

  return promise
}
