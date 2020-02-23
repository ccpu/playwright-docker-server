# playwright-docker-server

Docker image to run playwright server inside docker.

Currently only works with chromium; waiting for [#1081](https://github.com/microsoft/playwright/issues/1081) issue.

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
docker run -it --rm -p 3000:3000 -e SERVER_HEADLESS=true <image_name>
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
      - SERVER_HEADLESS=true
```

### Chromium [Flags](https://peter.sh/experiments/chromium-command-line-switches/)

To apply chromium [flags](https://peter.sh/experiments/chromium-command-line-switches/) use `FLAG_` at the beginning of environment variable:

```
docker run -it --rm -p 3000:3000 -e FLAG_HEADLESS=true <image_name>
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
      - FLAG_HEADLESS=true
```

> note that `no_sandbox` is reserved.

### Docker options

- USE_ONCE

Useful when only one job/socket required and docker need to be shutdown after job done.

```
docker run -it --rm -p 3000:3000 -e USE_ONCE=true  <image_name>
```

## Build All

```
npm run build

docker build --rm -f Dockerfile.base -t base .
docker build --rm -f Dockerfile.package -t package .
docker build --rm -f Dockerfile -t playwright-docker-server .
```

## Update playwright

Update to latest playwright version:

```
docker build --rm -f Dockerfile.package -t package .
docker build --rm -f Dockerfile -t playwright-docker-server .
```

Update to specific playwright version:

```
docker build --rm -f Dockerfile.package -t package --build-arg  PLAYWRIGHT_VERSION=0.11.1 .
docker build --rm -f Dockerfile -t playwright-docker-server .
```

> To set nodejs --loglevel use NPM_LOGLEVEL variable
