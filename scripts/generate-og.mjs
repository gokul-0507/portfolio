import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function generateOgImage() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });

  const svgContent = fs.readFileSync(path.resolve('public/og-image.svg'), 'utf-8');
  await page.setContent(
    `<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;">${svgContent}</body></html>`,
  );
  await page.screenshot({ path: 'public/og-image.png' });
  await browser.close();
  console.log('Generated public/og-image.png successfully.');
}

generateOgImage().catch(console.error);
