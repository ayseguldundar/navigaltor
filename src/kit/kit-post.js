/* ===== Etkinlik ayrıntısı ve olay bağlama ===== */
const LIB_GRAD = { TUR: ['#E07A2F', '#FFC857'], MAT: ['#B3123A', '#FF8A6B'], FEN: ['#1F9D6B', '#7BDCB5'], SOS: ['#6A55C8', '#B79CFF'], ING: ['#2F7DD8', '#7CC6FF'] };
const COURSE_TR = { MAT: 'Matematik', TUR: 'Türkçe', FEN: 'Fen Bilimleri', SOS: 'Sosyal Bilgiler', ING: 'İngilizce' };
const arr = (v) => (Array.isArray(v) ? v : []);

// Görsel çizilemezse (beklenmedik parametreler) sayfa bozulmasın.
const _visRender = VIS.render;
VIS.render = function (v, k) {
  try { return _visRender(v, k); } catch (e) {
    console.warn('Görsel çizilemedi', e);
    const t = v && v.type;
    return `<figure class="vis"><div class="vis-body"><div class="vis-stat">${VIS_IC[t] || '🖼️'} ${esc(VIS_NM[t] || 'Görsel')}</div></div>${v && v.caption ? `<figcaption>${esc(v.caption)}</figcaption>` : ''}</figure>`;
  }
};

/* a: etkinlik nesnesi; o.role: 'ogretmen' | 'ogrenci' | 'veli'; o.checked: işaretli madde sıraları; o.key: görsel durum anahtarı */
function renderEtkinlik(a, o = {}) {
  const role = o.role || 'ogretmen';
  const g = LIB_GRAD[a.course] || LIB_GRAD.MAT;
  const checked = new Set(arr(o.checked).map(Number));
  const key = o.key || 'ek-' + String(a.id || 'x').replace(/[^a-z0-9-]/gi, '');
  const tagList = (xs) => `<div class="lt-c">${arr(xs).map((s) => `<i>${esc(s)}</i>`).join('') || '<i>—</i>'}</div>`;
  const visual = a.visual && a.visual.type ? VIS.render(a.visual, key) : '';
  return `<article class="lib-d">
  <header class="lib-hd" style="--g1:${g[0]};--g2:${g[1]}"><div class="lib-hd-t">
    <span class="lib-k">${esc(COURSE_TR[a.course] || '')} · ${esc(a.grade)}. sınıf${a.themeName ? ' · ' + esc(a.themeName) : ''}</span>
    <h2>${esc(a.title)}</h2>${a.subtitle ? `<p>${esc(a.subtitle)}</p>` : ''}
    <div class="lib-chips">${a.duration ? `<span>⏱️ ${esc(a.duration)}</span>` : ''}${a.format ? `<span>👥 ${esc(a.format)}</span>` : ''}${o.extra || ''}</div></div>
    <span class="lib-big" aria-hidden="true">${(a.visual && VIS_IC[a.visual.type]) || '✨'}</span></header>
  <div class="lib-tags">
    <div class="lib-tag kz"><span class="lt-h">📌 Kazanım</span>${arr(a.kazanim).map((k) => `<p>${esc(k)}</p>`).join('')}</div>
    <div class="lib-tag s21"><span class="lt-h">🤝 21. yüzyıl becerileri</span>${tagList(a.skills21)}</div>
    <div class="lib-tag dig"><span class="lt-h">💻 Dijital beceriler</span>${tagList(a.digital)}</div>
    <div class="lib-tag tl"><span class="lt-h">🧰 Araçlar</span>${tagList(a.tools)}</div></div>
  <section class="lib-sec lib-scn"><h3>🎯 Senaryo — Oku, Anla, Düşün</h3><p>${esc(a.scenario)}</p></section>
  ${visual ? `<section class="lib-sec"><h3>🖼️ Görsel</h3>${visual}</section>` : ''}
  <section class="lib-sec"><h3>📋 Etkinlik adımları</h3>
    <ol class="lib-steps">${arr(a.steps).map((s, i) => `<li><span class="ls-n">${i + 1}</span><div class="ls-b"><div class="ls-h"><b>${esc(s.title)}</b>${s.mode ? `<span class="ls-m">${esc(s.mode)}</span>` : ''}</div><ul>${arr(s.items).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>${s.warn ? `<div class="ls-w">⚠️ ${esc(s.warn)}</div>` : ''}</div></li>`).join('')}</ol></section>
  <div class="lib-2col">
    <section class="lib-sec"><h3>✅ Teslim kontrol listesi</h3>${role === 'ogrenci' ? '<p class="ek-hint">Yaptıklarını işaretle; hepsi bitince etkinliği tamamlayabilirsin.</p>' : ''}
      <div class="lib-chk">${arr(a.checklist).map((c, i) => `<label class="${checked.has(i) ? 'on' : ''}"><input type="checkbox" data-ek-chk="${i}" ${checked.has(i) ? 'checked' : ''} ${role === 'ogrenci' && !o.readonly ? '' : 'disabled'}> <span>${esc(c)}</span></label>`).join('')}</div></section>
    <section class="lib-sec"><h3>💬 Navi'nin soruları</h3><div style="display:grid;gap:8px">${arr(a.navi).map((q) => `<div class="lib-q">${esc(q)}</div>`).join('')}</div>
      <p class="ek-hint">Navi cevabı söylemez; düşünmeni sağlayan sorular sorar.</p></section></div>
  ${role === 'ogretmen' && arr(a.rubric).length ? `<section class="lib-sec"><h3>📏 Puanlama rubriği</h3><div class="ek-tw"><table class="ek-t lib-rub"><thead><tr><th>Ölçüt</th><th>4 · Mükemmel</th><th>3 · Yeterli</th><th>2 · Gelişiyor</th><th>1 · Başlangıç</th></tr></thead><tbody>${arr(a.rubric).map((r) => `<tr><td><b>${esc(r.k)}</b><div class="ek-meta">${esc(r.d)}</div></td><td>${esc(r.l4)}</td><td>${esc(r.l3)}</td><td>${esc(r.l2)}</td><td>${esc(r.l1)}</td></tr>`).join('')}</tbody></table></div></section>` : ''}
  ${role === 'ogretmen' && (a.diff || a.misconception) ? `<div class="lib-2col"><section class="lib-sec"><h3>🎚️ Farklılaştırma</h3>${a.diff && a.diff.destek ? `<p><b>Destek:</b> ${esc(a.diff.destek)}</p>` : ''}${a.diff && a.diff.ileri ? `<p><b>İleri düzey:</b> ${esc(a.diff.ileri)}</p>` : ''}</section>
    <section class="lib-sec"><h3>🔎 Hedeflenen yanılgı</h3><p>${esc(a.misconception || '')}</p></section></div>` : ''}
</article>`;
}
window.renderEtkinlik = renderEtkinlik;

// Görsellerin düğmeleri (data-act="vis") ve kaydırıcıları için genel olay bağlama.
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = ACT[el.dataset.act];
  if (typeof fn === 'function') { e.preventDefault(); fn(el, e); }
});

// Navi tanışma formu cevaplarını okunur özete çevirir: [{q, a}] (a: null ise cevaplanmamış)
function tanismaOzet(ans) {
  return OB_Q.map((Q, i) => {
    const x = ans && ans[i];
    if (!x || x.v == null || x.v === '') return { q: Q.q, a: null };
    const v = Array.isArray(x.v) ? x.v : [x.v];
    return { q: Q.q, a: v.map((o) => (isOther(o) && x.other ? x.other : String(o).replace(/: …$/, ''))).join(', ') };
  });
}
window.tanismaOzet = tanismaOzet;

Object.assign(window, { VIS, OB_Q, OB_INTRO_T, OB_INTRO, OB_END, isOther, stuEmoji });
