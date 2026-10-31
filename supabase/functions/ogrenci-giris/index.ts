// Öğrenci girişi 2. adım: sınıf kodu + seçilen öğrenci + 4 haneli PIN → oturum.
// Öğrencinin e-postası yoktur; arka planda yalnızca sistemin bildiği bir hesap açılır ve oturum sunucuda üretilir.
// Her 5 hatalı PIN denemesinde hesap kilitlenir: 15 dk, sonra 30 dk, 1 saat… en çok 4 saat (veritabanında).
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

const pick = (j: string | undefined, legacy: string | undefined) => {
  try { const o = JSON.parse(j ?? ''); if (o?.default) return o.default as string; } catch { /* eski anahtar */ }
  return legacy ?? '';
};
const URL_ = Deno.env.get('SUPABASE_URL')!;
const noSession = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(URL_, pick(Deno.env.get('SUPABASE_SECRET_KEYS'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')), noSession);
const publicClient = () =>
  createClient(URL_, pick(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS'), Deno.env.get('SUPABASE_ANON_KEY')), noSession);
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' } });
const fail = (error: string, status = 400) => json({ error }, status);
const clientIp = (req: Request) => (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'bilinmiyor';
const allowed = async (bucket: string, max: number, windowSec: number): Promise<boolean | null> => {
  const { data, error } = await admin.rpc('srv_rate_limit', { p_bucket: bucket, p_max: max, p_window_seconds: windowSec });
  return error ? null : data === true;
};
const studentEmail = (id: string) => `ogrenci-${id}@ogrenci.navigaitor.app`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail('Yalnızca POST', 405);
  let body: Record<string, string>;
  try { body = await req.json(); } catch { return fail('Geçersiz istek'); }
  const code = String(body.classCode ?? '').trim().toUpperCase();
  const studentId = String(body.studentId ?? '');
  const pin = String(body.pin ?? '');
  if (!/^[A-Z0-9]{6}$/.test(code) || !/^[0-9a-f-]{36}$/i.test(studentId) || !/^\d{4}$/.test(pin)) {
    return fail('Sınıf kodu, isim ve 4 haneli şifre gerekli.');
  }
  // Okul ağında tüm öğrenciler aynı IP'yi paylaşır: sınır sınıf kodu başına ve IP başına geniş tutulur; asıl koruma öğrenci başına PIN kilididir.
  const codeAllowed = await allowed('ogrenci-giris:' + code, 400, 600);
  const ipAllowed = codeAllowed === null ? null : await allowed('ogrenci-giris-ip:' + clientIp(req), 1500, 600);
  if (codeAllowed === null || ipAllowed === null) return fail('Şu an giriş yapılamıyor.', 503);
  if (!codeAllowed || !ipAllowed) {
    return fail('Çok fazla deneme. Birkaç dakika sonra yeniden deneyin.', 429);
  }

  const { data: v, error: vErr } = await admin.rpc('srv_verify_student_pin', { p_code: code, p_student: studentId, p_pin: pin });
  if (vErr) return fail('Şu an giriş yapılamıyor.', 500);
  if (!v.ok) {
    const msg: Record<string, string> = {
      wrong_pin: 'Şifre yanlış. Tekrar dene.',
      locked: 'Çok fazla yanlış deneme yapıldı. Biraz sonra tekrar dene ya da öğretmeninden yeni şifre iste.',
      no_pin: 'Şifren henüz hazır değil. Öğretmenine söyle.',
      not_found: 'Bu sınıfta seni bulamadık. Öğretmenine söyle.',
    };
    return fail(msg[v.reason] ?? 'Giriş yapılamadı.', v.reason === 'locked' ? 423 : 401);
  }

  // Öğrencinin arka plan hesabı yoksa oluştur ve öğrenci kaydına bağla.
  const email = studentEmail(studentId);
  let authId: string | null = v.auth_user_id;
  if (!authId) {
    const { data: c, error: cErr } = await admin.auth.admin.createUser({
      email, email_confirm: true, user_metadata: { role: 'student' },
    });
    if (c?.user) authId = c.user.id;
    else if (!/already|registered|exists/i.test(cErr?.message ?? '')) return fail('Giriş hazırlanamadı.', 500);
  }

  // Tek kullanımlık bağlantı belirteci üret ve hemen oturuma çevir (e-posta gönderilmez).
  const { data: link, error: lErr } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  if (lErr || !link?.properties?.hashed_token) return fail('Giriş hazırlanamadı.', 500);
  if (!authId) authId = link.user.id;
  const { error: kErr } = await admin.rpc('srv_link_student_auth', { p_student: studentId, p_auth_user: authId });
  if (kErr) return fail('Giriş hazırlanamadı.', 500);

  const { data: s, error: sErr } = await publicClient().auth.verifyOtp({
    type: 'magiclink', token_hash: link.properties.hashed_token,
  });
  if (sErr || !s.session) return fail('Oturum açılamadı.', 500);
  return json({
    access_token: s.session.access_token,
    refresh_token: s.session.refresh_token,
    full_name: v.full_name,
  });
});
