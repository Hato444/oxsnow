export const site = {
  name: "Oxsnow Studio",
  tagline: "Industrializing Basotho Stories",
  mission: "Crafting culturally rooted tales through high cinematic innovation.",
  founded: 2023,
  founders: ["Lehlohonolo Mongangane", "Sello Mokheseng", "Keletso Hato"],
  email: "oxsnowstudio@gmail.com",
  phone: "+266 6279 7598",
  location: "Maseru, Lesotho",
  logo: "/brand/oxsnow-logo.png",
};

// Official Oxsnow Studio profiles — swap the hrefs if the handles change.
export const socials = [
  { label: "TikTok", href: "https://www.tiktok.com/@oxsnowstudio" },
  { label: "Instagram", href: "https://www.instagram.com/oxsnowstudio" },
  { label: "Facebook", href: "https://www.facebook.com/oxsnowstudio" },
  { label: "YouTube", href: "https://www.youtube.com/@oxsnowstudio" },
];

const demoTrailer =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const nav = [
  { label: "Home", href: "/" },
  { label: "Films", href: "/films" },
  { label: "VOD", href: "/vod" },
  { label: "Events", href: "/events" },
  { label: "Services", href: "/services" },
  { label: "Academy", href: "/academy" },
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

// Extra destinations surfaced in the footer + mobile menu only — the top bar
// keeps community/watchlist as icon shortcuts so the nav never overflows.
export const navExtra = [
  { label: "Community", href: "/community" },
  { label: "Watchlist", href: "/watchlist" },
  { label: "My Account", href: "/account" },
];

// Desktop top bar splits into a short primary row + a "Studio" dropdown so
// the bar never overflows at lg widths. Contact sits top-level after Studio
// (contact reads last in any nav). Footer/mobile stay flat (all items).
const PRIMARY_HREFS = ["/", "/films", "/vod", "/events"];
export const navPrimary = nav.filter((i) => PRIMARY_HREFS.includes(i.href));
export const navContact = nav.find((i) => i.href === "/contact");
export const navSecondary = nav.filter(
  (i) => !PRIMARY_HREFS.includes(i.href) && i.href !== "/contact"
);

export const vision =
  "To industrialize the origin and authenticity of Basotho culture and heritage across storytelling, artistry and creative spaces worldwide.";

export const founders = [
  {
    name: "Lehlohonolo Mongangane",
    role: "Founder · Director & Lead Filmmaker",
    initials: "LM",
    bio: "A self-taught filmmaker who founded Oxsnow Studio in 2023, turning a relentless love of cinema into Lesotho's most ambitious storytelling house.",
    photo: "/founders/lm.jpg",
  },
  {
    name: "Sello Mokheseng",
    role: "Co-Founder · Production & Partnerships",
    initials: "SM",
    bio: "Drives the studio's productions from script to screen - building crews, scaling the slate and connecting local talent with the wider industry.",
    photo: "/founders/sm.jpg",
  },
  {
    name: "Keletso Hato",
    role: "Co-Founder · Technology & Operations",
    initials: "KH",
    bio: "Shapes the studio's digital backbone - from the VOD platform to the tools that put Basotho stories in front of the world.",
    photo: "/founders/kh.jpg",
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
    "Limited opportunities for filmmakers and performers to develop and showcase their talent.",
    "High unemployment and limited career pathways in Lesotho\u2019s creative sector.",
    "Underrepresentation and loss of Basotho heritage, stories, and historical knowledge.",
    "An underdeveloped film industry with limited infrastructure, investment, and institutional support.",
  ],
  solutions: [
    {
      title: "Talent Development",
      copy: "Empower local filmmakers and performers through collaborative productions and professional skills development.",
    },
    {
      title: "Job Creation",
      copy: "Produce feature films that create employment, build industry skills, and generate sustainable livelihoods.",
    },
    {
      title: "Cultural Preservation",
      copy: "Document and preserve Basotho heritage, history, and stories through cinematic storytelling.",
    },
    {
      title: "Industry Growth",
      copy: "Attract investment, strengthen local production networks, and promote Lesotho\u2019s creative economy and cultural tourism.",
    },
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

// Newest first (oldest last). `src` is the trailer/teaser shown publicly; the
// paid, full film goes in `movie` (hosted externally — too large for git) and
// stays locked until rented.
export const films = [
  {
    title: "Molamu",
    type: "Documentary",
    status: "Coming Soon",
    year: "2026",
    logline:
      "A Basotho documentary digging deeper into the importance of molamu in Basotho culture and heritage. It preserves and teaches the uses and benefits of Lebetlela - from our ancient forefathers to our modern elders.",
    runtime: "Documentary",
    cover: "/posters/molamu.jpg",
    src: "/trailers/molamu-teaser.mp4",
    teaser: "/trailers/molamu-teaser.mp4",
    preview: "/previews/molamu.mp4",
    movie: null,
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
    src: "/trailers/lehlaba-phieo-trailer.mp4",
    teaser: "/trailers/lehlaba-phieo-trailer.mp4",
    preview: "/previews/lehlaba-phieo.mp4",
    movie: null,
  },
  {
    title: "Ho Lekane",
    type: "Documentary",
    status: "Available",
    year: "2026",
    logline:
      "In a generation of modern youth, drug and substance abuse spreads like a slow virus that destroys young futures. This documentary reveals the consequences of substance abuse in daily life, steering young people away from consumption.",
    runtime: "9 min",
    cover: "/posters/ho-lekane.jpg",
    src: "/trailers/ho-lekane-trailer.mp4",
    teaser: "/trailers/ho-lekane-trailer.mp4",
    preview: "/previews/ho-lekane.mp4",
    movie: null,
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
    src: "/trailers/phirimana trailer.mp4",
    teaser: "/trailers/phirimana trailer.mp4",
    preview: "/previews/phirimana.mp4",
    movie: null,
  },
  {
    title: "Konono",
    type: "Action-Drama",
    status: "Available",
    year: "2024",
    logline:
      "A young man trains nonstop after his friend is murdered by a gang leader, then confronts the gangster with violence to avenge his late friend.",
    runtime: "Feature",
    cover: "/posters/konono.jpg",
    // Konono's own teaser/trailer isn't delivered yet, so it stays cover-only.
    movie: null,
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
      { title: "Molamu", meta: "Documentary - 2026", cover: "/posters/molamu.jpg", src: "/trailers/molamu-teaser.mp4", teaser: "/trailers/molamu-teaser.mp4", preview: "/previews/molamu.mp4", movie: null },
      { title: "Lehlaba-phieo", meta: "Tragedy - 2026", cover: "/posters/lehlaba-phieo.jpg", src: "/trailers/lehlaba-phieo-trailer.mp4", teaser: "/trailers/lehlaba-phieo-trailer.mp4", preview: "/previews/lehlaba-phieo.mp4", movie: null },
      { title: "Ho Lekane", meta: "Documentary - 2026", cover: "/posters/ho-lekane.jpg", src: "/trailers/ho-lekane-trailer.mp4", teaser: "/trailers/ho-lekane-trailer.mp4", preview: "/previews/ho-lekane.mp4", movie: null },
      { title: "Phirimana", meta: "Horror - 2025", cover: "/posters/phirimana.jpg", src: "/trailers/phirimana trailer.mp4", teaser: "/trailers/phirimana trailer.mp4", preview: "/previews/phirimana.mp4", movie: null },
      { title: "Konono", meta: "Action-Drama - 2024", cover: "/posters/konono.jpg", movie: null },
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

/* ============================ EVENTS ============================ */

export const events = [
  {
    id: "molamu-premiere",
    title: "Molamu — National Premiere",
    type: "Premiere",
    status: "upcoming",
    date: "2026-12-05",
    time: "18:00",
    venue: "Ster-Kinekor, Maseru Mall",
    city: "Maseru",
    online: false,
    price: "M120",
    seats: "Limited — 180 seats",
    copy:
      "The world premiere of Molamu, our documentary on Lebetlela and the place of the molamu in Basotho heritage. Red carpet, Q&A with the directors, and a live molamu demonstration after the screening.",
    cta: "Reserve a Seat",
  },
  {
    id: "academy-intake-1",
    title: "Academy — Intake I Applications",
    type: "Academy",
    status: "upcoming",
    date: "2026-11-14",
    time: "23:59",
    venue: "Online",
    city: "Lesotho-wide",
    online: true,
    price: "Free to apply",
    seats: "24 places",
    copy:
      "Applications open for the first Oxsnow Academy intake — a 12-week hands-on pipeline in directing, camera, sound and post. Train on a real production slate, earn a real credit.",
    cta: "Apply Now",
  },
  {
    id: "community-screening-maseru",
    title: "Community Screening — Maseru",
    type: "Screening",
    status: "upcoming",
    date: "2026-11-22",
    time: "16:00",
    venue: "Letšeng Hall",
    city: "Maseru",
    online: false,
    price: "Free",
    seats: "Open seating",
    copy:
      "An open-air afternoon of short films from the Oxsnow slate — Ho Lekane, Phirimana and Konono on a big screen, with the crews in the crowd. Bring the family.",
    cta: "Register Free",
  },
  {
    id: "molamu-community-tour",
    title: "Molamu Highlands Tour",
    type: "Screening",
    status: "upcoming",
    date: "2027-01-17",
    time: "14:00",
    venue: "District screenings — Teyateyaneng, Hlotse, Mohale's Hoek",
    city: "Across Lesotho",
    online: false,
    price: "Free",
    seats: "Community venues",
    copy:
      "Taking Molamu back to the elders and villages it was filmed among — three district screenings with transport home for cast, crew and community contributors.",
    cta: "Follow the Tour",
  },
];

export const pastEvents = [
  {
    title: "Sesotho Story Lab — Workshop 03",
    date: "2026-09-12",
    venue: "Oxsnow Studio, Maseru",
    copy: "A weekend lab on archival documentary craft — rights, elders' consent, and preserving tape.",
  },
  {
    title: "Lehlaba-phieo — Friends & Family Screening",
    date: "2026-08-02",
    venue: "Private screening, Maseru",
    copy: "First audience for the Abel-and-Cain retelling, with cast and crew Q&A.",
  },
  {
    title: "Oxsnow at Lesotho Fashion & Film Week",
    date: "2026-06-20",
    venue: "Maseru",
    copy: "Studio showcase — slate presentation to broadcasters, sponsors and government partners.",
  },
];

/* ============================ SERVICES ============================ */

export const services = [
  {
    id: "commercial",
    tag: "B2B",
    title: "Commercial Production",
    copy:
      "End-to-end commercial film — concept, crew, shoot, post and delivery. TVCs, brand films, NGO campaigns and government communications shot in Lesotho to international standard.",
    includes: [
      "Creative development & scripting",
      "Full crew, camera & lighting package",
      "Direction, production & on-set management",
      "Edit, colour, sound design & mastering",
      "Delivery in every format broadcasters ask for",
    ],
  },
  {
    id: "broadcast",
    tag: "Library",
    title: "Broadcasting & Licensing",
    copy:
      "License the Oxsnow library — features, documentaries and archival footage — for broadcast, festivals, education and cultural institutions across Africa and the diaspora.",
    includes: [
      "Broadcast & VOD rights licensing",
      "Archival footage licensing",
      "Festival & theatrical booking support",
      "Co-production & distribution deals",
      "IP & ownership rights administration",
    ],
  },
  {
    id: "education",
    tag: "Schools",
    title: "Educational Packages",
    copy:
      "Basotho history and heritage on screen, packaged for schools and universities — films plus study guides, classroom licences and visiting-crew workshops.",
    includes: [
      "Classroom screening licences",
      "Study guides aligned to the curriculum",
      "Student workshop visits",
      "Bulk institutional pricing",
      "Sesotho & English materials",
    ],
  },
  {
    id: "studio",
    tag: "Facility",
    title: "Studio Services",
    copy:
      "Hire the machinery of Oxsnow — equipment, post facilities and experienced local crew — for your own productions, wherever you shoot in the Kingdom.",
    includes: [
      "Camera, grip & lighting hire",
      "Editing & colour grading suites",
      "Sound recordists & boom operators",
      "Fixers, drivers & location scouting",
      "Production accounting & logistics",
    ],
  },
];

/* ============================ ACADEMY ============================ */

export const academy = {
  eyebrow: "The Oxsnow Academy",
  headline: "Learn the craft. Earn the credit.",
  intro:
    "The Academy is not a classroom — it's a pipeline. Trainees work live productions from day one, mentored by the crews making the Oxsnow slate. When you finish, you leave with a real credit on a real film.",
  duration: "12 weeks",
  intake: "24 places per intake",
  cost: "Free for the first intake — sponsored placements",
  tracks: [
    {
      id: "direction",
      title: "Directing & Story",
      copy: "Script, shot list, block, direct. Run a set and make actors do the impossible twice.",
    },
    {
      id: "camera",
      title: "Camera & Lighting",
      copy: "Sensor to screen — exposure, composition, movement, and lighting for black steel and fire.",
    },
    {
      id: "sound",
      title: "Sound & Post",
      copy: "Location sound, boom craft, edit, colour and mix — the half of cinema audiences feel but never see.",
    },
    {
      id: "producing",
      title: "Producing & Production",
      copy: "Budgets, schedules, crews, permissions — the industrial side of industrialising stories.",
    },
  ],
  steps: [
    { step: "01", title: "Apply", copy: "Submit the form — no degree, no gear, no experience required. Hunger is the entry fee." },
    { step: "02", title: "Train", copy: "Twelve weeks across four tracks, taught on live Oxsnow productions." },
    { step: "03", title: "Ship", copy: "Leave with a screen credit on a released Oxsnow film and a place in the crew roster." },
  ],
};
