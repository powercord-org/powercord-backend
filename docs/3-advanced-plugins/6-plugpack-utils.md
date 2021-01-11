<!--
  Copyright (c) 2020-2021 aetheryx & Cynthia K. Rey
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# PlugPack utils
PlugPack is the name of Powercord's internal plugin & theme compiler, powered by rollup & various css pre-processors.

## Dynamic imports
PlugPack supports dynamic imports, to allow plugins to import files in bulk without having to hardcode everything or
without having to need filesystem access.

### Import globing
Import globing lets you load all of the files within a folder (even recursively if you wish), and will give back an
object which will let you know all of the available files which matched the pattern, and will let you load them.

#### Syntax
You can chose to load files only in the folder you've targeted, or recursively. You must specify an extension.

###### Import globing syntax
```js
// within ./folder only
const globed = import('./folder/*.js')

// recursively
const globed = import('./folder/**/*.js')
```

#### Glob import object
When doing a glob import, you get an object with 2 properties: `keys` and `load`.

`keys` returns an [Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#iterators)
which contains all of the files which matched your pattern. If you prefer an array over an iterator, you can pass the
results to [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from).

`load` lets you load a module from your glob import. It works just like require, and accepts a path (the same that
you would have used if you directly required it). The path will be normalized: if you do `./dir/sub/../file.js`, the
path will be resolved to `./dir/file.js`.

`load` returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise),
just like a dynamic import (or raises an error if the module is not found).

###### Example glob import usage
```js
const modules = import('./modules/*.js')

for (const mdlId of modules.keys()) {
  const mdl = await modules.load(mdlId)
  mdl.default.load()
}
```

### Variable imports
This is powered by the [@rollup/plugin-dynamic-import-vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars)
plugin and we recommend giving a look to its [documentation](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#how-it-works)
for concrete examples.

In short, this somewhat works like [import globing](#import-globing), except than instead of using glob patterns you
directly import a specific file using variables, like this:

###### Example of variable import
```js
function loadLocale (locale) {
  import(`./locales/${locale}.json`).then((strings) => console.log(strings))
}
```

>warn
> Since plugins cannot load code on-demand, **all** of the candidates for a dynamic import will be bundled.
