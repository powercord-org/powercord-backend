# Custom Backends
Some more complex or specific plugins might require having a remote API or socket to push and pull data from.

If your plugin happens to require a backend to work, we're ready to let you host it on our server and allocate
a `yourplugin.powercord.dev` address. This lets you make your absolutely fantastic:tm: plugin while not having
to wonder how you'll be able to host it.

## Requirements
To keep our server hamsters alive, you must comply with the following requirements in order to be eligible:

 - Code must meet basic quality standards; which includes reasonable security and not being over-engineered.

By quality we don't take into account how well your code is written or not. We might during our review give you some
tips on how your code could be improved but we won't impose code-styles or libraries.

 - It must not be resource intensive. We don't have infinite CPU and memory.

If your backend happens to show signs of unforeseen resource usage (e.g. memory leak) we'll inform you as fast as
possible about our findings.

 - Backends must be open-sourced wherever you like. Can be GitHub, GitLab, whatever.

This is first to ensure transparency to your plugin's user, and to ensure we won't get into legal troubles for hosting
a copy of your software. Since "open-source" can be subjective at times, we've decided to only accept
[OSI approved licenses](https://opensource.org/licenses).

 - We must be able to run it without having to install a billion things.

Powercord is a hobby project, and most developers have more important occupations (studies, work, ...).
We don't have the time to get complex setups running (and most of the time more complex stuff trends to
consume more resources.) If you use more specific technologies or just want to do it this way, you can use Docker.

## Get my backend hosted
Pretty simple! You just need to get in touch with us through the form available in the Plugin Store (you can
alternatively click [here](https://powercord.dev/l/store/form/hosting)). You'll be asked to fill out some information
about your backend and a link to your repository. Once sent, a Powercord Staff will get in touch with you once we've
reviewed your application.
