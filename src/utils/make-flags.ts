export function makeFlags(flagObject: Record<string, unknown>): string[] {
  return Object.keys(flagObject).reduce<string[]>((newArr, flag) => {
    if (flag !== 'no-sandbox') {
      newArr.push(`--${flag}=${String(flagObject[flag])}`);
    }
    return newArr;
  }, []);
}
