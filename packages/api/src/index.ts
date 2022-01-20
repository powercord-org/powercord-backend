/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyRequest, FastifyReply } from 'fastify'
import type { User } from '@powercord/types/users'
import fastifyFactory from 'fastify'
import fastifyAuth from 'fastify-auth'
import fastifyCookie from 'fastify-cookie'
import fastifyRawBody from 'fastify-raw-body'
import fastifyMongodb from 'fastify-mongodb'
import fastifyTokenize from 'fastify-tokenize'
import config from '@powercord/shared/config'

import apiModule from './api/index.js'
import { refreshUserData } from './api/oauth.js'

const fastify = fastifyFactory({ logger: { level: process.env.NODE_ENV === 'development' ? 'info' : 'warn' } })

function verifyAdmin (request: FastifyRequest<{ TokenizeUser: User }>, reply: FastifyReply, next: (e?: Error) => void) {
  if (request.user?.badges?.staff) return next()

  reply.code(403)
  next(new Error('Missing permissions'))
}

fastify.decorate('verifyAdmin', verifyAdmin)
fastify.register(fastifyAuth)
fastify.register(fastifyCookie)
fastify.register(fastifyRawBody, { global: false })
fastify.register(fastifyMongodb, { url: `${config.mango}?appName=Powercord%20API` })
fastify.register(fastifyTokenize, {
  secret: config.secret,
  fastifyAuth: true,
  cookieSigned: true,
  fetchAccount: async (id: string) => {
    const user = await fastify.mongo.db!.collection<User>('users').findOne({ _id: id })
    const updatedUser = user ? await refreshUserData(fastify, user) : null
    if (updatedUser) (updatedUser as any).lastTokenReset = 0
    return updatedUser
  },
})

fastify.register(apiModule)

fastify.ready()
  .then(
    () => fastify.listen(config.port, config.bind),
    (e) => {
      fastify.log.error(e)
      process.exit(1)
    }
  )
