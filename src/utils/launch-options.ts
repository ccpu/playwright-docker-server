import type { BrowserTypes } from '../typings';
import process from 'node:process';
import { getBrowserType } from './browser-type';
import { makeFlags } from './make-flags';

const chromiumDefaultArgs = ['--disable-dev-shm-usage', '--no-sandbox'];
type StringMap = Record<string, string>;
type LaunchOptionValue = string | string[];
interface ParsedLaunchOptions {
  args?: string[];
  [key: string]: LaunchOptionValue | undefined;
}

function extractOptions(
  obj: Record<string, string>,
  startsWith: string,
  browserType: BrowserTypes,
): ParsedLaunchOptions {
  const options: ParsedLaunchOptions = {};

  for (const [key, value] of Object.entries(obj)) {
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
            const parsed: unknown = JSON.parse(trimmedValue);

            if (
              Array.isArray(parsed) &&
              parsed.every((item): item is string => typeof item === 'string')
            ) {
              options[optionKey] = parsed;
            } else {
              options[optionKey] = value;
            }
          } catch {
            options[optionKey] = value;
          }
        } else {
          options[optionKey] = value;
        }
      }
    }
  }

  return options;
}

export function extractProcessEnvOptions(
  browserType: BrowserTypes,
): ParsedLaunchOptions {
  const envLaunchOptions = extractOptions(
    process.env as Record<string, string>,
    'server',
    browserType,
  );

  const envFlags = extractOptions(
    process.env as Record<string, string>,
    'flag',
    browserType,
  );

  const flags = makeFlags(envFlags);
  const launchOptionsArgs = Array.isArray(envLaunchOptions.args)
    ? envLaunchOptions.args
    : [];
  const { args: _args, ...restOfEnvLaunchOptions } = envLaunchOptions;
  const allFlags = [...flags, ...launchOptionsArgs];

  return {
    ...(allFlags.length > 0 ? { args: allFlags } : {}),
    ...restOfEnvLaunchOptions,
  };
}

export function getLaunchOptions(url: string): ParsedLaunchOptions {
  const browserType = getBrowserType(url);
  const launchOptions = extractProcessEnvOptions(browserType);
  let launchOptionsCopy: ParsedLaunchOptions = launchOptions;

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

  const urlLaunchOptions = extractOptions(queries, 'server', browserType);
  const urlFlags = makeFlags(extractOptions(queries, 'flag', browserType));
  const urlArgs = Array.isArray(urlLaunchOptions.args)
    ? urlLaunchOptions.args
    : [];
  const { args: _urlArgs, ...restOfUrlLaunchOptions } = urlLaunchOptions;
  const launchOptionArgs = Array.isArray(launchOptionsCopy.args)
    ? launchOptionsCopy.args
    : [];
  const newArgs = [...launchOptionArgs, ...urlFlags, ...urlArgs];

  const newOptions: ParsedLaunchOptions = {
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
