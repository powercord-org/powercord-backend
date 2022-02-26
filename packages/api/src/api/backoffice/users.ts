/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { UserFlags } from '@powercord/shared/flags'
import crudModule from './crudLegacy.js'
import newCrudModule from './crud.js'
import { formatUser } from '../../data/user.js'

const updateUserSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      patronTier: { enum: [ 0, 1, 2, 3 ] },
      'badges.developer': { type: 'boolean' },
      'badges.staff': { type: 'boolean' },
      'badges.support': { type: 'boolean' },
      'badges.contributor': { type: 'boolean' },
      'badges.hunter': { type: 'boolean' },
      'badges.early': { type: 'boolean' },
      'badges.translator': { type: 'boolean' },
      'badges.custom.color': { type: [ 'string', 'null' ] },
      'badges.custom.icon': { type: [ 'string', 'null' ] },
      'badges.custom.name': { type: [ 'string', 'null' ] },
      'badges.guild.id': { type: [ 'string', 'null' ] },
      'badges.guild.icon': { type: [ 'string', 'null' ] },
      'badges.guild.name': { type: [ 'string', 'null' ] },
    },
  },
}

// @ts-ignore
function searchUsers (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) { // eslint-disable-line
  // todo
}

// @ts-ignore
function banUser (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) { // eslint-disable-line
  // todo
}

// @ts-ignore
function refreshUserPledge (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) { // eslint-disable-line
  // todo
}

export default async function (fastify: FastifyInstance): Promise<void> {
  // Main routes
  fastify.register(crudModule, {
    data: {
      auth: { permissions: UserFlags.STAFF },
      idStr: true,
      collection: 'users',
      projection: { accounts: 0, settings: 0, 'banStatus._id': 0 },
      aggregation: [
        { $lookup: { from: 'userbans', localField: '_id', foreignField: '_id', as: 'banStatus' } },
        { $unwind: { path: '$banStatus', preserveNullAndEmptyArrays: true } },
      ],
      modules: {
        create: false,
        read: false,
        readAll: false,
        update: { schema: updateUserSchema, hasUpdatedAt: true },
      },
    },
  })

  fastify.register(newCrudModule, {
    data: {
      auth: { permissions: UserFlags.STAFF },
      entity: {
        collection: 'users',
        stringId: true,
        query: { flags: { $bitsAllClear: UserFlags.GHOST } },
        projection: { _id: 1, 'accounts.accessToken': 0, 'accounts.refreshToken': 0 },
        format: (u) => formatUser(u, true, true),
        schema: {
          read: { $ref: 'https://powercord.dev/schemas/user' },
          write: {
            type: 'object',
            additionalProperties: false,
            properties: {},
          },
        },
      },
      create: { enabled: false },
      update: { enabled: false, hasUpdatedAt: true },
      delete: { enabled: false },
    },
  })

  // And some other ones
  fastify.get('/search', { schema: void 0 }, searchUsers)
  fastify.post('/:id(\\d{17,})/ban', { schema: void 0 }, banUser)
  fastify.post('/:id(\\d{17,})/refresh-pledge', { schema: void 0 }, refreshUserPledge)
}
