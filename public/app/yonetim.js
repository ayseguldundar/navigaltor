// Öğretmen / okul yöneticisi konsolu: şubeler, öğrenci listesi ve PIN kartları, veli davetleri, öğretmen davetleri, yapay zekâ kayıtları.
import { supabase, rpc, callFn, currentProfile, signOut, ROLE_TR, esc, changePasswordDialog } from './supa.js';
import { parseRoster } from './liste.js';
import { createEtkinlik } from './yonetim-etkinlik.js';

const COURSE = { GENEL: 'Genel / Sınıf rehberliği', MAT: 'Matematik', TUR: 'Türkçe', FEN: 'Fen Bilimleri', SOS: 'Sosyal Bilgiler', ING: 'İngilizce' };
const app = document.getElementById('app');
const dlg = document.getElementById('dlg');
const dlgBody = document.getElementById('dlgBody');
const S = { tab: 'subeler', ctx: null, me: null, sec: null, students: [], guardians: new Set(), invites: {}, teachers: [], tinv: [], gens: [], msg: null, busy: false, parsed: null };

const me = await currentProfile().catch(() => null);
if (!me || !['admin', 'teacher'].includes(me.role)) {
  location.replace(me ? (me.role === 'student' ? '/ogrenci' : '/veli') : '/giris#ogretmen');
  await new Promise(() => {}); // yönlendirme sürerken başka bir şey yapma
}
S.me = me;
const isAdmin = me.role === 'admin';
document.getElementById('who').innerHTML = `<span class="av">${esc(me.full_name.split(' ').map((p) => p[0]).join('').slice(0, 2))}</span>
  <span><b>${esc(me.full_name)}</b><small>${ROLE_TR[me.role]}</small></span>
  <a class="btn sm" href="/demo/ogretmen" title="Kurgusal verilerle tanıtım paneli">Demo</a><button class="btn sm" id="pwd">Şifre</button><button class="btn sm" id="out">Çıkış</button>`;
document.getElementById('out').onclick = () => signOut('/giris');
document.getElementById('pwd').onclick = () => changePasswordDialog(dlg, dlgBody);

const msg = () => (S.msg ? `<div class="msg ${S.msg.k}" role="status">${esc(S.msg.t)}</div>` : '');
const flash = (k, t) => { S.msg = { k, t }; draw(); setTimeout(() => { if (S.msg && S.msg.t === t) { S.msg = null; draw(); } }, 5000); };

const E = createEtkinlik({
  S, openDlg: (h) => openDlg(h), dlg, dlgBody, flash: (k, t) => flash(k, t), draw: () => draw(), msg: () => msg(),
  ensureStudents: async (force) => { if (force || S.studentsSec !== S.sec) await loadStudents(); },
});

async function loadCtx() {
  S.ctx = await rpc('my_context');
  document.getElementById('schoolName').textContent = S.ctx?.school?.name || '';
  if (!S.sec && S.ctx.sections.length) S.sec = S.ctx.sections[0].id;
}
async function loadStudents() {
  S.studentsSec = S.sec;
  if (!S.sec) { S.students = []; return; }
  const [st, g, inv] = await Promise.all([
    supabase.from('students').select('id, first_name, last_name, student_no, active, auth_user_id').eq('section_id', S.sec).order('student_no', { nullsFirst: false }).order('first_name'),
    supabase.from('guardians').select('student_id'),
    supabase.from('invites').select('code, student_id, used_at, expires_at').eq('kind', 'parent').is('used_at', null).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }),
  ]);
  if (st.error) throw new Error(st.error.message);
  S.students = st.data;
  S.guardians = new Set((g.data || []).map((x) => x.student_id));
  S.invites = {};
  (inv.data || []).forEach((x) => { if (!S.invites[x.student_id]) S.invites[x.student_id] = x.code; });
}
async function loadSchool() {
  const [t, i] = await Promise.all([
    supabase.from('profiles').select('id, full_name, role').in('role', ['admin', 'teacher', 'parent']).order('full_name'),
    supabase.from('invites').select('code, expires_at, created_at').eq('kind', 'teacher').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }),
  ]);
  S.teachers = (t.data || []).filter((x) => x.role !== 'parent'); S.parents = (t.data || []).filter((x) => x.role === 'parent'); S.tinv = i.data || [];
}

const tabs = () => `<div class="tabs" role="tablist" style="margin-bottom:16px">${[
  ['subeler', 'Şubelerim'], ['ogrenciler', 'Öğrenciler'], ['etkinlik', 'Etkinlikler'], ...(isAdmin ? [['okul', 'Okul ve öğretmenler']] : []),
].map(([k, l]) => `<button role="tab" aria-selected="${S.tab === k}" class="${S.tab === k ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div>`;

function viewSections() {
  const secs = S.ctx.sections;
  return `<div class="hero"><h1>Şubelerim</h1><span class="sp"></span><button class="btn pri" data-act="newSec">+ Yeni şube</button></div>${msg()}
  ${secs.length ? `<div class="grid">${secs.map((s) => `<div class="card sec-card">
      <div class="row"><h3>${esc(s.name)}</h3><span class="chip">${s.grade}. sınıf</span></div>
      <div class="small muted" style="margin-top:6px">Sınıf kodu (öğrenci girişi için)</div>
      <div class="row"><span class="code cc">${esc(s.class_code)}</span><button class="btn sm" data-copy="${esc(s.class_code)}">Kopyala</button></div>
      <div class="small muted" style="margin-top:8px">${s.student_count} öğrenci · ${s.courses.map((c) => COURSE[c.course] + (c.is_guidance ? ' (rehber)' : '')).join(', ') || 'Yönetici erişimi'}</div>
      <div class="row"><button class="btn sm" data-open="${s.id}">Öğrencileri yönet →</button></div></div>`).join('')}</div>`
    : `<div class="card empty"><div class="big">🏫</div><h3>Henüz şube yok</h3><p class="muted">İlk şubenizi açın; sistem öğrencilerin giriş yapacağı sınıf kodunu üretir.</p><button class="btn pri" data-act="newSec">+ Yeni şube</button></div>`}`;
}

function viewStudents() {
  const secs = S.ctx.sections;
  if (!secs.length) return `<div class="hero"><h1>Öğrenciler</h1></div><div class="card empty"><p class="muted">Önce bir şube açın.</p><button class="btn pri" data-tab="subeler">Şubelere git</button></div>`;
  const sec = secs.find((s) => s.id === S.sec) || secs[0];
  return `<div class="hero"><h1>Öğrenciler</h1><span class="sp"></span>
    <select class="in" style="width:auto" data-chg="sec" aria-label="Şube">${secs.map((s) => `<option value="${s.id}" ${s.id === sec.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
    <button class="btn pri" data-act="import">+ Öğrenci ekle</button></div>${msg()}
  <div class="card">
    <div class="row" style="margin-bottom:10px"><b>${esc(sec.name)}</b><span class="chip">Sınıf kodu: <span class="code">${esc(sec.class_code)}</span></span><span class="sp"></span>
      ${S.students.length ? '<button class="btn sm" data-act="printAll">PIN kartlarını yazdır</button>' : ''}</div>
    ${S.students.length ? `<div class="tw"><table class="t"><thead><tr><th>No</th><th>Ad soyad</th><th>Giriş</th><th>Veli</th><th></th></tr></thead><tbody>
      ${S.students.map((s) => `<tr style="${s.active ? '' : 'opacity:.5'}"><td>${esc(s.student_no || '—')}</td><td><button class="linkb" data-stu="${s.id}"><b>${esc(s.first_name)} ${esc(s.last_name)}</b></button>${s.active ? '' : ' <span class="chip">pasif</span>'}</td>
        <td>${s.auth_user_id ? '<span class="tag-ok">✓ giriş yaptı</span>' : '<span class="tag-no">henüz yok</span>'}</td>
        <td>${S.guardians.has(s.id) ? '<span class="tag-ok">✓ bağlı</span>' : S.invites[s.id] ? `<span class="code inv">${S.invites[s.id]}</span>` : `<button class="btn sm" data-pinv="${s.id}">Davet kodu üret</button>`}</td>
        <td style="white-space:nowrap"><button class="btn sm" data-pin="${s.id}">Yeni PIN</button> <button class="btn sm" data-tog="${s.id}">${s.active ? 'Pasif yap' : 'Etkinleştir'}</button>${isAdmin ? ` <button class="btn sm" data-sdel="${s.id}" title="KVKK: öğrencinin tüm verisini kalıcı olarak sil">Sil</button>` : ''}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="small muted">PIN'ler güvenlik için saklanmaz; yalnızca üretildiği anda gösterilir. Unutulan PIN için “Yeni PIN” kullanın. Veli davet kodu tek kullanımlıktır ve 30 gün geçerlidir.</p>`
    : `<div class="empty"><div class="big">🎒</div><p class="muted">Bu şubede öğrenci yok. Listeyi Excel'den kopyalayıp yapıştırabilirsiniz.</p><button class="btn pri" data-act="import">+ Öğrenci ekle</button></div>`}
  </div>`;
}

function viewSchool() {
  const secs = S.ctx.sections;
  return `<div class="hero"><h1>Okul ve öğretmenler</h1></div>${msg()}
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
    <div class="card"><h3>Öğretmen davet et</h3><p class="small muted">Öğretmen, giriş ekranında “Okulumdan davet kodum var” seçeneğiyle bu kodu girerek okulunuza katılır. Kod 30 gün geçerlidir ve birden fazla öğretmen kullanabilir.</p>
      ${S.tinv.length ? `<div class="row"><span class="code cc" style="font-size:22px;color:var(--brand)">${S.tinv[0].code}</span><button class="btn sm" data-copy="${S.tinv[0].code}">Kopyala</button></div>
        <p class="small muted">Son geçerlilik: ${new Date(S.tinv[0].expires_at).toLocaleDateString('tr-TR')}</p>` : ''}
      <button class="btn ${S.tinv.length ? '' : 'pri'}" data-act="tinv">${S.tinv.length ? 'Yeni kod üret' : 'Davet kodu üret'}</button></div>
    <div class="card"><h3>Öğretmeni şubeye ata</h3>
      ${S.teachers.length && secs.length ? `<form id="assign"><div class="fld"><label>Öğretmen</label><select class="in" name="teacher">${S.teachers.map((t) => `<option value="${t.id}">${esc(t.full_name)} (${ROLE_TR[t.role]})</option>`).join('')}</select></div>
        <div class="fld"><label>Şube</label><select class="in" name="section">${secs.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
        <div class="fld"><label>Ders</label><select class="in" name="course">${Object.entries(COURSE).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
        <label class="row small" style="margin-bottom:12px"><input type="checkbox" name="guidance"> Bu şubenin rehber öğretmeni</label>
        <button class="btn pri">Ata</button></form>` : '<p class="muted small">Önce şube açın ve öğretmen davet edin.</p>'}</div>
  </div>
  <div class="card" style="margin-top:14px"><h3>Okuldaki öğretmenler</h3><div class="tw"><table class="t"><thead><tr><th>Ad soyad</th><th>Rol</th><th></th></tr></thead><tbody>
    ${S.teachers.map((t) => `<tr><td>${esc(t.full_name)}</td><td>${ROLE_TR[t.role]}</td><td style="text-align:right">${t.id === S.me.id ? '<span class="small muted">siz</span>' : `<button class="btn sm" data-pwd="${t.id}">Şifre sıfırla</button>`}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="card" style="margin-top:14px"><h3>Veli hesapları</h3>
    ${(S.parents || []).length ? `<div class="tw"><table class="t"><thead><tr><th>Ad soyad</th><th></th></tr></thead><tbody>
    ${S.parents.map((t) => `<tr><td>${esc(t.full_name)}</td><td style="text-align:right"><button class="btn sm" data-pwd="${t.id}">Şifre sıfırla</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="small muted">Henüz veli hesabı yok. Veliler, öğrenci listesinde ürettiğiniz davet koduyla kaydolur.</p>'}
    <p class="small muted">Şifresini unutan öğretmen veya veli için geçici şifre üretin ve kişiye güvenli bir yoldan iletin. Kişi giriş yaptıktan sonra şifresini değiştirebilir. Öğrenciler için öğrenci listesindeki “Yeni PIN” kullanılır.</p></div>`;
}

function draw() {
  if (!S.ctx) return;
  const v = { subeler: viewSections, ogrenciler: viewStudents, okul: viewSchool, etkinlik: E.view }[S.tab] || viewSections;
  app.innerHTML = tabs() + v();
  app.querySelector('#assign')?.addEventListener('submit', onAssign);
}

async function go(tab) {
  S.tab = tab; S.msg = null;
  history.replaceState(null, '', '#' + tab);
  try {
    if (tab === 'ogrenciler') await loadStudents();
    if (tab === 'okul') await loadSchool();
    if (tab === 'etkinlik') await E.load();
  } catch (e) { S.msg = { k: 'err', t: e.message }; }
  draw();
}

// ---------------------------------------------------------------- olaylar
app.addEventListener('click', async (e) => {
  const b = e.target.closest('button,a[data-tab]');
  if (!b) return;
  const d = b.dataset;
  try {
    if (S.tab === 'etkinlik' && !d.tab && await E.onClick(e, b)) return;
    if (d.stu) { studentDialog(d.stu); return; }
    if (d.sdel) { deleteStudentDialog(d.sdel); return; }
    if (d.pwd) { resetPasswordDialog(d.pwd); return; }
    if (d.tab) { e.preventDefault(); await go(d.tab); }
    else if (d.copy) { await navigator.clipboard.writeText(d.copy).catch(() => {}); flash('ok', `“${d.copy}” kopyalandı.`); }
    else if (d.open) { S.sec = d.open; await go('ogrenciler'); }
    else if (d.act === 'newSec') newSectionDialog();
    else if (d.act === 'import') importDialog();
    else if (d.act === 'printAll') printCards(S.students.map((s) => ({ ...s, pin: null })), true);
    else if (d.act === 'tinv') { await rpc('create_teacher_invite'); await loadSchool(); flash('ok', 'Yeni öğretmen davet kodu üretildi.'); }
    else if (d.pin) {
      const s = S.students.find((x) => x.id === d.pin);
      if (!confirm(`${s.first_name} ${s.last_name} için yeni PIN üretilsin mi? Eski PIN geçersiz olur.`)) return;
      const pin = await rpc('reset_student_pin', { p_student: s.id });
      printCards([{ ...s, pin }], false);
    } else if (d.pinv) {
      await rpc('create_parent_invite', { p_student: d.pinv }); await loadStudents(); flash('ok', 'Veli davet kodu üretildi. Kodu veliye iletin.');
    } else if (d.tog) {
      const s = S.students.find((x) => x.id === d.tog);
      await rpc('update_student', { p_student: s.id, p_first_name: s.first_name, p_last_name: s.last_name, p_student_no: s.student_no || '', p_active: !s.active });
      await loadStudents(); await loadCtx(); draw();
    }
  } catch (err) { flash('err', err.message); }
});
app.addEventListener('input', (e) => { if (S.tab === 'etkinlik') E.onInput(e); });
app.addEventListener('change', async (e) => {
  if (S.tab === 'etkinlik') { try { if (await E.onChange(e)) return; } catch (err) { flash('err', err.message); return; } }
  if (e.target.dataset.chg === 'sec') { S.sec = e.target.value; await go('ogrenciler'); }
});

async function onAssign(e) {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  try {
    await rpc('add_teacher_to_section', { p_teacher: f.teacher, p_section: f.section, p_course: f.course, p_guidance: f.guidance === 'on' });
    await loadCtx(); flash('ok', 'Öğretmen şubeye atandı.');
  } catch (err) { flash('err', err.message); }
}

// ---------------------------------------------------------------- pencereler
function openDlg(html) { dlgBody.innerHTML = html; dlg.showModal(); }
dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });

function newSectionDialog() {
  openDlg(`<h2>Yeni şube</h2><p class="muted small">Şube açıldığında öğrencilerin giriş yapacağı 6 karakterlik sınıf kodu otomatik üretilir.</p>
  <form id="fs"><div class="row" style="align-items:flex-start">
    <div class="fld" style="flex:1"><label>Sınıf</label><select class="in" name="grade">${[5, 6, 7, 8].map((g) => `<option value="${g}" ${g === 7 ? 'selected' : ''}>${g}. sınıf</option>`).join('')}</select></div>
    <div class="fld" style="flex:1"><label>Şube adı</label><input class="in" name="name" placeholder="7/A" maxlength="20" required></div></div>
    <div class="fld"><label>Bu şubede okuttuğunuz ders</label><select class="in" name="course">${Object.entries(COURSE).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
    <label class="row small" style="margin-bottom:14px"><input type="checkbox" name="guidance"> Bu şubenin rehber öğretmeniyim</label>
    <div id="fsMsg"></div>
    <div class="row"><span class="sp"></span><button type="button" class="btn" data-close>Vazgeç</button><button class="btn pri">Şubeyi aç</button></div></form>`);
  dlgBody.querySelector('#fs').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    try {
      const s = await rpc('create_section', { p_grade: +f.grade, p_name: f.name, p_course: f.course, p_guidance: f.guidance === 'on' });
      dlg.close(); S.sec = s.id; await loadCtx(); flash('ok', `${s.name} açıldı. Sınıf kodu: ${s.class_code}`);
    } catch (err) {
      dlgBody.querySelector('#fsMsg').innerHTML = `<div class="msg err">${esc(/unique|duplicate/i.test(err.message) ? 'Bu adla bir şube zaten var.' : err.message)}</div>`;
    }
  });
}

function importDialog() {
  const sec = S.ctx.sections.find((s) => s.id === S.sec);
  openDlg(`<h2>${esc(sec.name)} şubesine öğrenci ekle</h2>
  <p class="muted small">Excel'deki listeyi (No, Ad, Soyad sütunları) kopyalayıp yapıştırın ya da her satıra bir öğrenci yazın: <span class="code" style="letter-spacing:0">12 Elif Yıldız</span>. CSV dosyası da yükleyebilirsiniz.</p>
  <textarea class="in" id="rt" placeholder="12&#9;Elif&#9;Yıldız&#10;13&#9;Can&#9;Demir"></textarea>
  <div class="row" style="margin-top:8px"><label class="btn sm">CSV dosyası seç<input type="file" accept=".csv,.txt" id="rf" class="sr"></label><span class="sp"></span><span class="small muted" id="rc"></span></div>
  <div class="preview" id="rp"></div><div id="rm"></div>
  <div class="row" style="margin-top:12px"><span class="sp"></span><button class="btn" data-close>Vazgeç</button><button class="btn pri" id="rgo" disabled>Ekle ve PIN üret</button></div>`);
  const ta = dlgBody.querySelector('#rt');
  const upd = () => {
    S.parsed = parseRoster(ta.value);
    dlgBody.querySelector('#rc').textContent = S.parsed.length ? `${S.parsed.length} öğrenci okundu` : '';
    dlgBody.querySelector('#rp').innerHTML = S.parsed.length ? `<table class="t"><thead><tr><th>No</th><th>Ad</th><th>Soyad</th></tr></thead><tbody>${S.parsed.slice(0, 60).map((r) =>
      `<tr><td>${esc(r.student_no || '—')}</td><td>${esc(r.first_name)}</td><td>${esc(r.last_name)}</td></tr>`).join('')}</tbody></table>` : '';
    dlgBody.querySelector('#rgo').disabled = !S.parsed.length || S.parsed.length > 60;
    dlgBody.querySelector('#rm').innerHTML = S.parsed.length > 60 ? '<div class="msg err">Bir seferde en fazla 60 öğrenci eklenebilir.</div>' : '';
  };
  ta.addEventListener('input', upd);
  dlgBody.querySelector('#rf').addEventListener('change', async (e) => { const f = e.target.files[0]; if (f) { ta.value = await f.text(); upd(); } });
  dlgBody.querySelector('#rgo').addEventListener('click', async (e) => {
    e.target.disabled = true; e.target.innerHTML = '<span class="spinner"></span> Ekleniyor…';
    try {
      const res = await rpc('import_students', { p_section: S.sec, p_rows: S.parsed });
      dlg.close(); await loadCtx(); await loadStudents(); draw();
      printCards(res, false);
    } catch (err) {
      dlgBody.querySelector('#rm').innerHTML = `<div class="msg err">${esc(err.message)}</div>`;
      e.target.disabled = false; e.target.textContent = 'Ekle ve PIN üret';
    }
  });
}

function printCards(list, noPins) {
  const sec = S.ctx.sections.find((s) => s.id === S.sec);
  const cards = `<div class="pin-cards">${list.map((s) => `<div class="pin-card"><div class="small muted">NavigAItor · ${esc(sec.name)}</div>
    <b>${esc(s.first_name)} ${esc(s.last_name)}</b>
    <div class="small" style="margin-top:6px">1. ${esc(location.host)}/giris adresine gir<br>2. Sınıf kodu: <span class="code">${esc(sec.class_code)}</span><br>3. Adını seç, şifreni gir</div>
    <div class="small muted" style="margin-top:6px">Şifre</div><div class="code pin">${s.pin ? esc(s.pin) : '_ _ _ _'}</div></div>`).join('')}</div>`;
  openDlg(`<h2>${noPins ? 'Giriş kartları' : 'Öğrenci şifreleri hazır'}</h2>
    <p class="muted small">${noPins ? "PIN'ler saklanmadığı için kartlarda boş bırakıldı; öğrenciye ayrıca iletin ya da “Yeni PIN” üretin." : "Bu şifreler yalnızca şimdi görünür. Yazdırın veya öğrencilere iletin; pencere kapandıktan sonra yeniden gösterilemez."}</p>
    ${cards}<div class="row" style="margin-top:14px"><span class="sp"></span><button class="btn" data-close>Kapat</button><button class="btn pri" id="pp">Yazdır</button></div>`);
  dlgBody.querySelector('#pp').addEventListener('click', () => {
    const pa = document.getElementById('printArea'); pa.innerHTML = cards; dlg.close(); window.print();
    setTimeout(() => { pa.innerHTML = ''; }, 500);
  });
}

async function studentDialog(id) {
  const s = S.students.find((x) => x.id === id);
  openDlg(`<h2>${esc(s.first_name)} ${esc(s.last_name)}</h2><p class="muted small">Yükleniyor…</p>`);
  const [ir, as, sb] = await Promise.all([
    supabase.from('intake_responses').select('answers, completed, updated_at').eq('student_id', id).maybeSingle(),
    supabase.from('assignments').select('id, title, course, due_date, activity').eq('section_id', S.sec).eq('archived', false).order('created_at', { ascending: false }),
    supabase.from('submissions').select('assignment_id, status, checklist, completed_at, reflection').eq('student_id', id),
  ]);
  const ozet = ir.data ? window.tanismaOzet(ir.data.answers).filter((x) => x.a) : [];
  const skills = {};
  (as.data || []).forEach((a) => { const x = (sb.data || []).find((y) => y.assignment_id === a.id); if (x && x.status === 'tamamlandi') (a.activity.skills21 || []).forEach((k) => { skills[k] = (skills[k] || 0) + 1; }); });
  const done = (sb.data || []).filter((x) => x.status === 'tamamlandi').length;
  dlgBody.innerHTML = `<h2>${esc(s.first_name)} ${esc(s.last_name)}</h2>
    <p class="small muted">${s.student_no ? 'No ' + esc(s.student_no) + ' · ' : ''}${s.auth_user_id ? 'Sisteme giriş yaptı' : 'Henüz giriş yapmadı'} · Veli: ${S.guardians.has(s.id) ? 'bağlı' : 'bağlı değil'}</p>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin:12px 0"><div class="card"><div class="small muted">Atanan etkinlik</div><b style="font-size:24px">${(as.data || []).length}</b></div>
      <div class="card"><div class="small muted">Tamamlanan</div><b style="font-size:24px">${done}</b></div></div>
    <h3>Çalıştığı 21. yüzyıl becerileri</h3><p class="small">${Object.keys(skills).length ? Object.entries(skills).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<span class="chip">${esc(k)} · ${n}</span>`).join(' ') : '<span class="muted">Henüz tamamlanan etkinlik yok.</span>'}</p>
    <h3 style="margin-top:12px">Etkinlikler</h3><div class="tw"><table class="t"><tbody>${(as.data || []).map((a) => { const x = (sb.data || []).find((y) => y.assignment_id === a.id);
      return `<tr><td>${esc(a.title)}</td><td>${x ? (x.status === 'tamamlandi' ? '<span class="tag-ok">Tamamladı</span>' : '<span class="tag-mid">Devam ediyor</span>') : '<span class="tag-no">Başlamadı</span>'}</td><td class="small">${x && x.reflection ? esc(x.reflection) : ''}</td></tr>`; }).join('') || '<tr><td class="muted">Atama yok.</td></tr>'}</tbody></table></div>
    <h3 style="margin-top:12px">Navi tanışma formu</h3>${ozet.length ? `<div class="ozet">${ozet.map((x) => `<div><span>${esc(x.q)}</span><b>${esc(x.a)}</b></div>`).join('')}</div>` : '<p class="small muted">Öğrenci formu henüz doldurmadı.</p>'}
    <div class="row" style="margin-top:14px"><span class="sp"></span><button class="btn" data-close>Kapat</button></div>`;
}

function deleteStudentDialog(id) {
  const s = S.students.find((x) => x.id === id);
  openDlg(`<h2>Öğrenci verisini kalıcı olarak sil</h2>
    <p><b>${esc(s.first_name)} ${esc(s.last_name)}</b> için tüm kayıtlar silinir: giriş hesabı, etkinlik teslimleri, tanışma formu, veli bağlantısı ve onay kayıtları. Bu işlem geri alınamaz.</p>
    <p class="small muted">KVKK kapsamında veli talebiyle ya da öğrencinin okuldan ayrılmasıyla kullanılır. Yalnızca öğrenciyi geçici olarak kapatmak için “Pasif yap” yeterlidir.</p>
    <div class="fld"><label for="cfm">Onaylamak için öğrencinin adını yazın: <b>${esc(s.first_name)}</b></label><input class="in" id="cfm" autocomplete="off"></div><div id="delMsg"></div>
    <div class="row"><span class="sp"></span><button class="btn" data-close>Vazgeç</button><button class="btn pri" id="delGo" disabled>Kalıcı olarak sil</button></div>`);
  const inp = dlgBody.querySelector('#cfm'), go = dlgBody.querySelector('#delGo');
  inp.addEventListener('input', () => { go.disabled = inp.value.trim().toLocaleLowerCase('tr') !== s.first_name.toLocaleLowerCase('tr'); });
  go.addEventListener('click', async () => {
    go.disabled = true; go.innerHTML = '<span class="spinner"></span> Siliniyor…';
    try {
      await callFn('veri-sil', { studentId: id }, { auth: true });
      dlg.close(); await loadStudents(); await loadCtx(); flash('ok', 'Öğrencinin tüm verisi silindi.');
    } catch (err) { dlgBody.querySelector('#delMsg').innerHTML = `<div class="msg err">${esc(err.message)}</div>`; go.disabled = false; go.textContent = 'Kalıcı olarak sil'; }
  });
}

function resetPasswordDialog(id) {
  const p = [...S.teachers, ...(S.parents || [])].find((x) => x.id === id);
  openDlg(`<h2>Geçici şifre üret</h2><p><b>${esc(p.full_name)}</b> (${ROLE_TR[p.role]}) için yeni bir geçici şifre üretilecek. Eski şifre geçersiz olur ve açık oturumları kapanır.</p>
    <div id="pwMsg"></div><div class="row"><span class="sp"></span><button class="btn" data-close>Vazgeç</button><button class="btn pri" id="pwGo">Geçici şifre üret</button></div>`);
  const go = dlgBody.querySelector('#pwGo');
  go.addEventListener('click', async () => {
    go.disabled = true; go.innerHTML = '<span class="spinner"></span> Üretiliyor…';
    try {
      const r = await callFn('sifre-sifirla', { userId: id }, { auth: true });
      dlgBody.innerHTML = `<h2>Geçici şifre hazır</h2><p><b>${esc(p.full_name)}</b> bu şifreyle giriş yapabilir:</p>
        <div class="row"><span class="code cc" style="font-size:22px;color:var(--brand)">${esc(r.password)}</span><button class="btn sm" data-copy="${esc(r.password)}">Kopyala</button></div>
        <p class="small muted">Şifre yalnızca şimdi görünür ve saklanmaz. Kişiye yüz yüze ya da güvenli bir kanaldan iletin.</p>
        <div class="row"><span class="sp"></span><button class="btn pri" data-close>Tamam</button></div>`;
      dlgBody.querySelector('[data-copy]').addEventListener('click', (e) => navigator.clipboard.writeText(e.target.dataset.copy).catch(() => {}));
    } catch (err) { dlgBody.querySelector('#pwMsg').innerHTML = `<div class="msg err">${esc(err.message)}</div>`; go.disabled = false; go.textContent = 'Geçici şifre üret'; }
  });
}

// ---------------------------------------------------------------- başlat
try {
  await loadCtx();
  const h = location.hash.replace('#', '');
  const valid = (x) => ['subeler', 'ogrenciler', 'okul', 'etkinlik'].includes(x) && (x !== 'okul' || isAdmin);
  await go(valid(h) ? h : 'subeler');
  addEventListener('hashchange', () => { const x = location.hash.replace('#', ''); if (valid(x) && x !== S.tab) go(x); });
} catch (err) {
  app.innerHTML = `<div class="card"><div class="msg err">${esc(err.message)}</div></div>`;
}
