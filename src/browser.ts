import * as net from 'net';
import * as playwright from 'playwright-core';
import { getBrowserType, getLaunchOptions } from './utils';
import { BROWSER_SERVER_TIMEOUT } from './constants';

interface BrowserInstance {
  [endPoint: string]: playwright.BrowserServer;
}

class BrowserServer {
  instances: BrowserInstance = {};
  async launchServer(url: string, socket: net.Socket) {
    const browserType = getBrowserType(url);

    console.log(browserType + ' browser started.');

    const server = await playwright[browserType].launchServer(
      getLaunchOptions(url),
    );

    const endPoint = server.wsEndpoint();
    this.instances[endPoint] = server;

    socket.on('close', async () => {
      await server.close();
      delete this.instances[endPoint];
      console.log(browserType + ' browser terminated.');
    });
    this.checkForTimeout(
      server,
      process.env[BROWSER_SERVER_TIMEOUT] &&
        Number.parseInt(process.env[BROWSER_SERVER_TIMEOUT]),
    );
    return server;
  }

  getWsEndpoint(server: playwright.BrowserServer) {
    return server.wsEndpoint();
  }

  checkForTimeout(server: playwright.BrowserServer, timeout?: number) {
    if (!timeout) {
      return;
    }
    timeout = timeout * 1000;

    setTimeout(() => {
      console.log('Timeout reached, shuting down the browser server.');
      this.kill(server);
    }, timeout);
  }

  async kill(server: playwright.BrowserServer) {
    const endPoint = server.wsEndpoint();
    delete this.instances[endPoint];
    await server.close();
  }

  async killAll() {
    const { instances } = this;
    const keys = Object.keys(instances);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const server = instances[key];
      await this.kill(server);
    }
  }
}
export { BrowserServer };
