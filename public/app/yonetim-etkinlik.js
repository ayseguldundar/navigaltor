// Yönetim konsolu → Etkinlikler: atamalar ve takip, etkinlik kütüphanesi, Claude ile üretim, taslaklar.
// Etkinlik ekranları /app/kit-gorsel.js (renderEtkinlik, VIS) ile çizilir; kütüphane verisi ilk açılışta yüklenir.
import { supabase, rpc, callFn, esc } from './supa.js';

const COURSES = { MAT: 'Matematik', TUR: 'Türkçe', FEN: 'Fen Bilimleri', SOS: 'Sosyal Bilgiler', ING: 'İngilizce' };
const LEVELS = [['destek', 'Desteğe ihtiyacı var'], ['orta', 'Sınıf düzeyinde'], ['ileri', 'İleri düzey']];
const STATUS = { yok: ['Başlamadı', 'tag-no'], devam: ['Devam ediyor', 'tag-mid'], tamamlandi: ['Tamamladı', 'tag-ok'] };
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) : '');
const isoIn = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };

export function createEtkinlik(ctx) {
  const { S, openDlg, dlg, dlgBody, flash, draw } = ctx;
  const E = (S.E = S.E || {
    sub: 'atamalar', view: null, assigns: [], subs: [], drafts: [], gens: [], libReady: false,
    lib: { c: 'MAT', g: 7, q: '' }, ai: { c: 'MAT', g: 7, u: 0, k: '', lvl: 'orta', dur: '40 dk', fmt: 'Bireysel', note: '', busy: false, res: null, err: '' },
  });

  // ---------------------------------------------------------------- veri
  function loadLibrary() {
    if (E.libReady || window.ACTLIB) { E.libReady = true; return Promise.resolve(); }
    return new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = '/app/kit-kutuphane.js';
      s.onload = () => { E.libReady = true; ok(); };
      s.onerror = () => fail(new Error('Etkinlik kütüphanesi yüklenemedi.'));
      document.head.appendChild(s);
    });
  }
  async function loadAssigns() {
    if (!S.sec) { E.assigns = []; E.subs = []; return; }
    const { data, error } = await supabase.from('assignments').select('id, title, course, grade, source, template_id, due_date, created_at, archived, activity')
      .eq('section_id', S.sec).eq('archived', false).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    E.assigns = data;
    const ids = data.map((a) => a.id);
    if (ids.length) {
      const r = await supabase.from('submissions').select('assignment_id, student_id, status, checklist, reflection, teacher_feedback, completed_at').in('assignment_id', ids);
      E.subs = r.data || [];
    } else E.subs = [];
  }
  async function loadDrafts() {
    const { data } = await supabase.from('teacher_activities').select('id, title, course, grade, source, created_at, activity, teacher_id').order('created_at', { ascending: false }).limit(60);
    E.drafts = data || [];
  }
  async function loadGens() {
    const { data } = await supabase.from('ai_generations').select('id, created_at, status, input_tokens, output_tokens, request, response').order('created_at', { ascending: false }).limit(20);
    E.gens = data || [];
  }
  async function load() {
    await Promise.all([loadAssigns(), ctx.ensureStudents()]);
    if (E.sub === 'kutuphane' || E.sub === 'uret') await loadLibrary();
    if (E.sub === 'taslak') await loadDrafts();
    if (E.sub === 'uret') await loadGens();
  }

  // ---------------------------------------------------------------- görünümler
  const subTabs = () => `<div class="tabs" role="tablist" style="margin-bottom:14px">${[
    ['atamalar', 'Atamalar'], ['kutuphane', 'Etkinlik kütüphanesi'], ['uret', '✨ Claude ile üret'], ['taslak', 'Taslaklarım'],
  ].map(([k, l]) => `<button role="tab" class="${E.sub === k && !E.view ? 'on' : ''}" data-esub="${k}">${l}</button>`).join('')}</div>`;

  const secSelect = () => `<select class="in" style="width:auto" data-chg="sec" aria-label="Şube">${S.ctx.sections.map((s) =>
    `<option value="${s.id}" ${s.id === S.sec ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>`;

  function progressOf(a) {
    const active = S.students.filter((s) => s.active);
    const subs = E.subs.filter((x) => x.assignment_id === a.id);
    const done = subs.filter((x) => x.status === 'tamamlandi').length;
    const going = subs.filter((x) => x.status === 'devam').length;
    return { total: active.length, done, going };
  }

  function viewAtamalar() {
    if (!S.ctx.sections.length) return `<div class="card empty"><p class="muted">Önce bir şube açın.</p></div>`;
    return `<div class="row" style="margin-bottom:12px"><b>Şube</b>${secSelect()}<span class="sp"></span><button class="btn" data-esub="kutuphane">Kütüphaneden ata</button><button class="btn pri" data-esub="uret">✨ Claude ile üret</button></div>
    ${E.assigns.length ? `<div class="grid">${E.assigns.map((a) => {
      const p = progressOf(a); const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
      return `<button class="card as-card" data-eopen="atama:${a.id}">
        <span class="chip">${esc(COURSES[a.course])} · ${a.grade}. sınıf</span>
        <h3>${esc(a.title)}</h3>
        <div class="small muted">${a.source === 'yz' ? '✨ Claude ile üretildi' : a.source === 'kutuphane' ? '📚 Kütüphane' : '✍️ Öğretmen'} · ${a.due_date ? 'Teslim: ' + fmtDate(a.due_date) : 'Teslim tarihi yok'}</div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="small"><b>${p.done}/${p.total}</b> tamamladı${p.going ? ` · ${p.going} devam ediyor` : ''}</div></button>`;
    }).join('')}</div>`
    : `<div class="card empty"><div class="big">📋</div><h3>Bu şubeye henüz etkinlik atanmadı</h3><p class="muted">Kütüphaneden hazır bir etkinlik seçin ya da Claude ile öğrencilerinizin düzeyine göre yeni bir etkinlik üretin.</p></div>`}`;
  }

  function viewAtamaDetay(id) {
    const a = E.assigns.find((x) => x.id === id);
    if (!a) return '<div class="card"><p class="muted">Atama bulunamadı.</p></div>';
    const total = (a.activity.checklist || []).length;
    const rows = S.students.filter((s) => s.active).map((s) => {
      const sb = E.subs.find((x) => x.assignment_id === a.id && x.student_id === s.id);
      const st = STATUS[sb ? sb.status : 'yok'];
      return `<tr><td><b>${esc(s.first_name)} ${esc(s.last_name)}</b></td><td><span class="${st[1]}">${st[0]}</span>${sb && sb.completed_at ? `<div class="small muted">${fmtDate(sb.completed_at)}</div>` : ''}</td>
        <td>${sb ? `${(sb.checklist || []).length}/${total}` : '—'}</td><td class="small">${sb && sb.reflection ? esc(sb.reflection) : '<span class="muted">—</span>'}</td>
        <td><div class="row" style="flex-wrap:nowrap"><input class="in fb" data-fb="${s.id}" placeholder="Kısa geri bildirim" value="${esc(sb && sb.teacher_feedback || '')}" maxlength="500"><button class="btn sm" data-fbsave="${a.id}:${s.id}">Kaydet</button></div></td></tr>`;
    }).join('');
    const p = progressOf(a);
    return `<div class="row" style="margin-bottom:12px"><button class="btn sm" data-eback>← Atamalar</button><span class="sp"></span>
      <span class="chip">${p.done}/${p.total} tamamladı</span><button class="btn sm" data-earchive="${a.id}">Arşivle</button></div>
      <div class="card" style="margin-bottom:14px"><h3>Öğrenci ilerlemesi</h3>
        ${rows ? `<div class="tw"><table class="t"><thead><tr><th>Öğrenci</th><th>Durum</th><th>Kontrol listesi</th><th>Öğrencinin notu</th><th>Geri bildiriminiz</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p class="muted small">Bu şubede öğrenci yok.</p>'}
        <p class="small muted">Geri bildiriminiz öğrencinin etkinlik sayfasında ve veli ekranında görünür.</p></div>
      ${window.renderEtkinlik(a.activity, { role: 'ogretmen', key: 'as-' + a.id })}`;
  }

  function viewKutuphane() {
    if (!E.libReady) return '<div class="card"><p class="muted">Kütüphane yükleniyor…</p></div>';
    const L = E.lib, q = L.q.toLocaleLowerCase('tr');
    const list = window.ACTLIB.filter((a) => a.course === L.c && a.grade === +L.g &&
      (!q || (a.title + ' ' + a.subtitle + ' ' + a.kazanim.join(' ') + ' ' + a.skills21.join(' ')).toLocaleLowerCase('tr').includes(q)));
    return `<div class="card" style="margin-bottom:14px"><div class="row">
      <div class="tabs">${Object.entries(COURSES).map(([k, v]) => `<button class="${L.c === k ? 'on' : ''}" data-libc="${k}">${v}</button>`).join('')}</div>
      <div class="tabs">${[5, 6, 7, 8].map((g) => `<button class="${+L.g === g ? 'on' : ''}" data-libg="${g}">${g}. sınıf</button>`).join('')}</div>
      <input class="in" style="max-width:240px" data-libq placeholder="Ara: konu, kazanım, beceri" value="${esc(L.q)}"></div></div>
      ${list.length ? `<div class="grid">${list.map((a) => `<button class="card as-card" data-eopen="lib:${a.id}">
        <span class="chip">${esc(a.themeName)}</span><h3>${esc(a.title)}</h3><div class="small muted">${esc(a.subtitle)}</div>
        <div class="small">${a.skills21.slice(0, 3).map((s) => `<span class="chip">${esc(s)}</span>`).join(' ')}</div>
        <div class="small muted">⏱️ ${esc(a.duration)} · ${esc(a.format)}</div></button>`).join('')}</div>`
      : '<div class="card empty"><p class="muted">Bu filtreyle etkinlik bulunamadı. Claude ile yeni bir etkinlik üretebilirsiniz.</p></div>'}`;
  }

  function viewOnizleme(a, source, templateId, extra = '') {
    return `<div class="row" style="margin-bottom:12px"><button class="btn sm" data-eback>← Geri</button><span class="sp"></span>${extra}
      <button class="btn pri" data-eassign="${source}|${esc(templateId || '')}">Şubeye ata</button></div>
      ${window.renderEtkinlik(a, { role: 'ogretmen', key: 'pv-' + (templateId || 'x') })}`;
  }

  function viewUret() {
    if (!E.libReady) return '<div class="card"><p class="muted">Öğretim programı yükleniyor…</p></div>';
    const F = E.ai;
    const G = window.RESMI[F.c] && window.RESMI[F.c][F.g];
    const units = G ? G.u : [];
    const u = units[F.u] || units[0];
    const kzs = u ? u.c.filter((c) => c[1]).map((c) => c[1]) : [];
    if (!kzs.includes(F.k)) F.k = kzs[0] || '';
    const used = E.gens.filter((g) => new Date(g.created_at) > new Date(Date.now() - 864e5)).length;
    return `<div class="card"><h3>Claude ile etkinlik üret</h3>
      <p class="small muted">Kazanımlar resmî öğretim programından gelir. Claude, seçtiğiniz kazanım ve öğrenci düzeyine göre özgün bir etkinlik tasarlar; ders kitaplarından soru kopyalamaz. Öğrenci bilgisi gönderilmez. Taslak, siz atamadan öğrenciye gitmez.</p>
      <div class="row" style="align-items:flex-start;margin-top:10px">
        <div class="fld" style="flex:1;min-width:160px"><label>Ders</label><select class="in" data-ai="c">${Object.entries(COURSES).map(([k, v]) => `<option value="${k}" ${F.c === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
        <div class="fld" style="flex:1;min-width:120px"><label>Sınıf</label><select class="in" data-ai="g">${[5, 6, 7, 8].map((g) => `<option value="${g}" ${+F.g === g ? 'selected' : ''}>${g}. sınıf</option>`).join('')}</select></div>
        <div class="fld" style="flex:2;min-width:220px"><label>${(window.UNIT_WORD && window.UNIT_WORD[F.c]) || 'Ünite'}</label><select class="in" data-ai="u">${units.map((x, i) => `<option value="${i}" ${+F.u === i ? 'selected' : ''}>${x.no}. ${esc(x.ad)}</option>`).join('')}</select></div></div>
      <div class="fld"><label>Kazanım</label>${kzs.length ? `<select class="in" data-ai="k">${kzs.map((k) => `<option ${F.k === k ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select>`
        : `<p class="small muted">Bu temada kazanım metni yok; tema kapsamı kullanılacak${u && u.kapsam ? ': ' + esc([].concat(u.kapsam).join(' ')) : ''}.</p>`}</div>
      <div class="row" style="align-items:flex-start">
        <div class="fld"><label>Öğrenci düzeyi</label><div class="tabs">${LEVELS.map(([v, l]) => `<button class="${F.lvl === v ? 'on' : ''}" data-aiseg="lvl:${v}">${l}</button>`).join('')}</div></div>
        <div class="fld"><label>Süre</label><div class="tabs">${['40 dk', '80 dk (2 ders)'].map((v) => `<button class="${F.dur === v ? 'on' : ''}" data-aiseg="dur:${v}">${v}</button>`).join('')}</div></div>
        <div class="fld"><label>Çalışma biçimi</label><div class="tabs">${['Bireysel', 'İkili', 'Grup'].map((v) => `<button class="${F.fmt === v ? 'on' : ''}" data-aiseg="fmt:${v}">${v}</button>`).join('')}</div></div></div>
      <div class="fld"><label for="aiNote">Ek isteğiniz (isteğe bağlı)</label><textarea class="in" id="aiNote" data-ai="note" style="min-height:70px;font-family:inherit" placeholder="Örn. okul bahçesi bağlamı olsun, bir yanılgıya odaklansın.">${esc(F.note)}</textarea></div>
      ${F.err ? `<div class="msg err">${esc(F.err)}</div>` : ''}
      <div class="row"><span class="small muted">Son 24 saatte ${used} üretim</span><span class="sp"></span>
        <button class="btn pri lg" data-aigo ${F.busy ? 'disabled' : ''}>${F.busy ? '<span class="spinner"></span> Claude tasarlıyor… (30–60 sn)' : '✨ Etkinlik taslağı üret'}</button></div></div>
      ${F.res ? `<div style="margin-top:16px">${viewOnizleme(F.res, 'yz', null, '<button class="btn" data-aisave>Taslaklarıma kaydet</button><button class="btn" data-aigo>Başka taslak</button>')
        .replace('<button class="btn sm" data-eback>← Geri</button>', '<b>Taslak hazır — gözden geçirin</b>')}</div>` : ''}`;
  }

  function viewTaslak() {
    return E.drafts.length ? `<div class="grid">${E.drafts.map((d) => `<div class="card as-card" style="cursor:default">
      <span class="chip">${esc(COURSES[d.course])} · ${d.grade}. sınıf</span><h3>${esc(d.title)}</h3>
      <div class="small muted">${d.source === 'yz' ? '✨ Claude' : '✍️ Öğretmen'} · ${fmtDate(d.created_at)}</div>
      <div class="row"><button class="btn sm" data-eopen="taslak:${d.id}">Aç</button>${d.teacher_id === S.me.id || S.me.role === 'admin' ? `<button class="btn sm" data-edel="${d.id}">Sil</button>` : ''}</div></div>`).join('')}</div>`
      : '<div class="card empty"><div class="big">🗂️</div><p class="muted">Kaydedilmiş taslak yok. Claude ile ürettiğiniz etkinlikleri buraya kaydedip okuldaki diğer öğretmenlerle paylaşabilirsiniz.</p></div>';
  }

  function view() {
    let body;
    if (E.view) {
      const [kind, id] = E.view.split(':');
      if (kind === 'atama') body = viewAtamaDetay(id);
      else if (kind === 'lib') { const a = window.ACTLIB.find((x) => x.id === id); body = a ? viewOnizleme(a, 'kutuphane', a.id) : ''; }
      else if (kind === 'taslak') { const d = E.drafts.find((x) => x.id === id); body = d ? viewOnizleme(d.activity, d.source, null) : ''; }
    } else body = { atamalar: viewAtamalar, kutuphane: viewKutuphane, uret: viewUret, taslak: viewTaslak }[E.sub]();
    return `<div class="hero"><h1>Etkinlikler</h1></div>${ctx.msg()}${E.view ? '' : subTabs()}${body}`;
  }

  // ---------------------------------------------------------------- işlemler
  function currentActivity() {
    if (!E.view && E.sub === 'uret') return E.ai.res;
    const [kind, id] = (E.view || '').split(':');
    if (kind === 'lib') return window.ACTLIB.find((x) => x.id === id);
    if (kind === 'taslak') return (E.drafts.find((x) => x.id === id) || {}).activity;
    return null;
  }

  function assignDialog(source, templateId) {
    const a = currentActivity();
    if (!a) return;
    const secs = S.ctx.sections;
    if (!secs.length) { flash('err', 'Önce bir şube açın.'); return; }
    const pref = secs.find((s) => s.id === S.sec && s.grade === a.grade) || secs.find((s) => s.grade === a.grade) || secs[0];
    openDlg(`<h2>“${esc(a.title)}” etkinliğini ata</h2>
      <form id="fa"><div class="fld"><label>Şube</label>${secs.map((s) => `<label class="row small" style="margin:4px 0"><input type="radio" name="sec" value="${s.id}" ${s.id === pref.id ? 'checked' : ''}> <b>${esc(s.name)}</b> <span class="muted">${s.student_count} öğrenci${s.grade !== a.grade ? ` · <span style="color:var(--err)">etkinlik ${a.grade}. sınıf için</span>` : ''}</span></label>`).join('')}</div>
      <div class="fld"><label for="due">Teslim tarihi</label><input class="in" type="date" id="due" name="due" value="${isoIn(7)}" min="${isoIn(0)}"></div>
      <p class="small muted">Etkinlik atandığı anda şubedeki öğrencilerin “Görevlerim” ekranına düşer.</p><div id="faMsg"></div>
      <div class="row"><span class="sp"></span><button type="button" class="btn" data-close>Vazgeç</button><button class="btn pri">Ata</button></div></form>`);
    dlgBody.querySelector('#fa').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      const btn = e.target.querySelector('.btn.pri'); btn.disabled = true;
      try {
        const activity = { ...a, course: a.course, grade: +a.grade };
        await rpc('create_assignment', { p_section: f.sec, p_activity: activity, p_source: source, p_template: templateId || null, p_due: f.due || null });
        dlg.close(); S.sec = f.sec; E.view = null; E.sub = 'atamalar'; await loadAssigns();
        flash('ok', `Etkinlik ${secs.find((s) => s.id === f.sec).name} şubesine atandı.`);
      } catch (err) { dlgBody.querySelector('#faMsg').innerHTML = `<div class="msg err">${esc(err.message)}</div>`; btn.disabled = false; }
    });
  }

  async function generate() {
    const F = E.ai;
    const G = window.RESMI[F.c][F.g]; const u = G.u[F.u] || G.u[0];
    const b21 = (window.B21 && window.B21[F.c] && window.B21[F.c][F.g] && window.B21[F.c][F.g][u.no]) || null;
    const tmpl = window.ACTLIB.find((x) => x.course === F.c && x.grade === +F.g && x.themeName === u.ad) || window.ACTLIB.find((x) => x.course === F.c);
    F.busy = true; F.err = ''; F.res = null; draw();
    try {
      const r = await callFn('yz-etkinlik', {
        course: F.c, grade: +F.g, unit: u.ad, outcome: F.k || [].concat(u.kapsam || []).join(' '), level: F.lvl, duration: F.dur, format: F.fmt, note: F.note,
        skills21: b21 ? b21.s : [], digital: b21 ? b21.d : [], structure: tmpl ? tmpl.steps.map((s) => `${s.title} (${s.mode})`).join(' → ') : '',
      }, { auth: true });
      F.res = { ...r.activity, course: F.c, grade: +F.g, themeName: u.ad };
      await loadGens();
    } catch (err) { F.err = err.message; }
    F.busy = false; draw();
  }

  async function onClick(e, b) {
    const d = b.dataset;
    if (d.esub) { E.sub = d.esub; E.view = null; S.msg = null; await load(); draw(); return true; }
    if (d.eopen) { E.view = d.eopen; S.msg = null; if (d.eopen.startsWith('lib')) await loadLibrary(); draw(); scrollTo(0, 0); return true; }
    if ('eback' in d) { E.view = null; draw(); return true; }
    if (d.libc) { E.lib.c = d.libc; draw(); return true; }
    if (d.libg) { E.lib.g = +d.libg; draw(); return true; }
    if (d.aiseg) { const [k, v] = d.aiseg.split(':'); E.ai[k] = v; draw(); return true; }
    if ('aigo' in d) { await generate(); return true; }
    if ('aisave' in d) { await rpc('save_teacher_activity', { p_activity: E.ai.res, p_source: 'yz' }); flash('ok', 'Taslak kaydedildi. “Taslaklarım” bölümünden ulaşabilirsiniz.'); return true; }
    if (d.eassign) { const [src, tid] = d.eassign.split('|'); assignDialog(src, tid); return true; }
    if (d.earchive) {
      if (!confirm('Bu atama arşivlensin mi? Öğrencilerin listesinden kalkar; teslimler silinmez.')) return true;
      await rpc('archive_assignment', { p_id: d.earchive, p_archived: true }); E.view = null; await loadAssigns(); flash('ok', 'Atama arşivlendi.'); return true;
    }
    if (d.edel) { if (!confirm('Taslak silinsin mi?')) return true; await rpc('delete_teacher_activity', { p_id: d.edel }); await loadDrafts(); draw(); return true; }
    if (d.fbsave) {
      const [aid, sid] = d.fbsave.split(':');
      const val = app().querySelector(`[data-fb="${sid}"]`).value;
      const keep = Object.fromEntries([...app().querySelectorAll('[data-fb]')].map((i) => [i.dataset.fb, i.value]));
      await rpc('set_teacher_feedback', { p_assignment: aid, p_student: sid, p_text: val });
      await loadAssigns(); flash('ok', 'Geri bildirim kaydedildi.');
      Object.entries(keep).forEach(([k, v]) => { const n = app().querySelector(`[data-fb="${k}"]`); if (n && k !== sid) n.value = v; });
      return true;
    }
    return false;
  }
  const app = () => document.getElementById('app');

  function onInput(e) {
    const t = e.target;
    if ('libq' in t.dataset) { E.lib.q = t.value; const pos = t.selectionStart; draw(); const n = app().querySelector('[data-libq]'); n.focus(); n.setSelectionRange(pos, pos); return true; }
    if (t.dataset.ai === 'note') { E.ai.note = t.value; return true; }
    return false;
  }
  async function onChange(e) {
    const t = e.target;
    if (t.dataset.ai && t.dataset.ai !== 'note') {
      const k = t.dataset.ai; E.ai[k] = k === 'g' || k === 'u' ? +t.value : t.value;
      if (k === 'c' || k === 'g') E.ai.u = 0;
      if (k !== 'k') E.ai.k = '';
      draw(); return true;
    }
    if (t.dataset.chg === 'sec' && S.tab === 'etkinlik') { S.sec = t.value; await loadAssigns(); await ctx.ensureStudents(true); draw(); return true; }
    return false;
  }

  return { load, view, onClick, onInput, onChange, loadAssigns };
}
