import { performance } from 'node:perf_hooks';
import process from 'node:process';
import { AbortController } from 'abort-controller';

import './src/utils/trim-special-char';

const TEST_ENV_KEY = '__TEST__';
process.env[TEST_ENV_KEY] = 'true';

if (globalThis.performance === undefined) {
  Object.defineProperty(globalThis, 'performance', {
    configurable: true,
    value: performance,
    writable: true,
  });
}

if (globalThis.AbortController === undefined) {
  Object.defineProperty(globalThis, 'AbortController', {
    configurable: true,
    value: AbortController,
    writable: true,
  });
}
