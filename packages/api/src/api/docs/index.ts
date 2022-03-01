/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { Document } from './parser.js'
import { URL } from 'url'
import { createHash } from 'crypto'
import { existsSync } from 'fs'
import { readdir, readFile } from 'fs/promises'
import { fetch } from 'undici'
import config from '@powercord/shared/config'
import markdown from './parser.js'

type GetDocParams = { category: string, document: string }
type Category = { name: string, docs: Map<string, Document> }
const docsStore = new Map<string, Category>()
const remoteCache = new Map<string, Document>()
const docsCategories: string[] = []
let categoriesEtag: string = ''

function listCategories (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): void {
  reply.header('cache-control', 'public, max-age=3600')
  if (request.headers['if-none-match'] === categoriesEtag) {
    reply.code(304).send()
    return
  }

  reply.header('etag', categoriesEtag)
  reply.send(
    Array.from(docsStore.entries())
      .filter(([ catId ]) => docsCategories.includes(catId))
      .map(([ catId, category ]) => ({
        id: catId,
        name: category.name,
        docs: Array.from(category.docs.entries()).map(([ docId, doc ]) => ({ id: docId, title: doc.title })),
      }))
  )
}

function getDocument (this: FastifyInstance, request: FastifyRequest<{ Params: GetDocParams }>, reply: FastifyReply): void {
  const { category, document } = request.params
  if (!docsStore.has(category)) return void reply.callNotFound()
  const cat = docsStore.get(category)!
  if (!cat.docs.has(document)) return void reply.callNotFound()

  const doc = cat.docs.get(document)!
  const etag = `W/"${doc.hash}"`
  reply.header('cache-control', 'public, max-age=3600')
  if (request.headers['if-none-match'] === etag) {
    reply.code(304).send()
    return
  }

  reply.header('etag', etag)
  reply.send(doc)
}

async function getRemoteDocument (url: string): Promise<Document> {
  if (!remoteCache.has(url)) {
    const md = await fetch(url).then((r) => r.text())
    remoteCache.set(url, markdown(md))
    setTimeout(() => remoteCache.delete(url), 300e3)
  }

  return remoteCache.get(url)!
}

function findDocsFolder (): URL | void {
  let path = new URL('../', import.meta.url)
  while (path.pathname !== '/') {
    const attempt = new URL('documentation/', path)
    if (existsSync(attempt)) {
      return attempt
    }

    path = new URL('../', path)
  }
}

export default async function (fastify: FastifyInstance): Promise<void> {
  const docsUrl = findDocsFolder()
  if (!docsUrl) return

  // Load docs data
  const catHash = createHash('sha1').update(config.secret)
  for (const cat of await readdir(docsUrl)) {
    if (cat === 'LICENSE' || cat === 'README.md' || cat === '.git' || cat === '.DS_Store') continue

    const catId = cat.replace(/^\d+-/, '')
    const docs = new Map<string, Document>()
    const catUrl = new URL(`${cat}/`, docsUrl)
    catHash.update(catId)
    for (const document of await readdir(catUrl)) {
      const docId = document.split('.')[0].replace(/^\d+-/, '')
      const docUrl = new URL(document, catUrl)
      const md = await readFile(docUrl, 'utf8')
      catHash.update(docId).update(md)
      docs.set(docId, markdown(md))
    }

    if (cat !== catId) docsCategories.push(catId)
    docsStore.set(catId, {
      name: catId.split('-').map((s) => `${s[0].toUpperCase()}${s.substring(1).toLowerCase()}`).join(' '),
      docs: docs,
    })
  }
  categoriesEtag = `W/"${catHash.digest('base64')}"`

  // Routes
  fastify.get('/installation', (_request: FastifyRequest, reply: FastifyReply) => {
    reply.header('cache-control', 'public, max-age=3600')
    return getRemoteDocument('https://raw.githubusercontent.com/wiki/powercord-org/powercord/Installation.md')
  })

  fastify.get('/guidelines', (_request: FastifyRequest, reply: FastifyReply) => {
    reply.header('cache-control', 'public, max-age=3600')
    return getRemoteDocument('https://raw.githubusercontent.com/powercord-community/guidelines/master/README.md')
  })

  fastify.get('/faq', (_request: FastifyRequest, reply: FastifyReply) => {
    reply.header('cache-control', 'public, max-age=3600')
    return getRemoteDocument('https://raw.githubusercontent.com/wiki/powercord-org/powercord/Frequently-Asked-Questions.md')
  })

  fastify.get('/categories', listCategories)
  fastify.get('/:category/:document', getDocument)
}
