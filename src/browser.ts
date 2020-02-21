import * as net from 'net';
import * as playwright from 'playwright-core';

interface BrowserInstance {
  [endPoint: string]: playwright.BrowserServer;
}

const browserInstances: BrowserInstance = {};

export const runBrowserServer = async (socket: net.Socket) => {
  const browser = await playwright.chromium.launchServer({
    args: ['--no-sandbox'],
  });

  const endPoint = browser.wsEndpoint();
  browserInstances[endPoint] = browser;

  socket.on('close', async () => {
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
