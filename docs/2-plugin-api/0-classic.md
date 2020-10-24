<!--
  Copyright (c) 2020 aetheryx & Bowser65
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Classic modules
Powercord makes available some modules as if they were installed locally in your `node_modules` folder. That's so
you can easily use them, and import libraries relying on React for example which will just import React the classic
way.

Here is a list of available modules, as well as their DevTools equivalent.

 - `react` (DevTools: `PowercordWebpack.React`)
 - `react-dom` (DevTools: `PowercordWebpack.ReactDOM`)
 - `react-router` (DevTools: `PowercordWebpack.ReactRouter`)
 - `react-router-dom` (DevTools: `PowercordWebpack.ReactRouterDOM`)
 - `flux` (DevTools: `PowercordWebpack.Flux`)
 - `lodash` (DevTools: `window._`)

>info
> Note that the modules we expose have been altered by Powercord to add logic (mostly protection against pollution
> and evading security features). You should see not see any difference though.
