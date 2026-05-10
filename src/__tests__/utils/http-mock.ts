import { vi } from 'vitest';

vi.mock('node:http', () => {
  class HttpServerMock {
    private allEvents: Record<string, (...args: unknown[]) => void> = {};

    on(event: string, listener: (...args: unknown[]) => void): this {
      this.allEvents[event] = listener;
      return this;
    }

    private emit(event: string): void {
      this.allEvents[event]?.();
    }

    close() {
      this.emit('close');
      return this;
    }

    listen() {
      this.emit('listening');
      return this;
    }
  }

  return {
    createServer: () => new HttpServerMock(),
  };
});
export {};
