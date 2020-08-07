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

import { Routes } from '../../constants'
import Container from '../Container'

const Home = () => (
  <Container>
    <section>
      <h2>The smoothest client mod ever made</h2>
      <p>
        Powercord is all about simplicity and performance, and does its best to keep Discord as responsive as without
        a mod. Powercord also reuses a lot of Discord internal elements which makes it fade in the UI for a fluid
        user experience.
      </p>
    </section>
    <section>
      <h2>What are you waiting for???</h2>
      <p>Make your Discord spicier. <a href={Routes.INSTALLATION}>Install Powercord</a>!</p>
    </section>
  </Container>
)

Home.displayName = 'Home'
export default React.memo(Home)
