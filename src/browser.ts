import * as net from 'net';
import * as playwright from 'playwright-core';
import { getBrowserType, getLaunchOptions } from './utils';

interface BrowserInstance {
  [endPoint: string]: playwright.BrowserServer;
}

const browserInstances: BrowserInstance = {};

export const runBrowserServer = async (url: string, socket: net.Socket) => {
  const browserType = getBrowserType(url);

  console.log(browserType + ' browser started.');

  const browser = await playwright[browserType].launchServer(
    getLaunchOptions(url),
  );

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
