/*
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import backofficeModule from './backoffice/index.js'
import advisoriesModule from './advisories.js'
import storeModule from './store/index.js'
import usersModule from './users.js'
import guildsModule from './guilds.js'
import statsModule from './stats.js'
import docsModule from './docs/index.js'
import honksModule from './honks.js'
import oauthModule from './oauth.js'
import miscModule from './misc.js'
import legacyLinkingModule from './legacyLinking.js'

function logout (_: FastifyRequest, reply: FastifyReply): void {
  reply.setCookie('token', '', { maxAge: 0, path: '/' }).redirect('/')
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/login', (_: FastifyRequest, reply: FastifyReply) => void reply.redirect('/api/v2/oauth/discord'))
  fastify.get('/logout', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, logout)
  fastify.register(backofficeModule, { prefix: '/backoffice' })
  fastify.register(advisoriesModule, { prefix: '/advisories' })
  fastify.register(storeModule, { prefix: '/store' })
  fastify.register(usersModule, { prefix: '/users' })
  fastify.register(guildsModule, { prefix: '/guilds' })
  fastify.register(statsModule, { prefix: '/stats' })
  fastify.register(docsModule, { prefix: '/docs' })
  fastify.register(honksModule, { prefix: '/honks' })
  fastify.register(oauthModule, { prefix: '/oauth' })
  fastify.register(miscModule)
  fastify.register(legacyLinkingModule) // todo: remove (v3)
  fastify.setNotFoundHandler((_: FastifyRequest, reply: FastifyReply) => void reply.code(404).send({ error: 404, message: 'Not Found' }))
}
