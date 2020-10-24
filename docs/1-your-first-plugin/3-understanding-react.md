<!--
  Copyright (c) 2020 aetheryx & Bowser65
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Understanding React
>info
> If you're already familiar with React, there's a section [for you](#i-already-know-react).

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
