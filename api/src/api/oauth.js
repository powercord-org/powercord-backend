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

const discordApi = require('../utils/discord')
const discordAuth = require('../oauth/discord')
const spotifyAuth = require('../oauth/spotify')
const config = require('../../../config.json')

async function discord (request, reply) {
  if (request.query.error) {
    return reply.redirect('/')
  }
  if (request.query.code) {
    const codes = await discordAuth.getToken(request.query.code)
    const user = await discordAuth.getCurrentUser(codes.access_token)
    const collection = this.mongo.db.collection('users')
    const banStatus = await this.mongo.db.collection('banned').findOne({ _id: user.id })
    if (banStatus && banStatus.account) {
      // todo: Notify the user why the auth failed instead of silently failing
      return reply.redirect('/')
    }

    if (await collection.countDocuments({ _id: user.id }) === 0) {
      try {
        await discordApi.addRole(user.id, config.discord.ids.roleUser, 'User created their powercord.dev account')
      } catch (e) {
        // Let it fail silently
      }

      await collection.insertOne({
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
      await collection.updateOne({ _id: user.id }, {
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
      const cookie = reply.unsignCookie(request.cookies.redirect)
      if (cookie.valid) {
        return reply.setCookie('redirect', null, { maxAge: 0 }).redirect(cookie.value)
      }
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
    await this.mongo.db.collection('users').updateOne({ _id: request.user._id }, {
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

async function unlinkDiscord (request, reply) {
  try {
    const toRevoke = [
      config.discord.ids.roleUser,
      config.discord.ids.roleHunter,
      config.discord.ids.roleTranslator,
      config.discord.ids.roleContributor
    ]

    const member = await discordAuth.fetchMember(request.user._id)
    const newRoles = member.roles.filter(r => !toRevoke.includes(r))
    await discordApi.setRoles(request.user._id, newRoles, 'User deleted their powercord.dev account')
  } catch (e) {
    // Let it fail silently
  }
  await this.mongo.db.collection('users').deleteOne({ _id: request.user._id })
  reply.setCookie('token', null, { maxAge: 0 }).redirect('/')
}

async function unlinkSpotify (request, reply) {
  await this.mongo.db.collection('users').updateOne({ _id: request.user._id }, { $set: { 'accounts.spotify': null } })
  reply.redirect('/me')
}

module.exports = async function (fastify) {
  fastify.get('/discord', discord)
  fastify.get('/spotify', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, spotify)
  fastify.get('/discord/unlink', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, unlinkDiscord)
  fastify.get('/spotify/unlink', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, unlinkSpotify)
}
