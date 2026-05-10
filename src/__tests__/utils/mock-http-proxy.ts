import { EventListenerMock } from './EventListener';

jest.mock('http-proxy', () => {
  class Proxy extends EventListenerMock<object> {
    close() {
      return this;
    }

    ws() {
      return this;
    }
  }

  return {
    createProxyServer: () => new Proxy(),
  };
});
export {};
