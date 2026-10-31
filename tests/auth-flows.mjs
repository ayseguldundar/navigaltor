// Uçtan uca akış testi: giriş merkezi, yönetim konsolu, etkinlik atama ve takip, Claude ile üretim, öğrenci uygulaması (tanışma formu, etkinlik tamamlama),
// veli uygulaması, yönetici işlemleri (şifre sıfırlama, KVKK silme), demo panellerinin yapay zekâ köprüsü.
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
browser.newContext = ((orig) => async (...a) => { const c = await orig.apply(browser, a); c.setDefaultTimeout(10000); return c; })(browser.newContext);
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

  // ---------------------------------------------------------------- 1b. Etkinlik ata (kütüphaneden) ve Claude ile üret
  await page.click('[data-tab="etkinlik"]');
  await page.waitForSelector('[data-esub="kutuphane"]');
  check((await text(page, '#app')).includes('henüz etkinlik atanmadı'), 'etkinlikler: boş atama durumu');
  await page.click('[data-esub="kutuphane"] >> nth=0');
  await page.waitForSelector('[data-eopen^="lib:"]', { timeout: 8000 });
  check((await page.locator('[data-eopen^="lib:"]').count()) > 0, 'kütüphane 7. sınıf matematik etkinliklerini listeledi');
  await page.click('[data-eopen^="lib:"] >> nth=0');
  await page.waitForSelector('[data-eassign]');
  const libTitle = (await page.locator('#app .ek-title, #app h1').last().innerText()).trim();
  await page.click('[data-eassign]');
  await page.waitForSelector('#fa');
  await page.click('#fa button.pri');
  await page.waitForSelector('[data-eopen^="atama:"]');
  check(mock.db.assignments.length === 1 && mock.db.assignments[0].source === 'kutuphane', 'kütüphane etkinliği şubeye atandı');
  check((await text(page, '[data-eopen^="atama:"]')).includes('0/3'), 'atama kartında ilerleme 0/3 görünüyor');
  check(!/\b(MAT|FEN|TUR|SOS|ING)\.\d+\.\d+/.test(await text(page, '#app')), 'etkinlik ekranında kazanım kodu yok');

  await page.click('[data-esub="uret"] >> nth=0');
  await page.waitForSelector('[data-aigo]', { timeout: 8000 });
  check((await page.locator('select[data-ai="k"] option').count()) > 0, 'Claude formu resmî programdan kazanımları listeledi');
  await page.click('[data-aiseg="lvl:destek"]');
  await page.click('[data-aigo]');
  await page.waitForSelector('[data-aisave]', { timeout: 8000 });
  check((await text(page, '#app')).includes('Okul Bahçesinde Kesir Avı'), 'yönetimde Claude taslağı gösterildi');
  const genReq = mock.db.gens.at(-1).request;
  check(genReq.level === 'destek' && genReq.course === 'MAT' && genReq.grade === 7 && genReq.outcome && !JSON.stringify(genReq).match(/Elif|Yıldız|Demir/), 'üretim isteği düzey/ders/kazanım içeriyor, öğrenci adı içermiyor');
  check(!!(await page.$('#app figure.vis')), 'taslağın etkileşimli görseli çizildi');
  await page.click('[data-aisave]');
  await page.waitForSelector('.msg.ok');
  await page.click('[data-esub="taslak"]');
  await page.waitForSelector('[data-eopen^="taslak:"]');
  check(mock.db.drafts.length === 1, 'Claude taslağı “Taslaklarım”a kaydedildi');
  await page.click('[data-esub="atamalar"]');

  // ---------------------------------------------------------------- 2. Panelde gerçek yapay zekâ köprüsü
  await page.goto(BASE + '/demo/ogretmen#activities/yeni');
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
  check(true, 'doğru PIN ile öğrenci uygulamasına girildi');
  // Navi tanışma formu ilk girişte açılır
  await sp.waitForSelector('#obLayer .ob-card');
  await sp.click('#obLayer [data-ob="next"]');
  await sp.waitForSelector('#obLayer .ob-n');
  check((await text(sp, '#obLayer .ob-n')).startsWith('1 /'), 'tanışma formu soruları başladı');
  if (await sp.$('#obTxt')) await sp.fill('#obTxt', 'Eli');
  await sp.click('#obLayer [data-ob="next"]');
  await sp.waitForSelector('#obLayer .ob-n:has-text("2 /")');
  check(mock.db.intake.length === 1, 'tanışma formu her adımda kaydediliyor');
  await sp.click('#obLayer [data-ob="later"]');
  await sp.waitForSelector('#obLayer .ob-card', { state: 'detached' });
  check((await text(sp, '.hi')).includes('1 etkinlik'), 'öğrenci ana sayfası atanan 1 etkinliği gösteriyor');
  check((await text(sp, '#me')).includes(mock.db.intake[0].answers[0] ? 'Eli' : 'Elif'), 'öğrenci adı/takma adı üst çubukta');
  check((await sp.evaluate(() => document.documentElement.scrollWidth)) <= 392, 'öğrenci ana sayfası telefonda taşmıyor');
  // Etkinliği yap
  await sp.click('a.task');
  await sp.waitForSelector('[data-done]');
  check(await sp.locator('[data-done]').isDisabled(), 'kontrol listesi bitmeden “tamamladım” kapalı');
  check(!(await text(sp, '#app')).includes('Puanlama') , 'öğrenci etkinlik sayfasında puanlama rubriği yok');
  const chks = sp.locator('[data-ek-chk]');
  const nChk = await chks.count();
  await chks.first().check();
  await sp.waitForSelector('#saveMsg:has-text("Kaydedildi")');
  check(mock.db.submissions[0]?.status === 'devam' && mock.db.submissions[0].checklist.length === 1, 'ilk işaretlemede teslim “devam ediyor” olarak kaydedildi');
  for (let i = 1; i < nChk; i++) await chks.nth(i).check();
  await sp.fill('#refl', 'Önce birimleri eşitlemem gerektiğini öğrendim.');
  await sp.locator('[data-done]:enabled').waitFor();
  await sp.click('[data-done]');
  await sp.waitForSelector('.celebrate');
  check(mock.db.submissions[0].status === 'tamamlandi' && !!mock.db.submissions[0].completed_at, 'etkinlik tamamlandı olarak kaydedildi');
  check((await sp.evaluate(() => document.documentElement.scrollWidth)) <= 392, 'öğrenci etkinlik sayfası telefonda taşmıyor');

  // Öğretmen ilerlemeyi görür ve geri bildirim yazar
  await page.goto(BASE + '/yonetim#etkinlik');
  await page.waitForSelector('[data-eopen^="atama:"]');
  check((await text(page, '[data-eopen^="atama:"]')).includes('1/3'), 'öğretmen atama kartında 1/3 tamamladı görüyor');
  await page.click('[data-eopen^="atama:"]');
  await page.waitForSelector('[data-fb]');
  check((await text(page, '#app')).includes('birimleri eşitlemem'), 'öğretmen öğrencinin notunu görüyor');
  const elifId = mock.db.students.find((x) => x.first_name === 'Elif').id;
  await page.fill(`[data-fb="${elifId}"]`, 'Çok güzel gerekçelendirdin!');
  await page.click(`[data-fbsave$=":${elifId}"]`);
  await page.waitForSelector('.msg.ok');
  check(mock.db.submissions[0].teacher_feedback === 'Çok güzel gerekçelendirdin!', 'öğretmen geri bildirimi kaydedildi');
  await sp.reload(); await sp.waitForSelector('.fb');
  check((await text(sp, '.fb')).includes('Çok güzel'), 'öğrenci öğretmenin notunu etkinlik sayfasında görüyor');

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
  await vp.waitForSelector('.kpis');
  const vt = await text(vp, '#app');
  check(vt.includes('Elif') && vt.includes('Tamamladı'), 'veli çocuğunun tamamladığı etkinliği görüyor');
  check(vt.includes('Çok güzel gerekçelendirdin'), 'veli öğretmen notunu görüyor');
  check(!/sıra(n|lama)da|sınıf ortalaması/i.test(vt.replace('karşılaştırmaz ve sıralamaz', '')), 'veli ekranında sıralama/karşılaştırma yok');
  await vp.click('[data-open]');
  await vp.waitForSelector('#dlg[open] .home-tip');
  check((await text(vp, '#dlg')).includes('Önce birimleri'), 'veli etkinlik penceresinde çocuğun notunu görüyor');
  await vp.click('#dlg [data-close]');
  // İkinci çocuğu davet koduyla ekle
  const canId = mock.db.students.find((x) => x.first_name === 'Can').id;
  await page.goto(BASE + '/yonetim#ogrenciler');
  await page.click(`[data-pinv="${canId}"]`);
  await page.waitForSelector('.inv');
  const canCode = mock.db.invites.find((i) => i.student_id === canId).code;
  await vp.click('[data-add] >> nth=0');
  await vp.fill('#ic', canCode.toLowerCase());
  await vp.check('#cs');
  await vp.click('#fk button.pri');
  await vp.waitForSelector('[data-kid]');
  check((await vp.locator('[data-kid]').count()) === 2 && mock.db.guardians.length === 2, 'veli ikinci çocuğunu davet koduyla ekledi');

  // ---------------------------------------------------------------- 4b. Yönetici işlemleri: şifre sıfırlama, KVKK silme, şifre değiştirme
  await page.goto(BASE + '/yonetim#okul');
  await page.waitForSelector('[data-pwd]');
  check((await text(page, '#app')).includes('Ahmet Yıldız'), 'okul sekmesinde veli hesapları listeleniyor');
  await page.click('[data-pwd] >> nth=0');
  await page.click('#pwGo');
  await page.waitForSelector('#dlg .cc');
  const temp = await page.locator('#dlg .cc').innerText();
  check(temp === 'abcd-EFGH-2345' && mock.db.users.find((u) => u.email === 'ahmet@veli.test').password === temp, 'yönetici veliye geçici şifre üretti ve bir kez gösterdi');
  await page.click('#dlg [data-close]');
  await page.click('#pwd');
  await page.fill('#np1', 'YeniSifre123'); await page.fill('#np2', 'YeniSifre123');
  await page.click('#cpw button.pri');
  await page.waitForSelector('#dlg h2:has-text("değiştirildi")');
  check(mock.db.users.find((u) => u.email === 'selin@okul.test').password === 'YeniSifre123', 'öğretmen kendi şifresini değiştirdi');
  await page.click('#dlg [data-close]');
  await page.goto(BASE + '/yonetim#ogrenciler');
  await page.click(`[data-sdel="${canId}"]`);
  check(await page.locator('#delGo').isDisabled(), 'silme, öğrencinin adı yazılmadan yapılamıyor');
  await page.fill('#cfm', 'can');
  await page.click('#delGo');
  await page.waitForSelector('.msg.ok');
  check(!mock.db.students.some((x) => x.id === canId) && mock.db.guardians.length === 1, 'öğrencinin verisi ve veli bağlantısı silindi');
  check(mock.db.users.some((u) => u.email === 'ahmet@veli.test'), 'başka çocuğu olan velinin hesabı korundu');
  check((await page.locator('table.t tbody tr').count()) === 2, 'öğrenci tablosunda 2 satır kaldı');
  // Tüm PIN'leri yenile (kartlar kaybolduğunda)
  page.once('dialog', (d) => d.accept());
  await page.click('[data-act="resetAll"]');
  await page.waitForSelector('#dlg .pin-card');
  const newPins = await page.locator('#dlg .pin-card .pin').allInnerTexts();
  check(newPins.length === 2 && newPins.every((x) => /^\d{4}$/.test(x)), 'şubenin tüm PIN\'leri yenilendi ve kartlar gösterildi');
  await page.click('#dlg [data-close]');
  // Öğrenciyi başka şubeye taşı
  await page.goto(BASE + '/yonetim#subeler');
  await page.click('[data-act="newSec"] >> nth=0');
  await page.fill('#fs input[name="name"]', '7/B');
  await page.click('#fs button.pri');
  await page.waitForSelector('.sec-card >> nth=1');
  const secA = mock.db.sections.find((x) => x.name === '7/A').id, secB = mock.db.sections.find((x) => x.name === '7/B').id;
  await page.goto(BASE + '/yonetim#subeler');
  await page.click(`[data-open="${secA}"]`);
  await page.waitForSelector(`[data-stu]`);
  const ayse = mock.db.students.find((x) => x.first_name.startsWith('Ayşe'));
  await page.click(`[data-stu="${ayse.id}"]`);
  await page.waitForSelector('#mvSec');
  page.once('dialog', (d) => d.accept());
  await page.click('[data-mv]');
  await page.waitForSelector('.msg.ok');
  check(mock.db.students.find((x) => x.id === ayse.id).section_id === secB, 'öğrenci başka şubeye taşındı');
  // İkinci yönetici
  const t2 = mock.addUser('ikinci@okul.test', 'x'); mock.db.profiles.push({ id: t2.id, school_id: mock.db.profiles.find((p) => p.full_name === 'Selin Yılmaz').school_id, role: 'teacher', full_name: 'Murat Kaya' });
  await page.goto(BASE + '/yonetim#okul');
  await page.waitForSelector(`[data-role="${t2.id}:admin"]`);
  page.once('dialog', (d) => d.accept());
  await page.click(`[data-role="${t2.id}:admin"]`);
  await page.waitForSelector(`[data-role="${t2.id}:teacher"]`);
  check(mock.db.profiles.find((p) => p.id === t2.id).role === 'admin', 'okula ikinci yönetici atandı');

  // ---------------------------------------------------------------- 5. Yetki: veli yönetime giremez, girişsiz panel demo modunda
  await vp.goto(BASE + '/yonetim');
  await vp.waitForURL('**/veli', { timeout: 8000 });
  check(true, 'veli yönetim konsoluna girmeye çalışınca kendi paneline yönlendirildi');
  const anon = await newCtx();
  const ap = await anon.newPage();
  await ap.goto(BASE + '/demo/ogretmen#activities/yeni');
  await ap.waitForSelector('.navi-oturum');
  await ap.click('[data-act="naMode"][data-v="ai"]');
  check((await text(ap, '.ai-mode')).includes('Demo modu'), 'girişsiz kullanıcıda yapay zekâ demo modunda ve bu açıkça yazıyor');
  await ap.goto(BASE + '/yonetim');
  await ap.waitForURL('**/giris#ogretmen', { timeout: 8000 });
  check(true, 'girişsiz kullanıcı yönetimden giriş sayfasına yönlendirildi');

  // ---------------------------------------------------------------- 6. Çıkış
  await page.goto(BASE + '/yonetim');
  await page.waitForSelector('#out');
  await page.click('#out');
  await page.waitForURL('**/giris', { timeout: 8000 });
  check(!(await page.evaluate(() => localStorage.getItem('navigaitor-auth'))), 'çıkışta oturum silindi');

  await vp.goto(BASE + '/ogrenci'); await vp.waitForURL('**/veli', { timeout: 8000 });
  check(true, 'veli öğrenci uygulamasına girmeye çalışınca kendi ekranına yönlendirildi');
  await sp.goto(BASE + '/yonetim'); await sp.waitForURL('**/ogrenci', { timeout: 8000 });
  check(true, 'öğrenci yönetim konsoluna girmeye çalışınca kendi ekranına yönlendirildi');

  check(errors.length === 0, `tarayıcı hatası yok${errors.length ? '\n  ' + errors.slice(0, 5).join('\n  ') : ''}`);
} catch (e) {
  fails.push(String(e)); console.log('✗ test kesildi: ' + e.message.split('\n')[0] + ' @' + (e.stack.match(/auth-flows.mjs:(\d+)/) || [])[1]);
} finally {
  await browser.close(); server.close();
}
console.log(fails.length ? `\n${fails.length} kontrol başarısız.` : '\nTüm hesap akışı kontrolleri geçti.');
process.exit(fails.length ? 1 : 0);
