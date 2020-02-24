import { Browser } from '../browser';
import * as net from 'net';
import mockConsole from 'jest-mock-console';
import { EventListenerMock } from './utils';

describe('runBrowserServer', () => {
  beforeEach(async () => {
    mockConsole();
  });

  it('should return new end point', async () => {
    const browser = new Browser();
    const socket = new EventListenerMock<net.Socket>();
    const endPoint = await browser.launchServer('/chromium', socket);
    expect(endPoint).toBeDefined();
  });

  it('should close browser when socket closed', async () => {
    const browser = new Browser();
    const socket = new EventListenerMock<net.Socket>();
    const endPoint = await browser.launchServer('/chromium', socket);

    await socket.emit('close');

    expect(console.log).toHaveBeenCalledWith('chromium browser started.');
    expect(browser.instances[endPoint]).toBe(undefined);
  });

  it('should kill all browser', async () => {
    const browser = new Browser();
    const socket = new EventListenerMock<net.Socket>();
    await browser.launchServer('/chromium', socket);
    await browser.launchServer('/chromium', socket);
    expect(Object.keys(browser.instances).length).toBe(2);
    await browser.killAll();
    expect(browser.instances).toStrictEqual({});
  });
});
