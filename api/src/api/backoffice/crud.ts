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

// todo: make safe enough and modular enough for usage in public routes

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { ConfiguredReply } from '../../types.js'

interface CrudSettings {
  collection: string
  projection: { [key: string]: 0 | 1 }
}

type Reply = ConfiguredReply<FastifyReply, CrudSettings>

type ReadQuery = { limit?: number, page?: number }

async function read (this: FastifyInstance, request: FastifyRequest<{ Querystring: ReadQuery }>, reply: Reply): Promise<unknown> {
  const data = reply.context.config
  const collection = this.mongo.db!.collection(data.collection)
  const limit = request.query.limit ?? 50 // todo: schema
  const cursor = ((request.query.page ?? 1) - 1) * limit

  const res = await collection.find({}, { projection: data.projection }).limit(limit).skip(cursor).toArray()
  return res
}

// @ts-expect-error -- not implemented
async function create (this: FastifyInstance, request: FastifyRequest, reply: Reply): Promise<unknown> {
  const data = reply.context.config
  console.log(data)
  return {}
}

// @ts-expect-error -- not implemented
async function update (this: FastifyInstance, request: FastifyRequest, reply: Reply): Promise<unknown> {
  const data = reply.context.config
  console.log(data)
  return {}
}

// @ts-expect-error -- not implemented
async function del (this: FastifyInstance, request: FastifyRequest, reply: Reply): Promise<unknown> {
  const data = reply.context.config
  console.log(data)
  return {}
}

export default async function (fastify: FastifyInstance, { data }: { data: CrudSettings }): Promise<void> {
  fastify.get('/', { config: data }, read)
  fastify.post('/', { config: data }, create)
  fastify.patch('/:id', { config: data }, update)
  fastify.delete('/:id', { config: data }, del)
}
