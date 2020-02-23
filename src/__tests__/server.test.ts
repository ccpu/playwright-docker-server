import { startHttpServer, httpServer } from '../server';
import mockConsole from 'jest-mock-console';

describe('server', () => {
  it('should server defined ', () => {
    expect(startHttpServer).toBeDefined();
    expect(httpServer).toBeDefined();
  });
  it('should start server', () => {
    mockConsole();
    expect(console.log).toHaveBeenCalled();
  });
});
