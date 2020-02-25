import * as net from 'net';
import * as playwright from 'playwright-core';
import { getBrowserType, getLaunchOptions } from './utils';
import { BROWSER_SERVER_TIMEOUT } from './constants';

interface BrowserInstance {
  [endPoint: string]: {
    server: playwright.BrowserServer;
    timer?: any;
    browserType: string;
  };
}

class BrowserServer {
  instances: BrowserInstance = {};
  async launchServer(url: string, socket: net.Socket) {
    const browserType = getBrowserType(url);

    const server = await playwright[browserType].launchServer(
      getLaunchOptions(url),
    );

    const endPoint = server.wsEndpoint();
    this.instances[endPoint] = { server, browserType };

    socket.on('close', async () => {
      await this.kill(server);
    });

    console.log(browserType + ' browser started.');

    const timeout =
      process.env[BROWSER_SERVER_TIMEOUT] &&
      Number.parseInt(process.env[BROWSER_SERVER_TIMEOUT]);

    if (timeout) {
      console.log('Browser will close in ' + timeout + ' seconds.');
    }

    this.checkForTimeout(server, timeout);
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

    this.instances[server.wsEndpoint()].timer = setTimeout(() => {
      console.log('Timeout reached, shuting down the browser server.');
      this.kill(server);
    }, timeout);
  }

  async kill(server: playwright.BrowserServer) {
    const endPoint = server.wsEndpoint();
    //if instance is undefined it means already in process of terminating
    if (!this.instances[endPoint]) return;
    const { browserType } = this.instances[endPoint];
    clearTimeout(this.instances[endPoint].timer);
    console.log(`Terminating ${browserType} browser...`);
    delete this.instances[endPoint];
    await server.close();
    console.log(`Browser terminated.`);
  }

  async killAll() {
    const { instances } = this;
    const keys = Object.keys(instances);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const info = instances[key];
      await this.kill(info.server);
    }
  }
}
export { BrowserServer };
