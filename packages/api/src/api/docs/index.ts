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
import type { Document } from './parser.js'
import { URL } from 'url'
import { readdir, readFile } from 'fs/promises'
import fetch from 'node-fetch'
import markdown from './parser.js'

type GetDocParams = { category: string, document: string }
type Category = { name: string, docs: Map<string, Document> }
const docsStore = new Map<string, Category>()
const remoteCache = new Map<string, Document>()

function listCategories (this: FastifyInstance, _: FastifyRequest, reply: FastifyReply): void {
  reply.send(
    Array.from(docsStore.entries()).map(([ id, category ]) => ({
      id: id,
      name: category.name,
      docs: Array.from(category.docs.entries()).map(([ id, doc ]) => ({
        id: id,
        title: doc.title,
        parts: doc.parts
      }))
    }))
  )
}

function getDocument (this: FastifyInstance, request: FastifyRequest<{ Params: GetDocParams }>, reply: FastifyReply): void {
  const { category, document } = request.params
  if (!docsStore.has(category)) return void reply.callNotFound()
  const cat = docsStore.get(category)!
  if (!cat.docs.has(document)) return void reply.callNotFound()
  reply.send(cat.docs.get(document))
}

async function getRemoteDocument (url: string): Promise<Document> {
  if (!remoteCache.has(url)) {
    const md = await fetch(url).then((r) => r.text())
    remoteCache.set(url, markdown(md))
    setTimeout(() => remoteCache.delete(url), 300e3)
  }

  return remoteCache.get(url)!
}

export default async function (fastify: FastifyInstance): Promise<void> {
  const docsUrl = new URL('../../../../documentation/', import.meta.url)
  for (const cat of await readdir(docsUrl)) {
    if (cat === 'LICENSE' || cat === 'README.md' || cat === '.git' || cat === '.DS_Store') continue

    const catId = cat.replace(/^\d+-/, '')
    const docs = new Map<string, Document>()
    const catUrl = new URL(`${cat}/`, docsUrl)
    for (const document of await readdir(catUrl)) {
      const docUrl = new URL(document, catUrl)
      const md = await readFile(docUrl, 'utf8')
      docs.set(document.split('.')[0].replace(/^\d+-/, ''), markdown(md))
    }

    docsStore.set(catId, {
      name: catId.split('-').map(s => `${s[0].toUpperCase()}${s.substring(1).toLowerCase()}`).join(' '),
      docs
    })
  }

  fastify.get('/installation', () => getRemoteDocument('https://raw.githubusercontent.com/wiki/powercord-org/powercord/Installation.md'))
  fastify.get('/guidelines', () => getRemoteDocument('https://raw.githubusercontent.com/powercord-community/guidelines/master/README.md'))
  fastify.get('/listing-agreement', () => getRemoteDocument('https://raw.githubusercontent.com/wiki/powercord-org/powercord/Listing-Websites-Agreement.md'))
  fastify.get('/faq', () => getRemoteDocument('https://raw.githubusercontent.com/wiki/powercord-org/powercord/Frequently-Asked-Questions.md'))
  fastify.get('/categories', listCategories)
  fastify.get('/:category/:document', getDocument)
}
