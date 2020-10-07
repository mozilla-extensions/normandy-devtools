type AsyncHook<T> = LoadingHook | LoadedHook<T> | ErrorHook;

interface LoadingHook {
  loading: true;
  value: null;
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
