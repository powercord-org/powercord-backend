/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyRequest, FastifyReply } from 'fastify'
import fastifyFactory from 'fastify'
import fastifyCookie from 'fastify-cookie'
import fastifyRawBody from 'fastify-raw-body'
import fastifyMongodb from 'fastify-mongodb'
import config from '@powercord/shared/config'

import schemaLoader from './schemas/loader.js'
import authPlugin from './utils/auth.js'

import apiModule from './api/index.js'

const fastify = fastifyFactory({ logger: { level: process.env.NODE_ENV === 'development' ? 'info' : 'warn' } })

fastify.register(fastifyCookie)
fastify.register(fastifyRawBody, { global: false }) // todo: necessary?
fastify.register(fastifyMongodb, { url: `${config.mango}?appName=Powercord%20API` })

fastify.decorateRequest('jwtPayload', null)
fastify.decorateRequest('user', null)
fastify.register(authPlugin)
fastify.register(schemaLoader)

fastify.register(apiModule)
fastify.setNotFoundHandler((_: FastifyRequest, reply: FastifyReply) => void reply.code(404).send({ error: 404, message: 'Not Found' }))

fastify.ready()
  .then(
    () => fastify.listen(config.port, config.bind),
    (e) => {
      fastify.log.error(e)
      process.exit(1)
    }
  )
