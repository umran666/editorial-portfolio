# The Fieldnotes Editor — AI Research Lab Journal

A personal AI research journal built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. It publishes lab notes and project records from local Markdown, with Zod frontmatter validation, Shiki code highlighting, RSS feeds, taxonomy pages, and static-friendly routes.

The site is intentionally a journal rather than a product catalogue. Content distinguishes implementation details, research questions, hypotheses, and measured results instead of presenting unsupported metrics as achievements.

## Content model

- `content/about.md` — site configuration, researcher profile, working threads, and experience.
- `content/articles/` — technical notes and implementation logs.
- `content/projects/` — research projects and code-grounded records.

Article frontmatter requires `title`, `date`, and `excerpt`. Project frontmatter requires `title`, `date`, and `summary`; optional repository links should point to a real source.

## Architecture

- **Framework:** Next.js 15 App Router, React 19, TypeScript.
- **Content:** local Markdown parsed with `gray-matter` and rendered with `marked`.
- **Validation:** Zod schemas in `src/lib/types.ts`.
- **Code:** Shiki highlighting with a client-side copy control.
- **Discovery:** RSS, sitemap, robots, tags, and static route generation.
- **Testing:** TypeScript unit tests plus Playwright-based route checks.

## Directory structure

```text
content/
├── about.md
├── articles/
└── projects/
src/
├── app/                 # journal, notes, projects, about, tags, feeds
├── components/          # navigation, cards, hero, timeline, footer
└── lib/                 # schemas, content loading, Markdown, RSS
test/                    # unit and end-to-end checks
```

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
```

The repository contains the website implementation only. Research claims belong in the linked project sources and experiment records; the journal should not imply a result that those sources do not support.
