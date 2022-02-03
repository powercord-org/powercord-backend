/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { User, RestUser } from '@powercord/types/users'
import { createHash } from 'crypto'
import config from '@powercord/shared/config'
import settingsModule from './settings.js'
import { refreshDonatorState } from '../utils/patreon.js'
import { refreshAuthTokens, toMongoFields } from '../utils/oauth.js'
import { formatUser } from '../utils/users.js'

const DATE_ZERO = new Date(0)

async function sendUser (request: FastifyRequest, reply: FastifyReply, user: User, self?: boolean): Promise<RestUser | void> {
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
    || { _id: request.params.id, username: 'Herobrine', discriminator: '0001', avatar: null, createdAt: DATE_ZERO, accounts: <any> {} }

  await refreshDonatorState(this.mongo.client, user)
  return sendUser(request, reply, user)
}

async function getSelf (this: FastifyInstance, request: FastifyRequest<{ TokenizeUser: User }>, reply: FastifyReply): Promise<RestUser | void> {
  await refreshDonatorState(this.mongo.client, request.user!)
  return sendUser(request, reply, request.user!, true)
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

  // 1 refresh per hour
  if (Date.now() - lastManualRefresh < 3600e3) {
    reply.code(429).send({ error: 429, message: 'A refresh already was requested within the previous hour. Try again later.' })
    return
  }

  await refreshDonatorState(this.mongo.client, request.user!, true)
  reply.send(request.user!.cutieStatus || null)
}


export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ TokenizeUser: User }>('/@me', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, getSelf)
  fastify.get<{ TokenizeUser: User }>('/@me/spotify', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, getSpotifyToken)

  if (!fastify.prefix.startsWith('/v3')) {
    fastify.get('/:id(\\d+)', getUser)
  } else {
    // todo: implement
    fastify.get('/avatar/:id(\\d{17,}).png', () => void 0)
    fastify.post<{ TokenizeUser: User }>('/@me/refresh-pledge', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, refreshPledge)
    fastify.register(settingsModule, { prefix: '/@me/settings' })
  }
}
