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

import { memo } from 'react'

import style from '@styles/branding.scss'

function BrandAsset ({ transparent, name, copyrightYear, copyrightHolder, links }) {
  return (
    <section className={style.asset}>
      <h3>{name}</h3>
      <img src={links[links.length - 1].url} alt={name} className={transparent ? style.transparent : null}/>
      <footer>
        <div className={style.copyright}>
          Copyright &copy; {copyrightYear} {copyrightHolder}, All Rights Reserved.
        </div>
        <div className={style.links}>
          {links.map(l => (
            <a key={l.url} download={l.name} href={l.url}>.{l.name.split('.').pop()}</a>
          ))}
        </div>
      </footer>
    </section>
  )
}

BrandAsset.displayName = 'BrandAsset'
export default memo(BrandAsset)
