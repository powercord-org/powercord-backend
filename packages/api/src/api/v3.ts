/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import backofficeModule from './backoffice/index.js'
import storeModule from './store/index.js'
import usersModule from './users.js'
import guildsModule from './guilds.js'
import statsModule from './stats.js'
import docsModule from './docs/index.js'
import oauthModule from './oauth.js'
import miscModule from './misc.js'

function logout (_: FastifyRequest, reply: FastifyReply): void {
  reply.setCookie('token', '', { maxAge: 0, path: '/' }).redirect('/')
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/login', (req: FastifyRequest, reply: FastifyReply) => void reply.redirect(`/api/v3/oauth/discord?${req.url.split('?')[1] ?? ''}`))
  fastify.get('/logout', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, logout)

  fastify.register(backofficeModule, { prefix: '/backoffice' })
  fastify.register(storeModule, { prefix: '/store' })
  fastify.register(usersModule, { prefix: '/users' })
  fastify.register(guildsModule, { prefix: '/guilds' })
  fastify.register(statsModule, { prefix: '/stats' })
  fastify.register(docsModule, { prefix: '/docs' })
  fastify.register(oauthModule, { prefix: '/oauth' })
  fastify.register(miscModule)
  fastify.setNotFoundHandler((_: FastifyRequest, reply: FastifyReply) => void reply.code(404).send({ error: 404, message: 'Not Found' }))
}
