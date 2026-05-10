import { vi } from 'vitest';
import * as httpServer from '../src/server';
import { mockConsole } from './utils/mock-console';

vi.mock('node:http', () => {
  class HttpServerMock {
    private allEvents: Record<string, (...args: unknown[]) => void> = {};
    private currentPort = 3000;

    on(event: string, listener: (...args: unknown[]) => void): this {
      this.allEvents[event] = listener;
      return this;
    }

    address(): { address: string; family: string; port: number } {
      return {
        address: '127.0.0.1',
        family: 'IPv4',
        port: this.currentPort,
      };
    }

    private emit(event: string): void {
      this.allEvents[event]?.();
    }

    close() {
      this.emit('close');
      return this;
    }

    listen(port?: number) {
      if (typeof port === 'number') {
        this.currentPort = port;
      }

      this.emit('listening');
      return this;
    }
  }

  return {
    createServer: () => new HttpServerMock(),
  };
});

describe('server', () => {
  beforeEach(() => {
    mockConsole();
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await httpServer.shutdown();
  });

  it('should server defined ', () => {
    expect(httpServer.startHttpServer).toBeDefined();
    // expect(httpServer.httpServer).toBeDefined();
  });

  it('should start server and get message', async () => {
    await httpServer.startHttpServer();
    expect(console.warn).toHaveBeenCalledWith('Server listening on port 3000');
    expect(console.warn).toHaveBeenCalledWith('Health endpoints: /, /health');
    expect(console.warn).toHaveBeenCalledWith(
      'Open http://localhost:3000/ or http://localhost:3000/health',
    );
  });

  it('should shutdown on specified time', async () => {
    httpServer.startTimeOut(10);
    expect(console.warn).toHaveBeenCalledWith(
      'Will shutdown after 10 seconds.',
    );
    vi.runAllTimers();
    await Promise.resolve();
    expect(console.warn).toHaveBeenCalledWith(
      'Timeout reached, shuting down the docker...',
    );
  });
});
