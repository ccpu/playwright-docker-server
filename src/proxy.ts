import { IncomingMessage, IncomingHttpHeaders } from 'http';
import { Socket } from 'net';
import * as httpProxy from 'http-proxy';
import { shutdown } from './server';
import { USE_ONCE } from './constants';

export const proxy = httpProxy.createProxyServer({ ignorePath: true });

export const setProxy = (
  req: IncomingMessage,
  socket: Socket,
  head: IncomingHttpHeaders,
  target: string,
) => {
  proxy.ws(req, socket, head, { target });
  return proxy;
};

export const killProxy = () => {
  if (!proxy) return;
  proxy.removeAllListeners();
  proxy.close();
};

proxy.on('error', (err: Error, _req, res) => {
  console.log(`Issue communicating with browser: "${err.message}"`);
  res.writeHead && res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end(`Issue communicating with browser`);
});

proxy.on('close', () => {
  if (process.env[USE_ONCE] === 'true') shutdown();
});
