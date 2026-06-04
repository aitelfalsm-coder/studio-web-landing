const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const BASE = 'c:/Users/hp/Desktop/landing page media';

const server = http.createServer((req, res) => {
  const fp = path.join(BASE, decodeURIComponent(req.url === '/' ? '/index.html' : req.url));
  const m = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
  try { const d = fs.readFileSync(fp); res.writeHead(200, {'Content-Type': m[path.extname(fp)]||'text/plain','Access-Control-Allow-Origin':'*'}); res.end(d); }
  catch(e) { res.writeHead(404); res.end('404'); }
});

server.listen(9191, async () => {
  console.log('Server on 9191');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-web-security'] });

  const shots = [
    { label: 'hero-load',       url: 'http://localhost:9191/', wait: 4500, scroll: 0,    w: 1440, h: 900 },
    { label: 'hero-mobile',     url: 'http://localhost:9191/', wait: 4500, scroll: 0,    w: 390,  h: 844 },
    { label: 'services-scroll', url: 'http://localhost:9191/', wait: 4500, scroll: 1000, w: 1440, h: 900 },
    { label: 'portfolio',       url: 'http://localhost:9191/', wait: 5000, scroll: 1850, w: 1440, h: 900 },
    { label: 'contact',         url: 'http://localhost:9191/', wait: 4500, scroll: 4500, w: 1440, h: 900 },
  ];

  for (const s of shots) {
    const page = await browser.newPage();
    await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1.5 });
    await page.goto(s.url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, s.wait));
    if (s.scroll > 0) await page.evaluate(y => window.scrollTo(0, y), s.scroll);
    await new Promise(r => setTimeout(r, 800));
    const out = path.join(BASE, `verify-${s.label}.png`);
    await page.screenshot({ path: out, fullPage: false });
    console.log(`✅ ${s.label} → verify-${s.label}.png`);
    await page.close();
  }

  await browser.close();
  server.close();
  console.log('Done.');
});
