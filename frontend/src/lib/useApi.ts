import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from './superadmin-api';
import { useSuperAdminSession } from '@/features/auth/SuperAdminSession';

export interface ApiState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;

  reload: () => void;
}

export function useApi<T>(
  read: (token: string) => Promise<T>,
  deps: readonly unknown[] = []
): ApiState<T> {
  const { accessToken } = useSuperAdminSession();
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const readRef = useRef(read);
  useEffect(() => { readRef.current = read; });

  useEffect(() => {
    if (!accessToken) return;
    let live = true;

    setLoading(true);
    setError(null);

    readRef.current(accessToken)
      .then((result) => {
        if (live) setData(result);
      })
      .catch((e: unknown) => {
        if (!live) return;
        setError(e instanceof ApiError ? e.message : 'Something went wrong loading this.');
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => { live = false; };

  }, [accessToken, nonce, ...deps]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data, loading, error, reload };
}

export function useApiAction(): {
  run: (write: (token: string) => Promise<unknown>) => Promise<boolean>;
  busy: boolean;
  error: string | null;
  clearError: () => void;
} {
  const { accessToken } = useSuperAdminSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (write: (token: string) => Promise<unknown>) => {
    if (!accessToken) return false;
    setBusy(true);
    setError(null);
    try {
      await write(accessToken);
      return true;
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : 'That action could not be completed.');
      return false;
    } finally {
      setBusy(false);
    }
  }, [accessToken]);

  return { run, busy, error, clearError: useCallback(() => setError(null), []) };
}
