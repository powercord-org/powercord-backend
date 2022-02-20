/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

// todo: move back to /users & /guilds

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { CutiePerks, User } from '@powercord/types/users'
import { createHash } from 'crypto'
import { UserFlags } from '@powercord/shared/flags'

type Badge = { _id: string, name: string, icon: string }
type RestBadge = Omit<Badge, '_id'>

export function getEffectivePerks (user: User | null): CutiePerks {
  const cutiePerks: CutiePerks = {
    color: null,
    badge: null,
    title: null,
  }

  if (!user) return cutiePerks

  const donated = user.flags & UserFlags.HAS_DONATED
  const currentTier = user.flags & UserFlags.IS_CUTIE ? user.cutieStatus?.pledgeTier ?? 0 : 0

  if (donated) {
    cutiePerks.badge = 'default'
    cutiePerks.title = 'Former Powercord Cutie'
  }

  if (currentTier >= 1) {
    cutiePerks.color = user.cutiePerks?.color ?? null
    cutiePerks.title = 'Powercord Cutie'
  }

  if (currentTier >= 2) {
    if (user.cutiePerks?.badge) cutiePerks.badge = user.cutiePerks.badge
    if (user.cutiePerks?.title) cutiePerks.title = user.cutiePerks.title
  }

  return cutiePerks
}

async function getGuildBadges (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  // todo: revise storage method and check donator status of badge manager
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

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/guilds', getGuildBadges)
}
