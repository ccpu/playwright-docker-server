import { BrowserTypes } from '../typings';

export const getBrowserType = (url: string): BrowserTypes => {
  const lowerCaseUrl = url.toLowerCase();
  if (lowerCaseUrl.indexOf('chromium') > -1) return 'chromium';
  if (lowerCaseUrl.indexOf('firefox') > -1) return 'firefox';
  if (lowerCaseUrl.indexOf('webkit') > -1) return 'webkit';
  return 'chromium';
};
