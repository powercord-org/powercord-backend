<!--
  Copyright (c) 2020-2021 aetheryx & Cynthia K. Rey
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# PlugPack
PlugPack is the name of Powercord's internal plugin & theme compiler, powered by rollup & various css pre-processors.
Here are some documentation on how PlugPack will bundle your code and how you can get it to perform some specific
actions.

## Workers
>danger
> Due to browser security policies and some implementation difficulties (because electron lacks things you'd expect
> to be basic features, see [electron/electron#26065](https://github.com/electron/electron/pull/26065)), workers are
> currently not available and will raise an error if you try to use them.
>
> The future behavior of workers is still documented below.

To spawn a new `Worker`, you simply need to instantiate your worker like you'd normally do, and point to the worker
script. The path must be relative to the file you're spawning the worker from. PlugPack will recognize the structure
and perform the appropriated actions.

###### Spawning a Worker
```js
// Considering:
//   /index.js
//   /worker.js
const worker = new Worker('./worker.js')

// Considering:
//   /index.js
//   /subfolder/worker.js
const worker = new Worker('./subfolder/worker.js')
```

## Assets
You can import some assets (like images, audio files, ...) just by `import`ing them. You will receive a string which
will point to that resource, so you can use it easily.

###### Asset import example: loading an image
```js
import cat from './images/cat.png'

function Cat () {
  return (
    <img src={cat} alt='Cat!'/>
  )
}

export default Cat
```

## Dynamic imports
PlugPack supports dynamic imports, to allow plugins to import files in bulk without having to hardcode everything or
without having to need filesystem access.

>info
> While you can use dynamic imports to import simple modules, this is not recommended since they will **not** be lazy
> loaded. Instead, they'll be bundled and wrapped in `Promise.resolve`. Look below for cases where dynamic import
> can be useful.

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

`keys` returns an [`Iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#iterators)
which contains all of the files which matched your pattern. If you prefer an array over an iterator, you can pass the
results to [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from).

`load` lets you load a module from your glob import. It works just like require, and accepts a path (the same that
you would have used if you directly required it). The path will be normalized: if you do `./dir/sub/../file.js`, the
path will be resolved to `./dir/file.js`. It'll return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise),
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
