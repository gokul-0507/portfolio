import { chromium } from 'playwright';
import path from 'path';

async function generateProfilePlaceholder() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 400, height: 400 },
  });

  const svg = `
  <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" fill="#121821" />
    <!-- Fine grid pattern -->
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1F2937" stroke-width="1" stroke-opacity="0.6" />
    </pattern>
    <rect width="400" height="400" fill="url(#grid)" />
    <!-- Radar rings -->
    <circle cx="200" cy="200" r="160" stroke="#1F2937" stroke-width="2" />
    <circle cx="200" cy="200" r="110" stroke="#5EEAD4" stroke-width="2" stroke-opacity="0.3" stroke-dasharray="6 6" />
    <circle cx="200" cy="200" r="70" fill="#0B0F14" stroke="#5EEAD4" stroke-width="2" />
    <!-- Initials -->
    <text x="200" y="215" text-anchor="middle" fill="#5EEAD4" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="bold" letter-spacing="2">GJ</text>
    <!-- Label -->
    <text x="200" y="320" text-anchor="middle" fill="#9AA6B5" font-family="monospace" font-size="13">Gokul J. // Photo Placeholder</text>
    <text x="200" y="340" text-anchor="middle" fill="#5EEAD4" font-family="monospace" font-size="11">Replace with your profile.jpg</text>
  </svg>
  `;

  await page.setContent(
    `<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;">${svg}</body></html>`,
  );
  await page.screenshot({
    path: path.resolve('public/images/profile.jpg'),
    type: 'jpeg',
    quality: 90,
  });
  await browser.close();
  console.log('Created temporary profile.jpg placeholder.');
}

generateProfilePlaceholder().catch(console.error);
