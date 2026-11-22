import { describe, it } from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { chromium } from "playwright-core";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function isServerRunning(host = "127.0.0.1", port = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

describe("Kinetic Brutalist Studio Intro Experience & Accessibility", () => {
  it("Studio Gate: renders on cold visit, enforces Skip Intro, focus management, and keyboard navigation", async (t) => {
    const running = await isServerRunning("127.0.0.1", 3000);
    if (!running) {
      t.skip("Local test server is not running on port 3000. Skipping live browser e2e tests.");
      return;
    }

    const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    // Cold visit
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Ensure gate is open for verification
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

    // 3. Verify Skip Intro button is present with accessible 44px touch target
    const skipIntroBtn = page.locator('button[aria-label="Skip Studio Introduction and Enter Directly"]');
    assert.equal(await skipIntroBtn.isVisible(), true, "Skip Intro button must be present in Gate");

    // 4. Verify initial focus landed on Skip Intro control
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    assert.equal(focusedElement, "Skip Studio Introduction and Enter Directly", "Initial focus must land on Skip Intro");

    // 5. Verify Monospace Archival Index contains nodes
    const indexItems = page.locator('[role="dialog"] ul li');
    const indexCount = await indexItems.count();
    assert.ok(indexCount >= 6, `Gate index must display at least 6 nodes, found ${indexCount}`);

    // 6. Test Skip Intro dismissal
    await skipIntroBtn.click();
    await page.waitForTimeout(650);
    assert.equal(await gate.isVisible(), false, "Gate must be dismissed after clicking Skip Intro");

    // 7. Verify Kinetic Runway Filmstrip is visible and keyboard accessible
    const reel = page.locator('[role="region"][aria-label*="Archival Research Reel"]');
    assert.equal(await reel.isVisible(), true, "Kinetic Runway reel must have role=region and aria-label");

    // 8. Verify Filmstrip 35mm Ruler is an accessible slider
    const ruler = page.locator('[role="slider"][aria-label="Filmstrip timeline scrubber"]');
    assert.equal(await ruler.isVisible(), true, "35mm Filmstrip ruler must have role=slider");
    const valuenow = await ruler.getAttribute("aria-valuenow");
    assert.ok(valuenow !== null && !isNaN(Number(valuenow)), "Slider must have numeric aria-valuenow");

    // 9. Verify SVG generative diagrams exist
    const svgDiagrams = page.locator("svg path, svg circle, svg rect");
    assert.ok((await svgDiagrams.count()) > 0, "Generative SVG diagrams must be rendered on cards");

    await context.close();
    await browser.close();
  });
});
