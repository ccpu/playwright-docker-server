import { getLaunchOptions } from '../launch-options';
import mockConsole from 'jest-mock-console';

describe('getLaunchOptions', () => {
  beforeEach(() => {
    Object.keys(process.env).forEach((key) => {
      if (
        key.toLowerCase().startsWith('flag__') ||
        key.toLowerCase().startsWith('server__')
      ) {
        delete process.env[key];
      }
    });
  });

  beforeEach(() => {
    mockConsole();
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
    expect(getLaunchOptions('/chromium')).toStrictEqual({
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
    });
  });

  it('should extract query string', () => {
    expect(
      getLaunchOptions(
        `/chromium?flag--flag-option=true&server--server-option=["--server-a-1","--server-a-2"]`,
      ),
    ).toStrictEqual({
      args: ['--disable-dev-shm-usage', '--no-sandbox', '--flag-option=true'],
      'server-option': ['--server-a-1', '--server-a-2'],
    });
  });

  it('should extract process.env options', () => {
    process.env['SERVER__a'] = '["--server-a-1","--server-a-2"]';
    process.env['FLAG__b'] = 'flag-b';

    expect(getLaunchOptions('/chromium')).toStrictEqual({
      a: ['--server-a-1', '--server-a-2'],
      args: ['--b=flag-b', '--disable-dev-shm-usage', '--no-sandbox'],
    });
  });

  it('should extract chrome browser process.env options', () => {
    process.env['SERVER_chromium__a'] = 'server-chromium';
    process.env['SERVER_firefox__b'] = 'server-firefox';

    process.env['FLAG_chromium__a'] = 'flag-chromium';
    process.env['FLAG_firefox__b'] = 'flag-firefox';

    expect(getLaunchOptions('/chromium')).toStrictEqual({
      a: 'server-chromium',
      args: ['--a=flag-chromium', '--disable-dev-shm-usage', '--no-sandbox'],
    });
  });
});
