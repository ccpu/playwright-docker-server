import '../trim-special-char';

describe('trim-special-char', () => {
  it('should remove special characters from beginning of string', () => {
    const str = '/test-string';
    expect(str.trimSpecialCharStart()).toBe('test-string');
  });
});
