// Renders the v3 "Hansard Press" mockup screens to PNG with Playwright.
// Usage: node render.mjs   (requires: npm i playwright && npx playwright install chromium)
import { chromium } from 'playwright';
import { readdirSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';
import { createServer } from 'node:http';

const here = dirname(fileURLToPath(import.meta.url));
const v3Dir = join(here, '..');
const screensDir = join(here, 'screens');
const outDir = join(v3Dir, 'phones');
mkdirSync(outDir, { recursive: true });

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = join(v3Dir, path);
  try {
    const data = readFileSync(file);
    const type = file.endsWith('.html') ? 'text/html' : file.endsWith('.css') ? 'text/css'
      : file.endsWith('.ttf') ? 'font/ttf' : file.endsWith('.png') ? 'image/png' : 'application/octet-stream';
    res.writeHead(200, { 'content-type': type });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const files = readdirSync(screensDir).filter(f => f.endsWith('.html')).sort();
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });

const shots = [];
for (const f of files) {
  await page.goto(`${base}/src/screens/${f}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  const el = page.locator('#shot');
  const name = basename(f, '.html') + '.png';
  await el.screenshot({ path: join(outDir, name) });
  shots.push({ file: name, title: f.replace(/^\d+-/, '').replace('.html', '') });
  console.log('rendered', name);
}
await browser.close();

// compose the sheet: 2 rows x 5
const cell = 420, pad = 36, labelH = 34;
const cols = 5, rows = Math.ceil(shots.length / cols);
const w = cols * cell + pad * (cols + 1);
const h = rows * (844 + labelH + pad) + pad;
const cells = shots.map((s, i) => {
  const col = i % cols, row = Math.floor(i / cols);
  const x = pad + col * (cell + pad);
  const y = pad + row * (844 + labelH + pad);
  const title = s.title.replace(/-/g, ' ');
  return `<div style="position:absolute; left:${x}px; top:${y}px; width:${cell}px; text-align:center;">
    <img src="${base}/phones/${s.file}" width="${cell}" style="display:block;">
    <div style="font:700 13px 'Hanken Grotesk'; color:#939aa7; letter-spacing:.14em; text-transform:uppercase; margin-top:12px;">${title}</div>
  </div>`;
}).join('');

writeFileSync(join(here, 'sheet.html'), `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>@font-face{font-family:'Hanken Grotesk';font-weight:700;src:url('${base}/fonts/HankenGrotesk-700.ttf');}
body{margin:0;background:#060708;width:${w}px;height:${h}px;position:relative;}</style></head>
<body>${cells}</body></html>`);

const b2 = await chromium.launch();
const p2 = await b2.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
await p2.goto('file://' + join(here, 'sheet.html'));
await p2.waitForTimeout(300);
await p2.screenshot({ path: join(v3Dir, 'v3-sheet.png'), fullPage: true });
await b2.close();
server.close();
console.log('rendered v3-sheet.png');
