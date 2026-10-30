/* ================= GÖRSEL KÜTÜPHANESİ (basit, anlaşılır, etkileşimli) =================
   VIS.render(v,key) → HTML. v = {type, params, caption}. Durum UI.vs[key]'de tutulur.
   Etkileşim: data-act="vis" data-k=<key> data-op=<işlem> data-v=<değer>; yalnızca görsel kutusu yeniden çizilir. */
UI.vs=UI.vs||{};
const VREG={};
const VC={ink:'#2B2118',mut:'#8A7B6B',line:'#E6DACA',bord:'#810000',red:'#E2445C',org:'#F08A2C',yel:'#FFC24B',grn:'#2E9E6B',blu:'#2F7DD8',pur:'#7B5CFA',tea:'#12A39A',pink:'#E76FA8',crm:'#FBF3E7'};
const PAL=[VC.red,VC.blu,VC.grn,VC.org,VC.pur,VC.tea,VC.yel,VC.pink];
const vsvg=(w,h,inner,lbl='')=>`<svg viewBox="0 0 ${w} ${h}" class="vis-svg" role="img" aria-label="${esc(lbl)}">${inner}</svg>`;
const vtxt=(x,y,t,o={})=>`<text x="${x}" y="${y}" font-size="${o.s||12}" font-weight="${o.w||700}" fill="${o.c||VC.ink}" text-anchor="${o.a||'middle'}" font-family="Nunito,Manrope,Arial">${esc(String(t))}</text>`;
const vbtn=(key,op,label,v='',cls='')=>`<button class="vbtn ${cls}" data-act="vis" data-k="${key}" data-op="${op}" data-v="${esc(String(v))}">${label}</button>`;
const fracVal=s=>{if(typeof s==='number')return s;s=String(s).trim();if(s.includes('/')){const[a,b]=s.split('/').map(Number);return b?a/b:0}return parseFloat(s.replace(',','.'))||0};

const simp=(a,b)=>{const g=gcd(a,b)||1;return `${a/g}/${b/g}`};
const VIS={
  // Parametreler dışarıdan (yapay zekâ, öğretmen) gelir: metinlerdeki HTML karakterleri zararsız benzerleriyle değiştirilir,
  // sayısal alanlar sınırlandırılır. Böylece görsel çiziciler parametreyi kaçışsız kullansa bile kod çalışamaz.
  safe(v){const t=x=>typeof x==='string'?x.replace(/</g,'＜').replace(/>/g,'＞').replace(/"/g,'”').replace(/`/g,'ʼ'):Array.isArray(x)?x.map(t):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,y])=>[k,t(y)])):x;
    const n=(x,d,lo,hi)=>{const y=Number(x);return Number.isFinite(y)?Math.min(hi,Math.max(lo,y)):d};
    const p=t(v.params&&typeof v.params==='object'?v.params:{});
    if(v.type==='cubes'){p.l=n(p.l,3,1,6);p.w=n(p.w,2,1,6);p.h=n(p.h,2,1,6)}
    if(v.type==='coord'&&p.line)p.line={m:n(p.line.m,1,-3,3),b:n(p.line.b,0,-5,5)};
    if(v.type==='force')p.forces=[].concat(p.forces||[]).slice(0,6).map(f=>({dir:f&&f.dir==='sol'?'sol':'sag',n:n(f&&f.n,10,0,100)}));
    if(v.type==='numberline'){p.min=n(p.min,0,-1000,1000);p.max=n(p.max,10,p.min+0.001,p.min+1000);p.step=n(p.step,1,(p.max-p.min)/60,p.max-p.min);if(p.target!=null)p.target=n(p.target,null,p.min,p.max)}
    if(v.type==='areagrid'){p.rows=n(p.rows,10,1,20);p.cols=n(p.cols,10,1,20)}
    if(v.type==='bars')p.values=[].concat(p.values||[]).slice(0,12).map(x=>n(x,0,0,1e6));
    if(v.type==='pie')p.values=[].concat(p.values||[]).slice(0,12).map(x=>n(x,0,0,1e6));
    if(v.type==='dice'&&p.counts)p.counts=[].concat(p.counts).slice(0,12).map(x=>n(x,1,0,100));
    if(v.type==='pizza')p.maxCut=n(p.maxCut,12,2,16);
    if(v.type==='atom')p.element=String(p.element||'C').replace(/[^A-Za-z]/g,'').slice(0,2)||'C';
    if(v.type==='cards')p.items=[].concat(p.items||[]).map(c=>({...c,ic:String(c&&c.ic||'').slice(0,4)}));
    return {...v,params:p,caption:v.caption}},
  render(v,key){if(!v||!VIS[v.type])return '';v=VIS.safe(v);VREG[key]=v;const st=UI.vs[key]||(UI.vs[key]=VIS.init(v));
    return `<figure class="vis" id="vis-${key}"><div class="vis-body">${VIS[v.type](v.params||{},key,st)}</div>${v.caption?`<figcaption>${ic('info',13)} ${esc(v.caption)}</figcaption>`:''}</figure>`},
  init(v){const p=v.params||{};switch(v.type){
    case 'pizza':return {n:[1,1],sel:[[],[]]};
    case 'zoom':return {i:0};
    case 'numberline':return {x:p.min??0};
    case 'bars':return {vals:(p.values||[]).slice()};
    case 'balance':return {x:0};
    case 'areagrid':return {on:{}};
    case 'shapes':return {a:60,flip:false};
    case 'cubes':return {l:p.l||3,w:p.w||2,h:p.h||2};
    case 'coord':return {m:p.line?p.line.m:1,b:p.line?p.line.b:0};
    case 'dice':return {rolls:[],last:null};
    case 'solar':return {pos:0};
    case 'circuit':return {on:false,mat:0};
    case 'light':return {a:40};
    case 'force':return {f:(p.forces||[{dir:'sag',n:10}]).map(x=>x.n)};
    case 'lever':return {f:50,mov:false,ang:25};
    case 'wave':return {fr:3,am:30};
    case 'heat':return {t:0,run:false};
    case 'flow':return {hi:-1};
    case 'map':return {sel:-1};
    case 'timeline':{const ev=(p.events||[]).map((e,i)=>i);const sh=p.shuffle===false?ev:ev.slice().sort((a,b)=>((a*7+3)%5)-((b*7+3)%5)||a-b);return {pool:sh,seq:[],done:false}}
    case 'cards':return {flip:{}};
    case 'organizer':return {val:{}};
    case 'sort':return {pick:-1,place:{},checked:false};
    default:return {};
  }},
  redraw(key){const box=$('#vis-'+key+' .vis-body');const v=VREG[key];if(box&&v)box.innerHTML=VIS[v.type](v.params||{},key,UI.vs[key])}
};
ACT.vis=el=>{const key=el.dataset.k,op=el.dataset.op,val=el.dataset.v;const v=VREG[key];if(!v)return;const st=UI.vs[key];const p=v.params||{};
  const h=VIS_OPS[v.type];if(h)h(st,op,val,p,key);VIS.redraw(key)};
document.addEventListener('input',e=>{const t=e.target;if(!t.matches('[data-vis-in]'))return;const key=t.dataset.k;const st=UI.vs[key];if(!st)return;const f=t.dataset.visIn;
  if(f.startsWith('val:')){st.val[f.slice(4)]=t.value;return}
  const n=parseFloat(t.value);if(f.startsWith('f'))st.f[+f.slice(1)]=n;else st[f]=n;VIS.redraw(key);const el=$(`[data-vis-in="${f}"][data-k="${key}"]`);if(el){el.focus()}});
const VIS_OPS={
  pizza(st,op,v,p){const[i,j]=String(v).split(':').map(Number);const max=Math.max(p.maxCut||0,24);
    if(op==='cut+'){st.n[i]=Math.min(max,st.n[i]+1);st.sel[i]=[]}if(op==='cut-'){st.n[i]=Math.max(1,st.n[i]-1);st.sel[i]=[]}
    if(op==='slice'){const s=st.sel[i];const k=s.indexOf(j);k>=0?s.splice(k,1):s.push(j)}if(op==='reset'){st.n=[1,1];st.sel=[[],[]]}},
  zoom(st,op,v,p){const n=ZOOM[p.preset||'kan'].length;if(op==='in')st.i=Math.min(n-1,st.i+1);if(op==='out')st.i=Math.max(0,st.i-1);if(op==='go')st.i=+v},
  numberline(st,op,v,p){const s=p.step||1;if(op==='set')st.x=+v;if(op==='l')st.x=Math.max(p.min??0,+(st.x-s).toFixed(4));if(op==='r')st.x=Math.min(p.max??10,+(st.x+s).toFixed(4))},
  bars(st,op,v){const[i,d]=String(v).split(':').map(Number);if(op==='adj')st.vals[i]=Math.max(0,(+st.vals[i]||0)+d)},
  balance(st,op,v){if(op==='x')st.x=Math.max(0,Math.min(20,st.x+(+v)))},
  areagrid(st,op,v){if(op==='cell')st.on[v]=!st.on[v];if(op==='clear')st.on={}},
  shapes(st,op){if(op==='flip')st.flip=!st.flip},
  dice(st,op,v,p){if(op==='roll'){const n=+v||1;for(let k=0;k<n;k++){let r;if(p.kind==='zar'||!p.kind)r=1+Math.floor(Math.random()*6);else{const c=p.counts||p.items.map(()=>1);const tot=c.reduce((a,b)=>a+b,0);let x=Math.random()*tot;r=0;while(x>=c[r]){x-=c[r];r++}}st.rolls.push(r);st.last=r}}if(op==='reset'){st.rolls=[];st.last=null}},
  solar(st,op){if(op==='next')st.pos=(st.pos+1)%8;if(op==='prev')st.pos=(st.pos+7)%8},
  circuit(st,op,v){if(op==='sw')st.on=!st.on;if(op==='mat')st.mat=+v},
  lever(st,op){if(op==='mov')st.mov=!st.mov},
  heat(st,op,v,p,key){if(op==='run'&&!st.run){st.run=true;st.t=0;const tick=()=>{if(!UI.vs[key]||!st.run)return;st.t+=1;VIS.redraw(key);if(st.t<100)setTimeout(tick,60);else st.run=false};tick()}if(op==='reset'){st.run=false;st.t=0}},
  flow(st,op,v){if(op==='hi')st.hi=st.hi===+v?-1:+v},
  map(st,op,v){if(op==='pin')st.sel=st.sel===+v?-1:+v},
  timeline(st,op,v,p){if(op==='pick'){const i=+v;st.pool=st.pool.filter(x=>x!==i);st.seq.push(i)}if(op==='undo'&&st.seq.length){st.pool.push(st.seq.pop())}if(op==='check')st.done=true;if(op==='reset'){const s=VIS.init({type:'timeline',params:p});Object.assign(st,s)}},
  cards(st,op,v,p){if(op==='flip')st.flip[v]=!st.flip[v];if(op==='say'){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(p.items[+v].w);u.lang='en-US';u.rate=.85;speechSynthesis.speak(u)}catch(e){}}},
  sort(st,op,v){if(op==='item')st.pick=st.pick===+v?-1:+v;if(op==='bin'&&st.pick>=0){st.place[st.pick]=+v;st.pick=-1;st.checked=false}if(op==='check')st.checked=true;if(op==='reset'){st.place={};st.pick=-1;st.checked=false}}
};

/* ---------- 1) PİZZA ---------- */
VIS.pizza=(p,key,st)=>{const N=p.pizzas===2?2:1;const tg=[].concat(p.target||[]);
  const one=i=>{const n=st.n[i],R=74,cx=90,cy=90;let s=`<circle cx="${cx}" cy="${cy}" r="${R+9}" fill="#F7C873"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#FFF0CF"/>`;
    for(let j=0;j<n;j++){const a0=j/n*2*Math.PI-Math.PI/2,a1=(j+1)/n*2*Math.PI-Math.PI/2;const on=st.sel[i].includes(j);
      const x0=cx+R*Math.cos(a0),y0=cy+R*Math.sin(a0),x1=cx+R*Math.cos(a1),y1=cy+R*Math.sin(a1);
      const d=n===1?`M${cx-R} ${cy}a${R} ${R} 0 1 0 ${2*R} 0a${R} ${R} 0 1 0 ${-2*R} 0`:`M${cx} ${cy}L${x0} ${y0}A${R} ${R} 0 ${1/n>.5?1:0} 1 ${x1} ${y1}Z`;
      s+=`<path d="${d}" fill="${on?'#F25C3B':'#FFF0CF'}" stroke="#B5651D" stroke-width="1.6" class="vclick" data-act="vis" data-k="${key}" data-op="slice" data-v="${i}:${j}"><title>Dilim ${j+1}</title></path>`;
      if(on){const am=(a0+a1)/2;for(let q=0;q<2;q++){const rr=R*(.42+q*.25);s+=`<circle cx="${cx+rr*Math.cos(am)}" cy="${cy+rr*Math.sin(am)}" r="${Math.max(3,8-n/2)}" fill="#8E1B12" pointer-events="none"/>`}}}
    const k=st.sel[i].length;return `<div class="pz-one">${vsvg(180,180,s,'Pizza')}<div class="pz-ctl">${vbtn(key,'cut-','−',i+':0','round')}<span><b>${n}</b> eşit dilim</span>${vbtn(key,'cut+','+',i+':0','round')}</div><div class="pz-val">Boyalı: <b>${k}/${n}</b>${k&&n>1&&gcd(k,n)>1?` <span class="muted">(= ${simp(k,n)})</span>`:''}</div></div>`};
  const tot=[0,1].slice(0,N).reduce((a,i)=>a+(st.n[i]?st.sel[i].length/st.n[i]:0),0);const want=tg.reduce((a,t)=>a+fracVal(t),0);
  const same=N===2&&st.n[0]===st.n[1];const ok=want&&Math.abs(tot-want)<1e-9;
  return `<div class="pz-row">${one(0)}${N===2?`<span class="pz-plus">+</span>${one(1)}`:''}</div>
   <div class="vis-stat ${ok?'ok':''}">${tg.length?`Hedef: <b>${tg.join(' + ')}</b> · `:''}${N===2?`Toplam: <b>${same?`${st.sel[0].length+st.sel[1].length}/${st.n[0]}`:'dilimler eşit değil'}</b>`:''}${ok?` · ${ic('okc',14)} Harika, tam olarak hedef kadar!`:N===2&&!same?' · İpucu: iki pizzayı aynı sayıda dilime kes.':''}</div>
   <div class="vis-tools">${vbtn(key,'reset','Baştan')}<span class="meta">Dilim sayısını + / − ile değiştir, boyamak için dilime dokun.</span></div>`};

/* ---------- 2) YAKINLAŞAN SAHNELER ---------- */
const cell=(x,y,r,col,kind)=>kind==='rbc'?`<g transform="translate(${x},${y})"><ellipse rx="${r}" ry="${r*.62}" fill="${col}"/><ellipse rx="${r*.45}" ry="${r*.25}" fill="#B3122B" opacity=".55"/></g>`:kind==='wbc'?`<g transform="translate(${x},${y})"><circle r="${r}" fill="#F3EEFF" stroke="#8B7AD9" stroke-width="2"/><path d="M${-r*.4} ${-r*.1}c${r*.2} ${-r*.5} ${r*.6} ${-r*.3} ${r*.5} 0s${-r*.4} ${r*.5} ${-r*.1} ${r*.4}" fill="#7B5CFA"/><circle cx="${r*.25}" cy="${r*.3}" r="${r*.22}" fill="#7B5CFA"/></g>`:`<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
const bodySil=(hi)=>`<g><circle cx="180" cy="34" r="20" fill="#F2C9A5"/><rect x="156" y="56" width="48" height="74" rx="18" fill="#7FB3E8"/><rect x="132" y="60" width="20" height="62" rx="10" fill="#F2C9A5" ${hi==='kol'?'stroke="#E2445C" stroke-width="4"':''}/><rect x="208" y="60" width="20" height="62" rx="10" fill="#F2C9A5"/><rect x="160" y="128" width="18" height="70" rx="9" fill="#3D5A80"/><rect x="182" y="128" width="18" height="70" rx="9" fill="#3D5A80"/></g>`;
const ZOOM={
  kan:[
   {t:'İnsan vücudu',d:'Kan, vücudumuzun her yerine damarlarla taşınır. Hadi kola yakınlaşalım!',s:()=>bodySil('kol')+`<circle cx="142" cy="92" r="26" fill="none" stroke="#E2445C" stroke-width="2.5" stroke-dasharray="5 4"/>`+vtxt(80,95,'Kol',{c:VC.red})},
   {t:'Kol',d:'Derimizin altında kanı taşıyan damarlar vardır. Mavi-mor görünenler toplardamarlardır.',s:()=>`<rect x="40" y="70" width="280" height="80" rx="40" fill="#F2C9A5"/><path d="M60 110 C120 90 180 130 240 105 S300 100 320 108" stroke="#C0263E" stroke-width="7" fill="none"/><path d="M60 125 C130 140 190 110 250 128 S300 130 320 124" stroke="#5B6FD8" stroke-width="7" fill="none"/><circle cx="190" cy="115" r="28" fill="none" stroke="#E2445C" stroke-width="2.5" stroke-dasharray="5 4"/>`+vtxt(190,62,'Damar',{c:VC.red})},
   {t:'Damar',d:'Damarın içinde kan akar. Kanın içinde farklı görevleri olan hücreler bulunur.',s:()=>`<rect x="20" y="70" width="320" height="80" rx="40" fill="#F7B8B8"/><rect x="20" y="82" width="320" height="56" rx="28" fill="#FCE3E3"/>${[[60,105],[100,122],[140,100],[180,118],[220,104],[260,124],[300,108],[120,112]].map(([x,y])=>cell(x,y,9,'#E0303F','rbc')).join('')}${cell(240,112,11,'','wbc')}<circle cx="160" cy="128" r="3" fill="#F2B640"/><circle cx="205" cy="96" r="3" fill="#F2B640"/><path d="M30 55h60" stroke="${VC.mut}" stroke-width="2" marker-end="url(#ar)"/>`+vtxt(60,48,'kan akışı',{s:10,c:VC.mut})},
   {t:'Kan hücreleri',d:'Alyuvarlar oksijen taşır, akyuvarlar mikroplarla savaşır, kan pulcukları yaralanınca kanı pıhtılaştırır.',s:()=>`${cell(80,100,34,'#E0303F','rbc')}${cell(190,100,38,'','wbc')}<g>${[0,1,2,3].map(k=>`<circle cx="${285+(k%2)*16}" cy="${90+Math.floor(k/2)*16}" r="5" fill="#F2B640"/>`).join('')}</g>`+vtxt(80,165,'Alyuvar',{s:14,c:'#C0263E'})+vtxt(80,182,'oksijen taşır',{s:11,w:600,c:VC.mut})+vtxt(190,165,'Akyuvar',{s:14,c:'#5B45C2'})+vtxt(190,182,'mikropla savaşır',{s:11,w:600,c:VC.mut})+vtxt(293,165,'Kan pulcuğu',{s:14,c:'#B7860B'})+vtxt(293,182,'pıhtılaştırır',{s:11,w:600,c:VC.mut})}],
  dolasim:[
   {t:'İnsan vücudu',d:'Dolaşım sistemi kalp, damarlar ve kandan oluşur.',s:()=>bodySil()+`<path d="M174 82c0-8 12-8 12 0 0 8-12 12-12 18 0-6-12-10-12-18 0-8 12-8 12 0z" transform="translate(6 -4)" fill="#E2445C"/>`+vtxt(250,90,'Kalp',{c:VC.red})},
   {t:'Kalp',d:'Kalp, kanı pompalayan güçlü bir kastır. Dört odacığı vardır.',s:()=>`<path d="M180 60c-30-40-100-10-80 40 12 30 50 50 80 80 30-30 68-50 80-80 20-50-50-80-80-40z" fill="#E2445C"/><path d="M180 64v110" stroke="#fff" stroke-width="3" opacity=".6"/><path d="M120 110h120" stroke="#fff" stroke-width="3" opacity=".6"/>`+vtxt(140,95,'sağ',{c:'#fff',s:11})+vtxt(220,95,'sol',{c:'#fff',s:11})},
   {t:'Damarlar',d:'Atardamarlar kanı kalpten götürür, toplardamarlar kalbe getirir; kılcal damarlar alışverişi yapar.',s:()=>`<path d="M40 80h280" stroke="#C0263E" stroke-width="12"/><path d="M40 150h280" stroke="#5B6FD8" stroke-width="12"/>${[80,140,200,260].map(x=>`<path d="M${x} 86c10 20-10 40 0 58" stroke="#B58BD8" stroke-width="3" fill="none"/>`).join('')}`+vtxt(180,70,'Atardamar',{c:'#C0263E'})+vtxt(180,176,'Toplardamar',{c:'#5B6FD8'})+vtxt(300,118,'kılcal',{c:'#8B5FB8',s:11})}],
  bitki:[
   {t:'Bitki',d:'Bitkinin besin ürettiği yer yapraklarıdır.',s:()=>`<rect x="176" y="90" width="8" height="100" fill="#4E8B3A"/><ellipse cx="150" cy="110" rx="34" ry="16" fill="#58B04A" transform="rotate(-25 150 110)"/><ellipse cx="212" cy="90" rx="34" ry="16" fill="#58B04A" transform="rotate(25 212 90)" stroke="#E2445C" stroke-width="3"/><rect x="140" y="188" width="80" height="22" rx="4" fill="#B5651D"/>`+vtxt(270,80,'Yaprak',{c:VC.grn})},
   {t:'Yaprak',d:'Yaprağın içi küçük bölmelere, yani hücrelere ayrılmıştır.',s:()=>`<path d="M40 110C120 20 260 20 320 110 260 200 120 200 40 110z" fill="#6CC05C"/><path d="M40 110h280" stroke="#3E8A33" stroke-width="3"/>${[90,140,190,240].map(x=>`<path d="M${x} 110l30 -35M${x} 110l30 35" stroke="#3E8A33" stroke-width="2"/>`).join('')}<rect x="170" y="88" width="40" height="40" fill="none" stroke="#E2445C" stroke-width="2.5" stroke-dasharray="4 3"/>`},
   {t:'Bitki hücresi',d:'Hücre duvarı, hücre zarı, çekirdek ve yeşil renkli kloroplastlar görülür.',s:()=>`<rect x="70" y="30" width="220" height="160" rx="14" fill="#D9F2CF" stroke="#3E8A33" stroke-width="6"/><rect x="82" y="42" width="196" height="136" rx="10" fill="none" stroke="#7CC46B" stroke-width="2"/><circle cx="150" cy="105" r="22" fill="#B58BD8"/>${[[220,70],[240,140],[110,160],[200,165],[120,60]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="14" ry="8" fill="#2E9E4A"/>`).join('')}`+vtxt(150,140,'çekirdek',{s:11})+vtxt(245,112,'kloroplast',{s:11,c:'#1F6E33'})}],
  madde:[
   {t:'Bir bardak su',d:'Su, gözle göremeyeceğimiz kadar küçük taneciklerden oluşur.',s:()=>`<path d="M130 40h100l-12 150h-76z" fill="#DCEFFF" stroke="#7FB3E8" stroke-width="3"/><path d="M136 90h88l-8 98h-72z" fill="#8CC8F5"/>`},
   {t:'Su damlası',d:'Bir damlada milyarlarca su molekülü vardır.',s:()=>`<path d="M180 30c40 60 60 90 60 115a60 60 0 0 1-120 0c0-25 20-55 60-115z" fill="#8CC8F5"/>${[[165,140],[195,120],[180,165],[205,155],[160,110]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#fff" opacity=".8"/>`).join('')}`},
   {t:'Su molekülleri',d:'Her su molekülü 1 oksijen ve 2 hidrojen atomundan oluşur.',s:()=>[[90,80],[180,130],[270,80],[140,170],[240,170]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="20" fill="#E2445C"/><circle cx="${x-20}" cy="${y+16}" r="11" fill="#fff" stroke="#999"/><circle cx="${x+20}" cy="${y+16}" r="11" fill="#fff" stroke="#999"/>`).join('')+vtxt(90,85,'O',{c:'#fff'})},
   {t:'Atom',d:'Atomun ortasında çekirdek, çevresinde elektronlar bulunur.',s:()=>`<circle cx="180" cy="105" r="18" fill="#E2445C"/><ellipse cx="180" cy="105" rx="80" ry="30" fill="none" stroke="#7FB3E8" stroke-width="2"/><ellipse cx="180" cy="105" rx="80" ry="30" fill="none" stroke="#7FB3E8" stroke-width="2" transform="rotate(60 180 105)"/><ellipse cx="180" cy="105" rx="80" ry="30" fill="none" stroke="#7FB3E8" stroke-width="2" transform="rotate(-60 180 105)"/><circle cx="260" cy="105" r="6" fill="${VC.blu}"/><circle cx="140" cy="40" r="6" fill="${VC.blu}"/>`+vtxt(180,170,'çekirdek + elektronlar',{s:11})}],
  sindirim:[
   {t:'İnsan vücudu',d:'Besinler ağızdan başlayan uzun bir yolculuğa çıkar.',s:()=>bodySil()+`<path d="M180 70v20c-12 0-14 14 0 16s14 18 0 18" stroke="#E2445C" stroke-width="4" fill="none"/>`},
   {t:'Sindirim sistemi',d:'Ağız → yemek borusu → mide → ince bağırsak → kalın bağırsak.',s:()=>`<path d="M180 20v50" stroke="#F08A2C" stroke-width="8"/><path d="M180 70c40 0 60 30 30 50-20 14-50 0-50-20" fill="#F7B26B"/><path d="M150 130c-30 10 20 20 0 30s30 15 0 25 40 10 60 0" stroke="#E2945F" stroke-width="10" fill="none"/><path d="M110 125v80h140v-80" stroke="#C26A35" stroke-width="12" fill="none"/>`+vtxt(250,90,'mide',{s:11})+vtxt(270,190,'kalın bağırsak',{s:11})+vtxt(90,160,'ince b.',{s:11})},
   {t:'İnce bağırsak',d:'İç yüzeydeki parmak gibi çıkıntılar (tümür) besinleri kana geçirir.',s:()=>`<rect x="30" y="140" width="300" height="40" fill="#E2945F"/>${[50,90,130,170,210,250,290].map(x=>`<rect x="${x-10}" y="70" width="22" height="72" rx="11" fill="#F7B26B"/><path d="M${x} 80v55" stroke="#C0263E" stroke-width="2"/>`).join('')}`+vtxt(180,205,'tümürler',{s:11})}],
  solunum:[
   {t:'İnsan vücudu',d:'Soluduğumuz hava akciğerlere gider.',s:()=>bodySil()+`<ellipse cx="170" cy="88" rx="9" ry="16" fill="#F49FB4"/><ellipse cx="190" cy="88" rx="9" ry="16" fill="#F49FB4"/>`},
   {t:'Akciğerler',d:'Soluk borusu bronşlara, bronşlar daha küçük kollara ayrılır.',s:()=>`<path d="M180 20v60M180 80l-30 20M180 80l30 20" stroke="#C26A8A" stroke-width="8"/><path d="M150 90c-60 0-70 100-10 110 30 4 30-60 10-110z" fill="#F49FB4"/><path d="M210 90c60 0 70 100 10 110-30 4-30-60-10-110z" fill="#F49FB4"/>`},
   {t:'Alveoller',d:'Küçük hava keseciklerinde oksijen kana geçer, karbondioksit kandan çıkar.',s:()=>`${[[120,90],[160,70],[200,90],[150,130],[200,135],[240,110]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="26" fill="#F7C0CF" stroke="#C26A8A" stroke-width="2"/>`).join('')}<path d="M60 170c80-30 160-30 240 0" stroke="#C0263E" stroke-width="6" fill="none"/>`+vtxt(180,200,'O₂ → kan · CO₂ → dışarı',{s:12})}],
  'harita-tr':[
   {t:'Dünya',d:'Ülkemiz Asya ve Avrupa kıtalarının birleştiği yerdedir.',s:()=>`<circle cx="180" cy="105" r="85" fill="#BFE3FF"/><path d="M120 60c30-10 60 0 70 20s-10 40-40 40-50-30-30-60zM200 120c30 0 50 20 40 40s-40 10-50-10 0-30 10-30z" fill="#8CCF7E"/><circle cx="196" cy="84" r="6" fill="#E2445C"/>`},
   {t:'Türkiye',d:'Türkiye üç tarafı denizlerle çevrili bir yarımada ülkesidir.',s:()=>TR_SHAPE('#8CCF7E')+`<circle cx="190" cy="95" r="5" fill="#E2445C"/>`},
   {t:'İl',d:'Her il ilçelere, ilçeler mahallelere ayrılır.',s:()=>`<path d="M60 50h120l40 40-20 80H80l-30-60z" fill="#CDEBC3" stroke="#3E8A33" stroke-width="2"/><path d="M120 50l20 120M60 110h170" stroke="#3E8A33" stroke-dasharray="4 3"/><circle cx="150" cy="100" r="5" fill="#E2445C"/>`},
   {t:'Mahalle',d:'Yaşadığımız mahallede okul, park, sağlık ocağı gibi ortak alanlar bulunur.',s:()=>`<rect x="20" y="20" width="320" height="180" fill="#EEF5E9"/><path d="M20 110h320M180 20v180" stroke="#BDBDBD" stroke-width="14"/><rect x="50" y="40" width="70" height="50" fill="#F7C873"/><rect x="220" y="40" width="80" height="50" fill="#9BD3F5"/><circle cx="90" cy="160" r="26" fill="#8CCF7E"/><rect x="230" y="135" width="60" height="45" fill="#F49FB4"/>`+vtxt(85,70,'Okul',{s:11})+vtxt(260,70,'Kütüphane',{s:11})+vtxt(90,164,'Park',{s:11})+vtxt(260,162,'Sağlık',{s:11})}]
};
const TR_SHAPE=(f)=>`<path d="M40 92l24-14 30 2 18-12 36 4 22-8 40 6 34-6 36 10 40-2 20 14-8 18 14 16-22 10-40 4-30 12-40-4-30 12-36-6-20 8-30-10-28 2-24-14-12-20 16-6z" fill="${f}" stroke="#3E8A33" stroke-width="2"/><path d="M22 70l14 8-6 12-14-4z" fill="${f}" stroke="#3E8A33" stroke-width="2"/>`;
VIS.zoom=(p,key,st)=>{const Z=ZOOM[p.preset]||ZOOM.kan;const S=Z[st.i];
  return `<div class="zoom-hd">${Z.map((z,i)=>`<button class="zdot ${i===st.i?'on':''} ${i<st.i?'past':''}" data-act="vis" data-k="${key}" data-op="go" data-v="${i}">${i+1}. ${esc(z.t)}</button>`).join(`<span class="zarr">›</span>`)}</div>
   <div class="zoom-stage" style="animation:zin .35s ease">${vsvg(360,210,`<defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${VC.mut}"/></marker></defs>`+S.s(),S.t)}</div>
   <p class="zoom-d"><b>${esc(S.t)}:</b> ${esc(S.d)}</p>
   <div class="vis-tools">${vbtn(key,'out','◀ Uzaklaş','',st.i?'':'dis')}${vbtn(key,'in','Yakınlaş ▶','',st.i<Z.length-1?'pri':'dis')}</div>`};

/* ---------- 3) SAYI DOĞRUSU ---------- */
VIS.numberline=(p,key,st)=>{const mn=p.min??0,mx=p.max??10,s=p.step||1;const W=340,x0=20,x1=W-20;const X=v=>x0+(v-mn)/(mx-mn)*(x1-x0);let t='';
  for(let v=mn;v<=mx+1e-9;v=+(v+s).toFixed(6)){const major=Math.abs(v-Math.round(v))<1e-9;t+=`<line x1="${X(v)}" x2="${X(v)}" y1="${major?52:56}" y2="${major?72:68}" stroke="${VC.ink}" stroke-width="${major?2:1}"/><rect x="${X(v)-8}" y="40" width="16" height="40" fill="transparent" class="vclick" data-act="vis" data-k="${key}" data-op="set" data-v="${v}"/>${major?vtxt(X(v),92,String(v).replace('.',','),{s:11}):''}`}
  const ok=p.target!=null&&Math.abs(st.x-p.target)<1e-6;
  return vsvg(W,110,`<line x1="${x0-8}" x2="${x1+8}" y1="62" y2="62" stroke="${VC.ink}" stroke-width="2"/>${t}<circle cx="${X(st.x)}" cy="62" r="9" fill="${ok?VC.grn:VC.bord}"/>${vtxt(X(st.x),32,String(+st.x.toFixed(3)).replace('.',','),{c:ok?VC.grn:VC.bord,s:13})}`,'Sayı doğrusu')+
   `<div class="vis-stat ${ok?'ok':''}">${p.label?esc(p.label)+' · ':''}Seçtiğin: <b>${String(+st.x.toFixed(3)).replace('.',',')}</b>${ok?` · ${ic('okc',14)} Doğru yer!`:''}</div><div class="vis-tools">${vbtn(key,'l','◀ '+String(s).replace('.',','))}${vbtn(key,'r',String(s).replace('.',',')+' ▶')}<span class="meta">Çizgiye dokun ya da okları kullan.</span></div>`};

/* ---------- 4) SÜTUN GRAFİK ---------- */
VIS.bars=(p,key,st)=>{const L=p.labels||[],V=st.vals;const mx=Math.max(1,...V)*1.15;const n=L.length,W=340,H=170,bw=Math.min(46,(W-40)/n-12);
  const bars=L.map((l,i)=>{const x=34+i*((W-44)/n)+((W-44)/n-bw)/2;const h=(V[i]||0)/mx*(H-40);return `<rect x="${x}" y="${H-20-h}" width="${bw}" height="${h}" rx="5" fill="${PAL[i%PAL.length]}"/>${vtxt(x+bw/2,H-26-h,V[i],{s:11})}${vtxt(x+bw/2,H-4,l.length>9?l.slice(0,8)+'…':l,{s:10,w:600})}`}).join('');
  return vsvg(W,H,`<line x1="30" y1="${H-20}" x2="${W-6}" y2="${H-20}" stroke="${VC.ink}"/><line x1="30" y1="10" x2="30" y2="${H-20}" stroke="${VC.ink}"/>${bars}`,p.title||'Sütun grafik')+
   `<div class="vis-stat">${esc(p.title||'')}${p.unit?` (${esc(p.unit)})`:''}</div>${p.editable?`<div class="vis-tools wrap">${L.map((l,i)=>`<span class="bar-ed"><b>${esc(l)}</b>${vbtn(key,'adj','−',i+':-1','round')}${vbtn(key,'adj','+',i+':1','round')}</span>`).join('')}</div>`:''}`};

/* ---------- 5) DAİRE GRAFİK ---------- */
VIS.pie=(p)=>{const L=p.labels||[],V=(p.values||[]).map(fracVal);const T=V.reduce((a,b)=>a+b,0)||1;let a=-Math.PI/2,s='';
  V.forEach((v,i)=>{const a1=a+v/T*2*Math.PI;const lg=a1-a>Math.PI?1:0;s+=`<path d="M110 100L${110+80*Math.cos(a)} ${100+80*Math.sin(a)}A80 80 0 ${lg} 1 ${110+80*Math.cos(a1)} ${100+80*Math.sin(a1)}Z" fill="${PAL[i%PAL.length]}" stroke="#fff" stroke-width="2"/>`;a=a1});
  return vsvg(360,200,s+L.map((l,i)=>`<rect x="215" y="${30+i*24}" width="14" height="14" rx="3" fill="${PAL[i%PAL.length]}"/>${vtxt(236,42+i*24,`${l} — ${p.values[i]}`,{a:'start',s:12,w:600})}`).join(''),'Daire grafik')};

/* ---------- 6) TERAZİ (denklem) ---------- */
// Güvenli aritmetik değerlendirici (eval/Function kullanmaz): sayılar, x, + − × ÷, parantez.
const evalX=(e,x)=>{const s=String(e).replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/[□?_]/g,'x').replace(/,/g,'.').replace(/\s+/g,'');let i=0;
  const num=()=>{const m=/^\d+(\.\d+)?/.exec(s.slice(i));if(!m)return NaN;i+=m[0].length;return +m[0]};
  const fac=()=>{const c=s[i];if(c==='-'){i++;return -fac()}if(c==='+'){i++;return fac()}if(c==='('){i++;const v=add();if(s[i]!==')')return NaN;i++;return mulImp(v)}if(c==='x'){i++;return mulImp(x)}const v=num();return Number.isNaN(v)?NaN:mulImp(v)};
  const mulImp=v=>(s[i]==='x'||s[i]==='(')?v*fac():v;
  const mul=()=>{let v=fac();while(s[i]==='*'||s[i]==='/'){const o=s[i++];const r=fac();v=o==='*'?v*r:v/r}return v};
  const add=()=>{let v=mul();while(s[i]==='+'||s[i]==='-'){const o=s[i++];const r=mul();v=o==='+'?v+r:v-r}return v};
  try{const v=add();return i===s.length?v:NaN}catch(_){return NaN}};
VIS.balance=(p,key,st)=>{const L=evalX(p.left||'x',st.x),R=evalX(p.right||'0',st.x);const d=isNaN(L-R)?0:Math.max(-1,Math.min(1,(R-L)/Math.max(4,Math.abs(L)+Math.abs(R))*3));const ang=d*14;const eq=Math.abs(L-R)<1e-9;
  return vsvg(360,190,`<path d="M170 170h20l-10-110z" fill="#C9B79C"/><rect x="120" y="170" width="120" height="10" rx="4" fill="#8A7B6B"/><g transform="rotate(${ang} 180 60)"><rect x="50" y="56" width="260" height="8" rx="4" fill="#6B5B4B"/><path d="M60 64l-20 50h80l-20-50" fill="none" stroke="#8A7B6B" stroke-width="2"/><path d="M300 64l-20 50h80l-20-50" fill="none" stroke="#8A7B6B" stroke-width="2"/><rect x="30" y="112" width="100" height="10" rx="4" fill="#E9DCC6"/><rect x="250" y="112" width="100" height="10" rx="4" fill="#E9DCC6"/>${vtxt(80,104,p.left,{s:15,c:VC.blu})}${vtxt(300,104,p.right,{s:15,c:VC.red})}${vtxt(80,140,'= '+(isNaN(L)?'?':+L.toFixed(2)),{s:12,c:VC.mut})}${vtxt(300,140,'= '+(isNaN(R)?'?':+R.toFixed(2)),{s:12,c:VC.mut})}</g>`,'Eşit kollu terazi')+
   `<div class="vis-stat ${eq?'ok':''}">x = <b>${st.x}</b> ${eq?` · ${ic('okc',14)} Terazi dengede! Eşitlik sağlandı.`:L>R?' · Sol taraf ağır':' · Sağ taraf ağır'}</div><div class="vis-tools">${vbtn(key,'x','− 1',-1)}${vbtn(key,'x','+ 1',1)}<span class="meta">x'in değerini değiştir, teraziyi dengele.</span></div>`};

/* ---------- 7) ALAN MODELİ / YÜZDELİK IZGARA ---------- */
VIS.areagrid=(p,key,st)=>{const r=p.rows||10,c=p.cols||10,cs=Math.min(18,300/c);let s='';let k=0;
  for(let i=0;i<r;i++)for(let j=0;j<c;j++){const id=i*c+j;const on=st.on[id];if(on)k++;s+=`<rect x="${10+j*cs}" y="${10+i*cs}" width="${cs-2}" height="${cs-2}" rx="2" fill="${on?VC.blu:'#EFE6D8'}" class="vclick" data-act="vis" data-k="${key}" data-op="cell" data-v="${id}"/>`}
  const tot=r*c;const ok=p.shade!=null&&k===p.shade;
  return vsvg(20+c*cs,20+r*cs,s,'Alan modeli')+`<div class="vis-stat ${ok?'ok':''}">Boyalı: <b>${k}/${tot}</b>${tot===100?` = <b>%${k}</b>`:''} = <b>${String(+(k/tot).toFixed(3)).replace('.',',')}</b>${p.label?` · Hedef: ${esc(p.label)}`:''}${ok?` · ${ic('okc',14)} Tam isabet!`:''}</div><div class="vis-tools">${vbtn(key,'clear','Temizle')}<span class="meta">Karelere dokunarak boya.</span></div>`};

/* ---------- 8) GEOMETRİ ---------- */
VIS.shapes=(p,key,st)=>{const k=p.kind||'ucgen';let s='',info='',tools='';
  if(k==='ucgen'){const a=st.a,b=70,c=180-a-b;s=`<path d="M60 170L300 170L${60+120+(a-60)*1.2} 40Z" fill="#FCE7C8" stroke="${VC.ink}" stroke-width="2"/>${vtxt(82,162,a+'°',{c:VC.red})}${vtxt(278,162,b+'°',{c:VC.blu})}${vtxt(60+120+(a-60)*1.2,62,c+'°',{c:VC.grn})}`;info=`İç açılar toplamı: ${a} + ${b} + ${c} = <b>180°</b>`;tools=`<label class="vrange">Sol açı <input type="range" min="30" max="95" value="${a}" data-vis-in="a" data-k="${key}"></label>`}
  else if(k==='dortgen'){s=`<path d="M60 160L280 160L310 50L90 50Z" fill="#DCEBFF" stroke="${VC.ink}" stroke-width="2"/><path d="M60 160L310 50M280 160L90 50" stroke="${VC.mut}" stroke-dasharray="4 3"/>`+vtxt(185,190,'Paralelkenar: karşılıklı kenarlar paralel ve eşit',{s:11});info='Köşegenleri çiz, birbirini ortaladığını gözle.'}
  else if(k==='paralel-kesen'){s=`<line x1="20" y1="60" x2="340" y2="60" stroke="${VC.ink}" stroke-width="2"/><line x1="20" y1="150" x2="340" y2="150" stroke="${VC.ink}" stroke-width="2"/><line x1="120" y1="190" x2="250" y2="20" stroke="${VC.bord}" stroke-width="2.5"/><path d="M219 60a14 14 0 0 1-8-12" fill="none" stroke="${VC.red}" stroke-width="3"/><path d="M150 150a14 14 0 0 1-8-12" fill="none" stroke="${VC.red}" stroke-width="3"/>`+vtxt(232,50,'a',{c:VC.red})+vtxt(162,140,'a',{c:VC.red})+vtxt(330,52,'d₁',{s:11})+vtxt(330,142,'d₂',{s:11});info='Yöndeş açılar eşittir: kırmızı açıları karşılaştır.'}
  else if(k==='cokgen'){const n=5,R=75;const pts=[...Array(n)].map((_,i)=>[180+R*Math.cos(i/n*2*Math.PI-Math.PI/2),105+R*Math.sin(i/n*2*Math.PI-Math.PI/2)]);s=`<polygon points="${pts.map(q=>q.join(',')).join(' ')}" fill="#E7F6EE" stroke="${VC.ink}" stroke-width="2"/>${pts.slice(2,4).map(q=>`<line x1="${pts[0][0]}" y1="${pts[0][1]}" x2="${q[0]}" y2="${q[1]}" stroke="${VC.grn}" stroke-width="2" stroke-dasharray="5 3"/>`).join('')}`;info='Bir köşeden çizilen köşegenler beşgeni <b>3 üçgene</b> ayırır: 3 × 180° = 540°'}
  else if(k==='daire'){s=`<circle cx="180" cy="100" r="75" fill="#FFF0CF" stroke="${VC.ink}" stroke-width="2"/><line x1="180" y1="100" x2="255" y2="100" stroke="${VC.red}" stroke-width="3"/><line x1="105" y1="100" x2="180" y2="100" stroke="${VC.blu}" stroke-width="3" stroke-dasharray="5 3"/><circle cx="180" cy="100" r="4"/>`+vtxt(218,92,'r',{c:VC.red})+vtxt(140,92,'r',{c:VC.blu});info='Çap = 2 × yarıçap · Çevre ≈ 3 × çap'}
  else {const f=st.flip;s=`<line x1="180" y1="10" x2="180" y2="190" stroke="${VC.bord}" stroke-width="2" stroke-dasharray="6 4"/><path d="M170 40L100 60L120 150L170 120Z" fill="#DCEBFF" stroke="${VC.ink}" stroke-width="2"/>${f?`<path d="M190 40L260 60L240 150L190 120Z" fill="#FCE7C8" stroke="${VC.ink}" stroke-width="2" style="animation:zin .4s"/>`:''}`;info=f?'Yansıma: şekil simetri doğrusuna eşit uzaklıkta.':'Simetri doğrusuna göre yansımasını tahmin et.';tools=vbtn(key,'flip',f?'Gizle':'Yansıt')}
  return vsvg(360,200,s,'Geometrik şekil')+`<div class="vis-stat">${info}</div>${tools?`<div class="vis-tools">${tools}</div>`:''}`};

/* ---------- 9) BİRİM KÜPLER ---------- */
VIS.cubes=(p,key,st)=>{const{l,w,h}=st;const S=18;let s='';const iso=(x,y,z)=>[170+(x-y)*S*0.87,150+(x+y)*S*0.5-z*S];
  for(let z=0;z<h;z++)for(let y=w-1;y>=0;y--)for(let x=l-1;x>=0;x--){const[a,b]=iso(x,y,z);s+=`<g><path d="M${a} ${b}l${S*.87} ${S*.5}l${-S*.87} ${S*.5}l${-S*.87} ${-S*.5}z" fill="#9BD3F5" stroke="#3D6E99"/><path d="M${a-S*.87} ${b+S*.5}l${S*.87} ${S*.5}v${S}l${-S*.87} ${-S*.5}z" fill="#5BA7DB" stroke="#3D6E99"/><path d="M${a} ${b+S}l${S*.87} ${-S*.5}v${S}l${-S*.87} ${S*.5}z" fill="#7DBCE6" stroke="#3D6E99"/></g>`}
  return vsvg(360,230,`<g transform="translate(0 ${-20+h*4})">${s}</g>`,'Birim küplerle prizma')+`<div class="vis-stat">${l} × ${w} × ${h} = <b>${l*w*h}</b> birim küp</div><div class="vis-tools wrap">${['l','w','h'].map((k,i)=>`<label class="vrange">${['Uzunluk','Genişlik','Yükseklik'][i]} <input type="range" min="1" max="6" value="${st[k]}" data-vis-in="${k}" data-k="${key}"> <b>${st[k]}</b></label>`).join('')}</div>`};

/* ---------- 10) KOORDİNAT ---------- */
VIS.coord=(p,key,st)=>{const U=14,cx=180,cy=105;const X=x=>cx+x*U,Y=y=>cy-y*U;let s='';
  for(let i=-12;i<=12;i++)s+=`<line x1="${X(i)}" y1="10" x2="${X(i)}" y2="200" stroke="#EFE6D8"/>`;for(let i=-6;i<=6;i++)s+=`<line x1="10" y1="${Y(i)}" x2="350" y2="${Y(i)}" stroke="#EFE6D8"/>`;
  s+=`<line x1="10" y1="${cy}" x2="350" y2="${cy}" stroke="${VC.ink}"/><line x1="${cx}" y1="10" x2="${cx}" y2="200" stroke="${VC.ink}"/>`;
  if(p.line)s+=`<line x1="${X(-12)}" y1="${Y(st.m*-12+st.b)}" x2="${X(12)}" y2="${Y(st.m*12+st.b)}" stroke="${VC.bord}" stroke-width="2.5"/>`;
  (p.points||[]).forEach(([x,y],i)=>s+=`<circle cx="${X(x)}" cy="${Y(y)}" r="5" fill="${PAL[i%8]}"/>${vtxt(X(x)+14,Y(y)-6,`(${x},${y})`,{s:10})}`);
  return vsvg(360,210,s,'Koordinat sistemi')+(p.line?`<div class="vis-stat">y = <b>${st.m}</b>x ${st.b>=0?'+':'−'} <b>${Math.abs(st.b)}</b></div><div class="vis-tools wrap"><label class="vrange">Eğim <input type="range" min="-3" max="3" step="0.5" value="${st.m}" data-vis-in="m" data-k="${key}"></label><label class="vrange">Sabit <input type="range" min="-5" max="5" value="${st.b}" data-vis-in="b" data-k="${key}"></label></div>`:'')};

/* ---------- 11) ZAR / ÇARK / TORBA ---------- */
VIS.dice=(p,key,st)=>{const kind=p.kind||'zar';const items=kind==='zar'?['1','2','3','4','5','6']:(p.items||['A','B']);const counts=kind==='zar'?[1,1,1,1,1,1]:(p.counts||items.map(()=>1));const T=counts.reduce((a,b)=>a+b,0);
  const tally=items.map((_,i)=>st.rolls.filter(r=>(kind==='zar'?r-1:r)===i).length);const n=st.rolls.length;let pic='';
  if(kind==='zar'){const v=st.last||1;const dots={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]}[v];pic=`<rect x="40" y="40" width="80" height="80" rx="16" fill="#fff" stroke="${VC.ink}" stroke-width="3"/>${dots.map(([a,b])=>`<circle cx="${80+a*22}" cy="${80+b*22}" r="7" fill="${VC.ink}"/>`).join('')}`}
  else if(kind==='cark'){let a=-Math.PI/2;pic=counts.map((c,i)=>{const a1=a+c/T*2*Math.PI;const d=`M80 80L${80+60*Math.cos(a)} ${80+60*Math.sin(a)}A60 60 0 ${a1-a>Math.PI?1:0} 1 ${80+60*Math.cos(a1)} ${80+60*Math.sin(a1)}Z`;a=a1;return `<path d="${d}" fill="${PAL[i%8]}" stroke="#fff" stroke-width="2"/>`}).join('')+`<path d="M80 12l8 16h-16z" fill="${VC.ink}"/>`}
  else{pic=`<path d="M30 60c0-20 100-20 100 0v70c0 20-100 20-100 0z" fill="#E9D3B0" stroke="#8A6B42" stroke-width="2"/>`+counts.flatMap((c,i)=>Array(c).fill(i)).slice(0,24).map((i,k)=>`<circle cx="${45+(k%6)*14}" cy="${80+Math.floor(k/6)*14}" r="6" fill="${PAL[i%8]}"/>`).join('')}
  const bars=items.map((it,i)=>`<div class="tal"><span>${esc(it)}</span><i style="width:${n?tally[i]/n*100:0}%;background:${PAL[i%8]}"></i><b>${tally[i]}</b><small>${n?'deney: '+(tally[i]/n).toFixed(2).replace('.',','):''} · teorik: ${simp(counts[i],T)}</small></div>`).join('');
  return `<div class="dice-row">${vsvg(160,160,pic,'Olasılık aracı')}<div class="tally">${bars}</div></div><div class="vis-stat">Deneme sayısı: <b>${n}</b>${st.last!=null?` · Son sonuç: <b>${esc(items[kind==='zar'?st.last-1:st.last])}</b>`:''}</div><div class="vis-tools">${vbtn(key,'roll',kind==='zar'?'Zar at':kind==='cark'?'Çevir':'Çek',1,'pri')}${vbtn(key,'roll','10 kez',10)}${vbtn(key,'roll','100 kez',100)}${vbtn(key,'reset','Sıfırla')}</div>`};

/* ---------- 12) GÜNEŞ–DÜNYA–AY ---------- */
VIS.solar=(p,key,st)=>{const m=p.mode||'ay-evreleri';const k=st.pos;let s='',info='';
  if(m==='ay-evreleri'){const ph=['Yeni Ay','Hilal','İlk Dördün','Şişkin Ay','Dolunay','Şişkin Ay','Son Dördün','Hilal'];const a=k/8*2*Math.PI;const mx=150+70*Math.cos(a),my=105-70*Math.sin(a);
    s=`<rect width="360" height="210" fill="#141225"/><g>${[...Array(5)].map((_,i)=>`<path d="M10 ${40+i*30}h30" stroke="#FFD84D" stroke-width="3"/>`).join('')}</g>${vtxt(26,25,'Güneş ışığı',{s:10,c:'#FFD84D'})}<circle cx="150" cy="105" r="70" fill="none" stroke="#4B4870" stroke-dasharray="4 4"/><circle cx="150" cy="105" r="20" fill="#3E9BFF"/><circle cx="${mx}" cy="${my}" r="10" fill="#ddd"/><path d="M${mx} ${my-10}a10 10 0 0 0 0 20z" fill="#333"/>
     <circle cx="300" cy="105" r="36" fill="#333"/>${moonPhase(300,105,36,k)}${vtxt(300,165,ph[k],{c:'#fff',s:12})}${vtxt(300,182,'Dünya’dan görünüş',{c:'#aaa',s:10})}`;info=`${k+1}/8 konum · Ay, Dünya etrafında yaklaşık 29,5 günde döner.`}
  else if(m==='tutulma'){const sun=k%2===0;s=`<rect width="360" height="210" fill="#141225"/><circle cx="40" cy="105" r="30" fill="#FFC531"/>${sun?`<circle cx="190" cy="105" r="9" fill="#bbb"/><circle cx="300" cy="105" r="24" fill="#3E9BFF"/><path d="M190 96L300 92L300 118L190 114Z" fill="#000" opacity=".5"/>`:`<circle cx="190" cy="105" r="24" fill="#3E9BFF"/><circle cx="300" cy="105" r="9" fill="#7A3B2E"/><path d="M190 81L330 98L330 112L190 129Z" fill="#000" opacity=".45"/>`}${vtxt(40,155,'Güneş',{c:'#fff',s:11})}${vtxt(190,155,sun?'Ay':'Dünya',{c:'#fff',s:11})}${vtxt(300,155,sun?'Dünya':'Ay',{c:'#fff',s:11})}`;info=sun?'<b>Güneş tutulması:</b> Ay, Güneş ile Dünya arasına girer; gölgesi Dünya’ya düşer.':'<b>Ay tutulması:</b> Dünya, Güneş ile Ay arasına girer; Ay, Dünya’nın gölgesinde kalır.'}
  else if(m==='mevsimler'){const nm=['21 Haziran — Yaz (K.Y.)','23 Eylül — Sonbahar','21 Aralık — Kış (K.Y.)','21 Mart — İlkbahar'];const q=Math.floor(k/2)%4;const a=q/4*2*Math.PI;const ex=180+120*Math.cos(a),ey=105+60*Math.sin(a);
    s=`<rect width="360" height="210" fill="#141225"/><ellipse cx="180" cy="105" rx="120" ry="60" fill="none" stroke="#4B4870" stroke-dasharray="4 4"/><circle cx="180" cy="105" r="22" fill="#FFC531"/><g transform="translate(${ex} ${ey}) rotate(-23.5)"><circle r="16" fill="#3E9BFF"/><line y1="-24" y2="24" stroke="#fff" stroke-width="1.5"/></g>`+vtxt(180,200,nm[q],{c:'#fff',s:12});info='Dünya’nın ekseni 23,5° eğik olduğu için ışınların geliş açısı yıl boyunca değişir.'}
  else{s=`<rect width="360" height="210" fill="#141225"/><circle cx="180" cy="105" r="16" fill="#FFC531"/>`+['#B8B2A6','#E8C28A','#3E9BFF','#D9643A','#D9B38C','#E8D39A','#8FD3E8','#4B6CD8'].map((c,i)=>{const r=26+i*11,a=(k+i*1.7)/8*2*Math.PI;return `<ellipse cx="180" cy="105" rx="${r*1.7}" ry="${r*.75}" fill="none" stroke="#2C2950"/><circle cx="${180+r*1.7*Math.cos(a)}" cy="${105+r*.75*Math.sin(a)}" r="${[3,4,4.5,3.5,8,7,5.5,5.5][i]}" fill="${c}"/>`}).join('');info='Gezegenler Güneş etrafında farklı yörüngelerde dolanır.'}
  return vsvg(360,210,s,'Güneş, Dünya ve Ay modeli')+`<div class="vis-stat">${info}</div><div class="vis-tools">${vbtn(key,'prev','◀')}${vbtn(key,'next','İlerlet ▶','','pri')}</div>`};
function moonPhase(cx,cy,r,k){const f=[0,.25,.5,.75,1,.75,.5,.25][k];const right=k<=4;if(f===0)return '';if(f===1)return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#EEE"/>`;const rx=Math.abs(1-2*f)*r;const sweepA=right?1:0;const bulge=f>.5;
  return `<path d="M${cx} ${cy-r}A${r} ${r} 0 0 ${sweepA} ${cx} ${cy+r}A${rx} ${r} 0 0 ${bulge?sweepA:1-sweepA} ${cx} ${cy-r}z" fill="#EEE"/>`}

/* ---------- 13) ELEKTRİK DEVRESİ ---------- */
VIS.circuit=(p,key,st)=>{const mats=[['bakır tel',true],['demir çivi',true],['tahta çubuk',false],['plastik cetvel',false]];const useM=!!p.material;const cond=useM?mats[st.mat][1]:true;const on=st.on&&cond;const b2=p.bulbs===2;
  const bulb=(x,y)=>`<circle cx="${x}" cy="${y}" r="16" fill="${on?'#FFE680':'#EEE'}" stroke="${VC.ink}" stroke-width="2"/>${on?`<circle cx="${x}" cy="${y}" r="26" fill="#FFE680" opacity="${b2&&p.series!==false?.25:.45}"/>`:''}<path d="M${x-6} ${y+4}l3-8 3 8 3-8 3 8" fill="none" stroke="${VC.ink}"/>`;
  let s=`<path d="M60 50H300V160H60Z" fill="none" stroke="${VC.ink}" stroke-width="3"/><rect x="40" y="85" width="40" height="40" fill="#fff"/><rect x="48" y="92" width="24" height="30" rx="3" fill="#F2B640" stroke="${VC.ink}" stroke-width="2"/>${vtxt(60,140,'pil',{s:10})}`;
  s+=b2&&p.series===false?`<path d="M180 50v-0M140 50v110M220 50v110" stroke="${VC.ink}" stroke-width="3"/>${bulb(140,105)}${bulb(220,105)}`:b2?bulb(150,50)+bulb(220,50):bulb(180,50);
  s+=`<g class="vclick" data-act="vis" data-k="${key}" data-op="sw"><rect x="150" y="140" width="60" height="40" fill="#fff"/><circle cx="160" cy="160" r="4"/><circle cx="200" cy="160" r="4"/><line x1="160" y1="160" x2="${st.on?200:194}" y2="${st.on?160:140}" stroke="${VC.bord}" stroke-width="4" stroke-linecap="round"/></g>${vtxt(180,195,'anahtar (dokun)',{s:10})}`;
  if(useM)s+=`<rect x="250" y="140" width="60" height="16" rx="4" fill="${['#C46E2B','#888','#B5865B','#5BA7DB'][st.mat]}"/>${vtxt(280,180,mats[st.mat][0],{s:10})}`;
  return vsvg(360,205,s,'Basit elektrik devresi')+`<div class="vis-stat ${on?'ok':''}">${on?`${ic('okc',14)} Devre kapalı: elektrik akımı var, ${b2?'ampuller':'ampul'} yanıyor.`:st.on&&!cond?'Anahtar kapalı ama seçilen malzeme elektriği iletmiyor: ampul yanmaz.':'Devre açık: akım yok, ampul yanmaz.'}</div><div class="vis-tools wrap">${vbtn(key,'sw',st.on?'Anahtarı aç':'Anahtarı kapat','','pri')}${useM?mats.map((m,i)=>vbtn(key,'mat',m[0],i,st.mat===i?'on':'')).join(''):''}</div>`};

/* ---------- 14) IŞIK ---------- */
VIS.light=(p,key,st)=>{const m=p.mode||'yansima';const a=st.a;const r=Math.PI/180;let s='',info='';
  if(m==='yansima'){const L=110;s=`<rect x="40" y="160" width="280" height="10" fill="#9BC7E8"/><line x1="180" y1="30" x2="180" y2="160" stroke="${VC.mut}" stroke-dasharray="5 4"/><line x1="${180-L*Math.sin(a*r)}" y1="${160-L*Math.cos(a*r)}" x2="180" y2="160" stroke="#E8A900" stroke-width="3"/><line x1="180" y1="160" x2="${180+L*Math.sin(a*r)}" y2="${160-L*Math.cos(a*r)}" stroke="#E8A900" stroke-width="3" stroke-dasharray="7 4"/>`+vtxt(150,140,a+'°',{c:VC.red})+vtxt(210,140,a+'°',{c:VC.red})+vtxt(180,24,'normal',{s:10,c:VC.mut})+vtxt(280,185,'düz ayna',{s:10});info='Gelme açısı = yansıma açısı';}
  else if(m==='kirilma'){const b=Math.round(Math.asin(Math.sin(a*r)/1.33)/r);s=`<rect x="0" y="105" width="360" height="105" fill="#BFE3FF"/><line x1="180" y1="10" x2="180" y2="200" stroke="${VC.mut}" stroke-dasharray="5 4"/><line x1="${180-95*Math.sin(a*r)}" y1="${105-95*Math.cos(a*r)}" x2="180" y2="105" stroke="#E8A900" stroke-width="3"/><line x1="180" y1="105" x2="${180+95*Math.sin(b*r)}" y2="${105+95*Math.cos(b*r)}" stroke="#E8A900" stroke-width="3"/>`+vtxt(30,95,'hava',{s:11,a:'start'})+vtxt(30,125,'su',{s:11,a:'start'})+vtxt(155,80,a+'°',{c:VC.red})+vtxt(200,140,b+'°',{c:VC.blu});info='Işık havadan suya geçerken normale yaklaşarak kırılır.'}
  else if(m==='ince-kenarli'||m==='kalin-kenarli'){const conv=m==='ince-kenarli';s=`<path d="${conv?'M180 30c22 25 22 125 0 150c-22-25-22-125 0-150z':'M168 30h24c-12 25-12 125 0 150h-24c12-25 12-125 0-150z'}" fill="#CDE8FF" stroke="#3D6E99" stroke-width="2"/>${[60,90,120,150].map(y=>`<line x1="20" y1="${y}" x2="180" y2="${y}" stroke="#E8A900" stroke-width="2.5"/><line x1="180" y1="${y}" x2="340" y2="${conv?105+(105-y)*-0.0+((105-y)*-1.2):y+(y-105)*1.2}" stroke="#E8A900" stroke-width="2.5"/>`).join('')}${conv?`<circle cx="280" cy="105" r="4" fill="${VC.red}"/>`+vtxt(280,95,'odak',{s:10,c:VC.red}):''}`;info=conv?'İnce kenarlı mercek ışınları toplar (yakınsak).':'Kalın kenarlı mercek ışınları dağıtır (ıraksak).'}
  else{s=`<rect width="360" height="210" fill="#141225"/><line x1="20" y1="105" x2="150" y2="100" stroke="#fff" stroke-width="5"/><path d="M150 50L200 150H100Z" fill="#CDE8FF" opacity=".7"/>${['#FF3B30','#FF9500','#FFCC00','#34C759','#007AFF','#5856D6','#AF52DE'].map((c,i)=>`<line x1="170" y1="105" x2="340" y2="${60+i*15}" stroke="${c}" stroke-width="4"/>`).join('')}`;info='Beyaz ışık prizmadan geçince renklerine ayrılır.'}
  return vsvg(360,210,s,'Işık modeli')+`<div class="vis-stat">${info}</div>${['yansima','kirilma'].includes(m)?`<div class="vis-tools"><label class="vrange">Gelme açısı <input type="range" min="10" max="70" value="${a}" data-vis-in="a" data-k="${key}"> <b>${a}°</b></label></div>`:''}`};

/* ---------- 15) KUVVET ---------- */
VIS.force=(p,key,st)=>{const F=p.forces||[{dir:'sag',n:10}];let net=0;F.forEach((f,i)=>net+=(f.dir==='sol'?-1:1)*st.f[i]);
  const arr=(x,y,len,col,dirL,lbl)=>`<line x1="${x}" y1="${y}" x2="${x+(dirL?-len:len)}" y2="${y}" stroke="${col}" stroke-width="5"/><path d="M${x+(dirL?-len:len)} ${y-8}l${dirL?-12:12} 8l${dirL?12:-12} 8z" fill="${col}"/>${vtxt(x+(dirL?-len/2:len/2),y-10,lbl,{s:11,c:col})}`;
  const obj=p.obj==='araba'?`<rect x="150" y="90" width="60" height="30" rx="6" fill="${VC.red}"/><circle cx="162" cy="124" r="7"/><circle cx="198" cy="124" r="7"/>`:`<rect x="150" y="80" width="60" height="50" rx="4" fill="#D9B38C" stroke="#8A6B42" stroke-width="2"/>`;
  let s=`<rect x="0" y="130" width="360" height="8" fill="#BCA98E"/>${obj}`;F.forEach((f,i)=>{s+=arr(f.dir==='sol'?150:210,95+i*14,st.f[i]*5,PAL[i],f.dir==='sol',st.f[i]+' N')});
  s+=net?arr(180,170,Math.abs(net)*5,VC.ink,net<0,'Bileşke '+Math.abs(net)+' N'):vtxt(180,175,'Bileşke kuvvet 0: dengelenmiş kuvvetler',{s:12,c:VC.grn});
  return vsvg(360,200,s,'Kuvvet diyagramı')+`<div class="vis-stat">${net?`Cisim <b>${net>0?'sağa':'sola'}</b> doğru hareket eder (bileşke ${Math.abs(net)} N).`:'Cisim durur ya da hareketini sabit hızla sürdürür.'}</div><div class="vis-tools wrap">${F.map((f,i)=>`<label class="vrange">${f.dir==='sol'?'Sola':'Sağa'} kuvvet <input type="range" min="0" max="20" value="${st.f[i]}" data-vis-in="f${i}" data-k="${key}"> <b>${st.f[i]} N</b></label>`).join('')}</div>`};

/* ---------- 16) BASİT MAKİNE ---------- */
VIS.lever=(p,key,st)=>{const k=p.kind||'kaldirac';let s='',info='',tools='';
  if(k==='kaldirac'){const f=st.f;const fx=40+f*2.8;const load=100,dL=fx-60,dE=300-fx;const need=dE>0?Math.round(load*dL/dE):'∞';s=`<rect x="40" y="110" width="280" height="8" rx="3" fill="#8A6B42"/><path d="M${fx} 118l-14 30h28z" fill="${VC.bord}"/><rect x="45" y="78" width="30" height="32" fill="#7FB3E8"/>${vtxt(60,98,'100',{s:11})}<path d="M300 70v38" stroke="${VC.red}" stroke-width="4"/><path d="M292 96l8 12 8-12" fill="${VC.red}"/>${vtxt(300,62,need+' N',{c:VC.red})}`;info=`Destek noktası yüke yaklaştıkça uygulanan kuvvet azalır. Gereken kuvvet ≈ <b>${need} N</b>`;tools=`<label class="vrange">Destek noktası <input type="range" min="10" max="90" value="${f}" data-vis-in="f" data-k="${key}"></label>`}
  else if(k==='makara'){const mv=st.mov;s=`<line x1="40" y1="20" x2="320" y2="20" stroke="${VC.ink}" stroke-width="4"/><circle cx="180" cy="${mv?120:50}" r="20" fill="#ddd" stroke="${VC.ink}" stroke-width="2"/>${mv?`<line x1="160" y1="20" x2="160" y2="120"/><line x1="200" y1="20" x2="200" y2="120" stroke="${VC.ink}"/><line x1="160" y1="20" x2="160" y2="120" stroke="${VC.ink}"/><rect x="165" y="145" width="30" height="30" fill="#7FB3E8"/>`:`<line x1="180" y1="20" x2="180" y2="30" stroke="${VC.ink}"/><line x1="160" y1="50" x2="160" y2="160" stroke="${VC.ink}"/><line x1="200" y1="50" x2="200" y2="130" stroke="${VC.ink}"/><rect x="145" y="160" width="30" height="30" fill="#7FB3E8"/>`}`;info=mv?'Hareketli makara: kuvvetten kazanç sağlar (yaklaşık yarısı kadar kuvvet).':'Sabit makara: kuvvetin yönünü değiştirir, kazanç sağlamaz.';tools=vbtn(key,'mov',mv?'Sabit makaraya geç':'Hareketli makaraya geç')}
  else{const an=st.ang;const h=Math.tan(an*Math.PI/180)*240;s=`<path d="M60 180H300V${180-h}Z" fill="#E9D3B0" stroke="#8A6B42" stroke-width="2"/>`;info=`Eğim azaldıkça yolu uzar ama gereken kuvvet azalır: ≈ <b>${Math.round(100*Math.sin(an*Math.PI/180))} N</b> (100 N yük)`;tools=`<label class="vrange">Eğim <input type="range" min="10" max="40" value="${an}" data-vis-in="ang" data-k="${key}"> <b>${an}°</b></label>`}
  return vsvg(360,200,s,'Basit makine')+`<div class="vis-stat">${info}</div><div class="vis-tools">${tools}</div>`};

/* ---------- 17) ATOM ---------- */
const ELEM={H:[1,0,'Hidrojen'],He:[2,2,'Helyum'],C:[6,6,'Karbon'],N:[7,7,'Azot'],O:[8,8,'Oksijen'],Na:[11,12,'Sodyum'],Mg:[12,12,'Magnezyum'],Cl:[17,18,'Klor']};
VIS.atom=(p)=>{const[z,n,nm]=ELEM[p.element]||ELEM.C;const sh=[];let r=z;[2,8,8].forEach(c=>{if(r>0){sh.push(Math.min(c,r));r-=c}});
  let s=`<circle cx="180" cy="105" r="18" fill="${VC.red}"/>${vtxt(180,109,`${z}p ${n}n`,{s:10,c:'#fff'})}`;sh.forEach((c,i)=>{const R=38+i*28;s+=`<circle cx="180" cy="105" r="${R}" fill="none" stroke="#7FB3E8" stroke-width="1.5"/>`;for(let e=0;e<c;e++){const a=e/c*2*Math.PI;s+=`<circle cx="${180+R*Math.cos(a)}" cy="${105+R*Math.sin(a)}" r="5" fill="${VC.blu}"/>`}});
  return vsvg(360,210,s,'Atom modeli')+`<div class="vis-stat"><b>${nm} (${p.element})</b> · ${z} proton, ${n} nötron, ${z} elektron · katmanlar: ${sh.join(' – ')}</div>`};

/* ---------- 18) SES DALGASI ---------- */
VIS.wave=(p,key,st)=>{let d='M10 100';for(let x=10;x<=350;x+=3)d+=`L${x} ${100-st.am*Math.sin((x-10)/340*st.fr*2*Math.PI)}`;
  return vsvg(360,200,`<line x1="10" y1="100" x2="350" y2="100" stroke="#E6DACA"/><path d="${d}" fill="none" stroke="${VC.pur}" stroke-width="3"/>`,'Ses dalgası')+`<div class="vis-stat">Frekans arttıkça ses <b>${st.fr>4?'incelir (tiz)':'kalınlaşır (pes)'}</b> · Genlik arttıkça ses <b>${st.am>35?'şiddetlenir':'hafifler'}</b></div><div class="vis-tools wrap"><label class="vrange">Frekans <input type="range" min="1" max="8" value="${st.fr}" data-vis-in="fr" data-k="${key}"></label><label class="vrange">Genlik <input type="range" min="8" max="60" value="${st.am}" data-vis-in="am" data-k="${key}"></label></div>`};

/* ---------- 19) ISI İLETİMİ ---------- */
VIS.heat=(p,key,st)=>{const M=p.materials||['metal','tahta','plastik'];const sp={metal:1.6,'bakır':1.8,'alüminyum':1.5,tahta:.35,plastik:.25,cam:.5,'yün':.15,'su':.6};
  const s=M.map((m,i)=>{const y=40+i*50;const prog=Math.min(1,st.t/100*(sp[m]||.5));const w=prog*240;return `<rect x="70" y="${y}" width="240" height="20" rx="6" fill="#EFE6D8"/><rect x="70" y="${y}" width="${w}" height="20" rx="6" fill="url(#hg)"/>${vtxt(60,y+14,m,{a:'end',s:12})}${prog>=1?vtxt(330,y+14,'🔥',{s:13}):''}`}).join('');
  return vsvg(360,40+M.length*50,`<defs><linearGradient id="hg"><stop offset="0" stop-color="#E2445C"/><stop offset="1" stop-color="#FFC24B"/></linearGradient></defs><rect x="300" y="20" width="10" height="${M.length*50}" fill="#F25C3B" opacity=".2"/>${s}`,'Isı iletimi')+`<div class="vis-stat">Isı, iyi iletken maddelerde daha hızlı yayılır. Süre: <b>${Math.round(st.t/10)} dk</b></div><div class="vis-tools">${vbtn(key,'run','Isıtmaya başla','','pri')}${vbtn(key,'reset','Sıfırla')}</div>`};

/* ---------- 20) AKIŞ / ZİNCİR / DÖNGÜ ---------- */
VIS.flow=(p,key,st)=>{const S=p.steps||[];const k=p.kind||'zincir';
  if(k==='dongu'){const n=S.length,R=78;return vsvg(360,220,S.map((t,i)=>{const a=i/n*2*Math.PI-Math.PI/2,a2=(i+.5)/n*2*Math.PI-Math.PI/2;const x=180+R*1.4*Math.cos(a),y=110+R*Math.sin(a);return `<path d="M${180+R*1.4*Math.cos(a+.25)} ${110+R*Math.sin(a+.25)}Q${180+R*1.55*Math.cos(a2)} ${110+R*1.12*Math.sin(a2)} ${180+R*1.4*Math.cos(a+2*Math.PI/n-.25)} ${110+R*Math.sin(a+2*Math.PI/n-.25)}" fill="none" stroke="${VC.mut}" stroke-width="2" marker-end="url(#ar2)"/><g class="vclick" data-act="vis" data-k="${key}" data-op="hi" data-v="${i}"><rect x="${x-52}" y="${y-15}" width="104" height="30" rx="15" fill="${st.hi===i?VC.bord:PAL[i%8]}"/>${vtxt(x,y+4,t.length>16?t.slice(0,15)+'…':t,{s:10,c:'#fff'})}</g>`}).join('')+`<defs><marker id="ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${VC.mut}"/></marker></defs>`,'Döngü')+(st.hi>=0?`<div class="vis-stat">${esc(S[st.hi])}</div>`:'')}
  return `<div class="flow ${k==='algoritma'?'vert':''}">${S.map((t,i)=>`<button class="fstep ${st.hi===i?'on':''} ${k==='algoritma'&&(i===0||i===S.length-1)?'oval':''}" style="--c:${PAL[i%8]}" data-act="vis" data-k="${key}" data-op="hi" data-v="${i}">${k==='zincir'?`<small>${i+1}</small>`:''}${esc(t)}</button>${i<S.length-1?`<span class="farr">${k==='algoritma'?'↓':'→'}</span>`:''}`).join('')}</div>`};

/* ---------- 21) HARİTA ---------- */
VIS.map=(p,key,st)=>{const P=p.pins||[];const tr=p.region!=='dunya';
  const base=tr?`<rect width="360" height="200" fill="#CFE8FF"/><g transform="translate(-6 10) scale(1.02)">${TR_SHAPE('#CDEBC3')}</g>`:`<rect width="360" height="200" fill="#CFE8FF"/><path d="M30 50c30-20 80-10 90 20s-20 50-50 50-50-50-40-70zM70 120c20 0 30 30 20 60-10 10-30-20-30-40s0-20 10-20zM160 40c30-10 60 0 60 20s-20 40-10 60-30 40-40 20-30-80-10-100zM230 40c40-10 100 0 110 30s-30 50-60 40-70-60-50-70zM280 140c20-10 50 0 50 20s-30 20-40 10-20-20-10-30z" fill="#CDEBC3" stroke="#3E8A33"/>`;
  return vsvg(360,200,base+P.map((q,i)=>{const x=q.x/100*360,y=q.y/100*200;return `<g class="vclick" data-act="vis" data-k="${key}" data-op="pin" data-v="${i}"><path d="M${x} ${y}c-8-12-12-16-12-22a12 12 0 0 1 24 0c0 6-4 10-12 22z" fill="${st.sel===i?VC.bord:PAL[i%8]}"/><circle cx="${x}" cy="${y-22}" r="4" fill="#fff"/>${st.sel===i||P.length<=6?vtxt(x,y+14,q.label,{s:10}):''}</g>`}).join(''),tr?'Türkiye haritası':'Dünya haritası')+`<div class="vis-stat">${st.sel>=0?`<b>${esc(P[st.sel].label)}</b>${P[st.sel].note?' · '+esc(P[st.sel].note):''}`:'Bir işarete dokun.'}</div>`};

/* ---------- 22) ZAMAN ÇİZELGESİ (sıralama) ---------- */
VIS.timeline=(p,key,st)=>{const E=p.events||[];const ok=st.done&&st.seq.length===E.length&&st.seq.every((v,i)=>i===0||fracVal(String(E[st.seq[i-1]].y))<=fracVal(String(E[v].y)));
  return `<div class="tl-pool">${st.pool.map(i=>`<button class="tl-card" data-act="vis" data-k="${key}" data-op="pick" data-v="${i}">${esc(E[i].t)}</button>`).join('')||'<span class="meta">Tüm olayları dizdin.</span>'}</div>
   <div class="tl-line">${st.seq.map((i,k)=>`<div class="tl-node ${st.done?(ok?'ok':''):''}"><b>${st.done?esc(E[i].y):k+1}</b><span>${esc(E[i].t)}</span></div>`).join('')}</div>
   <div class="vis-stat ${st.done?(ok?'ok':'bad'):''}">${st.done?(ok?`${ic('okc',14)} Kronolojik sıra doğru!`:'Sıralamada karışıklık var; yılları inceleyip yeniden dene.'):'Olayları eskiden yeniye doğru sırayla seç.'}</div>
   <div class="vis-tools">${vbtn(key,'undo','Geri al')}${vbtn(key,'check','Kontrol et','',st.pool.length?'dis':'pri')}${vbtn(key,'reset','Baştan')}</div>`};

/* ---------- 23) HABER / GAZETE ---------- */
VIS.news=(p)=>`<div class="news"><div class="news-mast"><b>Okul Gazetesi</b><span>${fmtDL(TODAY)} · Sayı 12</span></div><h4>${esc(p.headline||'')}</h4><p class="news-lead">${esc(p.lead||'')}</p><div class="news-cols"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="row" style="gap:6px">${(p.tags||[]).map(t=>`<span class="pill p-krem">#${esc(t)}</span>`).join('')}</div></div>`;

/* ---------- 24) DİYALOG ---------- */
VIS.chat=(p)=>{const L=p.lines||[];const who=[...new Set(L.map(l=>l.who))];return `<div class="vchat">${L.map(l=>{const i=who.indexOf(l.who);return `<div class="vmsg ${i%2?'r':''}"><span class="vav" style="background:${PAL[i%8]}">${esc(l.who[0]||'?')}</span><div><small>${esc(l.who)}</small><p>${esc(l.t)}</p></div></div>`}).join('')}</div>`};

/* ---------- 25) KELİME KARTLARI ---------- */
VIS.cards=(p,key,st)=>`<div class="vcards">${(p.items||[]).map((c,i)=>`<div class="vcard ${st.flip[i]?'f':''}"><button class="vcard-in" data-act="vis" data-k="${key}" data-op="flip" data-v="${i}" aria-label="Kartı çevir"><span class="fr"><em>${c.ic||''}</em><b>${esc(c.w)}</b></span><span class="bk"><em>${c.ic||''}</em><b>${esc(c.tr)}</b></span></button><button class="vsay" data-act="vis" data-k="${key}" data-op="say" data-v="${i}" aria-label="Dinle">${ic('chat',13)}</button></div>`).join('')}</div><div class="vis-stat">Karta dokun: çevir · Balon: dinle</div>`;

/* ---------- 26) GRAFİK DÜZENLEYİCİ ---------- */
VIS.organizer=(p,key,st)=>{const k=p.kind||'tablo';const S=p.slots||[];const inp=(id,ph)=>`<textarea class="org-in" rows="2" data-vis-in="val:${id}" data-k="${key}" placeholder="${esc(ph)}">${esc(st.val[id]||'')}</textarea>`;
  if(k==='venn')return `<div class="venn"><div class="vc a"><b>${esc(S[0]||'A')}</b>${inp('a','yalnızca '+(S[0]||'A'))}</div><div class="vc m"><b>${esc(S[2]||'Ortak')}</b>${inp('m','ikisinde de')}</div><div class="vc b"><b>${esc(S[1]||'B')}</b>${inp('b','yalnızca '+(S[1]||'B'))}</div></div>`;
  if(k==='kavram')return `<div class="kmap"><div class="kc">${esc(S[0]||'Kavram')}</div><div class="kspokes">${S.slice(1).map((t,i)=>`<div class="ks"><b>${esc(t)}</b>${inp('s'+i,'…')}</div>`).join('')}</div></div>`;
  const lbl=k==='hikaye'?['Kişiler','Yer','Zaman','Sorun','Olaylar','Çözüm']:k==='5n1k'?['Ne?','Nerede?','Ne zaman?','Nasıl?','Neden?','Kim?']:k==='tki'?['Tahmin','Kanıt','Sonuç']:S;
  return `<div class="ogrid c${Math.min(3,lbl.length)}">${lbl.map((t,i)=>`<div class="oc"><b>${esc(t)}</b>${inp('c'+i,k==='tablo'||k==='tki'?'yaz…':'…')}</div>`).join('')}</div>`};

/* ---------- 27) BÜTÇE ---------- */
VIS.budget=(p)=>{const I=p.items||[];const T=fracVal(p.total||I.reduce((a,b)=>a+fracVal(b.value),0));const sum=I.reduce((a,b)=>a+fracVal(b.value),0);
  return `<div class="jars">${I.map((it,i)=>{const f=Math.min(1,fracVal(it.value)/(T||1));return `<div class="jar"><div class="jar-g"><i style="height:${f*100}%;background:${PAL[i%8]}"></i></div><b>${esc(it.label)}</b><span>${esc(String(it.value))}</span></div>`}).join('')}</div><div class="vis-stat ${Math.abs(sum-T)<1e-9?'ok':''}">Toplam: <b>${+sum.toFixed(3)}</b> / ${esc(String(p.total||T))}${Math.abs(sum-T)>1e-9?' · Kalan: <b>'+(+(T-sum).toFixed(3))+'</b>':''}</div>`};

/* ---------- 28) SINIFLANDIR ---------- */
VIS.sort=(p,key,st)=>{const B=p.bins||[],I=p.items||[];const right=I.filter((it,i)=>st.place[i]===it.b).length;
  return `<div class="sort-items">${I.map((it,i)=>st.place[i]==null?`<button class="schip ${st.pick===i?'on':''}" data-act="vis" data-k="${key}" data-op="item" data-v="${i}">${esc(it.t)}</button>`:'').join('')||'<span class="meta">Hepsini yerleştirdin.</span>'}</div>
   <div class="sort-bins">${B.map((b,j)=>`<button class="sbin" style="--c:${PAL[j%8]}" data-act="vis" data-k="${key}" data-op="bin" data-v="${j}"><b>${esc(b)}</b><span>${I.map((it,i)=>st.place[i]===j?`<em class="${st.checked?(it.b===j?'ok':'no'):''}">${esc(it.t)}</em>`:'').join('')}</span></button>`).join('')}</div>
   <div class="vis-stat ${st.checked&&right===I.length?'ok':''}">${st.checked?`${right}/${I.length} doğru${right===I.length?' · Mükemmel!':' · Kırmızıları yeniden düşün.'}`:'Önce bir kartı seç, sonra doğru kutuya dokun.'}</div><div class="vis-tools">${vbtn(key,'check','Kontrol et','',Object.keys(st.place).length===I.length?'pri':'')}${vbtn(key,'reset','Baştan')}</div>`};

/* ---------- 29) GÜNLÜK PLAN ---------- */
VIS.routine=(p)=>`<div class="rtn">${(p.items||[]).map((it,i)=>`<div class="rt"><b style="--c:${PAL[i%8]}">${esc(it.time)}</b><span>${esc(it.t)}</span></div>`).join('')}</div>`;

/* küçük ikon (kart önizlemesi için) */
const VIS_IC={pizza:'🍕',zoom:'🔍',numberline:'📏',bars:'📊',pie:'🥧',balance:'⚖️',areagrid:'🔲',shapes:'📐',cubes:'🧊',coord:'📈',dice:'🎲',solar:'🌙',circuit:'💡',light:'🔦',force:'➡️',lever:'🏗️',atom:'⚛️',wave:'🔊',heat:'🔥',flow:'🔄',map:'🗺️',timeline:'🗓️',news:'📰',chat:'💬',cards:'🃏',organizer:'🧩',budget:'🫙',sort:'🗂️',routine:'⏰'};
const VIS_NM={pizza:'Pizza ile kesirler',zoom:'Yakınlaşan sahne',numberline:'Sayı doğrusu',bars:'Sütun grafik',pie:'Daire grafik',balance:'Eşit kollu terazi',areagrid:'Alan modeli',shapes:'Geometri',cubes:'Birim küpler',coord:'Koordinat sistemi',dice:'Olasılık deneyi',solar:'Güneş-Dünya-Ay',circuit:'Elektrik devresi',light:'Işık',force:'Kuvvet',lever:'Basit makine',atom:'Atom modeli',wave:'Ses dalgası',heat:'Isı iletimi',flow:'Akış / zincir',map:'Harita',timeline:'Zaman çizelgesi',news:'Haber kartı',chat:'Diyalog',cards:'Kelime kartları',organizer:'Grafik düzenleyici',budget:'Bütçe',sort:'Sınıflandırma',routine:'Günlük plan'};
