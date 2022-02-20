/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { User, CutiePerks } from '@powercord/types/users'
import { createHash } from 'crypto'
import { UserFlags } from '@powercord/shared/flags'
import config from '@powercord/shared/config'

import settingsModule from './settings.js'
import { getEffectivePerks } from './badges.js'
import { notifyStateChange, refreshDonatorState } from '../utils/patreon.js'
import { refreshAuthTokens, toMongoFields } from '../utils/oauth.js'
import { formatUser } from '../utils/users.js'

const DATE_ZERO = new Date(0)

const ALLOWED_HOSTS = [
  'discord.com', 'ptb.discord.com', 'canary.discord.com',
  'discordapp.com', 'ptb.discordapp.com', 'canary.discordapp.com',
  'cdn.discordapp.com', 'media.discordapp.net',
]

type PatchSelfRequest = { TokenizeUser: User, Body: { cutiePerks: Partial<CutiePerks> } }
const patchSelfSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      cutiePerks: {
        type: 'object',
        additionalProperties: false,
        properties: {
          color: { type: [ 'string', 'null' ], pattern: '^[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$' },
          badge: { type: [ 'string', 'null' ], minLength: 8, maxLength: 128 },
          title: { type: [ 'string', 'null' ], minLength: 2, maxLength: 32 },
        },
      },
    },
  },
}

async function sendUser (request: FastifyRequest, reply: FastifyReply, user: User, self?: boolean) {
  const etag = `W/"${createHash('sha256').update(config.secret).update(user._id).update((user.updatedAt ?? DATE_ZERO).toISOString()).digest('base64url')}"`

  reply.header('cache-control', 'public, max-age=0, must-revalidate')
  if (request.headers['if-none-match'] === etag) {
    reply.code(304).send()
    return
  }

  reply.header('etag', etag)
  return formatUser(user, self)
}

/** @deprecated */
async function getUser (this: FastifyInstance, request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const user = await this.mongo.db!.collection<User>('users').findOne({ _id: request.params.id })
    || { _id: request.params.id, username: 'Herobrine', discriminator: '0000', avatar: null, flags: 0, accounts: <any> {}, createdAt: DATE_ZERO }

  await refreshDonatorState(this.mongo.client, user)
  return sendUser(request, reply, user)
}

async function getSelf (this: FastifyInstance, request: FastifyRequest<{ TokenizeUser: User }>, reply: FastifyReply) {
  await refreshDonatorState(this.mongo.client, request.user!)
  return sendUser(request, reply, request.user!, true)
}

// this endpoint can only be used to modify perks, but implements checks as a generic update to follow REST semantics
async function patchSelf (this: FastifyInstance, request: FastifyRequest<PatchSelfRequest>, reply: FastifyReply) {
  const update: Record<string, any> = { updatedAt: new Date() }

  if ('cutiePerks' in request.body) {
    const perksExpireAt = request.user!.cutieStatus?.perksExpireAt ?? 0
    const pledgeTier = perksExpireAt > Date.now() ? request.user!.cutieStatus?.pledgeTier ?? 0 : 0
    if (('color' in request.body.cutiePerks && !pledgeTier) || (('badge' in request.body.cutiePerks || 'title' in request.body.cutiePerks) && pledgeTier < 2)) {
      reply.code(402).send({ error: 402, message: 'You must be a donator of a higher tier to modify these perks.' })
      return
    }

    // Validate URL - todo: file upload?
    if (request.body.cutiePerks.badge) {
      try {
        const icon = new URL(request.body.cutiePerks.badge)
        if (!ALLOWED_HOSTS.includes(icon.hostname)) {
          reply.code(400).send({ error: 400, message: 'Icon URL is not from a whitelisted source. Allowed URLs: *.discord.com, *.discordapp.com, media.discordapp.net' })
          return
        }

        icon.protocol = 'https' // Ensure protocol is https
        request.body.cutiePerks.badge = icon.toString()
      } catch {
        reply.code(400).send({ error: 400, message: 'Icon URL is malformed.' })
        return
      }
    }

    if ('color' in request.body.cutiePerks) update['cutiePerks.color'] = request.body.cutiePerks.color
    if ('badge' in request.body.cutiePerks) update['cutiePerks.badge'] = request.body.cutiePerks.badge
    if ('title' in request.body.cutiePerks) update['cutiePerks.title'] = request.body.cutiePerks.title
  }

  const newUser = await this.mongo.db!.collection<User>('users').findOneAndUpdate({ _id: request.user!._id }, { $set: update }, { returnDocument: 'after' })
  reply.send({ cutiePerks: getEffectivePerks(newUser.value) })
  notifyStateChange(newUser.value!, 'perks')
}

async function getSpotifyToken (this: FastifyInstance, request: FastifyRequest<{ TokenizeUser: User }>): Promise<unknown> {
  const { spotify } = request.user!.accounts
  if (!spotify) return { token: null }

  const users = this.mongo.db!.collection<User>('users')
  if (Date.now() >= spotify.expiresAt) {
    try {
      const tokens = await refreshAuthTokens('spotify', spotify.refreshToken)
      const updatedFields: Record<string, unknown> = { ...toMongoFields(tokens, 'spotify'), updatedAt: new Date() }
      await users.updateOne({ _id: request.user!._id }, { $set: updatedFields })
      return { token: tokens.accessToken }
    } catch {
      // todo: catch 5xx errors from spotify and report them instead
      await users.updateOne({ _id: request.user!._id }, { $unset: { 'accounts.spotify': 1 }, $set: { updatedAt: new Date() } })
      return { token: null, revoked: 'ACCESS_DENIED' }
    }
  }

  return { token: spotify.accessToken }
}

async function refreshPledge (this: FastifyInstance, request: FastifyRequest<{ TokenizeUser: User }>, reply: FastifyReply) {
  const patreonAccount = request.user!.accounts.patreon
  const lastManualRefresh = request.user!.cutieStatus?.lastManualRefresh ?? 0
  if (!patreonAccount) {
    reply.code(422).send({ error: 422, message: 'This operation requires a linked Patreon account' })
    return
  }

  if (request.user!.flags & UserFlags.CUTIE_OVERRIDE) {
    reply.code(422).send({ error: 422, message: 'Your pledge status is currently managed by Powercord Staff. Contact us for help.' })
    return
  }

  // 1 refresh per hour
  if (Date.now() - lastManualRefresh < 3600e3) {
    reply.code(429).send({ error: 429, message: 'A refresh already was requested within the previous hour. Try again later.' })
    return
  }

  await refreshDonatorState(this.mongo.client, request.user!, true)
  reply.send(request.user!.cutieStatus || null)
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.route({
    method: 'GET',
    url: '/@me',
    preHandler: fastify.auth([ fastify.verifyTokenizeToken ]),
    handler: getSelf,
    schema: {
      response: {
        200: { $ref: 'https://powercord.dev/schemas/user' },
      },
    },
  })

  fastify.get<{ TokenizeUser: User }>('/@me/spotify', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, getSpotifyToken)

  if (!fastify.prefix.startsWith('/v3')) {
    fastify.get('/:id(\\d+)', getUser)
  } else {
    fastify.patch<PatchSelfRequest>('/@me', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]), schema: patchSelfSchema }, patchSelf)
    fastify.post<{ TokenizeUser: User }>('/@me/refresh-pledge', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, refreshPledge)
    fastify.register(settingsModule, { prefix: '/@me/settings' })
  }
}
