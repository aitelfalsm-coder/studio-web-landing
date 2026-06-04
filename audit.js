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

server.listen(9292, async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Capture network requests + timing
  const resources = [];
  page.on('response', resp => {
    resources.push({
      url: resp.url().replace('http://localhost:9292', ''),
      status: resp.status(),
      size: parseInt(resp.headers()['content-length'] || '0'),
      type: resp.headers()['content-type']?.split(';')[0] || ''
    });
  });

  const t0 = Date.now();
  await page.goto('http://localhost:9292/', { waitUntil: 'networkidle0', timeout: 30000 });
  const loadTime = Date.now() - t0;

  // Measure Core Web Vitals approximation
  const metrics = await page.evaluate(() => {
    return new Promise(resolve => {
      const r = {};
      new PerformanceObserver(list => {
        list.getEntries().forEach(e => {
          if (e.entryType === 'largest-contentful-paint') r.lcp = Math.round(e.startTime);
        });
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      setTimeout(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        r.fcp = Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0);
        r.domContentLoaded = Math.round(nav.domContentLoadedEventEnd);
        r.loadComplete = Math.round(nav.loadEventEnd);
        r.transferSize = Math.round(nav.transferSize / 1024) + 'KB';

        // Check blocking resources
        r.blockingScripts = performance.getEntriesByType('resource')
          .filter(e => e.initiatorType === 'script' && !e.name.includes('data:'))
          .map(e => ({ url: e.name.split('/').pop(), duration: Math.round(e.duration), size: Math.round(e.transferSize/1024)+'KB' }));

        r.blockingStyles = performance.getEntriesByType('resource')
          .filter(e => e.initiatorType === 'link' && e.name.includes('css'))
          .map(e => ({ url: e.name.split('/').pop(), duration: Math.round(e.duration) }));

        resolve(r);
      }, 2000);
    });
  });

  // Check accessibility issues
  const a11y = await page.evaluate(() => {
    const issues = [];
    // Images without alt
    document.querySelectorAll('img:not([alt])').forEach(el => issues.push('img missing alt: ' + el.src.split('/').pop()));
    // Buttons without accessible name
    document.querySelectorAll('button').forEach(btn => {
      if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) issues.push('button no label: ' + btn.className);
    });
    // Inputs without labels
    document.querySelectorAll('input, textarea, select').forEach(el => {
      if (!el.id || !document.querySelector(`label[for="${el.id}"]`)) {
        if (!el.getAttribute('aria-label') && !el.placeholder) issues.push('input no label: ' + el.type);
      }
    });
    // Low contrast text (simplified check)
    const lowOpacity = [];
    document.querySelectorAll('*').forEach(el => {
      const style = getComputedStyle(el);
      const opacity = parseFloat(style.opacity);
      if (opacity < 0.35 && el.textContent.trim() && el.children.length === 0) {
        lowOpacity.push(el.tagName + ': ' + el.textContent.trim().substring(0,30));
      }
    });
    if (lowOpacity.length) issues.push('Low contrast elements: ' + lowOpacity.length);
    return issues;
  });

  console.log('\n═══════════════════════════════════════');
  console.log('AUDIT RAPPORT — studioweb.ma');
  console.log('═══════════════════════════════════════\n');
  console.log('⏱  TIMING');
  console.log('  FCP:', metrics.fcp + 'ms');
  console.log('  LCP:', metrics.lcp + 'ms');
  console.log('  DOMContentLoaded:', metrics.domContentLoaded + 'ms');
  console.log('  Load complete:', metrics.loadComplete + 'ms');
  console.log('  Total load time:', loadTime + 'ms');
  console.log('  Transfer size:', metrics.transferSize);
  console.log('\n📦 SCRIPTS (blocking)');
  metrics.blockingScripts?.forEach(s => console.log(' ', s.url, '-', s.size, '-', s.duration + 'ms'));
  console.log('\n🎨 STYLESHEETS');
  metrics.blockingStyles?.forEach(s => console.log(' ', s.url, '-', s.duration + 'ms'));
  console.log('\n♿ ACCESSIBILITÉ');
  if (a11y.length === 0) console.log('  ✅ Aucun problème détecté');
  a11y.forEach(i => console.log('  ⚠️', i));
  console.log('\n📋 RESSOURCES CHARGÉES');
  resources.slice(0,12).forEach(r => console.log(' ', r.url, '-', (r.size/1024).toFixed(0)+'KB', '-', r.type));
  console.log('\n═══════════════════════════════════════\n');

  await browser.close();
  server.close();
});
