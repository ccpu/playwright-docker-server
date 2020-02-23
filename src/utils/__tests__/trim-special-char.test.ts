import '../trim-special-char';

describe('trim-special-char', () => {
  it('should remove special characters from beginning of string', () => {
    const str = '//@~#\\ \n\r Test-string';
    expect(str.trimSpecialCharStart()).toBe('Test-string');
  });
  it('should not remove bracket', () => {
    const str = '// [Test-string';
    expect(str.trimSpecialCharStart()).toBe('[Test-string');
  });
  it('should not remove dash', () => {
    const str = '// -Test-string';
    expect(str.trimSpecialCharStart()).toBe('-Test-string');
  });
  it('should remove special characters from the end of string', () => {
    const str = 'Test-string//@~#\\ \n\r ';
    expect(str.trimSpecialCharEnd()).toBe('Test-string');
  });
  it('should not remove last bracket', () => {
    const str = 'Test-string]//@~#\\ \n\r ';
    expect(str.trimSpecialCharEnd()).toBe('Test-string]');
  });
});
