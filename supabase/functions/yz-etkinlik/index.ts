// Yapay zekâ ile etkinlik taslağı üretimi (Claude).
// - Yalnızca öğretmen ve okul yöneticisi çağırabilir; günlük kota uygulanır.
// - Modele öğrenci adı veya kimliği gönderilmez.
// - Ders kitapları soru havuzu olarak kullanılmaz: her taslak özgün üretilir; kütüphane etkinliği yalnızca yapı örneğidir.
// - Taslak öğretmen onayı olmadan öğrenciye gitmez (onay ve atama istemci tarafında).
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

const MODEL = Deno.env.get('ANTHROPIC_MODEL') || 'claude-sonnet-5-5';
const DAILY_LIMIT = Number(Deno.env.get('AI_DAILY_LIMIT') || 40);
// Tüm okullar için günlük toplam üst sınır (maliyet güvencesi).
const GLOBAL_DAILY_LIMIT = Number(Deno.env.get('AI_GLOBAL_DAILY_LIMIT') || 300);
const MAX_BODY_BYTES = 24 * 1024;
const PERSONAL_DATA_RE = /(?:[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:\+?90|0)\s?5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}|\b\d{11}\b)/;

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

// Model çıktısını arayüzün beklediği biçime getirir; eksik veya bozuk alanları güvenli varsayılanlarla doldurur.
type Obj = Record<string, unknown>;
// Model bazen dizi alanlarını JSON metni olarak ('["…"]') ya da metin alanlarını dizi olarak döndürür; ikisini de düzelt.
const unJson = (v: unknown): unknown => {
  if (typeof v !== 'string') return v;
  const t = v.trim();
  if (!/^[[{]/.test(t)) return t;
  try { return JSON.parse(t); } catch { return t; }
};
const str = (v: unknown): string => {
  const u = unJson(v);
  if (typeof u === 'string') return u.trim();
  if (Array.isArray(u)) return u.map(str).filter(Boolean).join(' ');
  return '';
};
const strs = (v: unknown, max = 8): string[] => {
  const u = unJson(v);
  return Array.isArray(u) ? u.map(str).filter(Boolean).slice(0, max) : typeof u === 'string' && u.trim() ? [u.trim()] : [];
};
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
function normalize(d: Obj) {
  const v = isObj(d.visual) ? d.visual : {};
  let vType = str(d.visual_type) || str(v.type) || (typeof d.visual === 'string' ? d.visual : '');
  vType = VIS_TYPES.find((t) => new RegExp(`\b${t}\b`).test(vType)) ?? '';
  const vp = unJson(d.visual_params);
  const vParams = isObj(vp) ? vp : isObj(v.params) ? v.params : isObj(d.params) ? d.params : {};
  const vCaption = str(d.visual_caption) || str(v.caption) || str(d.caption);
  const diff = isObj(d.diff) ? d.diff : {};
  const arr = (v: unknown) => { const u = unJson(v); return Array.isArray(u) ? u : []; };
  const steps = arr(d.steps).filter(isObj).map((x) => ({
    title: str(x.title) || 'Adım', mode: str(x.mode), items: strs(x.items, 6), warn: str(x.warn),
  })).filter((x) => x.items.length).slice(0, 6);
  const rubric = arr(d.rubric).filter(isObj).map((x) => ({
    k: str(x.k), d: str(x.d), l4: str(x.l4), l3: str(x.l3), l2: str(x.l2), l1: str(x.l1),
  })).filter((x) => x.k).slice(0, 4);
  return {
    title: str(d.title), subtitle: str(d.subtitle), scenario: str(d.scenario),
    kazanim: strs(d.kazanim, 3), skills21: strs(d.skills21, 5), digital: strs(d.digital, 3), tools: strs(d.tools, 4),
    visual: { type: vType, params: vParams, caption: vCaption },
    steps, checklist: strs(d.checklist, 8), navi: strs(d.navi, 4), rubric,
    diff: { destek: str(d.diff_destek) || str(diff.destek), ileri: str(d.diff_ileri) || str(diff.ileri) },
    misconception: str(d.misconception),
  };
}
const validDraft = (d: ReturnType<typeof normalize>) => {
  const text = (v: unknown, max: number) => typeof v === 'string' && v.length > 0 && v.length <= max;
  return text(d.title, 200) && text(d.subtitle, 300) && text(d.scenario, 3000)
    && Array.isArray(d.kazanim) && d.kazanim.length >= 1 && d.kazanim.length <= 3
    && Array.isArray(d.skills21) && d.skills21.length >= 2 && d.skills21.length <= 5
    && Array.isArray(d.steps) && d.steps.length >= 3 && d.steps.length <= 6
    && d.steps.every((s) => text(s.title, 160) && Array.isArray(s.items) && s.items.length >= 2 && s.items.length <= 6)
    && Array.isArray(d.checklist) && d.checklist.length >= 4 && d.checklist.length <= 8
    && Array.isArray(d.navi) && d.navi.length >= 2 && d.navi.length <= 4
    && isObj(d.visual) && VIS_TYPES.includes(String(d.visual.type))
    && Array.isArray(d.rubric) && d.rubric.length === 4
    && d.rubric.every((r) => text(r.k, 120) && text(r.d, 300) && text(r.l4, 300) && text(r.l3, 300) && text(r.l2, 300) && text(r.l1, 300));
};

// Kazanım kodları ve HTML açılı ayraçları temizlenir (çıktı her ekranda ayrıca kaçışlanır).
const CODE_RE = /\b(MAT|TUR|FEN|SOS|ING|FB|SB|ENG|T)\.?\s?\d+(\.\d+){1,3}\b/g;
const stripCodes = (v: unknown): unknown =>
  typeof v === 'string' ? v.replace(CODE_RE, '').replace(/</g, '‹').replace(/>/g, '›').replace(/\s{2,}/g, ' ').trim()
    : Array.isArray(v) ? v.map(stripCodes)
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, stripCodes(x)])) : v;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail('Yalnızca POST', 405);

  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: u } = await admin.auth.getUser(token);
  if (!u?.user) return fail('Oturum bulunamadı. Yeniden giriş yapın.', 401);
  const { data: prof } = await admin.from('profiles').select('id, school_id, role').eq('id', u.user.id).maybeSingle();
  if (!prof || !['admin', 'teacher'].includes(prof.role)) return fail('Bu özellik yalnızca öğretmenler içindir.', 403);

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return fail('Yapay zekâ henüz yapılandırılmadı (API anahtarı eksik).', 503);
  const bodySize = Number(req.headers.get('content-length') || 0);
  if (bodySize > MAX_BODY_BYTES) return fail('İstek çok büyük.', 413);
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return fail('Geçersiz istek'); }
  const course = String(b.course ?? '');
  const grade = Number(b.grade);
  const outcome = String(b.outcome ?? '').trim();
  const level = String(b.level ?? 'orta');
  if (!COURSES[course] || !(grade >= 5 && grade <= 8) || outcome.length < 5 || !LEVELS[level]) {
    return fail('Ders, sınıf, kazanım ve öğrenci düzeyi gerekli.');
  }
  const req_ = {
    course, grade, outcome, level,
    unit: String(b.unit ?? '').slice(0, 200),
    duration: String(b.duration ?? '40 dk').slice(0, 40),
    format: String(b.format ?? 'Bireysel').slice(0, 40),
    note: String(b.note ?? '').slice(0, 600),
    skills21: (Array.isArray(b.skills21) ? b.skills21 : []).map(String).slice(0, 12),
    digital: (Array.isArray(b.digital) ? b.digital : []).map(String).slice(0, 8),
    structure: String(b.structure ?? '').slice(0, 800),
  };
  if (PERSONAL_DATA_RE.test(Object.values(req_).flatMap((v) => Array.isArray(v) ? v : [v]).join(' '))) {
    return fail('Kişisel iletişim veya kimlik bilgisi içeren istekler işlenemez.', 400);
  }
  const { data: quota, error: qErr } = await admin.rpc('srv_reserve_ai_generation', {
    p_school: prof.school_id, p_teacher: prof.id, p_daily_limit: DAILY_LIMIT,
    p_global_limit: GLOBAL_DAILY_LIMIT, p_request: req_, p_model: MODEL,
  });
  if (qErr || !quota) return fail('Üretim kotası denetlenemedi. Biraz sonra yeniden deneyin.', 503);
  if (!quota.ok) return fail(quota.reason === 'global' ? 'Sistem genelinde günlük üretim sınırına ulaşıldı. Yarın yeniden deneyebilirsiniz.' : `Günlük üretim sınırına ulaşıldı (${quota.limit}). Yarın yeniden deneyebilirsiniz.`, 429);
  const row = { id: quota.id };

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

  const t0 = Date.now();
  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL, max_tokens: 6000, system: SYSTEM,
        tools: [TOOL], tool_choice: { type: 'auto' },
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (e) {
    await admin.from('ai_generations').update({ status: 'error', error: String(e) }).eq('id', row.id);
    return fail('Yapay zekâ hizmetine ulaşılamadı. Biraz sonra yeniden deneyin.', 502);
  }
  const out = await res.json().catch(() => ({}));
  if (!res.ok) {
    await admin.from('ai_generations').update({ status: 'error', error: JSON.stringify(out).slice(0, 2000) }).eq('id', row.id);
    return fail(res.status === 529 || res.status === 429 ? 'Yapay zekâ şu an yoğun. Bir dakika sonra yeniden deneyin.'
      : 'Taslak üretilemedi.', 502);
  }
  // Model aracı çağırır; çağırmazsa metin içindeki JSON nesnesi kullanılır.
  const blocks = (out.content ?? []) as Array<{ type: string; input?: Record<string, unknown>; text?: string }>;
  let draft = blocks.find((c) => c.type === 'tool_use')?.input;
  if (!draft) {
    const txt = blocks.filter((c) => c.type === 'text').map((c) => c.text).join('\n');
    const m = txt.match(/\{[\s\S]*\}/);
    try { draft = m ? JSON.parse(m[0]) : undefined; } catch { draft = undefined; }
  }
  const norm = draft ? normalize(draft) : null;
  const missing = norm ? (['title', 'scenario', 'steps', 'checklist'] as const).filter((k) => !norm[k] || (Array.isArray(norm[k]) && !norm[k].length)) : ['tümü'];
  if (!norm || missing.length || !validDraft(norm)) {
    await admin.from('ai_generations').update({ status: 'error', error: 'eksik çıktı: ' + missing.join(',') }).eq('id', row.id);
    return fail('Taslak eksik üretildi. Yeniden deneyin.', 502);
  }
  const activity = stripCodes({
    ...norm,
    course, grade, duration: req_.duration, format: req_.format, themeName: req_.unit,
    aiLevel: level, aiNote: req_.note, src: 'AI', model: MODEL,
  }) as Record<string, unknown>;
  activity.id = 'ai-' + (row.id ?? crypto.randomUUID());

  await admin.from('ai_generations').update({
    status: 'ok', response: activity,
    input_tokens: out.usage?.input_tokens ?? null, output_tokens: out.usage?.output_tokens ?? null,
  }).eq('id', row.id);

  return json({ activity, usage: out.usage ?? null, ms: Date.now() - t0, quota: quota ?? null });
});
