import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PORT = 4321;
const DIST_DIR = path.resolve('dist');

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

// Find Chrome path
const localAppData = process.env.LOCALAPPDATA || 'C:\\Users\\HP\\AppData\\Local';
const chromePath = path.join(
  localAppData,
  'ms-playwright',
  'chromium-1248',
  'chrome-win64',
  'chrome.exe',
);
process.env.CHROME_PATH = chromePath;

async function runAllLighthouse() {
  console.log(`Starting server on http://localhost:${PORT}...`);
  const server = await startServer();

  const runs = [
    { name: 'home-mobile', url: `http://localhost:${PORT}/`, formFactor: 'mobile' },
    { name: 'home-desktop', url: `http://localhost:${PORT}/`, formFactor: 'desktop' },
    {
      name: 'satquery-mobile',
      url: `http://localhost:${PORT}/projects/satquery-ai`,
      formFactor: 'mobile',
    },
    {
      name: 'satquery-desktop',
      url: `http://localhost:${PORT}/projects/satquery-ai`,
      formFactor: 'desktop',
    },
  ];

  const results = {};

  for (const r of runs) {
    const reportPath = path.resolve(`scripts/lh-${r.name}.json`);
    const isDesktop = r.formFactor === 'desktop';
    const preset = isDesktop ? '--preset=desktop' : '';
    const cmd = `npx lighthouse ${r.url} --output=json --output-path="${reportPath}" --chrome-flags="--headless --no-sandbox" ${preset} --quiet`;

    console.log(`Running Lighthouse for ${r.name} (${r.formFactor})...`);
    try {
      execSync(cmd, { env: { ...process.env, CHROME_PATH: chromePath }, stdio: 'ignore' });
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      results[r.name] = {
        performance: Math.round(report.categories.performance.score * 100),
        accessibility: Math.round(report.categories.accessibility.score * 100),
        bestPractices: Math.round(report.categories['best-practices'].score * 100),
        seo: Math.round(report.categories.seo.score * 100),
        lcp: report.audits['largest-contentful-paint'].displayValue,
        cls: report.audits['cumulative-layout-shift'].displayValue,
      };
      console.log(`${r.name} Results:`, results[r.name]);
    } catch (err) {
      console.error(`Failed ${r.name}:`, err.message);
      results[r.name] = 'FAILED';
    }
  }

  fs.writeFileSync('scripts/lighthouse-summary.json', JSON.stringify(results, null, 2));
  server.close();
}

runAllLighthouse().catch(console.error);
