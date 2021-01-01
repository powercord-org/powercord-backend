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

import { memo } from 'react'

import style from '@styles/stats.scss'

function Stats ({ total, month, week, helpers, plugins, themes }) {
  const loaded = typeof total !== 'undefined'
  return (
    <>
      <div className={style.group}>
        <div>
          <h3>Total users</h3>
          <span>{loaded ? total : 'Loading...'}</span>
        </div>
        <div>
          <h3>New users last month</h3>
          <span>{loaded ? month : 'Loading...'}</span>
        </div>
        <div>
          <h3>New users last week</h3>
          <span>{loaded ? week : 'Loading...'}</span>
        </div>
      </div>

      <div className={style.group}>
        <div>
          <h3>Helpers</h3>
          <span>{loaded ? helpers : 'Loading...'}</span>
        </div>
        <div>
          <h3>Published plugins</h3>
          <span>Soon!</span>
        </div>
        <div>
          <h3>Published themes</h3>
          <span>Soon!</span>
        </div>
      </div>
      <p>Helpers include community members who contributed in any way to Powercord: Code contributors,
        translators, bug hunters.</p>
    </>
  )
}

Stats.displayName = 'Stats'
export default memo(Stats)
