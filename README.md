# playwright-docker-server

Minimalistic docker image to run playwright server inside docker.

> Currently only works with chromium and playwright >= 0.11.0

## Build

```
npm run build

docker build --rm -f Dockerfile -t <image-name> .
```

## Update playwright

Update to latest playwright version:

```
docker build --rm -f Dockerfile.package -t <image-name> .
docker build --rm -f Dockerfile -t <image-name> .
```

Update to specific playwright version:

```
docker build --rm -f Dockerfile.package -t <image-name> .
docker build --rm -f Dockerfile -t <image-name> --build-arg  PLAYWRIGHT_VERSION=0.11.1 .
```

> To set nodejs --loglevel use NPM_LOGLEVEL variable

## Run

```
docker run -it --rm -p 3000:3000 -e <image_name>
```

### args:

- USE_ONCE

### USE_ONCE

Useful when only one job/socket required and docker need to be shutdown after job done.

```
docker run -it --rm -p 3000:3000 -e USE_ONCE=true  <image_name>
```
