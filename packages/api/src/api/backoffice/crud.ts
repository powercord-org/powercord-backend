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
// [Cynthia] As long as routes have a strict schema, they will be safe from mongo injections

import type { Filter, Document } from 'mongodb'
import type { FastifyInstance, FastifyRequest, FastifyReply, FastifySchema } from 'fastify'
import type { ConfiguredReply } from '../../types.js'
import { ObjectId } from 'mongodb'

type CrudModule = { schema?: FastifySchema }
type CrudReadAllModule = CrudModule & { filter?: string[], all?: boolean }
type CrudUpdateModule = CrudModule & { upsert?: boolean, hasUpdatedAt?: boolean, post?: (request: FastifyRequest, reply: FastifyReply, updated: any) => any }

export type CrudSettings = {
  collection: string
  projection: { [key: string]: 0 | 1 },
  aggregation?: object[],
  idStr?: boolean
  modules?: {
    create?: boolean | CrudModule
    readAll?: boolean | CrudReadAllModule
    read?: boolean | CrudModule
    update?: boolean | CrudUpdateModule
    delete?: boolean | CrudModule
  }
}

type Reply = ConfiguredReply<FastifyReply, CrudSettings>

type ReadQuery = { limit?: number, page?: number }

type ReadAllQuery = ReadQuery & { [key: string]: unknown }

type RouteParams = { id: string }

const readQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', exclusiveMinimum: 0, maximum: 100 },
    page: { type: 'integer', exclusiveMinimum: 0 },
  },
}

const basicRouteSchemaStr = {
  type: 'object',
  properties: { id: { type: 'string', pattern: '^\\d{16,}$' } },
}

const basicRouteSchemaOid = {
  type: 'object',
  properties: { id: { type: 'string', pattern: '^[a-f0-9]{24}$' } },
}

async function readAll (this: FastifyInstance, request: FastifyRequest<{ Querystring: ReadAllQuery }>, reply: Reply) {
  const data = reply.context.config
  const limit = request.query.limit ?? 50
  const cursor = ((request.query.page ?? 1) - 1) * limit
  const collection = this.mongo.db!.collection(data.collection)

  const aggregation = data.aggregation || []
  const filters = typeof data.modules?.readAll === 'object' && data.modules.readAll.filter
  const all = typeof data.modules?.readAll === 'object' && data.modules.readAll.all === true
  let countFilter: Filter<Document> | undefined = void 0

  if (Array.isArray(filters)) {
    const query: Filter<Document> = {}
    for (const filter of filters) {
      if (request.query[filter]) {
        query[filter] = Array.isArray(request.query[filter])
          ? { $in: request.query[filter] }
          : request.query[filter]
      }
    }

    aggregation.unshift({ $match: query })
    countFilter = query
  }

  if (all) {
    const cur = collection.aggregate([
      ...aggregation,
      { $project: data.projection },
      { $set: { id: '$_id' } },
      { $unset: '_id' },
    ])

    return cur.toArray()
  }

  const cur = collection.aggregate([
    { $skip: cursor },
    { $limit: limit },
    ...aggregation,
    { $project: data.projection },
    { $set: { id: '$_id' } },
    { $unset: '_id' },
  ])

  const total = countFilter
    ? await collection.countDocuments(countFilter)
    : await collection.countDocuments()
  const res = await cur.toArray()

  return {
    data: res,
    pages: Math.ceil(total / limit),
  }
}

// @ts-expect-error -- not implemented
async function create (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: Reply) {
  const data = reply.context.config
  // const opts = typeof data.modules?.create === 'object' ? data.modules.create : {}

  console.log(data)
  return {}
}

async function read (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: Reply) {
  const data = reply.context.config
  // const opts = typeof data.modules?.read === 'object' ? data.modules.read : {}
  const id = data.idStr ? request.params.id : new ObjectId(request.params.id)

  const collection = this.mongo.db!.collection(data.collection)
  const res = await collection.aggregate([
    { $match: { _id: id } },
    ...data.aggregation || [],
    { $project: data.projection },
    { $set: { id: '$_id' } },
    { $unset: '_id' },
  ]).limit(1).next()

  if (!res) return reply.callNotFound()
  return res
}

async function update (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: Reply) {
  const data = reply.context.config
  const collection = this.mongo.db!.collection(data.collection)
  const opts = typeof data.modules?.update === 'object' ? data.modules.update : {}
  const id = data.idStr ? request.params.id : new ObjectId(request.params.id)

  const query = request.body as Record<string, unknown>
  if (opts.hasUpdatedAt) query.updatedAt = new Date()

  if (opts.post) {
    const res = await collection.findOneAndUpdate({ _id: id }, { $set: query }, {
      upsert: opts.upsert,
      returnDocument: 'after',
      projection: data.projection,
    })

    if (!res.value) return reply.callNotFound()
    const resp = await Promise.resolve(opts.post(request, reply, res.value))
    if (resp) {
      reply.code(200).send(resp)
      return
    }

    reply.code(204).send()
    return
  }

  const res = await collection.updateOne({ _id: id }, { $set: query }, { upsert: opts.upsert })
  if (res.matchedCount !== 1 && res.upsertedCount !== 1) return reply.callNotFound()
  reply.code(204).send()
}

async function del (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: Reply) {
  const data = reply.context.config
  const collection = this.mongo.db!.collection(data.collection)
  // const opts = typeof data.modules?.delete === 'object' ? data.modules.delete : {}
  const id = data.idStr ? request.params.id : new ObjectId(request.params.id)

  const res = await collection.deleteOne({ _id: id })

  if (res.deletedCount !== 1) return reply.callNotFound()
  reply.code(204).send()
}

export default async function crudPlugin (fastify: FastifyInstance, { data }: { data: CrudSettings }) {
  const basicRouteSchema = data.idStr ? basicRouteSchemaStr : basicRouteSchemaOid

  if (data.modules?.readAll !== false) {
    const schema = typeof data.modules?.readAll !== 'boolean' ? data.modules?.readAll?.schema ?? {} : {}
    schema.querystring = schema.querystring
      ? { ...(schema.querystring as {}), ...readQuerySchema }
      : schema.querystring = readQuerySchema

    fastify.get('/', { config: data, schema: schema }, readAll)
  }

  if (data.modules?.create !== false) {
    const schema = typeof data.modules?.create !== 'boolean' ? data.modules?.create?.schema : void 0
    fastify.post('/', { config: data, schema: schema }, create)
  }

  if (data.modules?.read !== false) {
    const schema = typeof data.modules?.read !== 'boolean' ? data.modules?.read?.schema ?? {} : {}
    schema.params = schema.params
      ? { ...(schema.params as {}), ...basicRouteSchema }
      : schema.params = basicRouteSchema

    fastify.get('/:id', { config: data, schema: schema }, read)
  }

  if (data.modules?.update !== false) {
    const schema = typeof data.modules?.update !== 'boolean' ? data.modules?.update?.schema ?? {} : {}
    schema.params = schema.params
      ? { ...(schema.params as {}), ...basicRouteSchema }
      : schema.params = basicRouteSchema

    if (typeof data.modules?.update === 'object' && data.modules.update.upsert) {
      fastify.put('/:id', { config: data, schema: schema }, update)
    } else {
      fastify.patch('/:id', { config: data, schema: schema }, update)
    }
  }

  if (data.modules?.delete !== false) {
    const schema = typeof data.modules?.delete !== 'boolean' ? data.modules?.delete?.schema ?? {} : {}
    schema.params = schema.params
      ? { ...(schema.params as {}), ...basicRouteSchema }
      : schema.params = basicRouteSchema

    fastify.delete('/:id', { config: data, schema: schema }, del)
  }
}
