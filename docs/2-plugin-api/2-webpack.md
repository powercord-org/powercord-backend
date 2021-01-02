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
Unlike in previous versions, module fetching is a synchronous operation.

### By their props
This is the most classic way of fetching modules. Specify the methods and/or properties of the module you're looking
for and get it delivered instantly. Faster than with Amazon Prime!

###### Fetching a module by its props
```js
import { fetchByProps } from '@powercord/webpack'

const userFetcher = fetchByProps([ 'getUser' ])

// By using a more precise query, we get another module!
const userStore = fetchByProps([ 'getUser', 'getCurrentUser' ])
```

### By their display name (React)
This is React-specific; Most React components are assigned a display name, which is most of the time a unique and
descriptive name of their purpose.

>info
> This query cannot be [hinted](#hinting), as it's already only targeting React components.

###### Fetching a module by its display name
```js
import { fetchByDisplayName } from '@powercord/webpack'

const GuildContextMenu = fetchByDisplayName('GuildContextMenu')
```

### By their signature
Sometimes, there are no other solutions and you're required to look at the function's code to find what you're
looking for. You should only use this when props or display name aren't things you can use.

This method accepts either a string or a [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp).
If passed a string, it'll search for a module including it, if passed a RegExp it'll search for a module matching this
regexp.

###### Fetching a module by its signature
```js
import { fetchBySignature } from '@powercord/webpack'

const RemoteAuthWrapper = fetchBySignature('handshake complete awaiting remote auth')
```

### Using a predicate
This is the last method you can use to fetch modules, and the worst in terms of performances, as the query can only
be optimized through [hinting](#hinting) and will not make use of any internal index. Only use when all other methods
were unable to find the module you're aiming at.

###### Fetching a module using a predicate
```js
import { fetchByPredicate } from '@powercord/webpack'

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
As we mentioned, Discord has so many modules that going through the whole list everytime might become a performance
hazard and cause slight slowdowns which may add up.

To help with performances, we build indexes we use to query modules more efficiently. Just like your average database,
you can hint the module fetcher as of what you're looking for, so it'll be able to look through an already smaller
dataset, further increasing the performance of your query.

>warn
> Hinted queries may affect the results of your query, as Powercord will use this hint to exclude chunks of the
> module store. Be careful to really target what you're looking for!

Here's the list of all available hints:
 - `css-classes`: Generated CSS classes from a CSS module
 - `react`: React component
 - `flux`: Flux store
 - `module`: Generic object not fitting in previous categories (e.g. all of Discord's helpers)
