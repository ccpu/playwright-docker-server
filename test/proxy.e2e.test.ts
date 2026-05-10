import type { Server as HttpServer } from 'node:http';
import type { AddressInfo, Socket } from 'node:net';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import { setProxy } from '../src/proxy';

function getPort(server: HttpServer): number {
  const address = server.address() as AddressInfo | null;

  if (address === null || typeof address.port !== 'number') {
    throw new Error('Server has no bound port');
  }

  return address.port;
}

async function closeServer(server: HttpServer): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error?: Error) => {
      if (error !== undefined) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

describe('proxy e2e', () => {
  let upstreamHttpServer: HttpServer;
  let upstreamWsServer: WebSocketServer;
  let proxyHttpServer: HttpServer;

  beforeEach(async () => {
    upstreamHttpServer = createServer();
    upstreamWsServer = new WebSocketServer({ noServer: true });

    upstreamWsServer.on('connection', (socket) => {
      socket.on('message', (message) => {
        socket.send(`echo:${message.toString()}`);
      });
    });

    upstreamHttpServer.on('upgrade', (request, socket, head) => {
      upstreamWsServer.handleUpgrade(request, socket, head, (webSocket) => {
        upstreamWsServer.emit('connection', webSocket, request);
      });
    });

    upstreamHttpServer.listen(0);
    await once(upstreamHttpServer, 'listening');

    proxyHttpServer = createServer();
    proxyHttpServer.on('upgrade', (request, socket, head) => {
      const upstreamTarget = `ws://127.0.0.1:${getPort(upstreamHttpServer)}`;
      setProxy(request, socket as Socket, head, upstreamTarget);
    });

    proxyHttpServer.listen(0);
    await once(proxyHttpServer, 'listening');
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => {
      upstreamWsServer.close(() => resolve());
    });

    await Promise.all([
      closeServer(upstreamHttpServer),
      closeServer(proxyHttpServer),
    ]);
  });

  it('should proxy websocket traffic end-to-end', async () => {
    const proxyPort = getPort(proxyHttpServer);
    const client = new WebSocket(`ws://127.0.0.1:${proxyPort}`);

    await once(client, 'open');

    const echoedMessage = new Promise<string>((resolve, reject) => {
      client.once('message', (data) => {
        resolve(data.toString());
      });
      client.once('error', (error) => {
        reject(error);
      });
    });

    client.send('ping');
    await expect(echoedMessage).resolves.toBe('echo:ping');

    client.close();
    await once(client, 'close');
  });
});
