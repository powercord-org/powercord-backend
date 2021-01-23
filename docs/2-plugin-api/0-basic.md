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
 - [`react`](https://npm.im/react) (DevTools: `$pc.modules.React`)
 - [`react-dom`](https://npm.im/react-dom) (DevTools: `$pc.modules.ReactDOM`)
 - [`react-router`](https://npm.im/react-router) (DevTools: `$pc.modules.ReactRouter`)
 - [`react-router-dom`](https://npm.im/react-router-dom) (DevTools: `$pc.modules.ReactRouterDOM`)
 - [`flux`](https://npm.im/flux) (DevTools: `$pc.modules.Flux`)
 - [`lodash`](https://npm.im/lodash) (DevTools: `window._`)
 - [`pako`](https://npm.im/pako) (DevTools: `$pc.modules.pako`)
 - `@discord/dispatcher`: Discord's instance of FluxDispatcher (DevTools: `$pc.modules.discord.dispatcher)
