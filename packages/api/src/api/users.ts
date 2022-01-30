/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { User, RestUser } from '@powercord/types/users'
import { createHash } from 'crypto'
import config from '@powercord/shared/config'
import { formatUser } from '../utils/users.js'
import settingsModule from './settings.js'
import { fetchTokens } from '../utils/oauth.js'

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

async function getSelf (request: FastifyRequest<{ TokenizeUser: User }>, reply: FastifyReply): Promise<RestUser | void> {
  return sendUser(request, reply, request.user!, true)
}

/** @deprecated */
async function getUser (this: FastifyInstance, request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const user = await this.mongo.db!.collection<User>('users').findOne({ _id: request.params.id })

  if (!user) return reply.callNotFound()
  return sendUser(request, reply, user)
}

async function getSpotifyToken (this: FastifyInstance, request: FastifyRequest<{ TokenizeUser: User }>): Promise<unknown> {
  const { spotify } = request.user!.accounts
  if (!spotify) return { token: null }

  const users = this.mongo.db!.collection<User>('users')
  if (Date.now() >= spotify.expiresAt) {
    try {
      const tokens = await fetchTokens(
        'https://accounts.spotify.com/api/token',
        config.spotify.clientID,
        config.spotify.clientSecret,
        '',
        'refresh_token',
        spotify.refreshToken
      )

      if (!tokens.access_token) {
        await users.updateOne({ _id: request.user!._id }, { $unset: { 'accounts.spotify': 1 }, $set: { updatedAt: new Date() } })
        return { token: null, revoked: 'ACCESS_DENIED' }
      }

      const updatedFields: Record<string, unknown> = {
        'accounts.spotify.accessToken': tokens.access_token,
        'accounts.spotify.refreshToken': tokens.refresh_token || spotify.refreshToken,
        'accounts.spotify.expiresAt': Date.now() + (tokens.expires_in * 1000),
        updatedAt: new Date(),
      }

      await users.updateOne({ _id: request.user!._id }, { $set: updatedFields })
      return { token: tokens.access_token }
    } catch {
      // todo: analyze the error? unlink the account?
      return { token: null, revoked: 'ACCESS_DENIED' }
    }
  }

  return { token: spotify.accessToken }
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ TokenizeUser: User }>('/@me', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, getSelf)
  fastify.get<{ TokenizeUser: User }>('/@me/spotify', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, getSpotifyToken)

  if (!fastify.prefix.startsWith('/v3')) {
    fastify.get('/:id(\\d+)', getUser)
  } else {
    // todo: implement
    fastify.get('/avatar/:id(\\d{17,}).webp', () => void 0)
    fastify.register(settingsModule, { prefix: '/@me/settings' })
  }
}
