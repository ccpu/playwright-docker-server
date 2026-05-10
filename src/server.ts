import type { ServerResponse } from 'node:http';
import type { Socket } from 'node:net';
import { createServer } from 'node:http';
import process from 'node:process';
import { BrowserServer } from './browser';
import { DOCKER_TIMEOUT } from './constants';
import { killProxy, setProxy } from './proxy';
import { getPlaywrightVersion } from './utils';

export const httpServer = createServer();

const browser = new BrowserServer();
const TEST_ENV_KEY = '__TEST__';
const DEFAULT_HTTP_PORT = 3000;
const MILLISECONDS_IN_SECOND = 1000;
const HTTP_OK_STATUS = 200;
const HTTP_NOT_FOUND_STATUS = 404;

function setHealthResponse(url: string | undefined, res: ServerResponse): void {
  if (url === '/' || url === '/health') {
    res.writeHead(HTTP_OK_STATUS, {
      'Content-Type': 'application/json; charset=utf-8',
    });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(HTTP_NOT_FOUND_STATUS, {
    'Content-Type': 'text/plain; charset=utf-8',
  });
  res.end('Not Found');
}

export async function startHttpServer(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    httpServer
      .on('request', (req, res) => {
        setHealthResponse(req.url, res);
      })
      .on('upgrade', (req, socket, head) => {
        (async () => {
          const server = await browser.launchServer(
            req.url ?? '',
            socket as Socket,
          );
          setProxy(req, socket as Socket, head, server.wsEndpoint());
        })().catch((error: unknown) => {
          console.error(error);
        });
      })
      .on('listening', () => {
        console.warn(`Running playwright ${getPlaywrightVersion()}`);
        console.warn('Server listening...');
        resolve();
      })
      .on('close', () => {
        console.warn('http server closed');
      })
      .on('error', (err) => {
        console.error(err);
        reject(err);
      })
      .listen(DEFAULT_HTTP_PORT);
  });
}

export async function shutdown(): Promise<void> {
  try {
    killProxy();
    await browser.killAll();
    httpServer.close();
    console.warn('Successful shutdown');
  } catch (error) {
    console.error(error);
  }

  process.removeAllListeners();
  if (process.env[TEST_ENV_KEY] !== 'true') {
    process.exit(0);
  }
}

process.on('SIGINT', () => {
  shutdown().catch((error: unknown) => {
    console.error(error);
  });
});

export function startTimeOut(timeout?: number): void {
  if (timeout === undefined || timeout <= 0) {
    return;
  }

  const milliseconds = timeout * MILLISECONDS_IN_SECOND;
  setTimeout(() => {
    console.warn('Timeout reached, shuting down the docker...');
    shutdown().catch((error: unknown) => {
      console.error(error);
    });
  }, milliseconds);

  console.warn(`Will shutdown after ${timeout} seconds.`);
}

const timeoutEnv = process.env[DOCKER_TIMEOUT];
const timeout =
  timeoutEnv !== undefined ? Number.parseInt(timeoutEnv, 10) : undefined;
startTimeOut(timeout);
