<!--
  Copyright (c) 2020-2021 aetheryx & Cynthia K. Rey
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Understanding React
>info
> If you're already familiar with React, there's a section [for you](#i-already-know-react). We recommend giving a
> look to the section on [injections](#react-and-injections).

React is a frontend framework which is used by a lot of companies and project to build web user interfaces. Discord
happens to be a React user, which means their entire UI is created using React.

We definitely recommend checking [React's docs](https://reactjs.org/docs/getting-started.html), they'll be useful
while developing plugins. Using React in your plugin won't differ from using React in a "normal" context, so if you
have React problems, the docs (~~and stackoverflow~~) are here for you.

<!-- todo: write stuff -->

## React and injections
### Rules of Hooks
Relevant React docs: https://reactjs.org/docs/hooks-rules.html

For hooks to work, you must not render more or less hooks between renders, and you must not use hooks within class
components. While this sounds easy enough, this also affects how you'll be able to use them when injecting.

If you happen to use a hook inside an injection, you'll end up breaking this rule. Because effectively, there is no
difference for React between the render without your function, and the render with your function. If you use a hook,
you render an additional one compared to previously and you'll break React.

If you need to keep some state, you need to make a wrapper component and render it (and pass Discord's rendered stuff
as a child, or as a prop depending on what you're doing). This way, you won't break the Rules of Hooks!

## I already know React
>info
> If you're a beginner, this section may not be the best for you since we consider you have at least mastered basic
> React concepts. What's above is explained in a more beginner friendly approach.

Using React in Powercord is the same as using it in a React project. You have your JSX file, you import React, and
you do the work.

Although, there's some stuff Powercord does behind the scenes to make it easier for developers. For example, when you
inject, Powercord automatically wraps everything in an error boundary so there's no need for you to worry about it.
This is also automatically done for settings UIs, modals, and context menus.

Powercord's error boundary also decodes React error messages: since we're using a production build, we only receive
limited error info that needs to be decoded using React's website. We do this for you.
