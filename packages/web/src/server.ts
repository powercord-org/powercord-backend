/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from 'http'
import { join } from 'path'
import { readFileSync } from 'fs'
import { createServer } from 'http'
import { render } from 'preact-render-to-string'
import { toStatic } from 'hoofd/preact'
import { h, Fragment } from 'preact'

import App from './components/App'

const template = readFileSync(join(__dirname, 'index.html'), 'utf8')

function handler (req: IncomingMessage, res: ServerResponse) {
  res.setHeader('content-type', 'text/html')
  if (req.method?.toLowerCase() !== 'get') {
    res.writeHead(405, 'method not allowed')
    res.end()
    return
  }

  // Security headers
  // Note: HSTS is assumed setup by Cloudflare
  res.setHeader('content-security-policy', 'default-src \'self\'; img-src \'self\' https://cdn.discordapp.com;')
  res.setHeader('permissions-policy', 'interest-cohort=()')
  res.setHeader('x-frame-options', 'DENY')

  const ctx: Record<string, any> = {}
  const body = render(h(App, { url: req.url ?? '/', ctx: ctx }))
  const helmet = toStatic()
  const head = render(h(
    Fragment,
    null,
    h('title', null, helmet.title),
    helmet.metas.map((m) => h('meta', m)),
    helmet.links.map((l) => h('link', l))
  ))

  if (ctx.notFound) res.writeHead(404, 'Not Found')
  res.write(template.replace('<!--ssr-head-->', head).replace('<!--ssr-body-->', body), () => res.end())
}

createServer(handler).listen(process.env.PORT ?? 8000)
