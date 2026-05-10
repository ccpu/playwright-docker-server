import mockConsole from 'jest-mock-console';
import * as httpServer from '../server';
import './utils/http-mock';

describe('server', () => {
  beforeEach(() => {
    mockConsole();
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await httpServer.shutdown();
  });

  it('should server defined ', () => {
    expect(httpServer.startHttpServer).toBeDefined();
    // expect(httpServer.httpServer).toBeDefined();
  });

  it('should start server and get message', async () => {
    await httpServer.startHttpServer();
    expect(console.warn).toHaveBeenCalledWith('Server listening...');
  });

  it('should shutdown on specified time', async () => {
    httpServer.startTimeOut(10);
    expect(console.warn).toHaveBeenCalledWith(
      'Will shutdown after 10 seconds.',
    );
    jest.runAllTimers();
    await Promise.resolve();
    expect(console.warn).toHaveBeenCalledWith(
      'Timeout reached, shuting down the docker...',
    );
  });
});
