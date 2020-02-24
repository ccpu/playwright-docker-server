import * as server from '../server';

import mockConsole from 'jest-mock-console';

describe('server', () => {
  afterEach(async () => {
    await server.shutdown();
  });

  beforeEach(() => {
    mockConsole();
    jest.useFakeTimers();
  });

  it('should server defined ', () => {
    expect(server.startHttpServer).toBeDefined();
    expect(server.httpServer).toBeDefined();
  });
  it('should start server and get message', async () => {
    await server.startHttpServer();
    expect(console.log).toHaveBeenCalledWith('Server listening...');
  });
  it('should start server and get message', async () => {
    await server.startHttpServer();
    expect(console.log).toHaveBeenCalledWith('Server listening...');
  });

  it('should shutdown on specified time', async () => {
    const mockFn = spyOn(server, 'shutdown');
    server.startTimeOut(10);
    expect(console.log).toHaveBeenCalledWith('Will shutdown after 10 seconds.');
    jest.runAllTimers();
    expect(mockFn).toBeCalledTimes(1);
  });
});
