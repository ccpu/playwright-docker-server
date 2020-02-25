import { DOCKER_TIMEOUT, USE_ONCE, DISABLE_MESSAGES } from '../constants';

describe('constants', () => {
  it('should be valid value', () => {
    expect(DOCKER_TIMEOUT).toBe('DOCKER_TIMEOUT');
    expect(DISABLE_MESSAGES).toBe('DISABLE_MESSAGES');
    expect(USE_ONCE).toBe('USE_ONCE');
  });
});
