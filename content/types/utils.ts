/** Utility type to being able to specify partials of nested objects */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<RecursivePartial<U>> // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : T[P] extends { [key: string]: any }
    ? RecursivePartial<T[P]>
    : T[P];
};
