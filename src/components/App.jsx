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

import { memo, useEffect } from 'react'
import { useLocation } from 'react-router'
import Helmet from 'react-helmet'

import Header from './Header'
import Router from './Router'
import Footer from './Footer'
import Cookies from './Cookies'

import '@styles/main.scss'

function App () {
  const { hash, pathname } = useLocation()
  if (process.env.BUILD_SIDE !== 'server') {
    useEffect(() => {
      if (hash) {
        const element = document.querySelector(hash)
        if (element) {
          setTimeout(() => element.scrollIntoView(), 10)
          return
        }
      }
      window.scrollTo(0, 0)
    }, [ pathname ])
  }

  return (
    <>
      <Helmet
        titleTemplate='%s • Powercord'
        defaultTitle='Powercord'
      >
        <meta charSet='utf8'/>
        <meta httpEquiv='Content-Type' content='text/html; charset=UTF-8'/>
        <meta name='viewport' content='width=device-width, initial-scale=1, viewport-fit=cover'/>

        <meta name='theme-color' content='#7289da'/>
        <meta name='revisit-after' content='2 days'/>
        <link rel='canonical' href={`https://powercord.dev${pathname}`}/>
        <meta name='description' content='A lightweight Discord client mod focused on simplicity and performance'/>

        <meta property='og:locale' content='en_US'/>
        <meta property='og:title' content='Powercord'/>
        <meta property='og:site_name' content='Powercord'/>
        <meta property='og:url' content={`https://powercord.dev${pathname}`}/>
        <meta property='og:image' content={require('@assets/powercord.png').default}/>
        <meta property='og:description' content='A lightweight Discord client mod focused on simplicity and performance'/>

        <meta name='twitter:card' content='summary'/>
        <meta name='twitter:site' content='@Bowser65'/>

        <link rel='dns-prefetch' href='https://fonts.googleapis.com'/>
        <link href='https://fonts.gstatic.com' rel='preconnect' crossorigin/>

        <link rel='shortcut icon' href={require('@assets/powercord.png').default}/>
        <link href='https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;800&display=swap' rel='stylesheet'/>
        <link href='https://cdn.jsdelivr.net/npm/typeface-jetbrains-mono@1.0.5/dist/index.min.css' rel='stylesheet'></link>
      </Helmet>
      {!pathname.startsWith('/backoffice') && <Header/>}
      <Router/>
      {!pathname.startsWith('/backoffice') && <Footer/>}
      <Cookies/>
    </>
  )
}

App.displayName = 'App'
export default memo(App)
