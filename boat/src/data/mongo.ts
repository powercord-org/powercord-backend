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

import type { ObjectId } from 'mongodb'
import type { TagChunk } from '../commands/tags/format.js'
import { MongoClient } from 'mongodb'
import config from '@powercord/shared/config'

export type TagDocument = {
  _id: ObjectId
  name: string
  description: string
  contents: TagChunk[]
}

export type FilterDocument = {
  _id: ObjectId
  word: string
}

export type EnforceDocument = {
  _id: ObjectId
  target: string
  moderator: string
  rule: number
}

export type NoteDocument = {
  _id: ObjectId
  id: number
  target: string
  moderator: string
  note: string
}


export const client = new MongoClient(`${config.mango}?appName=Powercord%20Boat`)
export const db = client.db('powercord')

export const tags = db.collection<TagDocument>('tags')
export const filter = db.collection<FilterDocument>('filter')
export const enforce = db.collection<NoteDocument>('enforce')
export const notes = db.collection<NoteDocument>('notes')

// Connect & prepare indexes
await client.connect()
await Promise.all([
  tags.createIndex({ name: 1 }, { unique: true }),
  filter.createIndex({ word: 1 }, { unique: true }),
  notes.createIndex({ id: 1, target: 1 }, { unique: true }),
])
