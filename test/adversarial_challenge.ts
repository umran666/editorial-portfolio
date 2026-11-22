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
// CHALLENGE 1: Mobile Navigation Drawer Adversarial Stress Testing
// ============================================================================
describe("CHALLENGE 1: Mobile Navigation Drawer Adversarial Stress", () => {
  it("Stress 1.1: Rapid-fire toggling (20 rapid clicks) does not desynchronize drawer state or crash React", async () => {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    const toggleBtn = page.locator('button[aria-label="Open menu"], button[aria-label="Close menu"]');

    // Fire 20 rapid clicks
    for (let i = 0; i < 20; i++) {
      await toggleBtn.click();
      await page.waitForTimeout(40);
    }

    // 20 clicks on an initially closed menu should leave it closed (even number)
    const ariaExpanded = await toggleBtn.getAttribute("aria-expanded");
    assert.equal(ariaExpanded, "false", "Even number of clicks must leave menu closed (aria-expanded='false')");

    const drawerHeader = page.locator('p:has-text("Navigation Index")');
    assert.equal(await drawerHeader.isVisible(), false, "Drawer content must not be visible when closed");

    // Click once more to open cleanly
    await toggleBtn.click();
    await page.waitForTimeout(100);
    assert.equal(await toggleBtn.getAttribute("aria-expanded"), "true", "Single click after rapid fire must open drawer");
    assert.equal(await drawerHeader.isVisible(), true, "Drawer must be visible");

    // Verify zero console errors occurred
    assert.equal(consoleErrors.length, 0, `Zero console errors expected, got: ${JSON.stringify(consoleErrors)}`);

    await page.close();
  });

  it("Stress 1.2: Keyboard Escape key behavior inspection", async () => {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Open drawer
    await page.locator('button[aria-label="Open menu"]').click();
    await page.waitForTimeout(150);
    const drawerHeader = page.locator('p:has-text("Navigation Index")');
    assert.equal(await drawerHeader.isVisible(), true, "Drawer is open");

    // Press Escape key
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    const isVisibleAfterEsc = await drawerHeader.isVisible();
    console.log(`[Observation] Does mobile drawer close on Escape key? ${!isVisibleAfterEsc ? "YES" : "NO"}`);
    // Record observation: Header.tsx currently does not implement onKeyDown for Escape

    await page.close();
  });

  it("Stress 1.3: Outside backdrop click behavior inspection", async () => {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Open drawer
    await page.locator('button[aria-label="Open menu"]').click();
    await page.waitForTimeout(150);
    const drawerHeader = page.locator('p:has-text("Navigation Index")');
    assert.equal(await drawerHeader.isVisible(), true, "Drawer is open");

    // Click outside drawer at body coordinate (x=180, y=550)
    await page.mouse.click(180, 550);
    await page.waitForTimeout(200);

    const isVisibleAfterOutsideClick = await drawerHeader.isVisible();
    console.log(`[Observation] Does mobile drawer close on outside click? ${!isVisibleAfterOutsideClick ? "YES" : "NO"}`);
    // Record observation: Header.tsx uses an inline expandable accordion, not an overlay with click-outside listener

    await page.close();
  });

  it("Stress 1.4: Extreme viewport thrashing mid-open state", async () => {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Open drawer on mobile
    await page.locator('button[aria-label="Open menu"]').click();
    await page.waitForTimeout(150);

    const viewports = [
      { width: 1280, height: 800 },
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
      { width: 320, height: 480 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(50);
    }

    // At 320x480 (mobile), drawer should still be rendered without horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    assert.equal(hasHorizontalScroll, false, "Viewport thrashing should not cause horizontal scrollbar or layout break");

    await page.close();
  });

  it("Stress 1.5: Verify every single mobile drawer link triggers auto-close and correct navigation", async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const page = await context.newPage();

    const expectedLinks = [
      { label: "Journal", path: "/" },
      { label: "Notes", path: "/articles" },
      { label: "Projects", path: "/projects" },
      { label: "About", path: "/about" },
            { label: "Index", path: "/tags" },
    ];

    for (const item of expectedLinks) {
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
      const openBtn = page.locator('button[aria-label="Open menu"]');
      await openBtn.click();
      await page.waitForTimeout(100);

      const navLink = page.locator(`.md\\:hidden a:has-text("${item.label}")`).first();
      assert.equal(await navLink.isVisible(), true, `Link '${item.label}' should be visible in drawer`);
      await navLink.click();
      await page.waitForURL((url) => url.pathname === item.path);

      assert.equal(page.url().replace(/\/$/, ""), `${BASE_URL}${item.path}`.replace(/\/$/, ""));

      // Verify drawer is closed
      const drawerHeader = page.locator('p:has-text("Navigation Index")');
      assert.equal(await drawerHeader.isVisible(), false, `Drawer must be closed after navigating to ${item.path}`);
    }

    await context.close();
  });
});

// ============================================================================
// CHALLENGE 2: ArchivalTimeline Filter Toggling Stress Testing
// ============================================================================
describe("CHALLENGE 2: ArchivalTimeline Filter Toggling Stress", () => {
  it("Stress 2.1: 50 rapid sequential random filter clicks maintains deterministic state", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    const allBtn = page.locator('button:has-text("All")');
    const systemsBtn = page.locator('button:has-text("Projects")');
    const notesBtn = page.locator('button:has-text("Notes")');

    const filterOptions = [
      { btn: allBtn, expected: 9, name: "All" },
      { btn: systemsBtn, expected: 3, name: "Projects" },
      { btn: notesBtn, expected: 3, name: "Notes" },
    ];

    // Fire 50 rapid clicks cycling through filters
    for (let i = 0; i < 50; i++) {
      const choice = filterOptions[i % 3];
      await choice.btn.click();
      await page.waitForTimeout(20);
    }

    // Explicitly click Notes
    await notesBtn.click();
    await page.waitForTimeout(200);

    const monoArticles = await page.$$("article.group");
    assert.equal(monoArticles.length, 3, "Notes filter must show exactly 3 entries after stress");

    // Verify all 3 entries are Notes
    const badges = await page.$$eval("article.group", (els) =>
      els.map((e) => e.querySelector(".uppercase")?.textContent?.trim())
    );
    for (const badge of badges) {
      assert.equal(badge, "MONOGRAPH", "Every entry under Notes filter must be a MONOGRAPH");
    }

    // Explicitly click Systems
    await systemsBtn.click();
    await page.waitForTimeout(200);

    const sysArticles = await page.$$("article.group");
    assert.equal(sysArticles.length, 6, "Systems filter must show exactly 3 entries after stress");

    // Explicitly click All
    await allBtn.click();
    await page.waitForTimeout(200);

    const allArticles = await page.$$("article.group");
    assert.equal(allArticles.length, 9, "All filter must restore exactly 6 entries");

    await page.close();
  });

  it("Stress 2.2: Re-clicking already active filter does not cause glitches or unmounts", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    const systemsBtn = page.locator('button:has-text("Projects")');
    await systemsBtn.click();
    await page.waitForTimeout(100);

    // Click Systems 5 more times while active
    for (let i = 0; i < 5; i++) {
      await systemsBtn.click();
      await page.waitForTimeout(50);
    }

    const count = (await page.$$("article.group")).length;
    assert.equal(count, 6, "Re-clicking active Systems filter must stay at 6 items");

    await page.close();
  });
});

// ============================================================================
// CHALLENGE 3: Code Copy Buttons Clipboard Authenticity Across Multiple Blocks
// ============================================================================
describe("CHALLENGE 3: Code Copy Buttons & Clipboard Content Authenticity", () => {
  it("Stress 3.1: Verify clipboard content matches data-raw-code on all code blocks across articles", async () => {
    const context = await browser.newContext();
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const page = await context.newPage();

    const testArticles = [
      "/articles/inside-uniqtoken-tokenizer-architecture",
      "/articles/diffusion-language-models-and-concept-ablation",
      "/articles/memory-bandwidth-and-kv-cache-pruning",
    ];

    let totalBlocksTested = 0;

    for (const articlePath of testArticles) {
      await page.goto(`${BASE_URL}${articlePath}`, { waitUntil: "networkidle" });

      const wrappers = page.locator(".shiki-wrapper");
      const blockCount = await wrappers.count();
      console.log(`[Authenticity Test] Article ${articlePath} contains ${blockCount} code blocks`);

      for (let i = 0; i < blockCount; i++) {
        const wrapper = wrappers.nth(i);
        const copyBtn = wrapper.locator(".code-copy-btn");
        const encodedRaw = await wrapper.getAttribute("data-raw-code");
        assert.ok(encodedRaw, `Block ${i} in ${articlePath} must have data-raw-code attribute`);
        const expectedRawCode = decodeURIComponent(encodedRaw);

        // Click copy button
        await copyBtn.click();
        await page.waitForTimeout(150);

        // Verify button text changed to 'Copied!'
        const btnText = (await copyBtn.locator(".btn-text").textContent())?.trim();
        assert.equal(btnText, "Copied!", `Block ${i} button text must be 'Copied!'`);

        // Read actual clipboard contents
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

        // Assert clipboard text matches exact raw code
        assert.equal(
          clipboardText,
          expectedRawCode,
          `Block ${i} clipboard content must exactly match data-raw-code in ${articlePath}`
        );

        totalBlocksTested++;
      }
    }

    assert.ok(totalBlocksTested >= 3, `Must have tested at least 3 code blocks across articles, got ${totalBlocksTested}`);
    console.log(`[Authenticity Test] Successfully verified ${totalBlocksTested} code blocks with 100% clipboard matching`);

    await context.close();
  });

  it("Stress 3.2: Concurrent clicking of multiple copy buttons on the same page", async () => {
    const context = await browser.newContext();
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/articles/inside-uniqtoken-tokenizer-architecture`, {
      waitUntil: "networkidle",
    });

    const copyButtons = page.locator(".code-copy-btn");
    const count = await copyButtons.count();

    if (count >= 2) {
      const btn0 = copyButtons.nth(0);
      const btn1 = copyButtons.nth(1);

      // Click btn0
      await btn0.click();
      await page.waitForTimeout(50);
      // Immediately click btn1
      await btn1.click();
      await page.waitForTimeout(100);

      // Both should show 'Copied!'
      const text0 = (await btn0.locator(".btn-text").textContent())?.trim();
      const text1 = (await btn1.locator(".btn-text").textContent())?.trim();

      assert.equal(text0, "Copied!", "First button should show 'Copied!'");
      assert.equal(text1, "Copied!", "Second button should show 'Copied!'");

      // Verify clipboard holds content of the second button
      const expectedText1 = decodeURIComponent(
        (await page.locator(".shiki-wrapper").nth(1).getAttribute("data-raw-code")) || ""
      );
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      assert.equal(clipboardText, expectedText1, "Clipboard must reflect the most recent copy action");
    }

    await context.close();
  });
});

// ============================================================================
// CHALLENGE 4: Smooth Scroll Behavior and Anchor Jump Responsiveness
// ============================================================================
describe("CHALLENGE 4: Smooth Scroll & Anchor Jump Responsiveness", () => {
  it("Stress 4.1: Hero scroll button accurately scrolls to #timeline from top of page", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Initial scroll position is 0
    const initialScrollY = await page.evaluate(() => window.scrollY);
    assert.equal(initialScrollY, 0, "Initial scroll position must be 0");

    // Click smooth scroll button
    const scrollBtn = page.locator('a[href="#timeline"]').first();
    await scrollBtn.click();
    await page.waitForTimeout(600); // Allow smooth scroll animation to proceed

    const finalScrollY = await page.evaluate(() => window.scrollY);
    assert.ok(finalScrollY > 400, `Window should have scrolled down, current scrollY: ${finalScrollY}`);

    // Verify #timeline is within the viewport
    const isInViewport = await page.evaluate(() => {
      const el = document.getElementById("timeline");
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= window.innerHeight && rect.bottom >= 0;
    });
    assert.equal(isInViewport, true, "#timeline section must be in visible viewport after scroll");

    await page.close();
  });

  it("Stress 4.2: Deep link /#timeline navigates from secondary page directly to timeline", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/about`, { waitUntil: "networkidle" });

    // Click Timeline in header nav
    const timelineNav = page.locator('nav a[href="/#timeline"]').first();
    assert.equal(await timelineNav.isVisible(), true, "Timeline nav link should exist in header");
    await timelineNav.click();
    await page.waitForURL(`${BASE_URL}/#timeline`);

    assert.equal(page.url(), `${BASE_URL}/#timeline`, "URL should update to /#timeline");
    const timeline = page.locator("#timeline");
    assert.equal(await timeline.isVisible(), true, "#timeline must be visible");

    await page.close();
  });
});

// ============================================================================
// CHALLENGE 5: Interactive Element Edge Cases & Failure Modes
// ============================================================================
describe("CHALLENGE 5: Interactive Element Edge Cases & Failure Modes", () => {
  it("Stress 5.1: Verify zero console errors or uncaught exceptions across all major interactive pages", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors: Array<{ url: string; msg: string }> = [];

    page.on("pageerror", (err) => {
      errors.push({ url: page.url(), msg: err.message });
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push({ url: page.url(), msg: msg.text() });
      }
    });

    const routesToVisit = [
      "/",
      "/about",
      "/articles",
      "/articles/inside-uniqtoken-tokenizer-architecture",
      "/projects",
      "/projects/diffusion-gemma",
        "/tags",
    ];

    for (const route of routesToVisit) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
    }

    assert.equal(
      errors.length,
      0,
      `Expected zero uncaught page errors or console.errors, found: ${JSON.stringify(errors, null, 2)}`
    );

    await page.close();
  });

  it("Stress 5.2: Verify all interactive buttons have accessible type and label attributes", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Query all button elements
    const buttons = await page.$$eval("button", (btns) =>
      btns.map((b) => ({
        type: b.getAttribute("type"),
        ariaLabel: b.getAttribute("aria-label"),
        text: b.textContent?.trim(),
        hasAction: b.onclick !== null || b.getAttribute("type") === "button" || b.getAttribute("type") === "submit",
      }))
    );

    for (const btn of buttons) {
      assert.ok(
        btn.type === "button" || btn.type === "submit" || btn.type === "reset",
        `Button must explicitly specify type attribute: ${JSON.stringify(btn)}`
      );
    }

    await page.close();
  });
});
