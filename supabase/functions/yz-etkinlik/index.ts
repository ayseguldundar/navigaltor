// Yapay zekâ ile etkinlik taslağı üretimi (Claude).
// - Yalnızca öğretmen ve okul yöneticisi çağırabilir; günlük kota uygulanır.
// - Modele öğrenci adı veya kimliği gönderilmez.
// - Ders kitapları soru havuzu olarak kullanılmaz: her taslak özgün üretilir; kütüphane etkinliği yalnızca yapı örneğidir.
// - Taslak öğretmen onayı olmadan öğrenciye gitmez (onay ve atama istemci tarafında).
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

const MODEL = Deno.env.get('ANTHROPIC_MODEL') || 'claude-sonnet-5-5';
const readLimit = (name: string, fallback: number) => {
  const raw = Deno.env.get(name);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
};
const DAILY_LIMIT = readLimit('AI_DAILY_LIMIT', 40);
// Tüm okullar için günlük toplam üst sınır (maliyet güvencesi).
const GLOBAL_DAILY_LIMIT = readLimit('AI_GLOBAL_DAILY_LIMIT', 300);

const pick = (j: string | undefined, legacy: string | undefined) => {
  try { const o = JSON.parse(j ?? ''); if (o?.default) return o.default as string; } catch { /* eski anahtar */ }
  return legacy ?? '';
};
const admin = createClient(Deno.env.get('SUPABASE_URL')!,
  pick(Deno.env.get('SUPABASE_SECRET_KEYS'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')),
  { auth: { persistSession: false, autoRefreshToken: false } });
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' } });
const fail = (error: string, status = 400) => json({ error }, status);

const COURSES: Record<string, string> = {
  MAT: 'Matematik', TUR: 'Türkçe', FEN: 'Fen Bilimleri', SOS: 'Sosyal Bilgiler', ING: 'İngilizce',
};
const LEVELS: Record<string, string> = {
  destek: 'Desteğe ihtiyaç duyan öğrenciler: kısa adımlar, her adımda bir çözümlü örnek ve ipucu, küçük ve yuvarlak sayılar, sade dil.',
  orta: 'Sınıf düzeyindeki öğrenciler: gerçek yaşam bağlamı, adımlar bağımsız yürütülür.',
  ileri: 'İleri düzeydeki öğrenciler: "ya şöyle olsaydı?" uzatması, kendi problemini kurma ve gerekçelendirme adımı.',
};

// Arayüzdeki etkileşimli görsel türleri ve beklenen parametre biçimleri.
const VISUALS = `
flow {kind:"algoritma"|"neden-sonuc"|"dongu", steps:[metin,...]}               — akış / zincir
organizer {kind:"hikaye"|"karsilastirma"|"kavram", slots:[başlık,...]}         — grafik düzenleyici
sort {bins:[kategori,...], items:[{t:metin, b:kategori sırası 0..}]}            — sınıflandırma
cards {items:[{w:kavram/sözcük, tr:anlamı, ic:emoji}]}                          — çevrilebilir kartlar
chat {lines:[{who:ad, t:replik}]}                                               — diyalog
news {headline, lead, tags:[metin]}                                             — haber kartı
timeline {events:[{y:yıl/sıra, t:olay}]}                                         — zaman çizelgesi (öğrenci sıralar)
routine {items:[{time:"07:30", t:etkinlik}]}                                     — günlük plan
bars {title, labels:[...], values:[sayı...], unit, editable:false}              — sütun grafik
pie {labels:[...], values:[yüzde...]}                                            — daire grafik
budget {items:[{label, value:"1/4"}], total:"1"}                                 — bütçe kavanozları
pizza {pizzas:1|2, target:["3/4","5/8"], maxCut:sayı}                            — kesirler (pizza dilimleme)
balance {left:"8 + 5", right:"6 + □", solution:sayı}                            — eşit kollu terazi
numberline {min, max, step, target, label}                                       — sayı doğrusu
areagrid {rows, cols, shade:0, label}                                            — alan modeli
cubes {l, w, h}                                                                  — birim küpler (hacim)
coord {points:[[x,y],...], line:{m, b}}                                          — koordinat sistemi
dice {kind:"zar"|"cark", items:[...], counts:[...]}                              — olasılık deneyi
zoom {preset:"kan"|"bitki"}                                                      — yakınlaşan sahne (vücut→kol→damar→kan hücreleri / bitki→yaprak→hücre)
solar {mode:"ay-evreleri"|"mevsimler"}  circuit {bulbs, series:true|false, material:false}
heat {materials:[...]}  light {mode:"yansima"|"kirilma"}  force {obj, forces:[{dir:"sag"|"sol", n}]}
atom {element:"C"}  lever {kind:"kaldirac"|"makara"}  shapes {kind:"daire"|"ucgen"|"dortgen", labels:true}`;

const SYSTEM = `Sen NavigAItor'un etkinlik tasarımcısısın. Türkiye'de 5–8. sınıflar için, Türkiye Yüzyılı Maarif Modeli öğretim programlarına uygun, öğrencinin düzeyine göre ÖZGÜN etkinlikler tasarlarsın.

Kesin kurallar:
1. Ders kitaplarından, etkinlik kitaplarından veya bilinen soru bankalarından soru, metin ya da etkinlik kopyalama. Her senaryo, sayı, metin ve soru bu istek için yeni üretilmeli.
2. Kazanım KODU yazma (ör. "MAT.7.1.2" gibi ifadeler hiçbir alanda geçmesin). Kazanımları adıyla/cümlesiyle yaz.
3. Verilen kazanımın dışına çıkma; sınıf düzeyine ve yaşa uygun, sade ve sıcak bir Türkçe kullan (İngilizce dersinde hedef dil içerikleri İngilizce, yönergeler Türkçe olabilir).
4. Gerçek kişi, marka veya kurum adı kullanma; kurgu karakterler ve gündelik okul/mahalle bağlamları kullan.
5. Etkinlik "Oku, Anla, Düşün" senaryosuyla başlar; adımlar bireysel/grup çalışma biçimini ve süresini belirtir; en az bir adımda "Sık yapılan hata" uyarısı olur.
6. Etkinliğin hitap ettiği 21. yüzyıl becerilerini ve dijital becerileri açıkça listele; öğretmenin verdiği beceri listesi varsa ondan seç.
7. Görsel, etkinliğin özüne hizmet eden basit ve net bir etkileşimli görsel olmalı ve yalnızca aşağıdaki türlerden biri seçilmeli:
${VISUALS}
8. Puanlama rubriği tam 4 ölçüt içerir; her ölçütte 4 (Mükemmel) → 1 (Başlangıç) düzeyleri kısa ve gözlemlenebilir yazılır.
9. Navi'nin soruları cevabı söylemez; öğrencinin düşünmesini sağlayan sorulardır.

Sonucu MUTLAKA "etkinlik_kaydet" aracını bir kez çağırarak döndür; ayrıca düz metin yazma.`;

const VIS_TYPES = ['flow', 'organizer', 'sort', 'cards', 'chat', 'news', 'timeline', 'routine', 'bars', 'pie', 'budget',
  'pizza', 'balance', 'numberline', 'areagrid', 'cubes', 'coord', 'dice', 'zoom', 'solar', 'circuit', 'heat', 'light', 'force',
  'atom', 'lever', 'shapes'];

const TOOL = {
  name: 'etkinlik_kaydet',
  description: 'Tasarlanan etkinliği NavigAItor etkinlik biçiminde kaydeder.',
  input_schema: {
    type: 'object',
    required: ['title', 'subtitle', 'scenario', 'kazanim', 'skills21', 'digital', 'tools', 'visual_type', 'visual_params',
      'visual_caption', 'steps', 'checklist', 'navi', 'rubric', 'diff_destek', 'diff_ileri', 'misconception'],
    properties: {
      title: { type: 'string', description: 'Merak uyandıran kısa başlık' },
      subtitle: { type: 'string', description: 'Konu ve yöntem, tek satır' },
      scenario: { type: 'string', description: 'Oku, Anla, Düşün senaryosu (4–7 cümle), bir soruyla biter' },
      kazanim: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
      skills21: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
      digital: { type: 'array', items: { type: 'string' }, maxItems: 3 },
      tools: { type: 'array', items: { type: 'string' }, maxItems: 4 },
      visual_type: { type: 'string', enum: VIS_TYPES, description: 'Görsel türü (listeden)' },
      visual_params: { type: 'object', description: 'Seçilen görsel türünün parametreleri (sistem isteminde verilen biçimde)' },
      visual_caption: { type: 'string', description: 'Öğrencinin görselle ne yapacağı, tek cümle' },
      steps: {
        type: 'array', minItems: 3, maxItems: 6,
        items: {
          type: 'object', required: ['title', 'mode', 'items'],
          properties: {
            title: { type: 'string' },
            mode: { type: 'string', description: 'ör. "Bireysel · 15 dk" ya da "Grup · 20 dk"' },
            items: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
            warn: { type: 'string', description: 'Sık yapılan hata uyarısı (gerekiyorsa)' },
          },
        },
      },
      checklist: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 7 },
      navi: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4 },
      rubric: {
        type: 'array', minItems: 4, maxItems: 4,
        items: {
          type: 'object', required: ['k', 'd', 'l4', 'l3', 'l2', 'l1'],
          properties: {
            k: { type: 'string', description: 'Ölçüt adı' }, d: { type: 'string', description: 'Ölçüt açıklaması' },
            l4: { type: 'string' }, l3: { type: 'string' }, l2: { type: 'string' }, l1: { type: 'string' },
          },
        },
      },
      diff_destek: { type: 'string', description: 'Desteğe ihtiyaç duyan öğrenci için uyarlama' },
      diff_ileri: { type: 'string', description: 'İleri düzey öğrenci için uzatma' },
      misconception: { type: 'string', description: 'Hedeflenen yanılgı ve etkinliğin onu nasıl ortaya çıkardığı' },
    },
  },
};

// Model çıktısı, normalize edilmeden önce sıkı ve fail-closed doğrulanır.
type Obj = Record<string, unknown>;
const MAX_BODY_BYTES = 32_768;
const MAX_PROMPT_BYTES = 24_000;
const MAX_TEXT = 2_000;
const INPUT_KEYS = new Set(['course','grade','outcome','level','unit','duration','format','note','skills21','digital','structure']);
const ID_LABEL_RE = /(?:t\.c\.?\s*kimlik|tc\s*kimlik|kimlik\s*(?:no|numaras[ıi])|identity\s*(?:no|number)|pasaport|öğrenci\s*(?:no|numaras[ıi]))/iu;
const EMAIL_RE = /\b[^\s@<>]{1,64}@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu;
const PHONE_RE = /(?:\+?90\s*)?(?:0\s*)?(?:5\s*\d{2}|\d{3})[\s./-]*\d{3}[\s./-]*\d{2}[\s./-]*\d{2}\b/u;
const TC_RE = /\b[1-9]\d{10}\b/u;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const textOK = (v: unknown, max = MAX_TEXT): v is string => typeof v === 'string' && v.length <= max && !EMAIL_RE.test(v) && !PHONE_RE.test(v) && !TC_RE.test(v) && !ID_LABEL_RE.test(v);
const keyOK = (k: string) => k.length <= 80 && !ID_LABEL_RE.test(k);
const readLimitedBody = async (stream: ReadableStream<Uint8Array> | null, limit: number): Promise<Uint8Array | null> => {
  const reader = stream?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) { await reader.cancel(); return null; }
      chunks.push(value);
    }
  } catch { return null; }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
};
const safeTree = (v: unknown, depth = 0): boolean => {
  if (depth > 8) return false;
  if (typeof v === 'string') return textOK(v);
  if (typeof v === 'number') return Number.isFinite(v) && Math.abs(v) <= 1e9;
  if (typeof v === 'boolean' || v === null) return true;
  if (Array.isArray(v)) return v.length <= 50 && v.every((x) => safeTree(x, depth + 1));
  if (isObj(v)) return Object.keys(v).length <= 40 && Object.entries(v).every(([k, x]) => keyOK(k) && safeTree(x, depth + 1));
  return false;
};
const exactKeys = (o: Obj, required: string[], optional: string[] = []) => {
  const allowed = new Set([...required, ...optional]);
  return required.every((k) => Object.prototype.hasOwnProperty.call(o, k)) && Object.keys(o).every((k) => allowed.has(k));
};
const arrOfStrings = (v: unknown, min: number, max: number) => Array.isArray(v) && v.length >= min && v.length <= max && v.every((x) => textOK(x));
const VIS_PARAM_KEYS: Record<string, string[]> = {
  flow: ['kind','steps'], organizer: ['kind','slots'], sort: ['bins','items'], cards: ['items'], chat: ['lines'], news: ['headline','lead','tags'],
  timeline: ['events'], routine: ['items'], bars: ['title','labels','values','unit','editable'], pie: ['labels','values'], budget: ['items','total'], pizza: ['pizzas','target','maxCut'],
  balance: ['left','right','solution'], numberline: ['min','max','step','target','label'], areagrid: ['rows','cols','shade','label'], cubes: ['l','w','h'], coord: ['points','line'],
  dice: ['kind','items','counts'], zoom: ['preset'], solar: ['mode'], circuit: ['bulbs','series','material'], heat: ['materials'], light: ['mode'], force: ['obj','forces'], atom: ['element'], lever: ['kind'], shapes: ['kind','labels'],
};
const VIS_REQUIRED: Record<string, string[]> = {
  flow: ['kind','steps'], organizer: ['kind','slots'], sort: ['bins','items'], cards: ['items'], chat: ['lines'], news: ['headline','lead','tags'],
  timeline: ['events'], routine: ['items'], bars: ['title','labels','values','unit','editable'], pie: ['labels','values'], budget: ['items','total'], pizza: ['pizzas','target','maxCut'],
  balance: ['left','right','solution'], numberline: ['min','max','step','target','label'], areagrid: ['rows','cols','shade','label'], cubes: ['l','w','h'], coord: ['points','line'],
  dice: ['kind','items','counts'], zoom: ['preset'], solar: ['mode'], circuit: ['bulbs','series','material'], heat: ['materials'], light: ['mode'], force: ['obj','forces'], atom: ['element'], lever: ['kind'], shapes: ['kind','labels'],
};
const validateVisualParams = (type: string, v: unknown): v is Obj => isObj(v) && safeTree(v) && exactKeys(v, VIS_REQUIRED[type] ?? [], []) && Object.keys(v).every((k) => VIS_PARAM_KEYS[type]?.includes(k));
const validateDraft = (d: unknown): d is Obj => {
  if (!isObj(d) || !safeTree(d)) return false;
  const required = ['title','subtitle','scenario','kazanim','skills21','digital','tools','visual_type','visual_params','visual_caption','steps','checklist','navi','rubric','diff_destek','diff_ileri','misconception'];
  if (!exactKeys(d, required) || !required.every((k) => Object.prototype.hasOwnProperty.call(d, k))) return false;
  if (!textOK(d.title, 160) || !textOK(d.subtitle, 240) || !textOK(d.scenario, 1800) || !textOK(d.visual_caption, 400) || !textOK(d.diff_destek, 1200) || !textOK(d.diff_ileri, 1200) || !textOK(d.misconception, 1200)) return false;
  if (!arrOfStrings(d.kazanim, 1, 3) || !arrOfStrings(d.skills21, 2, 5) || !arrOfStrings(d.digital, 0, 3) || !arrOfStrings(d.tools, 0, 4) || !arrOfStrings(d.checklist, 4, 7) || !arrOfStrings(d.navi, 2, 4)) return false;
  if (typeof d.visual_type !== 'string' || !VIS_TYPES.includes(d.visual_type) || !validateVisualParams(d.visual_type, d.visual_params)) return false;
  if (!Array.isArray(d.steps) || d.steps.length < 3 || d.steps.length > 6 || !d.steps.every((x) => isObj(x) && exactKeys(x, ['title','mode','items'], ['warn']) && textOK(x.title,160) && textOK(x.mode,100) && arrOfStrings(x.items,2,5) && (x.warn === undefined || textOK(x.warn,400)))) return false;
  if (!Array.isArray(d.rubric) || d.rubric.length !== 4 || !d.rubric.every((x) => isObj(x) && exactKeys(x, ['k','d','l4','l3','l2','l1']) && ['k','d','l4','l3','l2','l1'].every((k) => textOK(x[k],500)))) return false;
  return true;
};
const normalize = (d: Obj) => ({
  title: d.title as string, subtitle: d.subtitle as string, scenario: d.scenario as string,
  kazanim: d.kazanim as string[], skills21: d.skills21 as string[], digital: d.digital as string[], tools: d.tools as string[],
  visual: { type: d.visual_type as string, params: d.visual_params as Obj, caption: d.visual_caption as string },
  steps: d.steps, checklist: d.checklist as string[], navi: d.navi as string[],
  diff: { destek: d.diff_destek as string, ileri: d.diff_ileri as string }, misconception: d.misconception as string,
});

// Kazanım kodları ve HTML açılı ayraçları temizlenir (çıktı her ekranda ayrıca kaçışlanır).
const CODE_RE = /\b(MAT|TUR|FEN|SOS|ING|FB|SB|ENG|T)\.?\s?\d+(\.\d+){1,3}\b/g;
const stripCodes = (v: unknown): unknown =>
  typeof v === 'string' ? v.replace(CODE_RE, '').replace(/</g, '‹').replace(/>/g, '›').replace(/\s{2,}/g, ' ').trim()
    : Array.isArray(v) ? v.map(stripCodes)
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, stripCodes(x)])) : v;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail('Yalnızca POST', 405);

  const contentLength = Number(req.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) return fail('İstek çok büyük. Alanları kısaltıp yeniden deneyin.', 413);
  const rawBody = await readLimitedBody(req.body, MAX_BODY_BYTES);
  if (!rawBody) return fail('İstek okunamadı veya izin verilen boyutu aşıyor.', 413);
  let b: unknown;
  try { b = JSON.parse(new TextDecoder().decode(rawBody)); } catch { return fail('İstek biçimi geçersiz.'); }
  if (!isObj(b) || !safeTree(b) || Object.keys(b).some((key) => !INPUT_KEYS.has(key))) return fail('İstek biçimi geçersiz.');

  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: u } = await admin.auth.getUser(token);
  if (!u?.user) return fail('Oturum bulunamadı. Yeniden giriş yapın.', 401);
  const { data: prof } = await admin.from('profiles').select('id, school_id, role').eq('id', u.user.id).maybeSingle();
  if (!prof || !['admin', 'teacher'].includes(prof.role)) return fail('Bu özellik yalnızca öğretmenler içindir.', 403);

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return fail('Yapay zekâ henüz yapılandırılmadı (API anahtarı eksik).', 503);

  const course = typeof b.course === 'string' ? b.course : '';
  const grade = typeof b.grade === 'number' ? b.grade : NaN;
  const outcome = typeof b.outcome === 'string' ? b.outcome.trim() : '';
  const level = b.level === undefined ? 'orta' : b.level;
  const duration = b.duration === undefined ? '40 dk' : b.duration;
  const format = b.format === undefined ? 'Bireysel' : b.format;
  if (typeof level !== 'string' || typeof duration !== 'string' || typeof format !== 'string'
      || !COURSES[course] || !Number.isInteger(grade) || grade < 5 || grade > 8 || !textOK(outcome, 1200) || outcome.length < 5
      || !LEVELS[level] || !['40 dk','80 dk (2 ders)'].includes(duration) || !['Bireysel','İkili','Grup'].includes(format)) return fail('Ders, sınıf, kazanım veya çalışma biçimi geçersiz.', 400);
  const unit = b.unit === undefined ? '' : b.unit;
  const note = b.note === undefined ? '' : b.note;
  const structure = b.structure === undefined ? '' : b.structure;
  const skills21 = b.skills21 === undefined ? [] : b.skills21;
  const digital = b.digital === undefined ? [] : b.digital;
  if (typeof unit !== 'string' || typeof note !== 'string' || typeof structure !== 'string'
      || !Array.isArray(skills21) || !Array.isArray(digital)) return fail('İstek alanlarının biçimi geçersiz.', 400);
  const req_ = {
    course, grade, outcome, level,
    unit,
    duration,
    format,
    note,
    skills21,
    digital,
    structure,
  };
  if (!textOK(req_.unit, 200) || !textOK(req_.note, 600) || !textOK(req_.structure, 800)
      || !arrOfStrings(req_.skills21, 0, 12) || !arrOfStrings(req_.digital, 0, 8)) return fail('İstek alanlarının biçimi veya uzunluğu geçersiz.', 400);

  const prompt = [
    `Ders: ${COURSES[course]} · ${grade}. sınıf`,
    req_.unit && `Tema: ${req_.unit}`,
    `Kazanım: ${outcome}`,
    `Öğrenci düzeyi: ${LEVELS[level]}`,
    `Süre: ${req_.duration} · Çalışma biçimi: ${req_.format}`,
    req_.skills21.length && `Bu temanın programdaki 21. yüzyıl becerileri: ${req_.skills21.join(', ')}`,
    req_.digital.length && `Bu temanın dijital becerileri: ${req_.digital.join(', ')}`,
    req_.structure && `Yapı örneği (yalnızca adım düzeni için; içeriğini KULLANMA): ${req_.structure}`,
    req_.note && `Öğretmenin isteği: ${req_.note}`,
    '\nBu bilgilere göre özgün bir etkinlik tasarla.',
  ].filter(Boolean).join('\n');

  const promptBytes = new TextEncoder().encode(SYSTEM).byteLength + new TextEncoder().encode(prompt).byteLength;
  if (promptBytes > MAX_PROMPT_BYTES) return fail('İstek çok uzun. Ek isteği veya örnek yapıyı kısaltıp yeniden deneyin.', 413);
  if (DAILY_LIMIT < 1 || GLOBAL_DAILY_LIMIT < 1) return fail('Yapay zekâ kotası yapılandırılamadı. Biraz sonra yeniden deneyin.', 503);
  const { data: quota, error: qErr } = await admin.rpc('srv_ai_reserve', {
    p_teacher: prof.id, p_school: prof.school_id, p_daily_limit: DAILY_LIMIT,
    p_global_limit: GLOBAL_DAILY_LIMIT, p_model: MODEL,
    p_request: { course, grade, level, duration, format, input_characters: prompt.length },
  });
  if (qErr || !quota) return fail('Üretim kotası denetlenemedi. Biraz sonra yeniden deneyin.', 503);
  if (!quota.ok) return fail(quota.reason === 'global'
    ? 'Sistem genelindeki üretim sınırına ulaşıldı. Daha sonra yeniden deneyin.'
    : 'Günlük üretim sınırınıza ulaşıldı. Daha sonra yeniden deneyin.', 429);
  if (typeof quota.id !== 'string') return fail('Üretim kaydı oluşturulamadı. Biraz sonra yeniden deneyin.', 503);
  const reservationId = quota.id;

  const t0 = Date.now();
  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({
        model: MODEL, max_tokens: 6000, system: SYSTEM,
        tools: [TOOL], tool_choice: { type: 'tool', name: 'etkinlik_kaydet' },
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (e) {
    await admin.from('ai_generations').update({ status: 'error', error: 'PROVIDER_UNAVAILABLE' }).eq('id', reservationId);
    return fail('Yapay zekâ hizmetine ulaşılamadı. Biraz sonra yeniden deneyin.', 502);
  }
  const providerBytes = await readLimitedBody(res.body, 262_144);
  if (!providerBytes) {
    await admin.from('ai_generations').update({ status: 'error', error: 'PROVIDER_RESPONSE_TOO_LARGE' }).eq('id', reservationId);
    return fail('Yapay zekâ yanıtı beklenen boyutu aştı. Yeniden deneyin.', 502);
  }
  const providerBody = new TextDecoder().decode(providerBytes);
  let out: Obj = {};
  try {
    const parsed: unknown = JSON.parse(providerBody);
    out = isObj(parsed) ? parsed : {};
  } catch { /* bozuk yanıt, aşağıda güvenli hata */ }
  if (!res.ok) {
    await admin.from('ai_generations').update({ status: 'error', error: 'PROVIDER_ERROR' }).eq('id', reservationId);
    return fail(res.status === 529 || res.status === 429 ? 'Yapay zekâ şu an yoğun. Bir dakika sonra yeniden deneyin.'
      : 'Taslak üretilemedi.', 502);
  }
  const blocks = Array.isArray(out.content) && out.content.every(isObj)
    ? out.content as Array<Obj & { type: string; name?: string; input?: unknown }> : [];
  const uses = blocks.filter((c) => c.type === 'tool_use');
  const draft = blocks.length === 1 && uses.length === 1 && uses[0].name === TOOL.name ? uses[0].input : undefined;
  if (!validateDraft(draft)) {
    await admin.from('ai_generations').update({ status: 'error', error: 'INVALID_MODEL_OUTPUT' }).eq('id', reservationId);
    return fail('Taslak beklenen biçimde üretilemedi. Yeniden deneyin.', 502);
  }
  const norm = normalize(draft);
  const activity = stripCodes({
    ...norm,
    course, grade, duration: req_.duration, format: req_.format, themeName: req_.unit,
    aiLevel: level, src: 'AI', model: MODEL,
  }) as Record<string, unknown>;
  activity.id = 'ai-' + reservationId;
  const usage = isObj(out.usage) ? out.usage : {};
  const inputTokens = typeof usage.input_tokens === 'number' && Number.isSafeInteger(usage.input_tokens) && usage.input_tokens >= 0 ? usage.input_tokens : null;
  const outputTokens = typeof usage.output_tokens === 'number' && Number.isSafeInteger(usage.output_tokens) && usage.output_tokens >= 0 ? usage.output_tokens : null;

  await admin.from('ai_generations').update({
    status: 'ok',
    input_tokens: inputTokens, output_tokens: outputTokens,
  }).eq('id', reservationId);

  return json({ activity, usage: inputTokens === null && outputTokens === null ? null : { input_tokens: inputTokens, output_tokens: outputTokens }, ms: Date.now() - t0, quota: { used: quota.used, limit: quota.limit } });
});
