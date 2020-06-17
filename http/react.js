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
// noinspection JSFileReferences
const manifest = require('./dist/manifest.json')

// noinspection HtmlRequiredLangAttribute,HtmlRequiredTitleElement
const renderHtml = (helmet, html) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      ${helmet ? helmet.title.toString() : ''}
      ${helmet ? helmet.meta.toString() : ''}
      ${helmet ? helmet.link.toString() : ''}
      ${manifest['styles.css'] ? `<link rel='stylesheet' href='${manifest['styles.css']}'/>` : ''}
    </head>
    <body ${helmet ? helmet.bodyAttributes.toString() : ''}>
      <noscript>
        <div class='no-js'>JavaScript is required for this website to work as intended. Please enable it in your browser settings.</div>
      </noscript>
      <div id='react-root'>${html || ''}</div>
      <div id='tooltip-container'></div>
      <script>window.GLOBAL_ENV = { PRODUCTION: ${process.argv.includes('-p')} }</script>
      <script src='${manifest['main.js']}'></script>
      ${manifest['styles.js'] ? `<script src='${manifest['styles.js']}'></script>` : ''}
    </body>
  </html>
`

module.exports = (request, reply) => {
  // Just return empty html while developing
  if (process.argv.includes('-d')) {
    reply.type('text/html')
    reply.send(renderHtml())
    return
  }

  // SSR
  const context = {}
  // noinspection JSFileReferences
  const App = require('./dist/App').default
  const rendered = React.createElement(
    StaticRouter, { location: request.req.url, context }, React.createElement(App, { server: true })
  )

  if (context.url) {
    // Redirect
    reply.redirect(context.url)
  } else {
    // Send
    const html = ReactDOMServer.renderToString(rendered)
    reply.type('text/html')
    reply.send(renderHtml(Helmet.renderStatic(), html))
  }
}
