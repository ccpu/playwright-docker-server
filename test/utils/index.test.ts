import {
  extractProcessEnvOptions,
  getBrowserType,
  getLaunchOptions,
} from '../../src/utils';

describe('getBrowserType', () => {
  it('should be defined', () => {
    expect(getBrowserType).toBeDefined();
    expect(getLaunchOptions).toBeDefined();
    expect(extractProcessEnvOptions).toBeDefined();
  });
});
