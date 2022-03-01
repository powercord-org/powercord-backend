/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { FastifyInstance } from 'fastify'
import { user, userBasic, userUpdate, userSpotify } from './user.js'

export default async function loadSchemas (fastify: FastifyInstance) {
  // User schemas
  fastify.addSchema(user)
  fastify.addSchema(userBasic)
  fastify.addSchema(userUpdate)
  fastify.addSchema(userSpotify)
}

// Mark as root-level plugin
// @ts-ignore -- TS isn't happy about that one
loadSchemas[Symbol.for('skip-override')] = true
