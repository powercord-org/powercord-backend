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
const spotifyAuth = require('../oauth/spotify')
const githubAuth = require('../oauth/github')

async function discord (request, reply) {
  if (request.query.error) {
    return reply.redirect('/')
  }
  if (request.query.code) {
    const codes = await discordAuth.getToken(request.query.code)
    const user = await discordAuth.getCurrentUser(codes.access_token)
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
        patronTier: 0
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
    const token = this.tokenize.generate(user.id)
    reply.setCookie('token', token, {
      signed: true,
      sameSite: 'lax',
      path: '/',
      secure: !process.argv.includes('-d'),
      maxAge: 24 * 3600
    })

    if (request.cookies.redirect) {
      return reply.setCookie('redirect', null, { maxAge: 0 })
        .redirect(reply.unsignCookie(request.cookies.redirect))
    }
    return reply.redirect('/me')
  }

  if (request.query.redirect) {
    reply.setCookie('redirect', request.query.redirect, {
      signed: true,
      httpOnly: true,
      sameSite: 'lax',
      secure: !process.argv.includes('-d'),
      maxAge: 3600
    })
  }
  return reply.redirect(discordAuth.getRedirectUrl())
}

async function spotify (request, reply) {
  if (request.query.error) {
    console.log(request.query.error)
    return reply.redirect('/')
  }

  if (request.query.code) {
    const codes = await spotifyAuth.getToken(request.query.code)
    const user = await spotifyAuth.getCurrentUser(codes.access_token)
    this.mongo.db.collection('users').updateOne({ _id: request.user._id }, {
      $set: {
        'accounts.spotify': {
          accessToken: codes.access_token,
          refreshToken: codes.refresh_token,
          expiryDate: Date.now() + (codes.expires_in * 1000),
          name: user.display_name,
          scopes: spotifyAuth.scopes
        }
      }
    })
    return reply.redirect('/me')
  }

  return reply.redirect(spotifyAuth.getRedirectUrl())
}

async function github (request, reply) {
  if (request.query.error) {
    return reply.redirect('/')
  }

  if (request.query.code) {
    const codes = await githubAuth.getToken(request.query.code)
    const user = await githubAuth.getCurrentUser(codes.access_token)
    this.mongo.db.collection('users').updateOne({ _id: request.user._id }, {
      $set: {
        'accounts.github': {
          accessToken: codes.access_token,
          display: user.name || user.login,
          login: user.login
        }
      }
    })
    return reply.redirect('/me')
  }

  return reply.redirect(githubAuth.getRedirectUrl())
}

function unlinkDiscord (request, reply) {
  this.mongo.db.collection('users').deleteOne({ _id: request.user._id })
  reply.setCookie('token', null, { maxAge: 0 }).redirect('/')
}

function unlinkSpotify (request, reply) {
  this.mongo.db.collection('users').updateOne({ _id: request.user._id }, { $set: { 'accounts.spotify': null } })
  reply.code(204).send()
}

function unlinkGithub (request, reply) {
  this.mongo.db.collection('users').updateOne({ _id: request.user._id }, { $set: { 'accounts.github': null } })
  reply.code(204).send()
}

module.exports = async function (fastify) {
  fastify.get('/discord', discord)
  fastify.get('/github', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, github)
  fastify.get('/spotify', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, spotify)
  fastify.get('/discord/unlink', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, unlinkDiscord)
  fastify.get('/spotify/unlink', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, unlinkSpotify)
  fastify.get('/github/unlink', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, unlinkGithub)
}
