# The Journal — Developer Portfolio & Literary Journal

A hybrid Developer Portfolio & Editorial Journal engineered with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**. Designed with an editorial literary aesthetic , featuring local filesystem Markdown content with **Zod frontmatter validation**, zero database requirements, and full static export compatibility.

---

## Typography & Aesthetic Foundations

- **Display & Headings:** `Cinzel` (Roman serif display typography for chapter headings, category stamps, and uppercase tracking).
- **Body & Prose:** `Source Serif 4` (Long-form editorial reading serif for essays, observations, and case studies).
- **Interface & Metadata:** `Inter` (Precise sans-serif for navigation, tag badges, timestamps, and tech pills).
- **Warm Stone Palette:** Built around stone-50 background, stone-900 / stone-700 typography, stone-200 dividers, and stone-950 footer.

---

## Architecture & Features

1. **Zero-Database Content Engine:**
   - Powered by filesystem Markdown (`content/articles/`, `content/projects/`, `content/quotes.json`).
   - Frontmatter validated at compile and runtime with strict **Zod schemas** (`SiteConfigSchema`, `ArticleFrontmatterSchema`, `ProjectFrontmatterSchema`, `QuoteSchema`).
2. **Single-File Global Author & Site Configuration (`content/about.md`):**
   - Profile bio, experience timeline, technical capabilities, and social links are declared in `content/about.md` with comprehensive schema fallbacks.
3. **Syntax Highlighting & Interaction:**
   - Server-side syntax highlighting via **Shiki** (`github-dark-dimmed` theme) with support for Rust, TypeScript, Python, Go, and Bash.
   - Interactive client-side clipboard copy button on all code fences with visual feedback.
4. **Automated Reading Time:**
   - Word count calculated per article (ignoring code fences) and rendered as `X min read`.
5. **Dynamic Taxonomy & Tag Indexing:**
   - `/tags` index page with automated item counts.
   - `/tags/[tag]` dynamic pages aggregating essays and projects matching the topic with full `generateStaticParams()`.
6. **Automated RSS 2.0 Feeds & SEO:**
   - Fully compliant RSS 2.0 feeds generated at `/feed.xml` and `/rss.xml`.
   - Automated XML sitemap at `/sitemap.xml` and `/robots.txt`.
   - OpenGraph, Twitter cards, and Schema.org `BlogPosting` JSON-LD markup.

---

## Directory Structure

```
editorial-portfolio-blog/
├── content/
│   ├── about.md                           # Global site config & author story
│   ├── quotes.json                        # Curated literary & computing aphorisms
│   ├── articles/                          # Technical essays & observations (.md)
│   │   ├── the-architecture-of-stillness.md
│   │   ├── the-latency-illusion.md
│   │   └── on-literary-typography-in-software.md
│   └── projects/                          # Architecture case studies (.md)
│       ├── distributed-event-mesh.md
│       ├── heretic-runtime.md
│       └── verifiable-audit-log.md
├── public/
│   └── images/                            # Optimized covers, avatars, and assets
├── src/
│   ├── app/                               # Next.js 15 App Router routes
│   │   ├── layout.tsx                     # Google fonts (Cinzel, Source Serif 4, Inter)
│   │   ├── globals.css                    # Stone palette & typography styling
│   │   ├── page.tsx                       # Homepage (Observations, Recent, Aphorisms)
│   │   ├── articles/                      # Articles directory & [slug] reader
│   │   ├── projects/                      # Portfolio showcase & [slug] case studies
│   │   ├── quotes/                        # Quotes & aphorisms gallery
│   │   ├── about/                         # Bio, philosophy & experience
│   │   ├── tags/                          # Tag directory & [tag] archive
│   │   ├── feed.xml/ & rss.xml/           # Dynamic RSS 2.0 handlers
│   │   ├── sitemap.ts & robots.ts         # Automated search engine discovery
│   │   └── not-found.tsx                  # Literary 404 page
│   ├── components/                        # UI components (Header, Footer, Cards, Copy)
│   └── lib/                               # Core engine (types, markdown, content, rss)
└── test/                                  # Comprehensive 18-suite test suite
```

---

## Commands

- **Run Dev Server:** `npm run dev`
- **Run Production Build:** `npm run build`
- **Start Production Server:** `npm run start`
- **Execute Linter:** `npm run lint`
- **Execute Automated Tests:** `npm test`
