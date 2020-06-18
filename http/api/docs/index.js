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

const path = require('path')
const fsp = require('fs/promises')
const fetch = require('node-fetch')
const markdown = require('./markdown')

const docsStore = []
const remoteCache = {}

function listCategories (_, reply) {
  reply.send(docsStore.map(c => ({ ...c, docs: c.docs.map(d => ({ ...d, contents: void 0 })) })))
}

function getDocument (request, reply) {
  const { category, document } = request.params
  const cat = docsStore.find(c => c.id === category)
  if (!cat) return reply.code(404).send('Not Found')
  const doc = cat.find(d => d.id === document)
  if (!doc) return reply.code(404).send('Not Found')
  reply.send(document)
}

async function getRemoteDocument (url) {
  if (!remoteCache[url]) {
    const md = await fetch(url).then(r => r.text())
    remoteCache[url] = markdown(md)
    setTimeout(() => delete remoteCache[url], 300e3)
  }
  return remoteCache[url]
}

async function initializeFastify (fastify) {
  const docsPath = path.join(__dirname, '../../../docs')
  for (const cat of await fsp.readdir(docsPath)) {
    const catId = cat.split('-')[1]
    const docs = []
    for (const document of await fsp.readdir(`${docsPath}/${cat}`)) {
      const md = await fsp.readFile(`${docsPath}/${cat}/${document}`, 'utf8')
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
  fastify.get('/categories', listCategories)
  fastify.get('/:category/:document', getDocument)
}

module.exports = initializeFastify
