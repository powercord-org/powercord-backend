/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import crudModule from './crudLegacy.js'
import newCrudModule from './crud.js'

type RouteParams = { id: string }

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
function searchUsers (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: FastifyReply) { // eslint-disable-line
  // todo
}

export default async function (fastify: FastifyInstance): Promise<void> {
  // Main routes
  fastify.register(crudModule, {
    data: {
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
      entity: {
        collection: 'users',
        stringId: true,
        projection: { accounts: 0 },
        schema: {
          read: {
            // todo: extract schema
            type: 'object',
            additionalProperties: false,
            required: [ '_id', 'username', 'discriminator', 'avatar', 'createdAt', 'updatedAt' ],
            properties: {
              _id: { type: 'string' },
              username: { type: 'string' },
              discriminator: { type: 'string' },
              avatar: { type: 'string' },

              flags: { type: 'number' },
              badges: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  developer: { type: 'boolean' },
                  staff: { type: 'boolean' },
                  support: { type: 'boolean' },
                  contributor: { type: 'boolean' },
                  translator: { type: 'boolean' },
                  hunter: { type: 'boolean' },
                  early: { type: 'boolean' },
                },
              },

              cutieStatus: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  donated: { type: 'boolean' },
                  pledgeTier: { type: 'number' },
                  perksExpireAt: { type: 'number' },
                },
              },
              cutiePerks: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  color: { type: [ 'null', 'string' ] },
                  badge: { type: [ 'null', 'string' ] },
                  title: { type: [ 'null', 'string' ] },
                },
              },

              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
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
}
