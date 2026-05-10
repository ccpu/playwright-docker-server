import type * as net from 'node:net';
import { vi } from 'vitest';
import { BrowserServer } from '../browser';
import { BROWSER_SERVER_TIMEOUT } from '../constants';
import { EventListenerMock } from './utils';
import { mockConsole } from './utils/mock-console';

const GUID_REGEX = /(?:\w{4,12}-?){5}/u;

describe('runBrowserServer', () => {
  beforeEach(async () => {
    mockConsole();
  });

  it('should return new end point', async () => {
    const browser = new BrowserServer();
    const socket = new EventListenerMock<net.Socket>();
    const endPoint = await browser.launchServer('/chromium', socket);
    expect(endPoint).toBeDefined();
    await browser.killAll();
  }, 60000);

  it('should close browser when socket closed', async () => {
    const browser = new BrowserServer();
    const socket = new EventListenerMock<net.Socket>();
    const server = await browser.launchServer('/chromium', socket);

    await socket.emit('close');

    const endPoint = server.wsEndpoint();

    const guid = GUID_REGEX.exec(endPoint)?.[0];

    expect(console.warn).toHaveBeenCalledWith(`chromium launched (${guid}).`);
    expect(browser.instances[server.wsEndpoint()]).toBe(undefined);
  }, 60000);

  it('should kill all browser', async () => {
    const browser = new BrowserServer();
    const socket = new EventListenerMock<net.Socket>();
    await browser.launchServer('/chromium', socket);
    await browser.launchServer('/chromium', socket);
    expect(Object.keys(browser.instances).length).toBe(2);
    await browser.killAll();
    expect(browser.instances).toStrictEqual({});
  }, 60000);

  it(`should close browser if ${BROWSER_SERVER_TIMEOUT} has been set`, async () => {
    const browser = new BrowserServer();
    const spy = vi.spyOn(browser, 'kill');
    const socket = new EventListenerMock<net.Socket>();
    process.env[BROWSER_SERVER_TIMEOUT] = '1';
    await browser.launchServer('/chromium', socket);
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1200);
    });
    delete process.env[BROWSER_SERVER_TIMEOUT];
    expect(Object.keys(browser.instances).length).toBe(0);
    expect(spy).toHaveBeenCalledTimes(1);
  }, 60000);
});
