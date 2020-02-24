import { EventListenerMock } from './utils';

jest.mock('http-proxy', () => {
  class Proxy extends EventListenerMock<any> {
    createProxyServer() {
      return this;
    }
    on() {}
    ws() {}
  }

  return new Proxy();
});

import { setProxy } from '../proxy';
import { Socket } from 'net';
import { IncomingMessage, IncomingHttpHeaders } from 'http';

describe('proxy', () => {
  it('should have proxy', () => {
    const socket = new EventListenerMock<Socket>();
    setProxy(
      {} as IncomingMessage,
      socket,
      {} as IncomingHttpHeaders,
      'ws://locale',
    );
  });
});
