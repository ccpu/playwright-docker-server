import './utils/http-mock';
import * as httpServer from '../server';

import mockConsole from 'jest-mock-console';

describe('server', () => {
  afterEach(async () => {
    await httpServer.shutdown();
  });

  beforeEach(() => {
    mockConsole();
    jest.useFakeTimers();
  });

  it('should server defined ', () => {
    expect(httpServer.startHttpServer).toBeDefined();
    expect(httpServer.httpServer).toBeDefined();
  });

  it('should start server and get message', async () => {
    await httpServer.startHttpServer();
    expect(console.log).toHaveBeenCalledWith('Server listening...');
  });

  it('should shutdown on specified time', async () => {
    const mockFn = spyOn(httpServer, 'shutdown');
    httpServer.startTimeOut(10);
    expect(console.log).toHaveBeenCalledWith('Will shutdown after 10 seconds.');
    jest.runAllTimers();
    expect(mockFn).toBeCalledTimes(1);
  });
});
