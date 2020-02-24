import { setProxy, killProxy } from './proxy';
import * as http from 'http';
import { Browser } from './browser';
import { TIME_OUT } from './constants';

export const httpServer = http.createServer();

const browser = new Browser();

export const startHttpServer = async () => {
  return new Promise((resolve, reject) => {
    httpServer
      .on('upgrade', async (req, socket, head) => {
        const target = await browser.launchServer(req.url, socket);
        setProxy(req, socket, head, target);
      })
      .on('listening', () => {
        console.log('Server listening...');
        resolve();
      })
      .on('close', () => {
        console.log('http server closed');
      })
      .on('error', err => {
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

process.on('SIGINT', function() {
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

startTimeOut(process.env[TIME_OUT] && Number.parseInt(process.env[TIME_OUT]));
