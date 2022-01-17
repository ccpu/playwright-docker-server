import { EventListenerMock } from './EventListener';
jest.mock('http', () => {
  class Proxy extends EventListenerMock<{}> {
    createServer() {
      return this;
    }
    listen() {
      this.emit('listening');
      return this;
    }
    on(ev: string) {
      this.emit(ev);
      return this;
    }
  }
  return new Proxy();
});
export {};
