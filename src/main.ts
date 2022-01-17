import { startHttpServer } from './server';
import './utils/trim-special-char';
import { DISABLE_MESSAGES } from './constants';

if (process.env[DISABLE_MESSAGES] === 'true') {
  console.log = function () {};
  console.debug = function () {};
}
startHttpServer();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
