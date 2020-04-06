import * as net from 'net';
import * as playwright from 'playwright';
import { getBrowserType, getLaunchOptions } from './utils';
import { BROWSER_SERVER_TIMEOUT } from './constants';

interface BrowserInstance {
  [endPoint: string]: {
    server: playwright.BrowserServer;
    timer?: any;
    browserType: string;
    guid: string;
  };
}

class BrowserServer {
  instances: BrowserInstance = {};
  async launchServer(url: string, socket: net.Socket) {
    const browserType = getBrowserType(url);

    console.log(`\n\nLaunching ${browserType}...`);

    const server = await playwright[browserType].launchServer(
      getLaunchOptions(url),
    );

    if (!server) return null;

    const endPoint = server.wsEndpoint();

    const guid = /((\w{4,12}-?)){5}/.exec(endPoint)[0];

    this.instances[endPoint] = {
      server,
      browserType,
      guid,
    };

    socket.on('close', async () => {
      await this.kill(server);
    });

    console.log(`${browserType} launched (${guid}).`);

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
    const { browserType, guid } = this.instances[endPoint];
    clearTimeout(this.instances[endPoint].timer);
    console.log(`Terminating ${browserType} (${guid}) ...`);
    delete this.instances[endPoint];
    await server.close();
    console.log(`${browserType} terminated (${guid}).`);
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
