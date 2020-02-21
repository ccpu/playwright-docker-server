import * as net from 'net';
import * as playwright from 'playwright-core';
import { IncomingMessage } from 'http';
import { getBrowserType } from './utils';

interface BrowserInstance {
  [endPoint: string]: playwright.BrowserServer;
}

const browserInstances: BrowserInstance = {};

export const runBrowserServer = async (
  req: IncomingMessage,
  socket: net.Socket,
) => {
  const browserType = getBrowserType(req);

  console.log(browserType + ' browser started.');

  const browser = await playwright[browserType].launchServer({
    args: ['--no-sandbox'],
  });

  const endPoint = browser.wsEndpoint();
  browserInstances[endPoint] = browser;

  socket.on('close', async () => {
    console.log(browserType + ' browser terminated.');
    await browser.close();
    delete browserInstances[endPoint];
  });

  return endPoint;
};

export const killAllBrowserInstance = () => {
  Object.keys(browserInstances).forEach(key => {
    const browser = browserInstances[key];
    browser.close();
  });
};
