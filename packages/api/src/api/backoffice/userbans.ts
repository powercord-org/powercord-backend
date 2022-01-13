/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance } from 'fastify'
import crudModule from './crud.js'

const updateBansSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      account: { type: 'boolean' },
      publish: { type: 'boolean' },
      verification: { type: 'boolean' },
      hosting: { type: 'boolean' },
      reporting: { type: 'boolean' },
      sync: { type: 'boolean' },
    },
  },
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.register(crudModule, {
    data: {
      collection: 'userbans',
      projection: { 'user.accounts': 0, 'user.settings': 0, 'user._id': 0 },
      aggregation: [
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      ],
      modules: { update: { schema: updateBansSchema, upsert: true } },
    },
  })
}
