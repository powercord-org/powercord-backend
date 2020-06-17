# HTTP Requests

## Why a module? Can't I use `fetch`?
It's tempting to just use integrated fetch and perform requests. However, it comes with multiple downsides:
 - You're dependant on CORS. If you want to do any request to a website that doesn't allow CORS you'll face a wall.
 - Discord can easily monkeypatch `fetch`. They could at any time alter requests for any reason. It's unlikely they'll
 do it directly but tools like Sentry can hook into it and log requests made, for debugging purposes.

Therefore, we recommend using `powercord/http` module to perform requests. Discord still could if they wanted
inject custom logic in node modules but it'd make no sense for them to do so.

## Direct requests to Discord
>danger
> **BE CAREFUL**. We **strongly** discourage doing raw requests to Discord. **Only do this in desperate cases**.
> In most cases, it is better to rely on local modules that are responsible of fetching and caching this data as they
> most of the time save you from doing requests, because they have the data you want already cached. However, some
> sad cases require you to do this.
