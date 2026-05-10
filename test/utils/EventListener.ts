interface SocketMockEvents {
  [key: string]: (...args: unknown[]) => void | Promise<void>;
}

class GenericEventListener {
  allEvents: SocketMockEvents = {};
  destroyed = false;

  destroy(): void {
    this.destroyed = true;
  }

  on(_event: string, _listener: (...args: unknown[]) => void): this {
    if (!this.allEvents) this.allEvents = {};
    this.allEvents[_event] = _listener;
    return this;
  }

  async emit(event: string, ...args: unknown[]): Promise<void> {
    const listener = this.allEvents[event];
    if (listener !== undefined) {
      await listener(...args);
    }
  }
}

interface EventListenerMockConstructor {
  new <T>(data?: T): GenericEventListener & T;
}

const EventListenerMock =
  GenericEventListener as unknown as EventListenerMockConstructor;

export { EventListenerMock };
