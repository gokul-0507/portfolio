import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function captureBefore() {
  const browser = await chromium.launch();
  const dir = path.resolve('public/screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const viewports = [
    { width: 1440, height: 900, name: '1440' },
    { width: 360, height: 800, name: '360' }
  ];

  for (const vp of viewports) {
    for (const theme of ['dark', 'light']) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
      await page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
      }, theme);
      await page.waitForTimeout(300);
      const shotPath = path.resolve(`public/screenshots/before-home-${theme}-${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
      console.log(`Captured ${shotPath}`);
      await page.close();
    }
  }

  await browser.close();
}

captureBefore().catch(console.error);
