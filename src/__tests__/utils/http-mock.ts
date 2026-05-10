import { EventListenerMock } from './EventListener';

jest.mock('http', () => {
  class Proxy extends EventListenerMock<object> {
    createServer() {
      return this;
    }

    listen() {
      this.emit('listening').catch(() => {
        // ignore mock event errors in tests
      });
      return this;
    }

    on(ev: string) {
      this.emit(ev).catch(() => {
        // ignore mock event errors in tests
      });
      return this;
    }
  }
  return new Proxy();
});
export {};
