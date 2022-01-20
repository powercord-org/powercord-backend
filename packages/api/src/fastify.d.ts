/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { RouteHandler } from 'fastify'

declare module 'fastify' {
  export interface FastifyInstance {
    verifyAdmin: RouteHandler
  }

  export type ConfiguredReply<TFReply extends FastifyReply, TConfig> =
    TFReply extends FastifyReply<infer TServer, infer TRequest, infer TReply, infer TGeneric>
      ? FastifyReply<TServer, TRequest, TReply, TGeneric, TConfig>
      : never
}
