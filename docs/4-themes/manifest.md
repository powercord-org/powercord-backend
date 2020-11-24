# Manifest
<!-- todo: cleanup and rewrite some parts to new stuff -->

Themes manifest are similar to plugin manifests, but with some key differences. If you've made plugin manifests you'll
most likely recognize some structures, but we'll still document the entire manifest structure.

## Where to put the manifest?
You need to put the manifest at your theme's root, in a file named `powercord_manifest.json`. We use the prefix
`powercord_` to enhance compatibility with other tools that might require a manifest.

For example, the most basic file structure for a theme would be:
```
├── powercord_manifest.json
└── style.css
```

## Basic manifest structure
The manifest is a relatively simple JSON file. It'll get more complex once we'll get into adding CSS Plugins and
define settings, but don't worry it should be pretty simple once you got it.

###### Manifest keys
| Key | Type | Description |
|---|---|---|
| name | string | The name of your theme |
| description | string | Description of your theme |
| version | string | Version of the theme. 0.xxx version will be considered beta |
| author | string | Author of the theme |
| license | string | License SPDX the theme is licensed under |
| theme | string | Relative path to your theme. Entry file can be css or any [supported preprocessor](#themes/preprocessors) |
| preview | url[] | Optional. Previews that'll be shown in the Powercord Store |
| discord | string | Optional. Invite code (**without discord.gg part**) to a support server. Will be shown in Powercord Store and in settings. |

###### Example manifest
```json
{
  "name": "Cute theme",
  "description": "A very cute theme to make Discord cuter",
  "version": "4.2.0",
  "author": "Bowoser",
  "license": "BSD-3-Clause",
  "theme": "theme.scss",
  "preview": [ "https://cdn.discordapp.com/attachments/606636904355725320/701582378946002996/iu.png" ],
  "discord": "5eSH46g"
}
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

## Advanced manifest
Powercord offers more advanced manifest keys to let users have an even better experience using your theme. Through
advanced manifest keys, you can without writing a single line of JS build highly customizable themes with a fully
featured configuration UI to let users tweak your theme to their taste.

### CSS Plugins
CSS Plugins are a way to shard your theme in smaller parts users can enable or disable individually. For example, you
can have a core theme, and a transparent CSS Plugin the user can enable if they want a transparent Discord window,
or disable if they want to keep Discord opaque.

Each CSS Plugin can define its own set of settings, like the main theme. You should define settings specific to the
CSS Plugin there, as they won't show up unless the user enabled it which reduces the amount of bloat on the UI.

CSS Plugins are defined through the `plugins` key of the manifest and is structured with the following keys:

###### Plugin object keys
| Key | Type | Description |
|---|---|---|
| name | string | Name of the CSS Plugin |
| description | string | Description of the CSS Plugin |
| author | string | Optional. CSS Plugin author, useful if different from theme author |
| license | string | Optional. CSS Plugin license SPDX, useful if different from theme author |
| file | string | Relative path to the file to load. Can be css or any [supported preprocessor](#themes/preprocessors) |

###### Example manifest
```json
{
  "name": "Cute theme",
  "description": "A very cute theme to make Discord cuter",
  "version": "4.2.0",
  "author": "Bowoser",
  "license": "BSD-3-Clause",
  "theme": "theme.scss",
  "preview": [ "https://cdn.discordapp.com/attachments/606636904355725320/701582378946002996/iu.png" ],
  "plugins": [
    {
      "name": "Transparent",
      "description": "Makes your Discord window transparent",
      "file": "transparent.scss"
    }
  ]
}
```

### Settings
Through settings, you can let users customize your theme in real-time through a UI Powercord will generate based on
your theme manifest.

#### Manifest format
Settings can quickly become noisy in your manifest but it's for a good reason: we tried to make them as extensible as
possible, to let theme developers be as creative as they can and come up with highly customizable themes.

Settings are defined through the `settings` manifest keys. It consists of two keys:
 - `format`: Defines how Powercord will apply those settings. More on that in the "Settings format" section below;
 - `options`: Options the user will be able to tweak. More on that in the "Options format" section below;

#### Settings format
Powercord supports different ways of applying settings. Which one to choose depends on your implementation and how
your theme is structured.

 - `css`: Settings defined as CSS variables. They'll be defined **after** your theme in `:root`.
 - `scss`: Settings defined using SCSS variables. They'll be defined **before** your first lines of scss.
 - `less`: Settings defined using Less variables. They'll be defined **before** your first lines of Less.
 - `stylus`: Settings defined using Stylus variables. They'll be defined **before** your first lines of Stylus.

>info
> **Protip**: In SCSS you can define "default values" using the `!default` flag.
> [Learn More](https://sass-lang.com/documentation/variables#default-values)

#### Options format
| Key | Type | Description |
|---|---|---|
| name | string | Option name |
| variable | string | Name of the variable that'll receive the setting* |
| description | string | Optional. Option description |
| type | string | Type of the option. See "Supported types" section below |

*Notes: For CSS variables you don't need to include the `--` prefix. Variable names cannot begin with an underscore.

#### Supported types
 - `string`: A basic string.
   - You can specify a minimum and maximum length using the `limit` key*
   - For string validation you can use the `regex` key to specify a regex the value must match
 - `select`: One of the predefined values in `options`.
   - `options` is an array of items that are structured this way:
     - `name`: What will be displayed in the UI
     - `value`: The actual value of the option
 - `number`: A basic number.
   - If you need your number to have a unit (e.g. px) you can define this through the `unit` key
     - The `unit` key can either be:
       - A string defining the unit
       - An array defining the units the user can choose
         - This array can contain the magic values `$scale` (for px, em, %, ...) or `$time` (for ms, s, ...)
   - You can specify a minimum and maximum value using the `limit` key. This will then turn the input into a slider
   - You can specify markers using the `markers` key
     - You can set `sticky` to true if you want the user to only be able values that are markers
 - `color`: A solid color with no transparency
 - `color_alpha`: A color with optional transparency (rgba)
 - `url`: An HTTP or file url
 - `background`: Either a color (with optional transparency) or an URL. Consider it a mix of `color_alpha` and `url`
 - `font`: A font name. The user will be able to select any available font detected

<!-- @todo: Write example for all of those -->

*the `limit` key is an array of two numbers (minimum and maximum)

#### CSS Plugins and settings
If one of your CSS Plugins has settings, you can add a `settings` key to your plugin manifest object, and then treat
it like described above.

### Splash screen theming
Powercord lets your theme specify a theme to inject in the splash screen so even this part is pixel-perfect. In our
testings, theme loading was instantaneous so it should give a pretty neat experience to your theme users.

You simply need to pass a theme to inject into the splash screen through the `splashTheme` key. We recommend using a
different css file than your main theme, to make sure your theme loads faster than the Blue Falcon.

###### Example manifest (partial)
```json
{
    "theme": "theme.css",
    "splashTheme": "overlay.css"
}
```

Powercord's SDK provides a quick and easy way to fire up a fake splash screen and manipulate its state to catch
all of the screen states. Learn more about it [here](#using_powercord/sdk##splash-screen).

### Overlay theming
>warn
> Overlay theming is **experimental** and is hard to test because most Powercord developers use Linux, where the
> in-game overlay isn't available. You might experience huge performance drops for heavy css. Use it at your own
> risk.

When Powercord runs in the in-game overlay, it will not load the theme you've specified in the manifest. Reason is
that most themes do rather heavy operations on the Discord look, and because the overlay shares only a few UIs with
the main theme loading the entire theme would cause **severe** performance issues in the overlay at a point where
it'd be practically unusable.

To avoid that, you can specify another theme to load in the overlay though the `overlayTheme` key. We heavily
discourage using the same theme as for the client if your theme does affect the look of Discord significantly. You
should instead use a separate theme file with only what's required to theme the overlay. Any extra code is code that
can make the overlay lag and that's most likely the last thing you want.

###### Example manifest (partial)
```json
{
  "theme": "theme.css",
  "overlayTheme": "overlay.css"
}
```

Powercord's SDK provides an option to open Chromium DevTools as soon as an overlay is detected. Learn more about it
[here](#using_powercord/sdk##overlay-devtools).
