<!--
  Copyright (c) 2020-2021 aetheryx & Cynthia K. Rey
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Using ES6
Since Powercord bundles plugins, it is possible to use newer JavaScript syntax not supported by web browsers, the
major one that interest us here being ES6 import/export.

This syntax differs compared to what older NodeJS developers may used to (good old CommonJS, with the classic `require`,
`module.exports`, ...).

They are the recommended way of importing/exporting stuff, although `require` is still supported and we have no plans
on dropping support. Be careful, Powercord internals use ES6 exports.

There's great documentation on MDN Web Docs that we recommend checking out:
[`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import),
[`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)

>info
> On MDN, you'll see the mention of [Dynamic Imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports).
> While they are supported, you should give a look on the docs about [how PlugPack handles them](##advanced-plugins/plugpack-utils#dynamic-imports).

## How to import in DevTools?
Since you can't import directly within DevTools, quickly testing things out is way more limited than what it used to be
in v2. However, we expose a `$pc` variable, which can be used to query all of what plugins can access.

The `$pc` equivalents of modules you can import will be documented in their relevant documentation section.
