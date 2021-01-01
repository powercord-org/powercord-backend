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

// todo: rewrite in ts & esm, account for dev env in a better way
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { Helmet } = require('react-helmet')
const { StaticRouter } = require('react-router')
const { randomBytes } = require('crypto')
const { formatUser } = require('./utils/users')
const manifest = require('./manifest.webpack.json')
const UserContext = require('../src/components/UserContext')

let integrity
try { integrity = require('./integrity.webpack.json') } catch (e) { integrity = {} }

function renderResource (file) {
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

function renderHtml (helmet, html, user, nonce) {
  return `<!DOCTYPE html>
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
        <div id='react-root'>${html || ''}</div>
        <script id='init' nonce='${nonce}'>window.USER = ${JSON.stringify(user).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</script>
        ${renderResource('main.js')}
        ${renderResource('styles.js')}
      </body>
    </html>
  `.split('\n').map(l => l.trim()).join('')
}

function renderReact (request, context) {
  const e = React.createElement
  // noinspection JSFileReferences
  const App = require('./dist/App').default
  return e(StaticRouter, { location: request.raw.url, context },
    e(UserContext.Provider, request.user, e(App))
  )
}

module.exports = (request, reply) => {
  const nonce = randomBytes(16).toString('hex')
  const user = request.user ? formatUser(request.user, true) : null
  // Just return empty html while developing
  if (process.argv.includes('-d')) {
    return reply.type('text/html').send(renderHtml(null, null, user, nonce))
  }

  // Security headers
  reply.header('content-security-policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src 'self' https://cdn.discordapp.com https://discord.com http://127.0.0.1:6462; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;`)
  reply.header('x-frame-options', 'DENY')

  // SSR
  const context = {}
  const rendered = renderReact(request, context)
  if (context.url) {
    return reply.redirect(context.url)
  }
  const html = ReactDOMServer.renderToString(rendered)
  reply.type('text/html').send(renderHtml(Helmet.renderStatic(), html, user, nonce))
}
