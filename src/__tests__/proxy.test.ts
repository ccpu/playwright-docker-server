import { Buffer } from 'node:buffer';
import { IncomingMessage } from 'node:http';
import { Socket } from 'node:net';
import { vi } from 'vitest';
import { USE_ONCE } from '../constants';
import { setProxy } from '../proxy';
import * as server from '../server';
import { mockConsole } from './utils/mock-console';

vi.mock('httpxy', () => {
  class ProxyMock {
    private events: Record<string, (...args: unknown[]) => void> = {};

    close(): this {
      return this;
    }

    emit(event: string, ...args: unknown[]): void {
      const listener = this.events[event];
      listener?.(...args);
    }

    on(event: string, listener: (...args: unknown[]) => void): this {
      this.events[event] = listener;
      return this;
    }

    removeAllListeners(): this {
      this.events = {};
      return this;
    }

    ws(): this {
      return this;
    }
  }

  return {
    createProxyServer: () => new ProxyMock(),
  };
});

describe('proxy', () => {
  function makeRequest(): IncomingMessage {
    return new IncomingMessage(new Socket());
  }

  beforeEach(() => {
    mockConsole();
  });

  it('should have proxy ', () => {
    const socket = new Socket();
    const request = makeRequest();
    setProxy(request, socket, Buffer.alloc(0), 'ws://locale');
  });

  it('should handle use_once', async () => {
    const spy = vi.spyOn(server, 'shutdown').mockResolvedValue(undefined);
    const socket = new Socket();
    const request = makeRequest();
    process.env[USE_ONCE] = 'true';
    const proxy = setProxy(request, socket, Buffer.alloc(0), 'ws://locale');

    proxy.emit('close', request, socket, Buffer.alloc(0));
    delete process.env[USE_ONCE];
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should handle error', async () => {
    const socket = new Socket();
    const request = makeRequest();
    const proxy = setProxy(request, socket, Buffer.alloc(0), 'ws://locale');
    proxy.emit('error', new Error('some-error'), request, undefined);
    expect(console.warn).toHaveBeenCalledWith(
      'Issue communicating with browser: "some-error"',
    );
  });
});
