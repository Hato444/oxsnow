"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const KEY = "oxsnow-watchlist";

const WatchlistContext = createContext({
  items: [],
  count: 0,
  has: () => false,
  toggle: () => {},
  remove: () => {},
  clear: () => {},
});

export function useWatchlist() {
  return useContext(WatchlistContext);
}

export default function WatchlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const raw = localStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {}
      setLoaded(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // persist on every change (only after hydration)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  // stay in sync across browser tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== KEY) return;
      try {
        const parsed = JSON.parse(e.newValue || "[]");
        setItems(Array.isArray(parsed) ? parsed : []);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = useCallback((title) => items.some((i) => i.title === title), [items]);

  const toggle = useCallback((item) => {
    setItems((prev) => {
      if (prev.some((i) => i.title === item.title)) {
        return prev.filter((i) => i.title !== item.title);
      }
      return [{ ...item, addedAt: Date.now() }, ...prev];
    });
  }, []);

  const remove = useCallback((title) => {
    setItems((prev) => prev.filter((i) => i.title !== title));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, count: items.length, has, toggle, remove, clear }),
    [items, has, toggle, remove, clear]
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}
