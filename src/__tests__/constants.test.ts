import { TIME_OUT, USE_ONCE } from '../constants';

describe('constants', () => {
  it('should be valid value', () => {
    expect(TIME_OUT).toBe('TIME_OUT');
    expect(USE_ONCE).toBe('USE_ONCE');
  });
});
