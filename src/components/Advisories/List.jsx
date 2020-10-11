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

import { Routes } from '../../constants'
import Container from '../Container'
import AdvisoryItem from './Item'

const List = () => (
  <Container>
    <h1>Powercord Security Advisories</h1>
    <p>
      A database for security vulnerabilities and threats discovered in the Powercord ecosystem. Advisories can be
      published by the Powercord Team, or by the plugin maintainers if they discover a security vulnerability in
      their plugin.
    </p>
    <p>
      If a plugin has a known high severity vulnerability, Powercord will not load the plugin and alert users. For
      lower severity issues, users will sill be warned but will have the choice to load the plugin anyway.
    </p>

    <AdvisoryItem
      id='PC-2020-001'
      level={0}
      title='Test low severity'
      plugin='test-plugin'
      author='Powercord Team'
      published='5 days ago'
    />
    <AdvisoryItem
      id='PC-2020-002'
      level={1}
      title='Test moderate severity'
      plugin='test-plugin'
      author='Powercord Team'
      published='5 days ago'
    />
    <AdvisoryItem
      id='PC-2020-003'
      level={2}
      title='Test high severity'
      plugin='test-plugin'
      author='Powercord Team'
      published='5 days ago'
    />
    <AdvisoryItem
      id='PC-2020-004'
      level={3}
      title='Test critical severity'
      plugin='test-plugin'
      author='Powercord Team'
      published='5 days ago'
    />
  </Container>
)

List.displayName = 'Advisories'
export default React.memo(List)
