/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance } from 'fastify'
import type { User } from '@powercord/types/users'
import config from '@powercord/shared/config'
import oauthPlugin, { fetchTokens } from '../utils/oauth.js'
import { fetchCurrentUser } from '../utils/discord.js'

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

  fastify.register(oauthPlugin, {
    prefix: '/github',
    data: {
      platform: 'github',
      clientId: config.github.clientID,
      clientSecret: config.github.clientSecret,
      authorizeUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      selfUrl: 'https://api.github.com/user',
      scopes: [],
      locked: true,
    },
  })
}
