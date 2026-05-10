import { readFileSync } from 'node:fs';
import path from 'node:path';
import { cwd } from 'node:process';

interface PackageJson {
  dependencies?: Record<string, string>;
}

export function getPlaywrightVersion(): string {
  const packagePath = path.resolve(cwd(), 'package.json');
  const packageRaw = readFileSync(packagePath, 'utf8');
  const packageJson = JSON.parse(packageRaw) as PackageJson;
  return packageJson.dependencies?.playwright?.toString() ?? '';
}
