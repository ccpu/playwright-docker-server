# playwright-docker-server

Docker image to run playwright server inside docker.

Required Playwright version should match the Docker image tag.

## Usage

```
docker run -it --rm -p 3000:3000 <image_name>
```

```
import * as playwright from 'playwright-core';

(async () => {
  const browserType = 'chromium';
  const browser = await playwright[browserType].connect({
    wsEndpoint: 'ws://127.0.0.1:3000/' + browserType,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://en.wikipedia.org');
  await page.screenshot({ path: `example.png` });
  await browser.close();
})();


```

## Environment variables

### Server [LaunchOptions](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-server)

To apply playwright server [launchOptions](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-server) use `SERVER__` at the beginning of the environment variable:

```
docker run -it --rm -p 3000:3000 -e SERVER__ignoreDefaultArgs=true <image_name>
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
      - SERVER__ignoreDefaultArgs=true
      - SERVER_firefox__devtools=true
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
      - SERVER__ignoreDefaultArgs=["--hide-scrollbars","--mute-audio"]

```

### Chromium [Flags](https://peter.sh/experiments/chromium-command-line-switches/)

To apply chromium [flags](https://peter.sh/experiments/chromium-command-line-switches/) use `FLAG__` at the beginning of environment variable and replace all dashes with underline:

```
docker run -it --rm -p 3000:3000 -e FLAG__debug_print=true <image_name>
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
      - FLAG__debug_print=true
      - FLAG_chromium__allow_sandbox_debugging=false
```

> Not all chromium flags has been test, some of the flag may crash the playwright server.

> Note that `no_sandbox` is reserved.

### URI Options

Options can also passed as query string with each socket request as follow:

```
  const browser = await playwright.chromium.connect({
    wsEndpoint: `ws://127.0.0.1:3000/chromium?flag--flag-option=true&server--server-option=["--server-a-1","--server-a-2"]
      `,
  });

```

> Same as environment variable `flag--` and `server--` identifier need to be included at the beginning of option.

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
pnpm run build

Important: keep Dockerfile.base Playwright image tag in sync with package.json playwright version

docker build --rm -f Dockerfile.base -t playwright/base .
docker build --progress=plain --rm -f Dockerfile -t playwright/server .

```

## Automated Build + Docker + Verify

Use the release script to run all steps in order:

1. Build project (`pnpm build`)
2. Build Docker base image (`Dockerfile.base`)
3. Build server image (`Dockerfile`)
4. Optionally push image to registry
5. Run app in Docker Desktop or locally
6. Verify with HTTP check + Playwright websocket connect

Command:

```bash
pnpm docker:release

# Equivalent direct command
pnpm exec tsx scripts/docker-build-push-run.ts
```

Examples:

```bash
# Interactive defaults (prompts for missing options)
pnpm docker:release

# Push to a custom registry
pnpm docker:release -- --push --registry ghcr.io/my-org --image playwright/server --tag 2.0.0

# Non-interactive run in Docker Desktop without pushing
pnpm docker:release -- --non-interactive --run-target dockerdesktop --no-push

# Verify using local Node runtime after build/docker build
pnpm docker:release -- --run-target local --no-push
```

Supported options:

- `--image <name>`: image name without tag (`playwright/server` by default)
- `--base-image <name>`: base image name (`playwright/base` by default)
- `--tag <tag>`: image tag (defaults to `package.json` version)
- `--registry <registry>`: registry prefix, e.g. `ghcr.io/my-org`
- `--push` / `--no-push`: enable or disable push step, when enabled image will be pushed to specified registry after build
- `--container-name <name>`: container name when `--run-target dockerdesktop`
- `--port <port>`: host port mapped to container port 3000
- `--run-target <dockerdesktop|local>`: where runtime verification happens
- `--non-interactive`: disable prompts and use defaults

Quick runtime verification with curl:

```bash
# If you used default container port mapping
curl -fsS http://127.0.0.1:3000/health

# If you used a custom port (example: 3010)
curl -fsS http://127.0.0.1:3010/health
```

Expected response:

```json
{ "status": "ok" }
```

## Debugging

For attaching the debugger use following docker-compose:

```
services:
  browser-test:
    image: playwright/server
    ports:
      - 3000:3000
      - 9229:9229
    command: npm run start-debug
```
