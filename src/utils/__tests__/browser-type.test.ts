import { getBrowserType } from '../browser-type';

describe('getBrowserType', () => {
  it('should have valid browser type', () => {
    expect(getBrowserType('/')).toBe('chromium');
    expect(getBrowserType('/chromium')).toBe('chromium');
    expect(getBrowserType('/firefox')).toBe('firefox');
    expect(getBrowserType('/webkit')).toBe('webkit');
  });
});
