"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { addFavorite, getFavorites, removeFavorite } from "@/lib/personalization";
import { getSessionId } from "@/lib/session";

interface FavoritesContextValue {
  isFavorite: (venueId: string) => boolean;
  toggle: (venueId: string) => void;
  count: number;
  ready: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  isFavorite: () => false,
  toggle: () => {},
  count: 0,
  ready: false,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSessionId(); // ensure the device session exists app-wide
    let alive = true;
    getFavorites()
      .then((items) => {
        if (alive) setIds(new Set(items.map((v) => v.id)));
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const toggle = useCallback((venueId: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      const wasFav = next.has(venueId);
      if (wasFav) next.delete(venueId);
      else next.add(venueId);
      // Persist, rolling back the optimistic update on failure.
      (wasFav ? removeFavorite(venueId) : addFavorite(venueId)).catch(() => {
        setIds((cur) => {
          const rb = new Set(cur);
          if (wasFav) rb.add(venueId);
          else rb.delete(venueId);
          return rb;
        });
      });
      return next;
    });
  }, []);

  const isFavorite = useCallback((venueId: string) => ids.has(venueId), [ids]);

  return (
    <FavoritesContext.Provider
      value={{ isFavorite, toggle, count: ids.size, ready }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  return useContext(FavoritesContext);
}
