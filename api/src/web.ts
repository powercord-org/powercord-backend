/*
 * Copyright (c) 2018-2021 aetheryx & Cynthia K. Rey
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
import type { User } from './types'
import { URL } from 'url'
import { readFile } from 'fs/promises'
import { randomBytes } from 'crypto'
import { createElement as h } from 'react'
import { Helmet } from 'react-helmet'
import { StaticRouter } from 'react-router'
import ReactDomServer from 'react-dom/server.js'
import { formatUser } from './utils/users.js'

async function loadJson (file: string): Promise<Record<string, string>> {
  const url = new URL(file, import.meta.url)
  const blob = await readFile(url, 'utf8')
  return JSON.parse(blob)
}

let App = { default: { default: () => null } }
let manifest: Record<string, string> = {}
let integrity: Record<string, string> = {}
const robots = `User-agent: nsa\nDisallow: /`

function renderResource (file: string): string {
  let html = ''
  if (!manifest[file]) return html

  if (file.endsWith('css')) {
    html += `<link rel='stylesheet' href='${manifest[file]}'`
  } else {
    html += `<script src='${manifest[file]}'`
  }

  if (!process.argv.includes('-d') && integrity[file]) {
    html += ` integrity='${integrity[file]}' crossorigin='anonymous'`
  }

  if (file.endsWith('css')) {
    html += '/>'
  } else {
    html += '></script>'
  }

  return html
}

function renderHtml (request: FastifyRequest<{ TokenizeUser: User }>, reply: FastifyReply) {
  const user = request.user ? formatUser(request.user, true) : null

  if (process.env.NODE_ENV !== 'production') {
    reply.type('text/html').send(`
      <!DOCTYPE html>
      <html lang="en">
        <head></head>
        <body>
          <div id='react-root'></div>
          <script>window.USER = ${JSON.stringify(user).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</script>
          <script src='/dist/main.js'></script>
          <script src='/dist/styles.chk.js'></script>
        </body>
      </html>
    `)
    return
  }

  const context: Record<string, string> = {}
  const nonce = randomBytes(16).toString('hex')
  // todo: move this to a component
  const rendered = ReactDomServer.renderToString(h(StaticRouter, { location: request.raw.url, context }, h(App.default.default)))
  if ('url' in context) {
    reply.redirect(context.url)
    return
  }

  const helmet = Helmet.renderStatic()
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        ${helmet ? helmet.title.toString() : ''}
        ${helmet ? helmet.meta.toString() : ''}
        ${helmet ? helmet.link.toString() : ''}
        ${renderResource('styles.css')}
      </head>
      <body ${helmet ? helmet.bodyAttributes.toString() : ''}>
        <noscript>
          <div class='no-js'>JavaScript is required for this website to work as intended. Please enable it in your browser settings.</div>
        </noscript>
        <div id='react-root'>${rendered}</div>
        <script id='init' nonce='${nonce}'>window.USER = ${JSON.stringify(user).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</script>
        ${renderResource('main.js')}
        ${renderResource('styles.js')}
      </body>
    </html>
  `

  reply.type('text/html')
    .header('x-frame-options', 'DENY')
    .header('content-security-policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src 'self' https://cdn.discordapp.com https://discord.com http://127.0.0.1:6462; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;`)
    .send(html.split('\n').map(l => l.trim()).join(''))
}

export default async function (fastify: FastifyInstance): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    // @ts-expect-error -- File is production-only
    App = await import('./web/App.cjs')
    manifest = await loadJson('manifest.webpack.json')
    integrity = await loadJson('integrity.webpack.json')
  }

  fastify.get('/robots.txt', (_: FastifyRequest, reply: FastifyReply) => void reply.type('text/plain').send(robots))
  fastify.get<{ TokenizeUser: User }>('*', { preHandler: fastify.auth([ fastify.verifyTokenizeToken, (_, __, next) => next() ]) }, renderHtml)
}
