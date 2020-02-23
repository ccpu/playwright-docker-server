import { makeFlags } from '../make-flags';

describe('makeFlags', () => {
  it('should return array of flags with two dash at beginning of each', () => {
    expect(makeFlags({ ['test-flag']: true })).toStrictEqual([
      '--test-flag=true',
    ]);
  });
  it('should exclude no-sandbox', () => {
    expect(makeFlags({ 'test-flag': true, 'no-sandbox': true })).toStrictEqual([
      '--test-flag=true',
    ]);
  });
});
