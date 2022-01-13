/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { RouteHandler } from 'fastify'

declare module 'fastify' {
  export interface FastifyInstance {
    verifyAdmin: RouteHandler
  }
}
