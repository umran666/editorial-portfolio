import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium, type Browser } from "playwright-core";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CHROME_PATH = process.env.CHROME_PATH || "/usr/bin/google-chrome";

let browser: Browser;

before(async () => {
  browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
});

after(async () => {
  if (browser) {
    await browser.close();
  }
});

// ============================================================================
// Suite 1: Full-Site Link Graph Crawl & Concurrency Stress Test
// ============================================================================
describe("Suite 1: Link Graph Concurrency & Integrity Stress", () => {
  const seedRoutes = [
    "/",
    "/about",
    "/articles",
    "/articles/inside-uniqtoken-tokenizer-architecture",
    "/articles/diffusion-language-models-and-concept-ablation",
    "/articles/memory-bandwidth-and-kv-cache-pruning",
    "/projects",
    "/projects/diffusion-gemma",
    "/projects/mediscan-ai",
    "/projects/rag-pdf-chatbot",
    "/projects/spamshield-ai",
    "/projects/uniqkache",
    "/projects/uniqtoken",
    "/tags",
    "/rss.xml",
    "/feed.xml",
    "/robots.txt",
    "/sitemap.xml",
  ];

  it("1.1 Discover all static/prerendered routes (>= 40 routes) and confirm 200 OK", async () => {
    // Dynamically retrieve all tags from /tags
    const tagsRes = await fetch(`${BASE_URL}/tags`);
    assert.equal(tagsRes.status, 200, "/tags must return 200");
    const tagsHtml = await tagsRes.text();
    const tagMatches = [...tagsHtml.matchAll(/href="(\/tags\/[^"#]+)"/g)].map((m) => m[1]);
    const uniqueTags = Array.from(new Set(tagMatches));

    const allRoutes = Array.from(new Set([...seedRoutes, ...uniqueTags]));
    assert.ok(allRoutes.length >= 40, `Expected at least 40 routes, got ${allRoutes.length}`);

    // Fetch all routes concurrently in batches of 15
    const batchSize = 15;
    for (let i = 0; i < allRoutes.length; i += batchSize) {
      const batch = allRoutes.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (route) => {
          const res = await fetch(`${BASE_URL}${route}`);
          return { route, status: res.status };
        })
      );
      for (const r of results) {
        assert.equal(
          r.status,
          200,
          `Route ${r.route} returned status ${r.status} instead of 200`
        );
      }
    }
  });

  it("1.2 Deep crawl: verify 0 broken links and 0 stale 'diffusiongemma' links across entire link graph", async () => {
    // Collect all links across all pages
    const tagsRes = await fetch(`${BASE_URL}/tags`);
    const tagsHtml = await tagsRes.text();
    const tagMatches = [...tagsHtml.matchAll(/href="(\/tags\/[^"#]+)"/g)].map((m) => m[1]);
    const allPages = Array.from(new Set([...seedRoutes, ...tagMatches]));

    const internalLinks = new Set<string>();
    const linkOrigins = new Map<string, string[]>();

    for (const pagePath of allPages) {
      const res = await fetch(`${BASE_URL}${pagePath}`);
      const text = await res.text();

      // Check explicitly for stale regression
      assert.ok(
        !text.includes("/projects/diffusiongemma\"") && !text.includes("/projects/diffusiongemma'"),
        `Stale unhyphenated link '/projects/diffusiongemma' found on page ${pagePath}`
      );

      const hrefs = [...text.matchAll(/href="([^"#]+)"/g)].map((m) => m[1]);
      for (const href of hrefs) {
        if (
          href.startsWith("http://") ||
          href.startsWith("https://") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        ) {
          continue;
        }
        const norm = href.startsWith("/") ? href : `/${href}`;
        internalLinks.add(norm);
        if (!linkOrigins.has(norm)) linkOrigins.set(norm, []);
        linkOrigins.get(norm)!.push(pagePath);
      }
    }

    assert.ok(internalLinks.size >= 30, `Expected at least 30 internal links, found ${internalLinks.size}`);

    // Verify all internal target URLs concurrently
    const broken: Array<{ link: string; status: number; sources: string[] }> = [];
    const linkArray = Array.from(internalLinks);

    await Promise.all(
      linkArray.map(async (link) => {
        try {
          const res = await fetch(`${BASE_URL}${link}`);
          if (res.status !== 200) {
            broken.push({ link, status: res.status, sources: linkOrigins.get(link) || [] });
          }
        } catch {
          broken.push({ link, status: -1, sources: linkOrigins.get(link) || [] });
        }
      })
    );

    assert.equal(
      broken.length,
      0,
      `Broken internal links found: ${JSON.stringify(broken, null, 2)}`
    );
  });

  it("1.3 High concurrency stress burst: 100 concurrent requests without failure or 500 error", async () => {
    const testEndpoints = [
      "/",
      "/articles",
      "/projects",
      "/about",
        "/tags",
      "/articles/inside-uniqtoken-tokenizer-architecture",
      "/projects/diffusion-gemma",
    ];

    const promises: Promise<{ status: number; duration: number }>[] = [];
    for (let i = 0; i < 100; i++) {
      const ep = testEndpoints[i % testEndpoints.length];
      const start = Date.now();
      promises.push(
        fetch(`${BASE_URL}${ep}`).then((res) => ({
          status: res.status,
          duration: Date.now() - start,
        }))
      );
    }

    const results = await Promise.all(promises);
    const failures = results.filter((r) => r.status !== 200);
    assert.equal(failures.length, 0, `Expected 0 failed requests under 100-burst, got ${failures.length}`);

    const maxDuration = Math.max(...results.map((r) => r.duration));
    const avgDuration = results.reduce((acc, r) => acc + r.duration, 0) / results.length;
    console.log(`[Stress] 100 concurrent requests: avg=${avgDuration.toFixed(1)}ms, max=${maxDuration}ms`);
  });
});

// ============================================================================
// Suite 2: Adversarial Deep Links, Path Traversal & Injection Probing
// ============================================================================
describe("Suite 2: Adversarial Deep Links & Slug Robustness", () => {
  const adversarialSlugs = [
    // Path traversal probes
    "/articles/../../etc/passwd",
    "/projects/..%2f..%2f..%2fpackage.json",
    "/tags/..%2f..%2f",
    "/articles/%2e%2e%2f%2e%2e%2f",
    // Special chars and symbols
    "/articles/<script>alert(1)</script>",
    "/projects/'OR'1'='1",
    "/articles/null%00byte",
    "/projects/%20%20spaces%20%20",
    "/tags/!@%23$%^&*()",
    "/tags/🤖_emoji_tag",
    "/tags/%F0%9F%A4%96",
    // Extreme length slug
    `/articles/${"a".repeat(500)}`,
    `/projects/${"x".repeat(500)}`,
    // Missing slugs
    "/articles/non-existent-note-slug-9999",
    "/projects/unindexed-experimental-project-slug",
    "/tags/non-existent-taxonomy-tag-xyz",
  ];

  it("2.1 Adversarial probes must return clean 404 or safe 200 fallback, NEVER 500 or crash", async () => {
    for (const slug of adversarialSlugs) {
      const url = `${BASE_URL}${slug}`;
      let res;
      try {
        res = await fetch(url);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        assert.fail(`Server crashed or connection reset when requesting adversarial slug ${slug}: ${message}`);
      }

      assert.notEqual(
        res.status,
        500,
        `Adversarial request ${slug} caused HTTP 500 Internal Server Error!`
      );
      assert.ok(
        res.status === 404 || res.status === 200 || res.status === 400,
        `Expected status 404, 200, or 400 for ${slug}, got ${res.status}`
      );
    }
  });

  it("2.2 Verify server is still completely responsive after adversarial barrage", async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.equal(res.status, 200, "Home page must respond 200 OK after adversarial fuzzing");
    const html = await res.text();
    assert.ok(html.includes("Shaik Umran"), "Front page HTML content must be intact");
  });
});

// ============================================================================
// Suite 3: 404 Recovery Workflow & High-Contrast WCAG Verification
// ============================================================================
describe("Suite 3: 404 Recovery Workflow & Visual Contrast Verification", () => {
  it("3.1 Shallow 404: verifies HTTP 404, high-contrast text, and home recovery link", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const res = await page.goto(`${BASE_URL}/non-existent-unindexed-route-404`, {
      waitUntil: "networkidle",
    });

    assert.equal(res?.status(), 404, "Must respond with HTTP 404 status code");

    // Check heading visibility and text
    const heading = page.locator("h1");
    assert.equal(await heading.isVisible(), true, "404 page must render an h1");
    const headingText = (await heading.textContent())?.trim();
    assert.equal(headingText, "Lost in the Archive");

    // Check contrast: evaluate computed CSS color of heading and background
    const colors = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const container = h1?.closest(".bg-stone-950") || document.body;
      const h1Style = h1 ? window.getComputedStyle(h1) : null;
      const bgStyle = window.getComputedStyle(container);
      return {
        h1Color: h1Style?.color,
        bgColor: bgStyle?.backgroundColor,
      };
    });

    // Heading color must be light (e.g. rgb(245, 245, 244) for stone-100), background dark (stone-950)
    console.log(`[Contrast Check] h1: ${colors.h1Color}, bg: ${colors.bgColor}`);
    assert.ok(colors.h1Color, "h1 must have a computed color");
    // Ensure text is not black or dark gray on dark background
    assert.notEqual(colors.h1Color, "rgb(0, 0, 0)");
    assert.notEqual(colors.h1Color, "rgb(28, 25, 23)"); // stone-900

    // Click Return to Front Page recovery link
    const recoveryLink = page.locator('a:has-text("Return to Front Page")');
    assert.equal(await recoveryLink.isVisible(), true, "Recovery link must be visible");
    await recoveryLink.click();
    await page.waitForURL((url) => url.pathname === "/");

    assert.equal(page.url().replace(/\/$/, ""), BASE_URL.replace(/\/$/, ""));
    assert.equal(await page.locator("header").isVisible(), true, "Header must be visible on recovered home page");

    await page.close();
  });

  it("3.2 Deep 404: recovery works identically from deep nested invalid paths", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const res = await page.goto(`${BASE_URL}/articles/non-existent-subpath/deeply/nested/slug-404`, {
      waitUntil: "networkidle",
    });

    assert.equal(res?.status(), 404, "Deep invalid path must return 404");

    const recoveryLink = page.locator('a:has-text("Return to Front Page")');
    assert.equal(await recoveryLink.isVisible(), true);
    await recoveryLink.click();
    await page.waitForURL((url) => url.pathname === "/");

    assert.equal(page.url().replace(/\/$/, ""), BASE_URL.replace(/\/$/, ""));
    await page.close();
  });
});
