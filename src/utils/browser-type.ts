import { IncomingMessage } from 'http';
import { BrowserTypes } from '../typings';

export const getBrowserType = (req: IncomingMessage): BrowserTypes => {
  if (req.url.indexOf('chromium') > -1) return 'chromium';
  if (req.url.indexOf('firefox') > -1) return 'firefox';
  if (req.url.indexOf('webkit') > -1) return 'webkit';
  return 'chromium';
};
