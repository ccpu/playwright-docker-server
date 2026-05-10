import type { BrowserTypes } from '../typings';

export function getBrowserType(url: string): BrowserTypes {
  const lowerCaseUrl = url.toLowerCase();
  if (lowerCaseUrl.includes('chromium')) return 'chromium';
  if (lowerCaseUrl.includes('firefox')) return 'firefox';
  if (lowerCaseUrl.includes('webkit')) return 'webkit';
  return 'chromium';
}
