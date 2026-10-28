/* ================= ETKİNLİK KÜTÜPHANESİ (öğretmen · öğrenci · veli) =================
   ACTLIB (25-lib-data.js): 5 ders × 20 şablon etkinlik. Kazanımlar yalnızca adıyla, kodsuz.
   Öğretmen: Etkinlikler › Etkinlik Kütüphanesi (ders bazında filtre) → detay → sınıfa ata.
   Öğretmen: Yeni Etkinlik → [Kendim yazacağım] / [Yapay zekâdan iste].
   Öğrenci: Çalışma Alanım › Etkinliklerim (ders bazında) → detay → kontrol listesi → tamamla (öğretmene yansır). */
const LIB_ORDER=['TUR','MAT','FEN','SOS','ING'];
const LIB_GRAD={TUR:['#E07A2F','#FFC857'],MAT:['#B3123A','#FF8A6B'],FEN:['#1F9D6B','#7BDCB5'],SOS:['#6A55C8','#B79CFF'],ING:['#2F7DD8','#7CC6FF']};
const libOf=id=>ACTLIB.find(a=>a.id===id);
const libMins=a=>parseInt(a.duration)||40;
const libCourse=c=>COURSE_UI[c]?COURSE_UI[c].e:c;
const isStu=()=>typeof role==='function'&&role()!=='t';

/* ---- kart ---- */
function libCard(a,href){const g=LIB_GRAD[a.course];
  return `<button class="lib-card" data-go="${href}" style="--g1:${g[0]};--g2:${g[1]}">
   <span class="lib-cv"><span class="lib-vi" aria-hidden="true">${VIS_IC[a.visual.type]||'✨'}</span><span class="lib-gr">${a.grade}. sınıf</span></span>
   <span class="lib-cb"><span class="lib-th">${esc(a.themeName)}</span><b class="lib-t">${esc(a.title)}</b><span class="lib-st">${esc(a.subtitle)}</span>
    <span class="lib-sk">${a.skills21.slice(0,3).map(s=>`<i>${esc(s)}</i>`).join('')}${a.skills21.length>3?`<i class="more">+${a.skills21.length-3}</i>`:''}</span>
    <span class="lib-meta">${ic('clock',12)} ${esc(a.duration)} · ${ic('users',12)} ${esc(a.format)}</span></span></button>`}

/* ---- filtre çubuğu (ders bazında, karışmaz) ---- */
function libFilter(S,opts={}){const grades=opts.grades||[5,6,7,8];const sk=[...new Set(ACTLIB.filter(a=>a.course===S.c).flatMap(a=>a.skills21))].sort((a,b)=>a.localeCompare(b,'tr'));
  return `<section class="lib-fbar ${opts.cls||'card panel'}"><div class="lib-frow"><span class="lib-fl">Ders</span><div class="seg lib-seg">${LIB_ORDER.map(c=>`<button class="${S.c===c?'on':''}" data-act="libSet" data-k="c" data-v="${c}">${cIcon(c,14)} ${libCourse(c)}</button>`).join('')}</div></div>
   <div class="lib-frow">${grades.length>1?`<span class="lib-fl">Sınıf</span><div class="seg">${['',...grades].map(g=>`<button class="${String(S.g)===String(g)?'on':''}" data-act="libSet" data-k="g" data-v="${g}">${g?g+'. sınıf':'Tümü'}</button>`).join('')}</div>`:''}
    <label class="lib-fl" for="libSk">21. yy becerisi</label><select class="sel" id="libSk" data-chg="libSk" style="max-width:220px"><option value="">Tüm beceriler</option>${sk.map(s=>`<option ${S.sk===s?'selected':''}>${esc(s)}</option>`).join('')}</select>
    <input class="in" data-q="lib" value="${esc((UI.q||{}).lib||'')}" placeholder="Etkinlik ara…" aria-label="Etkinlik ara" style="max-width:220px;min-height:36px"></div></section>`}
function libList(S,grades){const q=((UI.q||{}).lib||'').toLocaleLowerCase('tr');
  return ACTLIB.filter(a=>a.course===S.c&&grades.includes(a.grade)&&(!S.g||a.grade===+S.g)&&(!S.sk||a.skills21.includes(S.sk))&&(!q||(a.title+' '+a.subtitle+' '+a.themeName+' '+a.kazanim.join(' ')).toLocaleLowerCase('tr').includes(q)))}
ACT.libSet=el=>{const S=UI.lib||(UI.lib={c:'MAT',g:'',sk:''});S[el.dataset.k]=el.dataset.v;if(el.dataset.k==='c')S.sk='';render()};
ACT.libSk=el=>{(UI.lib||(UI.lib={c:'MAT',g:'',sk:''})).sk=el.value;render()};

/* ---- detay ---- */
function libDetail(a,o={}){const g=LIB_GRAD[a.course];const T=!o.student;const key='lib-'+a.id;const ck=(UI.libChk||(UI.libChk={}))[a.id]||{};
  return `<article class="lib-d">
  <header class="lib-hd" style="--g1:${g[0]};--g2:${g[1]}"><div class="lib-hd-t"><span class="lib-k">${cIcon(a.course,16)} ${libCourse(a.course)} · ${a.grade}. sınıf · ${esc(a.themeName)}</span><h2>${esc(a.title)}</h2><p>${esc(a.subtitle)}</p>
   <div class="lib-chips"><span>${ic('clock',13)} ${esc(a.duration)}</span><span>${ic('users',13)} ${esc(a.format)}</span>${o.extra||''}</div></div><span class="lib-big" aria-hidden="true">${VIS_IC[a.visual.type]||'✨'}</span></header>
  <div class="lib-tags">
   <div class="lib-tag kz"><span class="lt-h">📌 Kazanım</span>${a.kazanim.map(k=>`<p>${esc(k)}</p>`).join('')}</div>
   <div class="lib-tag s21"><span class="lt-h">🤝 21. yüzyıl becerileri</span><div class="lt-c">${a.skills21.map(s=>`<i>${esc(s)}</i>`).join('')}</div></div>
   <div class="lib-tag dig"><span class="lt-h">💻 Dijital beceriler</span><div class="lt-c">${a.digital.map(s=>`<i>${esc(s)}</i>`).join('')}</div></div>
   <div class="lib-tag tl"><span class="lt-h">🧰 Araçlar</span><div class="lt-c">${a.tools.map(s=>`<i>${esc(s)}</i>`).join('')}</div></div></div>
  <section class="lib-sec lib-scn"><h3>🎯 Senaryo — Oku, Anla, Düşün</h3><p>${esc(a.scenario)}</p></section>
  <section class="lib-sec"><h3>🖼️ Görsel</h3>${VIS.render(a.visual,key)}</section>
  <section class="lib-sec"><h3>📋 Etkinlik adımları</h3><p class="meta" style="margin:-4px 0 10px">Her adımı sırayla tamamla. Bir adım bitmeden sonrakine geçme.</p>
   <ol class="lib-steps">${a.steps.map((s,i)=>`<li><span class="ls-n">${i+1}</span><div class="ls-b"><div class="ls-h"><b>${esc(s.title)}</b><span class="ls-m">${esc(s.mode||'')}</span></div><ul>${s.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${s.warn?`<div class="ls-w">⚠️ ${esc(s.warn)}</div>`:''}</div></li>`).join('')}</ol></section>
  <div class="lib-2col">
   <section class="lib-sec"><h3>✅ Teslim kontrol listesi</h3><div class="lib-chk">${a.checklist.map((c,i)=>`<label class="${ck[i]?'on':''}"><input type="checkbox" data-chg="libChk" data-k="${a.id}" data-v="${i}" ${ck[i]?'checked':''} ${T?'disabled':''}> <span>${esc(c)}</span></label>`).join('')}</div>
    ${o.student?`<div class="lib-done">${o.doneBtn||''}</div>`:''}</section>
   <section class="lib-sec lib-navi"><h3>💬 Navi’nin soruları</h3><div class="row" style="align-items:flex-start;flex-wrap:nowrap;gap:10px">${typeof navi==='function'?navi('ask',44):''}<div class="col" style="gap:8px">${a.navi.map(n=>`<div class="lib-q">${esc(n)}</div>`).join('')}<span class="meta">Navi cevabı söylemez; düşünmeni sağlayan sorular sorar.</span></div></div></section></div>
  ${T?`<section class="lib-sec"><h3>📏 Puanlama rubriği</h3><div class="tw"><table class="t lib-rub"><thead><tr><th>Ölçüt</th><th>4 · Mükemmel</th><th>3 · Yeterli</th><th>2 · Gelişiyor</th><th>1 · Başlangıç</th></tr></thead><tbody>${a.rubric.map(r=>`<tr><td><b>${esc(r.k)}</b><div class="meta">${esc(r.d)}</div></td><td>${esc(r.l4)}</td><td>${esc(r.l3)}</td><td>${esc(r.l2)}</td><td>${esc(r.l1)}</td></tr>`).join('')}</tbody></table></div></section>`:''}
  ${T?`<div class="lib-2col"><section class="lib-sec"><h3>🎚️ Farklılaştırma</h3><p><b>Destek:</b> ${esc(a.diff.destek)}</p><p><b>İleri düzey:</b> ${esc(a.diff.ileri)}</p></section><section class="lib-sec"><h3>🔎 Hedeflenen yanılgı</h3><p>${esc(a.misconception)}</p><p class="meta">Sistem bu şablonu her öğrencinin düzeyine göre yeniden kurar; sayılar, bağlam ve iskele öğrenciye özgü üretilir.</p></section></div>`:''}
  </article>`}
ACT.libChk=el=>{const id=el.dataset.k;const C=(UI.libChk||(UI.libChk={}));C[id]=C[id]||{};C[id][el.dataset.v]=el.checked;if(DB.st){DB.st.libChk=DB.st.libChk||{};DB.st.libChk[id]=C[id];save()}render()};

/* ================= ÖĞRETMEN ================= */
function libTeacherPage(){const S=UI.lib||(UI.lib={c:TEACHER.course||'MAT',g:'',sk:''});const L=libList(S,[5,6,7,8]);const byG=[5,6,7,8].filter(g=>!S.g||+S.g===g);
  return libFilter(S)+`<section class="card panel"><div class="card-hd"><div class="t"><h2 class="st">${libCourse(S.c)} etkinlikleri</h2><div class="meta">${L.length} şablon etkinlik · kazanımlar resmi öğretim programından · her etkinlikte 21. yüzyıl becerileri yazılı</div></div><button class="btn pri" data-go="activities/yeni">${ic('plus',16)} Yeni etkinlik</button></div>
   ${L.length?byG.map(g=>{const xs=L.filter(a=>a.grade===g);return xs.length?`<h3 class="lib-gh">${g}. sınıf <span class="meta">${xs.length} etkinlik</span></h3><div class="lib-grid">${xs.map(a=>libCard(a,'activities/etkinlik/'+a.id)).join('')}</div>`:''}).join(''):stateBox('none','Etkinlik bulunamadı','Filtreleri değiştirin.')}</section>`}
function libTeacherDetail(id){const a=libOf(id);if(!a)return stateBox('err','Etkinlik bulunamadı','');const asg=DB.acts.filter(x=>x.lib===id);
  return `<div class="row" style="margin-bottom:12px"><button class="btn sec" data-go="activities/kutuphane">${ic('cl',15)} Kütüphaneye dön</button><span class="sp"></span>${asg.length?`<span class="pill p-soft">${ic('send',12)} ${asg.map(x=>x.sections.join(', ')).join(' · ')} şubesine atandı</span>`:''}<button class="btn sec" data-act="libToWiz" data-v="${id}">${ic('edit',15)} Düzenleyerek kullan</button><button class="btn pri" data-act="libAssign" data-v="${id}">${ic('send',15)} Sınıfa ata</button></div>`+libDetail(a)}
ACT.libAssign=el=>{const a=libOf(el.dataset.v);const secs=SECTIONS.filter(s=>GRADE_OF(s)===a.grade);UI.libA={secs:secs.slice(0,1),due:isoAdd(TODAY,7)};
  openModal(()=>{const A=UI.libA;return {title:'Etkinliği ata',sub:`${esc(a.title)} · ${a.grade}. sınıf · ${libCourse(a.course)}`,body:secs.length?`<div class="fld"><label>Şubeler</label><div class="row" style="gap:6px">${secs.map(s=>`<button class="pill ${A.secs.includes(s)?'p-ink':'p-out'} chipb" data-act="libASec" data-v="${s}">${s}${TEACHER.guidance.includes(s)?' · rehberlik':''}</button>`).join('')}</div></div><div class="fld"><label for="libDue">Teslim tarihi</label><input class="in" type="date" id="libDue" value="${A.due}" data-chg="libDue"></div><p class="meta">Atanan şubedeki öğrencilerin Çalışma Alanı’na eklenir. Sistem şablonu her öğrencinin düzeyine göre kişiselleştirir.</p>`:stateBox('empty','Bu sınıf düzeyinde şubeniz yok',`${a.grade}. sınıf şubeniz olmadığı için atama yapılamaz; şablonu düzenleyerek kullanabilirsiniz.`),
   foot:`<button class="btn sec" data-act="closeLayer">Vazgeç</button>${secs.length?`<button class="btn pri" data-act="libADo" data-v="${a.id}" ${A.secs.length?'':'disabled'}>${ic('send',15)} Ata</button>`:''}`}})};
ACT.libASec=el=>{const A=UI.libA;const s=el.dataset.v;A.secs=A.secs.includes(s)?A.secs.filter(x=>x!==s):[...A.secs,s];drawLayer(false)};
ACT.libDue=el=>{UI.libA.due=el.value};
function libAssignTo(a,secs,due,src='Öğretmen'){const targets=DB.students.filter(s=>secs.includes(s.section)).map(s=>s.id);const id=uid('a');
  DB.acts.unshift({id,title:a.title,type:'Kütüphane etkinliği',course:a.course,sections:secs.slice(),kz:[],lib:a.id,src,created:TODAY,due,status:'Atandı',needsEval:false,targets,subs:Object.fromEntries(targets.map(t=>[t,{state:'başlamadı'}])),instructions:a.scenario});
  if(secs.includes(myStu().section)&&DB.st&&!DB.st.plan.some(p=>p.lib===a.id)){DB.st.plan.push({id:'pl-'+id,title:a.title,course:a.course,mins:libMins(a),src,d:due,lib:a.id,act:id,fixed:true});DB.st.notifs.unshift({id:uid('sn'),type:'Yeni etkinlik',text:`${TEACHER.name} “${a.title}” etkinliğini atadı.`,d:TODAY,read:false,to:'o-etk/'+a.id})}
  return id}
ACT.libADo=el=>{const a=libOf(el.dataset.v);const A=UI.libA;UI.modal=null;commit(`“${a.title}” ${A.secs.join(', ')} şubesine atandı`,()=>{libAssignTo(a,A.secs,A.due)})};
ACT.libToWiz=el=>{const a=libOf(el.dataset.v);UI.wiz={step:4,kz:[],sections:SECTIONS.filter(s=>GRADE_OF(s)===a.grade).slice(0,1),students:[],type:'Kavram pekiştirme',course:a.course,title:a.title,instructions:a.scenario+'\n\n'+a.steps.map((s,i)=>`${i+1}. ${s.title}: ${s.items.join(' ')}`).join('\n'),libFrom:a.id};UI.wizMode='manual';go('activities/yeni')};

/* ---- Yeni etkinlik: iki seçenek ---- */
function newActChooser(){const m=UI.wizMode;
  return `<section class="card panel na-choose"><div class="card-hd"><div class="t"><h2 class="st">Etkinliği nasıl oluşturmak istersiniz?</h2><div class="meta">İki yol da aynı atama ve değerlendirme akışına bağlanır</div></div></div>
   <div class="na-opts"><button class="na-opt ${m==='manual'?'on':''}" data-act="naMode" data-v="manual"><span class="na-ic">✍️</span><b>Kendim yazacağım</b><span>Kazanımı, öğrenci grubunu, soruları, cevapları ve yönergeyi adım adım siz belirlersiniz.</span></button>
   <button class="na-opt ai ${m==='ai'?'on':''}" data-act="naMode" data-v="ai"><span class="na-ic">✨</span><b>Yapay zekâdan iste</b><span>Ders, sınıf, kazanım ve öğrenci düzeyini seçin; Navi 21. yüzyıl becerileriyle eşlenmiş bir taslak hazırlasın, siz onaylayın.</span></button></div></section>`}
ACT.naMode=el=>{UI.wizMode=el.dataset.v;render()};
function aiForm(){const F=UI.ai||(UI.ai={c:TEACHER.course||'MAT',g:7,u:0,k:'',lvl:'orta',dur:'40 dk',fmt:'Bireysel',note:'',res:null,busy:false,v:0});
  const G=RESMI[F.c][F.g];const units=G?G.u:[];const u=units[F.u]||units[0];const kzs=u?u.c.filter(c=>c[1]).map(c=>c[1]):[];if(!kzs.includes(F.k))F.k=kzs[0]||'';
  return `<section class="card panel ai-form"><div class="card-hd"><div class="t"><h2 class="st">${ic('spark',18)} Yapay zekâdan etkinlik iste</h2><div class="meta">Kazanımlar resmi öğretim programından · çıktı bir taslaktır; öğretmen onayı olmadan öğrenciye gitmez</div></div></div>
   <div class="grid g3"><div class="fld"><label>Ders</label><select class="sel" data-chg="aiSet" data-k="c">${LIB_ORDER.map(c=>`<option value="${c}" ${F.c===c?'selected':''}>${libCourse(c)}</option>`).join('')}</select></div>
    <div class="fld"><label>Sınıf</label><select class="sel" data-chg="aiSet" data-k="g">${[5,6,7,8].map(g=>`<option value="${g}" ${+F.g===g?'selected':''}>${g}. sınıf</option>`).join('')}</select></div>
    <div class="fld"><label>${UNIT_WORD[F.c]||'Ünite'}</label><select class="sel" data-chg="aiSet" data-k="u">${units.map((x,i)=>`<option value="${i}" ${+F.u===i?'selected':''}>${x.no}. ${esc(x.ad)}</option>`).join('')}</select></div></div>
   <div class="fld"><label>Kazanım</label>${kzs.length?`<select class="sel" data-chg="aiSet" data-k="k">${kzs.map(k=>`<option ${F.k===k?'selected':''}>${esc(k)}</option>`).join('')}</select>`:`<div class="meta">Bu temada kazanım metni yok; tema kapsamı kullanılacak${u&&u.kapsam?': '+esc([].concat(u.kapsam).join(' ')):''}.</div>`}</div>
   <div class="grid g3"><div class="fld"><label>Öğrenci düzeyi</label><div class="seg">${[['destek','Desteğe ihtiyacı var'],['orta','Sınıf düzeyinde'],['ileri','İleri düzey']].map(([v,l])=>`<button class="${F.lvl===v?'on':''}" data-act="aiSeg" data-k="lvl" data-v="${v}">${l}</button>`).join('')}</div></div>
    <div class="fld"><label>Süre</label><div class="seg">${['40 dk','80 dk (2 ders)'].map(v=>`<button class="${F.dur===v?'on':''}" data-act="aiSeg" data-k="dur" data-v="${v}">${v}</button>`).join('')}</div></div>
    <div class="fld"><label>Çalışma biçimi</label><div class="seg">${['Bireysel','İkili','Grup'].map(v=>`<button class="${F.fmt===v?'on':''}" data-act="aiSeg" data-k="fmt" data-v="${v}">${v}</button>`).join('')}</div></div></div>
   <div class="fld"><label for="aiNote">Ek isteğiniz (isteğe bağlı)</label><textarea class="ta" id="aiNote" data-inp="aiNote" placeholder="Örn. Okul bahçesi bağlamı olsun, görselli olsun, bir yanılgıya odaklansın.">${esc(F.note)}</textarea></div>
   <div class="row" style="justify-content:flex-end"><button class="btn pri lg" data-act="aiGen" ${F.busy?'disabled':''}>${F.busy?`<span class="typing"><i></i><i></i><i></i></span> Navi hazırlıyor…`:`${ic('spark',16)} Etkinlik taslağı üret`}</button></div></section>
   ${F.res?aiResult():''}`}
Object.assign(ACT,{
  aiSet:el=>{const F=UI.ai;const k=el.dataset.k;F[k]=k==='g'||k==='u'?+el.value:el.value;if(k==='c'||k==='g'){F.u=0;F.k=''}if(k==='u')F.k='';F.res=null;render()},
  aiSeg:el=>{UI.ai[el.dataset.k]=el.dataset.v;render()},
  aiNote:el=>{UI.ai.note=el.value},
  aiGen:()=>{const F=UI.ai;F.busy=true;F.res=null;render();setTimeout(()=>{F.busy=false;F.v=(F.v||0)+1;F.res=aiBuild(F);render();const r=$('.ai-res');r&&r.scrollIntoView({behavior:'smooth',block:'start'})},900)},
  aiAgain:()=>{ACT.aiGen()},
  aiSave:()=>{const F=UI.ai;const a=F.res;commit('Yapay zekâ taslağı kütüphaneye “Taslak” olarak eklendi',()=>{const id='ai-'+uid('x');const x={...a,id};ACTLIB.push(x);(DB.aiDrafts=DB.aiDrafts||[]).push(x);UI.lib={c:x.course,g:String(x.grade),sk:''}});go('activities/kutuphane')},
  aiEdit:()=>{const a=UI.ai.res;UI.wiz={step:4,kz:[],sections:SECTIONS.filter(s=>GRADE_OF(s)===a.grade).slice(0,1),students:[],type:'Kavram pekiştirme',course:a.course,title:a.title,instructions:a.scenario+'\n\n'+a.steps.map((s,i)=>`${i+1}. ${s.title}: ${s.items.join(' ')}`).join('\n')};UI.wizMode='manual';render();window.scrollTo({top:0})},
  aiAssign:()=>{const a=UI.ai.res;const id='ai-'+uid('x');const x={...a,id};ACTLIB.push(x);(DB.aiDrafts=DB.aiDrafts||[]).push(x);save();ACT.libAssign({dataset:{v:id}})}
});
/* demo kurallı üretici: aynı ders+sınıftaki şablonların yapısını ve beceri eşlemesini kullanır, istenen kazanıma ve düzeye uyarlar */
function aiBuild(F){const pool=ACTLIB.filter(a=>a.course===F.c&&a.grade===+F.g&&!String(a.id).startsWith('ai-'));const all=pool.length?pool:ACTLIB.filter(a=>a.course===F.c);
  const unit=RESMI[F.c][F.g].u[F.u]||RESMI[F.c][F.g].u[0];const W=t=>String(t||'').toLocaleLowerCase('tr').replace(/[^a-zçğıöşü0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>3).map(w=>w.slice(0,6));const kw=new Set(W(F.k));
  const score=a=>{let n=0;W(a.kazanim.join(' ')+' '+a.subtitle).forEach(w=>{if(kw.has(w))n++});const dg=Math.abs(a.grade-(+F.g));return n*2+(dg===0?3:dg===1?1:0)+(a.grade===+F.g&&a.themeName===unit.ad?2:0)};
  const ranked=ACTLIB.filter(a=>a.course===F.c&&!String(a.id).startsWith('ai-')).map(a=>[a,score(a)]).sort((x,y)=>y[1]-x[1]);const top=ranked.filter(r=>r[1]>=Math.max(1,ranked[0][1]-2)).map(r=>r[0]);const cand=top.length?top:ranked.map(r=>r[0]);const base=cand[(F.v-1)%cand.length];
  const b21=(window.B21&&B21[F.c]&&B21[F.c][F.g]&&B21[F.c][F.g][unit.no])||null;
  const lvl={destek:{t:'Destekli',d:'Adımlar daha kısa, her adımda bir örnek ve ipucu kartı var; sayılar küçük ve yuvarlak.'},orta:{t:'',d:'Sınıf düzeyinde; bağlam gerçek yaşamdan, adımlar bağımsız yürütülür.'},ileri:{t:'İleri',d:'Ek bir “ya şöyle olsaydı?” uzatması ve kendi problemini kurma adımı eklendi.'}}[F.lvl];
  const steps=base.steps.map(s=>({...s,items:s.items.slice()}));
  if(F.lvl==='destek')steps.forEach(s=>{s.items=s.items.slice(0,2);s.items.push('Takılırsan Navi’den ipucu kartı iste; önce örneği incele.')});
  if(F.lvl==='ileri')steps.push({title:'Ya Şöyle Olsaydı?',mode:'Bireysel · 10 dk',items:['Senaryodaki bir koşulu değiştir ve sonucun nasıl değiştiğini açıkla.','Arkadaşın için benzer ama daha zor bir görev yaz.'],warn:''});
  return {...base,id:'ai-taslak',grade:+F.g,title:(lvl.t?lvl.t+' · ':'')+base.title,subtitle:base.subtitle,themeNo:unit.no,themeName:unit.ad,kazanim:[F.k||('Tema kapsamı: '+[].concat(unit.kapsam||[]).join(' '))],skills21:b21?b21.s.slice(0,5):base.skills21,digital:b21&&b21.d.length?b21.d.slice(0,3):base.digital,duration:F.dur,format:F.fmt,steps,
    scenario:base.scenario+(F.note?` (Öğretmen isteği: ${F.note})`:''),diff:{destek:lvl.d,ileri:base.diff.ileri},aiLevel:F.lvl,aiNote:F.note,src:'AI'}}
function aiResult(){const a=UI.ai.res;
  return `<section class="card panel ai-res"><div class="card-hd"><div class="t"><h2 class="st">Taslak hazır</h2><div class="meta">${ic('spark',12)} Yapay zekâ taslağı · ${({destek:'desteğe ihtiyacı olan',orta:'sınıf düzeyindeki',ileri:'ileri düzeydeki'})[a.aiLevel]} öğrenciler için · gözden geçirip onaylayın</div></div></div>
   <div class="row" style="margin-bottom:12px;gap:8px"><button class="btn sec" data-act="aiAgain">${ic('refresh',15)} Başka bir taslak üret</button><button class="btn sec" data-act="aiEdit">${ic('edit',15)} Elle düzenle</button><button class="btn sec" data-act="aiSave">${ic('archive',15)} Kütüphaneye kaydet</button><span class="sp"></span><button class="btn pri" data-act="aiAssign">${ic('send',15)} Onayla ve ata</button></div>
   ${libDetail(a,{extra:`<span>${ic('spark',13)} Yapay zekâ taslağı</span>`})}</section>`}

/* ---- öğretmen sayfalarına bağlama ---- */
(function(){const A=NAV.find(n=>n.id==='activities');A.subs=[['tum','Tüm Etkinlikler'],['kutuphane','Etkinlik Kütüphanesi'],['yeni','Yeni Etkinlik Oluştur'],['degerlendirilecek','Değerlendirilecekler'],['urunler','Dijital Ürünler'],['tamamlanan','Tamamlananlar']];
  const D=NAV.find(n=>n.id==='assessments');D.subs=[['sinavlar','Sınavlar'],['testler','Testler'],['sifir','Sıfır Hata Sınavları'],['soru','Soru Analizi']];
  const _act=PAGES.activities;PAGES.activities=(sub,param)=>{const crumbs=l=>[['Ana Sayfa','home'],['Etkinlikler','activities/tum'],[l,'']];
    if(sub==='kutuphane')return {title:'Etkinlik Kütüphanesi',crumbs:crumbs('Etkinlik Kütüphanesi'),html:libTeacherPage()};
    if(sub==='etkinlik'){const a=libOf(param);return {title:a?esc(a.title):'Etkinlik',crumbs:[['Ana Sayfa','home'],['Etkinlikler','activities/tum'],['Etkinlik Kütüphanesi','activities/kutuphane'],[a?a.title:'','']],html:libTeacherDetail(param)}}
    if(sub==='urunler')return {title:'Dijital Ürünler',crumbs:crumbs('Dijital Ürünler'),html:prodGallery()};
    if(sub==='yeni'){const pre=UI.wiz;const P=_act(sub,param);const W=UI.wiz;if(pre&&W&&W!==UI._seenWiz&&(W.step>1||W.kz.length||W.sections.length))UI.wizMode='manual';UI._seenWiz=W;const m=UI.wizMode;return {...P,html:newActChooser()+(m==='ai'?aiForm():m==='manual'?P.html:`<div class="card panel">${stateBox('ins','Bir yöntem seçin','Etkinliği kendiniz yazabilir ya da yapay zekâdan bir taslak isteyebilirsiniz.')}</div>`)}}
    return _act(sub,param)};
  const _as=PAGES.assessments;PAGES.assessments=(sub,param)=>{if(sub==='sifir')return {title:'Sıfır Hata Sınavları',crumbs:[['Ana Sayfa','home'],['Değerlendirmeler','assessments/sinavlar'],['Sıfır Hata Sınavları','']],html:zeroTeacher()};return _as(sub,param)};
})();
/* Tüm Etkinlikler tablosunda kütüphane etkinliğine tıklama → detay */
const _actOpen=ACT.actOpen;ACT.actOpen=el=>{const a=DB.acts.find(x=>x.id===el.dataset.v);if(a&&a.lib&&libOf(a.lib)){go('activities/etkinlik/'+a.lib);return}_actOpen(el)};

/* ---- Dijital Ürünler (ayrı alan) ---- */
function prodGallery(){const secs=secScope();const items=[];DB.acts.filter(a=>a.product||a.type==='Dijital Ürün Stüdyosu').forEach(a=>a.targets.forEach(id=>{const s=stu(id);const sb=a.subs[id];if(!sb||sb.state!=='tamamladı'||!secs.includes(s.section))return;items.push({a,s,sb})}));
  const f=UI.pf||'';const ls=items.filter(x=>!f||(f==='bek'?x.sb.evaluated===false:x.sb.evaluated!==false)).sort((x,y)=>(y.sb.date||'').localeCompare(x.sb.date||''));const wait=items.filter(x=>x.sb.evaluated===false).length;
  return `<section class="card panel"><div class="card-hd"><div class="t"><h2 class="st">Öğrencilerin dijital ürünleri</h2><div class="meta">Dijital Ürün Stüdyosu’ndan gelen infografik, sunum ve kodlama teslimleri · ${items.length} ürün · ${wait} değerlendirme bekliyor</div></div><div class="seg">${[['','Tümü'],['bek','Değerlendirme bekleyen'],['deg','Değerlendirilen']].map(([k,l])=>`<button class="${f===k?'on':''}" data-act="pfSet" data-v="${k}">${l}</button>`).join('')}</div></div>
   ${ls.length?`<div class="pg-grid">${ls.map(({a,s,sb})=>`<article class="pg-card"><button class="pg-th" data-act="prodPreview" data-v="${a.id}|${s.id}" aria-label="${esc(fileName(a,s)[0])} önizle">${prodThumb(a,s,sb)}</button><div class="pg-b"><div class="row" style="gap:6px">${avatar(s,26)}<b class="small sp">${esc(fullName(s))}</b><span class="meta">${s.section}</span></div><div class="small" style="margin-top:6px"><b>${esc(a.title)}</b></div><div class="meta">${esc(a.product||'Ürün')} · ${fmtD(sb.date||a.due)}</div>
     <div class="row" style="margin-top:8px">${sb.evaluated===false?`<span class="pill p-krem">${ic('clock',11)} Değerlendirme bekliyor</span><span class="sp"></span><button class="btn xs pri" data-act="pgEval" data-v="${a.id}|${s.id}">Değerlendir</button>`:`<span class="pill p-soft">${ic('okc',11)} ${sb.score!=null?sb.score+' puan':'Değerlendirildi'}</span><span class="sp"></span><button class="btn xs sec" data-act="prodPreview" data-v="${a.id}|${s.id}">Önizle</button>`}</div></div></article>`).join('')}</div>`:stateBox('empty','Ürün yok','Seçili kapsamda teslim edilmiş dijital ürün bulunmuyor.')}</section>`}
ACT.pfSet=el=>{UI.pf=el.dataset.v;render()};
ACT.pgEval=el=>{const[aid,sid]=el.dataset.v.split('|');UI.evSel=aid+'|'+sid;go('activities/degerlendirilecek')};

/* ---- Sıfır Hata Sınavları (ayrı alan, Değerlendirmeler altında) ---- */
function zeroRows(){const rows=[];const secs=secScope();const R=mkRng(4242);
  const kzs=KZ.filter(k=>k.course==='MAT');
  DB.students.filter(s=>secs.includes(s.section)).forEach((s,i)=>{if(s.id===ME)return;const n=Math.floor(R()*3);for(let j=0;j<n;j++){const k=kzs.filter(x=>x.grade===GRADE_OF(s.section))[Math.floor(R()*4)]||kzs[0];const tries=1+Math.floor(R()*4);const done=R()<.7;rows.push({s,kz:k,set:'Set '+(j+1),tries,res:done?'4/4':`${2+Math.floor(R()*2)}/4`,done,date:isoAdd(TODAY,-Math.floor(R()*20)-1)})}});
  if(DB.st&&secs.includes(myStu().section))DB.st.zero.forEach((z,j)=>{const k=kzOf(z.kz);rows.push({s:myStu(),kz:k,set:z.title.split('·').pop().trim(),tries:z.tries||1+j,res:z.res||'—',done:!!z.done,date:z.date,live:true})});
  return rows.sort((a,b)=>(b.date||'').localeCompare(a.date||''))}
function zeroTeacher(){const rows=zeroRows();const f=UI.zf||'';const ls=rows.filter(r=>!f||(f==='tam'?r.done:!r.done));const by={};rows.forEach(r=>{(by[r.kz.topic]=by[r.kz.topic]||{n:0,d:0});by[r.kz.topic].n++;if(r.done)by[r.kz.topic].d++});
  return filterBar(['grade','section'],ls.length,{countLabel:'set'})+`<div class="grid g3"><div class="card kpi"><span class="lbl">Başlatılan set</span><span class="num">${rows.length}</span><span class="meta">Seçili şubeler</span></div><div class="card kpi"><span class="lbl">Hatasız tamamlanan</span><span class="num">${rows.filter(r=>r.done).length}</span><span class="meta">Tek hata seriyi baştan başlatır</span></div><div class="card kpi"><span class="lbl">Ortalama deneme</span><span class="num">${rows.length?(rows.reduce((a,r)=>a+r.tries,0)/rows.length).toFixed(1).replace('.',','):'—'}</span><span class="meta">Tamamlamak için gereken deneme</span></div></div>
   <div class="grid g2"><section class="card panel"><div class="card-hd"><div class="t"><h2 class="st">Sıfır Hata setleri</h2><div class="meta">Öğrenciler aynı kazanımdan hatasız bir set tamamlayana kadar çalışır · sonuçlar not değildir</div></div><div class="seg">${[['','Tümü'],['tam','Tamamlanan'],['dev','Devam eden']].map(([k,l])=>`<button class="${f===k?'on':''}" data-act="zfSet" data-v="${k}">${l}</button>`).join('')}</div></div>
    <div class="tw"><table class="t"><thead><tr><th>Öğrenci</th><th>Kazanım</th><th>Set</th><th>Deneme</th><th>Sonuç</th><th>Durum</th><th>Tarih</th></tr></thead><tbody>${ls.slice(0,40).map(r=>`<tr class="click" data-go="student/assess/${r.s.id}"><td><div class="stu">${avatar(r.s,28)}<div><b class="small">${esc(fullName(r.s))}</b><div class="meta">${r.s.section}${r.live?' · canlı veri':''}</div></div></div></td><td class="small zk"><b>${esc(r.kz.topic)}</b><div class="meta" title="${esc(r.kz.name)}">${esc(r.kz.name)}</div></td><td class="small">${esc(r.set)}</td><td class="small">${r.tries}</td><td><b class="small">${r.res}</b></td><td>${r.done?`<span class="pill p-soft">${ic('okc',11)} Hatasız</span>`:`<span class="pill p-krem">${ic('repeat',11)} Devam ediyor</span>`}</td><td class="small nowrap">${fmtD(r.date)}</td></tr>`).join('')}</tbody></table></div></section>
   <section class="card panel"><h2 class="st">Kazanım bazında</h2><div class="meta" style="margin-bottom:10px">Hatasız tamamlama oranı</div>${Object.entries(by).map(([t,v])=>`<div class="mb" style="display:grid;grid-template-columns:1fr 120px 50px;gap:8px;align-items:center;margin:6px 0"><span class="small">${esc(t)}</span><span class="pbar"><i style="width:${v.d/v.n*100}%;--c:#2E9E6B"></i></span><b class="small">${v.d}/${v.n}</b></div>`).join('')||'<span class="meta">Veri yok</span>'}</section></div>`}
ACT.zfSet=el=>{UI.zf=el.dataset.v;render()};

/* ================= ÖĞRENCİ ================= */
function libStudentSection(){const g=myStu().grade||GRADE_OF(myStu().section);const S=UI.slib||(UI.slib={c:UI.sf&&UI.sf.course||'MAT',g:'',sk:''});if(UI.sf&&UI.sf.course&&UI.sf.course!==S.c)S.c=UI.sf.course;
  const L=ACTLIB.filter(a=>a.course===S.c&&a.grade===g&&!String(a.id).startsWith('ai-'));
  return `<section class="ocard lib-stu"><div class="card-hd"><div class="t"><h2 class="o-h">${g}. sınıf keşif etkinlikleri</h2><div class="meta">Ders seç; etkinlikler ders ders listelenir. Her etkinliğin içinde hangi 21. yüzyıl becerilerini geliştirdiğin yazar.</div></div></div>
   <div class="seg lib-seg" style="margin-bottom:12px">${LIB_ORDER.map(c=>`<button class="${S.c===c?'on':''}" data-act="slibC" data-v="${c}">${cIcon(c,14)} ${libCourse(c)}</button>`).join('')}</div>
   <div class="lib-grid">${L.map(a=>libCard(a,'o-etk/'+a.id)).join('')||stateBox('empty','Bu derste etkinlik yok','')}</div></section>`}
ACT.slibC=el=>{UI.slib.c=el.dataset.v;if(UI.sf)UI.sf.course=el.dataset.v;render()};
PAGES['o-etk']=(id)=>{const a=libOf(id);if(!a)return {title:'Etkinlik',crumbs:sCrumb(['Çalışma Alanım','o-calisma/etkinlik']),html:stateBox('err','Etkinlik bulunamadı','')};
  const S=DB.st;S.libChk=S.libChk||{};UI.libChk=UI.libChk||{};UI.libChk[id]=UI.libChk[id]||S.libChk[id]||{};const ck=UI.libChk[id];const n=a.checklist.length;const k=Object.values(ck).filter(Boolean).length;const done=(S.libDone||{})[id];
  (S.libStart=S.libStart||{})[id]=S.libStart[id]||stuToday();
  const btn=done?`<div class="lib-ok">${ic('okc',18)} Tamamlandı · ${fmtD(done)} · öğretmenine iletildi</div>`:`<div class="pbar" style="margin:6px 0 10px"><i style="width:${k/n*100}%;--c:#2E9E6B"></i></div><button class="btn pri lg" data-act="libDoneStu" data-v="${id}" ${k<n?'disabled':''}>${ic('send',16)} Etkinliği tamamladım</button><span class="meta" style="margin-left:8px">${k<n?`Önce kontrol listesindeki ${n-k} maddeyi işaretle`:'Hazırsın!'}</span>`;
  return {title:esc(a.title),crumbs:sCrumb(['Çalışma Alanım','o-calisma/etkinlik'],['Etkinliklerim','o-calisma/etkinlik'],[a.title,'']),html:`<div class="row" style="margin-bottom:12px"><button class="btn sec" data-go="o-calisma/etkinlik">${ic('cl',15)} Etkinliklerim</button></div>`+libDetail(a,{student:true,doneBtn:btn,extra:done?`<span>${ic('okc',13)} Tamamlandı</span>`:''})}};
ACT.libDoneStu=el=>{const id=el.dataset.v;const a=libOf(id);const S=DB.st;commit(`“${a.title}” tamamlandı · +25 XP`,()=>{(S.libDone=S.libDone||{})[id]=stuToday();addXP(25,a.course);S.log.push({d:stuToday(),course:a.course,title:a.title,mins:libMins(a),st:'Tamamlandı'});DB.acts.filter(x=>x.lib===id&&x.subs[ME]).forEach(x=>{x.subs[ME]={state:'tamamladı',date:stuToday(),score:null}});DB.notifs.unshift({id:uid('n'),type:'Teslim',text:`${fullName(myStu())} “${a.title}” etkinliğini tamamladı`,sec:myStu().section,d:TODAY,read:false,to:'activities/etkinlik/'+id})},{undo:false});setTimeout(()=>typeof checkBadges==='function'&&checkBadges(),400)};
/* plan görevleri: kütüphane etkinliği */
if(typeof taskStatus!=='undefined'){const _ts2=taskStatus;taskStatus=function(t){if(t.lib){const S=DB.st;return (S.libDone||{})[t.lib]?'Tamamlandı':(S.libStart||{})[t.lib]?'Devam Ediyor':'Bekliyor'}return _ts2(t)}}
if(typeof startTask!=='undefined'){const _st2=startTask;startTask=function(t){if(t&&t.lib){go('o-etk/'+t.lib);return}_st2(t)}}
if(typeof GK!=='undefined'){const _gk=GK;GK=function(t){if(t.lib){const a=libOf(t.lib);return {art:'set',g:LIB_GRAD[t.course]||LIB_GRAD.MAT,k:'Etkinlik',xp:25,ic:'clip'}}return _gk(t)}}
/* öğrenci Etkinliklerim sayfasına kütüphane bölümü */
if(PAGES['o-calisma']){const _oc=PAGES['o-calisma'];PAGES['o-calisma']=(sub,p)=>{const P=_oc(sub,p);if(sub==='etkinlik'&&P&&P.html)return {...P,html:P.html+libStudentSection()};return P}}

/* ---- ilk kurulum: 7/A'ya iki kütüphane etkinliği atanmış olsun (bağlı akış demosu) ---- */
function ensureLib(){if(!DB||DB.libInit)return;if(typeof ensureStu==="function")ensureStu();if(!DB.st)return;DB.libInit=1;const sec=TEACHER.guidance[0];const g=GRADE_OF(sec);
  ['MAT','FEN'].forEach((c,i)=>{const a=ACTLIB.find(x=>x.course===c&&x.grade===g);if(a)libAssignTo(a,[sec],isoAdd(TODAY,3+i*2))});save()}
/* sihirbaz kapanınca seçim ekranına dön */
['wCancel','wSave'].forEach(k=>{const f=ACT[k];if(f)ACT[k]=el=>{UI.wizMode=null;UI._seenWiz=null;return f(el)}});
