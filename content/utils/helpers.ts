export function upperCaseFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface SplitCamelCaseOptions {
  case: "no-change" | "title-case";
}

export function splitCamelCase(
  str: string,
  options: SplitCamelCaseOptions = { case: "no-change" },
): string {
  // first handle long strings of upper case
  let rv = str
    .replace(/([A-Z]+)([A-Z])/, (_, group1, group2) => {
      return group1 + " " + group2.toLowerCase();
    })

    // A normal camel case transition, with a single capital letter lase
    .replace(/([a-z])([A-Z].)/g, (match, group1: string, group2: string) => {
      if (group2 === group2.toUpperCase()) {
        return group1 + " " + group2;
      }

      return group1 + " " + group2.toLowerCase();
    })

    // Check for a final capital letter. Assume that it should be lower case,
    // since there are no other hints.
    .replace(
      /([a-z])([A-Z])$/,
      (_, group1, group2) => group1 + " " + group2.toLowerCase(),
    );

  // convert to title case
  if (options.case === "title-case") {
    rv = rv.replace(
      /(^| )([a-z])/g,
      (_, match1, match2) => match1 + match2.toUpperCase(),
    );
  }

  return rv;
}

export async function delay(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export class Deferred<T = unknown, E = Error> {
  resolve: (value: T) => void;

  reject: (error: E) => void;

  promise: Promise<T>;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export function assert(
  predicate: boolean,
  message?: string,
): asserts predicate {
  if (!predicate) {
    throw new Error(message ?? "Assertion failed");
  }
}

/** Check if `key` is a property on `x` in a type-safe way when `x` is `unknown` */
export function has<K extends string>(
  key: K,
  x: unknown,
): x is { [key in K]: unknown } {
  return x && typeof x === "object" && key in x;
}

/** Group an iterable into non-overlapping chunks of size `n`. The last chunk may be smaller than `n` */
export function chunkBy<T>(iter: Iterable<T>, n: number): Array<Array<T>> {
  const rv: Array<Array<T>> = [];
  let chunk: Array<T> = [];
  for (const item of iter) {
    chunk.push(item);
    if (chunk.length >= n) {
      rv.push(chunk);
      chunk = [];
    }
  }

  if (chunk.length) {
    rv.push(chunk);
  }

  return rv;
}