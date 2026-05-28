"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";

/**
 * Fetch admin data with a fresh token once the user is known.
 * `deps` lets a caller re-fetch (e.g. after creating a venue).
 */
export function useAuthedData<T>(
  fn: (token: string) => Promise<T>,
  deps: unknown[] = [],
) {
  const { token, user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const t = await token();
        const d = await fn(t);
        if (alive) {
          setData(d);
          setError(null);
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ...deps]);

  return { data, error, loading };
}
