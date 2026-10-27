/* =============================================================================
   CONTENT — single source of truth. Copy is deliberately short.
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
    'Full-stack developer in Dhaka working where projects quietly fail — between code, data and deployment. React, Next.js, Node.js, WordPress, GA4, Playwright.',
  cv: 'files/Fozayel_Ibn_Ayaz_CV.pdf',
};

export const nav = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Toolkit', href: '#toolkit' },
  { label: 'Contact', href: '#contact' },
];

/* The hero carries five things and nothing else. */
export const hero = {
  eyebrow: 'Portfolio 2026',
  place: 'Dhaka · GMT+6',
  line1: 'FULL–STACK',
  line2: 'DEVELOPER',
  name: 'Fozayel Ibn Ayaz',
  line: 'Code, data and deployment —',
  lineEm: 'one reliable system.',
  cta: 'See the work',
  cta2: 'Download CV',
};

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
  { key: 'websites', label: 'Websites' },
  { key: 'store', label: 'Stores' },
  { key: 'apps', label: 'Apps' },
  { key: 'dash', label: 'Dashboards' },
] as const;

export const projects: Project[] = [
  {
    key: 'euroedge',
    title: 'EuroEdge Admission Group',
    category: 'websites',
    catLabel: 'Website · UK',
    year: '2026',
    metric: 'Any programme in 2 clicks',
    badge: 'Live',
    badgeKind: 'live',
    link: 'https://euroedgeadmissiongroup.com/',
    image: 'img/work-euroedge.webp',
    tags: ['WordPress', 'Elementor', 'SEO'],
    caseStudy: {
      sub: 'A clearer front door for a UK student consultancy.',
      problem:
        'Services were buried three levels deep, and every new programme page needed a developer.',
      did: [
        'Restructured the site around destinations, courses, visas and partner universities',
        'Built a page system the team can extend without touching code',
        'Added FAQ and programme structured data for search',
      ],
      changed:
        'Students reach any programme in two clicks, and new pages ship in an afternoon.',
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
    metric: '30+ AI function-calling tools',
    badge: 'Live',
    badgeKind: 'live',
    link: 'https://youtube-command-center-eight.vercel.app',
    image: 'img/work-youtube.webp',
    tags: ['Next.js', 'TypeScript', 'OAuth'],
    caseStudy: {
      sub: 'One screen instead of six browser tabs.',
      problem:
        'Channel reviews meant jumping between analytics tabs to work out what actually worked.',
      did: [
        'Pulled video and channel data into one dashboard',
        'Added plain-language explanations of why a video performed',
        'Built comparison views for hooks, titles and timing',
      ],
      changed:
        'Weekly reviews went from hours of tab-switching to minutes on one screen.',
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
    metric: 'New pages, zero downtime',
    badge: 'Live · Client',
    badgeKind: 'live',
    link: 'https://demenagement-blondeau.com',
    image: 'img/work-blondeau.webp',
    tags: ['WordPress', 'Local SEO', 'Ongoing'],
    caseStudy: {
      sub: 'A ninety-year-old moving company, finally findable online.',
      problem:
        'A long-established Paris mover with almost no organic presence and a quote form few people finished.',
      did: [
        'Rebuilt the site around the four services that actually convert',
        'Streamlined the quote form to a single short step',
        'Set up local SEO and service-page structure',
      ],
      changed:
        'Quote requests arrive with the details needed to price them, and pages can be added without downtime.',
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
    image: 'img/work-eaglebi.webp',
    tags: ['Python', 'Streamlit', 'MongoDB'],
    caseStudy: {
      sub: 'Numbers the team actually opens.',
      problem:
        'Reporting lived in spreadsheets that nobody refreshed, so meetings started with an argument about whose figure was right.',
      did: [
        'Consolidated streaming and catalog data into one BI pipeline',
        'Built a 10-page dashboard covering KPIs, YouTube, revenue and retention',
        'Added anomaly alerts that fire within 15 minutes, backed by 151 tests',
      ],
      changed:
        'One link, one set of numbers, and a review that starts with decisions instead of data arguments.',
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
    metric: 'Two brands, one clean system',
    badge: 'Live · Client',
    badgeKind: 'live',
    link: 'https://demenagementgauvin.com',
    image: 'img/work-gauvin.webp',
    tags: ['WordPress', 'Content', 'Support'],
    caseStudy: {
      sub: 'Two moving brands sharing one codebase.',
      problem:
        'Two related companies needed separate identities without paying for two separate builds.',
      did: [
        'Built one theme driving two brand configurations',
        'Wrote page templates for services, zones and quotes',
        'Handed over an editing guide the team still uses',
      ],
      changed:
        'Both sites stay consistent and either can be updated in minutes.',
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
    metric: 'Full storefront, built solo',
    badge: 'Concept',
    badgeKind: 'concept',
    link: 'https://fozayelibnayaz.github.io/ZENJI-Anime-Streetwear/',
    image: 'img/work-zenji.webp',
    tags: ['Next.js', 'React', 'UI/UX'],
    caseStudy: {
      sub: 'An editorial storefront for an anime streetwear label.',
      problem:
        'Streetwear drops live or die on how the product looks on screen and how quickly checkout moves.',
      did: [
        'Designed an editorial product page with image-led hierarchy',
        'Built cart and checkout flow in Next.js',
        'Kept the whole catalogue fast on mid-range phones',
      ],
      changed:
        'A storefront that reads like a lookbook and still gets people to checkout in three taps.',
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
    metric: 'Daily market prices, in Bangla',
    badge: 'Live',
    badgeKind: 'live',
    link: 'https://bazar-dor-ten-tau.vercel.app',
    image: 'img/work-bazardor.webp',
    tags: ['TypeScript', 'Vercel', 'Bangla UI'],
    caseStudy: {
      sub: 'A daily price board for the kitchen.',
      problem:
        'Households in Dhaka have no simple way to know what vegetables cost before they go to market.',
      did: [
        'Designed a Bangla-first interface with large, glanceable figures',
        'Built daily price entry and day-over-day comparison',
        'Kept the whole thing usable on a low-end phone',
      ],
      changed:
        'A price check that takes five seconds, in the language people actually read it in.',
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
    metric: '14 modules · 124 countries · 155 tests',
    badge: 'Live',
    badgeKind: 'live',
    link: 'https://ayaz-prospect-studio.ayazwork2026.workers.dev/',
    image: 'img/work-prospect.webp',
    tags: ['Cloudflare Workers', 'D1', 'Gmail API'],
    caseStudy: {
      sub: 'A follow-up system for people who hate follow-ups.',
      problem:
        'Freelance pipelines stall because the next message never gets written, not because leads are missing.',
      did: [
        'Built a B2B prospecting CRM with 14 modules and a clear next action on every row',
        'Wired Gmail API sending and staged outreach templates across 124 countries',
        'Covered the whole flow with 155 automated tests on Cloudflare Workers and D1',
      ],
      changed:
        'Every open lead has a next step and a date, so nothing quietly dies.',
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

export const capabilities = [
  { icon: 'build', k: '01', title: 'Build', line: 'Sites, stores, web apps', bullet: 'Design → code → launch' },
  { icon: 'measure', k: '02', title: 'Measure', line: 'Tracking, dashboards, SEO', bullet: 'So you can see what works' },
  { icon: 'care', k: '03', title: 'Verify', line: 'QA, tests, release checks', bullet: 'Nothing quietly breaks' },
];

export const stats = [
  { n: '4', plus: true, l: 'Years shipping' },
  { n: '8', plus: false, l: 'Live projects' },
  { n: '5', plus: false, l: 'Roles held' },
  { n: '4', plus: false, l: 'Countries' },
];

export const about = {
  lead: 'I work where most projects quietly fail — in the space between code, data and deployment.',
  bio: 'Full-stack developer in Dhaka, connecting frontend, backend, analytics and testing into one reliable system.',
  facts: [
    { k: 'Based', v: 'Dhaka, Bangladesh' },
    { k: 'Focus', v: 'Web · Data · QA' },
    { k: 'Now', v: 'WordPress dev @ Ekomedia' },
  ],
  quote: 'If it is not measured, it is not finished.',
};

export const experience = [
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

/* Languages — from the CV */
export const languages = [
  { name: 'Bengali', level: 'Native' },
  { name: 'English', level: 'IELTS 6.5 · B2' },
];

export const transmission = [
  { name: 'TypeScript', cat: 'Language', used: 'Typed interfaces, end to end' },
  { name: 'Next.js', cat: 'Frontend', used: 'Apps, dashboards, this site' },
  { name: 'React', cat: 'Frontend', used: 'Dashboards & stores' },
  { name: 'Node.js', cat: 'Backend', used: 'APIs & tooling' },
  { name: 'WordPress', cat: 'CMS', used: 'ACF, CPTs, client builds' },
  { name: 'Python', cat: 'Data', used: 'BI pipelines & forecasting' },
  { name: 'GA4 + GTM', cat: 'Analytics', used: 'Event & dataLayer design' },
  { name: 'Looker Studio', cat: 'Analytics', used: 'Dashboards leadership opens' },
  { name: 'Playwright', cat: 'QA', used: 'Automated release checks' },
  { name: 'Docker', cat: 'Infra', used: 'Repeatable environments' },
];

export const skillGroups = [
  {
    label: 'Languages',
    items: ['JavaScript (ES6+)', 'TypeScript', 'SQL', 'Java', 'PHP', 'Python', 'C++', 'C', 'HTML5', 'CSS3'],
  },
  {
    label: 'Web',
    items: ['Next.js', 'React', 'Node.js', 'Express', 'WordPress', 'WooCommerce', 'Figma', 'SEO'],
  },
  {
    label: 'Data',
    items: ['GA4', 'GTM', 'Looker Studio', 'Prophet', 'ARIMA', 'LSTM', 'Hadoop', 'Hive', 'Spark'],
  },
  {
    label: 'Infra & tools',
    items: ['GCP', 'Docker', 'Kubernetes', 'MySQL', 'MariaDB', 'Supabase', 'Firebase', 'Playwright', 'Postman', 'Unreal Engine'],
  },
];

export const contact = {
  line1: 'LET’S BUILD',
  line2: 'something',
  lead: 'Tell me what you need built. A rough idea is enough.',
  tiles: [
    { k: 'Email', v: 'ibnayaz789@gmail.com', href: 'mailto:ibnayaz789@gmail.com' },
    { k: 'WhatsApp', v: '+880 1726 611455', href: 'tel:+8801726611455' },
    { k: 'GitHub', v: '/fozayelibnayaz', href: 'https://github.com/fozayelibnayaz' },
  ],
};

export const extraWork = [
  { label: 'DevStack', meta: 'Demo', href: 'https://fozayelibnayaz.github.io/Devstack/' },
  { label: 'GitHub', meta: 'Code', href: 'https://github.com/fozayelibnayaz' },
];
