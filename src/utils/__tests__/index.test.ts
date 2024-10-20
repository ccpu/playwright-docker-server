import {
  getBrowserType,
  getLaunchOptions,
  extractProcessEnvOptions,
} from '../index';

describe('getBrowserType', () => {
  it('should be defined', () => {
    expect(getBrowserType).toBeDefined();
    expect(getLaunchOptions).toBeDefined();
    expect(extractProcessEnvOptions).toBeDefined();
  });
});
