import config from '@pixpilot/eslint-config';

export default config({
  type: 'lib',
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
});
