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

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { User } from '@powercord/types/users'
import { URL } from 'url'
import { unlink, rename } from 'fs/promises'
import { existsSync, mkdirSync, createReadStream, createWriteStream } from 'fs'

const SETTINGS_UPLOAD_LIMIT = 1e8 // 100MB
const SETTINGS_UPLOAD_EYES = 1e6 // 1MB
const SETTINGS_STORAGE_FOLDER = new URL('file:///var/lib/powercord/settings/')
if (!existsSync(SETTINGS_STORAGE_FOLDER)) mkdirSync(SETTINGS_STORAGE_FOLDER)

type ReqProps = { TokenizeUser: User }

const locks = new Set<string>()

async function retrieve (this: FastifyInstance, request: FastifyRequest<ReqProps>, reply: FastifyReply) {
  const file = new URL(request.user!._id, SETTINGS_STORAGE_FOLDER)
  if (!existsSync(file)) return reply.callNotFound()

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
