declare global {
  interface StringConstructor {
    trimSpecialCharStart(): string;
    trimSpecialCharEnd(): string;
  }
  interface String {
    trimSpecialCharStart(): string;
    trimSpecialCharEnd(): string;
  }
}
export {};
