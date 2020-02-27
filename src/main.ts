import { startHttpServer } from './server';
import { extractProcessEnvOptions } from './utils';
import './utils/trim-special-char';
import { DISABLE_MESSAGES, DEBUG_MODE, DEBUG_ENABLED } from './constants';
import { exec } from 'child_process';

if (process.env[DEBUG_MODE] && !process.env[DEBUG_ENABLED]) {
  process.env[DEBUG_ENABLED] = 'true';
  exec('npm run start-debug', (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });

  console.log(
    'Debugger listening on port 9229, to attach to debugger make sure to map port 9229 to the host.',
  );
} else {
  if (process.env[DISABLE_MESSAGES] === 'true') {
    console.log = function() {};
    console.debug = function() {};
  }

  extractProcessEnvOptions();
  startHttpServer();

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}
