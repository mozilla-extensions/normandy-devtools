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
