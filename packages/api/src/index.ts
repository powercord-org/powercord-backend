/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyRequest, FastifyReply } from 'fastify'
import type { DatabaseUser, User } from '@powercord/types/users'
import fastifyFactory from 'fastify'
import fastifyAuth from 'fastify-auth'
import fastifyCookie from 'fastify-cookie'
import fastifyRawBody from 'fastify-raw-body'
import fastifyMongodb from 'fastify-mongodb'
import fastifyTokenize from 'fastify-tokenize'
import { UserFlags } from '@powercord/shared/flags'
import config from '@powercord/shared/config'

import schemaLoader from './schemas/loader.js'

import apiModule from './api/index.js'
import { refreshUserData } from './api/oauth.js'
import { isGhostUser } from './data/user.js'

const fastify = fastifyFactory({ logger: { level: process.env.NODE_ENV === 'development' ? 'info' : 'warn' } })

// todo: ditch as part of the new token stuff
function verifyAdmin (request: FastifyRequest<{ TokenizeUser: User }>, reply: FastifyReply, next: (e?: Error) => void) {
  if ((request.user?.flags ?? 0) & UserFlags.ADMIN) return next()

  reply.code(403)
  next(new Error('Missing permissions'))
}

fastify.decorate('verifyAdmin', verifyAdmin)
fastify.register(schemaLoader)
fastify.register(fastifyAuth)
fastify.register(fastifyCookie)
fastify.register(fastifyRawBody, { global: false })
fastify.register(fastifyMongodb, { url: `${config.mango}?appName=Powercord%20API` })
fastify.register(fastifyTokenize, {
  secret: config.secret,
  fastifyAuth: true,
  cookieSigned: true,
  fetchAccount: async (id: string) => {
    const user = await fastify.mongo.db!.collection<DatabaseUser>('users').findOne({ _id: id })
    if (!user || isGhostUser(user)) return null

    const updatedUser = await refreshUserData(fastify, user)
    ;(updatedUser as any).lastTokenReset = 0
    return updatedUser
  },
})

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
