/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { TagChunk } from '../commands/tags/format.js'
import { MongoClient } from 'mongodb'
import config from '@powercord/shared/config'

export type TagDocument = {
  name: string
  description: string
  contents: TagChunk[]
}

export type FilterDocument = {
  word: string
}

export type EnforceDocument = {
  target: string
  moderator: string
  rule: number
}

export type NoteDocument = {
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
