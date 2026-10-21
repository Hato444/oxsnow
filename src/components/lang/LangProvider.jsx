"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LANG_KEY, translate } from "@/lib/i18n";

const LangContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function useLang() {
  return useContext(LangContext);
}

export default function LangProvider({ children }) {
  const [lang, setLangState] = useState("en");

  // hydrate stored preference after mount (never during SSR)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const stored = localStorage.getItem(LANG_KEY);
        if (stored === "en" || stored === "st") setLangState(stored);
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const setLang = useCallback((next) => {
    setLangState(next === "st" ? "st" : "en");
    try {
      localStorage.setItem(LANG_KEY, next === "st" ? "st" : "en");
    } catch {}
  }, []);

  const t = useCallback((key) => translate(lang, key), [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
