import { startHttpServer, httpServer, shutdown } from '../server';
import mockConsole from 'jest-mock-console';

describe('server', () => {
  afterEach(() => {
    shutdown();
  });

  it('should server defined ', () => {
    expect(startHttpServer).toBeDefined();
    expect(httpServer).toBeDefined();
  });
  it('should start server and get message', async () => {
    mockConsole();
    await startHttpServer();
    expect(console.log).toHaveBeenCalledWith('Server listening...');
  });
  it('should start server and get message', async () => {
    mockConsole();
    await startHttpServer();
    expect(console.log).toHaveBeenCalledWith('Server listening...');
  });
});
