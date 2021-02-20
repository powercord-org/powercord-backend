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

In devtools, you can fetch them by doing `$pc.modules.get('<module>')`.

 - [`react`](https://npm.im/react)
 - [`react-dom`](https://npm.im/react-dom)
 - [`react-router`](https://npm.im/react-router)
 - [`react-router-dom`](https://npm.im/react-router-dom)
 - [`flux`](https://npm.im/flux)
 - [`lodash`](https://npm.im/lodash)
 - [`pako`](https://npm.im/pako)
 - `@discord/dispatcher`: Discord's instance of FluxDispatcher
