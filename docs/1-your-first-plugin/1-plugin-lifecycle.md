<!--
  Copyright (c) 2020 aetheryx & Bowser65
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Plugin Lifecycle
Your plugin gets loaded in ram, fed some data, and gets wiped from ram. That's a really sad story but we're not here
for tears but to understand a plugin's lifecycle. It's slightly more complete than on the previous versions, but
still remains fairly easy.

## What's a lifecycle
We got inspiration from React for our implementation, but it's basically a collection of specific methods called
during various stages of your plugin. Right when it started for example, or right before unloading.

They are extremely useful and useful, as it's where the entry and exit logic resides for the most part.

>info
> **Protip**: all of the lifecycle methods can be async. They'll be awaited when necessary by Powercord, like when
> there's a load order requesting a plugin to be loaded.

## `pluginStart`
You've probably already seen this one in the Plugin Basics, but that's the really first method called in your plugin.
This is where you'll put all of the logic that makes your plugin more than a dead piece of code doing nothing.

## `pluginWillUnload`
This method is called when the plugin is about to be unloaded. During this phase, the plugin must clean all injections
it did, event listeners, timeouts, etc etc.

Note that Powercord will take care of removing React components injected by the plugin, so no need to care too much
about that side of things. That is, provided you properly cleanup injections done.

## `pluginDidUpdate`
This is called when the plugin has been updated and a **version change** did occur as per the manifest data. The
method receives two arguments: `previousVersion` and `newVersion`. Both strictly from the manifest.
