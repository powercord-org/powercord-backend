# Getting Started
## Prerequisites
Before you start making your first plugin, there are a few things you should be able to do first. We'll assume in
the docs that you know all of that:
 - **JavaScript**: Everything in Powercord is made with JS. If you're not familiar with it, you still
 [can learn](https://www.codecademy.com/learn/introduction-to-javascript).
 - **Debugging**: Given the nature of Powercord, you won't be able to find a lot of help on StackOverflow. Being
 able to debug things by yourself will quickly become vital for more complex plugins.
 - **A lot of patience**: You'll sometimes spend hours figuring out a way to get something you want. Reverse
 engineering Discord's internals isn't an easy task, and working with a webpack-bundled app isn't as easy as
 `require('../module_that_makes_discord_good.js')`.

## Bonus Points
Knowing those things isn't required and we'll explain the basics in the docs.
 - **React**: Discord is built with React, so is Powercord's UIs. You'll also have to deal with React elements
 when injecting into already existing UIs.
 - **Flux**: Discord uses Flux to store all of the data it handles. You can make use of them to have components
 connected to those stores and use this data.

## Principles
<!-- reuse internals as much as possible -->
<!-- compat with others (no bricking injection) -->
<!-- look as close as possible to Discord -->

## Guidelines
Make sure to read the [Powercord Plugin Guidelines](https://powercord.dev/guidelines) before starting writing your
plugin. We want plugins to improve Discord, not to make it less cool. We decided to be strict and impose a quality
standard to plugins to make the ecosystem as good as we can and have every plugin working as smoothly as possible.

We also did set in place rules to keep plugins ethical and respectful of users and of the Discord infrastructure
(API and Gateway). We do NOT want to cause trouble to Discord operations, and that'd be a great way of getting
users banned.
