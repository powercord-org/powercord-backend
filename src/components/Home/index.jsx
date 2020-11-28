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
import { Link } from 'react-router-dom'

import { Routes } from '@constants'
import Container from '@components/Container'
import * as Icons from '@components/Icons'
import Section from './Section'

import style from '@styles/home.scss'

function Home () {
  return (
    <Container>
      <h2 className={style.headline}>Powerful and simple Discord client mod</h2>
      <section className={style.features}>
        <Section
          icon={Icons.Feather}
          title='Lightweight'
          desc={'Powercord is designed to use low to no extra resources. You won\'t even notice it\'s here!*'}
        />
        <Section
          icon={Icons.Leaf}
          title='Native Feeling'
          desc={'We put effort in making our UIs look the same as Discord\'s UIs and ensure high compatibility with themes.'}
        />
        <Section
          icon={Icons.Update}
          title='Built-in Updater'
          desc={'Get the newest features, the latest fixes, automatically. We even handle update conflicts for you!'}
        />
        <Section
          icon={Icons.Api}
          title='Robust APIs'
          desc={'Develop great plugins with our powerful APIs. We even take care of error handling when we can!'}
        />
        <Section
          icon={Icons.Download}
          title='Plugin/Themes Installer'
          desc={'Browse plugins and themes, and install the ones you like by a simple click. All without leaving Discord.'}
          isSoon
        />
        <Section
          icon={Icons.Brush}
          title='Theme Customization'
          desc={'Themes, redefined. Theme devs can let you make the theme *your* theme through an easy configuration screen.'}
          isSoon
        />
      </section>
      <p className={style.note}>
        *Powercord still runs on top of the official Discord client, so it won't magically make it consume less
        memory or CPU. However, we try our best to not consume even <i>more</i> resources.
      </p>
      <section className={style.install}>
        <h2>What are you waiting for???</h2>
        <p>Make your Discord spicier. <Link to={Routes.INSTALLATION}>Install Powercord</Link>!</p>
      </section>
    </Container>
  )
}

Home.displayName = 'Home'
export default memo(Home)
