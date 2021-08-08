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

// todo: oauth state & schema

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { User } from '@powercord/types/users'
import { fetchMember, addRole, setRoles } from '../utils/discord.js'
import discordAuth from '../oauth/discord.js'
import spotifyAuth from '../oauth/spotify.js'
import config from '../config.js'

type OAuth2Query = { error?: string, code?: string, redirect?: string, return?: string }
type Auth = { TokenizeUser: User }
type OAuth = { Querystring: OAuth2Query }
type AuthOAuth = Auth & OAuth

async function discord (this: FastifyInstance, request: FastifyRequest<OAuth>, reply: FastifyReply): Promise<void> {
  if (request.query.error) {
    reply.redirect('/')
    return
  }

  if (request.query.code) {
    const codes = await discordAuth.getToken(request.query.code)
    const user = await discordAuth.getCurrentUser(codes.access_token)
    const collection = this.mongo.db!.collection<User>('users')
    const banStatus = await this.mongo.db!.collection('userbans').findOne({ _id: user.id })
    if (banStatus && banStatus.account) {
      // todo: Notify the user why the auth failed instead of silently failing
      reply.redirect('/')
      return
    }

    if (await collection.countDocuments({ _id: user.id }) === 0) {
      try {
        await addRole(user.id, config.discord.ids.roleUser, 'User created their powercord.dev account')
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
            expiryDate: Date.now() + (codes.expires_in * 1000),
          },
        },
        badges: {},
        createdAt: new Date(),
        patronTier: 0,
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
            expiryDate: Date.now() + (codes.expires_in * 1000),
          },
        },
      })
    }
    const token = this.tokenize.generate(user.id)
    reply.setCookie('token', token, {
      signed: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 3600,
    })

    if (request.cookies.redirect) {
      const cookie = reply.unsignCookie(request.cookies.redirect)
      if (cookie.valid) {
        reply.setCookie('redirect', '', { maxAge: 0 }).redirect(cookie.value!)
        return
      }
    }
    reply.redirect('/me')
    return
  }

  if (request.query.redirect) {
    reply.setCookie('redirect', request.query.redirect, {
      signed: true,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600,
    })
  }

  reply.redirect(discordAuth.getRedirectUrl())
}

async function spotify (this: FastifyInstance, request: FastifyRequest<{ TokenizeUser: User, Querystring: OAuth2Query }>, reply: FastifyReply): Promise<void> {
  if (!request.user) {
    reply.redirect('/api/v2/oauth/discord?redirect=/api/v2/oauth/spotify')
    return
  }

  if (request.query.error) {
    console.log(request.query.error)
    reply.redirect('/')
    return
  }

  if (request.query.code) {
    const codes = await spotifyAuth.getToken(request.query.code)
    const user = await spotifyAuth.getCurrentUser(codes.access_token)
    await this.mongo.db!.collection('users').updateOne({ _id: request.user!._id }, {
      $set: {
        'accounts.spotify': {
          accessToken: codes.access_token,
          refreshToken: codes.refresh_token,
          expiryDate: Date.now() + (codes.expires_in * 1000),
          name: user.display_name,
          scopes: spotifyAuth.scopes,
        },
      },
    })
    reply.redirect('/me')
    return
  }

  reply.redirect(spotifyAuth.getRedirectUrl())
}

async function unlinkDiscord (this: FastifyInstance, request: FastifyRequest<Auth>, reply: FastifyReply): Promise<void> {
  try {
    const toRevoke = [
      config.discord.ids.roleUser,
      config.discord.ids.roleHunter,
      config.discord.ids.roleTranslator,
      config.discord.ids.roleContributor,
    ]

    const member = await fetchMember(request.user!._id)
    const newRoles = member.roles.filter((r) => !toRevoke.includes(r))
    await setRoles(request.user!._id, newRoles, 'User deleted their powercord.dev account')
  } catch (e) {
    // Let it fail silently
  }

  await this.mongo.db!.collection('users').deleteOne({ _id: request.user!._id })
  reply.setCookie('token', '', { maxAge: 0 }).redirect('/')
}

async function unlinkSpotify (this: FastifyInstance, request: FastifyRequest<Auth>, reply: FastifyReply): Promise<void> {
  if (!request.user) {
    reply.redirect('/api/v2/oauth/discord?redirect=/api/v2/oauth/spotify')
    return
  }

  await this.mongo.db!.collection('users').updateOne({ _id: request.user!._id }, { $set: { 'accounts.spotify': null } })
  reply.redirect('/me')
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/discord', discord)

  fastify.get<AuthOAuth>('/spotify', { preHandler: fastify.auth([ fastify.verifyTokenizeToken, (_, __, next) => next() ]) }, spotify)
  fastify.get<Auth>('/spotify/unlink', { preHandler: fastify.auth([ fastify.verifyTokenizeToken, (_, __, next) => next() ]) }, unlinkSpotify)
  fastify.get<Auth>('/discord/unlink', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, unlinkDiscord)
}
