# Gokul J. — Personal Portfolio Website

A fast, accessible, editorial personal portfolio built with Astro, TypeScript, and Tailwind CSS. Designed around the theme **"Systems that sense and reason"** for Gokul J., an undergraduate student in Computer Science and Design at SRM Easwari Engineering College.

---

## Features

- **Performance & Light Footprint**: Pure static generation, zero bulky runtime frameworks, total client JS ~16 KB (far below the 100 KB budget).
- **Self-Hosted Typography**: Space Grotesk (Headings), Inter (Body), and JetBrains Mono (Metadata/Wayfinding) self-hosted via Fontsource with zero external CDNs.
- **Accessibility (WCAG 2.2 AA)**: Fully audited with `axe-core` (0 violations), semantic landmarks, skip link, logical heading hierarchy, and visible focus rings.
- **Theme Support**: Seamless dark/light modes with anti-FOUC initialization script and persistent user preference.
- **Responsive Architecture**: Mobile-first fluid layout with no horizontal scroll at 360px, 768px, 1024px, and 1440px.
- **SEO & Social Cards**: Dynamic Open Graph / Twitter meta tags, Person JSON-LD structured data, XML sitemaps, and robots.txt.

---

## Project Structure

```text
portfolio/
├── public/
│   ├── favicon.svg             # Minimal radar/signal vector favicon
│   ├── images/
│   │   └── profile.jpg         # Personal portrait photo (400x400)
│   ├── og-image.png            # 1200x630 Open Graph card
│   ├── og-image.svg            # Vector source for OG card
│   ├── robots.txt              # Crawler permissions
│   └── screenshots/            # Automated multi-viewport test screenshots
├── src/
│   ├── components/
│   │   ├── diagrams/           # 16:9 inline SVG project diagrams
│   │   │   ├── EchoGridDiagram.astro
│   │   │   └── SatQueryDiagram.astro
│   │   ├── About.astro         # Academic background and focus
│   │   ├── Contact.astro       # Obfuscated email & social links
│   │   ├── Education.astro     # Degree and institution details
│   │   ├── Experience.astro    # Vertical timeline of professional internships
│   │   ├── Footer.astro        # Semantic footer & system specs
│   │   ├── Header.astro        # Sticky navigation & mobile focus-trapped drawer
│   │   ├── Hero.astro          # Split hero layout with portrait & radar telemetry
│   │   ├── Interests.astro     # Research and engineering focus areas
│   │   ├── ProjectCard.astro   # Interactive project card component
│   │   ├── ProjectsSection.astro # Grid of featured systems
│   │   ├── SectionHeading.astro# Monospace wayfinding headings
│   │   ├── Skills.astro        # Grouped technical competencies
│   │   └── ThemeToggle.astro   # Dark/light mode switcher
│   ├── content/
│   │   └── projects/           # Markdown case studies
│   │       ├── echogrid.md
│   │       └── satquery-ai.md
│   ├── data/
│   │   └── site.ts             # Central source of truth for portfolio profile
│   ├── layouts/
│   │   └── Base.astro          # Root layout, meta, JSON-LD, skip link, transitions
│   ├── pages/
│   │   ├── 404.astro           # Friendly 404 signal-lost page
│   │   ├── index.astro         # Home page assembling all sections
│   │   └── projects/
│   │       └── [slug].astro    # Dynamic case study template
│   └── styles/
│       └── tokens.css          # Semantic CSS-variable design tokens
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:4321](http://localhost:4321) in your browser.

### Type Check & Production Build
```bash
npm run build
```
Builds the static output to `./dist/`.

### Preview Production Build
```bash
npm run preview
```

### Code Quality & Auditing
```bash
npm run lint          # Run ESLint
npm run format        # Format with Prettier
node scripts/audit.mjs # Run Playwright + axe-core accessibility and responsive audit
```

---

## Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel` or connect the repository on [vercel.com](https://vercel.com).
2. Framework Preset: **Astro**
3. Build Command: `npm run build`
4. Output Directory: `dist`

### Netlify
1. Connect the repository on [netlify.com](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`

### Cloudflare Pages
1. In Cloudflare Dashboard, go to **Workers & Pages** > **Create application** > **Pages**.
2. Framework preset: **Astro**
3. Build command: `npm run build`
4. Build output directory: `dist`

---

## How to Add a Project

Adding a new project requires adding only **one** Markdown file in `src/content/projects/`:

1. Create a new file, for example: `src/content/projects/my-new-system.md`:
   ```markdown
   ---
   title: "My New System"
   index: "03"
   category: "COMPUTER VISION"
   status: "In Progress"
   statusType: "in-progress"
   summary: "A concise 1-2 sentence factual summary of what the system does."
   topics:
     - "Computer Vision"
     - "Python"
   architectureLabel: "Pipeline Architecture Visual"
   repoUrl: "https://github.com/gokul-0507/my-new-system" # optional
   ---

   ## Overview
   Detailed description of the system origin and objectives.

   ## Problem
   The concrete computational or physical challenge addressed.

   ## Approach & Architecture
   Structured step-by-step description of system components.

   ## Tech Stack
   - Python
   - OpenCV / PyTorch

   ## My Role
   System architect and core implementation.

   ## Status and Next Steps
   Current development milestone and planned iterations.
   ```
2. Also register the project card metadata in `src/data/site.ts` under `projects`:
   ```typescript
   {
     id: 'my-new-system',
     slug: 'my-new-system',
     index: '03',
     category: 'COMPUTER VISION',
     title: 'My New System',
     status: 'In Progress',
     statusType: 'in-progress',
     summary: 'A concise 1-2 sentence factual summary of what the system does.',
     topics: ['Computer Vision', 'Python'],
     repoUrl: 'https://github.com/gokul-0507/my-new-system',
     hasCaseStudy: true,
   }
   ```
3. Run `npm run build` to verify generation of `/projects/my-new-system/index.html`.

---

## Adding Your Profile Photo

To use your real photograph:
1. Copy your portrait picture to `public/images/profile.jpg`.
2. Ensure it is oriented right-side up with a clean background.
3. Re-run `npm run build`. The image automatically scales cleanly inside the circular radar frame.
