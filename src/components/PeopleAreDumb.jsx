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

import Container from './Container'

const PeopleAreDumb = () => (
  <Container>
    <h1>Frequently Asked Questions</h1>

    <h2 id='discord-tos'>Is Powercord against Discord's Terms of Service?</h2>
    <p>Long story short... <b>yes</b>. Powercord is against the Discord Terms of Service — but, you should keep reading:</p>
    <p>
      As of right now, <b>Discord is not going out of their way to detect client mods or ban client mod users</b>. On
      top of that, Powercord does not make any manual HTTP requests unlike certain client mods / plugins, so your
      client's user agent is the same as a legitimate client. Meaning, Discord doesn't detect a client mod like
      Powercord. They can go out of their way to start detecting it, but they don't.
    </p>
    <p>
      Hypothetically speaking - even if they somehow did detect Powercord, users are very unlikely to be banned on
      sight. It doesn't make sense for Discord to start banning a substantial part of it's userbase (client mod users)
      without any kind of warning. Not to mention it is mandatory for Powercord plugins to be fully API-compliant and
      ethical, implying Powercord users can't be banned for indirect ToS violations (e.g. selfbotting).
    </p>

    <h2 id='install-products'>How can I install plugins and/or themes on this?</h2>
    <p>
      In the future, Powercord will have a built-in store in which you'll be able to find and install plugins and
      themes with a simple button. However we're not here yet so you'll have to refer to the instructions on
      our <a href='https://discord.gg/5eSH46g' target='_blank' rel='noreferrer'>Discord server</a>, pinned in #plugins
      and #themes channels.
    </p>

    <h2 id='unplugged'>Powercord randomly disappeared, is it normal?</h2>
    <p>
      It can happen from time to time that Discord releases updates resetting our injection scripts leading to
      Powercord no longer being injected. If this occurs, you'll need to reinject Powercord manually, simply by
      following those steps:
    </p>
    <ol>
      <li>Open a terminal and go to where you cloned Powercord during installation</li>
      <li>Ensure Powercord is up to date by running <code>git pull</code></li>
      <li>Run <code>npm run plug</code></li>
      <li>Completely restart your Discord client</li>
    </ol>

    <h2 id='spotify-premium'>Why are there no control buttons on the Spotify module?</h2>
    <p>
      To control your Spotify playback we use Spotify's "Connect Web" API, which is unfortunately locked to
      Spotify Premium users. In order for you to control Spotify's playback you'll need to get a Premium subscription.
    </p>
    <p>
      If you do happen to have a Spotify Premium subscription but you're still not seeing the buttons show up, it
      might happen that Spotify is reporting inaccurate data about your Premium status and alters the availability
      of the buttons. Try changing the playback in any way (play, pause, change track, ...) to trigger and update and
      let us get accurate data from Spotify.
    </p>
    <p>
      If this still did not fix it, make sure you're not in a private session as we've received a few reports saying
      this causes your Premium subscription status to not be properly sent to us.
    </p>

    <h2 id='install-rtfm'>Powercord failed to inject, what did I do wrong?</h2>
    <p>
      In almost all cases, installation failures comes from missing a step or not taking into account everything
      listed on the <Link to='/installation'>installation guide</Link>. Most common mistakes are:
    </p>
    <ol>
      <li>Opening the terminal as administrator (Don't do that!)</li>
      <li>Not installing the required tools (git, node, Discord Canary)</li>
      <li>Not completely restarting Discord. Discord's close icon on the UI is <b>not</b> closing Discord completely</li>
      <li>Not using Discord Canary. Powercord is not available for other release branches</li>
      <li>Having an outdated node version (<code>node -v</code> to check)</li>
    </ol>
  </Container>
)

PeopleAreDumb.displayName = 'PeopleAreDumb'
export default React.memo(PeopleAreDumb)
