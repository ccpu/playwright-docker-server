import { EventListenerMock } from './EventListener';
jest.mock('http-proxy', () => {
  class Proxy extends EventListenerMock<{}> {
    createProxyServer() {
      return this;
    }
    ws() {
      return this;
    }
  }
  return new Proxy();
});
export {};
