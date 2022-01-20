/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance } from 'fastify'
import type { User } from '@powercord/types/users'
import config from '@powercord/shared/config'
import oauthPlugin, { fetchTokens, OAuthEndpoints } from '../utils/oauth.js'
import { fetchCurrentUser } from '../utils/discord.js'

// todo: oauth state & schema

// SELF_URL: 'https://discord.com/api/v9/users/@me',
// SELF_URL: 'https://api.spotify.com/v1/me',
// SELF_URL: 'https://api.github.com/user',
// SELF_URL: 'https://patreon.com/api/oauth2/v2/identity',

/** @deprecated */
export async function refreshUserData (fastify: FastifyInstance, user: User): Promise<User | null> {
  if (Date.now() < user.accounts.discord.expiryDate) return user

  // Refresh account data
  try {
    const newTokens = await fetchTokens(
      OAuthEndpoints.discord.TOKEN_URL,
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
      authorizeUrl: OAuthEndpoints.discord.AUTHORIZE_URL,
      tokenUrl: OAuthEndpoints.discord.TOKEN_URL,
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
      authorizeUrl: OAuthEndpoints.spotify.AUTHORIZE_URL,
      tokenUrl: OAuthEndpoints.spotify.TOKEN_URL,
      selfUrl: 'https://api.spotify.com/v1/me',
      scopes: config.spotify.scopes,
    },
  })

  // api:v2
  if (fastify.prefix.startsWith('/v3')) {
    fastify.register(oauthPlugin, {
      prefix: '/github',
      data: {
        platform: 'github',
        clientId: config.github.clientID,
        clientSecret: config.github.clientSecret,
        authorizeUrl: OAuthEndpoints.github.AUTHORIZE_URL,
        tokenUrl: OAuthEndpoints.github.TOKEN_URL,
        selfUrl: 'https://api.github.com/user',
        scopes: [],
        locked: true,
      },
    })

    fastify.register(oauthPlugin, {
      prefix: '/patreon',
      data: {
        platform: 'patreon',
        clientId: config.patreon.clientID,
        clientSecret: config.patreon.clientSecret,
        authorizeUrl: OAuthEndpoints.patreon.AUTHORIZE_URL,
        tokenUrl: OAuthEndpoints.patreon.TOKEN_URL,
        selfUrl: 'https://patreon.com/api/oauth2/v2/identity',
        scopes: [],
        locked: true,
      },
    })
  }
}
