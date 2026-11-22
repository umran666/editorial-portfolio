import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SiteConfigSchema,
  ArticleFrontmatterSchema,
  ProjectFrontmatterSchema,
  QuoteSchema,
} from "../src/lib/types";
import {
  calculateReadingTime,
  renderMarkdown,
} from "../src/lib/markdown";
import {
  getSiteConfig,
  getAllArticles,
  getArticleBySlug,
  getAllProjects,
  getProjectBySlug,
  getAllQuotes,
  getAllTags,
  getItemsByTag,
} from "../src/lib/content";
import { generateRssFeed } from "../src/lib/rss";

describe("1. Zod Schema Validation & Fallbacks", () => {
  it("SiteConfigSchema should provide robust defaults when empty object is passed", () => {
    const config = SiteConfigSchema.parse({});
    assert.equal(config.siteTitle, "Shaik Umran — Research & Engineering Journal");
    assert.equal(config.authorName, "Shaik Umran");
    assert.equal(typeof config.bio, "string");
    assert.ok(config.bio.length > 0);
    assert.equal(config.social.rss, "/rss.xml");
  });

  it("SiteConfigSchema should gracefully recover individual invalid fields without failing the whole schema", () => {
    const corruptedInput = {
      siteTitle: "Valid Title",
      email: "not-an-email-address", // Invalid email
      social: {
        github: "not-a-url", // Invalid url
        rss: "/rss.xml",
      },
    };
    const parsed = SiteConfigSchema.parse(corruptedInput);
    assert.equal(parsed.siteTitle, "Valid Title");
    // Invalid email should fall back cleanly
    assert.equal(parsed.email, "shaikumran487@gmail.com");
    // Invalid github url should fall back cleanly
    assert.equal(parsed.social.github, undefined);
  });

  it("SiteConfigSchema should correctly parse valid customized configuration", () => {
    const custom = {
      siteTitle: "Custom Monograph",
      siteSubtitle: "A personal engineering ledger",
      authorName: "Ada Lovelace",
      authorRole: "First Programmer",
      bio: "Pioneering mechanical computing notes.",
      email: "ada@analytical.org",
      social: {
        github: "https://github.com/ada",
        rss: "/rss.xml",
      },
      skills: ["Analytical Engine", "Babbage Assembly"],
      experience: [
        {
          role: "Chief Mathematician",
          company: "Analytical Guild",
          period: "1843",
        },
      ],
    };
    const parsed = SiteConfigSchema.parse(custom);
    assert.equal(parsed.authorName, "Ada Lovelace");
    assert.equal(parsed.skills.length, 2);
    assert.equal(parsed.experience[0].company, "Analytical Guild");
  });

  it("ArticleFrontmatterSchema should enforce title, date, and excerpt", () => {
    const valid = {
      title: "Testing Determinism",
      date: "2026-11-20",
      excerpt: "A brief summary of determinism in state machines.",
      tags: ["systems", "verification"],
    };
    const parsed = ArticleFrontmatterSchema.parse(valid);
    assert.equal(parsed.title, "Testing Determinism");
    assert.equal(parsed.draft, false);
    assert.equal(parsed.featured, false);

    // Invalid missing required fields
    const invalid = { title: "Missing date and excerpt" };
    const result = ArticleFrontmatterSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });

  it("ProjectFrontmatterSchema should enforce required project metadata", () => {
    const validProject = {
      title: "Cache Engine",
      date: "2026-05-01",
      summary: "Sub-microsecond KV store in C++23.",
      tags: ["cpp", "cache"],
      techStack: ["C++", "SIMD", "HugePages"],
      githubUrl: "https://github.com/vance/cache-engine",
    };
    const parsed = ProjectFrontmatterSchema.parse(validProject);
    assert.equal(parsed.title, "Cache Engine");
    assert.equal(parsed.techStack.length, 3);
  });

  it("QuoteSchema should validate aphorisms correctly", () => {
    const validQuote = {
      id: "test-quote",
      quote: "Premature optimization is the root of all evil.",
      author: "Donald Knuth",
      source: "Structured Programming",
      category: "Computing",
    };
    const parsed = QuoteSchema.parse(validQuote);
    assert.equal(parsed.author, "Donald Knuth");
  });
});

describe("2. Markdown Engine & Shiki Syntax Highlighting", () => {
  it("calculateReadingTime should handle empty, short, and long texts accurately", () => {
    assert.equal(calculateReadingTime(""), "1 min read");
    assert.equal(calculateReadingTime("Just ten simple words for this very brief test statement."), "1 min read");

    // 450 words should compute to 3 min read (Math.ceil(450/200) = 3)
    const longText = Array(450).fill("word").join(" ");
    assert.equal(calculateReadingTime(longText), "3 min read");

    // Non-string resilience
    assert.equal(calculateReadingTime((null as unknown) as string), "1 min read");
    assert.equal(calculateReadingTime((undefined as unknown) as string), "1 min read");
  });

  it("calculateReadingTime should strip code fences before counting words", () => {
    const textWithHugeCode = "Five words before code.\n```rust\n" + Array(800).fill("let x = 1;").join("\n") + "\n```";
    assert.equal(calculateReadingTime(textWithHugeCode), "1 min read");
  });

  it("renderMarkdown should highlight code blocks with Shiki and embed copy button markup", async () => {
    const markdown = `# Architecture\n\nHere is a code snippet:\n\n\`\`\`rust\nfn compute(x: u64) -> u64 {\n    x * 2\n}\n\`\`\``;
    const html = await renderMarkdown(markdown);

    assert.ok(html.includes("<h1"), "Should render h1");
    assert.ok(html.includes("shiki-wrapper"), "Should contain shiki-wrapper container");
    assert.ok(html.includes("code-copy-btn"), "Should contain interactive copy button");
    assert.ok(html.includes("rust"), "Should include language identifier");
    assert.ok(html.includes("data-raw-code="), "Should contain URL-encoded raw code for clipboard");
  });

  it("renderMarkdown should support extended languages like C, TOML, and gracefully handle unknown languages", async () => {
    const cSnippet = "```c\nint main(void) { return 0; }\n```";
    const tomlSnippet = "```toml\n[package]\nname = \"mesh\"\n```";
    const unknownSnippet = "```pseudo-algo\nWHILE True DO Tick()\n```";

    const cHtml = await renderMarkdown(cSnippet);
    assert.ok(cHtml.includes("shiki-wrapper"), "C snippet should render in shiki-wrapper");

    const tomlHtml = await renderMarkdown(tomlSnippet);
    assert.ok(tomlHtml.includes("shiki-wrapper"), "TOML snippet should render in shiki-wrapper");

    const unknownHtml = await renderMarkdown(unknownSnippet);
    assert.ok(unknownHtml.includes("shiki-wrapper"), "Unknown lang should fall back gracefully without error");
  });

  it("renderMarkdown should format external links with target=_blank and rel=noopener", async () => {
    const markdown = "Visit [Google](https://google.com) or [Local Section](/about).";
    const html = await renderMarkdown(markdown);

    assert.ok(html.includes('target="_blank"'), "External link should have target=_blank");
    assert.ok(html.includes('rel="noopener noreferrer"'), "External link should have rel");
    assert.ok(!html.includes('href="/about" target="_blank"'), "Internal link should not have target=_blank");
  });
});

describe("3. Content & Taxonomy Queries", () => {
  it("getSiteConfig should read content/about.md successfully", async () => {
    const { config, contentHtml } = await getSiteConfig();
    assert.ok(config.siteTitle, "Site title must exist");
    assert.ok(config.authorName, "Author name must exist");
    assert.ok(contentHtml.length > 50, "Content HTML must be rendered");
    assert.ok(config.experience.length > 0, "Experience entries must exist");
  });

  it("getAllArticles should return sorted list with reading time", () => {
    const articles = getAllArticles();
    assert.ok(articles.length >= 3, `Expected at least 3 articles, got ${articles.length}`);

    // Verify chronological descending sort
    for (let i = 0; i < articles.length - 1; i++) {
      const current = new Date(articles[i].date).getTime();
      const next = new Date(articles[i + 1].date).getTime();
      assert.ok(current >= next, "Articles must be sorted descending by date");
    }

    // Verify reading time
    for (const a of articles) {
      assert.ok(a.readingTime.includes("min read"), `Reading time missing for ${a.slug}`);
    }
  });

  it("getArticleBySlug should return article with rendered content, or null if non-existent", async () => {
    const article = await getArticleBySlug("inside-uniqtoken-tokenizer-architecture");
    assert.ok(article !== null, "Article should exist");
    assert.ok(article.contentHtml && article.contentHtml.includes("Byte-Pair Encoding"), "Should contain parsed code");

    const nonExistent = await getArticleBySlug("phantom-article-does-not-exist");
    assert.equal(nonExistent, null, "Non-existent slug should return null");
  });

  it("getAllProjects should return projects sorted descending by date", () => {
    const projects = getAllProjects();
    assert.ok(projects.length >= 3, `Expected at least 3 projects, got ${projects.length}`);

    for (let i = 0; i < projects.length - 1; i++) {
      const current = new Date(projects[i].date).getTime();
      const next = new Date(projects[i + 1].date).getTime();
      assert.ok(current >= next, "Projects must be sorted descending by date");
    }
  });

  it("getProjectBySlug should return project with rendered HTML, or null if non-existent", async () => {
    const project = await getProjectBySlug("uniqtoken");
    assert.ok(project !== null, "Project should exist");
    assert.ok(project.contentHtml && project.contentHtml.includes("UniqToken"), "Should contain case study text");

    const nonExistent = await getProjectBySlug("phantom-project");
    assert.equal(nonExistent, null);
  });

  it("getAllQuotes should return curated aphorisms", () => {
    const quotes = getAllQuotes();
    assert.ok(quotes.length >= 3, `Expected at least 3 quotes, got ${quotes.length}`);
    assert.ok(quotes.some((q) => q.author.includes("Dijkstra")));
  });

  it("getAllTags should aggregate tags across articles and projects with correct counts", () => {
    const tags = getAllTags();
    assert.ok(tags.length > 0, "Tags should not be empty");
    assert.ok(tags.some((t) => t.name === "tokenization" || t.name === "nlp"), "Tokenization or NLP tag should appear");

    // Verify sorted descending by count
    for (let i = 0; i < tags.length - 1; i++) {
      assert.ok(tags[i].count >= tags[i + 1].count, "Tags should be sorted descending by count");
    }
  });

  it("getItemsByTag should retrieve matching items and handle non-existent tags gracefully", () => {
    const nlpItems = getItemsByTag("nlp");
    assert.ok(nlpItems.articles.length > 0, "Should find articles tagged with nlp");
    assert.ok(nlpItems.projects.length > 0, "Should find projects tagged with nlp");

    // Case insensitive test
    const upperCaseItems = getItemsByTag("NLP");
    assert.equal(upperCaseItems.articles.length, nlpItems.articles.length);

    // Non-existent tag
    const emptyItems = getItemsByTag("non-existent-tag-xyz");
    assert.equal(emptyItems.articles.length, 0);
    assert.equal(emptyItems.projects.length, 0);

    // Malformed URI query strings should not throw URIError
    const malformed = getItemsByTag("%invalid%query");
    assert.equal(malformed.articles.length, 0);
  });
});

describe("4. Automated RSS Feed Generation", () => {
  it("generateRssFeed should generate valid RSS 2.0 XML with all items", async () => {
    const feedXml = await generateRssFeed("/rss.xml");
    assert.ok(feedXml.startsWith("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"));
    assert.ok(feedXml.includes("<rss version=\"2.0\""));
    assert.ok(feedXml.includes("<channel>"));
    assert.ok(feedXml.includes("Shaik Umran"));
    assert.ok(feedXml.includes("<item>"));
    assert.ok(feedXml.includes("Inside UniqToken") || feedXml.includes("UniqToken"));
    assert.ok(feedXml.includes("<guid isPermaLink=\"true\">"));
    assert.ok(feedXml.includes('href="https://shaikumran.dev/rss.xml"'));

    // Support /feed.xml path
    const feedXmlAlt = await generateRssFeed("/feed.xml");
    assert.ok(feedXmlAlt.includes('href="https://shaikumran.dev/feed.xml"'));
  });
});
