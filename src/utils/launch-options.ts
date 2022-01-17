import { LaunchOptions } from 'playwright-core/types/types';
import { makeFlags } from './make-flags';
import { getBrowserType } from './browser-type';
import { BrowserTypes } from '../typings';

const chromiumDefaultArgs = ['--disable-dev-shm-usage', '--no-sandbox'];

const extractOptions = <T>(
  obj: object,
  startsWith: string,
  browserType: BrowserTypes,
) => {
  const optionKeys = Object.keys(obj);

  const options = optionKeys.reduce((newObj, key) => {
    const envKey = key.split('_').join('-').trim();

    const parts = envKey.split('--');

    const optionKey = parts[1];

    const keyParts = parts[0].split('-');
    const keyPart = keyParts[0];

    if (
      keyPart.toLowerCase() === startsWith.toLowerCase() &&
      (keyParts.length === 1 || keyParts[1] === browserType)
    ) {
      const envVal = obj[key];
      // const v = envVal.substring(1, envVal.length - 1);

      if (
        envVal.trimSpecialCharStart().startsWith('[') &&
        envVal.trimSpecialCharStart().endsWith(']')
      ) {
        const arrVal = JSON.parse(envVal);
        newObj[optionKey] = arrVal;
      } else {
        newObj[optionKey] = envVal;
      }
    }

    return newObj;
  }, {} as T);

  return options;
};

export function extractProcessEnvOptions(browserType: BrowserTypes) {
  const envLaunchOptions = extractOptions<LaunchOptions>(
    process.env,
    'server',
    browserType,
  );

  const envFlags = extractOptions<{}>(process.env, 'flag', browserType);

  const flags = makeFlags(envFlags);

  const {
    args: launchOptionsArgs,
    ...restOfEnvLaunchOptions
  } = envLaunchOptions;

  const allFlags = [...flags, ...(launchOptionsArgs ? launchOptionsArgs : [])];

  return {
    ...(allFlags && allFlags.length ? { args: allFlags } : undefined),
    ...restOfEnvLaunchOptions,
  };
}

export const getLaunchOptions = (url: string) => {
  const browserType = getBrowserType(url);
  const launchOptions = extractProcessEnvOptions(browserType);
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

  const queryStringStartPosition = url.indexOf('?');

  if (queryStringStartPosition === -1) {
    if (Object.keys(launchOptionsCopy).length > 0) {
      console.log('Launch options:');
      console.log(JSON.stringify(launchOptionsCopy, null, ' '));
    }
    return launchOptionsCopy;
  }

  const paramsString = url.substring(url.indexOf('?'), url.length);

  const searchParams = new URLSearchParams(paramsString);

  const queries = {};
  searchParams.forEach((val, key) => {
    queries[key] = val;
  });

  const urlLaunchOptions = extractOptions<LaunchOptions>(
    queries,
    'server',
    browserType,
  );

  const urlFlags = makeFlags(
    extractOptions<LaunchOptions>(queries, 'flag', browserType),
  );

  const { args: urlArgs, ...restOfUrlLaunchOptions } = urlLaunchOptions;

  let newArgs = launchOptionsCopy.args;
  newArgs = [
    ...(newArgs ? newArgs : []),
    ...urlFlags,
    ...(urlArgs ? urlArgs : []),
  ];

  const newOptions: LaunchOptions = {
    ...launchOptionsCopy,
    ...(newArgs ? { args: [...new Set(newArgs)] } : {}),
    ...restOfUrlLaunchOptions,
  };

  if (Object.keys(newOptions).length > 0) {
    console.log('Launch options:');
    console.log(JSON.stringify(launchOptions, null, ' '));
  }

  return newOptions;
};
