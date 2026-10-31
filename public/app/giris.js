// Giriş merkezi: öğretmen/yönetici (e-posta), öğrenci (sınıf kodu + isim + PIN), veli (e-posta, davet koduyla kayıt).
import { supabase, callFn, currentProfile, homeFor, ROLE_TR, signOut, esc } from './supa.js';
import { KVKK } from './kvkk.js';

const app = document.getElementById('app');
const S = { role: 'ogretmen', mode: 'login', busy: false, msg: null, resetSent: false, stu: { step: 'code', code: '', roster: null, student: null, pin: '' } };



const fromHash = () => {
  const h = location.hash.replace('#', '');
  if (['ogretmen', 'ogrenci', 'veli'].includes(h)) S.role = h;
};
fromHash();
addEventListener('hashchange', () => { fromHash(); S.msg = null; draw(); });

const msg = () => (S.msg ? `<div class="msg ${S.msg.k}" role="alert">${esc(S.msg.t)}</div>` : '');
const spin = (label) => (S.busy ? '<span class="spinner"></span> Lütfen bekleyin…' : label);

function passwordResetView() {
  return `<h1>Şifremi unuttum</h1><p class="muted">Hesabınızın e-posta adresini yazın. Şifrenizi yenileyebileceğiniz güvenli bağlantıyı e-posta ile göndereceğiz.</p>${msg()}
    <form id="forgot"><div class="fld"><label for="resetEmail">E-posta</label><input class="in" id="resetEmail" name="email" type="email" autocomplete="email" required></div>
    <button class="btn pri lg" style="width:100%" ${S.busy || S.resetSent ? 'disabled' : ''}>${spin('Şifre yenileme bağlantısı gönder')}</button></form>
    <p class="small" style="margin-top:12px"><button class="toggle" data-mode="login">Giriş ekranına dön</button></p>`;
}

const forgotLink = () => `<p class="small" style="margin-top:10px"><button class="toggle" data-mode="forgot">Şifremi unuttum</button></p>`;

function roleTabs() {
  const r = [['ogretmen', '👩‍🏫', 'Öğretmen'], ['ogrenci', '🎒', 'Öğrenci'], ['veli', '👨‍👩‍👧', 'Veli']];
  return `<div class="roles" role="tablist">${r.map(([k, i, l]) =>
    `<button role="tab" aria-selected="${S.role === k}" class="${S.role === k ? 'on' : ''}" data-role="${k}"><span>${i}</span>${l}</button>`).join('')}</div>`;
}

function teacherView() {
  if (S.mode === 'signup') {
    return `<h1>Öğretmen hesabı oluştur</h1><p class="muted">Okulunuzu ilk kez ekliyorsanız okul yöneticisi olarak kaydolursunuz. Okulunuz zaten kayıtlıysa yöneticinizden aldığınız davet kodunu kullanın.</p>
    ${msg()}<form id="f">
      <div class="fld"><label for="fn">Ad soyad</label><input class="in" id="fn" name="fullName" autocomplete="name" required></div>
      <div class="fld"><label for="em">E-posta</label><input class="in" id="em" name="email" type="email" autocomplete="email" required></div>
      <div class="fld"><label for="pw">Şifre (en az 8 karakter)</label><input class="in" id="pw" name="password" type="password" minlength="8" autocomplete="new-password" required></div>
      <label class="radio"><input type="radio" name="kind" value="new" checked><span><b>Okulumu ilk kez ekliyorum</b><br><span class="small muted">Okul yöneticisi olursunuz; şube açar, öğretmen davet edersiniz.</span></span></label>
      <label class="radio"><input type="radio" name="kind" value="invite"><span><b>Okulumdan davet kodum var</b><br><span class="small muted">Yöneticinizin verdiği 8 karakterlik kod.</span></span></label>
      <div class="fld" id="fSchool"><label for="sn">Okul adı</label><input class="in" id="sn" name="schoolName" placeholder="Örn. Atatürk Ortaokulu"></div>
      <div class="fld" id="fInvite" hidden><label for="ic">Okul davet kodu</label><input class="in code" id="ic" name="inviteCode" maxlength="8" autocapitalize="characters"></div>
      <button class="btn pri lg" style="width:100%" ${S.busy ? 'disabled' : ''}>${spin('Hesabı oluştur')}</button>
    </form><p class="small" style="margin-top:12px">Hesabınız var mı? <button class="toggle" data-mode="login">Giriş yapın</button></p>`;
  }
  return `<h1>Öğretmen girişi</h1><p class="muted">Öğretmen ve okul yöneticileri e-posta ile giriş yapar.</p>${msg()}
    <form id="f"><div class="fld"><label for="em">E-posta</label><input class="in" id="em" name="email" type="email" autocomplete="email" required></div>
    <div class="fld"><label for="pw">Şifre</label><input class="in" id="pw" name="password" type="password" autocomplete="current-password" required></div>
    <button class="btn pri lg" style="width:100%" ${S.busy ? 'disabled' : ''}>${spin('Giriş yap')}</button></form>
    ${forgotLink()}<p class="small" style="margin-top:4px">Hesabınız yok mu? <button class="toggle" data-mode="signup">Öğretmen hesabı oluşturun</button></p>`;
}

function studentView() {
  const st = S.stu;
  if (st.step === 'names') {
    return `<div class="stu-hd"><button class="btn sm" data-stu="back">← Geri</button><div><b>${esc(st.roster.section.name)}</b> <span class="muted small">· ${esc(st.roster.section.school)}</span></div></div>
      <h1 style="font-size:24px;margin-bottom:12px">Adını bul ve dokun</h1>${msg()}
      ${st.roster.students.length ? `<div class="names">${st.roster.students.map((s) => `<button data-pick="${s.id}">${esc(s.label)}</button>`).join('')}</div>`
        : '<p class="muted">Bu sınıfta henüz öğrenci yok. Öğretmenine söyle.</p>'}`;
  }
  if (st.step === 'pin') {
    const n = st.pin.length;
    return `<div class="stu-hd"><button class="btn sm" data-stu="names">← Geri</button><div>Merhaba <b>${esc(st.student.label)}</b> 👋</div></div>
      <h1 style="font-size:24px;text-align:center">4 haneli şifreni gir</h1>${msg()}
      <div class="pin-dots" aria-label="${n} rakam girildi">${[0, 1, 2, 3].map((i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>
      <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button data-d="${d}" ${S.busy ? 'disabled' : ''}>${d}</button>`).join('')}
        <button data-d="del" aria-label="Sil" ${S.busy ? 'disabled' : ''}>⌫</button><button data-d="0" ${S.busy ? 'disabled' : ''}>0</button>
        <button data-d="ok" aria-label="Giriş" ${S.busy || n < 4 ? 'disabled' : ''} style="background:var(--brand);color:#fff;border-color:var(--brand)">${S.busy ? '<span class="spinner" style="margin:auto"></span>' : '→'}</button></div>`;
  }
  return `<h1>Öğrenci girişi</h1><p class="muted">Öğretmeninin verdiği 6 harfli sınıf kodunu yaz.</p>${msg()}
    <form id="f"><div class="fld"><label for="cc" class="sr">Sınıf kodu</label><input class="in kod" id="cc" name="code" maxlength="6" autocomplete="off" autocapitalize="characters" value="${esc(st.code)}" required></div>
    <button class="btn pri lg" style="width:100%" ${S.busy ? 'disabled' : ''}>${spin('Devam')}</button></form>${forgotLink()}`;
}

function parentView() {
  if (S.mode === 'signup') {
    return `<h1>Veli hesabı oluştur</h1><p class="muted">Çocuğunuzun öğretmeninden aldığınız 8 karakterlik davet kodu gerekir.</p>${msg()}
    <form id="f"><div class="fld"><label for="ic">Davet kodu</label><input class="in code" id="ic" name="inviteCode" maxlength="8" autocapitalize="characters" required></div>
    <div class="fld"><label for="fn">Ad soyad</label><input class="in" id="fn" name="fullName" autocomplete="name" required></div>
    <div class="fld"><label for="rl">Yakınlık</label><select class="in" id="rl" name="relation"><option>Anne</option><option>Baba</option><option>Vasi</option><option>Diğer</option></select></div>
    <div class="fld"><label for="em">E-posta</label><input class="in" id="em" name="email" type="email" autocomplete="email" required></div>
    <div class="fld"><label for="pw">Şifre (en az 8 karakter)</label><input class="in" id="pw" name="password" type="password" minlength="8" autocomplete="new-password" required></div>
    <div class="consent" tabindex="0">${KVKK}</div>
    <label class="chk"><input type="checkbox" name="consent" required><span>Aydınlatma metnini okudum; çocuğumun verilerinin yukarıdaki amaçlarla işlenmesine açık rıza veriyorum.</span></label>
    <button class="btn pri lg" style="width:100%" ${S.busy ? 'disabled' : ''}>${spin('Hesabı oluştur')}</button></form>
    <p class="small" style="margin-top:12px">Hesabınız var mı? <button class="toggle" data-mode="login">Giriş yapın</button></p>`;
  }
  return `<h1>Veli girişi</h1>${msg()}
    <form id="f"><div class="fld"><label for="em">E-posta</label><input class="in" id="em" name="email" type="email" autocomplete="email" required></div>
    <div class="fld"><label for="pw">Şifre</label><input class="in" id="pw" name="password" type="password" autocomplete="current-password" required></div>
    <button class="btn pri lg" style="width:100%" ${S.busy ? 'disabled' : ''}>${spin('Giriş yap')}</button></form>
    ${forgotLink()}<p class="small" style="margin-top:4px">İlk kez mi geliyorsunuz? <button class="toggle" data-mode="signup">Davet koduyla hesap oluşturun</button></p>`;
}

async function signedInView(p) {
  app.innerHTML = `<h1>Hoş geldiniz</h1><p class="muted"><b>${esc(p.full_name)}</b> olarak giriş yaptınız (${ROLE_TR[p.role]}).</p>
    <div class="row" style="margin-top:14px"><a class="btn pri lg" href="${homeFor(p.role)}">Devam et</a><button class="btn" id="out">Çıkış yap</button></div>`;
  document.getElementById('out').onclick = () => signOut('/giris');
}

function draw() {
  app.innerHTML = roleTabs() + (S.mode === 'forgot' ? passwordResetView() : S.role === 'ogretmen' ? teacherView() : S.role === 'ogrenci' ? studentView() : parentView());
  const kind = app.querySelectorAll('input[name=kind]');
  kind.forEach((r) => r.addEventListener('change', () => {
    const inv = app.querySelector('input[name=kind]:checked').value === 'invite';
    app.querySelector('#fSchool').hidden = inv; app.querySelector('#fInvite').hidden = !inv;
  }));
  app.querySelector('#f')?.addEventListener('submit', onSubmit);
  app.querySelector('#forgot')?.addEventListener('submit', onForgotPassword);
  const first = app.querySelector('#f input');
  if (first && !S.msg) first.focus({ preventScroll: true });
}

app.addEventListener('click', async (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.role) { e.preventDefault(); history.replaceState(null, '', '#' + t.dataset.role); S.role = t.dataset.role; S.mode = 'login'; S.msg = null; S.resetSent = false; draw(); }
  else if (t.dataset.mode) { e.preventDefault(); S.mode = t.dataset.mode; S.msg = null; S.resetSent = false; draw(); }
  else if (t.dataset.stu) { S.stu.step = t.dataset.stu === 'back' ? 'code' : t.dataset.stu; S.stu.pin = ''; S.msg = null; draw(); }
  else if (t.dataset.pick) {
    S.stu.student = S.stu.roster.students.find((s) => s.id === t.dataset.pick); S.stu.step = 'pin'; S.stu.pin = ''; S.msg = null; draw();
  } else if (t.dataset.d) pinKey(t.dataset.d);
});
addEventListener('keydown', (e) => {
  if (S.role !== 'ogrenci' || S.stu.step !== 'pin') return;
  if (/^\d$/.test(e.key)) pinKey(e.key); else if (e.key === 'Backspace') pinKey('del'); else if (e.key === 'Enter') pinKey('ok');
});

function pinKey(k) {
  if (S.busy) return;
  const st = S.stu;
  if (k === 'del') st.pin = st.pin.slice(0, -1);
  else if (k === 'ok') { if (st.pin.length === 4) studentLogin(); return; }
  else if (st.pin.length < 4) st.pin += k;
  S.msg = null; draw();
  if (st.pin.length === 4) studentLogin();
}

async function run(fn) {
  S.busy = true; S.msg = null; draw();
  try { await fn(); } catch (err) { S.msg = { k: 'err', t: err.message || 'Bir sorun oluştu.' }; }
  S.busy = false; draw();
}

async function goHome() {
  const p = await currentProfile();
  if (!p) throw new Error('Hesabınız bir okula bağlı değil. Okul yöneticinizle görüşün.');
  location.href = homeFor(p.role);
}

async function onSubmit(e) {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  if (S.role === 'ogrenci') {
    const code = String(f.code || '').trim().toUpperCase();
    S.stu.code = code;
    return run(async () => {
      S.stu.roster = await callFn('ogrenci-sinif', { classCode: code });
      S.stu.step = 'names';
    });
  }
  if (S.mode === 'signup') {
    return run(async () => {
      if (S.role === 'ogretmen') {
        const invite = f.kind === 'invite';
        await callFn('kayit-ogretmen', { email: f.email, password: f.password, fullName: f.fullName,
          schoolName: invite ? '' : f.schoolName, inviteCode: invite ? f.inviteCode : '' });
      } else {
        await callFn('kayit-veli', { email: f.email, password: f.password, fullName: f.fullName,
          inviteCode: f.inviteCode, relation: f.relation, consent: f.consent === 'on' });
      }
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
      if (error) throw new Error('Hesap oluşturuldu ama giriş yapılamadı. Giriş ekranından deneyin.');
      await goHome();
    });
  }
  return run(async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: String(f.email).trim(), password: f.password });
    if (error) throw new Error(/invalid/i.test(error.message) ? 'E-posta veya şifre hatalı.' : 'Giriş yapılamadı. Biraz sonra yeniden deneyin.');
    await goHome();
  });
}

async function onForgotPassword(e) {
  e.preventDefault();
  const email = String(new FormData(e.target).get('email') || '').trim().toLowerCase();
  await run(async () => {
    const redirectTo = `${location.origin}/sifre-yenileme`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw new Error('Şifre yenileme e-postası gönderilemedi. E-posta adresini kontrol edip tekrar deneyin.');
    S.resetSent = true;
    S.msg = { k: 'ok', t: 'Şifre yenileme e-postası gönderildi. E-posta adresinizi kontrol edin.' };
  });
}

async function studentLogin() {
  const st = S.stu;
  await run(async () => {
    try {
      const r = await callFn('ogrenci-giris', { classCode: st.code, studentId: st.student.id, pin: st.pin });
      const { error } = await supabase.auth.setSession({ access_token: r.access_token, refresh_token: r.refresh_token });
      if (error) throw new Error('Oturum açılamadı.');
      location.href = '/ogrenci';
    } catch (err) { st.pin = ''; throw err; }
  });
}

const p = await currentProfile().catch(() => null);
if (p) signedInView(p); else draw();
