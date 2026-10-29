// KVKK: okul yöneticisi bir öğrencinin tüm verisini kalıcı olarak siler.
// Silinenler: öğrenci kaydı (teslimler, tanışma formu, PIN, veli bağlantısı, onaylar, davetler zincirleme), öğrencinin giriş hesabı,
// yalnızca bu öğrenciye bağlı veli hesapları. İşlem kaydı kişisel veri içermez.
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail('Yalnızca POST', 405);
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: u } = await admin.auth.getUser(token);
  if (!u?.user) return fail('Oturum bulunamadı. Yeniden giriş yapın.', 401);

  let body: Record<string, string>;
  try { body = await req.json(); } catch { return fail('Geçersiz istek'); }
  const studentId = String(body.studentId ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(studentId)) return fail('Öğrenci belirtilmedi.');

  const { data: plan, error: pErr } = await admin.rpc('srv_student_deletion_plan', { p_actor: u.user.id, p_student: studentId });
  if (pErr) return fail('Silme hazırlanamadı.', 500);
  if (!plan.ok) return fail(plan.reason, 403);

  const { error: dErr } = await admin.from('students').delete().eq('id', studentId);
  if (dErr) return fail('Öğrenci kaydı silinemedi.', 500);
  const accounts = [plan.student_auth, ...(plan.parent_auth ?? [])].filter(Boolean) as string[];
  const failed: string[] = [];
  for (const id of accounts) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error && !/not.?found/i.test(error.message)) failed.push(id);
  }
  await admin.from('admin_log').insert({ school_id: plan.school_id, actor_id: u.user.id, action: 'ogrenci_sil' });
  if (failed.length) return fail('Öğrenci kaydı silindi ancak bazı giriş hesapları silinemedi. Lütfen yeniden deneyin veya destek isteyin.', 500);
  return json({ ok: true, deletedAccounts: accounts.length });
});
