export type AsyncHook<T> = LoadingHook<T> | LoadedHook<T> | ErrorHook;

interface LoadingHook<T> {
  loading: true;
  value?: T | null;
  error: null;
}

interface LoadedHook<T> {
  loading: false;
  value: T;
  error: null;
}

interface ErrorHook {
  loading: false;
  value: null;
  error: { toString: () => string };
}
