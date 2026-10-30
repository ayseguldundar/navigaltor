// Okul yöneticisi, okulundaki bir öğretmenin veya velinin şifresini geçici bir şifreyle sıfırlar.
// (E-posta ile şifre sıfırlama için özel SMTP gerekir; pilotta bu yol kullanılır.) Geçici şifre yalnızca bir kez gösterilir.
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

// Karıştırılabilir karakterler (0/O, 1/l/I) çıkarılmış, okunması kolay geçici şifre.
function tempPassword() {
  const A = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const b = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(b, (x) => A[x % A.length]).join('').replace(/(.{4})(.{4})(.{4})/, '$1-$2-$3');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail('Yalnızca POST', 405);
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: u } = await admin.auth.getUser(token);
  if (!u?.user) return fail('Oturum bulunamadı. Yeniden giriş yapın.', 401);
  let body: Record<string, string>;
  try { body = await req.json(); } catch { return fail('Geçersiz istek'); }
  const target = String(body.userId ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(target)) return fail('Kişi belirtilmedi.');
  if (target === u.user.id) return fail('Kendi şifrenizi buradan değiştiremezsiniz.');

  const { data: chk, error: cErr } = await admin.rpc('srv_can_reset_password', { p_actor: u.user.id, p_target: target });
  if (cErr) return fail('İşlem hazırlanamadı.', 500);
  if (!chk.ok) return fail(chk.reason, 403);

  const password = tempPassword();
  const { error } = await admin.auth.admin.updateUserById(target, { password });
  if (error) return fail('Şifre sıfırlanamadı.', 500);
  const { error: rvErr } = await admin.rpc('srv_revoke_sessions', { p_user: target }); // açık oturumları kapat
  await admin.rpc('srv_log_password_reset', { p_actor: u.user.id, p_school: chk.school_id });
  return json({ ok: true, password, sessionsRevoked: !rvErr });
});
