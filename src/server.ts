import { setProxy, killProxy } from './proxy';
import { createServer } from 'http';
import { BrowserServer } from './browser';
import { DOCKER_TIMEOUT } from './constants';
import { getPlaywrightVersion } from './utils';
import { Socket } from 'net';

export const httpServer = createServer();

const browser = new BrowserServer();

export const startHttpServer = async () => {
  return new Promise((resolve, reject) => {
    httpServer
      .on('upgrade', async (req, socket, head) => {
        const server = await browser.launchServer(req.url, socket as Socket);
        if (server) setProxy(req, socket as Socket, head, server.wsEndpoint());
      })
      .on('listening', () => {
        console.log(`Running playwright ${getPlaywrightVersion()}`);
        console.log('Server listening...');
        resolve(null);
      })
      .on('close', () => {
        console.log('http server closed');
      })
      .on('error', (err) => {
        console.error(err);
        reject(err);
      })
      .listen(3000);
  });
};

export const shutdown = async () => {
  try {
    killProxy();
    if (browser) await browser.killAll();
    if (httpServer) httpServer.close();
    console.log('Successful shutdown');
  } catch (error) {
    console.log(error);
  }
  process.removeAllListeners();
  if (!process.env.__TEST__) process.exit(0);
};

process.on('SIGINT', function () {
  shutdown();
});

export const startTimeOut = (timeout?: number) => {
  if (!timeout) return;
  const seconds = timeout * 1000;
  setTimeout(async () => {
    console.log('Timeout reached, shuting down the docker...');
    await shutdown();
  }, seconds);
  console.log('Will shutdown after ' + timeout + ' seconds.');
};

startTimeOut(
  process.env[DOCKER_TIMEOUT] && Number.parseInt(process.env[DOCKER_TIMEOUT]),
);
