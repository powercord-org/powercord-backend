<!--
  Copyright (c) 2020-2021 aetheryx & Cynthia K. Rey
  This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
  https://creativecommons.org/licenses/by-nd/4.0
-->

# Network Library

## Security & restrictions
<!-- todo: document -->

## HTTP
Since plugins run in the context of a web page, performing web requests is limited by the security features in place
within Chromium to prevent malicious web pages from doing malicious things.

Since those restrictions are annoying, Powercord exposes to plugins a modified [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
function to perform HTTP request. You don't need to import anything to use it (it replaces the classic `fetch`) method,
however it has some slight implementation differences that are documented below.

>info
> In DevTools, you can use the modified `fetch` method by calling `$pc.native.net.fetch`. The classic `fetch` remains
> untouched.

### Differences
Our `fetch` implementation differs in some ways, because unnecessary in the context of application-level http request
compared to the more classic browser security concerns.

All of the following initialization parameters are **ignored** when calling `fetch`:
 - `mode`
 - `credentials`
 - `referrer`
 - `referrerPolicy`
 - `integrity`
 - `keepalive`
 - `cache`
 - `signal` *Support may be added in the future*

The returned [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object follows the spec, expect:
 - the `type` property is unset
 - the only methods available are `json()`, `text()` and `buffer()`, and they **do not return a `Promise`**
 - the `buffer()` method returns a [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)

## TCP Sockets
<!-- todo: draft something; I kinda want an api similar to WebSocket -->

<!-- todo: udp sockets? -->

## Manually calling the Discord API
>danger
> This practice is **severely discouraged** and must only be used as a last resort, if you have no other choices.

<!-- todo: document @discord/http -->
