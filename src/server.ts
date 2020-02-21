import { setProxy, killProxy } from './proxy';
import * as http from 'http';
import { runBrowserServer, killAllBrowserInstance } from './browser';

export const httpServer = http.createServer();

export const startHttpServer = () => {
  httpServer
    .on('upgrade', async (req, socket, head) => {
      const target = await runBrowserServer(socket);
      setProxy(req, socket, head, target);
    })
    .on('listening', () => {
      console.log('Server listening...');
    })
    .on('close', () => {
      console.log('http server closed');
    })
    .listen(3000);
};

export const shutdown = () => {
  process.removeAllListeners();
  killProxy();
  killAllBrowserInstance();
  httpServer.close();
  console.log('Successful shutdown');
  process.exit(0);
};

process.on('SIGINT', function() {
  shutdown();
});
