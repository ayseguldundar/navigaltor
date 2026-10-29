// Uçtan uca duman testi: üç paneli gerçek tarayıcıda açar, bağlı akışları ve PWA parçalarını denetler.
//   npm test   (önce:  npm i  &&  npx playwright install chromium)
import { startServer } from '../scripts/serve.mjs';
import { chromium } from 'playwright';

const PORT = 4174, BASE = `http://localhost:${PORT}`;
const fails = [];
const check = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) fails.push(msg); };

const server = await startServer(PORT);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const errors = [];
ctx.on('page', (p) => p.on('pageerror', (e) => errors.push(`${p.url()} → ${e.message}`)));
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const page = await ctx.newPage();
const go = async (hash, wait = 350) => { await page.evaluate((h) => { location.hash = h; }, hash); await page.waitForTimeout(wait); };
const viewText = () => page.evaluate(() => document.querySelector('#view')?.innerText || '');

try {
  // Giriş sayfası
  await page.goto(BASE + '/demo');
  check((await page.locator('a.card').count()) === 3, 'demo sayfasında üç panel bağlantısı var');
  await page.goto(BASE + '/');
  check((await page.title()) === 'NavigAItor' && (await page.locator('a[href="/giris"]').count()) > 0, 'ana sayfa yeni tasarımla açılıyor ve giriş bağlantısı var');

  // Öğretmen paneli: tüm sayfalar
  await page.goto(BASE + '/demo/ogretmen');
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForTimeout(800);
  check(page.url().endsWith('#home'), 'öğretmen paneli ana sayfada açılıyor');
  const teacherRoutes = ['home', 'classes', 'students', 'activities/tum', 'activities/kutuphane', 'activities/yeni',
    'activities/urunler', 'assessments/sinavlar', 'assessments/sifir', 'analytics/sinif', 'reports/ogrenci',
    'student/rapor/s4', 'notifications', 'settings'];
  const empty = [];
  for (const r of teacherRoutes) { await go(r); if ((await viewText()).length < 150) empty.push(r); }
  check(empty.length === 0, `öğretmen sayfalarının hepsi içerikli${empty.length ? ' — boş: ' + empty.join(', ') : ''}`);

  // 100 etkinlik ve görselleri
  const ids = await page.evaluate(() => ACTLIB.map((a) => a.id));
  check(ids.length === 100, `kütüphanede 100 etkinlik var (${ids.length})`);
  const noVisual = [];
  for (const id of ids) { await go('activities/etkinlik/' + id, 250); if (!(await page.$('figure.vis'))) noVisual.push(id); }
  check(noVisual.length === 0, `her etkinlikte görsel var${noVisual.length ? ' — eksik: ' + noVisual.join(', ') : ''}`);

  // Kazanım kodu sızıntısı yok
  const codeRe = /\b(MAT|TUR|FEN|SOS|ING)\d-\d+\b|\b(MAT|FB|SB|ENG)\.?\d+\.\d+/;
  const leaks = [];
  for (const r of teacherRoutes) { await go(r, 250); if (codeRe.test(await page.evaluate(() => document.body.innerText))) leaks.push(r); }
  check(leaks.length === 0, `arayüzde kazanım kodu görünmüyor${leaks.length ? ' — ' + leaks.join(', ') : ''}`);

  // Bağlı akış: öğretmen atar → öğrenci planında görünür → öğrenci tamamlar → öğretmen görür
  await go('activities/etkinlik/sos-7-12');
  await page.click('#view [data-act="libAssign"]'); await page.waitForTimeout(300);
  await page.click('[data-act="libADo"]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => DB.st.plan.some((t) => t.lib === 'sos-7-12')), 'öğretmenin atadığı etkinlik öğrenci planına düştü');

  const stu = await ctx.newPage();
  await stu.goto(BASE + '/demo/ogrenci'); await stu.waitForTimeout(1000);
  check(!!(await stu.$('#obLayer .ob-card')), 'öğrencinin ilk girişinde tanışma formu açılıyor');
  await stu.click('#obLayer [data-act="obNext"]'); await stu.waitForTimeout(200);
  await stu.click('#obLayer [data-act="obLater"]'); await stu.waitForTimeout(200);
  check(!(await stu.$('#obLayer .ob-card')), 'tanışma formu "sonra" ile kapanıyor');
  await stu.evaluate(() => { location.hash = 'o-plan'; }); await stu.waitForTimeout(400);
  check(await stu.evaluate(() => DB.st.plan.some((t) => t.lib === 'sos-7-12') && document.querySelector('#view').innerText.length > 200), 'öğrenci panelinde çalışma planı açılıyor');
  check(!/ertele/i.test(await stu.evaluate(() => document.querySelector('#view').innerText)), 'çalışma planında Ertele seçeneği yok');
  await stu.evaluate(() => { location.hash = 'o-etk/sos-7-12'; }); await stu.waitForTimeout(400);
  check(!(await stu.$('#view table.lib-rub')), 'öğrenci etkinlik sayfasında puanlama tablosu yok');
  const n = await stu.locator('#view [data-chg="libChk"]').count();
  for (let i = 0; i < n; i++) { await stu.locator('#view [data-chg="libChk"]').nth(i).click(); await stu.waitForTimeout(60); }
  await stu.click('#view [data-act="libDoneStu"]'); await stu.waitForTimeout(500);
  await page.reload(); await page.waitForTimeout(800);
  const done = await page.evaluate(() => DB.acts.filter((a) => a.lib === 'sos-7-12').some((a) => a.subs[ME]?.state === 'tamamladı'));
  check(done, 'öğrencinin tamamladığı etkinlik öğretmen panelinde görünüyor');

  // Veli paneli
  await page.goto(BASE + '/demo/veli'); await page.waitForTimeout(800);
  check(page.url().endsWith('#v-home'), 'veli paneli açılıyor');
  await go('v-mesaj');
  check(page.url().endsWith('#v-home'), 'veli panelinde mesajlaşma kapalı');

  // PWA
  for (const p of ['ogretmen', 'ogrenci', 'veli']) {
    const m = await (await fetch(`${BASE}/manifest-${p}.webmanifest`)).json();
    check(m.start_url === { ogretmen: '/yonetim', ogrenci: '/ogrenci', veli: '/veli' }[p] && m.icons.length === 3, `${p} uygulama bildirimi (manifest) geçerli`);
  }
  await page.goto(BASE + '/demo/ogretmen'); await page.waitForTimeout(1500);
  const sw = await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()));
  check(sw, 'hizmet çalışanı (çevrimdışı destek) kayıtlı');

  // Mobil genişlik
  const mob = await ctx.newPage(); await mob.setViewportSize({ width: 390, height: 844 });
  await mob.goto(BASE + '/demo/ogrenci#o-home'); await mob.waitForTimeout(800);
  check((await mob.evaluate(() => document.documentElement.scrollWidth)) <= 392, 'telefonda yatay taşma yok');

  check(errors.length === 0, `tarayıcı hatası yok${errors.length ? '\n  ' + errors.slice(0, 5).join('\n  ') : ''}`);
} finally {
  await browser.close();
  server.close();
}

console.log(fails.length ? `\n${fails.length} kontrol başarısız.` : '\nTüm kontroller geçti.');
process.exit(fails.length ? 1 : 0);
