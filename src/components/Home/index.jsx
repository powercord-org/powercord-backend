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
import Section from './Section'
import * as Icons from './Icons'

import style from '@styles/home.scss'

const Home = () => (
  <Container>
    <h2 className={style.headline}>Powerful and simple Discord client mod</h2>
    <section className={style.features}>
      <Section
        icon={Icons.Feather}
        title='Lightweight'
        desc={'Powercord is designed to use low to no extra resources. You won\'t even notice it\'s here!'}
      />
      <Section
        icon={Icons.Leaf}
        title='Native Feeling'
        desc={'We put effort in making our UIs look the same as Discord\'s UIs and ensure high compatibility with themes'}
      />
      <Section
        icon={Icons.Update}
        title='Built-in Updater'
        desc={'Install your plugin and themes, and we\'ll take care of keeping them up to date'}
      />
      <Section
        icon={Icons.API}
        title='Robust APIs'
        desc={'Develop great plugins with our powerful APIs. We even take care of error handling when we can!'}
      />
      <Section
        icon={Icons.Download}
        title='Plugin/Themes Installer'
        desc={'Install your plugin and themes, and we\'ll take care of keeping them up to date'}
        isSoon
      />
      <Section
        icon={Icons.Brush}
        title='Theme Customization'
        desc={'Themes, redefined. Theme devs can let you make the theme *your* theme through an easy configuration screen'}
        isSoon
      />
    </section>
    <section className={style.install}>
      <h2>What are you waiting for???</h2>
      <p>Make your Discord spicier. <Link to={Routes.INSTALLATION}>Install Powercord</Link>!</p>
    </section>
  </Container>
)

Home.displayName = 'Home'
export default React.memo(Home)
