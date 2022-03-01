/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import { URL } from 'url'
import { existsSync, readFileSync } from 'fs'

let path = new URL('../', import.meta.url)
let cfgFile = null
while (!cfgFile && path.pathname !== '/') {
  const attempt = new URL('config.json', path)
  if (existsSync(attempt)) {
    cfgFile = attempt
  } else {
    path = new URL('../', path)
  }
}

if (!cfgFile) {
  console.log('Unable to locate config file! Exiting.')
  process.exit(1)
}

const blob = readFileSync(cfgFile, 'utf8')
const cfg = JSON.parse(blob)

Object.defineProperty(cfg.discord, 'ccBotToken', { get: () => ({ type: 'Bot', token: cfg.discord.botToken }) })
export default cfg
