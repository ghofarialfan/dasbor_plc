// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/check-tabs-browser.mjs
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ headless: true });
const base = process.env.OVERVIEW_URL ?? 'http://127.0.0.1:5173';
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of ['/device', '/virtual', '/data', '/gauge-widget', '/chart-widget']) {
      await page.goto(base + '/#' + route);
      await page.locator('main').waitFor();
      await page.waitForTimeout(200);
      assert.ok(await page.locator('main').innerText(), route);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(width <= viewport.width, `${route}: horizontal overflow ${width} > ${viewport.width}`);
      if (route === '/device') {
        assert.ok(await page.locator('[data-channel-reading] .overview-indicator').count() > 0);
        await page.getByRole('button').filter({ hasText: 'GEN-001' }).first().click();
        await page.getByRole('button', { name: 'Instrumen', exact: true }).click();
        const dialog = page.getByRole('dialog');
        assert.ok(await dialog.locator('[data-indicator="digital"]').count() > 0);
        assert.match(await dialog.innerText(), /Tidak rendah|Level rendah/);
        await page.keyboard.press('Escape');
      }
      if (route === '/virtual') {
        await page.getByRole('button', { name: /CB-01/ }).first().click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        assert.ok(await dialog.locator('[data-indicator="digital"]').count() > 0);
        assert.match(await dialog.innerText(), /Tertutup|Terbuka/);
        await page.keyboard.press('Escape');
      }
      if (route === '/gauge-widget') {
        for (const kind of ['digital', 'percentage', 'bullet', 'bar']) assert.ok(await page.locator(`[data-indicator="${kind}"]`).count() > 0, kind);
        for (const id of ['GEN-001', 'GEN-002', 'GEN-003', 'GEN-004']) {
          await page.locator('label').filter({ hasText: /^Unit aktif/ }).locator('select').selectOption(id);
          const lamps = page.locator('[data-indicator="digital"]');
          assert.ok(await lamps.count() > 0);
          if (id === 'GEN-004') {
            assert.equal(await page.locator('[data-channel-reading] .overview-indicator[data-available="true"]').count(), 0);
            assert.equal(await lamps.locator('span[style*="background: rgb(37, 99, 235)"]').count(), 0);
          }
        }
        await page.locator('label').filter({ hasText: /^Unit aktif/ }).locator('select').selectOption('GEN-001');
      }
      if (route === '/data' || route === '/chart-widget') {
        await page.getByLabel('Channel kapabilitas', { exact: true }).selectOption('LSL-19/low');
        if (route === '/data') {
          const table = page.locator('table').last();
          assert.match(await table.innerText(), /Tidak rendah|Level rendah/);
          assert.doesNotMatch(await table.innerText(), /\btrue\b|\bfalse\b/);
        } else assert.ok(await page.getByText('Riwayat status digital · step chart 0/1', { exact: true }).isVisible());
      }
      console.log(`PASS: ${route} at ${viewport.width}×${viewport.height}`);
    }
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
