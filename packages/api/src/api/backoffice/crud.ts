/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

// todo: implement crud stuff but in a better way than previously (hopefully)

// todo: make safe enough and modular enough for usage in public routes
// [Cynthia] As long as routes have a strict schema, they will be safe from mongo injections

import type { FastifyInstance, FastifyRequest, FastifyReply, ConfiguredReply } from 'fastify'
import { ObjectId } from 'mongodb'

export type CrudSettings = {
  entity: {
    collection: string
    projection: { [key: string]: 0 | 1 }
    aggregation?: object[]
    stringId?: boolean
    schema: {
      read: unknown // todo: make better?
      write: unknown // todo: make better?
    }
  }
  create?: {
    enabled?: boolean
  }
  read?: {
    enabled?: boolean
    allowAll?: boolean
  }
  update?: {
    enabled?: boolean
    upsert?: boolean
    hasUpdatedAt?: boolean
  }
  delete?: {
    enabled?: boolean
  }
}

type Reply = ConfiguredReply<FastifyReply, CrudSettings>

type RouteParams = { id: string }

type ReadAllQuery = { limit?: number, page?: number }

async function create () {
  // todo
  return null
}

async function read (this: FastifyInstance, request: FastifyRequest<{ Params: RouteParams }>, reply: Reply) {
  const config = reply.context.config
  const filter = { _id: config.entity.stringId ? request.params.id : new ObjectId(request.params.id) }

  // todo: aggregations
  const entity = this.mongo.db!.collection(config.entity.collection).findOne(filter, { projection: config.entity.projection })
  if (!entity) {
    reply.callNotFound()
    return
  }

  return entity
}

async function readAll (this: FastifyInstance, request: FastifyRequest<{ Querystring: ReadAllQuery, Params: RouteParams }>, reply: Reply) {
  const config = reply.context.config
  const page = (request.query.page ?? 1) - 1
  const limit = request.query.limit ?? 50

  // todo: aggregations
  const cursor = this.mongo.db!.collection(config.entity.collection).find({}, { projection: config.entity.projection, limit: limit, skip: page * limit })
  return cursor.toArray()
}

async function update () {
  // todo
  return null
}

async function del () {
  // todo
  return null
}

export default function (fastify: FastifyInstance, { data }: { data: CrudSettings }, next: (err?: Error) => void) {
  const routeSchema = {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        pattern: data.entity.stringId ? '^\\d{16,}$' : '^[a-f0-9]{24}$',
      },
    },
  }

  if (data.create?.enabled !== false) {
    fastify.route({
      method: 'POST',
      url: '/',
      handler: create,
      config: data,
      schema: {
        // body: data.entity.schema.write,
        response: { 200: data.entity.schema.read },
      },
    })
  }

  if (data.read?.enabled !== false && data.read?.allowAll !== false) {
    fastify.route({
      method: 'GET',
      url: '/',
      handler: readAll,
      config: data,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', exclusiveMinimum: 0, maximum: 100 },
            page: { type: 'integer', exclusiveMinimum: 0 },
          },
        },
        response: {
          200: {
            type: 'array',
            items: data.entity.schema.read,
          },
        },
      },
    })
  }

  if (data.read?.enabled !== false) {
    fastify.route({
      method: 'GET',
      url: '/:id',
      handler: read,
      config: data,
      schema: {
        params: routeSchema,
        response: { 200: data.entity.schema.read },
      },
    })
  }

  if (data.update?.enabled !== false) {
    fastify.route({
      method: 'PATCH',
      url: '/:id',
      handler: update,
      config: data,
      schema: {
        params: routeSchema,
        // body: data.entity.schema.write,
        response: { 200: data.entity.schema.read },
      },
    })
  }

  if (data.delete?.enabled !== false) {
    fastify.route({
      method: 'DELETE',
      url: '/:id',
      handler: del,
      config: data,
      schema: { params: routeSchema },
    })
  }

  next()
}
