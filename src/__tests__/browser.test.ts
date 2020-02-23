import { runBrowserServer } from '../browser';
import * as net from 'net';

class SocketMock extends net.Socket {
  on(_event: string, _listener: (...args: any[]) => void) {
    return this;
  }
}

describe('runBrowserServer', () => {
  it('should return new end point', () => {
    const endPoint = runBrowserServer('/chromium', new SocketMock());
    expect(endPoint).toBeDefined();
  });
});
