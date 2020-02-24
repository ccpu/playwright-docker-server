type SocketMockEvents = { [key: string]: (args: any) => void | Promise<void> };

class GenericEventListener {
  allEvents: SocketMockEvents = {};
  on(_event: string, _listener: (...args: any[]) => void) {
    if (!this.allEvents) this.allEvents = {};
    this.allEvents[_event] = _listener;
    return this;
  }
  async emit(event: string, ...args) {
    // @ts-ignore
    await this.allEvents[event](...args);
  }
}

type GenericExtend<T> = GenericEventListener & T;

const EventListenerMock: new <T>(data?: T) => GenericExtend<
  T
> = GenericEventListener as any;

export { EventListenerMock };
