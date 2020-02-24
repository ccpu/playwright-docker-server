import { EventListenerMock } from './utils';
import mockConsole from 'jest-mock-console';

jest.mock('http-proxy', () => {
  class Proxy extends EventListenerMock<any> {
    createProxyServer() {
      return this;
    }
    // on() {return this}
    ws() {}
  }

  return new Proxy();
});

import { setProxy } from '../proxy';
import { Socket } from 'net';
import { IncomingMessage, IncomingHttpHeaders } from 'http';

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

  it('should handle error', () => {
    const socket = new EventListenerMock<Socket>();
    setProxy(
      {} as IncomingMessage,
      socket,
      {} as IncomingHttpHeaders,
      'ws://locale',
    );
    socket.emit('error', 'someError');
    expect(console.log).toHaveBeenCalledWith('');
  });
});
