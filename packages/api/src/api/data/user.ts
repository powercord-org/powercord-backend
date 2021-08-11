/*
 * Copyright (c) 2018-2021 aetheryx & Cynthia K. Rey
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { MongoClient } from 'mongodb'
import { URL } from 'url'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'
import { SETTINGS_STORAGE_FOLDER } from '../settings.js'

export enum UserDeletionCause { AUTOMATIC, REQUESTED, ADMINISTRATOR }

// @ts-ignore
export async function deleteUser (mongo: MongoClient, userId: string, reason: UserDeletionCause) {
  // Notes for account deletion handling
  // Always delete user collection entry, sync data, pending forms submitted by this user
  //
  // Users cannot delete their account if they have store entries not marked as deprecated
  // For admin deletions, wipe all collaborators on the repository as a safety measure
  // For system deletion, open an issue on the repo and mark entry as deprecated if no updates after a month

  const pending = []

  // Delete sync files
  const syncFile = new URL(userId, SETTINGS_STORAGE_FOLDER)
  if (existsSync(syncFile)) pending.push(unlink(syncFile))

  // Delete user entry
  // Revoke user roles
}
