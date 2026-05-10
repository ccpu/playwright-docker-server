import type { Buffer } from 'node:buffer';
import type { IncomingMessage } from 'node:http';
import type { Socket } from 'node:net';
import process from 'node:process';
import { createProxyServer } from 'http-proxy';
import { USE_ONCE } from './constants';
import { shutdown } from './server';

export const proxy = createProxyServer({ ignorePath: true });

export function setProxy(
  req: IncomingMessage,
  socket: Socket,
  head: Buffer,
  target: string,
): typeof proxy {
  proxy.ws(req, socket, head, { target });
  return proxy;
}

export function killProxy(): void {
  proxy.removeAllListeners();
  proxy.close();
}

proxy.on('error', (err: Error, _req, res: unknown) => {
  console.warn(`Issue communicating with browser: "${err.message}"`);

  if (res !== null && typeof res === 'object') {
    const httpResponse = res as {
      writeHead?: (statusCode: number, headers: Record<string, string>) => void;
      end?: (message: string) => void;
    };

    httpResponse.writeHead?.(500, { 'Content-Type': 'text/plain' });
    httpResponse.end?.('Issue communicating with browser');
  }
});

proxy.on('close', () => {
  if (process.env[USE_ONCE] === 'true') {
    shutdown().catch((error: unknown) => {
      console.error(error);
    });
  }
});
