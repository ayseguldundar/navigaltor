import { supabase, esc } from './supa.js';

const app = document.getElementById('app');
let busy = false;

const message = (kind, text) => `<div class="msg ${kind}" role="alert">${esc(text)}</div>`;
const render = (html) => { app.innerHTML = html; };

function form() {
  render(`<h1>Yeni şifre belirle</h1><p class="muted">Hesabınız için en az 8 karakterli yeni bir şifre oluşturun.</p>
    <form id="resetForm"><div class="fld"><label for="pw1">Yeni şifre</label><input class="in" id="pw1" name="password" type="password" minlength="8" autocomplete="new-password" required></div>
    <div class="fld"><label for="pw2">Yeni şifre (tekrar)</label><input class="in" id="pw2" name="passwordAgain" type="password" minlength="8" autocomplete="new-password" required></div>
    <div id="resetMsg"></div><button class="btn pri lg" style="width:100%" ${busy ? 'disabled' : ''}>${busy ? '<span class="spinner"></span> Kaydediliyor…' : 'Şifremi yenile'}</button></form>`);
  app.querySelector('#resetForm').addEventListener('submit', submit);
  app.querySelector('#pw1').focus({ preventScroll: true });
}

function expired() {
  render(`<h1>Bağlantı geçersiz</h1>${message('err', 'Bu şifre yenileme bağlantısı geçersiz veya süresi dolmuş.')}
    <p class="muted">Giriş sayfasına dönüp yeni bir şifre yenileme bağlantısı isteyin.</p><a class="btn pri lg" style="width:100%" href="/giris">Giriş sayfasına dön</a>`);
}

async function submit(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const password = String(f.get('password') || ''), again = String(f.get('passwordAgain') || '');
  const out = app.querySelector('#resetMsg');
  if (password !== again) { out.innerHTML = message('err', 'Şifreler aynı değil.'); return; }
  if (password.length < 8) { out.innerHTML = message('err', 'Şifre en az 8 karakter olmalı.'); return; }
  busy = true; form();
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    await supabase.auth.signOut();
    render(`<h1>Şifreniz yenilendi</h1>${message('ok', 'Yeni şifreniz kaydedildi. Artık yeni şifrenizle sisteme giriş yapabilirsiniz.')}
      <a class="btn pri lg" style="width:100%" href="/giris">Giriş yap</a>`);
  } catch (err) {
    busy = false; form();
    const out2 = app.querySelector('#resetMsg');
    out2.innerHTML = message('err', /weak|short|least/i.test(err.message || '') ? 'Şifre çok kısa veya zayıf.' : 'Şifre yenilenemedi. Bağlantıyı yeniden isteyin.');
  }
}

let recovery = false;
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY' && session) { recovery = true; form(); }
});

const { data: { session } } = await supabase.auth.getSession();
if (session) { recovery = true; form(); }
else if (!recovery) expired();
