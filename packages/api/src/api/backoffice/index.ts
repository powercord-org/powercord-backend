/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { FastifyInstance } from 'fastify'
import usersModule from './users.js'
import formsModule from './forms.js'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.register(usersModule, { prefix: '/users' })
  // abuse monitoring

  // store frontpage
  fastify.register(formsModule, { prefix: '/forms' })
  // store reports

  // super secret event
}
