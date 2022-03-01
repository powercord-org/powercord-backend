/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { MongoClient } from 'mongodb'
import type { CutiePerks, DatabaseUser, User, GhostUser, RestUser, RestUserPrivate } from '@powercord/types/users'
import { URL } from 'url'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'
import config from '@powercord/shared/config'
import { SETTINGS_STORAGE_FOLDER } from '../api/settings.js'
import { fetchMember, setRoles } from '../utils/discord.js'
import { UserFlags, PrivateUserFlags, PersistentUserFlags } from '@powercord/shared/flags'

export enum UserDeletionCause {
  // User initiated account deletion manually
  REQUESTED,

  // Account deletion scheduled due to inactivity
  AUTOMATIC,

  // Account deleted (or banned) by an administrator
  ADMINISTRATOR,
}

const ROLES_TO_REVOKE = [
  config.discord.roles.user,
  config.discord.roles.hunter,
  config.discord.roles.translator,
  config.discord.roles.contributor,
  config.discord.roles.donator,
]

export function isGhostUser (user: DatabaseUser): user is GhostUser {
  return (user.flags & UserFlags.GHOST) !== 0
}

export function formatUser (user: User, includePrivate?: boolean): RestUser
export function formatUser (user: User, includePrivate?: true, allFlags?: boolean): RestUserPrivate
export function formatUser (user: User, includePrivate?: boolean, allFlags?: boolean): RestUser | RestUserPrivate {
  const perks: CutiePerks = {
    color: null,
    badge: null,
    title: null,
  }

  if (user.flags & UserFlags.HAS_DONATED) {
    perks.title = 'Former Powercord Cutie'
    perks.badge = 'default'
  }

  if (user.flags & UserFlags.IS_CUTIE) {
    perks.color = user.cutiePerks?.color || null
    perks.title = 'Powercord Cutie'

    if ((user.cutieStatus?.pledgeTier ?? 1) >= 2) {
      perks.title = user.cutiePerks?.title || perks.title
      perks.badge = user.cutiePerks?.badge || perks.badge
    }
  }

  const restUser = {
    _id: user._id,
    flags: user.flags & ~PrivateUserFlags,
    cutiePerks: perks,
  }

  if (includePrivate) {
    return {
      ...restUser,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      flags: allFlags ? user.flags : restUser.flags,
      cutieStatus: {
        pledgeTier: user.cutieStatus?.pledgeTier ?? 0,
        perksExpireAt: user.cutieStatus?.perksExpireAt ?? 0,
      },
      accounts: {
        spotify: user.accounts.spotify?.name || void 0,
        patreon: user.accounts.patreon?.name || void 0,
      },
    }
  }

  return restUser
}

export async function deleteUser (mongo: MongoClient, userId: string, _reason: UserDeletionCause) {
  const database = mongo.db()
  const userCollection = database.collection<DatabaseUser>('users')

  const user = await userCollection.findOne({ _id: userId })
  if (!user || user.flags & UserFlags.GHOST) return

  // Wipe on-disk data
  const syncFile = new URL(userId, SETTINGS_STORAGE_FOLDER)
  if (existsSync(syncFile)) await unlink(syncFile)

  // Delete user entry, or keep flags if necessary
  if (user.flags & PersistentUserFlags) {
    // We keep the flags we want to keep track of
    await userCollection.replaceOne({ _id: userId }, { flags: (user.flags & PersistentUserFlags) | UserFlags.GHOST })
  } else {
    // We simply delete the entry as we don't need it anymore
    await userCollection.deleteOne({ _id: userId })
  }

  // todo: handle store items

  // Update member on the guild
  const member = await fetchMember(userId)
  if (member) {
    const newRoles = member.roles.filter((r) => !ROLES_TO_REVOKE.includes(r))
    await setRoles(userId, newRoles, 'User deleted their powercord.dev account')
  }
}
