// Öğrenci girişi 1. adım: sınıf kodu → şube bilgisi ve öğrencilerin kısa adları (Ad + soyadın ilk harfi).
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
const allowed = async (bucket: string, max: number, windowSec: number) => {
  const { data, error } = await admin.rpc('srv_rate_limit', { p_bucket: bucket, p_max: max, p_window_seconds: windowSec });
  return error ? true : data === true; // veritabanı hatasında girişleri kilitleme (PIN kilidi ayrıca korur)
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail('Yalnızca POST', 405);
  let body: Record<string, string>;
  try { body = await req.json(); } catch { return fail('Geçersiz istek'); }
  const code = String(body.classCode ?? '').trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) return fail('Sınıf kodu 6 karakter olmalı.');
  // Okul ağında birçok öğrenci aynı IP'den bağlanır; sınır buna göre geniş tutuldu.
  if (!(await allowed('ogrenci-sinif:' + clientIp(req), 900, 600))) {
    return fail('Çok fazla deneme. Birkaç dakika sonra yeniden deneyin.', 429);
  }
  const { data, error } = await admin.rpc('srv_class_roster', { p_code: code });
  if (error) return fail('Şu an sınıf bilgisi alınamadı.', 500);
  if (!data) return fail('Bu sınıf kodu bulunamadı. Öğretmenine sor.', 404);
  return json(data);
});
