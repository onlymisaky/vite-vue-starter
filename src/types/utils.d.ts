declare global {

  type FirstLetterUppercase<T extends string> = T extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : T;

  interface AbortablePromise<T> extends Promise<T> {
    abort: (reason?: any) => void
  }

  export type ConvertToAbortable<T> = T extends (...args: any[]) => Promise<infer R>
    ? (...args: Parameters<T>) => AbortablePromise<R>
    : T;

  type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

}

export { };
