/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { MongoClient } from 'mongodb'
import type { User } from '@powercord/types/users'
import { URL } from 'url'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'
import config from '@powercord/shared/config'
import { SETTINGS_STORAGE_FOLDER } from '../api/settings.js'
import { fetchMember, setRoles } from '../utils/discord.js'

export enum UserDeletionCause {
  // User initiated account deletion manually
  REQUESTED,

  // Account deletion scheduled due to inactivity
  AUTOMATIC,

  // Account banned by an administrator
  ADMINISTRATOR,
}

const ROLES_TO_REVOKE = [
  config.discord.ids.roleUser,
  config.discord.ids.roleHunter,
  config.discord.ids.roleTranslator,
  config.discord.ids.roleContributor,
]

export async function deleteUser (mongo: MongoClient, userId: string, reason: UserDeletionCause) {
  // Wipe on-disk data
  const syncFile = new URL(userId, SETTINGS_STORAGE_FOLDER)
  if (existsSync(syncFile)) await unlink(syncFile)

  // Database stuff
  const database = mongo.db()
  const formsQuery = { submitter: userId, reviewed: { $not: { $eq: true } } }

  // Read data
  const deletedForms = await database.collection('forms').find(formsQuery, { projection: { messageId: 1 } }).toArray()

  // Update store entries
  await database.collection('forms').deleteMany(formsQuery)
  await database.collection<User>('users').deleteOne({ _id: userId })

  // When a user is deleted, there should be no published plugins or theme
  // However when done by an administrator, items may still be in the store
  // For these cases, flag the package as owner-less and tell the update server to not ingest future updates
  if (reason === UserDeletionCause.ADMINISTRATOR) {
    // todo: revisit this
    await database.collection('store-items').updateMany(
      { owner: userId },
      { $set: { deprecated: true, owner: null } }
    )
  }

  const member = await fetchMember(userId)
  if (member) {
    const newRoles = member.roles.filter((r) => !ROLES_TO_REVOKE.includes(r))
    await setRoles(userId, newRoles, 'User deleted their powercord.dev account')
  }

  // @ts-ignore
  for (const { messageId } of deletedForms) { // eslint-disable-line
    // todo: notify form has been voided
  }
}
