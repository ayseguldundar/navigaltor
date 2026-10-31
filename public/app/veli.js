// Veli uygulaması (gerçek veri): bağlı çocuklar, atanan ve tamamlanan etkinlikler, çalışılan beceriler, çocuk ekleme.
// Karşılaştırma ve sıralama gösterilmez; yalnızca çocuğun kendi gelişimi.
import { showOffline, supabase, callFn, currentProfile, homeFor, signOut, esc, changePasswordDialog, dbError } from './supa.js';
import { KVKK } from './kvkk.js';

const COURSE = { MAT: 'Matematik', TUR: 'Türkçe', FEN: 'Fen Bilimleri', SOS: 'Sosyal Bilgiler', ING: 'İngilizce' };
const app = document.getElementById('app');
const dlg = document.getElementById('dlg');
const dlgBody = document.getElementById('dlgBody');
const S = { kids: [], cur: null, assigns: [], subs: [], sections: {} };
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) : '');

let me = null;
try { me = await currentProfile(); } catch (err) { showOffline(document.getElementById('app'), err.message); await new Promise(() => {}); }
if (!me || me.role !== 'parent') {
  location.replace(me ? homeFor(me.role) : '/giris#veli');
  await new Promise(() => {});
}
document.getElementById('who').innerHTML = `<span class="small"><b>${esc(me.full_name)}</b></span><button class="btn sm" data-add>+ Çocuk ekle</button><button class="btn sm" data-pwd>Şifre</button><button class="btn sm" id="out">Çıkış</button>`;
document.getElementById('out').onclick = () => signOut('/giris#veli');

async function load() {
  const [k, a, s, sec] = await Promise.all([
    supabase.from('students').select('id, first_name, last_name, section_id').order('first_name'),
    supabase.from('assignments').select('id, section_id, title, course, due_date, created_at, activity').eq('archived', false).order('created_at', { ascending: false }),
    supabase.from('submissions').select('assignment_id, student_id, status, checklist, reflection, teacher_feedback, completed_at'),
    supabase.from('sections').select('id, name'),
  ]);
  if (k.error || a.error || s.error || sec.error) { S.kids = []; S.assigns = []; S.subs = []; S.sections = {}; throw dbError(k.error || a.error || s.error || sec.error, 'Çocuk ve etkinlik bilgileri şu an yüklenemedi. Lütfen tekrar deneyin.'); }
  S.kids = k.data || [];
  S.assigns = a.data || [];
  S.subs = s.data || [];
  S.sections = Object.fromEntries((sec.data || []).map((x) => [x.id, x.name]));
  if (!S.cur || !S.kids.find((x) => x.id === S.cur)) S.cur = S.kids[0] && S.kids[0].id;
}

function view() {
  if (!S.kids.length) return `<div class="card empty"><h3>Henüz bağlı çocuk yok</h3><p class="muted">Öğretmenden aldığınız davet koduyla çocuğunuzu ekleyin.</p><button class="btn pri" data-add>+ Çocuk ekle</button></div>`;
  const kid = S.kids.find((x) => x.id === S.cur);
  const list = S.assigns.filter((a) => a.section_id === kid.section_id);
  const sub = (a) => S.subs.find((x) => x.assignment_id === a.id && x.student_id === kid.id);
  const done = list.filter((a) => (sub(a) || {}).status === 'tamamlandi');
  const going = list.filter((a) => (sub(a) || {}).status === 'devam');
  const skills = {};
  done.forEach((a) => (a.activity.skills21 || []).forEach((k) => { skills[k] = (skills[k] || 0) + 1; }));
  const feedbacks = list.map((a) => ({ a, s: sub(a) })).filter((x) => x.s && x.s.teacher_feedback);
  return `${S.kids.length > 1 ? `<div class="tabs" style="margin-bottom:14px">${S.kids.map((k) => `<button class="${k.id === S.cur ? 'on' : ''}" data-kid="${k.id}">${esc(k.first_name)}</button>`).join('')}</div>` : ''}
    <div class="kid"><span class="av">${window.stuEmoji(56)}</span><div><h1 style="font-size:28px">${esc(kid.first_name)} ${esc(kid.last_name)}</h1><span class="muted">${esc(S.sections[kid.section_id] || '')}</span></div></div>
    <div class="kpis"><div class="card"><div class="small muted">Atanan etkinlik</div><b>${list.length}</b></div><div class="card"><div class="small muted">Tamamlanan</div><b>${done.length}</b></div><div class="card"><div class="small muted">Devam eden</div><b>${going.length}</b></div></div>
    <div class="card" style="margin-bottom:14px"><h3>Çalıştığı 21. yüzyıl becerileri</h3>
      <p class="small">${Object.keys(skills).length ? Object.entries(skills).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<span class="chip">${esc(k)} · ${n} etkinlik</span>`).join(' ') : '<span class="muted">Tamamlanan etkinlik oldukça burada çocuğunuzun hangi becerileri çalıştığını göreceksiniz.</span>'}</p></div>
    ${feedbacks.length ? `<div class="card" style="margin-bottom:14px"><h3>Öğretmen notları</h3>${feedbacks.slice(0, 5).map((x) => `<div class="note"><b>${esc(x.a.title)}:</b> ${esc(x.s.teacher_feedback)}</div>`).join('')}</div>` : ''}
    <div class="card"><h3>Etkinlikler</h3>${list.length ? `<div class="list">${list.map((a) => { const s = sub(a); const st = s ? s.status : 'yeni';
      return `<button class="it" data-open="${a.id}"><span><b>${esc(a.title)}</b><small>${COURSE[a.course] || ''}${a.due_date ? ' · Teslim: ' + fmtDate(a.due_date) : ''}</small></span><span class="st ${st === 'tamamlandi' ? 'ok' : st === 'devam' ? 'devam' : 'yeni'}">${st === 'tamamlandi' ? 'Tamamladı' : st === 'devam' ? 'Devam ediyor' : 'Başlamadı'}</span></button>`; }).join('')}</div>`
      : '<p class="muted small">Henüz atanmış etkinlik yok.</p>'}</div>
    <p class="small muted" style="margin-top:14px">NavigAItor çocuğunuzu başka öğrencilerle karşılaştırmaz ve sıralamaz; burada yalnızca kendi ilerlemesini görürsünüz.</p>`;
}
function draw() { app.innerHTML = view(); }

function openActivity(id) {
  const a = S.assigns.find((x) => x.id === id);
  const kid = S.kids.find((x) => x.id === S.cur);
  const s = S.subs.find((x) => x.assignment_id === id && x.student_id === kid.id);
  dlgBody.innerHTML = `<div class="row" style="margin-bottom:10px"><span class="sp"></span><button class="btn sm" data-close>Kapat</button></div>
    ${s && s.reflection ? `<div class="note" style="margin-bottom:10px"><b>${esc(kid.first_name)}'nin notu:</b> ${esc(s.reflection)}</div>` : ''}
    ${s && s.teacher_feedback ? `<div class="note" style="margin-bottom:10px"><b>Öğretmen notu:</b> ${esc(s.teacher_feedback)}</div>` : ''}
    <div class="home-tip" style="margin-bottom:10px">🏠 <span><b>Evde destek:</b> Çocuğunuza etkinliğin senaryosunu kendi cümleleriyle anlatmasını isteyin; cevabı söylemek yerine “Nasıl düşündün?” diye sorun.</span></div>
    ${window.renderEtkinlik(a.activity, { role: 'veli', checked: s ? s.checklist : [], key: 'v-' + id })}`;
  dlg.showModal();
}

function addChildDialog() {
  dlgBody.innerHTML = `<h2>Çocuk ekle</h2><p class="muted small">Öğretmenden aldığınız 8 karakterlik davet kodunu yazın.</p>
    <form id="fk"><div class="fld"><label for="ic">Davet kodu</label><input class="in code" id="ic" maxlength="8" required autocapitalize="characters"></div>
    <div class="fld"><label for="rl">Yakınlık</label><select class="in" id="rl"><option>Anne</option><option>Baba</option><option>Vasi</option><option>Diğer</option></select></div>
    <label class="row small" style="margin-bottom:12px;align-items:flex-start"><input type="checkbox" id="cs" required style="margin-top:3px"> <span>Aydınlatma metnini okudum; bu çocuğun verilerinin eğitim amacıyla işlenmesine açık rıza veriyorum.</span></label>
    <details class="small" style="margin:-4px 0 12px"><summary>Aydınlatma metnini oku</summary><div class="consent" style="max-height:220px;overflow:auto;padding:10px;border:1px solid var(--line);border-radius:10px;margin-top:6px">${KVKK}</div></details>
    <div id="fkMsg"></div><div class="row"><span class="sp"></span><button type="button" class="btn" data-close>Vazgeç</button><button class="btn pri">Ekle</button></div></form>`;
  dlg.showModal();
  dlgBody.querySelector('#fk').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await callFn('kayit-veli', { mode: 'link', inviteCode: dlgBody.querySelector('#ic').value, relation: dlgBody.querySelector('#rl').value, consent: dlgBody.querySelector('#cs').checked }, { auth: true });
      const before = new Set(S.kids.map((k) => k.id)); dlg.close(); await load(); S.cur = (S.kids.find((k) => !before.has(k.id)) || S.kids[S.kids.length - 1]).id; draw();
    } catch (err) { dlgBody.querySelector('#fkMsg').innerHTML = `<div class="msg err">${esc(err.message)}</div>`; }
  });
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.kid) { S.cur = b.dataset.kid; draw(); }
  else if (b.dataset.open) openActivity(b.dataset.open);
  else if ('add' in b.dataset) addChildDialog();
  else if ('pwd' in b.dataset) changePasswordDialog(dlg, dlgBody);
  else if ('close' in b.dataset) dlg.close();
});
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

try { await load(); draw(); } catch (err) { app.innerHTML = `<div class="card"><div class="msg err">${esc(err.message)}</div></div>`; }
