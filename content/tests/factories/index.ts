import { RecursivePartial } from "devtools/types/utils";
import { has } from "devtools/utils/helpers";

/* This rule is because "object is hard to use". This file works around those
 * difficulties, primarily with the help of `has`. */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * Used to create a factory which can create objects of a specific type.
 *
 * General usage is with the `fromFields` static method, like this:
 *
 *     const myFactory = Factory.fromFields<MyType>({
 *       // A simple value can be provided that will be used for all instances
 *       staticField: "static value",
 *
 *       // If a function is provided, it will be called to make each instance
 *       generatedField: (options) => Math.random(),
 *
 *       // Re-use another factory
 *       child: { subfactory: AnotherFactory },
 *
 *       // Use a field to generate another
 *       calculatedField: {
 *         dependencies: ["generatedField"],
 *         generator: (options, inProgress) => inProgress.generatedField * 2,
 *       }
 *     })
 *
 * You can use a factory by calling its `build` method, and passing any
 * overrides you may want. The passed values will override static and generator
 * fields, and be passed to subfactories.
 *
 * You can generate many values at a time from a factory with the `buildCount`
 * and `buildMany` methods. Use `buildCount` if you want to use the factory
 * defaults, and `buildMany` if you need to customize the instances
 * individually.
 *
 * To add non-field options to a factory, pass a second type argument.
 *
 *     const optionsFactory = Factory.fromFields<MyType, MyOptions>({
 *       generatedField: (options: MyOptions) => Math.random * (options.max ?? 5),
 *     })
 *
 * It can be useful to take advantage of anonymous types and destructuring for options:
 *
 *     const optionsFactory = Factory.fromFields<MyType, {max: number}>({
 *       generatedField: ({ max = 5}) => Math.random * max,
 *     })
 *
 * You can also make a factory that provides an entirely custom build function:
 *
 *     const complicatedValue = new Factory<ComplicatedType>((overrides?, options?) => {
 *       // ...
 *     })
 *
 * These factories will still have the `buildMany` and `buildCount` factories provided.
 */
export default class Factory<T, O extends object = object>
  implements FactoryInterface<T, O> {
  private readonly _buildFunc: BuildFunc<T, O>;

  constructor(buildFunc: BuildFunc<T, O>) {
    this._buildFunc = buildFunc;
  }

  static fromFields<T, O extends object = object>(
    fields: { [F in keyof T]: FieldDefinition<T, T[F], O> },
  ): Factory<T, O> {
    return new Factory((partial = {}, options = {}) => {
      const rv: RecursivePartial<T> = {};

      const todoFields: Array<[
        string,
        FieldDefinition<T, T[keyof T], O>,
      ]> = Object.entries(fields);
      const doneFields = new Set<string>();

      while (todoFields.length) {
        const [key, fieldBuilder] = todoFields.pop();

        if (
          has("dependencies", fieldBuilder) &&
          Array.isArray(fieldBuilder.dependencies)
        ) {
          let shouldSkip = false;
          // TODO check for loops?
          for (const dependency of fieldBuilder.dependencies) {
            if (!doneFields.has(dependency)) {
              todoFields.unshift([key, fieldBuilder]);
              shouldSkip = true;
              break;
            }
          }

          if (shouldSkip) {
            continue;
          }
        }

        if (has("subfactory", fieldBuilder)) {
          let subfactoryOptions = {};
          if (fieldBuilder.passOptions) {
            subfactoryOptions = fieldBuilder.passOptions(options, partial, rv);
          }

          rv[key] = fieldBuilder.subfactory.build(
            partial[key],
            subfactoryOptions,
          );
        } else if (key in partial) {
          rv[key] = partial[key];
        } else if (has("generator", fieldBuilder)) {
          rv[key] = fieldBuilder.generator(options, rv);
        } else if (typeof fieldBuilder === "function") {
          const generator = fieldBuilder as GeneratorFunction<T, T[keyof T], O>;
          rv[key] = generator(options, rv);
        } else {
          // Assign the field builder to a strongly typed variable. This ensures
          // that there are no possible options for the fieldBuilder left except a
          // plain value, i.e. we covered all the cases above.
          const fieldValue: T[keyof T] = fieldBuilder;
          rv[key] = fieldValue;
        }

        doneFields.add(key);
      }

      return rv as T;
    });
  }

  build(partial?: RecursivePartial<T>, options?: RecursivePartial<O>): T {
    return this._buildFunc(partial, options);
  }

  buildMany(
    overrides: Array<RecursivePartial<T>>,
    options?: Array<O>,
  ): Array<T> {
    const rv: Array<T> = [];
    for (let i = 0; i < overrides.length; i++) {
      rv.push(this._buildFunc(overrides[i], options[i]));
    }

    return rv;
  }

  buildCount(count: number): Array<T> {
    const rv = [];
    while (rv.length < count) {
      rv.push(this._buildFunc());
    }

    return rv;
  }
}

interface FactoryInterface<T, O extends object> {
  build: BuildFunc<T, O>;
  buildMany: (
    partials: Array<RecursivePartial<T>>,
    options: Array<RecursivePartial<O>>,
  ) => Array<T>;
  buildCount: (n: number) => Array<T>;
}

type BuildFunc<T, O extends object> = (
  partial?: RecursivePartial<T>,
  options?: RecursivePartial<O>,
) => T;

export type FieldDefinition<T, F, O1 extends object, O2 extends object = {}> =
  | F
  | GeneratedField<T, F, O1>
  | GeneratorFunction<T, F, O1>
  | SubFactoryField<T, F, O1, O2>;

export interface GeneratedField<T, F, O extends object> {
  dependencies?: Array<string>;
  generator: GeneratorFunction<T, F, O>;
}

export type GeneratorFunction<T, F, O extends object> = (
  options: RecursivePartial<O>,
  inProgress: RecursivePartial<T>,
) => F;

export interface SubFactoryField<
  T,
  F,
  O1 extends object,
  O2 extends object = {}
> {
  subfactory: FactoryInterface<F, O2>;
  dependencies?: Array<string>;
  passOptions?: (
    options: RecursivePartial<O1>,
    inputObject: RecursivePartial<T>,
    inProgressObject: RecursivePartial<T>,
  ) => RecursivePartial<O2>;
}

export function autoIncrementField<T, O extends object>(): GeneratorFunction<
  T,
  number,
  O
> {
  let counter = 0;
  return (): number => {
    counter += 1;
    return counter;
  };
}
