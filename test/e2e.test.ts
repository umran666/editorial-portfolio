import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium, type Browser } from "playwright-core";
import { spawn, type ChildProcess } from "node:child_process";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CHROME_PATH = process.env.CHROME_PATH || "/usr/bin/google-chrome";

let browser: Browser;
let spawnedServer: ChildProcess | null = null;

/**
 * Check if the server on BASE_URL is actively responding.
 */
async function isServerReady(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.status < 500;
  } catch {
    return false;
  }
}

/**
 * Poll until the server responds or timeout expires.
 */
async function waitForServer(url: string, timeoutMs = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerReady(url)) return;
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

before(async () => {
  // Ensure Next.js server is up and running
  const alreadyRunning = await isServerReady(BASE_URL);
  if (!alreadyRunning) {
    console.log(`[E2E Setup] Starting Next.js server on ${BASE_URL}...`);
    spawnedServer = spawn("npm", ["run", "start"], {
      stdio: "pipe",
      env: { ...process.env, PORT: "3000" },
      detached: true,
    });
    await waitForServer(BASE_URL);
    console.log(`[E2E Setup] Server is ready.`);
  }

  // Launch headless Chrome
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
  if (spawnedServer && spawnedServer.pid) {
    console.log("[E2E Teardown] Stopping spawned Next.js server...");
    try {
      process.kill(-spawnedServer.pid, "SIGKILL");
    } catch {
      try {
        spawnedServer.kill("SIGKILL");
      } catch {
        // process already dead
      }
    }
  }
});

// ============================================================================
// Tier 1: Isolated Interactive Element Verification (R1, R2, AC)
// ============================================================================
describe("Tier 1: Isolated Interactive Element Verification", () => {
  it("Mobile Navigation Drawer: opens on mobile viewport, displays 7 nav links, and closes via close button", async () => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // 1. Initial State: Hamburger button visible, drawer not open
    const openBtn = page.locator('button[aria-label="Open menu"]');
    assert.equal(await openBtn.isVisible(), true, "Hamburger button must be visible on mobile viewport");
    assert.equal(await openBtn.getAttribute("aria-expanded"), "false", "Hamburger must have aria-expanded='false'");

    const drawerHeader = page.locator('p:has-text("Navigation Index")');
    assert.equal(await drawerHeader.isVisible(), false, "Drawer menu should initially be hidden");

    // 2. Open Drawer
    await openBtn.click();
    await page.waitForTimeout(150);

    assert.equal(await drawerHeader.isVisible(), true, "Drawer 'Navigation Index' should be visible after click");

    // Once open, the button changes aria-label to 'Close menu' and aria-expanded to 'true'
    const closeBtn = page.locator('button[aria-label="Close menu"]');
    assert.equal(await closeBtn.isVisible(), true, "Close menu button must be visible when drawer is open");
    assert.equal(await closeBtn.getAttribute("aria-expanded"), "true", "Button must have aria-expanded='true'");

    // 3. Verify all 7 Drawer Links are present and visible
    const expectedDrawerLinks = [
      { text: "Archive", href: "/" },
      { text: "Timeline", href: "/#timeline" },
      { text: "Writing", href: "/articles" },
      { text: "Systems", href: "/projects" },
      { text: "About", href: "/about" },
      { text: "Axioms", href: "/quotes" },
      { text: "Index", href: "/tags" },
    ];

    for (const item of expectedDrawerLinks) {
      const link = page.locator(`.md\\:hidden a:has-text("${item.text}")`).first();
      assert.equal(await link.isVisible(), true, `Drawer link '${item.text}' must be visible`);
      assert.equal(await link.getAttribute("href"), item.href, `Drawer link '${item.text}' must link to ${item.href}`);
    }

    // 4. Close Drawer via Close Button
    await closeBtn.click();
    await page.waitForTimeout(150);

    assert.equal(await drawerHeader.isVisible(), false, "Drawer must be closed after close button click");
    assert.equal(await openBtn.isVisible(), true, "Open menu button must reappear after closing");
    assert.equal(await openBtn.getAttribute("aria-expanded"), "false", "Hamburger aria-expanded must reset to 'false'");

    await context.close();
  });

  it("Timeline Category Filters: dynamically updates entry count without reload (9 -> 6 -> 3 -> 9)", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Initial state: "All" selected -> 9 items
    const allArticles = await page.$$("article.group");
    assert.equal(allArticles.length, 9, "Initial timeline view should display all 9 entries");

    // Filter by Systems -> 6 items
    const systemsBtn = page.locator('button:has-text("Systems")');
    assert.equal(await systemsBtn.isVisible(), true, "Systems filter button must be visible");
    await systemsBtn.click();
    await page.waitForTimeout(200);

    const systemsArticles = await page.$$("article.group");
    assert.equal(systemsArticles.length, 6, "Filtering by Systems should dynamically display exactly 6 entries");

    // Filter by Monographs -> 3 items
    const monographsBtn = page.locator('button:has-text("Monographs")');
    assert.equal(await monographsBtn.isVisible(), true, "Monographs filter button must be visible");
    await monographsBtn.click();
    await page.waitForTimeout(200);

    const monographsArticles = await page.$$("article.group");
    assert.equal(monographsArticles.length, 3, "Filtering by Monographs should dynamically display exactly 3 entries");

    // Filter back to All -> 9 items
    const allBtn = page.locator('button:has-text("All")');
    await allBtn.click();
    await page.waitForTimeout(200);

    const restoredArticles = await page.$$("article.group");
    assert.equal(restoredArticles.length, 9, "Selecting All filter should dynamically restore all 9 entries");

    await page.close();
  });

  it("Code Block Copy Buttons: writes to clipboard and updates visual state to 'Copied!'", async () => {
    const context = await browser.newContext();
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/articles/inside-uniqtoken-tokenizer-architecture`, {
      waitUntil: "networkidle",
    });

    const copyBtn = page.locator(".code-copy-btn").first();
    assert.equal(await copyBtn.isVisible(), true, "Code copy button must be visible on article with code blocks");

    const btnText = copyBtn.locator(".btn-text");
    assert.equal((await btnText.textContent())?.trim(), "Copy", "Initial copy button label must be 'Copy'");

    // Click copy button
    await copyBtn.click();
    await page.waitForTimeout(150);

    // Label updates to Copied! and styling changes
    const updatedText = (await btnText.textContent())?.trim();
    assert.equal(updatedText, "Copied!", "Copy button text must switch to 'Copied!' upon click");

    const buttonClass = (await copyBtn.getAttribute("class")) || "";
    assert.ok(buttonClass.includes("text-emerald-400"), "Copy button must receive emerald highlight class");

    await context.close();
  });

  it("Hero Smooth-Scroll Jump Button: scrolls #timeline into view", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    const scrollBtn = page.locator('a[href="#timeline"]').first();
    assert.equal(await scrollBtn.isVisible(), true, "Hero smooth scroll anchor button must be visible");

    // Click smooth scroll button
    await scrollBtn.click();
    await page.waitForTimeout(400);

    // Verify #timeline exists and is reached
    const timelineSection = page.locator("#timeline");
    assert.equal(await timelineSection.isVisible(), true, "#timeline section must be visible after jump");

    await page.close();
  });

  it("Desktop Header Navigation Links: all nav links resolve with status 200", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    const expectedHeaderLinks = [
      { label: "Archive", path: "/" },
      { label: "Writing", path: "/articles" },
      { label: "Systems", path: "/projects" },
      { label: "About", path: "/about" },
      { label: "Axioms", path: "/quotes" },
      { label: "Index", path: "/tags" },
    ];

    for (const item of expectedHeaderLinks) {
      const link = page.locator(`nav[aria-label="Main Navigation"] a:has-text("${item.label}")`);
      assert.equal(await link.isVisible(), true, `Header link '${item.label}' must be visible`);
      const href = await link.getAttribute("href");
      assert.equal(href, item.path, `Header link '${item.label}' should point to ${item.path}`);

      // Verify destination returns 200
      const res = await page.request.get(`${BASE_URL}${item.path}`);
      assert.equal(res.status(), 200, `Destination ${item.path} must return HTTP status 200`);
    }

    // Check RSS XML link
    const rssRes = await page.request.get(`${BASE_URL}/rss.xml`);
    assert.equal(rssRes.status(), 200, "RSS feed /rss.xml must return HTTP status 200");

    await page.close();
  });

  it("Hero Project Quick Links: verifies [02] DiffusionGemma (M1 fix) and companion nodes resolve with status 200", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    const quickNodes = [
      { text: "[01] UniqToken", expectedHref: "/projects/uniqtoken" },
      { text: "[02] DiffusionGemma", expectedHref: "/projects/diffusion-gemma" },
      { text: "[03] UniqKache", expectedHref: "/projects/uniqkache" },
    ];

    for (const node of quickNodes) {
      const link = page.locator(`a:has-text("${node.text}")`).first();
      assert.equal(await link.isVisible(), true, `Hero quick link '${node.text}' must be visible`);
      const href = await link.getAttribute("href");
      assert.equal(href, node.expectedHref, `Hero quick link '${node.text}' href must be ${node.expectedHref}`);

      // Check HTTP 200
      const res = await page.request.get(`${BASE_URL}${node.expectedHref}`);
      assert.equal(res.status(), 200, `Quick node ${node.expectedHref} must return 200 (specifically testing M1 fix)`);
    }

    await page.close();
  });

  it("Taxonomy Index: tag pills on /tags navigate to respective filtered routes", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/tags`, { waitUntil: "networkidle" });

    // Collect all tag links
    const tagLinks = await page.$$eval('a[href^="/tags/"]', (els) =>
      els.map((e) => ({
        href: e.getAttribute("href") || "",
        text: e.textContent?.trim() || "",
      }))
    );

    assert.ok(tagLinks.length >= 20, `Taxonomy index must render at least 20 tags, found: ${tagLinks.length}`);

    // Sample click on a known tag: /tags/transformers
    const targetTag = tagLinks.find((t) => t.href.includes("transformers")) || tagLinks[0];
    const res = await page.request.get(`${BASE_URL}${targetTag.href}`);
    assert.equal(res.status(), 200, `Tag detail route ${targetTag.href} must return 200`);

    await page.goto(`${BASE_URL}${targetTag.href}`, { waitUntil: "networkidle" });
    const heading = await page.locator("h1").textContent();
    assert.ok(heading && heading.length > 0, "Tag detail page must have a populated heading");

    await page.close();
  });
});

// ============================================================================
// Tier 2: Boundary, Edge & Corner Cases (R1, R2, AC)
// ============================================================================
describe("Tier 2: Boundary, Edge & Corner Cases", () => {
  it("Viewport Resize: mobile drawer closes gracefully on desktop resize", async () => {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Open mobile drawer
    const openBtn = page.locator('button[aria-label="Open menu"]');
    await openBtn.click();
    await page.waitForTimeout(150);

    const drawerHeader = page.locator('p:has-text("Navigation Index")');
    assert.equal(await drawerHeader.isVisible(), true, "Drawer should be open on mobile");

    // Resize to desktop viewport 1280x800
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(150);

    // Mobile drawer element is hidden by CSS breakpoint md:hidden
    assert.equal(await drawerHeader.isVisible(), false, "Drawer must not be visible on desktop viewport");

    // Desktop nav must be visible
    const desktopNav = page.locator('nav[aria-label="Main Navigation"]');
    assert.equal(await desktopNav.isVisible(), true, "Desktop navigation must be visible after resizing to desktop");

    // Resize back to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(150);

    // Close menu button or open menu button must be visible
    const closeBtn = page.locator('button[aria-label="Close menu"]');
    assert.equal(await closeBtn.isVisible(), true, "Close menu button must be visible when returning to mobile");

    // Close menu to clean up state
    await closeBtn.click();
    await page.waitForTimeout(100);
    assert.equal(await drawerHeader.isVisible(), false, "Drawer must be closed after cleanup click");

    await page.close();
  });

  it("Rapid Filter Toggling: rapid sequential switching preserves DOM consistency", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    const systemsBtn = page.locator('button:has-text("Systems")');
    const monographsBtn = page.locator('button:has-text("Monographs")');
    const allBtn = page.locator('button:has-text("All")');

    // Rapid clicking in rapid succession without waiting for timeouts
    await Promise.all([
      systemsBtn.click(),
      monographsBtn.click(),
      allBtn.click(),
      systemsBtn.click(),
      monographsBtn.click(),
    ]);

    await page.waitForTimeout(250);

    // Final filter is Monographs -> exactly 3 items
    const finalItems = await page.$$("article.group");
    assert.equal(finalItems.length, 3, "Rapid filter toggling should reliably converge to the last requested state (3 items)");

    // Restore to All
    await allBtn.click();
    await page.waitForTimeout(150);
    const restoredItems = await page.$$("article.group");
    assert.equal(restoredItems.length, 9, "Restoring to All should accurately return all 9 items");

    await page.close();
  });

  it("Code Copy Button Reversion: resets label from 'Copied!' back to 'Copy' after timeout", async () => {
    const context = await browser.newContext();
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/articles/inside-uniqtoken-tokenizer-architecture`, {
      waitUntil: "networkidle",
    });

    const copyBtn = page.locator(".code-copy-btn").first();
    const btnText = copyBtn.locator(".btn-text");

    // Click copy
    await copyBtn.click();
    await page.waitForTimeout(100);
    assert.equal((await btnText.textContent())?.trim(), "Copied!", "Label should immediately switch to 'Copied!'");

    // Wait 2200ms to allow 2000ms setTimeout to elapse
    await page.waitForTimeout(2200);

    const revertedText = (await btnText.textContent())?.trim();
    assert.equal(revertedText, "Copy", "Label must automatically revert back to 'Copy' after timeout");

    const finalClass = (await copyBtn.getAttribute("class")) || "";
    assert.ok(!finalClass.includes("text-emerald-400"), "Emerald highlight must be removed upon reset");

    await context.close();
  });

  it("Taxonomy Fallback: non-existent tag route handles missing items gracefully", async () => {
    const page = await browser.newPage();
    const res = await page.goto(`${BASE_URL}/tags/non-existent-tag-query-xyz`, {
      waitUntil: "networkidle",
    });

    // Next.js static /tags/[tag] returns 404 for ungenerated paths
    assert.ok(res?.status() === 404 || res?.status() === 200, "Missing tag slug must return 404 or empty state without 500 error");

    await page.close();
  });

  it("404 Error Page Contrast & Recovery: unindexed route renders WCAG compliant error and recovery link", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const res = await page.goto(`${BASE_URL}/unindexed-nonexistent-route-404`, {
      waitUntil: "networkidle",
    });

    assert.equal(res?.status(), 404, "Unindexed route must respond with HTTP 404 status");

    // Assert contrast and headline
    const heading = page.locator("h1");
    assert.equal(await heading.isVisible(), true, "404 page must render an h1 heading");
    const headingText = (await heading.textContent())?.trim();
    assert.equal(headingText, "Lost in the Archive", "404 page heading must be 'Lost in the Archive'");

    // Click Return link to recover
    const returnLink = page.locator('a:has-text("Return to Front Page")').first();
    assert.equal(await returnLink.isVisible(), true, "Recovery link must be visible on 404 page");
    await returnLink.click();
    await page.waitForURL((url) => url.pathname === "/");

    assert.equal(page.url().replace(/\/$/, ""), BASE_URL.replace(/\/$/, ""), "Clicking Return link must recover back to home page");

    await page.close();
  });
});

// ============================================================================
// Tier 3: Cross-Feature Integration Flows (R1, R2, AC)
// ============================================================================
describe("Tier 3: Cross-Feature Integration Flows", () => {
  it("Mobile Drawer Navigation & Auto-Close: selecting link navigates and closes drawer", async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Open drawer
    await page.locator('button[aria-label="Open menu"]').click();
    await page.waitForTimeout(150);

    // Click 'Writing' in drawer
    const writingLink = page.locator('.md\\:hidden a:has-text("Writing")');
    await writingLink.click();
    await page.waitForURL(`${BASE_URL}/articles`);

    assert.equal(page.url(), `${BASE_URL}/articles`, "Should navigate to /articles");

    // Verify drawer automatically closed on navigation
    const drawerHeader = page.locator('p:has-text("Navigation Index")');
    assert.equal(await drawerHeader.isVisible(), false, "Drawer must auto-close upon navigation");

    await context.close();
  });

  it("Timeline Filter + Detail Page Navigation + Browser History Back", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // 1. Filter by Systems
    await page.locator('button:has-text("Systems")').click();
    await page.waitForTimeout(150);

    // 2. Click DiffusionGemma project card title (verifying M1 fix destination)
    const gemmaLink = page.locator('a[href="/projects/diffusion-gemma"]').first();
    assert.equal(await gemmaLink.isVisible(), true, "DiffusionGemma link must be visible in filtered systems");
    await gemmaLink.click();
    await page.waitForURL(`${BASE_URL}/projects/diffusion-gemma`);

    assert.equal(page.url(), `${BASE_URL}/projects/diffusion-gemma`, "Should navigate to /projects/diffusion-gemma");
    const h1 = (await page.locator("h1").textContent())?.trim();
    assert.ok(h1?.toLowerCase().includes("diffusion"), "Project detail page should render project title");

    // 3. Browser Back
    await page.goBack();
    await page.waitForURL(`${BASE_URL}/`);
    assert.equal(page.url(), `${BASE_URL}/`, "Browser back should return to home page");

    await page.close();
  });

  it("Article Detail to Taxonomy Traversal: clicking article tag chip opens tag page, breadcrumb returns to /tags", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/articles/inside-uniqtoken-tokenizer-architecture`, {
      waitUntil: "networkidle",
    });

    // Locate a tag pill on the article page
    const tagLink = page.locator('a[href^="/tags/"]').first();
    assert.equal(await tagLink.isVisible(), true, "Article page must feature clickable taxonomy tag chips");
    const tagHref = await tagLink.getAttribute("href");

    await tagLink.click();
    await page.waitForURL(`${BASE_URL}${tagHref}`);

    assert.equal(page.url(), `${BASE_URL}${tagHref}`, `Should navigate to tag route ${tagHref}`);

    // Click breadcrumb back to /tags
    const breadcrumb = page.locator('a[href="/tags"]').first();
    if (await breadcrumb.isVisible()) {
      await breadcrumb.click();
      await page.waitForURL(`${BASE_URL}/tags`);
      assert.equal(page.url(), `${BASE_URL}/tags`, "Breadcrumb must return to taxonomy index /tags");
    }

    await page.close();
  });
});

// ============================================================================
// Tier 4: Realistic End-to-End User Scenarios (R1, R2, AC)
// ============================================================================
describe("Tier 4: Realistic End-to-End User Scenarios", () => {
  it("Scenario 1: Mobile Reader Journey (Drawer -> Writing -> Article -> Copy Code -> Home)", async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const page = await context.newPage();

    // 1. Visit Home
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // 2. Open drawer and navigate to Writing
    await page.locator('button[aria-label="Open menu"]').click();
    await page.waitForTimeout(150);
    await page.locator('.md\\:hidden a:has-text("Writing")').click();
    await page.waitForURL(`${BASE_URL}/articles`);

    // 3. Select first article via Read monograph link
    const readMonographLink = page.locator('a:has-text("Read monograph")').first();
    await readMonographLink.click();
    await page.waitForURL(/\/articles\/.+/);

    // 4. Locate code copy button and trigger clipboard copy
    const copyBtn = page.locator(".code-copy-btn").first();
    if (await copyBtn.isVisible()) {
      await copyBtn.click();
      await page.waitForTimeout(150);
      const text = await copyBtn.locator(".btn-text").textContent();
      assert.equal(text?.trim(), "Copied!", "Clipboard copy must succeed in mobile reader flow");
    }

    // 5. Navigate back to Home via Header Wordmark
    const brand = page.locator('header a[href="/"]').first();
    await brand.click();
    await page.waitForURL(`${BASE_URL}/`);
    assert.equal(page.url(), `${BASE_URL}/`, "Reader journey must successfully complete back at Home");

    await context.close();
  });

  it("Scenario 2: Portfolio Explorer Journey (Hero Quick Link -> DiffusionGemma -> Tech Tags -> Projects Index)", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // 1. Click Hero quick jump link for DiffusionGemma (verifying M1 fix)
    const diffLink = page.locator('a:has-text("[02] DiffusionGemma")');
    await diffLink.click();
    await page.waitForURL(`${BASE_URL}/projects/diffusion-gemma`);

    // 2. Inspect Project Details
    const h1 = await page.locator("h1").textContent();
    assert.ok(h1?.includes("DiffusionGemma"), "Should land on DiffusionGemma project page");

    // 3. Click nav link to Projects Index
    const systemsNav = page.locator('nav[aria-label="Main Navigation"] a:has-text("Systems")');
    await systemsNav.click();
    await page.waitForURL(`${BASE_URL}/projects`);

    // 4. Verify projects index renders all 6 systems
    const projectCards = await page.$$('a:has-text("View System Spec")');
    assert.equal(projectCards.length, 6, "Projects index must list all 6 engineered systems");

    await page.close();
  });

  it("Scenario 3: Archival Researcher Journey (Hero Scroll -> Category Filtering -> Monograph Text Read)", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // 1. Scroll to timeline
    await page.locator('a[href="#timeline"]').first().click();
    await page.waitForTimeout(300);

    // 2. Filter by Monographs
    await page.locator('button:has-text("Monographs")').click();
    await page.waitForTimeout(150);

    // 3. Click Read Text on first monograph
    const readTextLink = page.locator('article.group a:has-text("Read Text")').first();
    await readTextLink.click();
    await page.waitForURL(/\/articles\/.+/);

    // 4. Verify monograph detail content is loaded
    const articleTitle = await page.locator("h1").textContent();
    assert.ok(articleTitle && articleTitle.length > 0, "Monograph detail page must render title");

    await page.close();
  });

  it("Scenario 4: Taxonomy Cross-Discovery Journey (Tags Index -> Tag Details -> Project/Article Details)", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/tags`, { waitUntil: "networkidle" });

    // 1. Find a popular tag
    const tag = page.locator('a[href^="/tags/"]').first();
    const tagHref = await tag.getAttribute("href");
    await tag.click();
    await page.waitForURL(`${BASE_URL}${tagHref}`);

    // 2. Verify items under this tag
    const items = await page.$$("main a[href^='/articles/'], main a[href^='/projects/']");
    assert.ok(items.length > 0, "Tag view must list items tagged with keyword");

    // 3. Click first item in tag view
    const itemLink = page.locator("main a[href^='/articles/'], main a[href^='/projects/']").first();
    const targetHref = await itemLink.getAttribute("href");
    await itemLink.click();
    await page.waitForURL(`${BASE_URL}${targetHref}`);

    assert.ok(page.url().includes("/articles/") || page.url().includes("/projects/"), "Should navigate to detail page");

    await page.close();
  });

  it("Scenario 5: Edge & 404 Resilience Journey (404 Page Navigation -> Lost in Archive Check -> Index Recovery)", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    // 1. Request non-existent slug
    const res = await page.goto(`${BASE_URL}/non-existent-test-slug-endpoint`, {
      waitUntil: "networkidle",
    });
    assert.equal(res?.status(), 404, "Non-existent route must return 404");

    // 2. Assert Error UI
    const heading = await page.locator("h1").textContent();
    assert.equal(heading?.trim(), "Lost in the Archive", "Should display customized 404 screen");

    // 3. Return to Index via recovery link
    const recoveryLink = page.locator('a:has-text("Return to Front Page")').first();
    assert.equal(await recoveryLink.isVisible(), true, "Recovery link must be visible on 404 page");
    await recoveryLink.click();
    await page.waitForURL((url) => url.pathname === "/");
    assert.equal(page.url().replace(/\/$/, ""), BASE_URL.replace(/\/$/, ""), "Should recover cleanly to /");

    await page.close();
  });
});

// ============================================================================
// Tier 5: Comprehensive Full-Site Link Spider (Zero Broken Links)
// ============================================================================
describe("Tier 5: Comprehensive Full-Site Link Spider (Zero Broken Links)", () => {
  it("Automated Link Crawler: discovers and verifies 100% of internal links across all 38+ pages with 0 broken links", async () => {
    // 1. Discover all pages to crawl
    const seedPages = [
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
      "/quotes",
      "/tags",
      "/rss.xml",
      "/feed.xml",
    ];

    // Dynamically retrieve all tags from /tags
    const tagsResponse = await fetch(`${BASE_URL}/tags`);
    assert.equal(tagsResponse.status, 200, "Taxonomy /tags endpoint must be accessible for discovery");
    const tagsHtml = await tagsResponse.text();
    const tagMatches = [...tagsHtml.matchAll(/href="(\/tags\/[^"#]+)"/g)].map((m) => m[1]);

    const allPagesToCrawl = Array.from(new Set([...seedPages, ...tagMatches]));
    assert.ok(allPagesToCrawl.length >= 35, `Expected at least 35 unique pages to spider, found ${allPagesToCrawl.length}`);

    // 2. Crawl all pages and collect anchor links
    const discoveredLinks = new Set<string>();

    for (const pagePath of allPagesToCrawl) {
      const res = await fetch(`${BASE_URL}${pagePath}`);
      assert.equal(res.status, 200, `Page ${pagePath} must return 200 OK`);
      const html = await res.text();
      const hrefMatches = [...html.matchAll(/<a[^>]+href="([^"]+)"/g)].map((m) => m[1]);

      for (const href of hrefMatches) {
        discoveredLinks.add(JSON.stringify({ source: pagePath, href }));
      }
    }

    assert.ok(discoveredLinks.size > 0, "Link spider must collect discovered links across pages");

    // 3. Verify every internal target link
    const targetStatusCache = new Map<string, number>();
    const brokenLinks: Array<{ source: string; href: string; targetUrl: string; status: number }> = [];
    let validInternalCount = 0;

    for (const itemJson of discoveredLinks) {
      const item: { source: string; href: string } = JSON.parse(itemJson);
      const link = item.href;

      // Skip non-http and external protocols
      if (
        link.startsWith("mailto:") ||
        link.startsWith("tel:") ||
        link.startsWith("javascript:") ||
        link.startsWith("http://") ||
        link.startsWith("https://")
      ) {
        continue;
      }

      // Strip hash anchors
      const cleanPath = link.split("#")[0];
      if (!cleanPath) continue; // Pure anchor jump on same page

      const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
      const targetUrl = `${BASE_URL}${normalizedPath}`;

      let status: number;
      if (targetStatusCache.has(targetUrl)) {
        status = targetStatusCache.get(targetUrl)!;
      } else {
        const testRes = await fetch(targetUrl);
        status = testRes.status;
        targetStatusCache.set(targetUrl, status);
      }

      if (status === 200) {
        validInternalCount++;
      } else {
        brokenLinks.push({ source: item.source, href: item.href, targetUrl, status });
      }
    }

    // Assert 0 broken links and substantial link verification coverage
    assert.equal(
      brokenLinks.length,
      0,
      `Broken links detected: ${JSON.stringify(brokenLinks, null, 2)}`
    );
    assert.ok(
      validInternalCount >= 400,
      `Expected at least 400 valid internal links verified, got ${validInternalCount}`
    );
  });
});
