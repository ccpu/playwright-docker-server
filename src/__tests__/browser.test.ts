import { BrowserServer } from '../browser';
import * as net from 'net';
import mockConsole from 'jest-mock-console';
import { EventListenerMock } from './utils';
import { BROWSER_SERVER_TIMEOUT } from '../constants';

describe('runBrowserServer', () => {
  beforeEach(async () => {
    mockConsole();
  });

  it('should return new end point', async () => {
    const browser = new BrowserServer();
    const socket = new EventListenerMock<net.Socket>();
    const endPoint = await browser.launchServer('/chromium', socket);
    expect(endPoint).toBeDefined();
  });

  it('should close browser when socket closed', async () => {
    const browser = new BrowserServer();
    const socket = new EventListenerMock<net.Socket>();
    const server = await browser.launchServer('/chromium', socket);

    await socket.emit('close');

    const endPoint = server.wsEndpoint();

    const guid = /((\w{4,12}-?)){5}/.exec(endPoint)[0];

    expect(console.log).toHaveBeenCalledWith(`chromium launched (${guid}).`);
    expect(browser.instances[server.wsEndpoint()]).toBe(undefined);
  });

  it('should kill all browser', async () => {
    const browser = new BrowserServer();
    const socket = new EventListenerMock<net.Socket>();
    await browser.launchServer('/chromium', socket);
    await browser.launchServer('/chromium', socket);
    expect(Object.keys(browser.instances).length).toBe(2);
    await browser.killAll();
    expect(browser.instances).toStrictEqual({});
  });

  it(
    'should close browser if ' + BROWSER_SERVER_TIMEOUT + ' has been set',
    async () => {
      jest.useFakeTimers();
      const browser = new BrowserServer();
      const spy = jest.spyOn(browser, 'kill');
      const socket = new EventListenerMock<net.Socket>();
      process.env[BROWSER_SERVER_TIMEOUT] = '1';
      await browser.launchServer('/chromium', socket);
      jest.runAllTimers();
      delete process.env[BROWSER_SERVER_TIMEOUT];
      expect(Object.keys(browser.instances).length).toBe(0);
      expect(spy).toHaveBeenCalledTimes(1);
    },
  );
});
