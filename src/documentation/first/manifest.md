# Manifest

The manifest is a json file that holds useful infomation on a plugin and what it does.

### Example Plugin Manifest:

```json
    {
        "name": "Example Plugin",
        "version": "0.1.0",
        "author": "Example Author",
        "license": "Example Licence",
        "description": "This is an example manifest, for an example plugin for an example user.",
        "permissions": "example_permission",
        "dependencies": "examplePlugin1, examplePlugin2",
        "appMode": "app",
        "optionalDependencies": "crapExamplePlugin1, crapExamplePlugin2",
        "discord": "abc123"
    }
```

#### Lets break this file down into individual parts:

| Key | Example Value | Description |
|-----|---------------| ----------- |
| `name` | MyEpicPlugin | The name of the plugin. |
| `version` | 0.1.0+69420 | Version of the plugin, [this is in sematic versioning 2.0.0](https://semver.org/)|
| `author` | [CyaCal](https://github.com/cal3432) | Author of the plugin. (Hopefully this is your Discord username) |
| `license` | MIT | What license you have chosen to license your plugin with.               [Checkout this website on what license is best for you.](https://choosealicense.com/) |
| `description` | A epic plugin obviously! | What the plugin is and or does. |
| `permissions` | EXAMPLE_PERMISSION | What permissions the plugins needs [(INSERT URL TO advanced/permissions_dependencies.md)]() |
| `dependencies` and `optionalDependencies` | example1, example2 | What the plugin depends off, [(INSERT URL TO advanced/permissions_dependencies.md)]() |
| `appType` | Example Value | What the plugin has access to, see [(INSERT URL TO advanced/appMode.md)]() |
| `discord` | abc123 | The link code to join a discord server related to the plugin |
  
### Where do i place my manifest?

In the core folder of your plugin, preferably where your `index.js` is.

Example folder structure:

```
├── manifest.json
├── randomOtherFile.thingymabob
└── index.js
```

### "consent" key
This key is a bit specific: it doesn't affect your plugin behavior within Powercord but is a way to grant external
websites permissions over your content. Back in the BetterDiscord days a listing website caused a lot of drama and
we internally discussed about it and how we'd handle that in Powercord.

Instead of doing what some developers have done and boycott the concept of listing websites, we decided to team up
with them and come up with an [agreement](https://powercord.dev/listing-agreement) to help solving issues between
listing websites and developers.

To give permission to external websites to list your creations under this agreement, you must add this consent key
in your manifest. Its value is an array of string (for extensibility). For now there is only 1 type of consent
officially considered by Powercord:

```json
{
    "consent": [ "ext_listing" ]
}
```

The "consent" key is optional and not required, and is the same for theme manifests.

 
