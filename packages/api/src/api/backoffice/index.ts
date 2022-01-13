/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance } from 'fastify'
import usersModule from './users.js'
import userbansModule from './userbans.js'
import formsModule from './forms.js'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', fastify.auth([ fastify.verifyTokenizeToken, fastify.verifyAdmin ], { relation: 'and' }))

  fastify.register(usersModule, { prefix: '/users' })
  fastify.register(userbansModule, { prefix: '/bans' })
  // abuse monitoring

  // store frontpage
  fastify.register(formsModule, { prefix: '/forms' })
  // store reports

  // super secret event
}
