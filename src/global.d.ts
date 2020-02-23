declare global {
  interface String {
    trimSpecialCharStart(): string;
    trimSpecialCharEnd(): string;
  }
  interface Window {
    __TEST__: boolean;
  }
}
export {};
