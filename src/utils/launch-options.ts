import { LaunchOptions } from 'playwright-core/lib/server/browserType';
import { makeFlags } from './make-flags';

const extractOptions = <T>(obj: object, startsWith: string) => {
  const options = Object.keys(obj).reduce(
    (newObj, key) => {
      const envKey = key
        .split('_')
        .join('-')
        .trim();

      if (envKey.toLowerCase().startsWith(startsWith + '-')) {
        const envVal = obj[key];

        const optionKey = envKey
          .replace(startsWith.toUpperCase() + '-', '')
          .replace(startsWith.toLowerCase() + '-', '');

        const val =
          typeof envVal === 'string' &&
          envVal.trimSpecialCharStart().startsWith('[')
            ? JSON.parse(
                envVal
                  .trimSpecialCharStart()
                  .trimSpecialCharEnd()
                  .split("'")
                  .join('"'),
              )
            : envVal;

        if (optionKey) newObj[optionKey] = val;
      }

      return newObj;
    },
    {} as T,
  );

  return options;
};

let launchOptions: LaunchOptions = {};

export function extractProcessEnvOptions() {
  const envLaunchOptions = extractOptions<LaunchOptions>(process.env, 'server');
  const envFlags = extractOptions<{}>(process.env, 'flag');

  const flags = makeFlags(envFlags);

  const {
    args: launchOptionsArgs,
    ...restOfEnvLaunchOptions
  } = envLaunchOptions;

  launchOptions = {
    args: [
      ...flags,
      ...(launchOptionsArgs ? launchOptionsArgs : []),
      '--no-sandbox',
    ],
    ...restOfEnvLaunchOptions,
  };

  console.log('Launch options:');
  console.log(JSON.stringify(launchOptions, null, ' '));
}

export const getLaunchOptions = (url: string) => {
  const dataArr = decodeURI(url)
    .split('/')
    .filter(x => x)
    .slice(1);

  if (dataArr.length === 0) return launchOptions;

  const queryStringObj = dataArr.reduce((newObj, queryString) => {
    const qualSymbolIndex = queryString.indexOf('=');

    if (qualSymbolIndex === -1) {
      newObj[queryString] = true;
      return newObj;
    }

    const key = queryString.substring(0, qualSymbolIndex).trim();
    const value = queryString
      .substring(qualSymbolIndex + 1, queryString.length)
      .trim();
    newObj[key] = value;
    return newObj;
  }, {});

  const urlLaunchOptions = extractOptions<LaunchOptions>(
    queryStringObj,
    'server',
  );

  const urlFlags = makeFlags(
    extractOptions<LaunchOptions>(queryStringObj, 'flag'),
  );

  const { args: urlArgs, ...restOfUrlLaunchOptions } = urlLaunchOptions;

  const newOptions = {
    ...launchOptions,
    args: [
      ...new Set([
        ...launchOptions.args,
        ...urlFlags,
        ...(urlArgs ? urlArgs : []),
        '--no-sandbox',
      ]),
    ],
    ...restOfUrlLaunchOptions,
  };
  console.log(JSON.stringify(newOptions, null, ' '));

  return newOptions;
};

export { launchOptions };
