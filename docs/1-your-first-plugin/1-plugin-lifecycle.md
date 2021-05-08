<!--
  Copyright (c) 2020-2021 aetheryx & Cynthia K. Rey
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Plugin Lifecycle
Your plugin gets loaded in ram, fed some data, and gets wiped from ram. That's a really sad story but we're not here
for tears but to understand a plugin's lifecycle. It's slightly more complete than on the previous versions, but
still remains fairly easy.

## What's a lifecycle?
We got inspiration from React for our implementation, but it's basically a collection of specific methods called
during various stages of your plugin. Right when it started for example, or right before unloading.

They are extremely useful, as it's where the entry and exit logic resides for the most part. Their names are
intentionally a bit verbose, to avoid any conflict with your own logic.

>info
> **Protip**: all of the lifecycle methods can be async. They'll be awaited when necessary by Powercord, like when
> there's a load order requesting a specific plugin to be loaded in a specific order.

## `startPlugin`
You've probably already seen this one in the Plugin Basics, but that's the really first method called in your plugin.
This is where you'll put all of the logic that makes your plugin more than a dead piece of code doing nothing.

## `pluginWillUnload`
This method is called when the plugin is about to be unloaded. During this phase, the plugin must clean all injections
it did, event listeners, timeouts, etc etc.

Note that Powercord will take care of removing injections you've done and their side effects (like React components
injected), so you don't need to care too much about that side of things. However, if your injection is a bit too
complex for Powercord, manually cleaning up side effects may help.

## `pluginDidInstall`
Called when the plugin is ran for the first time after being installed.

>warn
> Using this to generate and collect analytics is strictly forbidden.

## `pluginDidUpdate`
This is called when the plugin has been updated and a **version change** did occur as per the manifest data. The
method receives two arguments: `previousVersion` and `newVersion`. Both strictly from the manifest.

## `pluginWillUninstall`
Called when the plugin will be uninstalled. `pluginWillUnload` will also be called. Note that it is unnecessary to
clear config as Powercord will already handle that for you.

>warn
> Using this method to show a prompt asking the user if they are sure about it, or otherwise use it to get user
> input before uninstall is prohibited, as per [guideline #5](https://powercord.dev/guidelines#5-no-advertising-promotion-or-spam-of-any-kind).
> You also are not allowed to generate and collect analytics using this lifecycle method.
