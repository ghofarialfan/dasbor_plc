// Optional browser regression: uses an existing Playwright installation, no app dependency.
// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/check-overview-browser.mjs
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.OVERVIEW_URL ?? 'http://127.0.0.1:5173');
  await page.locator('.overview-channel').first().waitFor();
  for (const height of [1080, 960, 900]) {
  await page.setViewportSize({ width: 1920, height });
  for (const id of ['GEN-001', 'GEN-002', 'GEN-003', 'GEN-004']) {
    await page.locator('#overview-generator').selectOption(id);
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.overview-channel').count(), 45);
    assert.equal(await page.locator('.overview-indicator').count(), 45);
    for (const kind of ['temperature', 'speed', 'percentage', 'bullet', 'bar', 'digital']) assert.ok(await page.locator(`[data-indicator="${kind}"]`).count() > 0, `${kind} indicator rendered`);
    if (id === 'GEN-004') assert.equal(await page.locator('.overview-indicator[data-available="false"]').count(), 45);
    for (const [tag, kind] of [['TT-02', 'temperature'], ['ST-401', 'speed'], ['AT-301', 'percentage'], ['PT-201', 'bullet'], ['LSL-19', 'digital'], ['VFD-12', 'digital'], ['M-301', 'digital'], ['GPS-01', 'digital'], ['DNG-01', 'digital'], ['PRT-01', 'digital']]) {
      const card = page.locator('.overview-channel').filter({ has: page.locator('p', { hasText: new RegExp(`^${tag}$`) }) });
      assert.equal(await card.locator('.overview-indicator').getAttribute('data-indicator'), kind);
    }
    const temperatureGauges = page.locator('[data-indicator="temperature"]');
    assert.equal(await temperatureGauges.locator('svg[aria-label^="Gauge suhu"]').count(), await temperatureGauges.count());
    assert.equal(await temperatureGauges.locator('svg > path').count() > 0, true, 'temperature uses gauge arcs');
    if (id === 'GEN-004') assert.equal(await temperatureGauges.locator('svg > line').count(), 0, 'offline temperature has no value needle');
    else assert.ok(await temperatureGauges.locator('svg > line').count() > 0, 'available temperature has a needle');
    const geometry = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      invisible: [...document.querySelectorAll('.overview-channel')].filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > innerHeight || rect.right > innerWidth || rect.width <= 0;
      }).length,
      overflowing: [...document.querySelectorAll('.overview-channel')].filter(element => element.scrollWidth > element.clientWidth + 1).length,
    }));
    assert.deepEqual(geometry, { width: 1920, height, invisible: 0, overflowing: 0 }, `${id} at 1920×${height}`);
    if (id === 'GEN-004') assert.equal(await page.locator('.overview-channel .overview-reading-row > p.my-1').filter({ hasText: '—' }).count(), 45);
    const trigger = page.locator('.overview-channel button').first();
    await trigger.click();
    assert.ok(await page.getByRole('dialog').isVisible());
    await page.getByRole('button', { name: 'Tutup dialog' }).click();
    assert.ok(await trigger.evaluate(element => element === document.activeElement));
    console.log(`PASS: ${id} at 1920×${height}: 45 visible channels, no scroll or card overflow, detail dialog and focus return.`);
  }
  assert.deepEqual(await page.locator('img[alt*="gambar referensi statis"]').evaluateAll(images => images.map(image => Math.round(image.getBoundingClientRect().height))), [110, 110, 110]);
  }
  assert.equal(await page.locator('.overview-chart-kind').innerText(), 'Tren analog · line chart');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.locator('#overview-generator').selectOption('GEN-002');
  await page.getByRole('button', { name: /alarm unit aktif/ }).click();
  assert.ok((await page.getByRole('dialog').innerText()).includes('Suhu motor'));
  await page.getByRole('button', { name: 'Tutup dialog' }).click();
  await page.getByLabel('Periode histori Overview').selectOption('2160');
  await page.getByLabel('Channel histori Overview').selectOption('LSL-19/low');
  await page.waitForTimeout(250);
  assert.equal(await page.locator('.overview-history .recharts-responsive-container').count(), 7);
  assert.equal(await page.locator('.overview-chart-kind').innerText(), 'Riwayat status digital · step chart 0/1');
  assert.ok((await page.locator('.overview-history').innerText()).includes('Tidak aktif'));
  const chartBox = await page.locator('.overview-history .recharts-wrapper').last().boundingBox();
  assert.ok(chartBox);
  await page.mouse.move(chartBox.x + chartBox.width / 2, chartBox.y + chartBox.height / 2);
  await page.waitForTimeout(100);
  const tooltip = page.locator('.overview-history .recharts-tooltip-wrapper').last();
  await tooltip.waitFor({ state: 'visible' });
  assert.ok(!(await tooltip.innerText()).includes('Invalid Date'));
  assert.match(await tooltip.innerText(), /202[0-9]/, 'tooltip includes a full date');
  await page.locator('#site-select').selectOption({ index: 1 });
  assert.equal(await page.locator('#overview-generator option').count(), 2);
  for (const viewport of [{ width: 1366, height: 768 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.equal(width, viewport.width, 'smaller screens scroll vertically, not horizontally');
    assert.equal(await page.locator('.overview-channel').count(), 45);
    console.log(`PASS: responsive ${viewport.width}×${viewport.height}, all channels retained.`);
  }
  assert.deepEqual(errors, [], 'no browser runtime errors');
  console.log('PASS: unit alarms, 90-day history, digital channel selection, site filtering and browser runtime.');
} finally {
  await browser.close();
}
