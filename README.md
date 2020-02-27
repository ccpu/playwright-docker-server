# playwright-docker-server

Docker image to run playwright server inside docker.

Required playwright >= 0.11.0

## Usage

```
docker run -it --rm -p 3000:3000 <image_name>
```

```
import * as playwright from 'playwright-core';

(async () => {
  const browserType = 'chromium';
  const browser = await playwright[browserType].connect({
    wsEndpoint: 'ws://127.0.0.1:3000?' + browserType,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://en.wikipedia.org');
  await page.screenshot({ path: `example.png` });
  await browser.close();
})();


```

## Environment variables

### Server [LaunchOptions](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsertypelaunchserveroptions)

To apply playwright server [launchOptions](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsertypelaunchserveroptions) use `SERVER_` at beginning of the environment variable:

```
docker run -it --rm -p 3000:3000 -e SERVER_ignoreDefaultArgs=true <image_name>
```

In docker-compose:

```
version: '3'

services:
  browser-test:
    image: <image_name>
    ports:
      - 3000:3000
    environment:
      - SERVER_ignoreDefaultArgs=true
      - SERVER_dumpio=true
```

For options with the type of `array` simply do as follow:

version: '3'

```
version: '3'

services:
  browser-test:
    image: <image_name>
    ports:
      - 3000:3000
    environment:
      - SERVER_ignoreDefaultArgs="['--hide-scrollbars','--mute-audio']"

```

### Chromium [Flags](https://peter.sh/experiments/chromium-command-line-switches/)

To apply chromium [flags](https://peter.sh/experiments/chromium-command-line-switches/) use `FLAG_` at the beginning of environment variable:

```
docker run -it --rm -p 3000:3000 -e FLAG_debug_print=true <image_name>
```

In docker-compose:

```
version: '3'

services:
  browser-test:
    image: <image_name>
    ports:
      - 3000:3000
    environment:
      - FLAG_debug_print=true
```

> Not all chromium flags has been test, some of the flag may crash the docker.

> Note that `no_sandbox` is reserved.

### URI Options

Options can also passed with each socket request as follow:

```
  const browser = await playwright.chromium.connect({
    wsEndpoint: `ws://127.0.0.1:3000/chromium/
      flag-debug-print/
      server-ignoreDefaultArgs=["--hide-scrollbars","--mute-audio"]
      `,
  });

```

> Same as environment variable `flag-` and `server-` identifier need to be included at the beginning of option.

### Docker options

- USE_ONCE (boolean)

Useful when only one job/socket required and docker need to be shutdown after job done.

```
docker run -it --rm -p 3000:3000 -e USE_ONCE=true  <image_name>
```

- DOCKER_TIMEOUT (number)

Value in seconds, if not set docker will run forever.

Set this value if docker need to be shutdown after specified time.

```
docker run -it --rm -p 3000:3000 -e TIME_OUT=1200  <image_name>
```

- DISABLE_MESSAGES (boolean)

By default some messages are displayed in terminal, to disable it use `DISABLE_MESSAGES`.

- BROWSER_SERVER_TIMEOUT (number)

Value in seconds, if not set browser server will run until browser.close() called.
Set this value if browser server need to be close after specified time.

## Build All

```
npm run build

docker build --rm -f Dockerfile.base -t playwright/base .
docker build --rm -f Dockerfile.package -t playwright/package .
docker build --rm -f Dockerfile -t playwright/server .
```

## Update playwright

Update to latest playwright version:

```
docker build --rm -f Dockerfile.package -t playwright/package .
docker build --rm -f Dockerfile -t playwright/server .
```

Update to specific playwright version:

```
docker build --rm -f Dockerfile.package -t playwright/package --build-arg  PLAYWRIGHT_VERSION=0.11.1 .
docker build --rm -f Dockerfile -t playwright/server .
```

> To set nodejs --loglevel use NPM_LOGLEVEL variable

## Debugging

For attaching the debugger use following docker-compose:

```
services:
  browser-test:
    image: playwright/server
    ports:
      - 3000:3000
    command: npm run start-debug
```
