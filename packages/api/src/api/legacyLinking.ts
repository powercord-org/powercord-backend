/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

// api:v2

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { TokenType } from '../utils/auth.js'

const html = (jwt: string): string => `<!doctype html>
<html>
<head>
  <meta charset='utf-8'/>
  <title>Powercord Account Linking</title>
</head>
<body>
<p>Linking...</p>
<img src='http://127.0.0.1:6462/wallpaper.png?jsonweebtoken=${jwt}' style='display: none;' alt='loading'/>
<script>setTimeout(() => document.querySelector('p').innerText = 'You can close this page',1e3)</script>
</body>
</html>`

function legacy (request: FastifyRequest, reply: FastifyReply): void {
  if (!request.user) {
    reply.redirect('/api/v2/oauth/discord?redirect=/api/v2/users/@me/link/legacy')
    return
  }

  reply.type('text/html').send(html(reply.generateToken({ id: request.user!._id }, TokenType.CLIENT)))
}

/** @deprecated */
export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/users/@me/link/legacy', { config: { auth: { optional: true } } }, legacy)
}
