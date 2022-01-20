/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance, FastifyRequest, FastifyReply, ConfiguredReply } from 'fastify'
import type { User as DiscordUser } from '@powercord/types/discord'
import type { User } from '@powercord/types/users'
import { URLSearchParams } from 'url'
import { fetch } from 'undici'
import config from '@powercord/shared/config'
import { addRole } from './discord.js'
import { deleteUser, UserDeletionCause } from '../data/user.js'

// todo: oauth state & schema

export type OAuthTokens = { access_token: string, refresh_token?: string, expires_in: number }

export type OAuthSettings = {
  platform: string
  clientId: string
  clientSecret: string
  authorizeUrl: string
  tokenUrl: string
  selfUrl: string
  scopes: string[]
  isAuthentication?: boolean
  locked?: boolean
}

type RequestProps = {
  TokenizeUser: User
  Querystring: {
    error?: string
    code?: string
    redirect?: string
    return?: string
  }
}

type Reply = ConfiguredReply<FastifyReply, OAuthSettings>

const AUTH_URL = '/api/v2/oauth/discord'

/** @deprecated */
export async function fetchTokens (endpoint: string, clientId: string, clientSecret: string, redirect: string, type: 'authorization_code' | 'refresh_token', token: string): Promise<OAuthTokens> {
  const body = new URLSearchParams()
  body.set('client_id', clientId)
  body.set('client_secret', clientSecret)
  if (redirect) body.set('redirect_uri', redirect)
  body.set(type === 'authorization_code' ? 'code' : 'refresh_token', token)
  body.set('grant_type', type)

  return <any> fetch(endpoint, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  }).then((r) => r.json())
}

async function finishAuthentication (fastify: FastifyInstance, reply: Reply, tokens: OAuthTokens, user: DiscordUser, redirect?: string) {
  const collection = fastify.mongo.db!.collection<User>('users')
  const banStatus = await fastify.mongo.db!.collection<any>('userbans').findOne({ _id: user.id })
  if (banStatus?.account) {
    // todo: Notify the user why the auth failed instead of silently failing
    reply.redirect('/')
    return
  }

  const res = await collection.updateOne({ _id: user.id }, {
    $setOnInsert: { createdAt: new Date() },
    $set: {
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      updatedAt: new Date(),
      'accounts.discord.accessToken': tokens.access_token,
      'accounts.discord.refreshToken': tokens.refresh_token,
      'accounts.discord.expiryDate': Date.now() + (tokens.expires_in * 1000),
    },
  }, { upsert: true })

  if (res.upsertedCount === 1) {
    // New account
    addRole(user.id, config.discord.ids.roleUser, 'User created their powercord.dev account').catch(() => 0)
  }

  const token = fastify.tokenize.generate(user.id)
  reply.setCookie('token', token, {
    signed: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 3600,
  })

  if (redirect) {
    const cookie = reply.unsignCookie(redirect)
    if (cookie.valid) {
      reply.setCookie('redirect', '', { maxAge: 0 }).redirect(cookie.value!)
      return
    }
  }

  reply.redirect('/me')
}

async function link (this: FastifyInstance, request: FastifyRequest<RequestProps>, reply: Reply) {
  if (reply.context.config.isAuthentication && request.user) {
    reply.redirect('/me')
    return
  }

  if (!reply.context.config.isAuthentication && !request.user) {
    reply.redirect(`${AUTH_URL}?redirect=/api${request.url}`)
    reply.send()
    return
  }

  if (reply.context.config.locked && !request.user?.badges?.staff) {
    reply.send('There are things that aren\'t meant to be accessed. This is one. Go away.')
    return
  }

  if (request.query.error) {
    reply.redirect('/')
    return
  }

  const redirectUri = `${config.domain}/api${request.routerPath}`

  if (request.query.code) {
    const tokens = await fetchTokens(
      reply.context.config.tokenUrl,
      reply.context.config.clientId,
      reply.context.config.clientSecret,
      redirectUri,
      'authorization_code',
      request.query.code
    )

    if (!tokens.access_token) {
      reply.redirect(reply.context.config.isAuthentication ? '/' : '/me')
      return
    }

    const user = await fetch(reply.context.config.selfUrl, { headers: { authorization: `Bearer ${tokens.access_token}` } }).then<any>((r) => r.json())

    if (reply.context.config.isAuthentication) {
      return finishAuthentication(this, reply, tokens, user, request.cookies.redirect)
    }

    if (!user.login && !user.display_name) {
      reply.redirect('/me')
      return
    }

    const account: Record<string, unknown> = {
      name: user.login || user.display_name,
      accessToken: tokens.access_token,
    }

    if (tokens.refresh_token) account.refreshToken = tokens.refresh_token
    if (tokens.expires_in) account.expiryDate = Date.now() + (tokens.expires_in * 1000)
    await this.mongo.db!.collection<User>('users').updateOne(
      { _id: request.user!._id },
      { $set: { updatedAt: new Date(), [`accounts.${reply.context.config.platform}`]: account } }
    )

    reply.redirect('/me')
    return
  }

  if (reply.context.config.isAuthentication) {
    if (request.query.redirect) {
      reply.setCookie('redirect', request.query.redirect, {
        signed: true,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600,
      })
    } else {
      reply.setCookie('redirect', '', { maxAge: 0, path: '/' })
    }
  }

  const params = new URLSearchParams()
  params.set('response_type', 'code')
  params.set('redirect_uri', redirectUri)
  params.set('client_id', reply.context.config.clientId)
  params.set('scope', reply.context.config.scopes.join(' '))
  reply.redirect(`${reply.context.config.authorizeUrl}?${params.toString()}`)
}

async function unlink (this: FastifyInstance, request: FastifyRequest<RequestProps>, reply: Reply) {
  if (!request.user) {
    reply.redirect(`${AUTH_URL}?redirect=/api${request.url}`)
    reply.send()
    return
  }

  if (reply.context.config.locked && !request.user?.badges?.staff) {
    reply.send('There are things that aren\'t meant to be accessed. This is one. Go away.')
    return
  }

  if (reply.context.config.isAuthentication) {
    // todo: check if users is allowed to delete account
    await deleteUser(this.mongo.client, request.user._id, UserDeletionCause.REQUESTED)
    reply.setCookie('token', '', { maxAge: 0, path: '/' }).redirect('/')
    return
  }

  await this.mongo.db!.collection<User>('users').updateOne(
    { _id: request.user!._id },
    { $set: { updatedAt: new Date() }, $unset: { [`accounts.${reply.context.config.platform}`]: 1 } }
  )

  reply.redirect('/me')
}

/** @deprecated */
export default async function oauthPlugin (fastify: FastifyInstance, { data }: { data: OAuthSettings }) {
  fastify.addHook('preHandler', fastify.auth([ fastify.verifyTokenizeToken, (_, __, next) => next() ]))

  fastify.get('/', { config: data }, link)
  fastify.get('/unlink', { config: data }, unlink)
}

export type OAuthKeys = {
  tokenType: string
  accessToken: string
  // Refresh tokens during refreshes MAY be present, but this is not a requirement.
  refreshToken?: string
  expiresIn: number
  scopes: string[]
}

export const OAuthEndpoints = <const> {
  discord: {
    AUTHORIZE_URL: 'https://discord.com/oauth2/authorize',
    TOKEN_URL: 'https://discord.com/api/v9/oauth2/token',
  },
  spotify: {
    AUTHORIZE_URL: 'https://accounts.spotify.com/authorize',
    TOKEN_URL: 'https://accounts.spotify.com/api/token',
  },
  github: {
    AUTHORIZE_URL: 'https://github.com/login/oauth/authorize',
    TOKEN_URL: 'https://github.com/login/oauth/access_token',
  },
  patreon: {
    AUTHORIZE_URL: 'https://patreon.com/oauth2/authorize',
    TOKEN_URL: 'https://patreon.com/api/oauth2/token',
  },
}

type OAuthProvider = keyof typeof OAuthEndpoints

async function fetchToken (url: string, params: URLSearchParams): Promise<OAuthTokens> {
  return <OAuthTokens>
    await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }).then((r) => r.json())
}

export function getAuthorizationUrl (provider: OAuthProvider, redirect: string, scopes: string[], state: string): string {
  const params = new URLSearchParams()
  params.set('state', state)
  params.set('response_type', 'code')
  params.set('redirect_uri', redirect)
  params.set('client_id', config[provider].clientID)
  params.set('scope', scopes.join(' '))
  return `${OAuthEndpoints[provider].AUTHORIZE_URL}?${params.toString()}`
}

export async function getAuthTokens (provider: OAuthProvider, redirect: string, code: string): Promise<OAuthTokens> {
  const body = new URLSearchParams()
  body.set('grant_type', 'authorization_code')
  body.set('client_id', config[provider].clientID)
  body.set('client_secret', config[provider].clientSecret)
  body.set('redirect_uri', redirect)
  body.set('code', code)

  return fetchToken(OAuthEndpoints[provider].TOKEN_URL, body)
}

export async function refreshAuthTokens (provider: OAuthProvider, refresh: string): Promise<OAuthTokens> {
  const body = new URLSearchParams()
  body.set('grant_type', 'refresh_token')
  body.set('client_id', config[provider].clientID)
  body.set('client_secret', config[provider].clientSecret)
  body.set('refresh_token', refresh)

  return fetchToken(OAuthEndpoints[provider].TOKEN_URL, body)
}
