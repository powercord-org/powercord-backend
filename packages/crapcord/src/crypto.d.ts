declare module 'crypto' {
  namespace webcrypto {
    // this is super gross but typescript is a bitch
    // https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/57287
    export const subtle: any
  }
}
