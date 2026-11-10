// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/check-camera-browser.mjs
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ headless: true });
const base = process.env.OVERVIEW_URL ?? 'http://127.0.0.1:5173';
const files = ['genset-camera-01.png', 'genset-camera-02.png', 'genset-thermal.jpg'];
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of ['/camera-view', '/gauge-widget']) {
      await page.goto(base + '/#' + route);
      const gallery = page.getByRole('region', { name: 'Gambar referensi kamera', exact: true });
      await gallery.waitFor();
      assert.equal(await gallery.locator('img').count(), 3);
      for (const file of files) {
        const image = gallery.locator(`img[src$="${file}"]`);
        await image.evaluate(img => img.decode());
      }
      const selector = route === '/camera-view' ? page.getByLabel('Unit terpilih') : page.locator('label').filter({ hasText: /^Unit aktif/ }).locator('select');
      for (const id of ['GEN-001', 'GEN-004']) {
        await selector.selectOption(id);
        assert.equal(await gallery.locator('img').count(), 3, `${route}: media available for ${id}`);
      }
      for (const title of ['Kamera genset 1', 'Kamera genset 2', 'Thermal']) {
        await gallery.getByRole('button', { name: `Perbesar ${title}`, exact: true }).click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        assert.match(await dialog.innerText(), /bukan live CCTV/);
        await dialog.locator('img').evaluate(img => img.decode());
        await page.keyboard.press('Escape');
      }
      if (route === '/camera-view') {
        for (const cols of [1, 2, 4]) {
          const button = page.getByRole('button', { name: `${cols} kolom`, exact: true });
          await button.click();
          assert.equal(await button.getAttribute('aria-pressed'), 'true');
        }
        await page.reload();
        assert.equal(await page.getByRole('button', { name: '4 kolom', exact: true }).getAttribute('aria-pressed'), 'true');
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route}: no horizontal overflow`);
      console.log(`PASS: ${route}, images/dialogs/online-offline/layout at ${viewport.width}px`);
    }
  }
  await page.route('**/media/genset-*', route => route.abort());
  for (const route of ['/camera-view', '/gauge-widget']) {
    await page.goto(base + '/#' + route);
    await page.reload();
    const gallery = page.getByRole('region', { name: 'Gambar referensi kamera', exact: true });
    await gallery.getByRole('status').first().waitFor();
    assert.equal(await gallery.getByRole('status').count(), 3);
    await gallery.getByRole('button', { name: 'Perbesar Thermal', exact: true }).click();
    await page.getByRole('dialog').getByRole('status').waitFor();
    await page.keyboard.press('Escape');
    console.log(`PASS: ${route}, missing media fallback in thumbnails and dialog`);
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
