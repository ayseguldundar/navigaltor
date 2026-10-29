// NavigAItor derleme betiği: src/ parçalarından dist/ altına üç paneli üretir.
// Bağımlılık yok; Node 18+ ile çalışır:  node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'dist');
const read = (p) => readFileSync(join(SRC, p), 'utf8');

// Öğretmen ve öğrenci aynı uygulama paketini paylaşır (rol, adres önekine göre seçilir).
const CORE = [
  '21-resmi.js', '03-data.js', '04-core.js', '05-shell.js', '06-home.js', '07-classes-students.js',
  '08-activities-assess.js', '09-analytics.js', '11-extra.js', '10-rest.js', '12-navi-assets.js',
  '13-stu-core.js', '14-stu-shell.js', '15-stu-pages.js', '16-stu-pages2.js', '17-stu-player.js',
  '18-parent.js', '19-sims.js',
];
const APP_JS = [...CORE, '22-resmi-act.js', '24-vis.js', '25-b21.js', '25-lib-data.js', '25-lib.js',
  '26-onboard.js', '27-report.js', '28-hooks.js', '29-ai-real.js', '99-init.js'];
const VELI_JS = [...CORE, '20-veli.js', '22-resmi-act.js', '26-onboard.js', '99-init-veli.js'];

const PANELS = [
  { slug: 'ogretmen', title: 'NavigAItor Öğretmen Paneli', short: 'Öğretmen', css: ['head.html', 'stu-theme.html', 'lib.html'],
    js: APP_JS, home: 'home' },
  { slug: 'ogrenci', title: 'NavigAItor Öğrenci Paneli', short: 'Öğrenci', css: ['head.html', 'stu-theme.html', 'lib.html'],
    js: APP_JS, home: 'o-home' },
  { slug: 'veli', title: 'NavigAItor Veli Paneli', short: 'Veli', css: ['head.html', 'stu-theme.html', 'veli-theme.html', 'lib.html'],
    js: VELI_JS, lsKey: 'navigaitor-veli-v2' },
];

function bundle(files, panel) {
  let js = files.map((f) => `/* ---- ${f} ---- */\n` + read('js/' + f)).join('\n');
  if (panel.home) {
    js = js.replace(
      'if(!location.hash){try{history.replaceState(null,"","#o-home")}catch(e){location.hash="o-home"}}',
      `if(!location.hash){try{history.replaceState(null,"","#${panel.home}")}catch(e){location.hash="${panel.home}"}}`);
  }
  if (panel.lsKey) js = js.replace("const LS_KEY='navigaitor-demo-v5'", `const LS_KEY='${panel.lsKey}'`);
  new vm.Script(js, { filename: `${panel.slug}.js` }); // sözdizimi denetimi: hata varsa derleme durur
  return js;
}

const pwaHead = (panel) => `<meta name="theme-color" content="#810000">
<meta name="description" content="NavigAItor — 5–8. sınıflar için yapay zekâ destekli uyarlanabilir öğrenme platformu">
<link rel="manifest" href="/manifest-${panel.slug}.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="NavigAItor ${panel.short}">`;

const swRegister = `<script src="/config.js"></script>
<script type="module" src="/app/oturum.js"></script>
<script>if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}</script>`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'demo'), { recursive: true });
cpSync(join(ROOT, 'public'), OUT, { recursive: true });

const hash = createHash('sha1');
for (const panel of PANELS) {
  const head = panel.css.map((f) => read('html/' + f)).join('\n').replace(/<title>[^<]*<\/title>/, `<title>${panel.title}</title>`);
  const js = bundle(panel.js, panel);
  const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
${pwaHead(panel)}
${head}
</head>
<body>
${read('html/body.html')}
<script>
${js}
</script>
${swRegister}
</body>
</html>
`;
  writeFileSync(join(OUT, 'demo', `${panel.slug}.html`), html);
  hash.update(html);
  writeFileSync(join(OUT, `manifest-${panel.slug}.webmanifest`), JSON.stringify({
    name: panel.title, short_name: `NavigAItor ${panel.short}`, lang: 'tr', dir: 'ltr',
    start_url: { ogretmen: '/yonetim', ogrenci: '/ogrenci', veli: '/veli' }[panel.slug], scope: '/', display: 'standalone', orientation: 'any',
    background_color: '#F7EFE2', theme_color: '#810000',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }, null, 2));
  console.log(`✓ demo/${panel.slug}.html  ${(html.length / 1048576).toFixed(2)} MB`);
}

// Panel dışı sayfalar için etkinlik görüntüleyici paketleri (yönetim, öğrenci, veli).
{
  const core = read('js/04-core.js');
  const icBlock = core.match(/const IC=\{[\s\S]*?\n\};/);
  const icFn = core.match(/const ic=.*\n/);
  if (!icBlock || !icFn) throw new Error('04-core.js içinde simge tanımları bulunamadı');
  const ob = read('js/26-onboard.js').split('\n');
  const obData = ob.slice(1, 26).join('\n'); // OB_Q, OB_INTRO, OB_END, isOther (26-onboard.js 2–26. satırlar)
  const emoji = ob.slice(64, 72).join('\n'); // stuEmoji()
  if (!/^const OB_Q=/.test(obData) || !/^function stuEmoji/.test(emoji)) throw new Error('26-onboard.js yapısı değişmiş; kit-gorsel satır aralıklarını güncelleyin');
  const kit = [read('kit/kit-pre.js'), icBlock[0], icFn[0], read('js/24-vis.js'), obData, emoji, read('kit/kit-post.js')].join('\n');
  new vm.Script(kit, { filename: 'kit-gorsel.js' });
  mkdirSync(join(OUT, 'app'), { recursive: true });
  writeFileSync(join(OUT, 'app', 'kit-gorsel.js'), kit);
  const resmi = read('js/21-resmi.js').split('\n').filter((l) => /^const (RESMI|RESMI_META|UNIT_WORD)=/.test(l)).join('\n');
  const lib = [resmi, read('js/25-b21.js'), read('js/25-lib-data.js'), 'window.RESMI=RESMI;window.UNIT_WORD=UNIT_WORD;window.ACTLIB=ACTLIB;'].join('\n');
  new vm.Script(lib, { filename: 'kit-kutuphane.js' });
  writeFileSync(join(OUT, 'app', 'kit-kutuphane.js'), lib);
  const navi = read('js/12-navi-assets.js');
  const poses = {};
  for (const m of navi.matchAll(/"(happy|excited|thinking|thumbs|point|wink)": "(data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+)"/g)) poses[m[1]] = m[2];
  if (Object.keys(poses).length < 6) throw new Error('Navi görselleri bulunamadı');
  writeFileSync(join(OUT, 'app', 'navi.js'), `window.NAVI=${JSON.stringify(poses)};`);
  const css = read('html/lib.html').replace(/<\/?style>/g, '') + '\n' + read('kit/kit.css');
  writeFileSync(join(OUT, 'app', 'etkinlik.css'), css);
  hash.update(kit); hash.update(lib); hash.update(css);
  console.log(`✓ app/kit-gorsel.js ${(kit.length / 1024).toFixed(0)} KB · app/kit-kutuphane.js ${(lib.length / 1024).toFixed(0)} KB`);
}

// Hizmet çalışanı: önbellek sürümü içerikten türetilir, her yeni derlemede eski önbellek temizlenir.
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
for (const f of walk(join(ROOT, 'public')).sort()) hash.update(readFileSync(f));
const version = hash.digest('hex').slice(0, 10);
const sw = readFileSync(join(ROOT, 'public', 'sw.js'), 'utf8').replace('__BUILD_VERSION__', version);
writeFileSync(join(OUT, 'sw.js'), sw);
console.log(`✓ sw.js  sürüm ${version}`);
console.log(`✓ dist/: ${readdirSync(OUT).join(', ')}`);
