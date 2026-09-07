# Fozayel Ibn Ayaz — The Work World

## 01. Product idea

The visitor does not open a resume. They enter a working world: a blue-black studio where a developer sits behind a large living display. The display has five unmistakable controls. Clicking a control moves the character rig, changes the display state, and opens the complete chapter on the right.

The experience should feel like meeting the person behind the work — thoughtful, practical, curious, and capable of connecting product, code, data, marketing, and the last-mile details.

## 02. Five display controls

1. **PERSON / signal** — identity, working style, portrait, and the human point of view.
2. **WORK / proof** — six case files with contribution, implementation, stack, and outcome.
3. **SKILLS / instruments** — engineering, data, WordPress, QA, and hands-on digital marketing learned through a family business.
4. **PATH / field notes** — experience and education without inflated claims.
5. **CONTACT / open loop** — direct email, phone, GitHub, CV, availability, and next conversation.

## 03. Humanized content direction

The writing avoids generic portfolio claims and fake metrics. It uses specific observations and a warmer voice:

- “I notice the empty state, the missing tracking event, and the customer who stopped replying.”
- “I learned digital marketing in a family business: make the offer clear, put it where people look, listen to real questions, then improve what gets ignored.”
- “I like the seam between a polished interface and the system that has to keep it honest.”

The digital marketing section will identify the practical skills missing from the previous portfolio: family-business marketing practice, content and offer positioning, social content systems, local discovery/SEO thinking, landing-page conversion, customer feedback loops, and measurement with GA4, GTM, and Looker Studio. These will be presented as hands-on experience, not invented campaign numbers.

## 04. UI and motion system

- Blue-black default theme with electric blue, cyan, and violet signals.
- Light mode switcher with a separate high-contrast palette.
- A large 3D display board in front of the developer, with five large DOM controls for clarity and keyboard access.
- A full right-side chapter panel that never hides content behind a game or forced start screen.
- Character motion uses eased travel, chair/rig movement, subtle head and arm gestures, screen glow changes, and reduced-motion support.
- Mobile becomes a normal document flow: character stage, horizontal display controls, then chapter content.
- Typography uses normal kerning, safe line lengths, `text-wrap: balance`, and conservative letter spacing so no letters collide at any viewport.

## 05. Technical build

- Vite + Three.js with no remote runtime assets.
- Procedural seated developer, desk, chair, monitor, display board, lighting, and soft shadows.
- Actual stage dimensions drive the camera and renderer on resize.
- CSS variables power dark/light themes and persist the preference in local storage.
- Five buttons, number keys 1–5, scroll-safe layout, project case-file overlay, portrait fallback, CV, and GitHub Pages relative assets.

## 06. Validation gates

- `npm ci && npm run build` must pass.
- Development and production preview must serve the new entry and transformed assets.
- Test display controls, keyboard controls, case files, theme switcher, portrait, CV, GitHub, mail, and phone links.
- Check 320px, 390px, 768px, 1024px, 1440px, and wide desktop layouts.
- Keep the GitHub Pages workflow configured for `/portfolio/`.
