// Supabase istemcisi ve sunucu fonksiyonu çağrıları.
import { createClient } from '/vendor/supabase-js-2.117.2.js';

const C = window.NAVI_CONFIG;
export const supabase = createClient(C.supabaseUrl, C.publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'navigaitor-auth' },
});

// Edge Function çağrısı. Hata durumunda sunucunun Türkçe mesajıyla Error fırlatır.
export async function callFn(name, body, { auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json', apikey: C.publishableKey };
  if (auth) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error('Oturumunuz sona ermiş. Yeniden giriş yapın.');
    headers.Authorization = 'Bearer ' + data.session.access_token;
  }
  let res;
  try {
    res = await fetch(`${C.supabaseUrl}/functions/v1/${name}`, { method: 'POST', headers, body: JSON.stringify(body) });
  } catch {
    throw new Error('Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.');
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Bir sorun oluştu. Tekrar deneyin.');
  return json;
}

export async function rpc(fn, args) {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data;
}

export async function currentProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data } = await supabase.from('profiles').select('id, role, full_name, school_id').eq('id', session.user.id).maybeSingle();
  return data;
}

export const homeFor = (role) => (role === 'student' ? '/ogrenci' : role === 'parent' ? '/veli' : '/yonetim');
export const ROLE_TR = { admin: 'Okul yöneticisi', teacher: 'Öğretmen', student: 'Öğrenci', parent: 'Veli' };

export async function signOut(to = '/giris') {
  await supabase.auth.signOut();
  location.href = to;
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
