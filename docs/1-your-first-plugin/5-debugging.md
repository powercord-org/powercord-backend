<!--
  Copyright (c) 2020-2021 aetheryx & Cynthia K. Rey
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Debugging in Discord
When you're modding, there is a very, very big problem: there are no answers on stackoverflow. I know, this is
absolutely insane, but it's something you'll be able to flex about once your plugin is done... 😏

> Hey, I wrote code without stackoverflow! 😎

Not many developers can say that... Anyway, this means you'll have to learn and practice a set of debugging techniques,
which will help you to dig through Discord's source code, figure out what you need, and how to use it. All by yourself.

We'll provide some here, which are in use by Powercord Developers to make Powercord. This must mean they're absolutely
perfect and flawless, or that they're pieces of crap. You get to choose, but in both cases we have a working mod and
you're reading those docs. :p

## Find what I need
### Using React DevTools
Powercord ships with React DevTools installed by default, since this is basically the magic tool for all your React
debugging needs. Since Discord is made with React, this tool basically lets you inspect all the logic and components
used, which will help you find which components to use, where the logic for X is, ...

For components, Discord has been kind enough to keep display names for their components, which means they have a
plain human-readable name you can use. Sometimes the component's name will be followed by gray boxes, which is just
an extension of the display name. To get the full plain name, you just write it like `WhatsInTheGrayBox(ComponentName)`.

You'll also sometimes notice a very frustrating thing: Discord doesn't expose all the components which means some
can't* be retrieved. It's sad, but it's something that happens.

\**In fact they are accessible, using some [advanced patterns](##advanced-plugins/advanced-patterns) to dig your way
through Discord's internals.*

### Defining a starting point
Although using React DevTools you'll have a strong base to start with, if you don't have a starting point you'll end
up looking for a needle in a haystack. Fortunately, if you happen to have a bit of logic, you'll quickly able to
find one.

The base technique consists of looking for a logical place for the looking you're looking for to be tied. Let's say
you want to know how to open settings using code. In Discord, you'd click the settings button, and they'd show up.
Just grab React DevTools, and inspect that element of the app, and there you have a starting point.

You can just look through the props and crawl in Discord's source code to find out how to retrieve the module you need,
and how to use it.

## Understand a piece of code
### The classic, but efficient `console.log`
<!-- todo: write stuff -->

### The nerd's `debugger`
<!-- todo: write stuff -->

#### Timed debugger
<!-- todo: write stuff -->
