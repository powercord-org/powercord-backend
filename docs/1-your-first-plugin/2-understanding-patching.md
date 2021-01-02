<!--
  Copyright (c) 2020-2021 aetheryx & Cynthia K. Rey
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Understanding Patching
Patching is one of the basics of modding. It basically is the starting point of anything, either to add features,
to modify a feature's behavior, to hook into some events, or to even suppress some unwanted features. It's something
very important to understand, since you'll use it a whole lot in your plugins.

Patching basically consists in replacing a function's logic by your own logic. This will result in, the next time
the function you patched is called, to call your own logic rather than the original one.

Since Powercord has to deal with multiple injections and needs to be able to add/remove some on-fly, you won't
actually tap into the functions yourself but use our [injector API](##plugin-api/injector) to run your own logic.

## Magic, until a certain point
Despite being able to run virtually any piece of code you desire, it doesn't mean you should. As documented in the
[injector API](##plugin-api/injector#injecting), there are limitations due to the fact Discord expects something
specific. If Discord requests a banana, and you give a coconut, Discord may start to see you're trying to fool it.

The most common mistake is making your injection `async`. Doing so means you'll always return a `Promise`, which
is something Discord (or the libraries it's using) are totally not expecting, resulting in a problem. You have to
be careful and make sure to wrap things properly to not cause conflicts with existing logic. But don't worry, we've
documented the most common tricks in the [injector API](##plugin-api/injector#injecting).

## I'm curious, how does Powercord actually inject?
<!-- todo: link -->
If you are that curious, you are welcome to check our [injector source code](https://cynthia.dev), however here's the
very basic logic:

Our injector receives a module and a the target to patch, and the custom logic to run. Since everything goes through
the injector, we don't actually inject the custom logic, but rather store it in a store with a randomly given unique
ID. This serves to remove the custom logic when the plugin gets unloaded, without touching the function again and
messing with other plugins.

When injecting our custom runtime, we also do something we have been careless about on v2 and resulted in being a pain
in the ass: reassign the function props and mock the `toString()` method. This is super important because plugins
not only rely on those to fetch modules, but it also can wipe some precious methods or data that plugins need to work.

Our custom runtime is responsible for running "pre-injections", injections meant to run before Discord's logic (which
only receives args), run Discord's logic if the call hasn't been cancelled, and then run normal injections (which
receives args and the result they can modify freely).

The runtime also contains some safe guards and tries to solve whenever possible issues from badly handled cases within
plugins. It also includes some utilities to ensure what the plugin added gets removed as soon as the plugin is being
disabled, so there are no trace effects of plugins.
