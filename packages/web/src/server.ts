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

/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from 'http'
import { join } from 'path'
import { readFileSync } from 'fs'
import { createServer } from 'http'
import { render } from 'preact-render-to-string'
import { toStatic } from 'hoofd/preact'
import { h, Fragment } from 'preact'

import App from './components/App'

const template = readFileSync(join(__dirname, 'index.html'), 'utf8')

function handler (req: IncomingMessage, res: ServerResponse) {
  res.setHeader('content-type', 'text/html')

  if (req.method?.toLowerCase() !== 'get') {
    res.writeHead(405, 'method not allowed')
    res.end()
    return
  }

  const ctx: Record<string, any> = {}
  const body = render(h(App, { url: req.url ?? '/', ctx: ctx }))
  const helmet = toStatic()
  const head = render(h(
    Fragment, null,
    h('title', null, helmet.title),
    helmet.metas.map((m) => h('meta', m)),
    helmet.links.map((l) => h('link', l))
  ))

  if (ctx.notFound) res.writeHead(404, 'Not Found')
  res.write(template.replace('<!--ssr-head-->', head).replace('<!--ssr-body-->', body), () => res.end())
}

createServer(handler).listen(process.env.PORT ?? 5000)
