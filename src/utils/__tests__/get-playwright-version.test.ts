import { getPlaywrightVersion } from '../get-playwright-version';

describe('getPlaywrightVersion', () => {
  it('should have version', () => {
    expect(getPlaywrightVersion()).toBe('^1.16.3');
  });
});
