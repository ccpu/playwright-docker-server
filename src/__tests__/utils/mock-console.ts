import { vi } from 'vitest';

function noop(): void {
  // no-op
}

export function mockConsole(): void {
  vi.spyOn(console, 'log').mockImplementation(noop);
  vi.spyOn(console, 'debug').mockImplementation(noop);
  vi.spyOn(console, 'info').mockImplementation(noop);
  vi.spyOn(console, 'warn').mockImplementation(noop);
  vi.spyOn(console, 'error').mockImplementation(noop);
}
