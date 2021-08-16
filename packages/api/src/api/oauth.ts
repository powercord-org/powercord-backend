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

import type { FastifyInstance } from 'fastify'
import type { User } from '@powercord/types/users'
import oauthPlugin, { fetchTokens } from '../utils/oauth.js'
import { fetchCurrentUser } from '../utils/discord.js'
import config from '../config.js'

export async function refreshUserData (fastify: FastifyInstance, user: User): Promise<User | null> {
  if (Date.now() < user.accounts.discord.expiryDate) return user

  // Refresh account data
  try {
    const newTokens = await fetchTokens(
      'https://discord.com/api/v9/oauth2/token',
      config.discord.clientID,
      config.discord.clientSecret,
      '',
      'refresh_token',
      user.accounts.discord.refreshToken
    )

    const userData = await fetchCurrentUser(newTokens.access_token)
    const updatedUser = await fastify.mongo.db!.collection<User>('users').findOneAndUpdate({ _id: userData.id }, {
      $set: {
        updatedAt: new Date(),
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        'accounts.discord.accessToken': newTokens.access_token,
        'accounts.discord.refreshToken': newTokens.refresh_token,
        'accounts.discord.expiryDate': Date.now() + (newTokens.expires_in * 1000),
      },
    }, { returnDocument: 'after' })

    return updatedUser.value!
  } catch {
    return null
  }
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.register(oauthPlugin, {
    prefix: '/discord',
    data: {
      platform: 'discord',
      clientId: config.discord.clientID,
      clientSecret: config.discord.clientSecret,
      authorizeUrl: 'https://discord.com/oauth2/authorize',
      tokenUrl: 'https://discord.com/api/v9/oauth2/token',
      selfUrl: 'https://discord.com/api/v9/users/@me',
      scopes: [ 'identify' ],
      isAuthentication: true,
    },
  })

  fastify.register(oauthPlugin, {
    prefix: '/spotify',
    data: {
      platform: 'spotify',
      clientId: config.spotify.clientID,
      clientSecret: config.spotify.clientSecret,
      authorizeUrl: 'https://accounts.spotify.com/authorize',
      tokenUrl: 'https://accounts.spotify.com/api/token',
      selfUrl: 'https://api.spotify.com/v1/me',
      scopes: config.spotify.scopes,
    },
  })
}
