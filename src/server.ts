import { setProxy, killProxy } from './proxy';
import * as http from 'http';
import { runBrowserServer, killAllBrowserInstance } from './browser';
import { TIME_OUT } from './constants';

export const httpServer = http.createServer();

export const startHttpServer = async () => {
  return new Promise((resolve, reject) => {
    httpServer
      .on('upgrade', async (req, socket, head) => {
        const target = await runBrowserServer(req.url, socket);
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

export const shutdown = () => {
  process.removeAllListeners();
  killProxy();
  killAllBrowserInstance();
  httpServer.close();
  console.log('Successful shutdown');
  if (!process.env.__TEST__) process.exit(0);
};

process.on('SIGINT', function() {
  shutdown();
});

if (process.env[TIME_OUT]) {
  const seconds = Number.parseInt(process.env[TIME_OUT]) * 1000;
  setTimeout(() => {
    console.log('Timeout reached, shuting down the docker...');
    shutdown();
  }, seconds);
  console.log('Will shutdown after ' + process.env[TIME_OUT] + ' seconds.');
}
