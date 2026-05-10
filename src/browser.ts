import type * as net from 'node:net';
import process from 'node:process';
import * as playwright from 'playwright';
import { BROWSER_SERVER_TIMEOUT } from './constants';
import { getBrowserType, getLaunchOptions } from './utils';

interface BrowserInstance {
  [endPoint: string]: {
    server: playwright.BrowserServer;
    timer?: NodeJS.Timeout;
    browserType: string;
    guid: string;
  };
}

const GUID_REGEX = /(?:\w{4,12}-?){5}/u;
const MILLISECONDS_IN_SECOND = 1000;
type LaunchServerOptions = Parameters<
  typeof playwright.chromium.launchServer
>[0];

class BrowserServer {
  instances: BrowserInstance = {};

  async launchServer(
    url: string,
    socket: net.Socket,
  ): Promise<playwright.BrowserServer> {
    const browserType = getBrowserType(url);

    console.warn(`\n\nLaunching ${browserType}...`);

    const server = await playwright[browserType].launchServer(
      getLaunchOptions(url) as LaunchServerOptions,
    );

    const endPoint = server.wsEndpoint();

    const guid = GUID_REGEX.exec(endPoint)?.[0] ?? endPoint;

    this.instances[endPoint] = {
      server,
      browserType,
      guid,
    };

    socket.on('close', () => {
      this.kill(server).catch((error: unknown) => {
        console.error(error);
      });
    });

    console.warn(`${browserType} launched (${guid}).`);

    const timeoutRaw = process.env[BROWSER_SERVER_TIMEOUT];
    const timeout =
      timeoutRaw !== undefined ? Number.parseInt(timeoutRaw, 10) : undefined;

    if (timeout !== undefined && Number.isFinite(timeout) && timeout > 0) {
      console.warn(`Browser will close in ${timeout} seconds.`);
    }

    this.checkForTimeout(server, timeout);
    return server;
  }

  getWsEndpoint(server: playwright.BrowserServer): string {
    return server.wsEndpoint();
  }

  checkForTimeout(server: playwright.BrowserServer, timeout?: number): void {
    if (timeout === undefined || timeout <= 0) {
      return;
    }
    const timeoutMs = timeout * MILLISECONDS_IN_SECOND;
    const instance = this.instances[server.wsEndpoint()];

    if (instance === undefined) {
      return;
    }

    instance.timer = setTimeout(() => {
      console.warn('Timeout reached, shuting down the browser server.');
      this.kill(server).catch((error: unknown) => {
        console.error(error);
      });
    }, timeoutMs);
  }

  async kill(server: playwright.BrowserServer): Promise<void> {
    const endPoint = server.wsEndpoint();
    // if instance is undefined it means already in process of terminating
    const instance = this.instances[endPoint];

    if (instance === undefined) {
      return;
    }

    const { browserType, guid, timer } = instance;

    if (timer !== undefined) {
      clearTimeout(timer);
    }

    console.warn(`Terminating ${browserType} (${guid}) ...`);
    delete this.instances[endPoint];
    await server.close();
    console.warn(`${browserType} terminated (${guid}).`);
  }

  async killAll(): Promise<void> {
    const allInstances = Object.values(this.instances);
    await Promise.all(
      allInstances.map(async ({ server }) => this.kill(server)),
    );
  }
}
export { BrowserServer };
