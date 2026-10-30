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
  const { data, error } = await supabase.from('profiles').select('id, role, full_name, school_id').eq('id', session.user.id).maybeSingle();
  if (error) throw new Error('Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.');
  return data;
}

// Bağlantı sorunu ekranı: oturumu silmeden yeniden denemeyi sağlar (ağ hatası çıkış sayılmaz).
export function showOffline(el, msg = 'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip yeniden deneyin.') {
  el.innerHTML = `<div class="card"><div class="msg err">${esc(msg)}</div><button class="btn pri" onclick="location.reload()">Yeniden dene</button></div>`;
}

export const homeFor = (role) => (role === 'student' ? '/ogrenci' : role === 'parent' ? '/veli' : '/yonetim');
export const ROLE_TR = { admin: 'Okul yöneticisi', teacher: 'Öğretmen', student: 'Öğrenci', parent: 'Veli' };

export async function signOut(to = '/giris') {
  await supabase.auth.signOut();
  location.href = to;
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Öğretmen ve veli için şifre değiştirme penceresi (öğrenciler PIN kullanır).
export function changePasswordDialog(dlg, body) {
  body.innerHTML = `<h2>Şifremi değiştir</h2>
    <form id="cpw"><div class="fld"><label for="np1">Yeni şifre (en az 8 karakter)</label><input class="in" id="np1" type="password" minlength="8" autocomplete="new-password" required></div>
    <div class="fld"><label for="np2">Yeni şifre (tekrar)</label><input class="in" id="np2" type="password" minlength="8" autocomplete="new-password" required></div>
    <div id="cpwMsg"></div><div class="row"><span class="sp"></span><button type="button" class="btn" data-close>Vazgeç</button><button class="btn pri">Kaydet</button></div></form>`;
  dlg.showModal();
  body.querySelector('#cpw').addEventListener('submit', async (e) => {
    e.preventDefault();
    const a = body.querySelector('#np1').value, b = body.querySelector('#np2').value;
    const out = body.querySelector('#cpwMsg');
    if (a !== b) { out.innerHTML = '<div class="msg err">Şifreler aynı değil.</div>'; return; }
    const { error } = await supabase.auth.updateUser({ password: a });
    if (error) { out.innerHTML = `<div class="msg err">${esc(/weak|short|least/i.test(error.message) ? 'Şifre çok kısa veya zayıf.' : /different|same/i.test(error.message) ? 'Yeni şifre eskisiyle aynı olamaz.' : error.message)}</div>`; return; }
    body.innerHTML = '<h2>Şifreniz değiştirildi</h2><p class="muted">Bir sonraki girişte yeni şifrenizi kullanın.</p><div class="row"><span class="sp"></span><button class="btn pri" data-close>Tamam</button></div>';
  });
}
