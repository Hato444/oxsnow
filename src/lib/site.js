export const site = {
  name: "Oxsnow Studio",
  tagline: "Industrializing Basotho Stories",
  mission: "Crafting culturally rooted tales through high cinematic innovation.",
  founded: 2023,
  founders: ["Lehlohonolo Mongangane", "Sello Mokheseng", "Keletso Hato"],
  email: "oxsnowstudio@gmail.com",
  phone: "+266 5768 0573",
  location: "Maseru, Lesotho",
};

const demoTrailer =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const nav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Films", href: "/films" },
  { label: "VOD", href: "/vod" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export const vision =
  "To industrialize the origin and authenticity of Basotho culture and heritage across storytelling, artistry and creative spaces worldwide.";

export const founders = [
  {
    name: "Lehlohonolo Mongangane",
    role: "Founder · Director & Lead Filmmaker",
    initials: "LM",
    bio: "A self-taught filmmaker who founded Oxsnow Studio in 2023, turning a relentless love of cinema into Lesotho's most ambitious storytelling house.",
    photo: null,
  },
  {
    name: "Sello Mokheseng",
    role: "Co-Founder · Production & Partnerships",
    initials: "SM",
    bio: "Drives the studio's productions from script to screen - building crews, scaling the slate and connecting local talent with the wider industry.",
    photo: null,
  },
  {
    name: "Keletso Hato",
    role: "Co-Founder · Technology & Operations",
    initials: "KH",
    bio: "Shapes the studio's digital backbone - from the VOD platform to the tools that put Basotho stories in front of the world.",
    photo: null,
  },
];

export const about = {
  story: [
    "Oxsnow Studio is a film company built as an umbrella studio - handling multiple films, broadcasting, distribution and the licensing of intellectual property and ownership rights.",
    "It was founded in 2023 by self-taught filmmaker Lehlohonolo Mongangane, and later registered legally under the Ministry of Trade alongside co-founders Sello Mokheseng and Keletso Hato.",
    "We believe in the transformative power of compelling storytelling, artistry and cutting-edge creativity. What makes us unique is not just our expertise, but our commitment to bringing powerful tales to reality through advanced cinematic innovation.",
  ],
  mission:
    "To craft the art of storytelling with culturally rooted stories and tales through high cinematic innovation.",
  problem: [
    "A lack of film sector activity where filmmakers, actors and actresses can express their talents.",
    "A high unemployment rate in Lesotho.",
    "Our archived tales, books and Basotho history going overlooked.",
    "A huge gap created by an ineffective film industry in Lesotho.",
  ],
  solutions: [
    "Giving creative filmmakers nationwide a sense of belonging - producing multiple films where they can contribute and apply their skills.",
    "Producing multiple feature films that enable skill training and job creation, allowing the community to make a living from filmmaking.",
    "Documenting and preserving Basotho history through a cinematic experience for the younger, upcoming generation.",
    "Contribution, participation and investment that can shift the industry towards success - linking local services, talent development and global tourism.",
  ],
};

export const pillars = [
  {
    id: "vod",
    title: "Oxsnow VOD",
    tag: "Streaming",
    copy: "Rent current releases or unlock the Cultural Pass - a living archive of Basotho history, heritage and diaspora stories.",
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
    copy: "Owned cultural IP, format development and licensing - turning authentic Basotho narratives into lasting assets.",
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
    src: "/movies/Konono. Mp4 Movie(1).mp4",
    teaser: "/trailers/Teaser Molamu 1080p.mp4",
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
    src: "/movies/Lehlaba-Phieo mov..mp4",
    teaser: "/trailers/TRAILER LEHLABA-PHIEO.mov",
  },
  {
    title: "Phirimana",
    type: "Horror",
    status: "Available",
    year: "2025",
    logline:
      "A young woman suffers vivid sleep paralysis. In her dream a figure haunts her and she must escape for her life - but as she snaps back to reality, the same incident resets.",
    runtime: "7 min",
    cover: "/posters/phirimana.jpg",
    src: "/movies/PHIRIMANA.mp4",
    teaser: "/trailers/phirimana trailer.mp4",
  },
  {
    title: "Ho Lekane",
    type: "Documentary",
    status: "Coming Soon",
    year: "2026",
    logline:
      "In a generation of modern youth, drug and substance abuse spreads like a slow virus that destroys young futures. This documentary reveals the consequences of substance abuse in daily life, steering young people away from consumption.",
    runtime: "9 min",
    cover: "/posters/ho-lekane.jpg",
    src: "/movies/HO LEKANE.mov.mov",
    teaser: "/trailers/HO LEKANE Trailer.mp4",
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
      { title: "Konono", meta: "Action-Drama - 2024", cover: "/posters/konono.jpg", src: "/movies/Konono. Mp4 Movie(1).mp4", teaser: "/trailers/Teaser Molamu 1080p.mp4" },
      { title: "Lehlaba-phieo", meta: "Tragedy - 2026", cover: "/posters/lehlaba-phieo.jpg", src: "/movies/Lehlaba-Phieo mov..mp4", teaser: "/trailers/TRAILER LEHLABA-PHIEO.mov" },
      { title: "Phirimana", meta: "Horror - 2025", cover: "/posters/phirimana.jpg", src: "/movies/PHIRIMANA.mp4", teaser: "/trailers/phirimana trailer.mp4" },
      { title: "Ho Lekane", meta: "Documentary - 2026", cover: "/posters/ho-lekane.jpg", src: "/movies/HO LEKANE.mov.mov", teaser: "/trailers/HO LEKANE Trailer.mp4" },
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
    copy: "Cinematic craft pushed with every tool available - from set to screen.",
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
    copy: "We teach ourselves, then teach each other - building talent on the ground.",
  },
];

export const stats = [
  { value: "2023", label: "Founded" },
  { value: "10", label: "Districts Covered" },
  { value: "24+", label: "Titles in Slate" },
  { value: "3", label: "Founders" },
];
