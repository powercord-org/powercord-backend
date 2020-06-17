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

const fastify = require('fastify')({ logger: true })
const { createReadStream } = require('fs')
const { join } = require('path')

const config = require('../config.json')

fastify.register(require('fastify-mongodb'), { url: 'mongodb://localhost:27017' })

// API
fastify.register(require('./api/v2'), { prefix: '/api/v2' })

// REP & React
fastify.get('/robots.txt', (_, reply) => reply.type('text/plain') | reply.send(createReadStream(join(__dirname, 'robots.txt'))))
fastify.get('*', require('./react'))

fastify.ready()
  .then(() => fastify.listen(config.port))
  .then(addr => fastify.log.info(`server listening on ${addr}`))
  .catch(e => fastify.log.error(e) | process.exit(1))
