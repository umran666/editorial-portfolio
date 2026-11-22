import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium, type Browser } from "playwright-core";
import { spawn, type ChildProcess } from "node:child_process";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CHROME_PATH = process.env.CHROME_PATH || "/usr/local/bin/chromium";
let browser: Browser;
let spawnedServer: ChildProcess | null = null;

async function ready(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(url: string, timeoutMs = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await ready(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

before(async () => {
  if (!(await ready(BASE_URL))) {
    spawnedServer = spawn("npm", ["run", "start"], {
      stdio: "pipe",
      env: { ...process.env, PORT: "3000" },
      detached: true,
    });
    await waitForServer(BASE_URL);
  }

  browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
});

after(async () => {
  await browser?.close();
  if (spawnedServer?.pid) {
    try {
      process.kill(-spawnedServer.pid, "SIGKILL");
    } catch {
      spawnedServer.kill("SIGKILL");
    }
  }
});

describe("AI research journal browser checks", () => {
  it("mobile navigation exposes the six journal routes", async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    const open = page.locator('button[aria-label="Open menu"]');
    await open.click();
    const drawer = page.locator("div.md\\:hidden");
    assert.equal(await drawer.isVisible(), true);
    for (const [text, href] of [
      ["Journal", "/"],
      ["Lab Log", "/#timeline"],
      ["Notes", "/articles"],
      ["Projects", "/projects"],
      ["About", "/about"],
      ["Index", "/tags"],
    ]) {
      const link = drawer.locator(`a:has-text("${text}")`).first();
      assert.equal(await link.isVisible(), true);
      assert.equal(await link.getAttribute("href"), href);
    }
    await page.close();
  });

  it("lab log filters projects and notes without a reload", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    assert.equal((await page.$$("article.group")).length, 6);
    await page.locator('button:has-text("Projects")').click();
    assert.equal((await page.$$("article.group")).length, 3);
    await page.locator('button:has-text("Notes")').click();
    assert.equal((await page.$$("article.group")).length, 3);
    await page.locator('button:has-text("All")').click();
    assert.equal((await page.$$("article.group")).length, 6);
    await page.close();
  });

  it("notes keep working code-copy controls", async () => {
    const context = await browser.newContext();
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/articles/inside-uniqtoken-tokenizer-architecture`, { waitUntil: "networkidle" });
    const button = page.locator(".code-copy-btn").first();
    assert.equal(await button.isVisible(), true);
    await button.click();
    await page.waitForTimeout(200);
    assert.equal((await button.locator(".btn-text").textContent())?.trim(), "Copied!");
    await context.close();
  });

  it("header routes and RSS resolve", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    for (const [label, path] of [["Journal", "/"], ["Notes", "/articles"], ["Projects", "/projects"], ["About", "/about"], ["Index", "/tags"]]) {
      const link = page.locator(`nav[aria-label="Main Navigation"] a:has-text("${label}")`);
      assert.equal(await link.isVisible(), true);
      assert.equal(await link.getAttribute("href"), path);
      assert.equal((await page.request.get(`${BASE_URL}${path}`)).status(), 200);
    }
    assert.equal((await page.request.get(`${BASE_URL}/rss.xml`)).status(), 200);
    assert.equal((await page.request.get(`${BASE_URL}/quotes`)).status(), 404);
    await page.close();
  });

  it("hero project links point to the three real working threads", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    for (const slug of ["uniqtoken", "uniqkache", "diffusion-gemma"]) {
      const link = page.locator(`a[href="/projects/${slug}"]`).first();
      assert.equal(await link.isVisible(), true);
      assert.equal((await page.request.get(`${BASE_URL}/projects/${slug}`)).status(), 200);
    }
    await page.close();
  });

  it("topic index and 404 recovery remain usable", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${BASE_URL}/tags`, { waitUntil: "networkidle" });
    const firstTag = page.locator('main a[href^="/tags/"]').first();
    assert.equal(await firstTag.isVisible(), true);
    await Promise.all([page.waitForURL("**/tags/**"), firstTag.click()]);
    assert.equal(page.url().includes("/tags/"), true);
    await page.goto(`${BASE_URL}/not-a-real-route`, { waitUntil: "networkidle" });
    assert.equal(await page.locator("h1").textContent(), "Lost in the Archive");
    await page.close();
  });
});
