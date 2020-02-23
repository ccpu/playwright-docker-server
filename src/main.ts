import { startHttpServer } from './server';
import { extractProcessEnvOptions } from './utils';
import './utils/trim-special-char';

extractProcessEnvOptions();
startHttpServer();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
