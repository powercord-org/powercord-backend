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

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import crudModule from './crud.js'

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
        update: { schema: updateUserSchema, hasUpdatedAt: true },
      },
    },
  })

  // And some other ones
  fastify.get('/search', { schema: void 0 }, searchUsers)
}
