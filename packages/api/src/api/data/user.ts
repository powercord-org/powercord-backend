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

import { MongoClient, ReadConcern, WriteConcern } from 'mongodb'
import { URL } from 'url'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'
import { SETTINGS_STORAGE_FOLDER } from '../settings.js'

export enum UserDeletionCause { AUTOMATIC, REQUESTED, ADMINISTRATOR }

export async function updateUser () {
  // todo: merge all different user updates
}

export async function deleteUser (mongo: MongoClient, userId: string, reason: UserDeletionCause) {
  // Wipe on-disk data
  const syncFile = new URL(userId, SETTINGS_STORAGE_FOLDER)
  if (existsSync(syncFile)) await unlink(syncFile)

  // Database stuff
  const database = mongo.db()
  const session = mongo.startSession()
  const formsQuery = { submitter: userId, reviewed: { $not: { $eq: true } } }

  // Read data
  const deletedForms = await database.collection('forms').find(formsQuery, { projection: { messageId: 1 }, session: session }).toArray()

  session.startTransaction({
    readConcern: new ReadConcern('majority'),
    writeConcern: new WriteConcern(1, 0, true),
  })

  // Update store entries
  await database.collection('forms').deleteMany(formsQuery, { session: session })
  await database.collection('users').deleteOne({ _id: userId }, { session: session })

  if (reason === UserDeletionCause.AUTOMATIC) {
    // todo: open an issue on the repositories
    // todo: schedule automatic deprecation within a month
  } else if (reason === UserDeletionCause.ADMINISTRATOR) {
    // todo: wipe all collaborators from repositories
    // todo: open an issue on the repositories
    // todo: mark as deprecated immediately
  }

  await session.commitTransaction()
  await session.endSession()

  // @ts-ignore
  for (const { messageId } of deletedForms) { // eslint-disable-line
    // todo: notify form has been voided
  }
}
