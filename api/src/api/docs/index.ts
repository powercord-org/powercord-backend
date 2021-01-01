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
import type { Document } from './markdown.js'
import { URL } from 'url'
import { readdir, readFile } from 'fs/promises'
import fetch from 'node-fetch'
import markdown from './markdown.js'

type GetDocParams = { category: string, document: string }
type DocsStore = Array<{ id: string, name: string, docs: Array<Document & { id: string }> }>

// todo: use maps instead
const docsStore: DocsStore = []
const remoteCache = new Map<string, Document>()

function listCategories (this: FastifyInstance, _: FastifyRequest, reply: FastifyReply): void {
  reply.send(docsStore.map(c => ({ ...c, docs: c.docs.map(d => ({ ...d, contents: void 0 })) })))
}

function getDocument (this: FastifyInstance, request: FastifyRequest<{ Params: GetDocParams }>, reply: FastifyReply): void {
  const { category, document } = request.params
  const cat = docsStore.find(c => c.id === category)
  if (!cat) return void reply.callNotFound()
  // @ts-expect-error -- smth I prolly fixed in rewrite; cba
  const doc = cat.find(d => d.id === document)
  if (!doc) return void reply.callNotFound()
  reply.send(document)
}

async function getRemoteDocument (url: string): Promise<unknown> { // todo
  if (!remoteCache.has(url)) {
    const md = await fetch(url).then(r => r.text())
    remoteCache.set(url, markdown(md))
    setTimeout(() => remoteCache.delete(url), 300e3)
  }
  return remoteCache.get(url)
}

export default async function (fastify: FastifyInstance): Promise<void> {
  const docsUrl = new URL('../../../../docs/', import.meta.url)
  for (const cat of await readdir(docsUrl)) {
    const catId = cat.split('-')[1]
    const docs = []
    const catUrl = new URL(`${cat}/`, docsUrl)
    for (const document of await readdir(catUrl)) {
      const docUrl = new URL(document, catUrl)
      const md = await readFile(docUrl, 'utf8')
      docs.push({ id: document.split('.')[0], ...markdown(md) })
    }

    docsStore.push({
      id: catId,
      name: catId.split('_').map(s => `${s[0].toUpperCase()}${s.substring(1).toLowerCase()}`).join(' '),
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
