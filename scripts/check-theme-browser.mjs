// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/check-theme-browser.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const statusSource = await readFile(new URL('../src/lib/device-status.ts', import.meta.url), 'utf8');
const statusCode = ts.transpileModule(statusSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { deviceStatusDefinitions } = await import(`data:text/javascript;base64,${Buffer.from(statusCode).toString('base64')}`);
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ headless: true });
const base = process.env.OVERVIEW_URL ?? 'http://127.0.0.1:5173';
const key = 'genset-demo:v1:theme';
const routes = ['/', '/device', '/virtual', '/data', '/gauge-widget', '/chart-widget', '/camera-view', '/news', '/support', '/profile', '/logout'];
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  const toggle = page.getByRole('switch', { name: 'Night mode' });
  assert.equal(await toggle.getAttribute('aria-checked'), 'false');
  await toggle.focus();
  await page.keyboard.press('Space');
  assert.equal(await toggle.getAttribute('aria-checked'), 'true');
  for (const theme of ['dark', 'light']) {
    if (theme === 'light') await toggle.click();
    // Exercise every centralized status, including unknown (not present in the default fleet).
    for (const [status, definition] of Object.entries(deviceStatusDefinitions)) {
      const actual = await page.evaluate(className => {
        const badge = document.createElement('span');
        badge.className = className;
        document.body.append(badge);
        const style = getComputedStyle(badge);
        const colors = [style.backgroundColor, style.color];
        badge.remove();
        return colors;
      }, definition.className);
      const expected = theme === 'dark'
        ? status === 'running' ? ['rgb(16, 56, 47)', 'rgb(52, 211, 153)']
          : status === 'standby' ? ['rgb(61, 48, 22)', 'rgb(251, 191, 36)']
          : ['rgb(36, 55, 80)', 'rgb(167, 182, 203)']
        : status === 'running' ? ['rgb(236, 253, 245)', 'rgb(4, 120, 87)']
          : status === 'standby' ? ['rgb(255, 251, 235)', 'rgb(180, 83, 9)']
          : ['rgb(241, 245, 249)', 'rgb(71, 85, 105)'];
      assert.deepEqual(actual, expected, `${theme} ${status} badge colors`);
    }
    console.log(`PASS: ${theme} Running, Standby, Offline and unknown badge colors`);

    for (const viewport of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      for (const route of routes) {
        await page.goto(base + '/#' + route);
        await page.locator('main').waitFor();
        assert.equal(await page.locator('html').evaluate(el => el.classList.contains('dark')), theme === 'dark');
        assert.equal(await page.getByRole('switch', { name: 'Night mode' }).getAttribute('aria-checked'), String(theme === 'dark'));
        assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), theme === 'dark' ? 'rgb(11, 18, 32)' : 'rgb(244, 246, 250)');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme} ${route} ${viewport.width}: overflow`);
        if (theme === 'dark') {
          // No remaining solid-white surfaces, including inputs/cards, inside the page.
          const white = await page.locator('main').evaluate(el => [...el.querySelectorAll('*')].filter(node => node.getBoundingClientRect().width && getComputedStyle(node).backgroundColor === 'rgb(255, 255, 255)').map(node => node.tagName + '.' + node.className).slice(0, 5));
          assert.deepEqual(white, [], `${route}: white surface`);
        }
        if (route === '/profile') {
          await page.getByRole('button', { name: 'Menu profil' }).click();
          const menu = page.getByRole('menu');
          await menu.waitFor();
          assert.equal(await menu.evaluate(el => getComputedStyle(el).backgroundColor), theme === 'dark' ? 'rgb(28, 44, 67)' : 'rgb(255, 255, 255)');
          await page.keyboard.press('Escape');
          if (viewport.width === 390) {
            await page.getByRole('button', { name: 'Buka menu' }).click();
            await page.getByRole('dialog').waitFor();
            await page.keyboard.press('Escape');
          }
        }
        if (route === '/camera-view') {
          const image = page.locator('main img').first();
          assert.equal(await image.evaluate(el => getComputedStyle(el).filter), 'none');
          await page.getByRole('button', { name: 'Perbesar Thermal', exact: true }).click();
          const dialog = page.getByRole('dialog');
          assert.equal(await dialog.evaluate(el => getComputedStyle(el).backgroundColor), theme === 'dark' ? 'rgb(28, 44, 67)' : 'rgb(255, 255, 255)');
          await page.keyboard.press('Escape');
        }
        console.log(`PASS: ${theme} ${route} at ${viewport.width}px`);
      }
    }
  }
  await page.getByRole('switch', { name: 'Night mode' }).click();
  await page.reload();
  assert.equal(await toggle.getAttribute('aria-checked'), 'true');
  const second = await context.newPage();
  await second.goto(base);
  await second.getByRole('switch', { name: 'Night mode' }).waitFor();
  await second.getByRole('switch', { name: 'Night mode' }).click();
  await page.waitForFunction(() => !document.documentElement.classList.contains('dark'));
  await second.evaluate(key => localStorage.setItem(key, '"invalid"'), key);
  await page.reload();
  assert.equal(await toggle.getAttribute('aria-checked'), 'false');
  await page.evaluate(key => localStorage.setItem(key, '"dark"'), key);
  // Verify the head bootstrap without React or its styles/scripts.
  const boot = await context.newPage();
  await boot.route('**/src/main.tsx', route => route.abort());
  await boot.goto(base);
  assert.equal(await boot.locator('html').evaluate(el => el.classList.contains('dark')), true);
  await page.reload();
  await page.evaluate(key => localStorage.removeItem(key), key);
  await page.reload();
  assert.equal(await toggle.getAttribute('aria-checked'), 'false');
  // Contrast checks for the normal text palette against the darkest and raised surfaces.
  const luminance = hex => {
    const rgb = hex.match(/../g).map(v => parseInt(v, 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  for (const text of ['e6edf7', 'a7b6cb', '60a5fa', 'fbbf24', '34d399', 'fb7185']) {
    for (const surface of ['0b1220', '162338', '1c2c43']) {
      const ratio = (luminance(text) + 0.05) / (luminance(surface) + 0.05);
      assert.ok(ratio >= 4.5, `${text}/${surface} contrast ${ratio}`);
    }
  }
  console.log('PASS: keyboard, persistence, browser-tab sync, invalid values, reset, pre-React bootstrap and text-palette contrast >= 4.5:1');
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'QuotaExceededError'); };
  });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(base);
  await blockedPage.getByRole('switch', { name: 'Night mode' }).click();
  assert.equal(await blockedPage.getByRole('switch', { name: 'Night mode' }).getAttribute('aria-checked'), 'true');
  await blockedPage.getByRole('alert').filter({ hasText: 'Tema tidak dapat disimpan' }).waitFor();
  await blockedPage.getByRole('link', { name: 'Camera View', exact: true }).first().click();
  assert.equal(await blockedPage.getByRole('switch', { name: 'Night mode' }).getAttribute('aria-checked'), 'true');
  console.log('PASS: storage failure retains session theme across navigation');
  assert.deepEqual(errors, []);
  await blocked.close();
  await context.close();
} finally { await browser.close(); }
