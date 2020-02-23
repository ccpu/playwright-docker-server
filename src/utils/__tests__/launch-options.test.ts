import { getLaunchOptions, extractProcessEnvOptions } from '../launch-options';

describe('getLaunchOptions', () => {
  beforeEach(() => {
    extractProcessEnvOptions(false);
    delete process.env['SERVER_ArrayTest'];
    delete process.env['FLAG_flag_test'];
  });

  it('should not have --no-sandbox options only', () => {
    expect(getLaunchOptions('/chromium')).toStrictEqual({
      args: ['--no-sandbox'],
    });
  });

  it('should write options in console', () => {
    extractProcessEnvOptions(true);
    expect(getLaunchOptions('/chromium')).toStrictEqual({
      args: ['--no-sandbox'],
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
      args: ['--no-sandbox', '--debug-print=true'],
      ignoreDefaultArgs: ['--hide-scrollbars', '--mute-audio'],
    });
  });

  it('should extract process.env options', () => {
    process.env['SERVER_ArrayTest'] = "['--hide-scrollbars','--mute-audio']";
    process.env['FLAG_flag_test'] = 'true';
    extractProcessEnvOptions(false);
    expect(getLaunchOptions('/chromium')).toStrictEqual({
      ArrayTest: ['--hide-scrollbars', '--mute-audio'],
      args: ['--test=true', '--no-sandbox'],
    });
  });
});
