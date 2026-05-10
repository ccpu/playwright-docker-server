import mockConsole from 'jest-mock-console';

import { proxy } from '../proxy';
import { httpServer, startHttpServer } from '../server';
import '../main';

jest.mock('../server', () => {
  const actual = jest.requireActual('../server');

  return {
    ...actual,
    startHttpServer: jest.fn().mockResolvedValue(undefined),
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
