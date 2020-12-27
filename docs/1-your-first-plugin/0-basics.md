<!--
  Copyright (c) 2020 aetheryx & Bowser65
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Plugin Basics
Powercord plugins are more complex than a single file, but don't worry, it's still super simple and will even
simplify your life during plugin development.

The most basic plugin there can be constitutes of 2 files: the [manifest](#manifest) and an [index.js](#index-js) file.

>info
> Quick note before we get into the basics, you should first review our [guidelines](https://powercord.dev/guidelines)
> which defines what plugins are allowed to do and what they aren't. They're here to ensure a safe ecosystem!

## Manifest
This file is super important, since it lets Powercord know what your plugin is, who's its author, and various other
details that are useful for end users. It's also used to properly showcase your plugin in the Powercord Store, so
make sure to make it super polished!

The manifest is a json file named `manifest.json`. The structure for this file is relatively simple.

>info
> In the following example, we'll use comments inside the json file. Normally it's not possible unless using a JSON
> superset, but Powercord will strip those comments making their use possible.

Here's an example of the bare-minimum manifest, with only the required keys. Most of them are self-documenting:

###### Example manifest
```json
{ 
  "name": "Heygirl", // Plugin name.
  // We recommend to put a relatively short, but detailed description
  "description": "Replaces all images currently on screen by a random picture of Ryan Gosling",
  "author": "Powercord Team", // Plugin author.
  "version": "1.0.0", // Plugin version; 0.xxx or xxx-beta will show up as "Beta".
  "license": "BSD-3-Clause" // Plugin license, must be a valid SPDX identifier.
}
```

### `author` key
The author can accept two kind of values: string or array of string. The array of string format is designed for cases
where there's multiple authors, or when there's contributors you want to acknowledge.

The string can be formatted in 2 ways:
 - A plain string, which will be shown as-is
 - A discord ID (`discord::94762492923748352`), which will show as the user's DiscordTag

### `discord` key
If you have a dedicated support server, you can specify an invite link (without the discord.gg part), so Powercord can
display it to end users.

>warn
> This feature will be moderated, and any abuse in the intent to advertise an irrelevant server will be punished.

###### Discord invite example usage
```json
{
  "discord": "gs4ZMbBfCh"
}
```

### `appMode` key
>danger
> For now, this key isn't used but reserved for future use. It'll be used to make plugins run in the Discord overlay.

### `order` key
Back in v2, plugin load order was defined by a catastrophic mess of badly implemented dependency system, but this
is no more. The new implementation is better and allows plugins to do have a more fine control over the loading
order.

The `order` key accepts an array of objects, with the following structure:

###### Order example usage
```json
{
  "order": [
    { "plugin": "channel-typing", "order": "BEFORE" },
    { "plugin": "heygirl", "order": "AFTER" }
  ]
}
```

This will for example result in the following load order:
  1. channel-typing
  2. [the plugin]
  3. heygirl

### `nsfw` key
Quote from the Powercord Community Guidelines, #8:
> If your plugin's main purpose is providing NSFW content, you must specify this through the `nsfw` manifest key.<br>
> -- https://powercord.dev/guidelines

This key is a simple boolean.

### `permissions` key
This allows your plugin to request additional permission to the user, for example to perform HTTP requests.

The format is an object, with as key the permission requested and as value additional data for the permission, or
just `true`.

###### Permission types
| Permission ID | Permission description        | Additional data           |
|---------------|-------------------------------|---------------------------|
| http          | Perform HTTP requests         | Array of allowed origins* |
| net           | Connect to remote servers     | Array of allowed origins* |
| eud           | Collect and use End User Data | None                      |
| gkeybinds     | Register system-wide keybinds | None                      |

\* Refer to the [Network Library](##advanced-plugins/net#manifest-permissions) documentation for more detail.

###### Permissions example usage
```json
{
  "permissions": {
    "http": true,
    "net": [ "whois.nic.google" ],
    "eud": false // This has no effect, you can just skip it. Just know it works, if anything.
  }
}
```

### `consent` key
Even though most OSS licenses allow redistributing software provided the copyright notice is kept, this "trust license
text" approach ended in several troubles between developers and 3rd party plugin & theme listing websites.

To address this, we made a [Listing Websites Agreement](https://powercord.dev/listing-agreement) that all websites
must abide by, and we require developers to explicitly consent to be listed on external websites.

For the time being, this is the only use of this manifest key, although in the future we may add a new use case for the
key. The format is an array of strings, with a valid consent type inside. **By default, no consent is granted**.

###### Consent example usage
```json
{
  "consent": [ "ext_listing" ] // This list contains all the valid consent types
}
```

## `index.js`
Now, we're getting to the fun part: some actual code. Before we start, we'll answer this here, once and for all:
*no it's not possible to use something else than JavaScript*.

TypeScript is completely irrelevant in the scope of a client mod with no knowledge of 99% of the modules it'll use, and
other languages being completely not adapted to work in this scenario. For the nerds who'd like to use WebAssembly,
it's unfortunately disabled* as per a security policy; we aren't confident enough letting WebAssembly code out there
in the wild being ran, as it can conflict with our no-obfuscated policies and may be able to get pass some of our
protection (which isn't only runtime).

\*We may, in the future, look into enabling back WebAssembly support. For now, there is just no real use case that
can't be achieved using pure JS and available APIs.

Now that this is landed: here's what your plugin will look like. There's a lot you may not understand, but don't
freak out yet, you'll see it's super easy.

###### Example plugin
```js
import { Plugin } from '@powercord/core'

export default class MyPlugin extends Plugin {
  startPlugin () {
    console.log('Hello World!')
  }
}
```

And here you have it; the most basic plugin that exists - and it's working! This will just log `Hello World!` to
the DevTools console. Not much, but something to be proud of :)

The most important thing to remember here is how to form the basic plugin class structure. The more you'll look
through docs the more you'll understand it, but that's it for now.

### Can I use multiple files? And node libraries?
Yes! That's one of the advantages Powercord plugins have compared to BetterDiscord's: developers can split their code
in multiple files, which makes for clearer code and the ability to use syntax like JSX.

However, there is a downside: the more files you have, the more Powercord has to work to load your plugin, resulting
in slower plugin startup and some resource usage on the user's end. For your own code, the difference will be negligible
but if you import libraries, this will quickly add up and slow down the plugin startup.

### Wait, but how can I use CSS in my plugin?
It's super simple: you simply import it. No questions added. You can import plain css, scss, less or stylus files and
Powercord will take care of them for you. Note that we recommend using plain css for small needs, for performance
reasons.

###### Importing a stylesheet
```js
import 'style.css' // As easy as that!
```

#### And how to un-import?
You can't. If you need to remove a stylesheet at runtime, you mostly did something wrong or are attempting to do
something the wrong way. To make some css apply conditionally, use a class that you can toggle.

## How to publish?
Once your plugin is ready, you can go to the Powercord Store, in the section "Get in touch", go to "Publish a product"
and from there you'll be reminded the requirements, and you'll be able to fill the form. Note that a linked Powercord
account is required to submit forms.

### I've seen verified tickmarks, what are those?
For the greatest of the greatest plugins on Powercord, we offer a verification program to let developers have the
recognition they deserve for making Powercord as awesome as it is today. The form is also in the Powercord Store!