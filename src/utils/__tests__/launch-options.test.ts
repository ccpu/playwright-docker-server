import { getLaunchOptions, extractProcessEnvOptions } from '../launch-options';
import mockConsole from 'jest-mock-console';

describe('getLaunchOptions', () => {
  beforeEach(() => {
    mockConsole();
    extractProcessEnvOptions();
    delete process.env['SERVER_ArrayTest'];
    delete process.env['FLAG_flag_test'];
  });

  it('should chromium default options only', () => {
    expect(getLaunchOptions('/chromium')).toStrictEqual({
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
    });
  });

  it('should not have chromium default options for firefox', () => {
    expect(getLaunchOptions('/firefox')).toStrictEqual({});
  });

  it('should write options in console', () => {
    extractProcessEnvOptions();
    expect(getLaunchOptions('/chromium')).toStrictEqual({
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
    });
  });

  it('should extract URI options', () => {
    expect(
      getLaunchOptions(
        `/chromium/
        flag-debug-print/
        server-ignoreDefaultArgs=["--hide-scrollbars","--mute-audio"]
    `,
      ),
    ).toStrictEqual({
      args: ['--disable-dev-shm-usage', '--no-sandbox', '--debug-print=true'],
      ignoreDefaultArgs: ['--hide-scrollbars', '--mute-audio'],
    });
  });

  it('should extract process.env options', () => {
    process.env['SERVER_ArrayTest'] = "['--hide-scrollbars','--mute-audio']";
    process.env['FLAG_flag_test'] = 'true';
    extractProcessEnvOptions();
    expect(getLaunchOptions('/chromium')).toStrictEqual({
      ArrayTest: ['--hide-scrollbars', '--mute-audio'],
      args: ['--test=true', '--disable-dev-shm-usage', '--no-sandbox'],
    });
  });
});
