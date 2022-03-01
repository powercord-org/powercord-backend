/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

type Badge = { name: string, icon: string }

async function badges (this: FastifyInstance, _request: FastifyRequest, reply: FastifyReply): Promise<Record<string, Badge>> {
  reply.header('cache-control', 'public, max-age=0, must-revalidate')
  return this.mongo.db!.collection<Badge & { _id: string }>('badges').find({}).toArray().then((b) =>
    b.reduce<Record<string, Badge>>((acc, badge) => {
      acc[badge._id] = {
        name: badge.name,
        icon: badge.icon,
      }
      return acc
    }, {}))
}

/** @deprecated */
export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/badges', badges)
}
