/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import backofficeModule from './backoffice/index.js'
import storeModule from './store/index.js'
import usersModule from './users.js'
import avatarsModule from './avatars.js'
import badgesModule from './badges.js'
import statsModule from './stats.js'
import docsModule from './docs/index.js'
import oauthModule from './oauth.js'

function logout (_: FastifyRequest, reply: FastifyReply): void {
  reply.setCookie('token', '', { maxAge: 0, path: '/' }).redirect('/')
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/login', (req: FastifyRequest, reply: FastifyReply) => void reply.redirect(`/api/v3/oauth/discord?${req.url.split('?')[1] ?? ''}`))
  fastify.get('/logout', { config: { auth: {} } }, logout)

  fastify.register(backofficeModule, { prefix: '/backoffice' })
  fastify.register(storeModule, { prefix: '/store' })
  fastify.register(usersModule, { prefix: '/users' })
  fastify.register(avatarsModule, { prefix: '/avatars' })
  fastify.register(badgesModule, { prefix: '/badges' })
  fastify.register(statsModule, { prefix: '/stats' })
  fastify.register(docsModule, { prefix: '/docs' })
  fastify.register(oauthModule, { prefix: '/oauth' })
}
