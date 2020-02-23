import {
  getBrowserType,
  getLaunchOptions,
  launchOptions,
  extractProcessEnvOptions,
} from '../index';

describe('getBrowserType', () => {
  it('should be defined', () => {
    expect(getBrowserType).toBeDefined();
    expect(getLaunchOptions).toBeDefined();
    expect(launchOptions).toBeDefined();
    expect(extractProcessEnvOptions).toBeDefined();
  });
});
