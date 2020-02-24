import './utils/mock-http-proxy';
import { EventListenerMock } from './utils';
import mockConsole from 'jest-mock-console';
import * as server from '../server';
import { setProxy } from '../proxy';
import { Socket } from 'net';
import { IncomingMessage, IncomingHttpHeaders } from 'http';
import { USE_ONCE } from '../constants';

describe('proxy', () => {
  beforeEach(() => {
    mockConsole();
  });

  it('should have proxy ', () => {
    const socket = new EventListenerMock<Socket>();
    setProxy(
      {} as IncomingMessage,
      socket,
      {} as IncomingHttpHeaders,
      'ws://locale',
    );
  });

  it('should handle use_once', async () => {
    const spy = jest.spyOn(server, 'shutdown');
    const socket = new EventListenerMock<Socket>();
    process.env[USE_ONCE] = 'true';
    const proxy = setProxy(
      {} as IncomingMessage,
      socket,
      {} as IncomingHttpHeaders,
      'ws://locale',
    );

    await proxy.emit('close');
    delete process.env[USE_ONCE];
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should handle error', async () => {
    const socket = new EventListenerMock<Socket>();
    const proxy = setProxy(
      {} as IncomingMessage,
      socket,
      {} as IncomingHttpHeaders,
      'ws://locale',
    );
    await proxy.emit('error', { message: 'some-error' }, {}, { end: () => {} });
    expect(console.log).toHaveBeenCalledWith(
      'Issue communicating with browser: "some-error"',
    );
  });
});
