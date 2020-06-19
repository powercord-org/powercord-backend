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

const discordAuth = require('../oauth/discord')
const discordApi = require('../utils/discord')

async function discord (request, reply) {
  if (request.query.error) {
    return reply.redirect('/')
  }
  if (request.query.code) {
    const codes = await discordAuth.getToken(request.query.code)
    const user = await discordApi.fetchSelfUser(codes.access_token)
    const collection = this.mongo.db.collection('users')
    if (collection.count({ _id: user.id }) === 0) {
      collection.insertOne({
        _id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
        accounts: {
          discord: {
            accessToken: codes.access_token,
            refreshToken: codes.refresh_token,
            expiryDate: Date.now() + (codes.expires_in * 1000)
          }
        },
        badges: {},
        createdAt: new Date(),
        patreonTier: 0
      })
    } else {
      collection.updateOne({ _id: user.id }, {
        $set: {
          username: user.username,
          discriminator: user.discriminator,
          avatar: user.avatar,
          'accounts.discord': {
            accessToken: codes.access_token,
            refreshToken: codes.refresh_token,
            expiryDate: Date.now() + (codes.expires_in * 1000)
          }
        }
      })
    }
    // todo: make a proper token
    return reply.redirect(`/me?t=${'i use arch'}`)
  }

  return reply.redirect(discordAuth.getRedirectUrl())
}

function unlinkDiscord (_, reply) {
  // todo: handle authentication and keep track of the user id
  this.mongo.db.collection('users').deleteOne({ _id: null })
  return reply.redirect('/')
}

module.exports = async function (fastify) {
  fastify.get('/discord', discord)
  fastify.get('/discord/unlink', unlinkDiscord)
}
