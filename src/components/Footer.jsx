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

import React from 'react'
import { Link } from 'react-router-dom'

import { Routes } from '../constants'

import style from '@styles/footer.scss'

const Footer = () => (
  <footer className={style.container}>
    <div className={style.section}>
      <span>Copyright &copy; 2018-{new Date().getFullYear()} Powercord</span>
      <span>Powercord is not affiliated or endorsed by Discord. Discord is a trademark of Discord Inc.</span>
    </div>
    <div className={style.section}>
      <span><Link to={Routes.STATS}>Stats</Link></span>
      <span><Link to={Routes.BRANDING}>Branding</Link></span>
      <span><a href={Routes.GITHUB} target='_blank' rel='noreferrer'>GitHub</a></span>
      <span><Link to={Routes.TERMS}>Terms</Link></span>
      <span><Link to={Routes.PRIVACY}>Privacy</Link></span>
    </div>
  </footer>
)

Footer.displayName = 'Footer'
export default React.memo(Footer)
