import { proxy } from '../proxy';
import { httpServer } from '../server';
import mockConsole from 'jest-mock-console';
import '../main';

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
});
