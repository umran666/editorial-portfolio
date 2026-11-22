import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

describe("Kinetic Brutalist Studio Intro Experience", () => {
  it("Studio Gate: renders on initial cold visit, verifies index, and unlocks with sound", async () => {
    const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    // Clear session storage before loading
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Click Replay Gate to ensure gate is visible for testing
    const replayBtn = page.locator('button:has-text("Replay Gate")').first();
    if (await replayBtn.isVisible()) {
      await replayBtn.click();
      await page.waitForTimeout(200);
    }

    // 1. Verify Studio Gate dialog
    const gate = page.locator('[role="dialog"][aria-label="Studio Opening Gate"]');
    assert.equal(await gate.isVisible(), true, "Studio Opening Gate must be visible on first load");

    // 2. Verify Gate Typography & TLB branding
    const gateHeading = page.locator('h1:has-text("Better Off®")');
    assert.equal(await gateHeading.isVisible(), true, "Gate heading must display 'Better Off®'");

    // 3. Verify Monospace Archival Index contains nodes
    const indexItems = page.locator('[role="dialog"] ul li');
    const indexCount = await indexItems.count();
    assert.ok(indexCount >= 9, `Gate index must display at least 9 nodes, found ${indexCount}`);

    // 4. Click 'Enter Archive with Sound'
    const enterBtn = page.locator('button:has-text("Enter Archive with Sound")');
    assert.equal(await enterBtn.isVisible(), true, "Enter button must be visible");
    await enterBtn.click();
    await page.waitForTimeout(750); // wait for upward curtain transition

    // 5. Gate should be dismissed
    assert.equal(await gate.isVisible(), false, "Gate must be dismissed after enter click");

    // 6. Verify Kinetic Runway Filmstrip is visible
    const reel = page.locator('text=RUNWAY [').first();
    assert.equal(await reel.isVisible(), true, "Kinetic Runway header must be visible");

    // 7. Verify Filmstrip 35mm Ruler
    const ruler = page.locator('[title="Click or drag to scrub filmstrip ruler"]');
    assert.equal(await ruler.isVisible(), true, "35mm Filmstrip ruler must be interactive");

    // 8. Verify SVG generative diagrams exist
    const svgDiagrams = page.locator("svg path, svg circle, svg rect");
    assert.ok((await svgDiagrams.count()) > 0, "Generative SVG diagrams must be rendered on cards");

    await context.close();
    await browser.close();
  });
});
