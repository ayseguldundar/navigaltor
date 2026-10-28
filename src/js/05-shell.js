/* ================= SHELL: sidebar, topbar, router, events ================= */
const NAV=[
 {grp:'Ana Navigasyon'},
 {id:'home',l:'Ana Sayfa',ic:'home'},
 {id:'classes',l:'Sınıflarım',ic:'school'},
 {id:'students',l:'Öğrencilerim',ic:'users'},
 {id:'content',l:'Dersler & İçerikler',ic:'book',subs:[['icerikler','Ders İçerikleri'],['mufredat','Müfredat'],['program','Resmi Öğretim Programı'],['hedefler','Öğrenme Hedefleri']]},
 {id:'activities',l:'Etkinlikler',ic:'clip',cnt:()=>pendingEvals().length,cntL:'değerlendirme bekliyor',subs:[['tum','Tüm Etkinlikler'],['yeni','Yeni Etkinlik Oluştur'],['degerlendirilecek','Değerlendirilecekler'],['tamamlanan','Tamamlananlar']]},
 {id:'assessments',l:'Değerlendirmeler',ic:'target',subs:[['sinavlar','Sınavlar'],['testler','Testler'],['soru','Soru Analizi']]},
 {id:'analytics',l:'Öğrenme Analitiği',ic:'chart',subs:[['sinif','Sınıf Performansı'],['konu','Konu Başarısı'],['eksikler','Öğrenme Eksikleri'],['gelisim','Öğrenci Gelişimi']]},
 {id:'attention',l:'Dikkat Gerekenler',ic:'alert',cnt:()=>openAlerts().length,cntL:'açık uyarı',subs:[['riskli','Riskli Öğrenciler'],['dusus','Başarı Düşüşleri'],['katilim','Katılım Sorunları']]},
 {id:'reports',l:'Raporlar',ic:'file',subs:[['ogrenci','Öğrenci Raporları'],['sinif','Sınıf Raporları'],['degerlendirme','Değerlendirme Raporları'],['olustur','Rapor Oluştur']]},
 {grp:'AI',ai:1},
 {id:'assistant',l:'Öğretmen Asistanı',ic:'spark'},
 {grp:'Sistem'},
 {id:'notifications',l:'Bildirimler',ic:'bell',cnt:unreadN,cntL:'okunmamış'},
 {id:'messages',l:'Mesajlar',ic:'msg',cnt:unreadM,cntL:'okunmamış konuşma'},
 {id:'settings',l:'Ayarlar',ic:'sliders'},
 {id:'profile',l:'Profil',ic:'idcard'}
];
UI.navOpen=new Set();
function navActive(id){return UI.route===id||(id==='students'&&UI.route==='student')}
function sidebar(){
  let h=`<div class="side-hd"><div class="org"><div class="logo" aria-hidden="true">A</div><div><b>${TEACHER.orgShort}</b><small>${TEACHER.org}</small></div></div>
  <div class="me" title="Selin Yılmaz · Matematik · 4 şube"><div class="av">SY</div><div><b>${TEACHER.name}</b><small>Matematik · 4 şube</small></div></div></div><nav class="side-nav">`;
  NAV.forEach(n=>{
    if(n.grp){h+=`<div class="grp ${n.ai?'ai':''}">${n.grp}</div>`;return}
    const on=navActive(n.id);const open=n.subs&&(UI.navOpen.has(n.id));const c=n.cnt?n.cnt():0;
    h+=`<button class="nv ${on?'on':''} ${open?'open':''}" data-act="nav" data-v="${n.id}" ${on?'aria-current="page"':''} ${n.subs?`aria-expanded="${!!open}"`:''} ${UI.collapsed?`data-tip="${n.l}"`:''}>${ic(n.ic,19)}<span class="lbl">${n.l}</span>${c?`<span class="cnt" aria-label="${c} ${n.cntL}">${c}</span>`:''}${n.subs?ic('cd',15,'car'):''}</button>`;
    if(n.subs)h+=`<div class="sub ${open?'open':''}"><div>${n.subs.map(([s,l])=>`<button class="${on&&UI.sub===s?'on':''}" data-go="${n.id}/${s}" tabindex="${open?0:-1}">${l}</button>`).join('')}</div></div>`;
  });
  h+=`</nav><div class="side-ft"><span class="brand">Navig<span>AI</span>tor</span><button class="icb-s" data-act="collapse" aria-label="${UI.collapsed?'Menüyü genişlet':'Menüyü daralt'}" data-tip="${UI.collapsed?'Menüyü genişlet':'Menüyü daralt'}">${ic('panel',18)}</button></div>`;
  return h;
}
function topbar(P){
  const n=unreadN();
  return `<button class="icb menu-btn" data-act="navOpen" aria-label="Menüyü aç">${ic('menu')}</button>
  <div class="ttl"><div class="crumb">${(P.crumbs||[]).map((c,i)=>i<P.crumbs.length-1?`<button data-go="${c[1]}">${esc(c[0])}</button>${ic('cr',12)}`:`<span>${esc(c[0])}</span>`).join('')}</div><h1 class="pt">${P.title}</h1></div>
  <div class="gsearch"><span class="gi">${ic('search',17)}</span><input data-gs placeholder="Öğrenci, kazanım veya etkinlik ara…" aria-label="Genel arama" value="${esc(UI.gq||'')}" autocomplete="off">${UI.pop==='gs'?`<div class="pop gs-res" id="gsres">${gsResults(UI.gq||'')}</div>`:''}</div>
  <div style="position:relative"><button class="icb" data-act="pop" data-v="bell" aria-label="Bildirimler, ${n} okunmamış" aria-expanded="${UI.pop==='bell'}">${ic('bell')}${n?`<span class="dot">${n}</span>`:''}</button>
   ${UI.pop==='bell'?`<div class="pop menu" style="right:0;top:48px;width:330px"><div class="row" style="padding:6px 8px"><b class="sp">Bildirimler</b><button class="btn xs ghost" data-go="notifications">Tümü</button></div>${DB.notifs.slice(0,5).map(x=>`<button data-act="notifOpen" data-v="${x.id}"><span style="width:8px;height:8px;border-radius:50%;flex:none;background:${x.read?'transparent':'var(--bordo)'};border:1.5px solid var(--bordo)"></span><span style="min-width:0"><span class="small b">${x.type}</span><br><span class="small">${esc(x.text)}</span></span></button>`).join('')}</div>`:''}</div>
  <div style="position:relative"><button class="pf-btn" data-act="pop" data-v="prof" aria-label="Profil menüsü" aria-expanded="${UI.pop==='prof'}"><span class="av">SY</span><b>Selin Yılmaz</b>${ic('cd',15)}</button>
   ${UI.pop==='prof'?`<div class="pop menu" style="right:0;top:48px"><button data-go="profile">${ic('idcard',16)} Profil</button><button data-go="settings">${ic('sliders',16)} Ayarlar</button><button data-act="resetDemo">${ic('refresh',16)} Demo verisini sıfırla</button><div class="divider"></div><button data-act="logout">${ic('logout',16)} Çıkış yap</button></div>`:''}</div>`;
}
function gsResults(q){
  q=q.trim().toLocaleLowerCase('tr');if(q.length<2)return `<div class="dd-empty">En az 2 harf yazın. Öğrenci adı, veli adı, kazanım kodu veya etkinlik adı aranabilir.</div>`;
  const S=DB.students.filter(s=>(fullName(s)+' '+s.parents.map(p=>p.name).join(' ')+' '+s.no).toLocaleLowerCase('tr').includes(q)).slice(0,5);
  const K=KZ.filter(k=>(k.name+' '+k.topic+' '+k.topic).toLocaleLowerCase('tr').includes(q)).slice(0,4);
  const A=DB.acts.filter(a=>a.title.toLocaleLowerCase('tr').includes(q)).slice(0,4);
  if(!S.length&&!K.length&&!A.length)return stateBox('none','Sonuç bulunamadı',`“${q}” için öğrenci, kazanım veya etkinlik yok.`);
  return (S.length?`<h6>Öğrenciler</h6>`+S.map(s=>`<button data-go="student/assess/${s.id}">${avatar(s,28)}<span><b>${esc(fullName(s))}</b><br><span class="small muted">${s.section} · No ${s.no}</span></span></button>`).join(''):'')+
  (K.length?`<h6>Kazanımlar</h6>`+K.map(k=>`<button data-act="gsKz" data-v="${k.id}">${ic('target',16)}<span><b>${esc(k.name)}</b><br><span class="small muted">${k.topic} · ${k.grade}. sınıf</span></span></button>`).join(''):'')+
  (A.length?`<h6>Etkinlikler</h6>`+A.map(a=>`<button data-act="actOpen" data-v="${a.id}">${ic('clip',16)}<span><b>${esc(a.title)}</b><br><span class="small muted">${a.sections.join(', ')} · ${a.status}</span></span></button>`).join(''):'');
}

/* ---------- router ---------- */
const DEF_SUB={content:'icerikler',activities:'tum',assessments:'sinavlar',analytics:'sinif',attention:'riskli',reports:'ogrenci'};
const PAGES={};
UI.stack=[];
function parseHash(){const h=decodeURIComponent(location.hash.slice(1))||'home';let [r,s='',p='']=h.split('/');if(!s&&DEF_SUB[r])s=DEF_SUB[r];return {r,s,p}}
function go(path){if(location.hash.slice(1)===path){render();return}UI.scroll[location.hash||'#home']=window.scrollY;UI.stack.push(location.hash||'#home');location.hash=path}
function back(fallback){if(UI.stack.length){history.back()}else go(fallback)}
let routeTimer=null;
function onRoute(){
  const prev=UI.cur;const {r,s,p}=parseHash();
  const isBack=UI.stack.length&&UI.stack[UI.stack.length-1]===location.hash;
  if(isBack)UI.stack.pop();
  UI.route=PAGES[r]?r:'home';UI.sub=s;UI.param=p;UI.cur=location.hash;
  UI.openDD=null;UI.pop=null;UI.notes=[];UI.drawer=null;UI.modal=null;drawLayer(false);
  UI.navOpen=new Set(NAV.find(n=>n.id===UI.route&&n.subs)?[UI.route]:[]);
  document.body.classList.remove('nav-open');$('#navScrim').hidden=true;
  if(UI.route==='classes'&&!DB.visited.classes&&DB.settings.openGuidance){DB.visited.classes=1;F.sections=TEACHER.guidance.slice();F.grade=[];F.course='ALL';UI.notes=[];saveF();save()}
  const v=$('#view');
  if(UI.firstRender){UI.firstRender=false;render(true);return}
  v.className='view';v.innerHTML=`<div class="grid g4">${'<div class="skel" style="height:118px"></div>'.repeat(4)}</div><div class="skel" style="height:320px"></div>`;
  clearTimeout(routeTimer);
  routeTimer=setTimeout(()=>{render(true);window.scrollTo({top:isBack?(UI.scroll[location.hash]||0):0,behavior:'instant'});if(UI.scrollTo){const t=document.getElementById(UI.scrollTo);UI.scrollTo=null;t&&t.scrollIntoView({block:'start'})}},160);
}
window.addEventListener('hashchange',onRoute);

function render(enter=false){
  TIPS.clear();
  const P=(PAGES[UI.route]||PAGES.home)(UI.sub,UI.param);
  $('#side').innerHTML=sidebar();
  const gsFocus=document.activeElement&&document.activeElement.hasAttribute('data-gs');
  $('#top').innerHTML=topbar(P);
  if(gsFocus){const i=$('[data-gs]');i.focus();i.setSelectionRange(i.value.length,i.value.length)}
  const v=$('#view');
  const af=document.activeElement;const qk=af&&af.dataset&&af.dataset.q;const caret=qk?af.selectionStart:0;
  v.innerHTML=P.html;v.className='view '+(enter?'enter':'refresh');
  document.title=P.title.replace(/<[^>]+>/g,'')+' · NavigAItor';
  document.documentElement.classList.toggle('collapsed',UI.collapsed);
  positionTabs();
  if(qk){const el=$(`[data-q="${qk}"]`);if(el){el.focus();try{el.setSelectionRange(caret,caret)}catch(e){}}}
  if(UI.openDD){const s=$(`[data-dd="${UI.openDD}"] .dd-search`);if(s){s.focus();filterDD(s)}else{const o=$(`[data-dd="${UI.openDD}"] .dd-opt.sel`)||$(`[data-dd="${UI.openDD}"] .dd-opt`);o&&o.focus({preventScroll:true})}}
  if(UI.drawer||UI.modal)drawLayer(false);
  P.after&&P.after();
  countUps();
}
function positionTabs(){$$('.tabs').forEach(t=>{const on=t.querySelector('button.on');const ind=t.querySelector('.ind');if(on&&ind){ind.style.left=on.offsetLeft+'px';ind.style.width=on.offsetWidth+'px'}})}
function countUps(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;$$('[data-count]').forEach(el=>{if(el.dataset.done)return;el.dataset.done=1;const to=+el.dataset.count;const pre=el.dataset.pre||'';const t0=performance.now();const D=420;const step=t=>{const k=Math.min(1,(t-t0)/D);el.textContent=pre+Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)})}
const num=(v,pre='')=>v==null?'—':`<span data-count="${v}" data-pre="${pre}">${pre}${v}</span>`;

/* ---------- events ---------- */
const ACT={};
function applyF(fn,keepDD=false){fn();UI.notes=normalizeF();Object.keys(UI.page).forEach(k=>UI.page[k]=1);if(!keepDD)UI.openDD=null;saveF();render()}
function filterDD(inp){const q=inp.value.toLocaleLowerCase('tr');UI.ddQ=inp.value;const box=inp.closest('.dd-pop');let n=0;box.querySelectorAll('.dd-opt').forEach(o=>{const show=!q||o.dataset.s.includes(q);o.hidden=!show;if(show)n++});const none=box.querySelector('[data-ddnone]');if(none)none.hidden=n>0}
Object.assign(ACT,{
  nav:(el)=>{const id=el.dataset.v;const n=NAV.find(x=>x.id===id);if(n.subs){if(navActive(id)){UI.navOpen.has(id)?UI.navOpen.delete(id):UI.navOpen.add(id);$('#side').innerHTML=sidebar();$(`[data-act=nav][data-v=${id}]`).focus();return}UI.navOpen.add(id);go(id+'/'+n.subs[0][0])}else go(id)},
  collapse:()=>{UI.collapsed=!UI.collapsed;lsSet(LS_KEY+'-c',UI.collapsed);render()},
  navOpen:()=>{document.body.classList.add('nav-open');$('#navScrim').hidden=false},
  navClose:()=>{document.body.classList.remove('nav-open');$('#navScrim').hidden=true},
  ddToggle:(el)=>{const k=el.dataset.k;UI.ddQ='';UI.openDD=UI.openDD===k?null:k;render()},
  ddPick:(el)=>{const k=el.dataset.k;const fd=FIELDS[k];applyF(()=>fd.set(fd.multi&&k==='grade'?el.dataset.v:el.dataset.v),!!fd.multi)},
  ddClear:(el)=>{const fd=FIELDS[el.dataset.k];applyF(()=>fd.clear?fd.clear():fd.set(fd.def),true)},
  ddClose:()=>{UI.openDD=null;render()},
  chipRm:(el)=>{const fd=FIELDS[el.dataset.k];applyF(()=>{if(fd.multi)fd.set(el.dataset.k==='grade'?+el.dataset.v:el.dataset.v);else fd.set(fd.def)})},
  fClear:()=>applyF(()=>{const pgs=F.pg;Object.assign(F,F_DEF());F.pg=pgs;delete F.pg[UI.route+'/'+UI.sub];UI.q={}}),
  tab:(el)=>{UI.tabs[el.dataset.k]=el.dataset.v;render()},
  seg:(el)=>{UI.tabs[el.dataset.k]=el.dataset.v;render()},
  pg:(el)=>{UI.page[el.dataset.k]=+el.dataset.v;render();const t=$('.lhead')||$('#view');t&&t.scrollIntoView({block:'nearest'})},
  sort:(el)=>{const k=el.dataset.k,c=el.dataset.v;const s=UI.sort[k];UI.sort[k]={c,d:s&&s.c===c?-s.d:1};render()},
  tableT:(el)=>{UI.table[el.dataset.k]=!UI.table[el.dataset.k];render()},
  closeLayer:()=>closeLayer(),
  pop:(el)=>{UI.pop=UI.pop===el.dataset.v?null:el.dataset.v;$('#top').innerHTML=topbar((PAGES[UI.route]||PAGES.home)(UI.sub,UI.param))},
  notifOpen:(el)=>{const n=DB.notifs.find(x=>x.id===el.dataset.v);n.read=true;save();UI.pop=null;if(n.to)go(n.to);else render()},
  gsKz:(el)=>{const k=kzOf(el.dataset.v);UI.pop=null;UI.gq='';applyF(()=>{F.grade=[];F.sections=[];F.course=k.course;F.unit=unitKey(k);F.topic='';F.kz=[k.id]});go('analytics/konu')},
  resetDemo:()=>{openModal(()=>({title:'Demo verisi sıfırlansın mı?',body:'<p style="margin:0">Atamalar, değerlendirmeler, uyarı durumları, notlar ve profil düzenlemeleri başlangıç hâline döner. Bu işlem geri alınamaz.</p>',foot:`<button class="btn sec" data-act="closeLayer">Vazgeç</button><button class="btn pri" data-act="resetDo">Sıfırla</button>`}))},
  resetDo:()=>{DB=buildDB();F=F_DEF();save();saveF();UI.pop=null;closeLayer();render();toast('Demo verisi başlangıç hâline döndü')},
  logout:()=>{UI.pop=null;toast('Prototipte oturum kapatma devre dışı');render()},
  back:(el)=>back(el.dataset.v||'home'),
  copy:(el)=>{const t=el.dataset.v;const done=()=>toast('Panoya kopyalandı');try{navigator.clipboard.writeText(t).then(done,()=>{toast('Kopyalanamadı — metni seçip kopyalayın')})}catch(e){toast('Kopyalanamadı — metni seçip kopyalayın')}},
});
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act],[data-go]');
  if(UI.openDD&&!e.target.closest('.dd')){UI.openDD=null;if(!a){render();return}}
  if(UI.pop&&!e.target.closest('.pop')&&!(a&&a.dataset.act==='pop')&&!e.target.closest('.gsearch')){UI.pop=null;if(!a){$('#top').innerHTML=topbar((PAGES[UI.route]||PAGES.home)(UI.sub,UI.param));return}}
  if(!a)return;
  if(a.tagName==='A'&&a.getAttribute('href')&&a.getAttribute('href').startsWith('#sec-'))return;
  if(a.dataset.go!==undefined&&!a.dataset.act){e.preventDefault();UI.pop=null;if(UI.drawer||UI.modal){UI.drawer=null;UI.modal=null;drawLayer(false)}go(a.dataset.go);return}
  const fn=ACT[a.dataset.act];if(fn){if(!a.closest('#layer'))UI.lastFocus=a;fn(a,e)}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(UI.openDD){UI.openDD=null;render();return}if(UI.pop){UI.pop=null;render();return}if(UI.modal||UI.drawer){closeLayer();return}if(document.body.classList.contains('nav-open'))ACT.navClose()}
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role=button]:not(button),tr.click,.cell[tabindex]')){e.preventDefault();e.target.click()}
  if(e.key==='Enter'&&e.target.matches('[data-gs]')){const b=$('#gsres button');b&&b.click()}
  if((e.key==='ArrowDown'||e.key==='ArrowUp')&&e.target.closest('.dd-pop')){const os=$$('.dd-pop .dd-opt').filter(o=>!o.hidden);const i=os.indexOf(document.activeElement);const n=e.key==='ArrowDown'?os[Math.min(os.length-1,i+1)]:os[Math.max(0,i-1)];if(n){e.preventDefault();n.focus()}}
});
let qTimer=null;
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.matches('[data-ddsearch]')){filterDD(t);return}
  if(t.matches('[data-gs]')){UI.gq=t.value;UI.pop='gs';let r=$('#gsres');if(!r){t.insertAdjacentHTML('afterend',`<div class="pop gs-res" id="gsres"></div>`);r=$('#gsres')}r.innerHTML=gsResults(t.value);return}
  if(t.dataset.q!==undefined){UI.q[t.dataset.q]=t.value;Object.keys(UI.page).forEach(k=>UI.page[k]=1);clearTimeout(qTimer);qTimer=setTimeout(()=>render(),180);return}
  if(t.dataset.inp&&ACT[t.dataset.inp])ACT[t.dataset.inp](t,e);
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.pgin){UI.page[t.dataset.pgin]=parseInt(t.value)||1;render();return}
  if(t.dataset.chg&&ACT[t.dataset.chg])ACT[t.dataset.chg](t,e);
});
document.addEventListener('focusin',e=>{if(e.target.matches('[data-gs]')){UI.pop='gs';if(!$('#gsres')){e.target.insertAdjacentHTML('afterend',`<div class="pop gs-res" id="gsres">${gsResults(e.target.value)}</div>`)}}});
// tooltips
const tipEl=()=>$('#tip');
function showTip(el){let h=el.dataset.tipid?TIPS.get(el.dataset.tipid):esc(el.dataset.tip);if(!h)return;const t=tipEl();t.innerHTML=h;t.classList.add('on');const r=el.getBoundingClientRect();const tw=t.offsetWidth,tht=t.offsetHeight;let x=r.left+r.width/2-tw/2;x=clamp(x,8,innerWidth-tw-8);let y=r.top-tht-10;if(y<8)y=r.bottom+10;t.style.left=x+'px';t.style.top=y+'px'}
const hideTip=()=>tipEl().classList.remove('on');
document.addEventListener('mouseover',e=>{const el=e.target.closest('[data-tipid],[data-tip]');if(el)showTip(el);else hideTip()});
document.addEventListener('focusin',e=>{const el=e.target.closest('[data-tipid],[data-tip]');if(el)showTip(el);else hideTip()});
document.addEventListener('scroll',hideTip,true);
window.addEventListener('resize',()=>positionTabs());
