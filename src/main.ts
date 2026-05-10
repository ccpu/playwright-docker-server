import process from 'node:process';
import { DISABLE_MESSAGES } from './constants';
import { startHttpServer } from './server';
import './utils/trim-special-char';

function noop(): void {
  // no-op
}

if (process.env[DISABLE_MESSAGES] === 'true') {
  globalThis.console.log = noop;
  globalThis.console.debug = noop;
}
startHttpServer().catch((error: unknown) => {
  console.error(error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
