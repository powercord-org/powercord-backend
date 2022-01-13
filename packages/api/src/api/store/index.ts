/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { fetchSuggestions } from './suggestions.js'

import formModule from './forms.js'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/suggestions', (_request: FastifyRequest, reply: FastifyReply) => {
    reply.header('cache-control', 'public, max-age=86400')
    fetchSuggestions()
  })

  fastify.register(formModule, { prefix: '/forms' })
}
