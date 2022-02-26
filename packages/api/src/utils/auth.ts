/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

// Authentication is done via JWTs
// - Web auth: tokens valid for 1 day, full access
// - Client auth: tokens indefinitely valid, unless reset

import type { FastifyInstance, FastifyReply } from 'fastify'
import type { User } from '@powercord/types/users'
import { createHash } from 'crypto'
import config from '@powercord/shared/config'
import { UserFlags } from '@powercord/shared/flags'
import { createSigner, createVerifier } from 'fast-jwt'

export type JWTPayload = { id: string }

export enum TokenType { WEB, CLIENT }

const KEY = createHash('sha512').update(config.secret).digest()

const Verifiers = {
  web: createVerifier({
    key: KEY,
    algorithms: [ 'HS512' ],
    allowedAud: 'powercord:web',
    allowedIss: 'powercord:api:v3'
  }),
  client: createVerifier({
    key: KEY,
    algorithms: [ 'HS512' ],
    allowedAud: [ 'powercord:web', 'powercord:client' ],
    allowedIss: 'powercord:api:v3'
  }),
}

function generateToken (this: FastifyReply, payload: JWTPayload, type: TokenType) {
  const signer = createSigner({
    key: KEY,
    algorithm: 'HS512',
    iss: 'powercord:api:v3',
    aud: type === TokenType.WEB ? 'powercord:web' : 'powercord:client',
    expiresIn: type === TokenType.WEB ? 24 * 3600e3 : void 0
  })

  return signer(payload)
}

export default async function authPlugin (fastify: FastifyInstance) {
  fastify.decorateReply('generateToken', generateToken)
  fastify.addHook('onRequest', async function (request, reply) {
    request.jwtPayload = null
    request.user = null

    if (!reply.context.config.auth) return
    const { optional, permissions, allowClient } = reply.context.config.auth

    // Check cookies (web) and authorization (client)
    const token = request.cookies.token || request.headers.authorization
    if (!token) {
      if (!optional) {
        reply.code(401)
        throw new Error('Unauthorized')
      }

      return
    }

    try {
      request.jwtPayload = allowClient
        ? Verifiers.client(token)
        : Verifiers.web(token)
    } catch {
      if (!optional) {
        reply.code(401)
        throw new Error('Unauthorized')
      }

      return
    }

    request.user = await this.mongo.db!.collection<User>('users').findOne({
      _id: request.jwtPayload!.id,
      flags: { $bitsAllClear: UserFlags.GHOST | UserFlags.BANNED }
    })

    if (!request.user) {
      if (!optional) {
        reply.code(401)
        throw new Error('Unauthorized')
      }

      return
    }

    console.log(permissions, request.user!.flags)
    if (permissions && (request.user!.flags & permissions) === 0) {
      reply.code(403)
      throw new Error('Insufficient permission')
    }

    // todo: update user data if necessary - refreshUserData
  })
}

// Mark as root-level plugin
// @ts-ignore -- TS isn't happy about that one
authPlugin[Symbol.for('skip-override')] = true
