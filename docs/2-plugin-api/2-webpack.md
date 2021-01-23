<!--
  Copyright (c) 2020-2021 aetheryx & Cynthia K. Rey
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Webpack
Webpack is an open source tool used by Discord to bundle their complex React application into something web browsers
can understand. While we won't interact with Webpack itself, we'll interact with its output.

When bundling, Webpack throws in the final bundle a bit of its own code, its runtime, which lets it keep modules in
an organized form so they can be retrieved back. However, those modules aren't meant to be retrieved by something
else than Webpack's runtime, so they are identified by identifiers that are generated compile time, so we can't
exactly rely on it alone.

To make things easier, we provide a set of methods which lets you query the Webpack store, and retrieve the modules
you need to perform the action you want, or the module you want to patch, for example.

>info
> Discord has well over 10,000 different modules, so our utility is not only responsible for finding modules, but also
> to try and optimize its search algorithm to find modules efficiently. Looking through 10k+ entries ain't an easy
> task!

## Fetch modules
Unlike in previous versions, module fetching is a synchronous operation. If there are no modules matching your query,
the result will be `null`.

>warn
> Be careful, Powercord will spit out the raw module as it was exported by Discord. This means you may end up with
> an object with a `default` property which will actually contain what you're looking for. In case of doubts, don't
> hesitate to `console.log` what you get, and see if it's what you expect!

### By their props
This is the most classic way of fetching modules. Specify the methods and/or properties of the module you're looking
for and get it delivered instantly. Faster than with Amazon Prime!

###### Fetching a module by its props
```js
import { fetchByProps } from '@powercord/webpack'
// In DevTools: $pc.webpack.fetchByProps

const userFetcher = fetchByProps([ 'getUser' ])

// By using a more precise query, we get another module!
const userStore = fetchByProps([ 'getUser', 'getCurrentUser' ])
```

### By their display name (React)
This is React-specific; Most React components are assigned a display name, which is most of the time a unique and
descriptive name of their purpose.

>info
> This query cannot be [hinted](#hinting), as it's already only targeting React components. Attempting to will simply
> be ignored.

###### Fetching a module by its display name
```js
import { fetchByDisplayName } from '@powercord/webpack'
// In DevTools: $pc.webpack.fetchByDisplayName

const GuildContextMenu = fetchByDisplayName('GuildContextMenu')
```

### By their signature
Sometimes, there are no other solutions and you're required to look at the function's code to find what you're
looking for. Be careful, this is the slowest way of fetching a module and you most likely want to avoid it.

This method accepts either a string or a [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp).
If passed a string, it'll search for a module including it, if passed a `RegExp` it'll search for a module matching it.

By default, Powercord will apply this to simple functions laying around. However, you can tell Powercord to try and
see if a module has a function matching this signature, by passing in the options `module: true`.

###### Fetching a module by its signature
```js
import { fetchBySignature } from '@powercord/webpack'
// In DevTools: $pc.webpack.fetchBySignature

const RemoteAuthWrapper = fetchBySignature('handshake complete awaiting remote auth')
```

### Using a predicate
This is the last method you can use to fetch modules. It works similarly to the
[`Array.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
method.

###### Fetching a module using a predicate
```js
import { fetchByPredicate } from '@powercord/webpack'
// In DevTools: $pc.webpack.fetchByPredicate

const randomSymbol = fetchByPredicate((mdl) => typeof mdl === 'symbol')
```

## Options
All of the methods, unless specified otherwise, accepts the same [options](#options). You can pass them as the 2nd
argument.

| Option | Type | Description | Default |
|---|---|---|---|
| hint | string? | See [hinting](#hinting). | unset |
| all | boolean | If `true`, Powercord will return an array with all modules matching the query. | `false` |

## Hinting
As we mentioned, Discord has so many modules that going through the whole list every time might become a performance
hazard and cause slight slowdowns which may add up.

To help with performances, we build indexes we use to query modules more efficiently. Just like your average database,
you can hint the module fetcher as of what you're looking for, so it'll be able to look through an already smaller
dataset, further increasing the performance of your query.

>warn
> Hinted queries may affect the results of your query, as Powercord will use this hint to exclude chunks of the
> module store. Be careful to really target what you're looking for!

Here's the list of all available hints:
 - `cssClasses`: Generated CSS classes from a CSS module
 - `react`: React component
 - `flux`: Flux store
 - `module`: Generic object not fitting in previous categories (e.g. all of Discord's helpers)
 - `other`: Mostly strings or symbols laying around, alone, in a sea of modules...
