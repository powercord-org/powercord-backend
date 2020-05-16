# Plugin Structure

In this page, you will see how plugins are structured using *extended classes* and how Powercord executes/loads plugins.

## How powercord works with plugins:

Powercord uses the following sequence to load a plugin:

1) Powercord starts up, and begins loading plugins, it reads the plugin manifest and gathers infomation about the plugin.

2) Once Powercord has loaded plugins, it begins to loop through each plugin and run the method `startPlugin()` (if it exists which it should because its required) from each plugin.

3) `startPlugin()` is the core of a plugin, it allows you to register commands, 

Please finish this, i actually dont know what else to write kind contributor...
