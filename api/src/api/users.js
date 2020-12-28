/*
 * Copyright (c) 2018-2020 aetheryx & Bowser65
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

const spotifyAuth = require('../oauth/spotify')
const { formatUser } = require('../utils/users')
const config = require('../../../config.json')

async function getSelf (request) {
  return formatUser(request.user, true)
}

async function getUser (request, reply) {
  const user = await this.mongo.db.collection('users').findOne({ _id: request.params.id })
  if (!user) return reply.code(404).send({ error: 404, message: 'Not Found' })
  return formatUser(user)
}

async function getSpotifyToken (request) {
  const { spotify } = request.user.accounts
  if (!spotify) {
    return { token: null }
  }

  if (!spotify.scopes || !config.spotify.scopes.every(key => spotify.scopes.includes(key))) {
    await this.mongo.db.collection('users').updateOne({ _id: request.user._id }, { $set: { 'accounts.spotify': null } })
    return { token: null, revoked: 'SCOPES_UPDATED' }
  }

  if (Date.now() >= spotify.expiryDate) {
    try {
      const codes = await spotifyAuth.refreshToken(spotify.refreshToken)
      const upd = {
        'accounts.spotify.accessToken': codes.access_token,
        'accounts.spotify.expiryDate': Date.now() + (codes.expires_in * 1000)
      }
      if (codes.refresh_token) {
        upd['accounts.spotify.refreshToken'] = codes.refresh_token
      }
      await this.mongo.db.collection('users').updateOne({ _id: request.user._id }, { $set: upd })
      return { token: codes.access_token }
    } catch (e) {
      return { token: null, revoked: 'ACCESS_DENIED' }
    }
  }

  return { token: spotify.accessToken }
}

module.exports = async function (fastify) {
  fastify.register(require('./settings'), { prefix: '/@me' })
  fastify.get('/@me', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, getSelf)
  fastify.get('/@me/spotify', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, getSpotifyToken)
  fastify.get('/:id(\\d+)', getUser)
}
