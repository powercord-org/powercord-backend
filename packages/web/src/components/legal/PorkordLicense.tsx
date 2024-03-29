/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { Attributes } from 'preact'
import { h } from 'preact'
import { useTitle } from 'hoofd/preact'

import style from '../docs/markdown.module.css'

export default function PorkordLicense (_: Attributes) {
  useTitle('The Porkord License')

  return (
    <main className={`${style.markdown} serious`}>
      <h1>The Porkord License</h1>

      <p>All Rights Reserved. You are not allowed to redistribute this software, or use
      the software to build derivative works based upon without prior written permission.</p>

      <p>Permission is hereby granted, free of charge, to any person obtaining a verbatim
      copy of this software and associated documentation files (the "Software").</p>

      <p>The above copyright notice and this permission notice shall be included in all
      copies or substantial portions of the Software.</p>

      <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
      SOFTWARE.</p>
    </main>
  )
}
