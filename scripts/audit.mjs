import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const PORT = 4321;
const DIST_DIR = path.resolve('dist');

// MIME types
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.xml': 'application/xml',
  '.woff2': 'font/woff2',
};

// Static server for dist
function startServer() {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(DIST_DIR, reqPath === '/' ? 'index.html' : reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (!fs.existsSync(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      resolve(server);
    });
  });
}

async function runAudit() {
  console.log(`Starting static server on http://localhost:${PORT}...`);
  const server = await startServer();

  const screenshotsDir = path.resolve('public/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const axeSource = fs.readFileSync(path.resolve('node_modules/axe-core/axe.min.js'), 'utf-8');

  const auditResults = {
    axe: {},
    responsive: {},
    performance: {},
    bundleSizes: {},
  };

  // 1. Measure bundle sizes
  let totalJsBytes = 0;
  let totalCssBytes = 0;
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const p = path.join(dir, f);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        walkDir(p);
      } else if (f.endsWith('.js')) {
        totalJsBytes += stat.size;
      } else if (f.endsWith('.css')) {
        totalCssBytes += stat.size;
      }
    }
  }
  walkDir(DIST_DIR);
  auditResults.bundleSizes = {
    totalJsKb: (totalJsBytes / 1024).toFixed(2),
    totalCssKb: (totalCssBytes / 1024).toFixed(2),
  };
  console.log(
    `Bundle sizes: JS ${auditResults.bundleSizes.totalJsKb} KB, CSS ${auditResults.bundleSizes.totalCssKb} KB`,
  );

  // 2. Axe Core audit on / and /projects/satquery-ai
  const page = await browser.newPage();

  for (const urlPath of ['/', '/projects/satquery-ai']) {
    await page.goto(`http://localhost:${PORT}${urlPath}`, { waitUntil: 'networkidle' });
    await page.evaluate(axeSource);
    const axeResults = await page.evaluate(async () => {
      // @ts-ignore
      return await window.axe.run({
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
      });
    });

    auditResults.axe[urlPath] = {
      violationsCount: axeResults.violations.length,
      violations: axeResults.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })),
    };
    console.log(`Axe audit for ${urlPath}: ${axeResults.violations.length} violations.`);
    if (axeResults.violations.length > 0) {
      console.log(JSON.stringify(auditResults.axe[urlPath].violations, null, 2));
    }
  }

  // 3. Performance Metrics (LCP, CLS) on mobile
  const perfPage = await browser.newPage({
    viewport: { width: 375, height: 667 },
    isMobile: true,
  });
  await perfPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  const metrics = await perfPage.evaluate(() => {
    return new Promise((resolve) => {
      let lcp = 0;
      let cls = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        for (const entry of entries) {
          if (entry.startTime > lcp) lcp = entry.startTime;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // @ts-ignore
          if (!entry.hadRecentInput) cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });

      setTimeout(() => {
        resolve({ lcpMs: lcp.toFixed(2), cls: cls.toFixed(4) });
      }, 1000);
    });
  });
  auditResults.performance = metrics;
  console.log(`Performance measured on mobile: LCP ${metrics.lcpMs} ms, CLS ${metrics.cls}`);
  await perfPage.close();

  // 4. Responsive Verification & Screenshots at 360, 768, 1024, 1440
  const breakpoints = [360, 768, 1024, 1440];
  const themes = ['dark', 'light'];

  for (const bp of breakpoints) {
    auditResults.responsive[bp] = {};
    for (const theme of themes) {
      const respPage = await browser.newPage({
        viewport: { width: bp, height: 900 },
      });
      await respPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });

      // Set theme attribute
      await respPage.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
      }, theme);

      // Check for horizontal scroll / overflow
      const overflow = await respPage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      auditResults.responsive[bp][theme] = {
        hasHorizontalScroll: overflow,
      };

      const shotPath = `public/screenshots/home-${theme}-${bp}.png`;
      await respPage.screenshot({ path: shotPath, fullPage: false });
      console.log(`Captured screenshot: ${shotPath} (Horizontal overflow: ${overflow})`);
      await respPage.close();
    }
  }

  // Capture Project Page Screenshot
  for (const theme of themes) {
    const projPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await projPage.goto(`http://localhost:${PORT}/projects/satquery-ai`, {
      waitUntil: 'networkidle',
    });
    await projPage.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
    }, theme);
    const shotPath = `public/screenshots/project-${theme}-1440.png`;
    await projPage.screenshot({ path: shotPath, fullPage: false });
    console.log(`Captured project screenshot: ${shotPath}`);
    await projPage.close();
  }

  // 5. Test Keyboard Navigation & Skip Link
  const kbdPage = await browser.newPage({ viewport: { width: 1024, height: 800 } });
  await kbdPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await kbdPage.keyboard.press('Tab');
  const focusedTag = await kbdPage.evaluate(() => document.activeElement?.tagName);
  const focusedText = await kbdPage.evaluate(() => document.activeElement?.textContent?.trim());
  console.log(`First tab focus: <${focusedTag}> "${focusedText}" (Expected: Skip to main content)`);
  await kbdPage.close();

  // Write results to JSON
  fs.writeFileSync('scripts/audit-results.json', JSON.stringify(auditResults, null, 2));

  await browser.close();
  server.close();
  console.log('Audit completed successfully. Results saved to scripts/audit-results.json.');
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
