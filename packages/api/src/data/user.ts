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

export enum UserDeletionCause { AUTOMATIC, REQUESTED, ADMINISTRATOR }

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

  if (reason === UserDeletionCause.AUTOMATIC) {
    // todo: open an issue on the repositories
    // todo: schedule automatic deprecation within a month
  } else if (reason === UserDeletionCause.ADMINISTRATOR) {
    // todo: wipe all collaborators from repositories
    // todo: open an issue on the repositories
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
