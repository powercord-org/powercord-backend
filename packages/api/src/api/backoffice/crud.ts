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

// todo: make safe enough and modular enough for usage in public routes

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { ConfiguredReply } from '../../types.js'

type CrudModule = boolean | {}

type CrudSettings = {
  collection: string
  projection: { [key: string]: 0 | 1 }
  modules?: {
    create?: CrudModule
    readAll?: CrudModule
    read?: CrudModule
    update?: CrudModule
    delete?: CrudModule
  }
}

type Reply = ConfiguredReply<FastifyReply, CrudSettings>

type ReadQuery = { limit?: number, page?: number }

type RouteParams = { id: string }

const readQuerySchema = {
  limit: { type: 'integer', exclusiveMinimum: 0, maximum: 100 },
  page: { type: 'integer', exclusiveMinimum: 0 },
}

async function readAll (this: FastifyInstance, request: FastifyRequest<{ Querystring: ReadQuery }>, reply: Reply): Promise<unknown> {
  const data = reply.context.config
  const limit = request.query.limit ?? 50
  const cursor = ((request.query.page ?? 1) - 1) * limit
  const collection = this.mongo.db!.collection(data.collection)

  const res = await collection.find({}, { projection: data.projection }).limit(limit).skip(cursor).toArray()
  return res
}

// @ts-expect-error -- not implemented
async function create (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: Reply): Promise<unknown> {
  const data = reply.context.config
  console.log(data)
  return {}
}

async function read (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: Reply): Promise<unknown> {
  const data = reply.context.config
  const collection = this.mongo.db!.collection(data.collection)
  const res = await collection.findOne({ _id: request.params.id }, { projection: data.projection })

  if (!res) return reply.callNotFound()
  return res
}

// @ts-expect-error -- not implemented
async function update (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: Reply): Promise<unknown> {
  const data = reply.context.config
  console.log(data)
  return {}
}

async function del (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: Reply): Promise<unknown> {
  const data = reply.context.config
  const collection = this.mongo.db!.collection(data.collection)
  const res = await collection.deleteOne({ _id: request.params.id })

  if (res.deletedCount !== 1) return reply.callNotFound()
  return reply.code(204).send()
}

export default async function crudPlugin (fastify: FastifyInstance, { data }: { data: CrudSettings }): Promise<void> {
  if (data.modules?.readAll !== false) {
    fastify.get('/', { config: data, schema: { querystring: readQuerySchema } }, readAll)
  }

  if (data.modules?.create !== false) {
    fastify.post('/', { config: data }, create)
  }

  if (data.modules?.read !== false) {
    fastify.get('/:id', { config: data }, read)
  }

  if (data.modules?.update !== false) {
    fastify.patch('/:id', { config: data }, update)
  }

  if (data.modules?.delete !== false) {
    fastify.delete('/:id', { config: data }, del)
  }
}
