// Öğretmen / okul yöneticisi kaydı.
// Okul adı verilirse yeni okul açılır ve kişi yönetici olur; davet kodu verilirse o okula öğretmen olarak katılır.
// Hesap e-posta onayı beklemeden etkin açılır (pilotta kendi SMTP sunucusu olmadan çalışabilmek için).
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

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
const clientIp = (req: Request) => (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'bilinmiyor';
const userMsg = (m: string) => (/Davet|davet|Okul adı|eşleşmiyor/.test(m) ? m.split('\n')[0].slice(0, 160) : '');
const allowed = async (bucket: string, max: number, windowSec: number) => {
  const { data, error } = await admin.rpc('srv_rate_limit', { p_bucket: bucket, p_max: max, p_window_seconds: windowSec });
  return error ? true : data === true; // veritabanı hatasında girişleri kilitleme (PIN kilidi ayrıca korur)
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail('Yalnızca POST', 405);

  let body: Record<string, string>;
  try { body = await req.json(); } catch { return fail('Geçersiz istek'); }
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const fullName = String(body.fullName ?? '').trim();
  const schoolName = String(body.schoolName ?? '').trim();
  const inviteCode = String(body.inviteCode ?? '').trim().toUpperCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('Geçerli bir e-posta adresi yazın.');
  if (password.length < 8) return fail('Şifre en az 8 karakter olmalı.');
  if (fullName.length < 2 || fullName.length > 120) return fail('Ad soyad yazın.');
  if (!inviteCode && schoolName.length < 2) return fail('Okul adını ya da okul davet kodunu yazın.');
  if (!(await allowed('kayit-ogretmen:' + clientIp(req), 40, 3600))) {
    return fail('Çok fazla kayıt denemesi. Bir saat sonra yeniden deneyin.', 429);
  }

  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: fullName },
  });
  if (cErr || !created.user) {
    const exists = /already|registered|exists/i.test(cErr?.message ?? '');
    return fail(exists ? 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.' : 'Hesap oluşturulamadı.', exists ? 409 : 500);
  }

  const { data: reg, error: rErr } = await admin.rpc('srv_register_staff', {
    p_user: created.user.id, p_full_name: fullName,
    p_school_name: inviteCode ? null : schoolName, p_invite: inviteCode || null,
  });
  if (rErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return fail(userMsg(rErr.message) || 'Kayıt tamamlanamadı. Lütfen yeniden deneyin.');
  }
  return json({ ok: true, role: reg.role });
});
