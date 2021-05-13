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

import type { Plugin, ESBuildOptions } from 'vite'

import { defineConfig } from 'vite'
import { rename } from 'fs/promises'
import { join } from 'path'
import preact from '@preact/preset-vite'
import magicalSvg from 'vite-plugin-magical-svg'

function noJsxInject (): Plugin {
  return {
    name: 'no-jsx-inject',
    config: (c) => void ((c.esbuild as ESBuildOptions).jsxInject = '')
  }
}

function moveIndex (): Plugin {
  return {
    name: 'move-index',
    async closeBundle () {
      if (process.argv.includes('--ssr')) {
        await rename(join(__dirname, 'dist', 'index.html'), join(__dirname, 'server', 'index.html'))
      }
    }
  }
}

export default defineConfig({
  css: { modules: { localsConvention: 'camelCase' } },
  publicDir: process.argv.includes('--ssr') ? '_' : 'public',
  build: { outDir: process.argv.includes('--ssr') ? 'server' : 'dist' },
  server: { hmr: { port: 8080 } },
  resolve: {
    alias: {
      '../types/markdown.js': '../types/markdown.ts'
    }
  },
  // @ts-expect-error -- Vite's kinda dumb
  ssr: { noExternal: [ '@borkenware/spoonfeed' ] },
  plugins: [
    preact(),
    noJsxInject(),
    magicalSvg({ target: 'preact' }),
    moveIndex()
  ]
})
