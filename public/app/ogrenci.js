// Öğrenci uygulaması (gerçek veri): Navi tanışma formu, görevlerim, etkinlik sayfası ve tamamlama.
import { showOffline, supabase, rpc, currentProfile, homeFor, signOut, esc, dbError } from './supa.js';

const COURSE = { MAT: ['Matematik', '#B3123A', '📐'], TUR: ['Türkçe', '#E07A2F', '📖'], FEN: ['Fen Bilimleri', '#1F9D6B', '🔬'], SOS: ['Sosyal Bilgiler', '#6A55C8', '🌍'], ING: ['İngilizce', '#2F7DD8', '💬'] };
const app = document.getElementById('app');
const ob = document.getElementById('obLayer');
const S = { me: null, student: null, section: null, assigns: [], subs: {}, intake: null, ob: null, saving: false };
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) : '');

let me = null;
try { me = await currentProfile(); } catch (err) { showOffline(document.getElementById('app'), err.message); await new Promise(() => {}); }
if (!me || me.role !== 'student') {
  location.replace(me ? homeFor(me.role) : '/giris#ogrenci');
  await new Promise(() => {});
}
S.me = me;

async function load() {
  const [st, as, sb, ir] = await Promise.all([
    supabase.from('students').select('id, first_name, last_name, section_id').eq('auth_user_id', me.id).maybeSingle(),
    supabase.from('assignments').select('id, title, course, grade, due_date, created_at, activity').eq('archived', false).order('created_at', { ascending: false }),
    supabase.from('submissions').select('assignment_id, status, checklist, reflection, teacher_feedback, completed_at'),
    supabase.from('intake_responses').select('answers, completed').maybeSingle(),
  ]);
  if ([st, as, sb, ir].some((r) => r.error)) { S.student = null; S.assigns = []; S.subs = {}; S.intake = null; throw dbError(st.error || as.error || sb.error || ir.error, 'Görevlerin şu an yüklenemedi. Lütfen tekrar dene.'); }
  if (!st.data) throw new Error('Öğrenci kaydın bulunamadı. Öğretmenine söyle.');
  S.student = st.data;
  S.assigns = as.data || [];
  S.subs = Object.fromEntries((sb.data || []).map((x) => [x.assignment_id, x]));
  S.intake = ir.data || null;
  const sec = await supabase.from('sections').select('name, grade').eq('id', S.student.section_id).maybeSingle();
  if (sec.error) { S.section = null; throw dbError(sec.error, 'Şube bilgilerin şu an yüklenemedi. Lütfen tekrar dene.'); }
  S.section = sec.data;
}

const nick = () => {
  const a = S.intake && S.intake.answers && S.intake.answers[0];
  return (a && typeof a.v === 'string' && a.v.trim()) || S.student.first_name;
};

function header() {
  document.getElementById('me').innerHTML = `<span class="av">${window.stuEmoji(42)}</span><span class="small"><b>${esc(nick())}</b><br><span class="muted">${esc(S.section ? S.section.name : '')}</span></span>
    <button class="btn sm" data-act-ob="edit" title="Navi tanışma formu" aria-label="Navi tanışma formu">👋<span class="lbl"> Tanışma formu</span></button><button class="btn sm" id="out">Çıkış</button>`;
  document.getElementById('out').onclick = () => signOut('/giris#ogrenci');
}

// ---------------------------------------------------------------- görevlerim
function statusOf(a) {
  const x = S.subs[a.id];
  return x ? x.status : 'yeni';
}
function taskRow(a) {
  const c = COURSE[a.course] || COURSE.MAT, st = statusOf(a);
  const late = a.due_date && st !== 'tamamlandi' && new Date(a.due_date) < new Date(new Date().toDateString());
  return `<a class="task" href="#etkinlik/${a.id}"><span class="ic" style="background:${c[1]}">${c[2]}</span>
    <span><b>${esc(a.title)}</b><small>${c[0]}${a.due_date ? ` · Teslim: ${fmtDate(a.due_date)}${late ? ' (süresi geçti)' : ''}` : ''}</small></span>
    <span class="st ${st === 'tamamlandi' ? 'ok' : st === 'devam' ? 'devam' : 'yeni'}">${st === 'tamamlandi' ? 'Tamamladın ✓' : st === 'devam' ? 'Devam ediyor' : 'Yeni'}</span></a>`;
}
function viewHome() {
  const todo = S.assigns.filter((a) => statusOf(a) !== 'tamamlandi')
    .sort((a, b) => (a.due_date || '9999') < (b.due_date || '9999') ? -1 : 1);
  const done = S.assigns.filter((a) => statusOf(a) === 'tamamlandi');
  const n = todo.length;
  return `<section class="hi"><img src="${window.NAVI.happy}" alt="Navi"><div><h1>Merhaba ${esc(nick())}!</h1>
    <p>${n ? `Bugün seni bekleyen ${n} etkinlik var. Hadi birlikte bakalım.` : 'Şu an bekleyen etkinliğin yok. Öğretmenin yeni etkinlik eklediğinde burada göreceksin.'}</p></div></section>
    <h2 class="sec-t">Yapılacaklar</h2>
    ${todo.length ? `<div class="tasks">${todo.map(taskRow).join('')}</div>` : '<div class="card"><p class="muted">Yapılacak etkinlik yok. 🎉</p></div>'}
    ${done.length ? `<h2 class="sec-t">Tamamladıkların</h2><div class="tasks">${done.map(taskRow).join('')}</div>` : ''}`;
}

// ---------------------------------------------------------------- etkinlik
function viewTask(id) {
  const a = S.assigns.find((x) => x.id === id);
  if (!a) return '<div class="card"><p>Bu etkinlik bulunamadı.</p><a class="btn" href="#">← Görevlerim</a></div>';
  const sb = S.subs[id] || { checklist: [], status: 'yeni', reflection: '' };
  const total = (a.activity.checklist || []).length;
  const all = (sb.checklist || []).length >= total;
  return `<div class="row" style="margin-bottom:12px"><a class="btn sm" href="#">← Görevlerim</a><span class="sp"></span>${a.due_date ? `<span class="chip">Teslim: ${fmtDate(a.due_date)}</span>` : ''}</div>
    ${sb.status === 'tamamlandi' ? `<div class="celebrate"><img src="${window.NAVI.excited}" alt=""><span>Harika! Bu etkinliği tamamladın. İstersen notunu güncelleyebilirsin.</span></div>` : ''}
    ${sb.teacher_feedback ? `<div class="fb">💬 <span><b>Öğretmeninin notu:</b> ${esc(sb.teacher_feedback)}</span></div>` : ''}
    ${window.renderEtkinlik(a.activity, { role: 'ogrenci', checked: sb.checklist, key: 'o-' + a.id })}
    <section class="done-box"><h3>Bu etkinlikte ne öğrendin?</h3><p class="small muted">Bir iki cümle yeter. Öğretmenin ve velin görebilir.</p>
      <textarea class="in" id="refl" maxlength="600" style="font-family:inherit;min-height:80px" placeholder="Örn. Önce paydaları eşitlemem gerektiğini fark ettim.">${esc(sb.reflection || '')}</textarea>
      <div class="row" style="margin-top:10px"><span class="small muted" id="saveMsg"></span><span class="sp"></span>
        <button class="btn" data-save="${id}">Kaydet</button>
        <button class="btn pri lg" data-done="${id}" ${all ? '' : 'disabled'} title="${all ? '' : 'Önce kontrol listesindeki maddeleri işaretle'}">${sb.status === 'tamamlandi' ? 'Güncelle ✓' : 'Etkinliği tamamladım'}</button></div>
      ${all ? '' : `<p class="small muted">Tamamlamak için kontrol listesindeki ${total} maddenin hepsini işaretle.</p>`}</section>`;
}

async function save(id, status) {
  const a = S.assigns.find((x) => x.id === id);
  const checked = [...app.querySelectorAll('[data-ek-chk]:checked')].map((x) => +x.dataset.ekChk);
  const refl = (app.querySelector('#refl') || {}).value || '';
  const r = await rpc('save_submission', { p_assignment: a.id, p_checklist: checked, p_status: status, p_reflection: refl });
  S.subs[id] = r;
}

// ---------------------------------------------------------------- tanışma formu
function obDraw() {
  const st = S.ob;
  if (!st) { ob.innerHTML = ''; document.body.style.overflow = ''; return; }
  document.body.style.overflow = 'hidden';
  const Q = window.OB_Q, i = st.i;
  let inner;
  if (i < 0) inner = `<div class="ob-intro"><img src="${window.NAVI.happy}" alt="Navi" style="width:150px;height:170px;object-fit:cover;object-position:50% 12%;border-radius:24px;background:#F8EEDF"><h2 id="obT">${esc(window.OB_INTRO_T)}</h2><p>${esc(window.OB_INTRO)}</p><button class="btn pri lg ob-go" data-ob="next">Hadi başlayalım</button></div>`;
  else if (i >= Q.length) inner = `<div class="ob-intro"><img src="${window.NAVI.excited}" alt="Navi" style="width:150px;height:170px;object-fit:cover;object-position:50% 12%;border-radius:24px;background:#F8EEDF"><p class="ob-endt" id="obT">${esc(window.OB_END)}</p><button class="btn pri lg ob-go" data-ob="close">Kapat</button></div>`;
  else {
    const q = Q[i], a = st.a[i] || {};
    const sel = (o) => (Array.isArray(a.v) ? a.v.includes(o) : a.v === o);
    const opts = q.t === 'text' || q.t === 'long'
      ? (q.t === 'text' ? `<input class="in ob-in" id="obTxt" maxlength="60" value="${esc(a.v || '')}">` : `<textarea class="in ob-in" id="obTxt" maxlength="800" style="font-family:inherit">${esc(a.v || '')}</textarea>`)
      : `<div class="ob-opts ${q.t}">${q.o.map((o) => `<button class="ob-opt ${sel(o) ? 'on' : ''}" data-ob="pick" data-v="${esc(o)}"><span class="ob-mk">${sel(o) ? '✓' : ''}</span>${esc(o.replace(/: …$/, ''))}</button>`).join('')}</div>
        ${q.o.some((o) => window.isOther(o) && sel(o)) ? `<input class="in ob-in" id="obOther" placeholder="Yazmak istersen…" maxlength="80" value="${esc(a.other || '')}">` : ''}`;
    inner = `<div class="ob-top"><span class="ob-n">${i + 1} / ${Q.length}</span><span class="ob-bar"><i style="width:${((i + 1) / Q.length) * 100}%"></i></span><button class="btn sm" data-ob="later" aria-label="Sonra devam et">✕</button></div>
      <div class="ob-q"><div><h2 id="obT">${esc(q.q)}</h2>${q.h ? `<p class="ob-h">${esc(q.h)}</p>` : ''}</div></div>${opts}
      <div class="ob-foot">${st.err ? `<div class="msg err" role="alert">${esc(st.err)} Cevapların korundu; tekrar deneyebilirsin.</div>` : ''}${i > 0 ? '<button class="btn" data-ob="back">← Geri</button>' : '<span></span>'}<span class="sp"></span><button class="btn" data-ob="skip">Bu soruyu geç</button><button class="btn pri" data-ob="next">${i === Q.length - 1 ? 'Bitir' : 'Devam'} →</button></div>`;
  }
  ob.innerHTML = `<div class="ob-scrim"></div><div class="ob-card" role="dialog" aria-modal="true" aria-labelledby="obT">${inner}</div>`;
  (ob.querySelector('#obTxt') || ob.querySelector('.ob-go') || ob.querySelector('.btn.pri'))?.focus();
}
function obCapture() {
  const st = S.ob, Q = window.OB_Q;
  if (st.i < 0 || st.i >= Q.length) return;
  const q = Q[st.i];
  const t = ob.querySelector('#obTxt');
  if (t) { if (t.value.trim()) st.a[st.i] = { v: t.value.trim() }; else delete st.a[st.i]; }
  const o = ob.querySelector('#obOther');
  if (o && st.a[st.i]) st.a[st.i].other = o.value.trim();
  if (q.t === 'one' || q.t === 'multi') { /* seçimler tıklamada kaydedildi */ }
}
async function obPersist(completed) {
  try { await rpc('save_intake', { p_answers: S.ob.a, p_completed: completed }); S.intake = { answers: { ...S.ob.a }, completed: completed || (S.intake && S.intake.completed) }; S.ob.err = ''; return true; }
  catch { S.ob.err = 'Cevapların sunucuya kaydedilemedi.'; return false; }
}
ob.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-ob]');
  if (!b || !S.ob) return;
  const st = S.ob, Q = window.OB_Q, act = b.dataset.ob;
  if (act === 'pick') {
    const q = Q[st.i], v = b.dataset.v;
    if (q.t === 'one') st.a[st.i] = { v };
    else {
      const cur = Array.isArray(st.a[st.i] && st.a[st.i].v) ? st.a[st.i].v : [];
      const max = /En fazla iki/.test(q.h || '') ? 2 : 99;
      const next = cur.includes(v) ? cur.filter((x) => x !== v) : cur.length < max ? [...cur, v] : cur;
      st.a[st.i] = { ...(st.a[st.i] || {}), v: next };
      if (!next.length) delete st.a[st.i];
    }
    obDraw(); return;
  }
  obCapture();
  if (act === 'next') { if (await obPersist(st.i + 1 >= Q.length)) st.i += 1; obDraw(); }
  else if (act === 'back') { st.i = Math.max(0, st.i - 1); st.err = ''; obDraw(); }
  else if (act === 'skip') { delete st.a[st.i]; if (await obPersist(st.i + 1 >= Q.length)) st.i += 1; obDraw(); }
  else if (act === 'later') { if (await obPersist(false)) { sessionStorage.setItem('navi-ob-later', '1'); S.ob = null; obDraw(); route(); } else obDraw(); }
  else if (act === 'close') { S.ob = null; obDraw(); header(); route(); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.ob && S.ob.i >= 0) ob.querySelector('[data-ob="later"]')?.click(); });

// ---------------------------------------------------------------- yönlendirme ve olaylar
function route() {
  const h = location.hash.replace('#', '');
  app.innerHTML = h.startsWith('etkinlik/') ? viewTask(h.split('/')[1]) : viewHome();
  if (h.startsWith('etkinlik/')) scrollTo(0, 0);
}
addEventListener('hashchange', route);

app.addEventListener('change', async (e) => {
  const c = e.target.closest('[data-ek-chk]');
  if (!c) return;
  c.closest('label').classList.toggle('on', c.checked);
  const id = location.hash.split('/')[1];
  const a = S.assigns.find((x) => x.id === id);
  const n = app.querySelectorAll('[data-ek-chk]:checked').length;
  const doneBtn = app.querySelector('[data-done]');
  if (doneBtn) doneBtn.disabled = n < (a.activity.checklist || []).length;
  try { await save(id, S.subs[id] && S.subs[id].status === 'tamamlandi' && n >= (a.activity.checklist || []).length ? 'tamamlandi' : 'devam'); app.querySelector('#saveMsg').textContent = 'Kaydedildi ✓'; }
  catch (err) { app.querySelector('#saveMsg').textContent = err.message; }
});
app.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-save],[data-done]');
  if (!b) return;
  const id = b.dataset.save || b.dataset.done;
  b.disabled = true;
  try {
    await save(id, b.dataset.done ? 'tamamlandi' : (S.subs[id] && S.subs[id].status) || 'devam');
    route();
    const m = app.querySelector('#saveMsg'); if (m) m.textContent = 'Kaydedildi ✓';
  } catch (err) { b.disabled = false; const m = app.querySelector('#saveMsg'); if (m) m.textContent = err.message; }
});
document.getElementById('me').addEventListener('click', (e) => {
  if (e.target.closest('[data-act-ob]')) { S.ob = { i: 0, a: { ...((S.intake && S.intake.answers) || {}) } }; obDraw(); }
});

// ---------------------------------------------------------------- başlat
try {
  await load();
  header();
  route();
  if ((!S.intake || !S.intake.completed) && !sessionStorage.getItem('navi-ob-later')) {
    S.ob = { i: S.intake ? 0 : -1, a: { ...((S.intake && S.intake.answers) || {}) } };
    obDraw();
  }
} catch (err) {
  app.innerHTML = `<div class="card"><div class="msg err">${esc(err.message)}</div><div class="row"><button class="btn pri" onclick="location.reload()">Yeniden dene</button><button class="btn" id="out2">Çıkış yap</button></div></div>`;
  document.getElementById('out2').onclick = () => signOut('/giris#ogrenci');
}
