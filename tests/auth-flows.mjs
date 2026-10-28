// Hesap akışları testi: giriş merkezi, yönetim konsolu, öğrenci PIN girişi, veli kaydı, panelde gerçek yapay zekâ köprüsü.
// Supabase istekleri tests/mock-supabase.mjs ile taklit edilir (gerçek supabase-js kütüphanesi kullanılır).
import { startServer } from '../scripts/serve.mjs';
import { createMock } from './mock-supabase.mjs';
import { chromium } from 'playwright';

const PORT = 4175, BASE = `http://localhost:${PORT}`;
const fails = [];
const check = (ok, m) => { console.log(`${ok ? '✓' : '✗'} ${m}`); if (!ok) fails.push(m); };
const server = await startServer(PORT);
const browser = await chromium.launch();
const mock = createMock();
const errors = [];

async function newCtx(viewport = { width: 1280, height: 860 }) {
  const ctx = await browser.newContext({ viewport });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await ctx.route(/trjqnzsqxlbgwdlasopr\.supabase\.co/, (r) => mock.handle(r));
  ctx.on('page', (p) => p.on('pageerror', (e) => errors.push(`${p.url()} → ${e.message}`)));
  return ctx;
}
const text = (p, sel = 'body') => p.locator(sel).innerText();

try {
  // ---------------------------------------------------------------- 1. Öğretmen kaydı → yönetim
  const t = await newCtx();
  const page = await t.newPage();
  await page.goto(BASE + '/giris#ogretmen');
  await page.click('button[data-mode="signup"]');
  await page.fill('#fn', 'Selin Yılmaz');
  await page.fill('#em', 'selin@okul.test');
  await page.fill('#pw', 'GucluSifre1');
  await page.fill('#sn', 'Atatürk Ortaokulu');
  await page.click('#f button.pri');
  await page.waitForURL('**/yonetim', { timeout: 8000 });
  check(true, 'öğretmen kaydı sonrası yönetim konsoluna yönlendirildi');
  await page.waitForSelector('#schoolName:has-text("Atatürk")');
  check((await text(page, '#who')).includes('Okul yöneticisi'), 'yeni okulu açan kişi okul yöneticisi oldu');
  check((await text(page, '#app')).includes('Henüz şube yok'), 'boş durum: henüz şube yok');

  // Şube aç
  await page.click('[data-act="newSec"] >> nth=0');
  await page.fill('#fs input[name="name"]', '7/a');
  await page.selectOption('#fs select[name="course"]', 'MAT');
  await page.check('#fs input[name="guidance"]');
  await page.click('#fs button.pri');
  await page.waitForSelector('.sec-card');
  const cc = await page.locator('.sec-card .cc').innerText();
  check(/^[A-Z0-9]{6}$/.test(cc), `şube açıldı, sınıf kodu üretildi (${cc})`);
  // Aynı adla ikinci şube reddedilmeli
  await page.click('[data-act="newSec"]');
  await page.fill('#fs input[name="name"]', '7/A');
  await page.click('#fs button.pri');
  await page.waitForSelector('#fsMsg .msg');
  check((await text(page, '#fsMsg')).includes('zaten var'), 'aynı adlı şube anlaşılır hatayla reddedildi');
  await page.click('#dlg [data-close]');

  // Öğrenci ekle
  await page.click('[data-open]');
  await page.waitForSelector('[data-act="import"]');
  await page.click('[data-act="import"] >> nth=0');
  await page.fill('#rt', 'No\tAd\tSoyad\n12\tElif\tYıldız\n13\tCan\tDemir\nAyşe Nur Kaya');
  check((await text(page, '#rc')).includes('3 öğrenci'), 'yapıştırılan liste ayrıştırıldı (başlık satırı atlandı)');
  await page.click('#rgo');
  await page.waitForSelector('.pin-card');
  const pins = await page.locator('.pin-card .pin').allInnerTexts();
  check(pins.length === 3 && pins.every((x) => /^\d{4}$/.test(x)), 'üç öğrenci için PIN kartı gösterildi');
  await page.click('#dlg [data-close]');
  check((await page.locator('table.t tbody tr').count()) === 3, 'öğrenci tablosunda 3 satır var');
  const elifPin = mock.db.secrets[mock.db.students.find((s) => s.first_name === 'Elif').id];

  // Veli davet kodu
  await page.click('[data-pinv] >> nth=0');
  await page.waitForSelector('.inv');
  const parentCode = await page.locator('.inv').first().innerText();
  check(/^[A-Z0-9]{8}$/.test(parentCode), `veli davet kodu üretildi (${parentCode})`);

  // Okul sekmesi: öğretmen daveti
  await page.click('[data-tab="okul"]');
  await page.click('[data-act="tinv"]');
  await page.waitForSelector('.cc');
  check(/^[A-Z0-9]{8}$/.test(await page.locator('.cc').first().innerText()), 'öğretmen davet kodu üretildi');

  // ---------------------------------------------------------------- 2. Panelde gerçek yapay zekâ köprüsü
  await page.goto(BASE + '/ogretmen#activities/yeni');
  await page.waitForSelector('.navi-oturum');
  check((await text(page, '.navi-oturum')).includes('Selin Yılmaz'), 'öğretmen panelinde oturum rozeti görünüyor');
  await page.click('[data-act="naMode"][data-v="ai"]');
  await page.waitForSelector('.ai-mode');
  check((await text(page, '.ai-mode')).includes('Gerçek yapay zekâ açık'), 'giriş yapan öğretmende gerçek yapay zekâ modu açık');
  await page.click('[data-act="aiGen"]');
  await page.waitForSelector('.ai-res', { timeout: 8000 });
  check((await text(page, '.ai-res')).includes('Okul Bahçesinde Kesir Avı'), 'yapay zekâ taslağı panelde gösterildi');
  check(mock.calls.some((c) => c.endsWith('/functions/v1/yz-etkinlik')), 'panel yz-etkinlik sunucu fonksiyonunu çağırdı');
  const req = mock.db.gens.at(-1).request;
  check(req.course && req.grade && req.outcome && !JSON.stringify(req).includes('Elif'), 'istekte ders/sınıf/kazanım var, öğrenci adı yok');
  check(!!(await page.$('.ai-res figure.vis')), 'taslağın görseli çizildi');

  // ---------------------------------------------------------------- 3. Öğrenci girişi (sınıf kodu + isim + PIN)
  const s = await newCtx({ width: 390, height: 844 });
  const sp = await s.newPage();
  await sp.goto(BASE + '/giris#ogrenci');
  await sp.fill('#cc', cc.toLowerCase());
  await sp.click('#f button.pri');
  await sp.waitForSelector('.names button');
  check((await sp.locator('.names button').count()) === 3, 'sınıf kodundan sonra 3 isim listelendi');
  check(!(await text(sp, '.names')).includes('Yıldız'), 'isim listesinde soyadın yalnızca ilk harfi var');
  await sp.click('.names button:has-text("Elif")');
  for (const d of '0000') await sp.click(`.pad button[data-d="${d}"]`);
  await sp.waitForSelector('.msg.err');
  check((await text(sp, '.msg.err')).includes('Şifre yanlış'), 'yanlış PIN anlaşılır mesajla reddedildi');
  check((await sp.locator('.pin-dots i.on').count()) === 0, 'yanlış PIN sonrası giriş alanı temizlendi');
  for (const d of elifPin) await sp.click(`.pad button[data-d="${d}"]`);
  await sp.waitForURL('**/ogrenci', { timeout: 8000 });
  await sp.waitForSelector('.navi-oturum');
  const chipTxt = await text(sp, '.navi-oturum'); check(chipTxt.includes('Elif Yıldız'), 'doğru PIN ile öğrenci paneline girildi, ad görünüyor' + (chipTxt.includes('Elif') ? '' : ' [' + chipTxt + ']'));
  check((await sp.evaluate(() => document.documentElement.scrollWidth)) <= 392, 'öğrenci girişi telefonda taşmıyor');

  // ---------------------------------------------------------------- 4. Veli kaydı (davet kodu + açık rıza)
  const v = await newCtx();
  const vp = await v.newPage();
  await vp.goto(BASE + '/giris#veli');
  await vp.click('button[data-mode="signup"]');
  await vp.fill('#ic', parentCode);
  await vp.fill('#fn', 'Ahmet Yıldız');
  await vp.fill('#em', 'ahmet@veli.test');
  await vp.fill('#pw', 'VeliSifre12');
  await vp.click('#f button.pri');
  check(await vp.evaluate(() => !document.querySelector('input[name=consent]').checkValidity()), 'açık rıza işaretlenmeden form gönderilemiyor');
  await vp.check('input[name=consent]');
  await vp.click('#f button.pri');
  await vp.waitForURL('**/veli', { timeout: 8000 });
  check(mock.db.guardians.length === 1, 'veli hesabı açıldı ve çocuğa bağlandı');
  const used = mock.db.invites.find((i) => i.code === parentCode);
  check(!!used.used_at, 'davet kodu tek kullanımlık olarak işaretlendi');

  // ---------------------------------------------------------------- 5. Yetki: veli yönetime giremez, girişsiz panel demo modunda
  await vp.goto(BASE + '/yonetim');
  await vp.waitForURL('**/veli', { timeout: 8000 });
  check(true, 'veli yönetim konsoluna girmeye çalışınca kendi paneline yönlendirildi');
  const anon = await newCtx();
  const ap = await anon.newPage();
  await ap.goto(BASE + '/ogretmen#activities/yeni');
  await ap.waitForSelector('.navi-oturum');
  await ap.click('[data-act="naMode"][data-v="ai"]');
  check((await text(ap, '.ai-mode')).includes('Demo modu'), 'girişsiz kullanıcıda yapay zekâ demo modunda ve bu açıkça yazıyor');
  await ap.goto(BASE + '/yonetim');
  await ap.waitForURL('**/giris#ogretmen', { timeout: 8000 });
  check(true, 'girişsiz kullanıcı yönetimden giriş sayfasına yönlendirildi');

  // ---------------------------------------------------------------- 6. Çıkış
  await page.goto(BASE + '/yonetim');
  await page.click('#out');
  await page.waitForURL('**/giris', { timeout: 8000 });
  check(!(await page.evaluate(() => localStorage.getItem('navigaitor-auth'))), 'çıkışta oturum silindi');

  check(errors.length === 0, `tarayıcı hatası yok${errors.length ? '\n  ' + errors.slice(0, 5).join('\n  ') : ''}`);
} catch (e) {
  fails.push(String(e)); console.log('✗ test kesildi: ' + e.message.split('\n')[0]);
} finally {
  await browser.close(); server.close();
}
console.log(fails.length ? `\n${fails.length} kontrol başarısız.` : '\nTüm hesap akışı kontrolleri geçti.');
process.exit(fails.length ? 1 : 0);
