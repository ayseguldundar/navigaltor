// Veli kaydı (öğretmenin verdiği davet koduyla) ve mevcut veli hesabına başka bir çocuk ekleme.
// KVKK açık rıza onayı olmadan kayıt yapılmaz; onay metninin sürümü kayda geçer.
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

const CONSENT_VERSION = 'kvkk-veli-2026-10';

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
const allowed = async (bucket: string, max: number, windowSec: number) => {
  const { data, error } = await admin.rpc('srv_rate_limit', { p_bucket: bucket, p_max: max, p_window_seconds: windowSec });
  return !error && data === true;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail('Yalnızca POST', 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail('Geçersiz istek'); }
  const inviteCode = String(body.inviteCode ?? '').trim().toUpperCase();
  const relation = String(body.relation ?? '').trim().slice(0, 30);
  if (!/^[A-Z0-9]{8}$/.test(inviteCode)) return fail('Davet kodu 8 karakter olmalı.');
  if (body.consent !== true) return fail('Devam etmek için açık rıza metnini onaylamanız gerekiyor.');
  if (!(await allowed('kayit-veli:' + clientIp(req), 10, 3600))) {
    return fail('Çok fazla deneme. Bir saat sonra yeniden deneyin.', 429);
  }

  // Giriş yapmış veli: yeni çocuk bağla
  if (body.mode === 'link') {
    const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return fail('Oturum bulunamadı. Yeniden giriş yapın.', 401);
    const { error } = await admin.rpc('srv_link_parent', {
      p_user: u.user.id, p_invite: inviteCode, p_consent_version: CONSENT_VERSION, p_relation: relation,
    });
    if (error) return fail(error.message);
    return json({ ok: true });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const fullName = String(body.fullName ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('Geçerli bir e-posta adresi yazın.');
  if (password.length < 8) return fail('Şifre en az 8 karakter olmalı.');
  if (fullName.length < 2 || fullName.length > 120) return fail('Ad soyad yazın.');

  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: fullName },
  });
  if (cErr || !created.user) {
    const exists = /already|registered|exists/i.test(cErr?.message ?? '');
    return fail(exists ? 'Bu e-posta ile zaten bir hesap var. Giriş yapıp "Çocuk ekle" bölümünü kullanın.' : 'Hesap oluşturulamadı.', exists ? 409 : 500);
  }
  const { error: rErr } = await admin.rpc('srv_register_parent', {
    p_user: created.user.id, p_full_name: fullName, p_invite: inviteCode,
    p_consent_version: CONSENT_VERSION, p_relation: relation,
  });
  if (rErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return fail(rErr.message);
  }
  return json({ ok: true });
});
