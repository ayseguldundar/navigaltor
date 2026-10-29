/* ===== Etkinlik görüntüleyici çekirdeği (panel dışı sayfalar için) =====
   Panelin görsel kütüphanesini (24-vis.js) ve simgelerini yönetim, öğrenci ve veli sayfalarında çalıştırır. */
const UI = window.UI || {};
const ACT = window.ACT || {};
window.UI = UI; window.ACT = ACT;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
