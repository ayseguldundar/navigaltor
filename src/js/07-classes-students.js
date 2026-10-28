/* ================= SINIFLARIM ================= */
const isGuidanceView=()=>F.sections.length===1&&TEACHER.guidance.includes(F.sections[0]);
function secSummary(sec){
  const ss=DB.students.filter(s=>s.section===sec);const cs=coursesFor(sec);
  const pairs=[];ss.forEach(s=>Object.keys(DB.measures[s.id]).forEach(k=>{if(cs.includes(k.split(/\d/)[0]))pairs.push(mOf(s.id,k).v)}));
  const yet=pairs.length?Math.round(pairs.filter(v=>v>=70).length/pairs.length*100):null;
  const acts=DB.acts.filter(a=>a.sections.includes(sec)&&cs.includes(a.course)&&a.status==='Atandı');
  let pend=0;acts.forEach(a=>ss.forEach(s=>{if(a.subs[s.id]&&a.subs[s.id].state!=='tamamladı')pend++}));
  const sup=new Set(openAlerts().filter(a=>stu(a.sid).section===sec&&cs.includes(a.course)).map(a=>a.sid)).size;
  const last=DB.acts.filter(a=>a.sections.includes(sec)&&cs.includes(a.course)&&a.status!=='Taslak').sort((a,b)=>a.created<b.created?1:-1)[0];
  return {n:ss.length,yet,part:partOf(ss.map(s=>s.id)),pend,sup,last,avg:sectionAvg([sec],'2026-09-01',isoAdd(TODAY,1)).v};
}
PAGES.classes=()=>{
  const crumbs=[['Ana Sayfa','home'],['Sınıflarım','classes']];
  const g=isGuidanceView();const secs=secScope();
  const title=g?`Rehberlik Sınıfım: ${F.sections[0]}`:secs.length===1?`Sınıf: ${secs[0]}`:'Sınıflarım';
  if(!yearOK())return noYear(title,crumbs);
  const fb=filterBar(['year','grade','section','course'],studentsScope(false).length,{countLabel:'öğrenci',extra:!g?`<button class="btn sm sec" data-act="toGuidance">${ic('home',14)} Rehberlik sınıfıma dön</button>`:''});
  const tab=UI.tabs.cls||'genel';
  let head;
  if(secs.length===1){
    const S=secSummary(secs[0]);
    head=`<section class="card panel"><div class="card-hd"><div class="t"><div class="row">${g?`<span class="pill p-bordo">${ic('home',12)} Rehberlik sınıfı</span>`:''}<span class="pill p-krem">${F.course==='ALL'?'Tüm Dersler · '+coursesFor(secs[0]).length+' ders':COURSES[F.course].name}</span></div><h2 class="st" style="margin-top:8px">${secs[0]} · ${S.n} öğrenci · Rehber öğretmen ${REHBER[secs[0]]}</h2></div>${updated()}</div>
    <div class="grid g3" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
      ${miniStat('Öğrenci sayısı',S.n,'users')}${miniStat('Akademik yeterlik',S.yet==null?'—':'%'+S.yet,'target','yeterli kazanım-öğrenci eşleşmesi')}${miniStat('Etkinlik katılımı',S.part==null?'—':'%'+S.part,'clip','hedef %80')}${miniStat('Bekleyen teslim',S.pend,'clock','açık etkinliklerde')}${miniStat('Destek ihtiyacı',S.sup,'alert','açık uyarısı olan öğrenci')}${miniStat('Son etkinlik',S.last?fmtD(S.last.created):'—','hist',S.last?S.last.title:'')}
    </div></section>`;
  } else {
    const rows=secs.map(s=>({s,...secSummary(s)}));
    head=`<section class="card panel"><div class="card-hd"><div class="t"><h2 class="st">Karşılaştırmalı özet · ${secs.length} şube</h2><div class="meta">${F.course==='ALL'?'Her şubede yetkili olduğunuz dersler':COURSES[F.course].name} · 7/A dışındaki şubelerde yalnızca branş dersiniz görünür</div></div>${updated()}</div>
    <div class="tw"><table class="t"><thead><tr><th>Şube</th><th>Öğrenci</th><th>Akademik yeterlik</th><th>Katılım</th><th>Bekleyen teslim</th><th>Destek ihtiyacı</th><th>Son etkinlik</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr class="click" data-act="pickSec" data-v="${r.s}" tabindex="0"><td><b>${r.s}</b>${TEACHER.guidance.includes(r.s)?' <span class="pill p-bordo">Rehberlik</span>':''}</td><td>${r.n}</td><td style="min-width:150px"><div class="row" style="gap:8px">${meter(r.yet,{w:'flex:1'})}<b>%${r.yet}</b></div></td><td>%${r.part}</td><td>${r.pend}</td><td>${r.sup}</td><td class="small">${r.last?esc(r.last.title)+' · '+fmtD(r.last.created):'—'}</td><td>${ic('cr',16,'muted')}</td></tr>`).join('')}</tbody></table></div></section>`;
  }
  let body='';
  if(tab==='genel')body=classGeneral(secs);
  if(tab==='ogrenciler')body=classStudents(secs);
  if(tab==='etkinlikler')body=classActs(secs);
  if(tab==='gelisim')body=`<div class="grid g2">${trendCard(secs,'cls')}${partCard(secs)}</div>`;
  return {title,crumbs,html:fb+head+tabs('cls',[['genel','Genel Bakış'],['ogrenciler','Öğrenciler'],['etkinlikler','Etkinlikler'],['gelisim','Gelişim']],tab)+body};
};
const miniStat=(l,v,icn,sub='')=>`<div class="card kpi" style="padding:14px"><span class="eyebrow row" style="gap:6px">${ic(icn,14)} ${l}</span><span class="num" style="font-size:28px">${v}</span>${sub?`<span class="cmp trunc" title="${esc(sub)}">${esc(sub)}</span>`:''}</div>`;
ACT.toGuidance=()=>applyF(()=>{F.grade=[];F.sections=TEACHER.guidance.slice();F.course='ALL'});
ACT.pickSec=el=>applyF(()=>{F.sections=[el.dataset.v]});
function classGeneral(secs){
  const blocks=[];
  const cs=[...new Set(secs.flatMap(coursesFor))];
  cs.forEach(c=>{
    const ks=KZ.filter(k=>k.course===c&&gradeScope().includes(k.grade));
    const rows=ks.map(k=>{const vals=[];secs.forEach(sec=>{if(!coursesFor(sec).includes(c)||GRADE_OF(sec)!==k.grade)return;DB.students.filter(s=>s.section===sec).forEach(s=>{const m=mOf(s.id,k.id);if(m)vals.push(m.v)})});return {k,v:vals.length?Math.round(vals.filter(v=>v>=70).length/vals.length*100):null,n:vals.length}});
    const known=rows.filter(r=>r.v!=null);
    blocks.push(`<div><div class="row" style="margin-bottom:8px"><h3 class="sst">${COURSES[c].name}</h3><span class="meta">${COURSES[c].teacher}${c!==TEACHER.course?' · rehberlik görünümü (salt okunur)':''}</span><span class="sp"></span><b>${known.length?'%'+Math.round(avg(known.map(r=>r.v))):'—'}</b></div><div class="mini-bars">${rows.map(r=>`<div class="mb"><span class="trunc small" title="${esc(r.k.name)}">${r.k.grade}. ${esc(r.k.topic)}</span>${r.v==null?`<span class="meta">${r.n?'Yetersiz veri':'Ölçüm yok'}</span>`:meter(r.v)}<b class="small">${r.v==null?'—':'%'+r.v}</b></div>`).join('')}</div></div>`);
  });
  return `<div class="split"><section class="card panel"><div class="card-hd"><div class="t"><h2 class="st">Kazanım yeterliği</h2><div class="meta">Yeterli (≥70) öğrenci oranı · ${secs.join(', ')}</div></div></div><div class="col" style="gap:22px">${blocks.join('')||stateBox('empty','Ders verisi yok','Seçili kapsamda yetkili olduğunuz ders bulunmuyor.')}</div></section>${groupsCard(secs)}</div>`;
}
function suggestGroups(secs){
  const ss=DB.students.filter(s=>secs.includes(s.section));const ids=new Set(ss.map(s=>s.id));
  const er=DB.errors.filter(e=>ids.has(e.sid)&&courseUnion().includes(e.kz.split(/\d/)[0]));
  const out=['K','I','S'].map(t=>{const es=er.filter(e=>e.type===t);const byK={};es.forEach(e=>{byK[e.kz]=(byK[e.kz]||0)+1});const top=Object.entries(byK).sort((a,b)=>b[1]-a[1])[0];const mem=[...new Set(es.filter(e=>!top||e.kz===top[0]).map(e=>e.sid))];return top?{id:'g'+t,t,kz:top[0],name:`${ERR[t].short} desteği · ${kzOf(top[0]).topic}`,why:`${mem.length} öğrencide “${kzOf(top[0]).name}” kazanımında ${ERR[t].name.toLocaleLowerCase('tr')} örüntüsü (toplam ${es.filter(e=>e.kz===top[0]).reduce((a,b)=>a+b.count,0)} tekrar).`,mem}:null}).filter(Boolean);
  const hi=ss.filter(s=>{const v=studentAvg(s.id,'MAT');return v!=null&&v>=80}).map(s=>s.id);
  if(hi.length)out.push({id:'gZ',t:null,kz:null,name:'Zenginleştirme grubu',why:`${hi.length} öğrencinin ölçülen matematik kazanımlarında ortalaması 80 ve üzeri; Dijital Ürün Stüdyosu görevleri önerilir.`,mem:hi});
  return out;
}
function groupsCard(secs){
  const key=secs.join('+');const saved=DB.groups[key]||{};
  const gs=suggestGroups(secs).map(g=>({...g,mem:saved[g.id]||g.mem,edited:!!saved[g.id]}));
  const pool=DB.students.filter(s=>secs.includes(s.section));
  return `<section class="card panel"><div class="card-hd"><div class="t"><h2 class="st">Çalışma grubu önerileri</h2><div class="meta">Beceri ve hata örüntülerine göre · üyeleri değiştirebilirsiniz</div></div><span class="src a">${ic('spark',12)} AI önerisi</span></div>
  <div class="col" style="gap:12px">${gs.length?gs.map(g=>`<div class="card" style="padding:14px"><div class="row">${g.t?etag(g.t):`<span class="etag"><span class="ei">${ic('spark',12)}</span>İleri</span>`}<b class="sp">${esc(g.name)}</b>${g.edited?'<span class="pill p-krem">Düzenlendi</span>':''}</div><p class="small muted" style="margin:6px 0 8px">Gerekçe: ${esc(g.why)}</p>
    <div class="row" style="gap:6px">${g.mem.map(id=>`<span class="chip">${esc(shortName(stu(id)))}<button data-act="grpRm" data-v="${key}|${g.id}|${id}" aria-label="${esc(fullName(stu(id)))} öğrencisini gruptan çıkar">${ic('x',12)}</button></span>`).join('')}
    <select class="sel" style="width:auto;min-height:28px;height:28px;padding:0 8px;font-size:12px" data-chg="grpAdd" data-v="${key}|${g.id}" aria-label="Gruba öğrenci ekle"><option value="">+ Öğrenci ekle</option>${pool.filter(s=>!g.mem.includes(s.id)).map(s=>`<option value="${s.id}">${esc(fullName(s))} · ${s.section}</option>`).join('')}</select></div>
    <div class="row" style="margin-top:10px;justify-content:flex-end">${g.edited?`<button class="btn xs ghost" data-act="grpReset" data-v="${key}|${g.id}">Öneriye dön</button>`:''}<button class="btn sm pri" data-act="grpAssign" data-v="${key}|${g.id}" ${g.mem.length?'':'disabled'}>${ic('send',14)} Gruba etkinlik ata</button></div></div>`).join(''):stateBox('ins','Öneri için yeterli veri yok','Hata örüntüsü tespit edilmedi. Yeni ölçümler geldikçe öneriler oluşur.')}</div></section>`;
}
const grpGet=(key,gid,secs)=>{DB.groups[key]=DB.groups[key]||{};if(!DB.groups[key][gid]){const g=suggestGroups(secs).find(x=>x.id===gid);DB.groups[key][gid]=g.mem.slice()}return DB.groups[key][gid]};
ACT.grpRm=el=>{const[key,gid,sid]=el.dataset.v.split('|');commit(`${fullName(stu(sid))} gruptan çıkarıldı`,()=>{const m=grpGet(key,gid,key.split('+'));m.splice(m.indexOf(sid),1)})};
ACT.grpAdd=t=>{const[key,gid]=t.dataset.v.split('|');const sid=t.value;if(!sid)return;commit(`${fullName(stu(sid))} gruba eklendi`,()=>{grpGet(key,gid,key.split('+')).push(sid)})};
ACT.grpReset=el=>{const[key,gid]=el.dataset.v.split('|');commit('Grup öneriye döndürüldü',()=>{delete DB.groups[key][gid]})};
ACT.grpAssign=el=>{const[key,gid]=el.dataset.v.split('|');const secs=key.split('+');const g=suggestGroups(secs).find(x=>x.id===gid);const mem=(DB.groups[key]||{})[gid]||g.mem;UI.wiz={step:3,kz:g.kz?[g.kz]:[],sections:[...new Set(mem.map(id=>stu(id).section))],students:mem.slice(),type:g.t?ERR[g.t].act:'Dijital Ürün Stüdyosu',course:g.kz?kzOf(g.kz).course:'MAT',title:'',fromGroup:true};go('activities/yeni')};
function classStudents(secs){
  const rows=DB.students.filter(s=>secs.includes(s.section)).map(s=>({s,avg:studentAvg(s.id,F.course==='ALL'?null:F.course),part:s.part,al:openAlerts().filter(a=>a.sid===s.id).length,er:[...new Set(DB.errors.filter(e=>e.sid===s.id).map(e=>e.type))]}));
  const sorted=sortBy('cs',rows,{ad:r=>fullName(r.s),avg:r=>r.avg??-1,part:r=>r.part,al:r=>r.al});
  return `<section class="card panel"><div class="tw"><table class="t"><thead><tr>${th('cs','ad','Öğrenci')}<th>Şube</th>${th('cs','avg','Ortalama')}${th('cs','part','Katılım')}${th('cs','al','Açık uyarı')}<th>Hata türleri</th><th></th></tr></thead><tbody>${sorted.map(r=>`<tr><td><div class="stu">${avatar(r.s,32)}<span class="nm">${esc(fullName(r.s))}</span></div></td><td>${r.s.section}</td><td>${r.avg==null?'—':`<b>${r.avg}</b> ${lvlTag(r.avg)}`}</td><td><div class="row" style="gap:6px">${meter(r.part,{w:'width:70px'})}%${r.part}</div></td><td>${r.al?`<span class="pill p-soft">${ic('alert',12)} ${r.al}</span>`:'<span class="meta">—</span>'}</td><td>${r.er.map(t=>etag(t)).join(' ')||'<span class="meta">—</span>'}</td><td class="nowrap"><button class="btn xs ghost" data-go="student/assess/${r.s.id}">Değerlendirmeler</button><button class="btn xs ghost" data-go="student/profile/${r.s.id}">Profil</button></td></tr>`).join('')}</tbody></table></div></section>`;
}
function classActs(secs){
  const acts=DB.acts.filter(a=>a.sections.some(s=>secs.includes(s))&&courseUnion().includes(a.course)).sort((a,b)=>a.created<b.created?1:-1);
  return `<section class="card panel"><div class="card-hd"><div class="t"><h2 class="st">Etkinlikler</h2><div class="meta">${acts.length} etkinlik · ${secs.join(', ')}</div></div><button class="btn sm pri" data-act="newActFor" data-v="${secs.join(',')}">${ic('plus',14)} Yeni etkinlik</button></div>${actTable(acts,secs)}</section>`;
}
ACT.newActFor=el=>{UI.wiz={step:1,kz:[],sections:el.dataset.v.split(','),students:[],type:'',course:TEACHER.course,title:''};go('activities/yeni')};
function partCard(secs){
  const ss=DB.students.filter(s=>secs.includes(s.section)).sort((a,b)=>a.part-b.part);
  return `<section class="card"><div class="card-hd"><div class="t"><h2 class="st">Katılım analizi</h2><div class="meta">Beklenen etkinliklere başlama oranı · son giriş</div></div></div><div class="mini-bars">${ss.slice(0,12).map(s=>`<div class="mb"><span class="trunc small">${esc(shortName(s))} <span class="meta">${s.section}</span></span>${meter(s.part,{tgt:80})}<b class="small">%${s.part}</b></div>`).join('')}</div><div class="meta" style="margin-top:8px">Çizgi: %80 hedef · en düşük 12 öğrenci gösteriliyor. ${ss.filter(s=>s.lastLogin>=7).map(s=>`${shortName(s)}: ${s.lastLogin} gün giriş yok`).join(' · ')}</div></section>`;
}

/* ================= ÖĞRENCİLERİM (referans liste) ================= */
const FORM_ST={done:{ic:'oks',l:'Tamamlandı',cls:''},pend:{ic:'pend',l:'Bekliyor',cls:'pend'},miss:{ic:'miss',l:'Eksik',cls:'miss'}};
const TESTS={calisma:{name:'Çalışma Davranışı',scope:'Ortaokul 5–8 · 10–14 yaş · kurum tanımlı'},ilgi:{name:'Meslek İlgi Envanteri',scope:'7–8. sınıf · 12–14 yaş · rehberlik servisi'}};
const slink=(st,label,act,v)=>{const S=FORM_ST[st];return `<button class="slink ${S.cls}" data-act="${act}" data-v="${v}" aria-label="${label}: ${S.l}" data-tip="${label}: ${S.l}">${ic(S.ic,16)}<span class="sl">${label}</span>${st!=='done'?`<small>${S.l}</small>`:''}</button>`};
regField('sevst',{l:'Değerlendirme',opts:()=>[{v:'',l:'Tüm durumlar'},{v:'form',l:'Tanıma formu eksik/bekliyor'},{v:'test',l:'Test bekliyor/eksik'},{v:'ok',l:'Tümü tamamlandı'}],get:()=>pg('students/').st||'',set:v=>pg('students/').st=v,def:''});
PAGES.students=()=>{
  const crumbs=[['Ana Sayfa','home'],['Öğrencilerim','students']];
  const mode=UI.tabs.smode||'list';
  const q=(UI.q.stu||'').trim().toLocaleLowerCase('tr');const st=pg('students/').st||'';
  let rows=DB.students.filter(s=>secScope().includes(s.section));
  if(!yearOK())rows=[];
  if(q)rows=rows.filter(s=>(fullName(s)+' '+s.phone+' '+s.no+' '+s.parents.map(p=>p.name+' '+p.phone).join(' ')).toLocaleLowerCase('tr').replace(/[()\s]/g,'').includes(q.replace(/[()\s]/g,'')));
  if(st==='form')rows=rows.filter(s=>s.form.student!=='done'||s.form.parent!=='done');
  if(st==='test')rows=rows.filter(s=>s.tests.calisma!=='done'||(s.grade===8&&s.tests.ilgi!=='done'));
  if(st==='ok')rows=rows.filter(s=>s.form.student==='done'&&s.form.parent==='done'&&s.tests.calisma==='done');
  const P=pager('stu',rows.length,8);
  const head=`<section class="card panel">
   <div class="sv-head">${ic('users',22)}<h2>Öğrenci Değerlendirme <span>|</span> Öğrencilerim</h2><span class="sp"></span><button class="icb" data-act="printList" aria-label="Yazdır / çıktı al" data-tip="Yazdır / çıktı al">${ic('print')}</button></div>
   <div class="sv-tools"><div class="l"><div class="vmode" role="tablist" aria-label="Görünüm">
     <button role="tab" aria-selected="${mode==='list'}" class="${mode==='list'?'on':''}" data-act="seg" data-k="smode" data-v="list" data-tip="Öğrenci listesi — satır satır öğrenci, veli ve değerlendirme durumu">${ic('users',18)}</button>
     <button role="tab" aria-selected="${mode==='contact'}" class="${mode==='contact'?'on':''}" data-act="seg" data-k="smode" data-v="contact" data-tip="İletişim — öğrenci ve veli telefonları, mesaj taslağı">${ic('chat',18)}</button>
     <button role="tab" aria-selected="${mode==='cal'}" class="${mode==='cal'?'on':''}" data-act="seg" data-k="smode" data-v="cal" data-tip="Takvim — planlı öğrenci ve veli görüşmeleri">${ic('cal',18)}</button></div>
     <div class="row">${dd('year',FIELDS.year,{label:false})}</div></div>
    <div class="r"><div class="ssearch"><input data-q="stu" value="${esc(UI.q.stu||'')}" placeholder="Öğrenci / Veli / Telefon ara" aria-label="Öğrenci, veli veya telefon ara"><button aria-label="Ara" data-act="noop">${ic('search',16)}</button></div>
     <div class="row" style="justify-content:flex-end">${dd('section',FIELDS.section,{align:'right'})}${dd('course',FIELDS.course,{align:'right'})}${dd('sevst',FIELDS.sevst,{align:'right'})}</div></div></div>
   ${UI.notes.map(n=>`<div class="notice">${ic('info',15)} ${esc(n)}</div>`).join('')}
   ${mode==='list'?studentList(rows,P):mode==='contact'?contactView(rows,P):calView(rows)}
  </section>`;
  return {title:'Öğrencilerim',crumbs,html:head};
};
ACT.noop=()=>{};
function studentList(rows,P){
  if(!rows.length)return `<div class="lhead"><h3>Öğrenci Listesi</h3><span class="small">Toplam 0 Öğrenci</span></div>`+(yearOK()?stateBox('none','Sonuç bulunamadı','Arama veya filtrelerle eşleşen öğrenci yok. Aramayı kısaltmayı ya da şube filtresini temizlemeyi deneyin.',`<button class="btn sm sec" data-act="fClearStu">Aramayı ve filtreleri temizle</button>`):stateBox('empty','Bu dönem için kayıt yok','Seçili akademik yılda bu şubelere kayıtlı öğrenci bulunmuyor.'));
  return `<div class="lhead"><h3>Öğrenci Listesi</h3><span class="small">Toplam <b>${rows.length}</b> Öğrenci</span>${P.html}</div>
  <div class="slegend" aria-label="Durum açıklaması"><span>${ic('oks',15)} Tamamlandı</span><span>${ic('pend',15)} Bekliyor</span><span>${ic('miss',15)} Eksik</span><span class="muted">· Fotoğraf çevresi: ${ic('chat',13)} mesaj · ${ic('clipcheck',13)} tüm değerlendirmeler · ${ic('print',13)} öğrenci raporu · ${ic('idcard',13)} öğrenci profili</span></div>
  <div role="list">${P.slice(rows).map(s=>{const exp=UI.exp['p'+s.id];const p=s.parents[0];return `<div class="srow ${UI.exp['m'+s.id]?'exp':''}" role="listitem" id="row-${s.id}">
   <div class="ph">${avatar(s,68)}
     <button class="pb tl" data-act="msgTo" data-v="${s.id}" aria-label="${esc(fullName(s))} ile mesajlaş" data-tip="Mesaj yaz">${ic('chat',15)}</button>
     <button class="pb tr key" data-go="student/assess/${s.id}" aria-label="Tüm Değerlendirmeler — ${esc(fullName(s))}" data-tip="Tüm Değerlendirmeler">${ic('clipcheck',15)}</button>
     <button class="pb bl" data-act="stuReport" data-v="${s.id}" aria-label="${esc(fullName(s))} öğrenci raporu çıktısı" data-tip="Öğrenci raporu / çıktı">${ic('print',15)}</button>
     <button class="pb br key" data-go="student/profile/${s.id}" aria-label="Öğrenci Profili — ${esc(fullName(s))}" data-tip="Öğrenci Profili">${ic('idcard',15)}</button></div>
   <div class="c"><span class="nm trunc" title="${esc(fullName(s))}">${esc(fullName(s))}</span><button class="tel" data-act="copy" data-v="${esc(s.phone)}" data-tip="Numarayı kopyala">${ic('phone',13)} ${esc(s.phone)}</button><button class="btn xs ghost m-only" data-act="rowExp" data-v="m${s.id}" aria-expanded="${!!UI.exp['m'+s.id]}">${UI.exp['m'+s.id]?'Daha az':'Ayrıntılar'}</button></div>
   <div class="c hide-m"><span class="trunc" title="${esc(p.name)} (${p.rel})">${s.parents.length>1?`<button class="cbadge" data-act="rowExp" data-v="p${s.id}" aria-expanded="${!!exp}" aria-label="${s.parents.length} veli kaydı, ayrıntıları ${exp?'gizle':'göster'}">${s.parents.length}</button>`:''}${esc(p.name)} (${p.rel})</span><button class="tel" data-act="copy" data-v="${esc(p.phone)}" data-tip="Numarayı kopyala">${ic('phone',13)} ${esc(p.phone)}</button></div>
   <div class="c hide-m"><span class="u">2026-2027 Akademik Yılı</span><span class="g">${s.grade}. SINIF</span><span class="g">Ortaokul · ${F.course==='ALL'?'Tüm dersler':COURSES[F.course].name}</span></div>
   <div class="c hide-m"><span class="u trunc">${TEACHER.org}</span><span class="g">${s.section} Şubesi · No ${s.no}</span><span class="g">${REHBER[s.section]}</span></div>
   <div class="c hide-m"><span class="u">Tanıma Formu</span>${slink(s.form.student,'Öğrenci','formOpen',s.id+'|student')}${slink(s.form.parent,'Veli','formOpen',s.id+'|parent')}</div>
   <div class="c hide-m"><span class="u">Testler</span>${slink(s.tests.calisma,TESTS.calisma.name,'testOpen',s.id+'|calisma')}${s.grade===8||s.tests.ilgi!=='miss'?slink(s.tests.ilgi,TESTS.ilgi.name,'testOpen',s.id+'|ilgi'):`<span class="g small" data-tip="${TESTS.ilgi.name} · ${TESTS.ilgi.scope}">Meslek İlgi · 8. sınıfta</span>`}</div>
   ${exp?`<div class="pex">${s.parents.map(x=>`<div class="row"><b>${esc(x.name)}</b><span class="muted">${x.rel}</span><span class="sp"></span><span>${esc(x.phone)}</span><span class="muted">${esc(x.email)}</span></div>`).join('')}</div>`:''}
  </div>`}).join('')}</div>
  <div class="lhead" style="border:0">${P.html}</div>`;
}
ACT.fClearStu=()=>{UI.q.stu='';applyF(()=>{F.sections=[];F.grade=[];pg('students/').st=''})};
ACT.rowExp=el=>{UI.exp[el.dataset.v]=!UI.exp[el.dataset.v];render()};
function contactView(rows,P){
  return `<div class="lhead"><h3>İletişim</h3><span class="small">Toplam <b>${rows.length}</b> Öğrenci</span>${P.html}</div><div class="tw"><table class="t"><thead><tr><th>Öğrenci</th><th>Öğrenci telefonu</th><th>Veli</th><th>Veli telefonu</th><th>E-posta</th><th></th></tr></thead><tbody>${P.slice(rows).map(s=>s.parents.map((p,i)=>`<tr>${i===0?`<td rowspan="${s.parents.length}"><div class="stu">${avatar(s,32)}<div><div class="nm">${esc(fullName(s))}</div><div class="meta">${s.section}</div></div></div></td><td rowspan="${s.parents.length}"><button class="tel" data-act="copy" data-v="${esc(s.phone)}">${ic('copy',13)} ${esc(s.phone)}</button></td>`:''}<td>${esc(p.name)} <span class="meta">(${p.rel})</span></td><td><button class="tel" data-act="copy" data-v="${esc(p.phone)}">${ic('copy',13)} ${esc(p.phone)}</button></td><td class="small">${esc(p.email)}</td><td><button class="btn xs sec" data-act="msgTo" data-v="${s.id}|${i}">${ic('msg',13)} Mesaj</button></td></tr>`).join('')).join('')}</tbody></table></div><div class="meta" style="margin-top:8px">Tüm numaralar kurgusaldır. Telefon bağlantıları yerine kopyalama kullanılır.</div>`;
}
function calView(rows){
  const ids=new Set(rows.map(s=>s.id));const ms=DB.meetings.filter(m=>ids.has(m.sid)).sort((a,b)=>(a.d+a.time)<(b.d+b.time)?-1:1);
  const days=Array.from({length:10},(_,i)=>isoAdd('2026-11-02',i)).filter(d=>{const w=new Date(d+'T12:00').getDay();return w>0&&w<6});
  return `<div class="lhead"><h3>Görüşme Takvimi</h3><span class="small">${ms.length} planlı görüşme</span><button class="btn sm pri" data-act="meetNew">${ic('plus',14)} Görüşme planla</button></div>
  <div class="tw"><div style="display:grid;grid-template-columns:repeat(${days.length},minmax(110px,1fr));gap:8px;min-width:${days.length*118}px;margin-top:12px">${days.map(d=>{const dm=ms.filter(m=>m.d===d);const wd=['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'][new Date(d+'T12:00').getDay()];return `<div class="card" style="padding:10px;min-height:150px;${d===TODAY?'border-color:var(--bordo)':''}"><div class="eyebrow">${wd} ${fmtD(d)}${d===TODAY?' · bugün':''}</div><div class="col" style="gap:6px;margin-top:8px">${dm.map(m=>`<div style="padding:8px;border-radius:10px;background:${m.kind==='Veli görüşmesi'?'var(--bordo)':'#111'};color:var(--on-bordo);font-size:12px"><b>${m.time}</b> ${esc(shortName(stu(m.sid)))}<br><span style="opacity:.8">${m.kind} · ${esc(m.note)}</span></div>`).join('')||'<span class="meta">—</span>'}</div></div>`}).join('')}</div></div>`;
}
ACT.meetNew=()=>openModal(()=>({title:'Görüşme planla',body:`<div class="grid g2"><div class="fld"><label for="mtS">Öğrenci</label><select id="mtS" class="sel">${DB.students.filter(s=>secScope().includes(s.section)).map(s=>`<option value="${s.id}">${esc(fullName(s))} · ${s.section}</option>`).join('')}</select></div><div class="fld"><label for="mtK">Tür</label><select id="mtK" class="sel"><option>Veli görüşmesi</option><option>Öğrenci görüşmesi</option></select></div><div class="fld"><label for="mtD">Tarih</label><input id="mtD" type="date" class="in" value="${isoAdd(TODAY,2)}"></div><div class="fld"><label for="mtT">Saat</label><input id="mtT" type="time" class="in" value="15:30"></div></div><div class="fld"><label for="mtN">Konu</label><input id="mtN" class="in" placeholder="Örn. Kesirler desteği"></div>`,foot:`<button class="btn sec" data-act="closeLayer">Vazgeç</button><button class="btn pri" data-act="meetSave">Planla</button>`}));
ACT.meetSave=()=>{const m={id:uid('mt'),sid:$('#mtS').value,kind:$('#mtK').value,d:$('#mtD').value,time:$('#mtT').value,note:$('#mtN').value||'Genel görüşme'};UI.modal=null;commit('Görüşme takvime eklendi',()=>DB.meetings.push(m))};
ACT.printList=()=>openModal(()=>{const rows=DB.students.filter(s=>secScope().includes(s.section));return {title:'Çıktı önizlemesi',sub:`Öğrenci listesi · ${secScope().join(', ')} · ${rows.length} öğrenci`,body:`<div class="tw"><table class="t"><thead><tr><th>No</th><th>Öğrenci</th><th>Şube</th><th>Veli</th><th>Tanıma formu</th><th>Testler</th></tr></thead><tbody>${rows.map(s=>`<tr><td>${s.no}</td><td>${esc(fullName(s))}</td><td>${s.section}</td><td>${esc(s.parents[0].name)}</td><td class="small">Ö: ${FORM_ST[s.form.student].l} · V: ${FORM_ST[s.form.parent].l}</td><td class="small">${FORM_ST[s.tests.calisma].l}</td></tr>`).join('')}</tbody></table></div>`,foot:`<button class="btn sec" data-act="closeLayer">Kapat</button><button class="btn pri" data-act="pdfDemo">${ic('dl',15)} PDF hazırla</button>`}},true);
ACT.pdfDemo=()=>toast('PDF çıktısı hazırlandı (prototip: indirme bu önizlemede devre dışı)');
ACT.stuReport=el=>{UI.rep={sid:el.dataset.v,aud:'Öğretmen'};go('reports/ogrenci')};
ACT.msgTo=el=>{const[sid,pi]=el.dataset.v.split('|');UI.compose={to:pi!==undefined?`p:${sid}:${pi}`:`s:${sid}`,text:''};go('messages')};
ACT.formOpen=el=>{const[sid,who]=el.dataset.v.split('|');openDrawer(()=>formDrawer(sid,who))};
function formDrawer(sid,who){const s=stu(sid);const st=s.form[who];const W=who==='student'?'Öğrenci':'Veli';
  const ans=who==='student'?[['En sevdiğim ders','Fen Bilimleri ve görsel sanatlar'],['Ders çalışırken zorlandığım durum','Uzun problemleri okurken dikkatim dağılıyor'],['Boş zamanlarımda','Bisiklet, kısa video çekmek'],['Okulda en çok desteğe ihtiyaç duyduğum alan','Matematikte kesirler']]:[['Evde çalışma ortamı','Kendi odası var; akşam 19–20 arası çalışıyor'],['Ailenin gözlemi','Matematikte kendine güveni düşük'],['İletişim tercihi','Mesaj, hafta içi akşam'],['Okuldan beklenti','Düzenli kısa geri bildirim']];
  return {eyebrow:'Tanıma Formu · '+W,title:esc(fullName(s)),sub:`${s.section} · Durum: ${FORM_ST[st].l}`,body:st==='done'?`<div class="row"><span class="src m">${ic('ruler',12)} Form yanıtı</span><span class="meta">${who==='student'?'Öğrenci':'Veli'} tarafından 18 Eylül 2026'da dolduruldu</span></div><dl class="kv">${ans.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><div class="meta">Tanıma formu yanıtları beyana dayalıdır; tanı veya değerlendirme puanı üretmez.</div>`:stateBox(st==='pend'?'load':'empty',st==='pend'?'Form gönderildi, yanıt bekleniyor':'Form henüz gönderilmedi',st==='pend'?'Form 21 Ekim\'de gönderildi. Hatırlatma ekleyebilirsiniz.':'Formu göndererek öğrenciyi daha iyi tanıyabilirsiniz.'),
   foot:st==='done'?`<button class="btn sec" data-act="closeLayer">Kapat</button>`:`<button class="btn pri" data-act="formSend" data-v="${sid}|${who}">${ic('send',15)} ${st==='pend'?'Hatırlatma ekle':'Formu gönder'}</button>`}}
ACT.formSend=el=>{const[sid,who]=el.dataset.v.split('|');const s=stu(sid);commit(s.form[who]==='pend'?'Hatırlatma kaydedildi (prototipte gönderim yapılmaz)':'Form gönderildi olarak işaretlendi',()=>{s.form[who]='pend'})};
ACT.testOpen=el=>{const[sid,t]=el.dataset.v.split('|');openDrawer(()=>{const s=stu(sid);const st=s.tests[t];const T=TESTS[t];return {eyebrow:'Test · '+T.scope,title:T.name,sub:`${esc(fullName(s))} · ${FORM_ST[st].l}`,body:st==='done'?invBody(s,t):stateBox(st==='pend'?'load':'empty',st==='pend'?'Uygulama bekleniyor':'Uygulanmadı',`${T.name} ${st==='pend'?'bu öğrenciye atandı, henüz tamamlanmadı.':'bu öğrenciye henüz atanmadı.'}`),foot:`<button class="btn sec" data-go="student/assess/${sid}">Tüm Değerlendirmeler</button>${st!=='done'?`<button class="btn pri" data-act="testAssign" data-v="${sid}|${t}">${st==='pend'?'Hatırlatma ekle':'Uygulamaya ata'}</button>`:''}`}})};
ACT.testAssign=el=>{const[sid,t]=el.dataset.v.split('|');const s=stu(sid);commit('Test durumu güncellendi',()=>{s.tests[t]='pend'})};
function invBody(s,t){
  const R=mkRng(s.id.length*97+s.no*1);
  if(t==='calisma'){const dims=['Planlama','Dikkatini sürdürme','Ödev alışkanlığı','Sınav hazırlığı','Yardım isteme'];return `<div class="row"><span class="src m">${ic('ruler',12)} Ölçüm sonucu</span><span class="meta">Uygulama: 2 Ekim 2026 · 25 madde · 1–5 Likert</span></div><div class="mini-bars">${dims.map(d=>{const v=(2+R()*2.8).toFixed(1);return `<div class="mb"><span class="small">${d}</span>${meter(v/5*100)}<b class="small">${v}</b></div>`}).join('')}</div><div class="ai-box small"><b>Ölçek açıklaması:</b> Puanlar öğrencinin kendi çalışma davranışlarına ilişkin beyanını gösterir (1 = hiç, 5 = her zaman). Ortaokul düzeyinde norm verisi yoktur; sonuçlar betimseldir, klinik tanı veya etiketleme için kullanılmaz. Rehberlik görüşmesinde birlikte yorumlanmalıdır.</div>`}
  const areas=['Sayısal-mantıksal','Sanatsal','Sosyal yardım','Teknoloji ve tasarım','Doğa ve canlılar'];return `<div class="row"><span class="src m">${ic('ruler',12)} Ölçüm sonucu</span><span class="meta">İlgi alanı sıralaması · beyana dayalı</span></div><ol class="small" style="margin:0;padding-left:18px">${areas.sort(()=>R()-.5).map(a=>`<li>${a}</li>`).join('')}</ol><div class="ai-box small"><b>Ölçek açıklaması:</b> İlgi envanteri yetenek ya da uygunluk ölçmez; öğrencinin şu anki ilgi yönelimini gösterir ve yaşla değişebilir. Meslek yönlendirmesi için tek başına kullanılmaz.</div>`;
}

/* ================= TÜM DEĞERLENDİRMELER (tam sayfa) ================= */
const ASEC=[['sinav','Sınavlar ve testler','target'],['form','Tanıma formları','file'],['env','Envanterler','ruler'],['urun','Etkinlik ve dijital ürünler','image'],['kaz','Kazanım ve beceri yeterliği','layers'],['hata','Hata örüntüleri ve kanıtlar','alert'],['mud','Müdahale geçmişi ve kontrol ölçümleri','hist'],['koc','AI Koç öğrenme izi','spark'],['goz','Öğretmen gözlemleri','eye'],['kitap','Kişisel kitap önizlemesi','bookopen'],['evde','Evde Destek önerileri','house']];
function evRow({date,method,result,desc,by,next,src='m',title,id}){
  const S={m:['m','ruler','Ölçüm sonucu'],o:['o','eye','Öğretmen gözlemi'],a:['a','spark','AI yorumu'],f:['f','file','Beyan (form)']}[src];
  const open=UI.exp[id];
  return `<div class="acc ${open?'open':''}"><button data-act="accT" data-v="${id}" aria-expanded="${!!open}"><span class="src ${S[0]}">${ic(S[1],12)} ${S[2]}</span><b class="trunc">${esc(title)}</b><span class="meta nowrap">${fmtD(date)}</span><span class="pill p-gray nowrap">${esc(result)}</span>${ic('cd',16,'car')}</button><div class="bd"><div><dl class="ev"><div><dt>Tarih</dt><dd>${fmtDL(date)}</dd></div><div><dt>Yöntem</dt><dd>${esc(method)}</dd></div><div><dt>Sonuç</dt><dd><b>${esc(result)}</b></dd></div><div style="grid-column:span 2"><dt>Açıklama</dt><dd>${desc}</dd></div><div><dt>Değerlendiren</dt><dd>${esc(by)}</dd></div><div style="grid-column:1/-1"><dt>Sonraki adım</dt><dd>${next}</dd></div></dl></div></div></div>`;
}
ACT.accT=el=>{UI.exp[el.dataset.v]=!UI.exp[el.dataset.v];const acc=el.closest('.acc');acc.classList.toggle('open');el.setAttribute('aria-expanded',acc.classList.contains('open'))};
regField('acourse',{l:'Ders',opts:()=>[{v:'',l:'Tüm dersler'}].concat(visibleCourses(stu(UI.param)?.section||'7/B').map(c=>({v:c,l:COURSES[c].name}))),get:()=>UI.ac||'',set:v=>UI.ac=v,def:''});
PAGES.student=(sub,sid)=>{
  const s=stu(sid);if(!s)return {title:'Öğrenci bulunamadı',crumbs:[['Öğrencilerim','students']],html:`<div class="card panel">${stateBox('err','Öğrenci kaydı bulunamadı','Bağlantı geçersiz olabilir ya da öğrenci başka bir şubeye taşınmış olabilir.',`<button class="btn sec sm" data-go="students">Öğrenci listesine dön</button>`)}</div>`};
  return sub==='profile'?profilePage(s):assessPage(s);
};
function assessPage(s){
  const crumbs=[['Öğrencilerim','students'],[fullName(s),'student/assess/'+s.id],['Tüm Değerlendirmeler','']];
  const from=dateFrom();const c=UI.ac||'';const cOK=k=>!c||k.startsWith(c);
  const ms=Object.entries(DB.measures[s.id]).filter(([k])=>cOK(k));
  // 1 sınav/test
  const tItems=[];[...DB.tests,...DB.exams].forEach(t=>{const it=DB.items[t.id];if(!it||!it[0].resp[s.id])return;const corr=it.filter(q=>q.resp[s.id].c===q.correct).length;tItems.push({id:'ev-'+t.id,title:t.name,date:t.date,method:(t.kind||'Yazılı sınav')+` · ${it.length} soru`,result:`${corr}/${it.length} doğru`,desc:`Kazanımlar: ${t.kz.map(k=>kzOf(k).topic).join(', ')}. Boş: ${it.filter(q=>q.resp[s.id].c==='Boş').length}.`,by:'Selin Yılmaz · otomatik puanlama',next:corr/it.length<.6?'Yanlış yapılan sorular için hata kanıtlarını inceleyin; kısa kontrol ölçümü planlayın.':'İzlemeye devam.',src:'m'})});
  const sec1=tItems.filter(x=>x.date>=from).map(evRow).join('')||stateBox('empty','Kayıt yok','Seçili tarih aralığında sınav veya test yok.');
  const sec2=['student','parent'].map(w=>evRow({id:'ev-f'+w,title:'Tanıma formu · '+(w==='student'?'Öğrenci':'Veli'),date:'2026-09-18',method:'Beyana dayalı form',result:FORM_ST[s.form[w]].l,desc:s.form[w]==='done'?'Form yanıtları öğrencinin ilgi alanları, çalışma ortamı ve destek beklentisini içerir.':'Form henüz tamamlanmadı.',by:w==='student'?fullName(s):s.parents[0].name,next:s.form[w]==='done'?'Rehberlik görüşmesinde birlikte değerlendirin.':`<button class="btn xs sec" data-act="formOpen" data-v="${s.id}|${w}">Formu aç</button>`,src:'f'})).join('');
  const sec3=['calisma','ilgi'].map(t=>s.tests[t]==='done'?`<div class="card" style="padding:14px"><div class="row" style="margin-bottom:8px"><b>${TESTS[t].name}</b><span class="meta">${TESTS[t].scope}</span></div>${invBody(s,t)}</div>`:`<div class="row small" style="padding:8px 0">${ic(FORM_ST[s.tests[t]].ic,16)} <b>${TESTS[t].name}</b> <span class="muted">${FORM_ST[s.tests[t]].l} · ${TESTS[t].scope}</span></div>`).join('');
  const acts=DB.acts.filter(a=>a.subs[s.id]&&a.subs[s.id].state==='tamamladı'&&cOK(a.course));
  const sec4=acts.map(a=>{const sb=a.subs[s.id];const rub=sb.rubric?` · Rubrik ${sb.rubric.reduce((x,y)=>x+y,0)}/16`:'';return evRow({id:'ev-'+a.id,title:a.title,date:sb.date,method:a.type+(a.product?' · '+a.product:''),result:sb.evaluated===false?'Değerlendirme bekliyor':`${sb.score}/100${rub}`,desc:a.needsEval?(sb.evaluated?`Rubrik: ${RUBRIC.map((r,i)=>r+' '+sb.rubric[i]+'/4').join(' · ')}${sb.fb?'<br>Geri bildirim: '+esc(sb.fb):''}`:'Teslim alındı; öğretmen onayı bekleniyor.'):'Sistem puanlaması; doğru/yanlış ve çözüm süresi.',by:a.needsEval?(sb.evaluated?'Selin Yılmaz':'—'):'Sistem',next:sb.evaluated===false?`<button class="btn xs pri" data-go="activities/degerlendirilecek">Değerlendir</button>`:'—',src:'m'})}).join('')||stateBox('empty','Tamamlanan etkinlik yok','');
  const sec5=`<div class="tw"><table class="t"><thead><tr><th>Kazanım</th><th>Yeterlik</th><th>Ölçüm</th><th>Son ölçüm</th><th>Beceri</th></tr></thead><tbody>${KZ.filter(k=>k.grade===s.grade&&visibleCourses(s.section).includes(k.course)&&cOK(k.id)).map(k=>{const m=mOf(s.id,k.id);return `<tr><td><b class="small">${k.topic}</b> <span class="small">${esc(k.name)}</span></td><td class="nowrap">${m?`<b>${m.v}</b> `:''}${m&&m.n<2?'<span class="pill p-gray">'+ic('info',12)+' Yetersiz veri</span>':lvlTag(m?m.v:null)}</td><td>${m?m.n:0}</td><td class="small">${m?fmtD(m.last.d)+' · '+m.last.src:'—'}</td><td class="small">${k.skill}</td></tr>`}).join('')}</tbody></table></div><div class="meta" style="margin-top:6px">Beceri sütunu kazanımın ilişkili olduğu beceriyi gösterir; soru sayısı beceri puanına dönüştürülmez. 21. yy beceri düzeyleri yalnızca ürün rubriklerinden gelir.</div>`;
  const errs=DB.errors.filter(e=>e.sid===s.id&&cOK(e.kz));
  const sec6=errs.length?`<div class="col" style="gap:8px">${errs.map(e=>`<button class="card" style="padding:12px;text-align:left" data-act="errOpen" data-v="${e.id}"><div class="row">${etag(e.type,e.sub)}<b class="small">${esc(kzOf(e.kz).name)}</b><span class="sp"></span><span class="meta">${e.count} tekrar · kanıt ${e.evidence}</span>${e.evidence==='Zayıf'?'<span class="pill p-out">Ek ölçüm gerekli</span>':''}</div><div class="small" style="margin-top:6px"><b>Hatalı adım:</b> ${esc(e.step)}</div></button>`).join('')}</div>`:stateBox('empty','Hata örüntüsü yok','Bu öğrencide tekrarlayan hata tespit edilmedi.');
  const hist=[];DB.alerts.filter(a=>a.sid===s.id).forEach(a=>a.history.forEach(h=>hist.push({d:h.d,t:h.t,src:'Uyarı'})));errs.forEach(e=>{e.history.forEach(h=>hist.push({d:h.d,t:kzOf(e.kz).topic+': '+h.t,src:'Hata'}));if(e.post)hist.push({d:e.post.d,t:`Kontrol ölçümü ${kzOf(e.kz).topic}: ${e.post.s}/100`,src:'Ölçüm'})});
  const sec7=hist.length?`<div class="col" style="gap:6px">${hist.sort((a,b)=>a.d<b.d?1:-1).map(h=>`<div class="row small">${ic(h.src==='Ölçüm'?'ruler':'hist',14,'muted')}<span class="muted nowrap">${fmtD(h.d)}</span><span class="pill p-gray">${h.src}</span><span>${esc(h.t)}</span></div>`).join('')}</div>`:stateBox('empty','Müdahale kaydı yok','');
  const weak=ms.map(([k])=>({k:kzOf(k),m:mOf(s.id,k)})).sort((a,b)=>a.m.v-b.m.v);
  const w0=weak[0];
  const sec8=`<div class="ai-box"><div class="row"><span class="src a">${ic('spark',12)} AI yorumu</span><span class="meta">AI Koç oturum kayıtlarından özetlendi · öğretmen onayı gerekmez, karar vermez</span></div><ul class="small" style="margin:8px 0 0;padding-left:18px"><li>3 Kas · ${w0?esc(w0.k.topic):'Kesirler'}: 4 soru, 2. ipucundan sonra doğru çözüm; ilk denemede ${w0&&w0.k.id==='MAT7-4'?'paydaları topladı':'işlem adımını atladı'}.</li><li>29 Eki · Tam sayılar tekrarı: 6/6 doğru, ortalama 48 sn.</li><li>24 Eki · “Neden böyle?” sorusuna 3 kez açıklama istedi; görsel model sonrası ilerledi.</li></ul></div>`;
  const obs=DB.observations.filter(o=>o.sid===s.id);
  const sec9=`${obs.map(o=>evRow({id:'ev-'+o.id,title:o.text.slice(0,60)+(o.text.length>60?'…':''),date:o.d,method:'Sınıf içi gözlem',result:'Not',desc:esc(o.text),by:o.by,next:'—',src:'o'})).join('')||'<p class="meta">Henüz gözlem notu yok.</p>'}<div class="row" style="margin-top:10px;align-items:flex-end"><div class="fld sp"><label for="obsTxt">Yeni gözlem</label><input class="in" id="obsTxt" placeholder="Örn. Grup çalışmasında çözüm yolunu açıkladı"></div><button class="btn pri" data-act="obsAdd" data-v="${s.id}">${ic('plus',15)} Ekle</button></div>`;
  const page=UI.bookP||0;const bookPages=[`<div class="bookp cover" key="0"><span class="eyebrow" style="color:var(--krem)">Kişisel kitap · taslak</span><h4>${esc(s.first)}'in Matematik Yolculuğu</h4><span class="small">Ekim–Kasım 2026 · ${s.section}</span></div>`,`<div class="bookp" key="1"><h4>Neleri başardım?</h4><p class="small">${weak.slice(-2).map(x=>`${esc(x.k.topic)} konusunda ${x.m.v} puana ulaştım.`).join(' ')}</p><p class="small">En sevdiğim yöntem: model çizerek düşünmek.</p></div>`,`<div class="bookp" key="2"><h4>Sıradaki hedefim</h4><p class="small">${w0?esc(w0.k.name):'Yeni konu'}: önce modelle, sonra işlemle çözeceğim. Her soruda “Sonucum mantıklı mı?” diye kontrol edeceğim.</p><p class="small muted">Bu sayfa öğrenci ve öğretmen tarafından birlikte düzenlenir.</p></div>`];
  const sec10=`<div class="book">${bookPages[page]}</div><div class="row" style="justify-content:center"><button class="btn sm sec" data-act="bookP" data-v="${page-1}" ${page<=0?'disabled':''}>${ic('cl',14)} Önceki</button><span class="small">${page+1} / 3</span><button class="btn sm sec" data-act="bookP" data-v="${page+1}" ${page>=2?'disabled':''}>Sonraki ${ic('cr',14)}</button><button class="btn sm ghost" data-act="toAssistant" data-v="book|${s.id}">${ic('spark',14)} Asistanla düzenle</button></div>`;
  const sec11=homeSupport(s,w0);
  const navs=ASEC.map(([id,l,icn])=>`<a href="#sec-${id}" data-act="anchor" data-v="${id}">${ic(icn,15)} ${l}</a>`).join('');
  const body={sinav:sec1,form:sec2,env:sec3,urun:sec4,kaz:sec5,hata:sec6,mud:sec7,koc:sec8,goz:sec9,kitap:sec10,evde:sec11};
  const avgV=studentAvg(s.id);
  return {title:'Tüm Değerlendirmeler',crumbs,html:`
  <section class="card panel"><div class="row" style="gap:16px">${avatar(s,72)}<div class="sp" style="min-width:200px"><div class="eyebrow">${s.section} · No ${s.no} · Rehber öğretmen ${REHBER[s.section]}</div><h2 class="st" style="font-size:24px">${esc(fullName(s))}</h2><div class="row small" style="margin-top:6px"><span class="pill p-krem">Ort. ${avgV??'—'}</span><span class="pill p-gray">Katılım %${s.part}</span>${openAlerts().filter(a=>a.sid===s.id).length?`<span class="pill p-soft">${ic('alert',12)} ${openAlerts().filter(a=>a.sid===s.id).length} açık uyarı</span>`:''}</div></div>
   <div class="col" style="gap:8px;align-items:flex-end"><div class="row"><button class="btn sec sm" data-act="backList">${ic('back',14)} Öğrenci listesine dön</button><button class="btn sec sm" data-go="student/profile/${s.id}">${ic('idcard',14)} Öğrenci Profili</button></div><div class="row">${dd('date',FIELDS.date,{align:'right'})}${dd('acourse',FIELDS.acourse,{align:'right'})}</div></div></div>
   <div class="legend" style="margin-top:12px"><span class="src m">${ic('ruler',12)} Ölçüm sonucu</span><span class="src o">${ic('eye',12)} Öğretmen gözlemi</span><span class="src a">${ic('spark',12)} AI yorumu</span><span class="src f">${ic('file',12)} Beyan (form)</span><span class="meta">Psikometrik sonuçlardan otomatik tanı üretilmez.</span></div></section>
  <div class="split-l"><nav class="card anav" aria-label="Bölümler">${navs}</nav><div class="col">${ASEC.map(([id,l,icn])=>`<section class="card panel" id="sec-${id}"><div class="card-hd"><div class="t row">${ic(icn,18)}<h2 class="st">${l}</h2></div></div>${body[id]}</section>`).join('')}</div></div>`};
}
ACT.anchor=(el,e)=>{e.preventDefault();const t=$('#sec-'+el.dataset.v);t&&t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});$$('.anav a').forEach(a=>a.classList.toggle('on',a===el))};
ACT.backList=()=>{const last=UI.stack[UI.stack.length-1];if(last==='#students')history.back();else go('students')};
ACT.bookP=el=>{UI.bookP=clamp(+el.dataset.v,0,2);render()};
ACT.obsAdd=el=>{const v=$('#obsTxt').value.trim();if(!v){$('#obsTxt').classList.add('err');$('#obsTxt').focus();return}commit('Gözlem eklendi',()=>DB.observations.unshift({id:uid('o'),sid:el.dataset.v,d:TODAY,text:v,by:TEACHER.name}))};
function _homeSupportOld(s,w0){
  const key='hs-'+s.id;const saved=DB.drafts.find(d=>d.id===key);
  const k=w0?w0.k:null;const e=k?DB.errors.find(x=>x.sid===s.id&&x.kz===k.id):null;
  const def=k?[`${k.topic} için haftada 3 gün, 10 dakikalık “mutfak matematiği”: tarifteki ölçüleri ikiye katlayın veya yarıya indirin.`,e&&e.type==='K'?'Kâğıt şeritlerle kesirleri katlayarak karşılaştırın; çocuğunuzdan neden böyle olduğunu anlatmasını isteyin.':e&&e.type==='I'?'Çözümü bitirince 3 soruluk kontrol listesini birlikte okuyun: işaret, işlem sırası, sonuç mantıklı mı?':'Soruyu okuduktan sonra “Ne biliyoruz, ne arıyoruz?” sorularını sesli cevaplamasını isteyin.','Doğru cevaptan çok çabayı ve açıklamayı övün; yanlışları “ipucu” olarak konuşun.']:['Düzenli çalışma saatini sürdürün.'];
  const items=saved?saved.items:def;
  return `<div class="ai-box"><div class="row"><span class="src a">${ic('spark',12)} AI taslağı</span><span class="meta">${k?`Dayanak: ${k.name} · ${e?ERR[e.type].name:'düşük yeterlik'}`:''}</span>${saved?'<span class="pill p-krem">Öğretmen düzenledi</span>':''}</div><ol class="small" style="margin:8px 0 0;padding-left:18px">${items.map((t,i)=>`<li><span contenteditable="true" data-hs="${i}" style="outline:none;border-bottom:1px dashed var(--line2)">${esc(t)}</span></li>`).join('')}</ol></div><div class="row" style="justify-content:flex-end"><button class="btn sm sec" data-act="hsSave" data-v="${s.id}">${ic('check',14)} Düzenlemeyi kaydet</button><button class="btn sm pri" data-act="hsToReport" data-v="${s.id}">${ic('file',14)} Veli raporuna ekle</button></div>`;
}
ACT.hsSave=el=>{const items=$$('[data-hs]').map(x=>x.textContent.trim()).filter(Boolean);const id='hs-'+el.dataset.v;commit('Evde Destek önerileri kaydedildi',()=>{DB.drafts=DB.drafts.filter(d=>d.id!==id);DB.drafts.push({id,kind:'Evde Destek',sid:el.dataset.v,items,d:TODAY})})};
ACT.hsToReport=el=>{ACT.hsSave(el);UI.rep={sid:el.dataset.v,aud:'Veli'};go('reports/ogrenci')};
ACT.toAssistant=el=>{const[kind,sid]=el.dataset.v.split('|');UI.asst={ctxStudent:sid,prefill:kind==='book'?'Bu öğrenci için kişisel kitap taslağı yaz.':'Bu öğrenci için Evde Destek taslağı yaz.'};applyF(()=>{F.sections=[stu(sid).section];F.student=sid});go('assistant')};

/* ================= ÖĞRENCİ PROFİLİ (demografik) ================= */
const canEdit=s=>TEACHER.guidance.includes(s.section);
function profilePage(s){
  const crumbs=[['Öğrencilerim','students'],[fullName(s),'student/profile/'+s.id],['Öğrenci Profili','']];
  const ed=UI.pEdit===s.id&&canEdit(s);const er=UI.pErr||{};
  const f=(id,l,v,{edit=false,type='text',ro=false}={})=>`<div class="fld"><label for="pf-${id}">${l}${!edit&&ed&&!ro?' '+ic('lock',11):''}</label><input class="in ${er[id]?'err':''}" id="pf-${id}" type="${type}" value="${esc(v)}" ${ed&&edit?'':'readonly'}>${er[id]?`<span class="ferr">${er[id]}</span>`:''}</div>`;
  return {title:'Öğrenci Profili',crumbs,html:`
  <section class="card panel"><div class="row" style="gap:16px">${avatar(s,84)}<div class="sp" style="min-width:200px"><div class="eyebrow">Demografik ve kayıt bilgileri</div><h2 class="st" style="font-size:24px">${esc(fullName(s))}</h2><div class="row small" style="margin-top:6px"><span class="pill p-ink">${s.status}</span><span class="pill p-krem">${s.section}</span><span class="meta">Fotoğraf kurgusaldır</span></div></div>
   <div class="row"><button class="btn sec sm" data-act="backList">${ic('back',14)} Listeye dön</button><button class="btn sec sm" data-go="student/assess/${s.id}">${ic('clipcheck',14)} Tüm Değerlendirmeler</button>${canEdit(s)?(ed?'':`<button class="btn pri sm" data-act="pEdit" data-v="${s.id}">${ic('edit',14)} Düzenle</button>`):`<span class="pill p-gray" data-tip="Demografik alanları yalnızca rehber öğretmen ve idare düzenleyebilir">${ic('lock',12)} Salt okunur</span>`}</div></div></section>
  <div class="grid g2">
   <section class="card panel"><h2 class="st" style="margin-bottom:12px">Kimlik ve kayıt</h2><div class="grid g2">${f('first','Ad',s.first)}${f('last','Soyad',s.last)}${f('birth','Doğum tarihi',fmtDL(s.birth)+' · '+age(s.birth)+' yaş')}${f('no','Öğrenci numarası',s.no)}${f('org','Kurum',TEACHER.org)}${f('cls','Sınıf / şube',s.grade+'. sınıf · '+s.section)}${f('st','Kayıt durumu',s.status)}${f('yr','Akademik yıl','2026-2027')}${f('rh','Rehber öğretmen',REHBER[s.section])}${f('dist','İkamet ilçesi',s.district,{edit:true})}</div></section>
   <section class="card panel"><h2 class="st" style="margin-bottom:12px">İletişim</h2><div class="grid g2">${f('phone','Öğrenci telefonu',s.phone,{edit:true,type:'tel'})}${f('email','Öğrenci e-postası',s.email,{edit:true,type:'email'})}</div>
    <div class="divider" style="margin:14px 0"></div><h3 class="sst" style="margin-bottom:10px">Veli / vasi</h3>${s.parents.map((p,i)=>`<div class="grid g2" style="margin-bottom:12px">${f('pn'+i,'Ad soyad',p.name,{edit:true})}${f('pr'+i,'Yakınlık',p.rel,{edit:true})}${f('pp'+i,'Telefon',p.phone,{edit:true,type:'tel'})}${f('pe'+i,'E-posta',p.email,{edit:true,type:'email'})}</div>`).join('')}</section>
  </div>
  <section class="card panel"><div class="row"><h2 class="st sp">Yetki kapsamında diğer bilgiler</h2><span class="pill p-gray">${ic('shield',12)} Rol: Rehber öğretmen (${TEACHER.guidance.join(', ')})</span></div><dl class="kv" style="margin-top:12px"><dt>Kardeş bilgisi</dt><dd>${canEdit(s)?'1 kardeş · aynı okulda değil':'<span class="muted">Yetki kapsamı dışında</span>'}</dd><dt>Sağlık / özel gereksinim</dt><dd><span class="muted">${ic('lock',12)} Yalnızca okul rehberlik servisi ve idare görebilir</span></dd><dt>AI işlemleri</dt><dd>Asistana gönderilen verilerde ad, numara ve iletişim bilgileri maskelenir (ör. Ö-${s.no}).</dd></dl></section>
  ${ed?`<div class="card" style="position:sticky;bottom:12px;display:flex;gap:10px;align-items:center;z-index:5"><span class="sp small">${ic('edit',14)} Düzenleme modu · yalnızca iletişim ve adres alanları değiştirilebilir</span><button class="btn sec" data-act="pCancel">Vazgeç</button><button class="btn pri" data-act="pSave" data-v="${s.id}">${ic('check',15)} Kaydet</button></div>`:''}`};
}
ACT.pEdit=el=>{UI.pEdit=el.dataset.v;UI.pErr={};render();setTimeout(()=>$('#pf-dist')&&$('#pf-dist').focus(),20)};
ACT.pCancel=()=>{UI.pEdit=null;UI.pErr={};render();toast('Değişiklikler kaydedilmedi')};
ACT.pSave=el=>{const s=stu(el.dataset.v);const v=id=>$('#pf-'+id).value.trim();const err={};const telOK=x=>/^\(?\d{3}\)?\s?\d{3}\s?\d{2}\s?\d{2}$/.test(x);const mailOK=x=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x);
  if(!telOK(v('phone')))err.phone='Telefon (555) 012 34 56 biçiminde olmalı';if(!mailOK(v('email')))err.email='Geçerli bir e-posta girin';
  s.parents.forEach((p,i)=>{if(!v('pn'+i))err['pn'+i]='Ad soyad zorunlu';if(!telOK(v('pp'+i)))err['pp'+i]='Telefon biçimi hatalı';if(!mailOK(v('pe'+i)))err['pe'+i]='E-posta biçimi hatalı'});
  if(Object.keys(err).length){UI.pErr=err;render();toast('Kaydedilemedi: işaretli alanları düzeltin');return}
  UI.pEdit=null;UI.pErr={};commit('Profil kaydedildi',()=>{s.district=v('dist');s.phone=v('phone');s.email=v('email');s.parents.forEach((p,i)=>{p.name=v('pn'+i);p.rel=v('pr'+i);p.phone=v('pp'+i);p.email=v('pe'+i)})})};
