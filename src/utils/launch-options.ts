import type { LaunchOptions } from 'playwright-core/types/types';
import type { BrowserTypes } from '../typings';
import process from 'node:process';
import { getBrowserType } from './browser-type';
import { makeFlags } from './make-flags';

const chromiumDefaultArgs = ['--disable-dev-shm-usage', '--no-sandbox'];
type StringMap = Record<string, string>;
type OptionSource = Record<string, string | undefined>;

function extractOptions<T extends Record<string, unknown>>(
  obj: OptionSource,
  startsWith: string,
  browserType: BrowserTypes,
): Partial<T> {
  const options: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      const envKey = key.split('_').join('-').trim();

      const parts = envKey.split('--');
      const optionKey = parts[1]?.trim();

      if (optionKey !== undefined && optionKey.length > 0) {
        const keyParts = parts[0].split('-');
        const keyPart = keyParts[0];

        if (
          keyPart.toLowerCase() === startsWith.toLowerCase() &&
          (keyParts.length === 1 || keyParts[1] === browserType)
        ) {
          const trimmedValue = value.trimSpecialCharStart();

          if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
            try {
              const parsed = JSON.parse(value) as unknown;
              options[optionKey as keyof T] = parsed as T[keyof T];
            } catch {
              options[optionKey as keyof T] = value as T[keyof T];
            }
          } else {
            options[optionKey as keyof T] = value as T[keyof T];
          }
        }
      }
    }
  }

  return options;
}

export function extractProcessEnvOptions(
  browserType: BrowserTypes,
): LaunchOptions {
  const envLaunchOptions = extractOptions<
    LaunchOptions & Record<string, unknown>
  >(process.env, 'server', browserType);

  const envFlags = extractOptions<Record<string, unknown>>(
    process.env,
    'flag',
    browserType,
  );

  const flags = makeFlags(envFlags);

  const launchOptionsArgs = Array.isArray(envLaunchOptions.args)
    ? envLaunchOptions.args
    : undefined;
  const { args: _args, ...restOfEnvLaunchOptions } = envLaunchOptions;

  const allFlags = [...flags, ...(launchOptionsArgs ?? [])];

  return {
    ...(allFlags.length > 0 ? { args: allFlags } : {}),
    ...restOfEnvLaunchOptions,
  };
}

export function getLaunchOptions(url: string): LaunchOptions {
  const browserType = getBrowserType(url);
  const launchOptions = extractProcessEnvOptions(browserType);
  let launchOptionsCopy = launchOptions;

  if (browserType === 'chromium') {
    const existingArgs = Array.isArray(launchOptions.args)
      ? launchOptions.args
      : [];

    launchOptionsCopy = {
      ...launchOptions,
      args: [...existingArgs, ...chromiumDefaultArgs],
    };
  }

  const queryStringStartPosition = url.indexOf('?');

  if (queryStringStartPosition === -1) {
    if (Object.keys(launchOptionsCopy).length > 0) {
      console.warn('Launch options:');
      console.warn(JSON.stringify(launchOptionsCopy, null, ' '));
    }
    return launchOptionsCopy;
  }

  const paramsString = url.substring(queryStringStartPosition, url.length);

  const searchParams = new URLSearchParams(paramsString);

  const queries: StringMap = {};
  searchParams.forEach((val, key) => {
    queries[key] = val;
  });

  const urlLaunchOptions = extractOptions<
    LaunchOptions & Record<string, unknown>
  >(queries, 'server', browserType);

  const urlFlags = makeFlags(
    extractOptions<Record<string, unknown>>(queries, 'flag', browserType),
  );

  const urlArgs = Array.isArray(urlLaunchOptions.args)
    ? urlLaunchOptions.args
    : [];
  const { args: _urlArgs, ...restOfUrlLaunchOptions } = urlLaunchOptions;

  const launchOptionArgs = Array.isArray(launchOptionsCopy.args)
    ? launchOptionsCopy.args
    : [];
  const newArgs = [...launchOptionArgs, ...urlFlags, ...urlArgs];

  const newOptions: LaunchOptions = {
    ...launchOptionsCopy,
    ...(newArgs.length > 0 ? { args: [...new Set(newArgs)] } : {}),
    ...restOfUrlLaunchOptions,
  };

  if (Object.keys(newOptions).length > 0) {
    console.warn('Launch options:');
    console.warn(JSON.stringify(newOptions, null, ' '));
  }

  return newOptions;
}
