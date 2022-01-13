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
import type { User, RestUser } from '@powercord/types/users'
import { createHash } from 'crypto'
import { formatUser } from '../utils/users.js'
import settingsModule from './settings.js'
import config from '../config.js'
import { fetchTokens } from '../utils/oauth.js'

const DATE_ZERO = new Date(0)

async function sendUser (request: FastifyRequest, reply: FastifyReply, user: User, self?: boolean): Promise<RestUser | void> {
  const etag = `W/"${createHash('sha1').update(config.secret).update(user._id).update((user.updatedAt ?? DATE_ZERO).toISOString()).digest('base64')}"`

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

async function getUser (this: FastifyInstance, request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<RestUser | void> {
  const user = await this.mongo.db!.collection<User>('users').findOne({ _id: request.params.id })
  if (!user) return reply.callNotFound()
  return sendUser(request, reply, user)
}

async function getSpotifyToken (this: FastifyInstance, request: FastifyRequest<{ TokenizeUser: User }>): Promise<unknown> {
  const { spotify } = request.user!.accounts
  if (!spotify) return { token: null }

  const users = this.mongo.db!.collection<User>('users')
  if (Date.now() >= spotify.expiryDate) {
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
        'accounts.spotify.expiryDate': Date.now() + (tokens.expires_in * 1000),
        updatedAt: new Date(),
      }

      // [Cynthia] Spotify docs says "A new refresh token MIGHT be returned"
      if (tokens.refresh_token) updatedFields['accounts.spotify.refreshToken'] = tokens.refresh_token
      console.log('new tokens', tokens)
      await users.updateOne({ _id: request.user!._id }, { $set: updatedFields })

      return { token: tokens.access_token }
    } catch (e) {
      return { token: null, revoked: 'ACCESS_DENIED' }
    }
  }

  return { token: spotify.accessToken }
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.register(settingsModule, { prefix: '/@me/settings' })
  fastify.get<{ TokenizeUser: User }>('/@me', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, getSelf)
  fastify.get<{ TokenizeUser: User }>('/@me/spotify', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, getSpotifyToken)
  fastify.get('/:id(\\d+)', getUser)
}
