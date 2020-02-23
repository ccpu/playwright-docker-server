import { LaunchOptions } from 'playwright-core/lib/server/browserType';

const extractOptions = <T>(startsWith: string) => {
  const options = Object.keys(process.env).reduce(
    (newObj, key) => {
      if (key.startsWith(startsWith + '_')) {
        const envKey = key.split('_').join('-');
        const envVal = process.env[key];
        const optionKey = envKey.replace(startsWith + '-', '');

        const val = envVal.replace(/^[^a-zA-Z-/\[/]/g, '').startsWith('[')
          ? JSON.parse(
              envVal
                .replace(/^[^a-zA-Z-]/g, '')
                .replace(/[^a-zA-Z-/\]/]+$/g, '')
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

const envLaunchOptions = extractOptions<LaunchOptions>('SERVER');
const envFlags = extractOptions<{}>('FLAG');

const flags = Object.keys(envFlags).reduce((newArr, flag) => {
  if (!['no-sandbox'].includes(flag))
    newArr.push('--' + flag + '=' + envFlags[flag]);
  return newArr;
}, []);

const { args: launchOptionsArgs, ...restOfEnvLaunchOptions } = envLaunchOptions;

let launchOptions: LaunchOptions = {
  args: [
    ...flags,
    ...(launchOptionsArgs ? launchOptionsArgs : []),
    '--no-sandbox',
  ],
  ...restOfEnvLaunchOptions,
};

console.log('Launch options:');
console.log(JSON.stringify(launchOptions, null, ' '));

export { launchOptions };
