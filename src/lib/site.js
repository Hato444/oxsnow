export const site = {
  name: "Oxsnow Studio",
  tagline: "Industrializing Basotho Stories",
  mission: "Crafting culturally rooted tales through high cinematic innovation.",
  founded: 2023,
  founders: ["Lehlohonolo Mongangane", "Sello Mokheseng", "Keletso Hato"],
  email: "hello@oxsnow.studio",
  location: "Maseru, Lesotho",
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "Films", href: "/films" },
  { label: "VOD", href: "/vod" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export const pillars = [
  {
    id: "vod",
    title: "Oxsnow VOD",
    tag: "Streaming",
    copy: "Rent current releases or unlock the Cultural Pass — a living archive of Basotho history, heritage and diaspora stories.",
  },
  {
    id: "production",
    title: "Production Services",
    tag: "B2B",
    copy: "End-to-end commercial production, broadcasting licensing, educational packages and full studio services for partners.",
  },
  {
    id: "ip",
    title: "IP & Licensing",
    tag: "Library",
    copy: "Owned cultural IP, format development and licensing — turning authentic Basotho narratives into lasting assets.",
  },
];

export const films = [
  {
    title: "Konono",
    type: "Action-Drama",
    status: "Available",
    year: "2024",
    logline:
      "A young man trains nonstop after his friend is murdered by a gang leader, then confronts the gangster with violence to avenge his late friend.",
    runtime: "Feature",
    cover: "/posters/konono.jpg",
  },
  {
    title: "Lehlaba-phieo",
    type: "Tragedy",
    status: "Coming Soon",
    year: "2026",
    logline:
      "Inspired by the story of Abel and Cain, Tokollo deceives his younger brother and leads him into a death zone, taking matters into his own hands and disposing of the body to hide the evidence.",
    runtime: "11 min",
    cover: "/posters/lehlaba-phieo.jpg",
  },
  {
    title: "Phirimana",
    type: "Horror",
    status: "Available",
    year: "2025",
    logline:
      "A young woman suffers vivid sleep paralysis. In her dream a figure haunts her and she must escape for her life — but as she snaps back to reality, the same incident resets.",
    runtime: "7 min",
    cover: "/posters/phirimana.jpg",
  },
  {
    title: "Ho Lekane",
    type: "Documentary",
    status: "Coming Soon",
    year: "2026",
    logline:
      "In a generation of modern youth, drug and substance abuse spreads like a slow virus that destroys young futures. This documentary reveals the consequences of substance abuse in daily life, steering young people away from consumption.",
    runtime: "9 min",
    cover: null,
  },
];

export const filmFilters = [
  "All",
  "Action-Drama",
  "Tragedy",
  "Horror",
  "Documentary",
];

export const posters = films
  .filter((f) => f.cover)
  .map((f) => ({ title: f.title, year: f.year, src: f.cover, href: "/films" }));

export const vodRows = [
  {
    row: "New Releases",
    items: [
      { title: "Konono", meta: "Action-Drama • 2024", cover: "/posters/konono.jpg" },
      { title: "Lehlaba-phieo", meta: "Tragedy • 2026", cover: "/posters/lehlaba-phieo.jpg" },
      { title: "Phirimana", meta: "Horror • 2025", cover: "/posters/phirimana.jpg" },
      { title: "Ho Lekane", meta: "Documentary • 2026", cover: null },
    ],
  },
  {
    row: "Basotho History Archive",
    items: [
      { title: "The Nation's Fire", meta: "Archive • 2023" },
      { title: "Highlands Voices", meta: "Archive • 2024" },
      { title: "Blanket & Blade", meta: "Documentary • 2025" },
      { title: "Khotso Reel", meta: "Archive • 2023" },
    ],
  },
  {
    row: "Diaspora Favorites",
    items: [
      { title: "Home from Home", meta: "Feature • 2024" },
      { title: "The Long Return", meta: "Feature • 2025" },
      { title: "Letters from Maseru", meta: "Documentary • 2024" },
      { title: "Two Rivers", meta: "Feature • 2023" },
    ],
  },
];

export const values = [
  {
    title: "Innovation",
    copy: "Cinematic craft pushed with every tool available — from set to screen.",
  },
  {
    title: "Transparency",
    copy: "Open ledgers, honest storytelling, and respect for every collaborator.",
  },
  {
    title: "Creativity",
    copy: "Authentic Basotho imagination, rendered with global production quality.",
  },
  {
    title: "Autodidacticism",
    copy: "We teach ourselves, then teach each other — building talent on the ground.",
  },
];

export const stats = [
  { value: "2023", label: "Founded" },
  { value: "10", label: "Districts Covered" },
  { value: "24+", label: "Titles in Slate" },
  { value: "3", label: "Founders" },
];
