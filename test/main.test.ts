import { vi } from 'vitest';

import { proxy } from '../src/proxy';
import { httpServer, startHttpServer } from '../src/server';
import { mockConsole } from './utils/mock-console';
import '../src/main';

vi.mock('../src/server', async () => {
  const actual =
    await vi.importActual<typeof import('../src/server')>('../src/server');

  return {
    ...actual,
    startHttpServer: vi.fn().mockResolvedValue(undefined),
  };
});

describe('main', () => {
  beforeEach(() => {
    mockConsole();
  });

  it('should proxy be defined', () => {
    expect(proxy).toBeDefined();
  });

  it('should httpServer be defined', () => {
    expect(httpServer).toBeDefined();
  });

  it('should start server on startup', () => {
    expect(startHttpServer).toHaveBeenCalledTimes(1);
  });
});
