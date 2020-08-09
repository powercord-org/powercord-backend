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

const html = (jwt) => `
<!doctype html>
<html>
<head>
  <meta charset='utf-8'/>
  <title>Powercord Account Linking</title>
</head>
<body>
<p>Linking...</p>
<img src='http://localhost:6462/wallpaper.png?jsonweebtoken=${jwt}' style='display: none;' alt='loading'/>
<script>setTimeout(() => document.querySelector('p').innerText = 'You can close this page',1e3)</script>
</body>
</html>
`

function legacy (request, reply) {
  if (!request.user) {
    return reply.redirect('/api/v2/oauth/discord?redirect=/api/v2/users/@me/link/legacy')
  }
  reply.type('text/html').send(html(reply.unsignCookie(request.cookies.token)))
}

module.exports = async function (fastify) {
  fastify.get('/users/@me/link/legacy', { preHandler: fastify.auth([ fastify.verifyTokenizeToken, (_, __, next) => next() ]) }, legacy)
}
