import { useEffect, useRef } from "react";

type AbortableRequest = {
  abort: () => void;
};

type UseFetchOptions<TArgs> = {
  args: TArgs;
  fetcher: (args: TArgs) => AbortableRequest;
  debounceKey: string;
  debounceMs?: number;
  enabled?: boolean;
};

export function useFetch<TArgs>({
  args,
  fetcher,
  debounceKey,
  debounceMs = 0,
  enabled = true,
}: UseFetchOptions<TArgs>) {
  const previousDebounceKey = useRef(debounceKey);

  useEffect(() => {
    if (!enabled) return;

    let request: AbortableRequest | undefined;
    const delay = previousDebounceKey.current === debounceKey ? 0 : debounceMs;

    const timeoutId = window.setTimeout(() => {
      previousDebounceKey.current = debounceKey;
      request = fetcher(args);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      request?.abort();
    };
  }, [args, debounceKey, debounceMs, enabled, fetcher]);
}
