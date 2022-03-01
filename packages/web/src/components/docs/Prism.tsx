/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import { h } from 'preact'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-json'

import 'prismjs/themes/prism-tomorrow.css'
import style from './markdown.module.css'

type PrismProps = { language?: string | null, code: string }

export default function PrismComponent ({ language, code }: PrismProps) {
  let lines = []
  if (language && Prism.languages[language]) {
    // [Cynthia] This allows to be 100% certain spans don't go across multiple lines, so we can safely split
    lines = Prism.highlight(code, Prism.languages[language], language)
      .replace(
        /<span class="([a-z ]+)">([^<]*)<\/span>/g,
        (_, className, contents) => contents.split('\n').map((l: string) => `<span class="${className}">${l}</span>`).join('\n')
      )
      .split('\n')
  } else {
    lines = code.replace(/</g, '&lt;').replace(/>/g, '&gt;').split('\n')
  }

  return (
    <pre className={style.codeblock}>
      <code>
        {lines.map((line, i) => (
          <div className={style.line}>
            <div className={style.lineNumber}>{i + 1}</div>
            <div className={style.lineContent} dangerouslySetInnerHTML={{ __html: line }}/>
          </div>
        ))}
      </code>
    </pre>
  )
}

if (!import.meta.env.SSR) {
  // @ts-ignore -- Cleanup
  delete window.Prism
}
