/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { User } from '@powercord/types/users'
import { URL } from 'url'
import { unlink, rename } from 'fs/promises'
import { existsSync, mkdirSync, createReadStream, createWriteStream } from 'fs'

const SETTINGS_UPLOAD_LIMIT = 1e8 // 100MB
const SETTINGS_UPLOAD_EYES = 1e6 // 1MB
export const SETTINGS_STORAGE_FOLDER = new URL('file:///var/lib/powercord/settings/')
if (!existsSync(SETTINGS_STORAGE_FOLDER)) mkdirSync(SETTINGS_STORAGE_FOLDER)

type ReqProps = { TokenizeUser: User }

const locks = new Set<string>()

async function retrieve (this: FastifyInstance, request: FastifyRequest<ReqProps>, reply: FastifyReply) {
  const file = new URL(request.user!._id, SETTINGS_STORAGE_FOLDER)
  if (!existsSync(file)) return reply.callNotFound()

  // todo: etag
  reply.header('content-type', 'application/octet-stream')
  reply.send(createReadStream(file))
}

function upload (this: FastifyInstance, request: FastifyRequest<ReqProps>, reply: FastifyReply) {
  if (locks.has(request.user!._id)) {
    reply.code(409).send({ error: 'Resource locked by another request currently processing.' })
    return
  }

  locks.add(request.user!._id)
  const file = new URL(request.user!._id, SETTINGS_STORAGE_FOLDER)
  const tmp = new URL(`${request.user!._id}.tmp`, SETTINGS_STORAGE_FOLDER)
  const stream = createWriteStream(tmp)
  request.raw.pipe(stream)
  request.raw.on('end', () => {
    if (stream.bytesWritten > SETTINGS_UPLOAD_EYES) {
      // todo: maybe emit notification for abuse monitoring
    }

    // todo: compute hash and store it for use as etag
    stream.close()
    rename(tmp, file)
      .then(() => {
        locks.delete(request.user!._id)
        reply.code(201).send()
      })
  })
}

async function del (this: FastifyInstance, request: FastifyRequest<ReqProps>, reply: FastifyReply) {
  if (locks.has(request.user!._id)) {
    reply.code(409).send({ error: 'Resource locked by another request currently processing.' })
    return
  }

  const file = new URL(request.user!._id, SETTINGS_STORAGE_FOLDER)
  if (!existsSync(file)) return reply.callNotFound()

  await unlink(file)
  reply.code(204).send()
}

export default async function (fastify: FastifyInstance): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return

  fastify.addHook('preHandler', fastify.auth([ fastify.verifyTokenizeToken ]))
  fastify.addContentTypeParser('application/octet-stream', {}, async () => void 0)

  fastify.post<ReqProps>('/', { bodyLimit: SETTINGS_UPLOAD_LIMIT }, upload)
  fastify.get<ReqProps>('/', retrieve)
  fastify.delete<ReqProps>('/', del)
}
