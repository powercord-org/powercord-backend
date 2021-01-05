<!--
  Copyright (c) 2020-2021 aetheryx & Cynthia K. Rey
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Basic APIs
## Plugin core
<!-- todo: write stuff -->

## Available node modules
Powercord makes available some modules as if they were installed locally in your `node_modules` folder. That's so
you can easily use them, and import libraries relying on React for example which will just import React the classic
way.

Here is a list of available modules, as well as their DevTools equivalent, for debugging purposes.
 - `react` (DevTools: `$pc.modules.React`)
 - `react-dom` (DevTools: `$pc.modules.ReactDOM`)
 - `react-router` (DevTools: `$pc.modules.ReactRouter`)
 - `react-router-dom` (DevTools: `$pc.modules.ReactRouterDOM`)
 - `flux` (DevTools: `$pc.modules.Flux`)
 - `lodash` (DevTools: `window._`)
 - `pako` (DevTools: `$pc.modules.pako`)
