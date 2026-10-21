// Lightweight chrome i18n — English primary, Sesotho secondary.
// Dictionary is keyed by the English source string; unknown keys fall back
// to English, so pages can adopt `t()` incrementally without breaking.

export const LANG_KEY = "oxsnow-lang";
export const LANGS = [
  { id: "en", label: "EN", name: "English" },
  { id: "st", label: "SST", name: "Sesotho" },
];

const SST = {
  // Navigation
  Home: "Lapeng",
  Films: "Difilme",
  VOD: "Bona",
  Events: "Merero",
  Services: "Ditšebeletso",
  Academy: "Akademi",
  About: "Ka Rona",
  Contact: "Kontaka",

  // Utilities
  Community: "Setšhaba",
  Gallery: "Ditshwafo",
  Watchlist: "Difilme tsa Ka",
  "My Account": "Akonto ya Ka",

  // CTAs
  "Watch Now": "Bona Jwale",
  "Sign In": "Kena",
  "Create Account": "Sala Akonto",
  "Sign out": "Tshaba",
  Join: "Kenya",
  "Joining…": "Ke kenang…",
  "Joined ✓": "Ke kenetse ✓",

  // Header / footer chrome
  Newsletter: "Ngoliso",
  Explore: "Batla",
  Studio: "Satjeng",
  "My watchlist": "Difilme tsa Ka",
  Theme: "Boemo",
  "Toggle light or dark theme": "Fetola tlanye / e lebeng",
  "Toggle menu": "Fetola lenaneo",

  // Footer copy
  "Stay connected to Basotho stories": "Dula u tletse meloko ea Basotho",
  "© {year} Oxsnow Studio. All rights reserved.": "© {year} Oxsnow Studio. Litokisetso ka botlalo.",
  "Proudly Basotho. Built for the world.": "Ke Basotho ka boitshweremo. Sekiselweng sa lefatshe.",
};

export function translate(lang, key) {
  if (lang !== "st") return key;
  return SST[key] ?? key;
}
