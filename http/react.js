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

const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { Helmet } = require('react-helmet')
const { StaticRouter } = require('react-router')
const { formatUser } = require('./utils/users')
// noinspection JSFileReferences
const manifest = require('./manifest.webpack.json')
const UserContext = require('../src/components/UserContext')

// noinspection HtmlRequiredLangAttribute,HtmlRequiredTitleElement
function renderHtml (helmet, html, user = null) {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        ${helmet ? helmet.title.toString() : ''}
        ${helmet ? helmet.meta.toString() : ''}
        ${helmet ? helmet.link.toString() : ''}
        ${manifest['styles.css'] ? `<link rel='stylesheet' href='${manifest['styles.css']}'/>` : ''}
        ${manifest['app.js'] ? `<link rel='preload' as='script' href='${manifest['app.js']}'/>` : ''}
      </head>
      <body ${helmet ? helmet.bodyAttributes.toString() : ''}>
        <noscript>
          <div class='no-js'>JavaScript is required for this website to work as intended. Please enable it in your browser settings.</div>
        </noscript>
        <div id='react-root'>${html || ''}</div>
        <script id='init'>window.USER = ${JSON.stringify(user).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</script>
        <script src='${manifest['main.js']}'></script>
        <script src='${manifest['styles.js']}'></script>
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
  const user = request.user ? formatUser(request.user, true) : null
  // Just return empty html while developing
  if (process.argv.includes('-d')) {
    return reply.type('text/html').send(renderHtml(null, null, user))
  }

  // SSR
  const context = {}
  const rendered = renderReact(request, context)
  if (context.url) {
    return reply.redirect(context.url)
  }
  const html = ReactDOMServer.renderToString(rendered)
  reply.type('text/html').send(renderHtml(Helmet.renderStatic(), html, user))
}
