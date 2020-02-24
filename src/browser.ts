import * as net from 'net';
import * as playwright from 'playwright-core';
import { getBrowserType, getLaunchOptions } from './utils';

interface BrowserInstance {
  [endPoint: string]: playwright.BrowserServer;
}

class Browser {
  instances: BrowserInstance = {};
  async launchServer(url: string, socket: net.Socket) {
    const browserType = getBrowserType(url);

    console.log(browserType + ' browser started.');

    const browser = await playwright[browserType].launchServer(
      getLaunchOptions(url),
    );

    const endPoint = browser.wsEndpoint();
    this.instances[endPoint] = browser;

    socket.on('close', async () => {
      await browser.close();
      delete this.instances[endPoint];
      console.log(browserType + ' browser terminated.');
    });

    return endPoint;
  }
  async killAll() {
    const { instances } = this;
    const keys = Object.keys(instances);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const browser = instances[key];
      await browser.close();
      delete instances[key];
    }
  }
}
export { Browser };
