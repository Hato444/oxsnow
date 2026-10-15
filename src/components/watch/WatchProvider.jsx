"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import WatchModal from "./WatchModal";

const WatchContext = createContext({ open: () => {} });

export function useWatch() {
  return useContext(WatchContext);
}

export default function WatchProvider({ children }) {
  const [item, setItem] = useState(null);

  const open = useCallback((next) => setItem(next), []);
  const close = useCallback(() => setItem(null), []);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [item, close]);

  return (
    <WatchContext.Provider value={{ open, item, close }}>
      {children}
      <WatchModal item={item} onClose={close} />
    </WatchContext.Provider>
  );
}
