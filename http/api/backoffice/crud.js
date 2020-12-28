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

async function read (request, reply) {
  const data = reply.context.config
  const collection = this.mongo.db.collection(data.collection)
  const limit = request.query.limit ?? 50
  const cursor = ((request.query.page ?? 1) - 1) * limit

  const res = await collection.find({}, { projection: data.projection }).limit(limit).skip(cursor).toArray()
  return res
}

function create (request, reply) {
  const data = reply.context.config
  console.log(data)
  return {}
}

function update (request, reply) {
  const data = reply.context.config
  console.log(data)
  return {}
}

function del (request, reply) {
  const data = reply.context.config
  console.log(data)
  return {}
}

module.exports = async function (fastify, { data }) {
  fastify.get('/', { config: data }, read)
  fastify.create('/', { config: data }, create)
  fastify.patch('/:id', { config: data }, update)
  fastify.del('/:id', { config: data }, del)
}
