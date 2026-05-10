import { readFileSync } from 'node:fs';
import path from 'node:path';
import { cwd } from 'node:process';
import { getPlaywrightVersion } from '../get-playwright-version';

interface PackageJson {
  dependencies?: Record<string, string>;
}

describe('getPlaywrightVersion', () => {
  it('should have version', () => {
    const packagePath = path.resolve(cwd(), 'package.json');
    const packageRaw = readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageRaw) as PackageJson;

    expect(getPlaywrightVersion()).toBe(packageJson.dependencies?.playwright);
  });
});
