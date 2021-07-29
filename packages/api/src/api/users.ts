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
import spotifyAuth from '../oauth/spotify.js'
import { formatUser } from '../utils/users.js'
import settingsModule from './settings.js'
import config from '../config.js'

async function getSelf (request: FastifyRequest<{ TokenizeUser: User }>): Promise<RestUser> {
  return formatUser(request.user!, true)
}

async function getUser (this: FastifyInstance, request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<RestUser | void> {
  const user = await this.mongo.db!.collection<User>('users').findOne({ _id: request.params.id })
  if (!user) return reply.callNotFound()
  return formatUser(user!)
}

async function getSpotifyToken (this: FastifyInstance, request: FastifyRequest<{ TokenizeUser: User }>): Promise<unknown> {
  const { spotify } = request.user!.accounts
  if (!spotify) return { token: null }

  if (!spotify.scopes || !config.spotify.scopes.every((key: string) => spotify.scopes.includes(key))) {
    await this.mongo.db!.collection('users').updateOne({ _id: request.user!._id }, { $set: { 'accounts.spotify': null } })
    return { token: null, revoked: 'SCOPES_UPDATED' }
  }

  if (Date.now() >= spotify.expiryDate) {
    try {
      const codes = await spotifyAuth.refreshToken(spotify.refreshToken)
      const upd: Record<string, unknown> = {
        'accounts.spotify.accessToken': codes.access_token,
        'accounts.spotify.expiryDate': Date.now() + (codes.expires_in * 1000),
      }
      if (codes.refresh_token) {
        upd['accounts.spotify.refreshToken'] = codes.refresh_token
      }
      await this.mongo.db!.collection('users').updateOne({ _id: request.user!._id }, { $set: upd })
      return { token: codes.access_token }
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
