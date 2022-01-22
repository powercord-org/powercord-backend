/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { User } from '@powercord/types/users'
import { createHash } from 'crypto'
import config from '@powercord/shared/config'

type Badge = { _id: string, name: string, icon: string }
type RestBadge = Omit<Badge, '_id'>

async function getGuildBadges (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const hash = createHash('sha256')
  const cursor = this.mongo.db!.collection<Badge>('badges').find()
  const badges: Record<string, RestBadge> = {}
  for await (const badge of cursor) {
    hash.update(badge._id).update(badge.name).update(badge.icon)
    badges[badge._id] = { name: badge.name, icon: badge.icon }
  }

  cursor.close()
  const etag = `W/"${hash.digest('base64url')}"`
  reply.header('cache-control', 'public, max-age=600')
  if (request.headers['if-none-match'] === etag) {
    reply.code(304).send()
    return
  }

  reply.send(badges)
}

async function getUserBadges (this: FastifyInstance, request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const user = await this.mongo.db!.collection<User>('users').findOne({ _id: request.params.id })
  const etag = `W/"${createHash('sha256').update(config.secret).update(request.params.id).update(user?.updatedAt?.toISOString() ?? '0').digest('base64url')}"`

  reply.header('cache-control', 'public, max-age=300')
  if (request.headers['if-none-match'] === etag) {
    reply.code(304).send()
    return
  }

  reply.header('etag', etag)
  const tier = user?.patronTier ?? 0
  const badges = user?.badges ?? {}
  const custom = badges.custom ?? { color: null, icon: 'default', name: 'default' }

  return {
    developer: Boolean(badges.developer),
    staff: Boolean(badges.staff),
    support: Boolean(badges.support),
    contributor: Boolean(badges.contributor),
    translator: Boolean(badges.translator),
    hunter: Boolean(badges.hunter),
    early: Boolean(badges.early),
    properties: {
      badgeColors: tier < 1 ? null : custom.color || null,
      customBadge: tier < 1
        ? null
        : {
          icon: tier < 2 ? 'default' : custom.icon ?? 'default',
          text: tier < 2 ? 'default' : custom.name ?? 'default',
        },
      languages: [],
    },
  }
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/guilds', getGuildBadges)
  fastify.get('/:id(\\d+)', getUserBadges)
}
