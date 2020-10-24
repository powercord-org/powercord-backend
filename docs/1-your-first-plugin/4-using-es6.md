<!--
  Copyright (c) 2020 aetheryx & Bowser65
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
 - [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
 - [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)

## How to debug/test in DevTools?
Since you can't import directly within DevTools, debugging may be significantly more complicated. You'll not be able
to test as much as you used to in v2, but we expose some globals that can be used in DevTools.

The DevTools equivalent to exports is documented for individual components in their relevant documentation section.
