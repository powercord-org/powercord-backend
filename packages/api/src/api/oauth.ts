/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance, FastifyRequest, FastifyReply, ConfiguredReply } from 'fastify'
import type { OAuthProvider, OAuthToken } from '../utils/oauth.js'
import type { User, UserBanStatus } from '@powercord/types/users'
import { randomBytes } from 'crypto'
import config from '@powercord/shared/config'
import { OAuthEndpoints, getAuthorizationUrl, getAuthTokens, fetchAccount, toMongoFields } from '../utils/oauth.js'
import { deleteUser, UserDeletionCause } from '../data/user.js'
import { fetchTokens } from '../utils/oauth.js'
import { fetchCurrentUser, addRole } from '../utils/discord.js'
import { prepareUpdateData } from '../utils/patreon.js'

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
    const updatedUser = await fastify.mongo.db!.collection<User>('users').findOneAndUpdate({ _id: userData.id }, {
      $set: {
        updatedAt: new Date(),
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        'accounts.discord.accessToken': newTokens.access_token,
        'accounts.discord.refreshToken': newTokens.refresh_token,
        'accounts.discord.expiresAt': Date.now() + (newTokens.expires_in * 1000),
      },
    }, { returnDocument: 'after' })

    return updatedUser.value!
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
  // api:v2
  TokenizeUser: User
  Querystring: {
    redirect?: string,
    // api:v2
    code?: string
    error?: string
  }
}

type CallbackRequestProps = {
  // api:v2
  TokenizeUser: User
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

  if (reply.context.config.isRestricted && !request.user?.badges?.staff) {
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
  if (apiVersion === 'v2') {
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
  const redirect = apiVersion === 'v2' ? request.routerPath : `${request.routerPath}/callback`
  reply.redirect(getAuthorizationUrl(reply.context.config.platform, redirect, reply.context.config.scopes, state))
}

async function callback (this: FastifyInstance, request: FastifyRequest<CallbackRequestProps>, reply: Reply) {
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
    const banStatus = await this.mongo.db!.collection<UserBanStatus>('userbans').findOne({ _id: account.id })
    if (banStatus?.account) {
      reply.redirect(`${redirectCookie?.value ?? returnPath}?error=auth_banned`)
      return
    }

    const res = await this.mongo.db!.collection<User>('users').updateOne(
      { _id: account.id },
      {
        $setOnInsert: { createdAt: new Date() },
        $set: {
          username: account.username,
          discriminator: account.discriminator,
          avatar: account.avatar,
          updatedAt: new Date(),
          ...toMongoFields(oauthToken, 'discord'),
        },
      },
      { upsert: true }
    )

    if (res.upsertedCount === 1) {
      // New account
      addRole(account.id, config.discord.roles.user, 'User created their powercord.dev account').catch(() => 0)
    }

    // todo: ditch tokenize
    const token = this.tokenize.generate(account.id)
    reply.setCookie('token', token, {
      signed: true,
      // todo: http only?
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
  const accountOwner = await this.mongo.db!.collection<User>('users').findOne({ [`accounts.${reply.context.config.platform}.id`]: accountId })
  if (accountOwner && accountOwner._id !== request.user!._id) {
    reply.redirect(`${redirectCookie?.value ?? returnPath}?error=already_linked`)
    return
  }

  const update = {
    updatedAt: new Date(),
    [`accounts.${reply.context.config.platform}.id`]: accountId,
    [`accounts.${reply.context.config.platform}.name`]: accountName,
    ...toMongoFields(oauthToken, reply.context.config.platform),
  }

  if (reply.context.config.platform === 'patreon' && !('patreon' in request.user!.accounts)) {
    const data = await prepareUpdateData(oauthToken)
    Object.assign(update, data[2])
  }

  await this.mongo.db!.collection<User>('users').updateOne({ _id: request.user!._id }, { $set: update })
  reply.redirect(redirectCookie?.value ?? '/me')
}

async function unlink (this: FastifyInstance, request: FastifyRequest<{ TokenizeUser: User }>, reply: Reply) {
  if (reply.context.config.platform === 'discord') {
    // todo: check if user is allowed to delete account
    await deleteUser(this.mongo.client, request.user!._id, UserDeletionCause.REQUESTED)
    reply.setCookie('token', '', { maxAge: 0, path: '/' }).redirect('/')
    reply.redirect('/')
    return
  }

  if (reply.context.config.isRestricted && !request.user?.badges?.staff) {
    reply.redirect('/')
    return
  }

  await this.mongo.db!.collection<User>('users').updateOne(
    { _id: request.user!._id },
    { $set: { updatedAt: new Date() }, $unset: { [`accounts.${reply.context.config.platform}`]: 1 } }
  )

  reply.redirect('/me')
}

async function oauthPlugin (fastify: FastifyInstance, options: OAuthOptions) {
  // todo: ditch tokenize
  fastify.get<AuthorizationRequestProps, OAuthConfig>('/', { config: options.data, preHandler: fastify.auth([ fastify.verifyTokenizeToken, (_, __, next) => next() ]) }, authorize)
  fastify.get<CallbackRequestProps, OAuthConfig>('/callback', { config: options.data, preHandler: fastify.auth([ fastify.verifyTokenizeToken, (_, __, next) => next() ]) }, callback)

  // api:v2
  if (fastify.prefix.startsWith('/v2')) {
    fastify.get<{ TokenizeUser: User }, OAuthConfig>('/unlink', { config: options.data, preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, unlink)
  } else {
    fastify.get<{ TokenizeUser: User }, OAuthConfig>('/unlink', { config: options.data, preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, unlink)
  }
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
