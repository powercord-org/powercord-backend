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

function paywallify (customBadges, tier) {
  tier = 69 // todo: we don't keep track of patreon tier yet
  return {
    color: tier < 1 ? null : customBadges.color || null,
    icon: tier < 2 ? null : customBadges.icon || null,
    white: tier < 2 ? null : customBadges.white || null,
    name: tier < 2 ? null : customBadges.name || null
  }
}

function formatUser (user, bypassVisibility) {
  return {
    id: user._id,
    username: user.username,
    discriminator: user.discriminator,
    avatar: user.avatar,
    badges: {
      developer: !!user.badges.developer,
      staff: !!user.badges.staff,
      support: !!user.badges.support,
      contributor: !!user.badges.contributor,
      translator: user.badges.translator || false, // Array of langs or false
      hunter: !!user.badges.hunter,
      early: !!user.badges.early,
      custom: paywallify(user.badges.custom || {}, user.patronTier || 0)
    },
    connections: {
      spotify: user.accounts.spotify && ((user.accounts.spotify.visible || true) || bypassVisibility) && {
        name: user.accounts.spotify.name,
        visible: user.accounts.spotify.visible || true
      },
      github: user.accounts.github && ((user.accounts.github.visible || true) || bypassVisibility) && {
        login: user.accounts.github.login,
        display: user.accounts.github.display,
        visible: user.accounts.github.visible || true
      }
    },
    patronTier: bypassVisibility ? user.patronTier : void 0
  }
}

module.exports = {
  formatUser
}
