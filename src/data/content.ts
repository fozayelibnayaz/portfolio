/* =============================================================================
   CONTENT — one file, one source of truth.

   Voice: a developer describing their own work. Concrete nouns, verbs, counts.
   No adjectives doing the job of evidence.
   ========================================================================== */

export const site = {
  name: 'Fozayel Ibn Ayaz',
  first: 'Fozayel',
  role: 'Full-Stack Developer · Analytics & QA',
  location: 'Dhaka, Bangladesh',
  timezone: 'GMT+6',
  email: 'ibnayaz789@gmail.com',
  phone: '+8801726611455',
  phonePretty: '+880 1726 611455',
  github: 'https://github.com/fozayelibnayaz',
  repo: 'https://github.com/fozayelibnayaz/portfolio',
  url: 'https://fozayelibnayaz.github.io/portfolio/',
  availability: 'Open for work',
  title: 'Fozayel Ibn Ayaz — Full-Stack Developer, Analytics & QA',
  description:
    'Full-stack developer in Dhaka. I build the interface, the API behind it, the query under that, and the tests that keep it working. React, Next.js, Node, WordPress, SQL, Playwright.',
  cv: 'files/Fozayel_Ibn_Ayaz_CV.pdf',
};

export const nav = [
  { label: 'Work', href: '#work' },
  { label: 'Stack', href: '#stack' },
  { label: 'Lab', href: '#lab' },
  { label: 'Repos', href: '#repos' },
  { label: 'About', href: '#about' },
  { label: 'History', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

export type Project = {
  key: string;
  title: string;
  category: 'websites' | 'store' | 'apps' | 'dash';
  catLabel: string;
  year: string;
  metric: string;
  badge: string;
  badgeKind: 'live' | 'private' | 'concept';
  link: string | null;
  image: string;
  tags: string[];
  caseStudy: {
    sub: string;
    problem: string;
    did: string[];
    changed: string;
    role: string;
    timeline: string;
    status: string;
    client: string;
  };
};

export const filters = [
  { key: 'all', label: 'All' },
  { key: 'websites', label: 'Sites' },
  { key: 'store', label: 'Store' },
  { key: 'apps', label: 'Apps' },
  { key: 'dash', label: 'Data' },
] as const;

export const projects: Project[] = [
  {
    key: 'euroedge',
    title: 'EuroEdge Admission Group',
    category: 'websites',
    catLabel: 'Website · UK',
    year: '2026',
    metric: 'Programme pages, no deploy',
    badge: 'Live',
    badgeKind: 'live',
    link: 'https://euroedgeadmissiongroup.com/',
    image: 'img/work-euroedge.avif',
    tags: ['WordPress', 'Elementor', 'Schema'],
    caseStudy: {
      sub: 'A UK student consultancy site the team can extend without me.',
      problem:
        'Services sat three levels deep, and every new programme page needed a developer and a deploy.',
      did: [
        'Modelled destinations, courses, visas and partner universities as separate editable templates',
        'Moved programme pages into fields the team fills in, not files I edit',
        'Added FAQ and Course structured data, then checked the markup against the visible copy',
      ],
      changed: 'Any programme is two clicks from the homepage, and new pages ship in an afternoon.',
      role: 'Design, build, launch',
      timeline: '2026',
      status: 'Live',
      client: 'EuroEdge Admission Group (UK)',
    },
  },
  {
    key: 'youtube',
    title: 'AI YouTube Command Center',
    category: 'dash',
    catLabel: 'Product · Analytics',
    year: '2025',
    metric: '30+ function-calling tools',
    badge: 'Live',
    badgeKind: 'live',
    link: 'https://youtube-command-center-eight.vercel.app',
    image: 'img/work-youtube.avif',
    tags: ['Next.js', 'TypeScript', 'OAuth'],
    caseStudy: {
      sub: 'Channel analytics, hooks and retention on one screen.',
      problem: 'Every review meant six browser tabs and a spreadsheet that disagreed with all of them.',
      did: [
        'Normalised channel and video data into one set of views instead of six',
        'Wrote 30+ function-calling tools so the assistant queries real metrics, not guesses',
        'Put hooks, titles and publish timing side by side so a comparison is one glance',
      ],
      changed: 'The Monday review is one screen, and the numbers finally agree with each other.',
      role: 'Full-stack developer (solo)',
      timeline: '2025',
      status: 'Live · GitHub Actions deploys',
      client: 'Independent product',
    },
  },
  {
    key: 'blondeau',
    title: 'Déménagement Blondeau',
    category: 'websites',
    catLabel: 'Website · France',
    year: '2025',
    metric: 'Quote form cut to one step',
    badge: 'Live · Client',
    badgeKind: 'live',
    link: 'https://demenagement-blondeau.com',
    image: 'img/work-blondeau.avif',
    tags: ['WordPress', 'Local SEO', 'Ongoing'],
    caseStudy: {
      sub: 'A ninety-year-old Paris mover, finally findable.',
      problem: 'Ninety years of work and almost no organic presence, behind a quote form most people quit.',
      did: [
        'Rebuilt the site around the four services that actually convert, not the twelve listed',
        'Cut the quote form from three screens to one, asking only what is needed to price a job',
        'Set up service and location pages with their own titles, headings and internal links',
      ],
      changed: 'Quote requests now arrive complete enough to price, and pages get added without downtime.',
      role: 'Design, build, ongoing support',
      timeline: '2025 — now',
      status: 'Live, maintained',
      client: 'Déménagement Blondeau (FR)',
    },
  },
  {
    key: 'eagle',
    title: 'Eagle Analytics System',
    category: 'dash',
    catLabel: 'Dashboard · Work',
    year: '2024',
    metric: '10-page BI hub · 151 tests',
    badge: 'Internal tool',
    badgeKind: 'private',
    link: null,
    image: 'img/work-eaglebi.avif',
    tags: ['Python', 'Streamlit', 'MongoDB'],
    caseStudy: {
      sub: 'A pipeline the reports could trust.',
      problem:
        'Reporting lived in spreadsheets nobody refreshed, so meetings opened with an argument about whose figure was right.',
      did: [
        'Consolidated streaming and catalogue data into one scheduled pipeline',
        'Built a 10-page dashboard covering KPIs, YouTube, revenue and retention',
        'Covered the transforms with 151 tests, and fired anomaly alerts within 15 minutes',
      ],
      changed: 'One link, one set of numbers, and a review that starts with decisions instead of data.',
      role: 'Data analyst — pipeline and dashboard',
      timeline: '2024 — 2026',
      status: 'Internal (not public)',
      client: 'Eagle 3D Streaming',
    },
  },
  {
    key: 'gauvin',
    title: 'Gauvin Déménagement',
    category: 'websites',
    catLabel: 'Website · France',
    year: '2025',
    metric: 'Two brands, one theme',
    badge: 'Live · Client',
    badgeKind: 'live',
    link: 'https://demenagementgauvin.com',
    image: 'img/work-gauvin.avif',
    tags: ['WordPress', 'Content', 'Support'],
    caseStudy: {
      sub: 'Two moving companies, one codebase, separate identities.',
      problem: 'Two related brands needed to look different without paying for two builds and two support contracts.',
      did: [
        'Built one theme driving two brand configurations from a single switch',
        'Wrote page templates for services, zones and quotes that both brands reuse',
        'Left behind an editing guide the team still follows',
      ],
      changed: 'Both sites stay consistent, and either can be updated in minutes.',
      role: 'Design, build, support',
      timeline: '2025 — now',
      status: 'Live, maintained',
      client: 'Gauvin Déménagement (FR)',
    },
  },
  {
    key: 'zenji',
    title: 'ZENJI — Anime Streetwear',
    category: 'store',
    catLabel: 'Store · Australia',
    year: '2025',
    metric: 'Checkout in three taps',
    badge: 'Concept',
    badgeKind: 'concept',
    link: 'https://fozayelibnayaz.github.io/ZENJI-Anime-Streetwear/',
    image: 'img/work-zenji.avif',
    tags: ['Next.js', 'React', 'UI/UX'],
    caseStudy: {
      sub: 'A storefront that reads like a lookbook.',
      problem: 'Streetwear drops live or die on how the product looks on a phone and how fast checkout moves.',
      did: [
        'Designed an editorial product page where the image leads and the price follows',
        'Built cart and checkout in Next.js, keeping state local until it has to leave',
        'Kept the catalogue usable on mid-range phones, which is where it will be opened',
      ],
      changed: 'A storefront that looks like a magazine and still gets to checkout in three taps.',
      role: 'Design and build (solo)',
      timeline: '2025',
      status: 'Concept build',
      client: 'Self-initiated',
    },
  },
  {
    key: 'bazardor',
    title: 'Bazar Dor',
    category: 'apps',
    catLabel: 'Web app · Bangladesh',
    year: '2026',
    metric: 'Bangla-first price board',
    badge: 'Live',
    badgeKind: 'live',
    link: 'https://bazar-dor-ten-tau.vercel.app',
    image: 'img/work-bazardor.avif',
    tags: ['TypeScript', 'Vercel', 'Bangla UI'],
    caseStudy: {
      sub: 'What vegetables cost today, before you leave the house.',
      problem: 'Households in Dhaka cannot check market prices without walking to the market.',
      did: [
        'Designed a Bangla-first interface with figures sized to be read at a glance',
        'Built daily price entry with day-over-day comparison per item',
        'Kept the whole app working on a low-end Android phone over patchy data',
      ],
      changed: 'A price check that takes five seconds, in the language people actually read it in.',
      role: 'Design and build (solo)',
      timeline: '2026',
      status: 'Live',
      client: 'Self-initiated',
    },
  },
  {
    key: 'prospect',
    title: 'Prospect Studio',
    category: 'apps',
    catLabel: 'Tool · Sales',
    year: '2026',
    metric: '14 modules · 155 tests',
    badge: 'Live',
    badgeKind: 'live',
    link: 'https://ayaz-prospect-studio.ayazwork2026.workers.dev/',
    image: 'img/work-prospect.avif',
    tags: ['Cloudflare Workers', 'D1', 'Gmail API'],
    caseStudy: {
      sub: 'A follow-up system for people who hate follow-ups.',
      problem: 'Freelance pipelines stall because the next message never gets written, not because leads are missing.',
      did: [
        'Built a B2B prospecting CRM with 14 modules and a next action on every row',
        'Wired Gmail API sending and staged templates across 124 countries',
        'Covered the flow with 155 automated tests on Cloudflare Workers and D1',
      ],
      changed: 'Every open lead has a next step and a date, so nothing quietly dies.',
      role: 'Product, design and build (solo)',
      timeline: '2026',
      status: 'Live · 155 tests passing',
      client: 'Self-initiated',
    },
  },
];

export const liveLinks = [
  { label: 'EuroEdge', meta: 'UK', href: 'https://euroedgeadmissiongroup.com/' },
  { label: 'Blondeau', meta: 'FR', href: 'https://demenagement-blondeau.com' },
  { label: 'Gauvin', meta: 'FR', href: 'https://demenagementgauvin.com' },
  { label: 'YouTube CC', meta: 'App', href: 'https://youtube-command-center-eight.vercel.app' },
  { label: 'Bazar Dor', meta: 'BD', href: 'https://bazar-dor-ten-tau.vercel.app' },
  { label: 'Prospect', meta: 'Tool', href: 'https://ayaz-prospect-studio.ayazwork2026.workers.dev/' },
  { label: 'ZENJI', meta: 'Concept', href: 'https://fozayelibnayaz.github.io/ZENJI-Anime-Streetwear/' },
  { label: 'Devstack', meta: 'Demo', href: 'https://fozayelibnayaz.github.io/Devstack/' },
];

export const about = {
  lead: 'Most projects break in the gaps — between the component, the API, the query and the deploy.',
  bio: 'I work across those gaps on purpose. Full-stack in Dhaka: interfaces in React and Next.js, WordPress when a team needs to edit their own site, Python and SQL when the question is about data, Playwright when something has to stay fixed. Six roles in four years, from IT support to analytics, which is why I check things instead of assuming.',
  facts: [
    { k: 'Based', v: 'Dhaka, Bangladesh' },
    { k: 'Focus', v: 'Web · Data · QA' },
    { k: 'Now', v: 'Full-stack @ ENT Sourcing' },
  ],
  quote: 'If it is not measured, it is not finished.',
};

export const experience = [
  { when: '2026 — now', role: 'Full-Stack Developer', org: 'ENT Sourcing Corp', place: 'Remote' },
  { when: 'Dec 2025 — now', role: 'WordPress Developer', org: 'Ekomedia', place: 'Freelance · Remote' },
  { when: 'Jul 2023 — Aug 2026', role: 'Data Analyst', org: 'Eagle 3D Streaming', place: 'Remote' },
  { when: 'Jan 2023 — Jun 2023', role: 'IT Support Engineer', org: 'n2sys Technology', place: 'Dhaka' },
  { when: 'Aug 2022 — Dec 2022', role: 'Coding Teacher', org: 'Codingal', place: 'Remote' },
  { when: 'May 2022 — Jul 2022', role: 'Associate', org: 'Quantanite', place: 'Dhaka' },
];

export const education = [
  { when: '2017 — 2022', role: 'BSc. Computer Science & Engineering', org: 'North South University' },
  { when: '2014 — 2016', role: 'Higher Secondary Certificate', org: 'Ideal College, Dhanmondi' },
  { when: '2004 — 2014', role: 'Secondary School Certificate', org: "Dhanmondi Govt. Boys' High School" },
];

export const languages = [
  { name: 'Bengali', level: 'Native' },
  { name: 'English', level: 'IELTS 6.5 · B2' },
];

export const skillGroups = [
  {
    label: 'Languages',
    items: ['JavaScript (ES6+)', 'TypeScript', 'SQL', 'Java', 'PHP', 'Python', 'C++', 'C', 'HTML5', 'CSS3'],
  },
  {
    label: 'Web',
    items: ['Next.js', 'React', 'Node.js', 'Express', 'Prisma', 'REST APIs', 'WordPress', 'WooCommerce', 'Figma', 'SEO'],
  },
  {
    label: 'Data',
    items: ['ETL pipelines', 'GA4', 'GTM', 'Looker Studio', 'Streamlit', 'Prophet', 'ARIMA', 'LSTM', 'Hadoop', 'Hive', 'Spark'],
  },
  {
    label: 'Infra & tools',
    items: ['GCP', 'Docker', 'Kubernetes', 'MySQL', 'MariaDB', 'MongoDB', 'Supabase', 'Firebase', 'Playwright', 'Postman', 'Unreal Engine'],
  },
];

export const contact = {
  lead: 'A rough idea is enough to start. Tell me what it has to do, who it is for, and when you need it — I will tell you what is realistic.',
};

export const extraWork = [
  { label: 'DevStack', meta: 'Demo', href: 'https://fozayelibnayaz.github.io/Devstack/' },
  { label: 'GitHub', meta: 'Code', href: 'https://github.com/fozayelibnayaz' },
];

/* ---------------------------------------------------------------------------
   System map — the five layers every project here shares. Written as a
   developer would describe their own architecture, not as marketing.
   ------------------------------------------------------------------------- */
export const systemLayers = [
  {
    key: 'interface',
    n: '01',
    name: 'Interface',
    tint: 'mint',
    claim: 'Render it, and make it usable.',
    what: [
      'Component structure in React / Next.js, or a WordPress theme when the client needs to edit it',
      'Responsive layout by hand — no UI kit, no framework theming',
      'Keyboard paths, focus order and labels from the first commit, not the last',
    ],
    tools: ['React', 'Next.js', 'TypeScript', 'CSS', 'Astro'],
    proof: 'Eagle Analytics System',
  },
  {
    key: 'logic',
    n: '02',
    name: 'Logic',
    tint: 'lilac',
    claim: 'Decide, validate, and say no cleanly.',
    what: [
      'API routes and server actions with typed inputs and typed outputs',
      'Validation at the edge of the system, so bad data stops before it is stored',
      'Errors that name the field that broke — for the user and for the logs',
    ],
    tools: ['Node.js', 'TypeScript', 'REST', 'OAuth', 'PHP'],
    proof: 'AI YouTube Command Center',
  },
  {
    key: 'data',
    n: '03',
    name: 'Data',
    tint: 'butter',
    claim: 'Model it once, then measure it.',
    what: [
      'Relational schemas, migrations and queries that stay readable at 2am',
      'Analytics that answer questions: GA4 events, GTM, Looker dashboards',
      'Pipelines in Python when the data has to be cleaned before it can be trusted',
    ],
    tools: ['SQL', 'PostgreSQL', 'Python', 'GA4', 'Prisma'],
    proof: 'Eagle Analytics System',
  },
  {
    key: 'infra',
    n: '04',
    name: 'Infra',
    tint: 'sky',
    claim: 'Ship it the same way every time.',
    what: [
      'Static and edge hosting with the build in version control',
      'Containers when the environment has to match between machines',
      'A deploy that either passes every gate or does not go out',
    ],
    tools: ['Docker', 'GCP', 'Vercel', 'GitHub Actions', 'Nginx'],
    proof: 'EuroEdge Admission Group',
  },
  {
    key: 'quality',
    n: '05',
    name: 'Quality',
    tint: 'blush',
    claim: 'Prove it still works, every time.',
    what: [
      'Unit tests for logic, end-to-end tests for the paths people actually walk',
      'Accessibility checked with axe on every build, not once at the end',
      'Core Web Vitals measured on the real page instead of argued about',
    ],
    tools: ['Playwright', 'Vitest', 'axe-core', 'Lighthouse'],
    proof: 'This site',
  },
] as const;

/* The trace: what happens to a single request as it crosses the stack. */
export const trace = [
  { layer: 'interface', line: 'Someone types into a search field.' },
  { layer: 'logic', line: 'The handler validates the input and rejects anything malformed.' },
  { layer: 'data', line: 'The query runs against an index — not a table scan.' },
  { layer: 'infra', line: 'The response is served from the edge, cached where it can be.' },
  { layer: 'quality', line: 'A test already covers this path, so the next change is safe.' },
] as const;
