/* ================= ROL KABUĞU: öğrenci / veli + demo kontrolü ================= */
const role=()=>UI.route&&UI.route.startsWith('o-')?'s':UI.route&&UI.route.startsWith('v-')?'p':'t';
Object.assign(DEF_SUB,{'o-ders':'tum','o-calisma':'etkinlik','o-sinav':'yaklasan','o-gelisim':'basari','o-basari':'rozet'});
const SNAV=[
 {grp:'Ana Navigasyon'},
 {id:'o-home',l:'Ana Sayfa',ic:'home'},
 {id:'o-ders',l:'Derslerim',ic:'book',subs:[['tum','Tüm Dersler'],['icerik','Ders İçerikleri'],['hafta','Bu Haftanın Aktiviteleri']]},
 {id:'o-calisma',l:'Çalışma Alanım',ic:'clip',cnt:()=>DB.st.plan.filter(t=>!t.exam&&t.d<=isoAdd(stuToday(),1)&&taskStatus(t)!=='Tamamlandı').length,cntL:'bekleyen görev',subs:[['etkinlik','Etkinliklerim'],['tekrar','Tekrar Edilecekler'],['sifir','Sıfır Hata'],['studyo','Dijital Ürün Stüdyosu']]},
 {id:'o-sinav',l:'Sınavlarım',ic:'target',subs:[['yaklasan','Yaklaşan Sınavlar'],['sonuc','Sonuçlarım'],['havuz','Soru Havuzu']]},
 {id:'o-gelisim',l:'Gelişimim',ic:'chart',subs:[['basari','Başarım'],['guclu','Güçlü Yönlerim'],['gelistir','Geliştireceklerim']]},
 {id:'o-plan',l:'Çalışma Planım',ic:'cal'},
 {id:'o-basari',l:'Başarılarım',ic:'flag',subs:[['rozet','Rozetlerim'],['seri','Öğrenme Serim']]},
 {grp:'AI',ai:1},
 {id:'o-asistan',l:'Öğrenme Asistanım',ic:'spark'},
 {grp:'Sistem'},
 {id:'o-bildirim',l:'Bildirimler',ic:'bell',cnt:()=>DB.st.notifs.filter(n=>!n.read).length,cntL:'okunmamış'},
 {id:'o-ayarlar',l:'Ayarlar',ic:'sliders'},
 {id:'o-yardim',l:'Yardım',ic:'info'},
 {id:'o-profil',l:'Profil',ic:'idcard'}
];
function stuSidebar(){const s=myStu();
  let h=`<div class="side-hd"><div class="org"><div class="logo" aria-hidden="true">A</div><div><b>${TEACHER.orgShort}</b><small>${TEACHER.org}</small></div></div><div class="me" title="Elif Yıldız · 7/A"><div class="av" style="background:${DB.st.avatar};color:#fff">EY</div><div><b>${esc(fullName(s))}</b><small>${s.section} · Öğrenci</small></div></div></div><nav class="side-nav" aria-label="Öğrenci menüsü">`;
  SNAV.forEach(n=>{if(n.grp){h+=`<div class="grp ${n.ai?'ai':''}">${n.grp}</div>`;return}
    const on=UI.route===n.id||(n.id==='o-calisma'&&UI.route==='o-soru');const open=n.subs&&UI.navOpen.has(n.id);const c=n.cnt?n.cnt():0;
    h+=`<button class="nv ${on?'on':''} ${open?'open':''}" data-act="onav" data-v="${n.id}" ${on?'aria-current="page"':''} ${n.subs?`aria-expanded="${!!open}"`:''} ${UI.collapsed?`data-tip="${n.l}"`:''}>${ic(n.ic,19)}<span class="lbl">${n.l}</span>${c?`<span class="cnt" aria-label="${c} ${n.cntL}">${c}</span>`:''}${n.subs?ic('cd',15,'car'):''}</button>`;
    if(n.subs)h+=`<div class="sub ${open?'open':''}"><div>${n.subs.map(([s2,l])=>`<button class="${on&&UI.sub===s2?'on':''}" data-go="${n.id}/${s2}" tabindex="${open?0:-1}">${l}</button>`).join('')}</div></div>`});
  return h+`</nav><div class="side-ft"><span class="brand">Navig<span>AI</span>tor</span><button class="icb-s" data-act="collapse" aria-label="Menüyü daralt">${ic('panel',18)}</button></div>`}
ACT.onav=el=>{const id=el.dataset.v;const n=SNAV.find(x=>x.id===id);if(n.subs){if(UI.route===id){UI.navOpen.has(id)?UI.navOpen.delete(id):UI.navOpen.add(id);$('#side').innerHTML=sidebar();return}go(id+'/'+n.subs[0][0])}else go(id)};
function stuTop(P){const n=DB.st.notifs.filter(x=>!x.read).length;
  return `<button class="icb menu-btn" data-act="navOpen" aria-label="Menüyü aç">${ic('menu')}</button>
  <div class="ttl"><div class="crumb">${(P.crumbs||[]).map((c,i)=>i<P.crumbs.length-1?`<button data-go="${c[1]}">${esc(c[0])}</button>${ic('cr',12)}`:`<span>${esc(c[0])}</span>`).join('')}</div><h1 class="pt">${P.title}</h1></div>
  <div class="gsearch"><span class="gi">${ic('search',17)}</span><input data-sgs placeholder="Ders, konu veya soru ara…" aria-label="Ders, konu veya soru ara" value="${esc(UI.sgq||'')}" autocomplete="off"></div>
  <span class="tpill" title="Bugünkü aktif çalışma süresi">${ic('clock',15)} <b id="todayMin">${Math.round(todayMins())}</b> dk bugün</span>
  <button class="icb" data-go="o-bildirim" aria-label="Bildirimler, ${n} okunmamış">${ic('bell')}${n?`<span class="dot">${n}</span>`:''}</button>
  <button class="pf-btn" data-go="o-profil" aria-label="Profil"><span class="av" style="background:${DB.st.avatar}">EY</span><b>Elif</b></button>`}
function sgsResults(q){q=q.trim().toLocaleLowerCase('tr');if(q.length<2)return '<div class="dd-empty">En az 2 harf yaz.</div>';
  const cs=Object.keys(COURSES).filter(c=>COURSES[c].name.toLocaleLowerCase('tr').includes(q));const ks=KZ.filter(k=>k.grade===7&&(k.topic+' '+k.name).toLocaleLowerCase('tr').includes(q)).slice(0,5);const qs=Object.entries(QB).filter(([id,x])=>x.stem&&x.stem.toLocaleLowerCase('tr').includes(q)).slice(0,4);
  if(!cs.length&&!ks.length&&!qs.length)return stateBox('none','Sonuç bulunamadı','Başka bir kelime dene: “kesir”, “denklem”, “fen”.');
  return (cs.length?'<h6>Dersler</h6>'+cs.map(c=>`<button data-act="sgCourse" data-v="${c}">${cIcon(c,16)}<b>${COURSES[c].name}</b></button>`).join(''):'')+(ks.length?'<h6>Konular</h6>'+ks.map(k=>`<button data-act="sgKz" data-v="${k.id}">${ic('target',16)}<span><b>${esc(k.topic)}</b><br><span class="small muted">${esc(k.name)}</span></span></button>`).join(''):'')+(qs.length?'<h6>Sorular</h6>'+qs.map(([id,x])=>`<button data-act="sgKz" data-v="${x.kz}">${ic('clip',16)}<span class="small">${esc(x.stem)}</span></button>`).join(''):'')}
ACT.sgCourse=el=>{UI.sf.course=el.dataset.v;UI.sf.kz='';UI.sgq='';go('o-ders/icerik')};
ACT.sgKz=el=>{const k=kzOf(el.dataset.v);UI.sf.course=k.course;UI.sf.kz=k.id;UI.sgq='';go('o-ders/icerik')};
document.addEventListener('input',e=>{if(e.target.matches('[data-sgs]')){UI.sgq=e.target.value;let r=$('#sgres');if(!r){e.target.insertAdjacentHTML('afterend','<div class="pop gs-res" id="sgres"></div>');r=$('#sgres')}r.innerHTML=sgsResults(e.target.value)}});
document.addEventListener('click',e=>{const r=$('#sgres');if(r&&!e.target.closest('.gsearch'))r.remove()});

/* öğrenci filtre çubuğu */
UI.sf=Object.assign({course:'',kz:'',src:'',status:'',date:'',type:''},lsGet(LS_KEY+'-sf')||{});
function sfBar(keys,count,label='sonuç'){const S=UI.sf;const notes=[];
  const kzOpts=KZ.filter(k=>k.grade===7&&(!S.course||k.course===S.course));if(S.kz&&!kzOpts.find(k=>k.id===S.kz)){notes.push('Konu seçimi kaldırıldı: seçtiğin derse ait değil.');S.kz=''}
  const sel=(k,l,opts)=>`<label class="sfl"><span>${l}</span><select class="sel" data-chg="sfSet" data-k="${k}" aria-label="${l}">${opts.map(o=>`<option value="${o[0]}" ${S[k]===o[0]?'selected':''}>${esc(o[1])}</option>`).join('')}</select></label>`;
  const M={course:()=>sel('course','Ders',[['','Tüm dersler'],...Object.keys(COURSES).map(c=>[c,COURSES[c].name])]),kz:()=>sel('kz','Konu / kazanım',[['','Tüm konular'],...kzOpts.map(k=>[k.id,k.topic])]),src:()=>sel('src','Kaynak',[['','Tümü'],['Öğretmen','Öğretmen ataması'],['Sistem','Sistem önerisi']]),status:()=>sel('status','Durum',[['','Tüm durumlar'],...Object.keys(ST_IC).map(x=>[x,x])]),date:()=>sel('date','Tarih',[['','Tüm tarihler'],['bugun','Bugün'],['hafta','Bu hafta'],['gec','Gecikenler']]),type:()=>sel('type','Etkinlik türü',[['','Tüm türler'],['sim','Simülasyon / oyun'],['set','Soru seti'],['studio','Dijital ürün'],['review','Tekrar'],['exam','Sınav']])};
  const active=keys.filter(k=>S[k]);
  return `<section class="sfbar" aria-label="Filtreler">${keys.map(k=>M[k]()).join('')}${active.length?`<button class="btn sm ghost" data-act="sfClear">${ic('x',14)} Temizle</button>`:''}<span class="res">${count} ${label}</span>${notes.map(n=>`<div class="notice" style="flex-basis:100%">${ic('info',15)} ${n}</div>`).join('')}</section>`}
ACT.sfSet=t=>{UI.sf[t.dataset.k]=t.value;if(t.dataset.k==='course')UI.sf.kz='';lsSet(LS_KEY+'-sf',UI.sf);render()};
ACT.sfClear=()=>{UI.sf={course:'',kz:'',src:'',status:'',date:'',type:''};lsSet(LS_KEY+'-sf',UI.sf);render()};

/* demo kontrolü */
function demoBar(){const r=role();const open=UI.demoOpen;
  return `<div class="demo ${open?'open':''}" role="region" aria-label="Demo kontrolü"><div class="demo-row"><span class="demo-lbl">${ic('layers',14)} Demo</span>${seg('drole',[['s','Öğrenci'],['t','Öğretmen'],['p','Veli']],r,'roleSet')}<button class="btn xs sec" data-act="demoT" aria-expanded="${!!open}">${open?'Kapat':'Araçlar'}</button></div>
  ${open?`<div class="demo-pop"><div class="small muted" style="margin-bottom:8px">Rol seçimi yalnızca demo içindir; gerçek yetki sistemi değildir. Navi yanıtları kurallı demo motorundan gelir, gerçek bir yapay zekâ modeline bağlı değildir.</div>
   <div class="lab">Zorunlu senaryo</div><ol class="demo-steps">${[['Ana sayfa ve Navi karşılaması','o-home'],['Kesirler etkinliğine başla','o-soru/set-a1'],['Öğretmen kanıtı (Elif · Tüm Değerlendirmeler)','student/assess/s4'],['Veli Evde Destek','v-home']].map((x,i)=>`<li><button class="lnk" data-go="${x[1]}">${x[0]}</button></li>`).join('')}</ol>
   <div class="lab" style="margin-top:8px">Diğer örnekler</div><div class="row" style="gap:6px;margin-top:6px"><button class="btn xs sec" data-go="o-soru/set-a2">İşlem hatası</button><button class="btn xs sec" data-go="o-soru/set-denk">Strateji eksikliği</button><button class="btn xs sec" data-go="o-calisma/studyo">Dijital ürün teslimi</button><button class="btn xs sec" data-go="o-calisma/tekrar">Tekrar sonrası gelişim</button></div>
   <div class="divider" style="margin:10px 0"></div><div class="row" style="gap:6px"><button class="btn xs sec" data-act="advanceDay">${ic('cal',13)} Tekrar gününe ilerle (+7 gün)</button>${DB.st.shift?`<button class="btn xs ghost" data-act="backDay">Bugüne dön</button>`:''}<button class="btn xs ghost" data-act="resetDemo">${ic('refresh',13)} Demoyu sıfırla</button></div>${DB.st.shift?`<div class="notice" style="margin-top:8px">Demo tarihi: ${fmtDL(stuToday())}</div>`:''}</div>`:''}</div>`}
function drawDemo(){let d=$('#demo');if(!d){d=document.createElement('div');d.id='demo';document.body.appendChild(d)}d.innerHTML=demoBar()}
ACT.demoT=()=>{UI.demoOpen=!UI.demoOpen;drawDemo()};
ACT.roleSet=el=>{UI.demoOpen=false;const v=el.dataset.v;go(v==='s'?'o-home':v==='p'?'v-home':'home')};
ACT.advanceDay=()=>{DB.st.shift=(DB.st.shift||0)+7;save();render();toast(`Demo tarihi ${fmtDL(stuToday())} oldu · tekrar zamanı gelen çalışmalar açıldı`)};
ACT.backDay=()=>{DB.st.shift=0;save();render();toast('Demo tarihi bugüne döndü')};

/* kabuk kancaları */
const _tSidebar=sidebar,_tTopbar=topbar,_tRender=render;
sidebar=function(){const r=role();return r==='s'?stuSidebar():r==='p'?parSidebar():_tSidebar()};
topbar=function(P){const r=role();return r==='s'?stuTop(P):r==='p'?parTop(P):_tTopbar(P)};
render=function(e){ensureStu();if(typeof ensureSims==='function')ensureSims();syncStu();document.body.dataset.role=role();document.documentElement.dataset.text=DB.st.settings.text;document.body.classList.toggle('reduce',!!DB.st.settings.reduce);_tRender(e);drawDemo()};
const _resetDo=ACT.resetDo;ACT.resetDo=()=>{DB=buildDB();DB.st=null;ensureStu();F=F_DEF();save();saveF();UI.pop=null;UI.demoOpen=false;closeLayer();render();toast('Demo verisi başlangıç hâline döndü')};
setInterval(()=>tickTime(),1000);
