import { LaunchOptions } from 'playwright-core/lib/server/browserType';

const extractOptions = <T>(startsWith: string) => {
  const options = Object.keys(process.env).reduce(
    (newObj, key) => {
      if (key.startsWith(startsWith + '_')) {
        const envKey = key.split('_').join('-');
        const keyVal = envKey.split('=');
        const optionKey = envKey.replace(startsWith + '-', '').toLowerCase();
        const optVal = keyVal.length === 2 ? keyVal[1] : true;
        if (optionKey) newObj[optionKey] = optVal;
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

let launchOptions: LaunchOptions = {
  args: [...flags, '--no-sandbox'],
  ...envLaunchOptions,
};

console.log('Launch options:');
console.log(JSON.stringify(launchOptions, null, ' '));

export { launchOptions };
