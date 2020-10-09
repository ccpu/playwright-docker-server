import path from 'path';
import { cwd } from 'process';

export const getPlaywrightVersion = () => {
  const packagePath = path.resolve(cwd(), 'package.json');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const version = (require(packagePath).dependencies[
    'playwright'
  ] as string).toString();

  return version;
};
