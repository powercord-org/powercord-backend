<!--
  Copyright (c) 2020-2021 aetheryx & Cynthia K. Rey
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Settings
Plugins are nice, but giving users a way to customize how the plugin work is better. Powercord provides a module
dedicated to allowing users customize the plugin's behavior.

## The basics
### Limits & constrains
Each plugin has a maximum quota of 8MB. This is to ensure plugins cannot go wild and eat user's disk space. If you
attempt to do a set operation that'd exceed the quota, an `Error` will be thrown. The size is computed based on the
compressed JSON representation of all the settings.

Settings are also limited to types that can be stored as JSON. Symbols, functions, bigints, sets, maps aren't supported.
If you attempt to store an unsupported data structure, an `Error` will be thrown.

### Key naming and complex structures
Setting keys can only be strings, but it doesn't mean you have to give up complex structures. Just like in pure
JavaScript, you can dig (or build) structures used our beloved `.`. For example, take the following structure:

###### Example settings data
```json
{
  "test": true,
  "badges": {
    "enabled": true,
    "color": "#7289da",
    "types": {
      "a": 0
    }
  }
}
```

Getting `test` or `badges` seem easy enough, but getting `a` may not be as pretty. You may be tempted to get `badges`,
then grab it in code, the classic way. While it works, it causes 2 problems:
 - When you'll use it within a React component, you'll get unnecessary updates due to fields you don't use
 - To set, you need to pass the entire object

Instead, you can use the `badges.types.a` key, and Powercord will automatically work its way out. It'll also do
optional chaining for you, or when doing a set operation generate the whole tree if needed.

>warn
> If you try to use an invalid key (Starting or ending with a dot or with multiple chained dots (`..`)), an `Error`
> will be thrown.

## Registering settings
This step is not strictly required, but strongly recommended. It allows for Powercord to know what can be configured
in your plugin and it's used internally to automatically build a settings UI, as well as adding shortcuts in the
context menu of the setting wheel (the thing you click to open settings. Didn't know it existed? You're welcome.).
It also lets you specify default values for all your settings in a single, central place instead of spread around in
the getters.

###### Quick example for registering settings
```js
...
import { registerSettings } from '@powercord/settings' // Note: @powercord/settings is unavailable in DevTools

class HelloWorld extends Plugin {
  pluginStart () {
    registerSettings([
      {
        key: 'mySetting',
        ...
      },
      ...
    ])
  }
}

```

Because the registration of all the settings also includes setting up the logic for validation, the documentation
will look a bit verbose but it's not very complicated.

### Basic types

### Setting definition object structure

### Data validation

### Dynamically enable/disable, show/hide settings

## Basic read & write

### Within React components
Within components, the use of the classic `getSetting` and/or `setSetting` is discouraged. Instead, you should use the
`useSetting` hook. This will allow your component to immediately update when a change occurs, without having to craft
the whole logic around it. The hook behaves similarly to [`useState`](https://reactjs.org/docs/hooks-state.html),
except it takes the setting key as parameter.

###### Example use of useSetting hook
```js
import { useSetting } from '@powercord/settings'

export default function MyComponent () {
  // You can specify a default value, just like in classic get.
  const [ value, setValue ] = useSetting('key')

  return (
    <p>The value of the <code>key</code> setting is {value}!</p>
  )
}
```

## Subscribe to changes

## Create a UI
