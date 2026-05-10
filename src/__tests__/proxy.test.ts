import type { Buffer } from 'node:buffer';
import type { IncomingMessage } from 'node:http';
import type { Socket } from 'node:net';
import mockConsole from 'jest-mock-console';
import { USE_ONCE } from '../constants';
import { setProxy } from '../proxy';
import * as server from '../server';
import { EventListenerMock } from './utils';

jest.mock('http-proxy', () => {
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
  beforeEach(() => {
    mockConsole();
  });

  it('should have proxy ', () => {
    const socket = new EventListenerMock<Socket>();
    setProxy({} as IncomingMessage, socket, {} as Buffer, 'ws://locale');
  });

  it('should handle use_once', async () => {
    const spy = jest.spyOn(server, 'shutdown').mockResolvedValue(undefined);
    const socket = new EventListenerMock<Socket>();
    process.env[USE_ONCE] = 'true';
    const proxy = setProxy(
      {} as IncomingMessage,
      socket,
      {} as Buffer,
      'ws://locale',
    );

    proxy.emit('close');
    delete process.env[USE_ONCE];
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should handle error', async () => {
    const socket = new EventListenerMock<Socket>();
    const proxy = setProxy(
      {} as IncomingMessage,
      socket,
      {} as Buffer,
      'ws://locale',
    );
    proxy.emit('error', { message: 'some-error' }, {}, { end: () => {} });
    expect(console.warn).toHaveBeenCalledWith(
      'Issue communicating with browser: "some-error"',
    );
  });
});
