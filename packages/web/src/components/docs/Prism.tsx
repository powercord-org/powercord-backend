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
  console.log(Prism)
  if (language && Prism.languages[language]) {
    lines = Prism.highlight(code, Prism.languages[language], language)
      .replace(
        /<span class="([a-z ]+)">([^<]*)<\/span>/g,
        (_, className, code) => code.split('\n').map((l: string) => `<span class="${className}">${l}</span>`).join('\n')
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
            <div dangerouslySetInnerHTML={{ __html: line }}/>
          </div>
        ))}
      </code>
    </pre>
  )
}

// @ts-ignore -- Cleanup
delete window.Prism
