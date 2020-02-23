declare global {
  interface String {
    trimSpecialCharStart(): string;
    trimSpecialCharEnd(): string;
  }
}
export {};
