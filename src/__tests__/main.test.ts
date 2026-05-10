import { vi } from 'vitest';

import { proxy } from '../proxy';
import { httpServer, startHttpServer } from '../server';
import { mockConsole } from './utils/mock-console';
import '../main';

vi.mock('../server', async () => {
  const actual = await vi.importActual<typeof import('../server')>('../server');

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
