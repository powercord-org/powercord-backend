/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance } from 'fastify'
import v2Module from './v2.js'
import v3Module from './v3.js'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.register(v2Module, { prefix: '/v2' })
  fastify.register(v3Module, { prefix: '/v3' })
  fastify.register(v2Module, { prefix: '/' })
}
