import { BrowserTypeLaunchServerOptions } from 'playwright-core/lib/server/browserType';
import { makeFlags } from './make-flags';
import { getBrowserType } from './browser-type';

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

const chromiumDefaultArgs = ['--disable-dev-shm-usage', '--no-sandbox'];

export let launchOptions: BrowserTypeLaunchServerOptions = {};

export function extractProcessEnvOptions() {
  const envLaunchOptions = extractOptions<BrowserTypeLaunchServerOptions>(
    process.env,
    'server',
  );
  const envFlags = extractOptions<{}>(process.env, 'flag');

  const flags = makeFlags(envFlags);

  const {
    args: launchOptionsArgs,
    ...restOfEnvLaunchOptions
  } = envLaunchOptions;

  const allFlags = [...flags, ...(launchOptionsArgs ? launchOptionsArgs : [])];

  launchOptions = {
    ...(allFlags && allFlags.length ? { args: allFlags } : undefined),
    ...restOfEnvLaunchOptions,
  };

  if (Object.keys(launchOptions).length > 0) {
    console.log('Launch options:');
    console.log(JSON.stringify(launchOptions, null, ' '));
  }
}

export const getLaunchOptions = (url: string) => {
  const browserType = getBrowserType(url);

  const dataArr = decodeURI(url)
    .split('/')
    .filter(x => x)
    .slice(1);

  let launchOptionsCopy = launchOptions;
  if (browserType === 'chromium') {
    launchOptionsCopy = {
      ...launchOptions,
      args: [
        ...(launchOptions.args ? launchOptions.args : []),
        ...chromiumDefaultArgs,
      ],
    };
  }

  if (dataArr.length === 0) return launchOptionsCopy;

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

  const urlLaunchOptions = extractOptions<BrowserTypeLaunchServerOptions>(
    queryStringObj,
    'server',
  );

  const urlFlags = makeFlags(
    extractOptions<BrowserTypeLaunchServerOptions>(queryStringObj, 'flag'),
  );

  const { args: urlArgs, ...restOfUrlLaunchOptions } = urlLaunchOptions;

  let newArgs = launchOptionsCopy.args;
  newArgs = [
    ...(newArgs ? newArgs : []),
    ...urlFlags,
    ...(urlArgs ? urlArgs : []),
  ];

  const newOptions: BrowserTypeLaunchServerOptions = {
    ...launchOptionsCopy,
    ...(newArgs ? { args: [...new Set(newArgs)] } : {}),
    ...restOfUrlLaunchOptions,
  };

  console.log(JSON.stringify(newOptions, null, ' '));

  return newOptions;
};
