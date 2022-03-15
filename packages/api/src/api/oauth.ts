/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { FastifyInstance, FastifyRequest, FastifyReply, ConfiguredReply } from 'fastify'
import type { UpdateFilter } from 'mongodb'
import type { OAuthProvider, OAuthToken } from '../utils/oauth.js'
import type { DatabaseUser, User } from '@powercord/types/users'
import { Long } from 'mongodb'
import { randomBytes } from 'crypto'
import config from '@powercord/shared/config'
import { UserFlags } from '@powercord/shared/flags'
import { OAuthEndpoints, getAuthorizationUrl, getAuthTokens, fetchAccount, toMongoFields } from '../utils/oauth.js'
import { deleteUser, UserDeletionCause } from '../data/user.js'
import { fetchTokens } from '../utils/oauth.js'
import { fetchCurrentUser, addRole } from '../utils/discord.js'
import { prepareUpdateData, notifyStateChange } from '../utils/patreon.js'
import { TokenType } from '../utils/auth.js'

/** @deprecated */
export async function refreshUserData (fastify: FastifyInstance, user: User): Promise<User | null> {
  if (Date.now() < user.accounts.discord.expiresAt) return user

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

    // type safety: we're doing appropriate flags checking
    const updatedUser = await fastify.mongo.db!.collection<User>('users').findOneAndUpdate(
      { _id: userData.id, flags: { $bitsAllClear: UserFlags.GHOST } },
      {
        $currentDate: { updatedAt: true },
        $set: {
          username: userData.username,
          discriminator: userData.discriminator,
          avatar: userData.avatar,
          'accounts.discord.accessToken': newTokens.access_token,
          'accounts.discord.refreshToken': newTokens.refresh_token,
          'accounts.discord.expiresAt': Date.now() + (newTokens.expires_in * 1000),
        },
      },
      { returnDocument: 'after' }
    )

    return updatedUser.value
  } catch {
    return null
  }
}

type OAuthConfig = {
  platform: OAuthProvider
  scopes: string[]
  isRestricted?: boolean
}

type OAuthOptions = { data: OAuthConfig }

type AuthorizationRequestProps = {
  Querystring: {
    redirect?: string,
    // api:v2
    code?: string
    error?: string
  }
}

type CallbackRequestProps = {
  Querystring: {
    code?: string
    error?: string
    state?: string
  }
}

type Reply = ConfiguredReply<FastifyReply, OAuthConfig>

async function authorize (this: FastifyInstance, request: FastifyRequest<AuthorizationRequestProps>, reply: Reply) {
  if (reply.context.config.platform === 'discord' && request.user) {
    reply.redirect('/me')
    return
  }

  if (reply.context.config.isRestricted && ((request.user?.flags ?? 0) & UserFlags.STAFF) === 0) {
    reply.redirect('/')
    return
  }

  const apiVersion = this.prefix.split('/')[1]
  const cookieSettings = <const> {
    signed: true,
    httpOnly: true,
    sameSite: 'lax',
    path: `/api/${apiVersion}`,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 300,
  }

  if (reply.context.config.platform !== 'discord' && !request.user) {
    reply.setCookie('redirect', `/api${request.url}`, cookieSettings)
    reply.redirect(`/api/${apiVersion}/login`)
    return
  }

  // api:v2
  if (apiVersion !== 'v3') {
    if (request.query.redirect) {
      reply.setCookie('redirect', request.query.redirect, cookieSettings)
    }

    if (request.query.code || request.query.error) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return callback.call(this, request, reply)
    }
  }

  const state = randomBytes(16).toString('hex')
  reply.setCookie('state', state, cookieSettings)

  // api:v2
  const redirect = apiVersion !== 'v3' ? request.routerPath : `${request.routerPath}/callback`
  reply.redirect(getAuthorizationUrl(reply.context.config.platform, redirect, reply.context.config.scopes, state))
}

async function callback (this: FastifyInstance, request: FastifyRequest<CallbackRequestProps>, reply: Reply) {
  const collection = this.mongo.db!.collection<DatabaseUser>('users')
  const returnPath = reply.context.config.platform === 'discord' ? '/' : '/me'
  const authStatus = Boolean(reply.context.config.platform === 'discord') !== Boolean(request.user)

  if (!authStatus || !request.query.state) {
    reply.redirect(returnPath)
    return
  }

  const stateCookie = request.cookies.state ? reply.unsignCookie(request.cookies.state) : null
  const redirectCookie = request.cookies.redirect ? reply.unsignCookie(request.cookies.redirect) : null

  const apiVersion = this.prefix.split('/')[1]
  reply.setCookie('state', '', { sameSite: 'lax', path: `/api/${apiVersion}`, secure: process.env.NODE_ENV === 'production', maxAge: 0 })
  reply.setCookie('redirect', '', { sameSite: 'lax', path: `/api/${apiVersion}`, secure: process.env.NODE_ENV === 'production', maxAge: 0 })

  if (!stateCookie?.valid || request.query.state !== stateCookie.value) {
    reply.redirect(returnPath)
    return
  }

  if (request.query.error || !request.query.code) {
    reply.redirect(`${redirectCookie?.value ?? returnPath}?error=auth_failure`)
    return
  }

  let oauthToken: OAuthToken
  let account: any
  try {
    oauthToken = await getAuthTokens(reply.context.config.platform, request.routerPath, request.query.code)
    account = await fetchAccount<any>(reply.context.config.platform, oauthToken)
  } catch {
    reply.redirect(`${redirectCookie?.value ?? returnPath}?error=auth_failure`)
    return
  }

  if (reply.context.config.platform === 'discord') {
    const isBanned = await collection.countDocuments({ _id: account.id, flags: { $bitsAllSet: UserFlags.BANNED } })
    if (isBanned) {
      reply.redirect(`${redirectCookie?.value ?? returnPath}?error=auth_banned`)
      return
    }

    const date = new Date()
    const res = await collection.findOneAndUpdate(
      { _id: account.id },
      {
        $currentDate: { updatedAt: true },
        $min: { createdAt: date }, // Add creation time if necessary
        $bit: { flags: { and: new Long(((1n << 64n) - 1n) & ~BigInt(UserFlags.GHOST), true) } }, // Remove ghost flag
        $set: {
          username: account.username,
          discriminator: account.discriminator,
          avatar: account.avatar,
          ...toMongoFields(oauthToken, 'discord'),
        },
      },
      { upsert: true, returnDocument: 'after', projection: { flags: 1, createdAt: 1 } }
    )

    // Cast is safe
    const user = res.value as User
    if (user.createdAt === date) {
      // New account
      addRole(user._id, config.discord.roles.user, 'User created their powercord.dev account').catch(() => 0)
    }

    const token = reply.generateToken({ id: user._id }, TokenType.WEB)
    reply.setCookie('token', token, {
      // Signing the cookie is unnecessary as the JWT itself is signed
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 3600,
    })

    reply.redirect(redirectCookie?.value ?? '/me')
    return
  }

  const accountId = account.data?.id || account.id
  const accountName = account.data?.attributes.email || account.login || account.display_name
  const accountOwner = await collection.findOne({ [`accounts.${reply.context.config.platform}.id`]: accountId })
  if (accountOwner && accountOwner._id !== request.user!._id) {
    reply.redirect(`${redirectCookie?.value ?? returnPath}?error=already_linked`)
    return
  }

  let update: UpdateFilter<User> = {
    $currentDate: { updatedAt: true },
    $set: {
      [`accounts.${reply.context.config.platform}.id`]: accountId,
      [`accounts.${reply.context.config.platform}.name`]: accountName,
      ...toMongoFields(oauthToken, reply.context.config.platform),
    },
  }

  if (reply.context.config.platform === 'patreon' && !('patreon' in request.user!.accounts) && (request.user!.flags & UserFlags.CUTIE_OVERRIDE) === 0) {
    const data = await prepareUpdateData(oauthToken)
    update = {
      ...data,
      $set: {
        ...data.$set ?? {},
        ...update.$set,
      },
    }
  }

  const res = await collection.findOneAndUpdate({ _id: request.user!._id }, update, { returnDocument: 'after' })

  // Patreon update report
  const updatedUser = res.value as User
  const prevFlag = Boolean(request.user!.flags & UserFlags.IS_CUTIE)
  const updatedFlag = Boolean(updatedUser!.flags & UserFlags.IS_CUTIE)
  const prevTier = request.user!.cutieStatus?.pledgeTier ?? 0
  const updatedTier = updatedUser.cutieStatus?.pledgeTier ?? 0
  if (prevFlag !== updatedFlag || prevTier !== updatedTier) {
    notifyStateChange(updatedUser, 'pledge')
  }

  reply.redirect(redirectCookie?.value ?? '/me')
}

async function unlink (this: FastifyInstance, request: FastifyRequest, reply: Reply) {
  if (reply.context.config.platform === 'discord') {
    if (request.user!.flags & UserFlags.STORE_PUBLISHER) {
      reply.redirect('/me?error=delete_blocked')
      return
    }

    await deleteUser(this.mongo.client, request.user!._id, UserDeletionCause.REQUESTED)
    reply.setCookie('token', '', { maxAge: 0, path: '/' })
    reply.redirect('/')
    return
  }

  if (reply.context.config.isRestricted && ((request.user?.flags ?? 0) & UserFlags.STAFF) === 0) {
    reply.redirect('/')
    return
  }

  await this.mongo.db!.collection<DatabaseUser>('users').updateOne(
    { _id: request.user!._id },
    { $currentDate: { updatedAt: true }, $unset: { [`accounts.${reply.context.config.platform}`]: 1 } }
  )

  reply.redirect('/me')
}

async function oauthPlugin (fastify: FastifyInstance, options: OAuthOptions) {
  fastify.route({
    method: 'GET',
    url: '/',
    handler: authorize,
    config: {
      ...options.data,
      auth: { optional: true },
    },
  })

  fastify.route({
    method: 'GET',
    url: '/callback',
    handler: callback,
    config: {
      ...options.data,
      auth: { optional: true },
    },
  })

  fastify.route({
    method: 'GET',
    url: '/unlink',
    handler: unlink,
    config: {
      ...options.data,
      auth: {},
    },
  })
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.register(oauthPlugin, {
    prefix: '/discord',
    data: {
      platform: 'discord',
      scopes: [ 'identify' ],
    },
  })

  fastify.register(oauthPlugin, {
    prefix: '/spotify',
    data: {
      platform: 'spotify',
      scopes: [
        // Know what you're playing
        'user-read-currently-playing',
        'user-read-playback-state',
        // Change tracks on your behalf
        'user-modify-playback-state',
        // Read your public & private songs
        'playlist-read-private',
        'user-library-read',
        'user-top-read',
        // Add things to your library
        'user-library-modify',
        'playlist-modify-public',
        'playlist-modify-private',
      ],
    },
  })

  // api:v2
  if (fastify.prefix.startsWith('/v3')) {
    fastify.register(oauthPlugin, {
      prefix: '/github',
      data: {
        isRestricted: true,
        platform: 'github',
        scopes: [],
      },
    })

    fastify.register(oauthPlugin, {
      prefix: '/patreon',
      data: {
        platform: 'patreon',
        scopes: [ 'identity', 'identity[email]' ],
      },
    })
  }
}
