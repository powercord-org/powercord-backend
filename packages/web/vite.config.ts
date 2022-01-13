/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { Plugin } from 'vite'

import { defineConfig } from 'vite'
import { rename } from 'fs/promises'
import { join } from 'path'
import preact from '@preact/preset-vite'
import magicalSvg from 'vite-plugin-magical-svg'
// import sriPlugin from 'rollup-plugin-sri'

function moveIndex (): Plugin {
  return {
    name: 'move-index',
    closeBundle: async () => {
      if (process.argv.includes('--ssr')) {
        await rename(join(__dirname, 'dist', 'index.html'), join(__dirname, 'server', 'index.html'))
      }
    },
  }
}

export default defineConfig({
  css: { modules: { localsConvention: 'camelCase' } },
  publicDir: process.argv.includes('--ssr') ? '_' : 'public',
  build: {
    assetsInlineLimit: 0,
    outDir: process.argv.includes('--ssr') ? 'server' : 'dist',
  },
  server: { hmr: { port: 8080 } },
  resolve: { alias: { '../types/markdown.js': '../types/markdown.ts' } },
  // @ts-expect-error -- Vite's kinda dumb
  ssr: { noExternal: [ '@borkenware/spoonfeed' ] },
  plugins: [
    preact(),
    magicalSvg({ target: 'preact' }),
    // {  __VITE_PRELOAD__ is a meme and it's not a fun one
    //   ...sriPlugin({ publicPath: '/', algorithms: [ 'sha256', 'sha512' ] }),
    //   enforce: 'post',
    // },
    moveIndex(),
  ],
})
