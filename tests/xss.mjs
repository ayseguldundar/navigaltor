// Güvenlik testi: etkinlik görsellerine ve metin alanlarına zararlı içerik konduğunda tarayıcıda kod çalışmamalı.
import { startServer } from '../scripts/serve.mjs';
import { chromium } from 'playwright';

const PORT = 4177;
const server = await startServer(PORT);
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.route(/fonts\./, (r) => r.abort());
await page.goto(`http://localhost:${PORT}/giris`);
await page.addScriptTag({ url: '/app/kit-gorsel.js' });
const result = await page.evaluate(() => {
  window.__pwn = 0;
  const X = '"><img src=x onerror="window.__pwn++">';
  const XS = `<img src=x onerror="window.__pwn++">`;
  const types = ['flow', 'organizer', 'sort', 'cards', 'chat', 'news', 'timeline', 'routine', 'bars', 'pie', 'budget', 'pizza', 'balance',
    'numberline', 'areagrid', 'cubes', 'coord', 'dice', 'zoom', 'solar', 'circuit', 'heat', 'light', 'force', 'atom', 'lever', 'shapes'];
  const deep = { kind: X, steps: [X, XS], slots: [X], bins: [X, XS], items: [{ t: X, b: 0, w: X, tr: X, ic: XS, time: X, label: X, value: X }, X],
    lines: [{ who: X, t: XS }], headline: X, lead: XS, tags: [X], events: [{ y: X, t: XS }], title: X, labels: [X], values: [X, 3], unit: X,
    total: X, pizzas: 2, target: [X, XS], maxCut: X, left: 'alert(1)||window.__pwn++', right: `${XS}`, solution: X, min: X, max: X, step: 0,
    rows: X, cols: X, shade: X, l: XS, w: X, h: 2, points: [[X, 1]], line: { m: XS, b: X }, counts: [X], preset: X, mode: X, bulbs: X,
    series: X, material: X, materials: [X], obj: X, forces: [{ dir: X, n: XS }], element: XS, labels2: X };
  const host = document.createElement('div');
  document.body.appendChild(host);
  let html = '';
  for (const type of types) {
    html += window.VIS.render({ type, params: deep, caption: XS }, 'x-' + type) || '';
  }
  const act = { title: XS, subtitle: X, scenario: XS, kazanim: [XS], skills21: [XS], digital: [XS], tools: [XS], steps: [{ title: XS, mode: X, items: [XS], warn: XS }],
    checklist: [XS], navi: [XS], rubric: [{ k: XS, d: X, l4: XS, l3: XS, l2: XS, l1: XS }], diff: { destek: XS, ileri: XS }, misconception: XS,
    visual: { type: 'cards', params: deep, caption: XS }, course: 'MAT', grade: 7, duration: X, format: X, themeName: XS };
  for (const role of ['ogretmen', 'ogrenci', 'veli']) html += window.renderEtkinlik(act, { role, key: 'r-' + role });
  host.innerHTML = html;
  return { imgs: host.querySelectorAll('img[onerror]').length, len: html.length };
});
await page.waitForTimeout(300);
const pwn = await page.evaluate(() => window.__pwn);
await browser.close(); server.close();
const ok = result.imgs === 0 && pwn === 0 && result.len > 1000;
console.log(`${ok ? '✓' : '✗'} zararlı içerik etkinlik ve görsellerde çalışmadı (onerror öğesi: ${result.imgs}, çalışan kod: ${pwn})`);
if (errors.length) console.log('  uyarı: ' + errors.slice(0, 3).join(' | '));
process.exit(ok ? 0 : 1);
