/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { User, PatreonData } from '@powercord/types/users'
import type { MongoClient } from 'mongodb'
import type { OAuthToken } from './oauth.js'
import { fetch } from 'undici'
import { refreshAuthTokens, toMongoFields } from './oauth.js'

const DONATION_TIERS = [ 100, 500, 1000 ]
const GRACE_PERIOD = 5 * 24 * 3600e3 // 5 days

export async function fetchPledgeStatus (token: OAuthToken): Promise<PatreonData> {
  const query = new URLSearchParams()
  query.set('include', 'memberships')
  query.set('fields[member]', 'patron_status,currently_entitled_amount_cents,next_charge_date')
  const url = `https://patreon.com/api/oauth2/v2/identity?${query.toString()}`
  const response = await fetch(url, { headers: { authorization: `${token.tokenType} ${token.accessToken}` } })
    .then((r) => <any> r.json())

  const data = { donated: false, pledgeTier: 0, perksExpireAt: 0 }
  const pledgeData = response.included?.[0]?.attributes
  if (!pledgeData) return data

  // Check if user donated at least once
  if (pledgeData.patron_status) data.donated = true

  // Check if they're currently donating
  if (pledgeData.patron_status !== 'active_patron') return data

  // Get their current tier and next payment
  data.pledgeTier = DONATION_TIERS.findIndex((v) => v > pledgeData.currently_entitled_amount_cents)
  data.perksExpireAt = new Date(pledgeData.next_charge_date).getTime() + GRACE_PERIOD
  return data
}

async function updateDonatorState (mongo: MongoClient, user: User) {
  const patreonAccount = user.accounts.patreon!
  const userUpdate: Partial<User['accounts']['patreon']> = {}
  const mongoUpdate = { updatedAt: new Date() }

  if (Date.now() > patreonAccount.expiresAt) {
    const newToken = await refreshAuthTokens('patreon', patreonAccount.refreshToken)
    Object.assign(mongoUpdate, toMongoFields(newToken, 'patreon'))
    Object.assign(userUpdate, newToken)
  }

  const pledge = await fetchPledgeStatus(patreonAccount)
  Object.assign(userUpdate, pledge)
  Object.assign(mongoUpdate, {
    'accounts.patreon.donated': pledge.donated,
    'accounts.patreon.pledgeTier': pledge.pledgeTier,
    'accounts.patreon.perksExpireAt': pledge.perksExpireAt,
  })

  await mongo.db().collection<User>('users').updateOne({ _id: user._id }, { $set: mongoUpdate })
  return userUpdate
}

// The queue avoids tripping multiple updates if a query arrives during an ongoing update
const queue = new Map<string, Promise<Partial<User['accounts']['patreon']>>>()
export async function refreshDonatorState (mongo: MongoClient, user: User) {
  const patreonAccount = user.accounts.patreon
  if (!patreonAccount || !patreonAccount.perksExpireAt || patreonAccount.perksExpireAt > Date.now()) return

  let promise = queue.get(user._id)
  if (!promise) {
    promise = updateDonatorState(mongo, user)
    promise.finally(() => queue.delete(user._id))
    queue.set(user._id, promise)
  }

  const update = await promise
  Object.assign(patreonAccount, update)
}
