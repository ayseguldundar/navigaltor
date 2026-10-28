// Panellere eklenen oturum köprüsü: giriş yapmış kişiyi gösterir, panelin gerçek sunucu çağrıları için window.naviAuth sağlar.
import { supabase, callFn, currentProfile, signOut, ROLE_TR, esc } from './supa.js';

const profile = await currentProfile().catch(() => null);
window.naviAuth = {
  profile,
  isStaff: () => !!profile && (profile.role === 'admin' || profile.role === 'teacher'),
  callFn: (name, body) => callFn(name, body, { auth: true }),
  signOut: () => signOut('/'),
  supabase,
};

const chip = document.createElement('div');
chip.className = 'navi-oturum';
chip.innerHTML = profile
  ? `<span class="no-av">${esc(profile.full_name.split(' ').map((p) => p[0]).join('').slice(0, 2))}</span>
     <span class="no-t"><b>${esc(profile.full_name)}</b><small>${ROLE_TR[profile.role] || ''}</small></span>
     ${window.naviAuth.isStaff() ? '<a href="/yonetim" title="Şubeler ve öğrenciler">Yönetim</a>' : ''}
     <button type="button">Çıkış</button>`
  : `<span class="no-t"><b>Demo modu</b><small>Kurgusal veriler</small></span><a href="/giris">Giriş yap</a>`;
const st = document.createElement('style');
st.textContent = `.navi-oturum{position:fixed;right:12px;bottom:58px;z-index:70;display:flex;align-items:center;gap:8px;padding:6px 8px 6px 6px;border-radius:999px;background:rgba(255,253,249,.96);border:1px solid #EADFCC;box-shadow:0 10px 24px -16px rgba(60,30,10,.5);font:600 12px/1.2 Manrope,system-ui,sans-serif;color:#2B2118}
.navi-oturum .no-av{width:28px;height:28px;border-radius:50%;background:#810000;color:#fff;display:grid;place-items:center;font-size:11px;font-weight:800}
.navi-oturum .no-t{display:flex;flex-direction:column;padding:0 2px}.navi-oturum .no-t small{color:#8A7B6B;font-weight:600}
.navi-oturum a,.navi-oturum button{border:1px solid #E2D4BE;background:#fff;border-radius:999px;padding:5px 10px;font:inherit;color:#810000;text-decoration:none;cursor:pointer}
@media print{.navi-oturum{display:none}}@media (max-width:700px){.navi-oturum{right:8px;bottom:64px}.navi-oturum .no-t small{display:none}}`;
document.head.appendChild(st);
document.body.appendChild(chip);
chip.querySelector('button')?.addEventListener('click', () => window.naviAuth.signOut());
// Panel açık bir sayfadaysa (ör. Yeni Etkinlik) gerçek yapay zekâ seçeneğini göstermek için yeniden çiz.
try { if (typeof window.render === 'function') window.render(); else if (typeof render === 'function') render(); } catch { /* panel henüz hazır değil */ }
