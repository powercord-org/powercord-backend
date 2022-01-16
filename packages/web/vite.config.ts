/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { Plugin } from 'vite'

import { defineConfig } from 'vite'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'
import { rename } from 'fs/promises'
import { join } from 'path'
import preact from '@preact/preset-vite'
import magicalSvg from 'vite-plugin-magical-svg'
import licensePlugin from 'rollup-plugin-license'

const baseLicensePath = join('dist', 'assets', 'third-party-licenses.txt')
let finalLicensePath

function renderLicense (deps) {
  let str = 'Licenses for open-source software used in this website are reproduced below.\n=========================\n\n'
  for (const dep of deps) {
    if (dep.name === 'index') continue
    const home = dep.homepage || dep.repository?.url || dep.repository
    str += `${dep.name}${home ? ` (${home})` : ''}\nThis software is licensed under the following terms:\n\n${dep.licenseText.trim()}\n\n----------\n\n`
  }

  // Open Sans
  const osLicense = readFileSync(join(__dirname, 'src', 'fonts', 'Open-Sans-LICENSE.txt'), 'utf8')
  str += `Open Sans Font Family (https://www.opensans.com/)\nThis software is licensed under the following terms:\n\n${osLicense.trim()}\n\n----------\n\n`

  // JetBrains Mono
  const jbmLicense = readFileSync(join(__dirname, 'src', 'fonts', 'JetBrains-Mono-LICENSE.txt'), 'utf8')
  str += `JetBrains Mono Font Family (https://www.jetbrains.com/mono)\nThis software is licensed under the following terms:\n\n${jbmLicense.trim()}\n\n----------\n\n`

  // Create hash
  str += 'u cute'
  const hash = createHash('sha256').update(str).digest('hex').slice(0, 8)
  finalLicensePath = join('assets', `third-party-licenses.${hash}.txt`)

  return str
}

function licenseInformation (): Plugin {
  let skip = false
  return {
    name: 'finish-license',
    configResolved: (cfg) => void (skip = !cfg.isProduction),
    generateBundle: (_, bundle) => {
      if (process.argv.includes('--ssr')) return
      const header = [
        'Copyright (c) Powercord Developers, All Rights Reserved.',
        'Licensed under the Open Software License version 3.0. Contains third-party software licensed under different terms.',
        `For third-party software licenses included in this build, please see /${finalLicensePath}`,
      ]

      for (const item of Object.values(bundle)) {
        if (item.type === 'chunk') {
          item.code = `/*!\n * ${header.join('\n * ')}\n */\n${item.code}`
          continue
        }

        if (item.fileName.endsWith('.svg')) {
          item.source = `<!--\n  ${header.join('\n  ')}\n-->\n${item.source}`
          continue
        }

        if (item.fileName.endsWith('.css')) {
          item.source = `/*!\n * ${header.join('\n * ')}\n */\n${item.source}`
          continue
        }
      }
    },
    closeBundle: async () => {
      if (!skip && !process.argv.includes('--ssr')) {
        await rename(baseLicensePath, join(__dirname, 'dist', finalLicensePath))
      }
    },
  }
}

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
    licensePlugin({
      thirdParty: process.argv.includes('--ssr')
        ? void 0
        : {
          includePrivate: false,
          allow: '(MIT OR BSD-3-Clause OR Apache-2.0 OR CC0-1.0)',
          output: {
            file: join(__dirname, baseLicensePath),
            template: renderLicense,
          },
        },
    }),
    licenseInformation(),
    moveIndex(),
  ],
})
