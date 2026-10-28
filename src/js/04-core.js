/* ================= CORE ================= */
const LS_KEY='navigaitor-demo-v5';
const lsGet=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let DB = (()=>{const s=lsGet(LS_KEY);return s&&s.v===5?s:buildDB()})();
const save=()=>lsSet(LS_KEY,DB);
const F_DEF=()=>({year:'2026-1',grade:[],sections:[],course:'ALL',unit:'',topic:'',kz:[],student:'',date:'term',pg:{}});
let F = Object.assign(F_DEF(), lsGet(LS_KEY+'-f')||{});
const saveF=()=>lsSet(LS_KEY+'-f',F);
const UI={route:'home',sub:'',param:'',collapsed:!!lsGet(LS_KEY+'-c'),openDD:null,ddQ:'',notes:[],page:{},scroll:{},tabs:{},sort:{},table:{},drawer:null,modal:null,wiz:null,sel:{},exp:{},q:{},hl:null,firstRender:true};

/* ---------- utils ---------- */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const MON=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const MONL=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const fmtD=iso=>{if(!iso)return'—';const[y,m,d]=iso.slice(0,10).split('-');return `${+d} ${MON[m-1]}`};
const fmtDL=iso=>{if(!iso)return'—';const[y,m,d]=iso.slice(0,10).split('-');return `${+d} ${MONL[m-1]} ${y}`};
const rel=iso=>{const n=daysBetween(iso.slice(0,10),TODAY);return n<=0?'bugün':n===1?'dün':n<7?`${n} gün önce`:fmtD(iso)};
const stu=id=>DB.students.find(s=>s.id===id);
const kzOf=id=>KZ.find(k=>k.id===id);
const fullName=s=>s.first+' '+s.last;
const shortName=s=>s.first+' '+s.last[0]+'.';
const uid=p=>p+Math.random().toString(36).slice(2,8);
const age=b=>{const d=new Date(TODAY),x=new Date(b);let a=d.getFullYear()-x.getFullYear();if(d<new Date(d.getFullYear(),x.getMonth(),x.getDate()))a--;return a};

/* ---------- icons ---------- */
const IC={
home:'<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
school:'<path d="M3 21h18M5 21V8l7-5 7 5v13"/><path d="M9 21v-5h6v5M10 10h4"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
book:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
bookopen:'<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
clip:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
clipcheck:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
chart:'<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
file:'<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
spark:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
chat:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
idcard:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M14 10h4M14 14h4M5 16.5c.6-1.3 1.7-2 3-2s2.4.7 3 2"/>',
search:'<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
cd:'<path d="m6 9 6 6 6-6"/>', cr:'<path d="m9 18 6-6-6-6"/>', cl:'<path d="m15 18-6-6 6-6"/>',
x:'<path d="M18 6 6 18M6 6l12 12"/>', check:'<path d="M20 6 9 17l-5-5"/>',
clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
print:'<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
bulb:'<path d="M9 18h6M10 22h4"/><path d="M15.1 14c.2-1 .7-1.7 1.4-2.5A4.7 4.7 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.4 2.5"/>',
calc:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/>',
compass:'<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.4 2.1 2.1-6.3z"/>',
down:'<path d="M22 17 13.5 8.5l-5 5L2 7"/><path d="M16 17h6v-6"/>', up:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
plus:'<path d="M12 5v14M5 12h14"/>', menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
panel:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18"/>',
send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
edit:'<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
dl:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
undo:'<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>',
eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
filter:'<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
dash:'<path d="M10.1 2.2a10 10 0 0 1 3.8 0M17.6 3.7a10 10 0 0 1 2.7 2.7M21.8 10.1a10 10 0 0 1 0 3.8M20.3 17.6a10 10 0 0 1-2.7 2.7M13.9 21.8a10 10 0 0 1-3.8 0M6.4 20.3a10 10 0 0 1-2.7-2.7M2.2 13.9a10 10 0 0 1 0-3.8M3.7 6.4a10 10 0 0 1 2.7-2.7"/>',
okc:'<circle cx="12" cy="12" r="10"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
oks:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>',
miss:'<rect x="3" y="3" width="18" height="18" rx="4" stroke-dasharray="3 3"/><path d="M9 12h6"/>',
pend:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7v5l3 2"/>',
list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
archive:'<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
refresh:'<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
video:'<path d="m22 8-6 4 6 4z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
code:'<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
hist:'<path d="M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.7 2.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
table:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
crosshair:'<circle cx="12" cy="12" r="10"/><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4"/>',
more:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
back:'<path d="m12 19-7-7 7-7M19 12H5"/>',
logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
house:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 15.5a2.5 2.5 0 0 1 5 0V21h-5z"/>',
ruler:'<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
group:'<circle cx="12" cy="8" r="3.2"/><circle cx="5" cy="10" r="2.4"/><circle cx="19" cy="10" r="2.4"/><path d="M6.5 20a5.5 5.5 0 0 1 11 0M1.5 19a3.6 3.6 0 0 1 5-3.3M22.5 19a3.6 3.6 0 0 0-5-3.3"/>',
present:'<path d="M2 3h20M3 3v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3M12 16v5M8 21h8"/>',
image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
zero:'<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
adapt:'<path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>',
grip:'<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
};
const ic=(n,s=18,cls='')=>`<svg class="i ${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||''}</svg>`;

/* ---------- fictional portrait ---------- */
function avatar(s,size=40,cls=''){
  const L=s.look; const long=s.g==='K';
  return `<svg class="av-img ${cls}" width="${size}" height="${size}" viewBox="0 0 64 64" role="img" aria-label="${esc(fullName(s))} (kurgusal görsel)"><defs><clipPath id="cp${s.id}${size}"><circle cx="32" cy="32" r="32"/></clipPath></defs><g clip-path="url(#cp${s.id}${size})"><rect width="64" height="64" fill="${L.bg}"/>${long?`<path d="M18 31c0-12 6-19 14-19s14 7 14 19v17c-3 2-6 2-9 0H27c-3 2-6 2-9 0z" fill="${L.hair}"/>`:''}<path d="M7 66c2-13 12-19 25-19s23 6 25 19z" fill="${L.shirt}"/><path d="M26 47c2 3 4 4 6 4s4-1 6-4" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/><rect x="27.5" y="37" width="9" height="11" rx="4" fill="${L.skin}"/><ellipse cx="32" cy="29" rx="10.5" ry="12" fill="${L.skin}"/><path d="M21.3 27.5c0-9 4.7-14 10.7-14s10.7 5 10.7 14c-2.5-4.6-6.4-6.5-10.7-6.5s-8.2 1.9-10.7 6.5z" fill="${L.hair}"/><circle cx="28" cy="30" r="1.1" fill="#2a1a12"/><circle cx="36" cy="30" r="1.1" fill="#2a1a12"/><path d="M29.5 35c1.5 1 3.5 1 5 0" stroke="#7a3b22" stroke-width="1.1" fill="none" stroke-linecap="round"/></g></svg>`;
}

/* ---------- data helpers ---------- */
const mOf=(sid,kid)=>{const a=(DB.measures[sid]||{})[kid];if(!a||!a.length)return null;const l=a.slice(-3);return {v:Math.round(avg(l.map(x=>x.s))),n:a.length,last:a[a.length-1],arr:a}};
const level=v=>v==null?{l:'Ölçüm yok',k:'none',ic:'dash'}:v>=70?{l:'Yeterli',k:'ok',ic:'okc'}:v>=55?{l:'Gelişiyor',k:'mid',ic:'clock'}:{l:'Destek gerekli',k:'low',ic:'alert'};
const pendingEvals=()=>{const out=[];DB.acts.forEach(a=>{if(!a.needsEval||a.status==='Taslak'||a.status==='Arşiv')return;Object.entries(a.subs).forEach(([sid,s])=>{if(s.state==='tamamladı'&&!s.evaluated)out.push({a,sid,sub:s})})});return out};
const openAlerts=()=>DB.alerts.filter(a=>a.status!=='Çözüldü');
const unreadN=()=>DB.notifs.filter(n=>!n.read).length;
const unreadM=()=>DB.threads.filter(t=>t.unread).length;
const yearOK=()=>F.year==='2026-1';
const dateFrom=()=>F.date==='7'?isoAdd(TODAY,-7):F.date==='30'?isoAdd(TODAY,-30):'2026-09-01';
const secScope=()=>F.sections.length?F.sections.slice():SECTIONS.filter(s=>!F.grade.length||F.grade.includes(GRADE_OF(s)));
const gradeScope=()=>[...new Set(secScope().map(GRADE_OF))].sort();
const coursesFor=sec=>F.course==='ALL'?visibleCourses(sec):visibleCourses(sec).filter(c=>c===F.course);
const courseUnion=()=>[...new Set(secScope().flatMap(coursesFor))];
const studentsScope=(withStudent=true)=>DB.students.filter(s=>secScope().includes(s.section)&&(!withStudent||!F.student||F.student===s.id));
const unitKey=k=>`${k.course}|${k.grade}|${k.unit}`;
const kzScope=(grade,secs)=>{const cs=new Set((secs||secScope().filter(s=>GRADE_OF(s)===grade)).flatMap(coursesFor));return KZ.filter(k=>k.grade===grade&&cs.has(k.course)&&(!F.unit||unitKey(k)===F.unit)&&(!F.topic||k.topic===F.topic)&&(!F.kz.length||F.kz.includes(k.id)))};
const kzScopeAll=()=>gradeScope().flatMap(g=>kzScope(g));
const kzLabel=k=>`${k.topic} · ${k.name}`;
const pg=(key=UI.route+'/'+UI.sub)=>F.pg[key]||(F.pg[key]={});
const errsScope=()=>{const ss=new Set(studentsScope().map(s=>s.id));const ks=new Set(kzScopeAll().map(k=>k.id));return DB.errors.filter(e=>ss.has(e.sid)&&ks.has(e.kz))};

function cellStat(sec,kid){
  const ss=DB.students.filter(s=>s.section===sec);
  const vals=ss.map(s=>({s,m:mOf(s.id,kid)})).filter(x=>x.m);
  const k=kzOf(kid);
  if(!vals.length) return {state:'none',k,n:0,total:ss.length};
  const rate=Math.round(vals.filter(x=>x.m.v>=70).length/vals.length*100);
  const prevVals=vals.filter(x=>x.m.arr.length>1).map(x=>{const a=x.m.arr.slice(0,-1).slice(-3);return avg(a.map(y=>y.s))});
  const prevRate=prevVals.length?Math.round(prevVals.filter(v=>v>=70).length/prevVals.length*100):null;
  const er=DB.errors.filter(e=>e.kz===kid&&ss.some(s=>s.id===e.sid));
  const cnt={K:0,I:0,S:0};er.forEach(e=>cnt[e.type]+=e.count);
  const dom=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
  const insufficient = vals.length<5;
  return {state:insufficient?'ins':'ok',k,n:vals.length,total:ss.length,rate,delta:prevRate==null?null:rate-prevRate,dom:dom[1]?dom[0]:null,vals,errs:er};
}
const heatBg=r=>r<40?'var(--heat-4)':r<55?'var(--heat-3)':r<70?'var(--heat-2)':r<85?'var(--heat-1)':'var(--heat-0)';
const heatFg=r=>r<55?'#FFF4E4':'#000';

function weeklyAcad(sec,courses){
  const ss=DB.students.filter(s=>s.section===sec);
  return WEEKS.map((w,i)=>{const end=i<7?WEEKS[i+1]:isoAdd(w,7);const arr=[];ss.forEach(s=>Object.entries(DB.measures[s.id]).forEach(([k,a])=>{if(!courses.includes(k.split(/\d/)[0]))return;a.forEach(x=>{if(x.d>=w&&x.d<end)arr.push(x.s)})}));return {v:arr.length?Math.round(avg(arr)):null,n:arr.length,d:w}});
}
function sectionAvg(secs,from,to){const arr=[];secs.forEach(sec=>DB.students.filter(s=>s.section===sec).forEach(s=>Object.entries(DB.measures[s.id]).forEach(([k,a])=>{if(!coursesFor(sec).includes(k.split(/\d/)[0]))return;a.forEach(x=>{if(x.d>=from&&x.d<to)arr.push(x.s)})})));return {v:arr.length?Math.round(avg(arr)):null,n:arr.length}}
const partOf=sids=>{let exp=0,ok=0;DB.acts.forEach(a=>{if(a.status==='Taslak')return;sids.forEach(id=>{if(a.subs[id]){exp++;if(a.subs[id].state!=='başlamadı')ok++}})});return exp?Math.round(ok/exp*100):null};
function studentAvg(sid,course){const v=Object.entries(DB.measures[sid]||{}).filter(([k])=>!course||k.startsWith(course)).map(([k])=>mOf(sid,k).v);return v.length?Math.round(avg(v)):null}

/* ---------- filter system ---------- */
const YEARS=[{v:'2026-1',l:'2026-2027 · 1. Dönem'},{v:'2026-2',l:'2026-2027 · 2. Dönem'},{v:'2025',l:'2025-2026 · Tüm yıl'}];
const DATES=[{v:'term',l:'Bu dönem'},{v:'30',l:'Son 30 gün'},{v:'7',l:'Son 7 gün'}];
function courseOptions(){const sc=secScope();const u=[...new Set(sc.flatMap(visibleCourses))];return [{v:'ALL',l:'Tüm Dersler',sub:sc.includes('7/A')&&u.length>1?'Yetkili olduğunuz tüm dersler':'Yetkili dersler'}].concat(u.map(c=>({v:c,l:COURSES[c].name,sub:c===TEACHER.course?'Branş dersiniz':'Yalnızca 7/A · rehberlik kapsamı'})))}
function unitOptions(){const seen={};gradeScope().forEach(g=>{const cs=new Set(secScope().filter(s=>GRADE_OF(s)===g).flatMap(coursesFor));KZ.filter(k=>k.grade===g&&cs.has(k.course)).forEach(k=>{const key=unitKey(k);if(!seen[key])seen[key]={v:key,l:unitLbl(k),sub:`${g}. sınıf · ${COURSES[k.course].name}`}})});return Object.values(seen)}
function topicOptions(){if(!F.unit)return[];const t=[...new Set(KZ.filter(k=>unitKey(k)===F.unit).map(k=>k.topic))];return t.map(x=>({v:x,l:x}))}
function kzOptions(){const g=gradeScope();return g.flatMap(gr=>{const cs=new Set(secScope().filter(s=>GRADE_OF(s)===gr).flatMap(coursesFor));return KZ.filter(k=>k.grade===gr&&cs.has(k.course)&&(!F.unit||unitKey(k)===F.unit)&&(!F.topic||k.topic===F.topic)).map(k=>({v:k.id,l:k.name,sub:`${k.topic} · ${gr}. sınıf`}))})}
function studentOptions(){return DB.students.filter(s=>secScope().includes(s.section)).map(s=>({v:s.id,l:fullName(s),sub:s.section+' · No '+s.no}))}
function normalizeF(){
  const notes=[];
  const allowed=SECTIONS.filter(s=>!F.grade.length||F.grade.includes(GRADE_OF(s)));
  const rm=F.sections.filter(s=>!allowed.includes(s));
  if(rm.length){F.sections=F.sections.filter(s=>allowed.includes(s));notes.push(`${rm.join(', ')} seçimi kaldırıldı: seçili sınıf seviyesine ait değil.`)}
  if(!courseOptions().some(o=>o.v===F.course)){notes.push(`${COURSES[F.course]?.name||'Ders'} seçimi kaldırıldı: seçili şubelerde bu derse erişim yetkiniz yok.`);F.course='ALL'}
  if(F.unit&&!unitOptions().some(o=>o.v===F.unit)){notes.push('Ünite seçimi kaldırıldı: yeni kapsamda bu ünite yok.');F.unit=''}
  if(F.topic&&!topicOptions().some(o=>o.v===F.topic)){notes.push('Konu seçimi kaldırıldı: seçili üniteye ait değil.');F.topic=''}
  const ko=new Set(kzOptions().map(o=>o.v));const kr=F.kz.filter(k=>!ko.has(k));
  if(kr.length){F.kz=F.kz.filter(k=>ko.has(k));notes.push(`${kr.length} kazanım seçimi kaldırıldı: yeni kapsamın dışında kaldı.`)}
  if(F.student&&!studentOptions().some(o=>o.v===F.student)){notes.push(`${fullName(stu(F.student))} seçimi kaldırıldı: seçili şubelerde değil.`);F.student=''}
  return notes;
}
// filter field definitions
const FD={
  year:{l:'Dönem',opts:()=>YEARS,get:()=>F.year,set:v=>F.year=v},
  grade:{l:'Sınıf',multi:1,opts:()=>[{v:7,l:'7. sınıf'},{v:8,l:'8. sınıf'}],get:()=>F.grade,set:v=>{v=+v;F.grade=F.grade.includes(v)?F.grade.filter(x=>x!==v):[...F.grade,v]},clear:()=>F.grade=[],chip:v=>v+'. sınıf'},
  section:{l:'Şube',multi:1,search:1,opts:()=>SECTIONS.filter(s=>!F.grade.length||F.grade.includes(GRADE_OF(s))).map(s=>({v:s,l:s,sub:s===TEACHER.guidance[0]?'Rehberlik sınıfınız':'Matematik'})),get:()=>F.sections,set:v=>{F.sections=F.sections.includes(v)?F.sections.filter(x=>x!==v):[...F.sections,v]},clear:()=>F.sections=[],chip:v=>v},
  course:{l:'Ders',search:1,opts:courseOptions,get:()=>F.course,set:v=>F.course=v,def:'ALL'},
  unit:{l:'Ünite',search:1,opts:()=>[{v:'',l:'Tüm üniteler'}].concat(unitOptions()),get:()=>F.unit,set:v=>{F.unit=v;F.topic=''},def:''},
  topic:{l:'Konu',search:1,opts:()=>[{v:'',l:F.unit?'Tüm konular':'Önce ünite seçin'}].concat(topicOptions()),get:()=>F.topic,set:v=>F.topic=v,def:''},
  kz:{l:'Kazanım',multi:1,search:1,opts:kzOptions,get:()=>F.kz,set:v=>{F.kz=F.kz.includes(v)?F.kz.filter(x=>x!==v):[...F.kz,v]},clear:()=>F.kz=[],chip:v=>kzOf(v).topic},
  student:{l:'Öğrenci',search:1,opts:()=>[{v:'',l:'Tüm öğrenciler'}].concat(studentOptions()),get:()=>F.student,set:v=>F.student=v,def:'',chip:v=>fullName(stu(v))},
  date:{l:'Tarih',opts:()=>DATES,get:()=>F.date,set:v=>F.date=v,def:'term'},
};
function pgField(key,label,opts,{multi=false,def=''}={}){
  return {l:label,multi,opts:()=>opts,get:()=>{const p=pg();return p[key]??(multi?[]:def)},set:v=>{const p=pg();if(multi){const c=p[key]||[];p[key]=c.includes(v)?c.filter(x=>x!==v):[...c,v]}else p[key]=v},clear:()=>{pg()[key]=multi?[]:def},def,chip:v=>(opts.find(o=>o.v==v)||{}).l||v};
}
function ddSummary(fd){const v=fd.get(),o=fd.opts();if(fd.multi){if(!v.length)return 'Tümü';if(v.length===1)return (o.find(x=>x.v==v[0])||{}).l||v[0];return v.length+' seçili'}return (o.find(x=>x.v==v)||{}).l||'Tümü'}
function dd(key,fd,{align='',label=true}={}){
  const open=UI.openDD===key;const v=fd.get();const act=fd.multi?v.length>0:(fd.def!==undefined?v!==fd.def:false);
  const opts=fd.opts();
  return `<div class="dd ${open?'open':''}" data-dd="${key}">
  <button class="dd-btn ${act?'act':''}" data-act="ddToggle" data-k="${key}" aria-haspopup="listbox" aria-expanded="${open}">${label?`<span class="k">${fd.l}:</span>`:''}<span class="v">${esc(ddSummary(fd))}</span>${ic('cd',15,'car')}</button>
  ${open?`<div class="pop dd-pop ${align}" role="dialog" aria-label="${fd.l} seçimi">
    ${(fd.search||opts.length>7)?`<input class="dd-search" data-ddsearch placeholder="${fd.l} ara…" value="${esc(UI.ddQ)}" aria-label="${fd.l} ara">`:''}
    <div class="dd-list" role="listbox" aria-multiselectable="${!!fd.multi}">${opts.length?opts.map(o=>{const sel=fd.multi?v.map(String).includes(String(o.v)):String(v)===String(o.v);return `<button class="dd-opt ${sel?'sel':''}" role="option" aria-selected="${sel}" data-act="ddPick" data-k="${key}" data-v="${esc(o.v)}" data-s="${esc((o.l+' '+(o.sub||'')).toLocaleLowerCase('tr'))}">${fd.multi?`<span class="bx">${sel?ic('check',12):''}</span>`:''}<span>${esc(o.l)}${o.sub?`<small>${esc(o.sub)}</small>`:''}</span></button>`}).join(''):'<div class="dd-empty">Bu kapsamda seçenek yok.</div>'}<div class="dd-empty" data-ddnone hidden>Sonuç bulunamadı.</div></div>
    ${fd.multi?`<div class="dd-foot"><button class="btn xs ghost" data-act="ddClear" data-k="${key}">Seçimi temizle</button><button class="btn xs pri" data-act="ddClose">Tamam</button></div>`:''}
  </div>`:''}</div>`;
}
const FIELDS={};
function regField(key,fd){FIELDS[key]=fd;return key}
Object.entries(FD).forEach(([k,v])=>FIELDS[k]=v);
function filterBar(keys,count,{extra='',countLabel='sonuç'}={}){
  const chips=[];
  keys.forEach(k=>{const fd=FIELDS[k];if(!fd)return;const v=fd.get();if(k==='year')return;
    if(fd.multi)v.forEach(x=>chips.push({k,v:x,l:(fd.chip?fd.chip(x):x)}));
    else if(fd.def!==undefined&&v!==fd.def&&v!=='')chips.push({k,v,l:fd.l+': '+ddSummary(fd)});});
  return `<section class="fbar" aria-label="Filtreler">
   <div class="fr">${ic('filter',16,'muted')}${keys.map(k=>FIELDS[k]?dd(k,FIELDS[k]):'').join('')}${extra}
    ${chips.length?`<button class="btn sm ghost" data-act="fClear">${ic('x',14)} Filtreleri temizle</button>`:''}
    <span class="res" aria-live="polite">${count!=null?`${count} ${countLabel}`:''}</span></div>
   ${chips.length?`<div class="fr">${chips.map(c=>`<span class="chip">${esc(c.l)}<button data-act="chipRm" data-k="${c.k}" data-v="${esc(c.v)}" aria-label="${esc(c.l)} filtresini kaldır">${ic('x',12)}</button></span>`).join('')}</div>`:''}
   ${UI.notes.map(n=>`<div class="notice" role="status">${ic('info',15)} ${esc(n)}</div>`).join('')}
  </section>`;
}

/* ---------- components ---------- */
const prioTag=p=>p==='Yüksek'?`<span class="prio y">${ic('alert',13)} Yüksek</span>`:p==='Orta'?`<span class="prio o">${ic('flag',13)} Orta</span>`:`<span class="prio d">${ic('info',13)} Düşük</span>`;
const etag=(t,showSub)=>`<span class="etag" title="${ERR[t].name}"><span class="ei">${ic(ERR[t].icon,12)}</span>${ERR[t].short}${showSub?' · '+showSub:''}</span>`;
const STATE_IC={'Yeni':'plus','İnceleniyor':'eye','Müdahale Atandı':'send','Kontrol Bekleniyor':'clock','Çözüldü':'okc'};
const stateTag=s=>`<span class="state">${ic(STATE_IC[s]||'info',15)} ${s}</span>`;
const lvlTag=v=>{const L=level(v);const cls=L.k==='ok'?'p-ink':L.k==='mid'?'p-krem':L.k==='low'?'p-bordo':'p-gray';return `<span class="pill ${cls}">${ic(L.ic,12)} ${L.l}</span>`};
const meter=(v,{tgt=null,w=''}={})=>`<div class="meter" style="${w}" role="img" aria-label="%${v}"><i style="width:${clamp(v||0,0,100)}%"></i>${tgt!=null?`<span class="tgt" style="left:${tgt}%"></span>`:''}</div>`;
function stateBox(kind,title,text,action=''){const icn={empty:'layers',ins:'info',load:'refresh',err:'alert',none:'search'}[kind]||'info';return `<div class="stbox ${kind==='err'?'err':''}"><div class="si">${ic(icn,24)}</div><b>${esc(title)}</b><p>${esc(text)}</p>${action}</div>`}
function tabs(key,items,cur){return `<div class="tabs" role="tablist" data-tabs="${key}">${items.map(([v,l])=>`<button role="tab" aria-selected="${v===cur}" class="${v===cur?'on':''}" data-act="tab" data-k="${key}" data-v="${v}">${l}</button>`).join('')}<span class="ind"></span></div>`}
const seg=(key,items,cur,act='seg')=>`<div class="seg" role="radiogroup">${items.map(([v,l])=>`<button role="radio" aria-checked="${v===cur}" class="${v===cur?'on':''}" data-act="${act}" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
function pager(key,total,size){const pages=Math.max(1,Math.ceil(total/size));const p=clamp(UI.page[key]||1,1,pages);UI.page[key]=p;return {p,pages,slice:a=>a.slice((p-1)*size,p*size),html:`<div class="pager"><button data-act="pg" data-k="${key}" data-v="${p-1}" ${p<=1?'disabled':''} aria-label="Önceki sayfa">${ic('cl',16)}</button><input value="${p}" data-pgin="${key}" aria-label="Sayfa numarası" inputmode="numeric"><span>/ ${pages}</span><button data-act="pg" data-k="${key}" data-v="${p+1}" ${p>=pages?'disabled':''} aria-label="Sonraki sayfa">${ic('cr',16)}</button></div>`}}
function sortBy(key,arr,cols){const s=UI.sort[key];if(!s)return arr;const f=cols[s.c];if(!f)return arr;return arr.slice().sort((a,b)=>{const x=f(a),y=f(b);return (x>y?1:x<y?-1:0)*(s.d)})}
const th=(key,c,l)=>{const s=UI.sort[key];const on=s&&s.c===c;return `<th class="sortable" data-act="sort" data-k="${key}" data-v="${c}" aria-sort="${on?(s.d>0?'ascending':'descending'):'none'}">${l} ${on?(s.d>0?'↑':'↓'):''}</th>`};
const TIPS=new Map();let tipN=0;
const tipAttr=html=>{const id='tp'+(++tipN);TIPS.set(id,html);return `data-tipid="${id}"`};
const updated=()=>`<span class="meta">${ic('refresh',12)} Son güncelleme: bugün 08:12 · demo verisi</span>`;
function tableToggle(key){const on=UI.table[key];return `<button class="btn xs sec" data-act="tableT" data-k="${key}" aria-pressed="${!!on}">${ic(on?'chart':'table',14)} ${on?'Grafik':'Tablo'}</button>`}

/* ---------- charts ---------- */
function barChart({items,h=180,max=100,key='bar',onAct='',fmt=v=>'%'+v,target=null,W=520}){
  const pad=30,bw=Math.min(64,(W-pad*2)/items.length*.56),gap=(W-pad*2)/items.length;
  const y=v=>h-24-(v/max)*(h-44);
  let s=`<svg class="chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="Çubuk grafik">`;
  [0,25,50,75,100].forEach(t=>{s+=`<line x1="${pad}" x2="${W-6}" y1="${y(t)}" y2="${y(t)}" stroke="rgba(0,0,0,.07)"/><text x="${pad-6}" y="${y(t)+4}" text-anchor="end">${t}</text>`});
  if(target!=null)s+=`<line x1="${pad}" x2="${W-6}" y1="${y(target)}" y2="${y(target)}" stroke="#000" stroke-dasharray="4 4"/><text x="${W-6}" y="${y(target)-5}" text-anchor="end" style="fill:#000;font-weight:700">Hedef %${target}</text>`;
  items.forEach((it,i)=>{const x=pad+gap*i+(gap-bw)/2;const v=it.value??0;
    s+=`<g class="bar-g" tabindex="0" role="button" data-act="${onAct}" data-v="${esc(it.id)}" ${tipAttr(it.tip||`<b>${esc(it.label)}</b><br>${fmt(v)}`)} aria-label="${esc(it.label)}: ${fmt(v)}"><rect x="${x-6}" y="${y(100)}" width="${bw+12}" height="${y(0)-y(100)}" fill="transparent"/><rect class="b" x="${x}" y="${y(v)}" width="${bw}" height="${Math.max(2,y(0)-y(v))}" rx="10" fill="${it.fill||'url(#bg'+key+')'}" style="animation-delay:${i*40}ms"/><text x="${x+bw/2}" y="${y(v)-7}" text-anchor="middle" style="fill:#000;font-weight:800;font-size:12px">${fmt(v)}</text><text x="${x+bw/2}" y="${h-6}" text-anchor="middle">${esc(it.short||it.label)}</text></g>`});
  s+=`<defs><linearGradient id="bg${key}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a1201a"/><stop offset="1" stop-color="#5c0000"/></linearGradient></defs></svg>`;
  return s;
}
const DASH=['','6 4','2 4','10 4 2 4'];const LCOL=['#810000','#000000','#b06a4a','#5c0000'];
function lineChart({series,labels,h=200,min=30,max=100,key='ln',W=560}){
  const padL=32,padR=14,n=labels.length;const x=i=>padL+(W-padL-padR)*(i/(n-1));const y=v=>h-26-((v-min)/(max-min))*(h-46);
  let s=`<svg class="chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="Çizgi grafik">`;
  for(let t=min;t<=max;t+=10){if((t-min)%20)continue;s+=`<line x1="${padL}" x2="${W-padR}" y1="${y(t)}" y2="${y(t)}" stroke="rgba(0,0,0,.07)"/><text x="${padL-6}" y="${y(t)+4}" text-anchor="end">${t}</text>`}
  labels.forEach((l,i)=>{s+=`<text x="${x(i)}" y="${h-6}" text-anchor="middle">${esc(l)}</text>`});
  series.forEach((se,si)=>{const pts=se.pts.map((p,i)=>p.v==null?null:[x(i),y(p.v)]).filter(Boolean);if(!pts.length)return;
    const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    let len=0;for(let i=1;i<pts.length;i++)len+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
    if(si===0){s+=`<path d="${d} L${pts[pts.length-1][0]} ${h-26} L${pts[0][0]} ${h-26}Z" fill="url(#lg${key})" opacity=".8"/>`}
    s+=`<path class="draw" style="--len:${Math.ceil(len)};animation-delay:${si*60}ms" d="${d}" fill="none" stroke="${LCOL[si%4]}" stroke-width="${si===0?2.6:2}" stroke-dasharray="${DASH[si%4]}" stroke-linecap="round" stroke-linejoin="round"/>`;
    se.pts.forEach((p,i)=>{if(p.v==null)return;const last=i===se.pts.length-1;s+=`<circle class="dotp" cx="${x(i)}" cy="${y(p.v)}" r="${last?5:3.5}" fill="${last?LCOL[si%4]:'#fff'}" stroke="${LCOL[si%4]}" stroke-width="2" tabindex="0" ${tipAttr(`<b>${esc(se.name)}</b> · ${esc(labels[i])}<div class="tr"><span>Tarih</span><span>${fmtDL(p.d)} haftası</span></div><div class="tr"><span>Ortalama</span><b>${p.v}</b></div><div class="tr"><span>Değerlendirme sayısı</span><span>${p.n}</span></div>`)}/>`});
    const lp=pts[pts.length-1];s+=`<text x="${Math.min(lp[0]+7,W-4)}" y="${lp[1]-8}" text-anchor="end" style="fill:${LCOL[si%4]};font-weight:800">${esc(se.name)}</text>`;
  });
  s+=`<defs><linearGradient id="lg${key}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#810000" stop-opacity=".16"/><stop offset="1" stop-color="#810000" stop-opacity="0"/></linearGradient></defs></svg>`;
  return s;
}
const lineLegend=series=>`<div class="legend">${series.map((se,i)=>`<span><svg width="26" height="10" aria-hidden="true"><line x1="1" x2="25" y1="5" y2="5" stroke="${LCOL[i%4]}" stroke-width="2.5" stroke-dasharray="${DASH[i%4]}"/></svg> ${esc(se.name)}</span>`).join('')}</div>`;
function ring(v,size=64,lbl=''){const r=size/2-6,c=2*Math.PI*r;return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="%${v}"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="6"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#810000" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-(v||0)/100)}" transform="rotate(-90 ${size/2} ${size/2})" style="transition:stroke-dashoffset 250ms"/><text x="50%" y="54%" text-anchor="middle" style="font:800 ${size/4.4}px var(--sans);fill:#000">${v==null?'—':'%'+v}</text></svg>`}

/* ---------- overlays ---------- */
function toast(msg,{undo}={}){
  const el=document.createElement('div');el.className='toast';
  el.innerHTML=`<span class="ok">${ic('check',13)}</span><span>${esc(msg)}</span>${undo?`<button>Geri al</button>`:''}`;
  $('#toasts').appendChild(el);
  const kill=()=>{el.classList.add('out');setTimeout(()=>el.remove(),200)};
  if(undo)el.querySelector('button').onclick=()=>{undo();kill();toast('İşlem geri alındı')};
  setTimeout(kill,undo?6000:3200);
}
function commit(msg,fn,{undo=true,after}={}){
  const snap=JSON.stringify(DB);fn();save();render();after&&after();
  toast(msg,undo?{undo:()=>{DB=JSON.parse(snap);save();render()}}:{});
}
function openDrawer(fn,wide=false){UI.drawer={fn,wide};UI.modal=null;drawLayer(true)}
function openModal(fn,wide=false){UI.modal={fn,wide};drawLayer(true)}
function closeLayer(){const had=UI.modal||UI.drawer;if(UI.modal)UI.modal=null;else UI.drawer=null;drawLayer(false);if(had&&UI.lastFocus&&document.contains(UI.lastFocus))UI.lastFocus.focus()}
function drawLayer(anim){
  const L=$('#layer');TIPS.size>400&&TIPS.clear();
  let h='';
  if(UI.drawer){const d=UI.drawer.fn();h+=`<div class="scrim" data-act="closeLayer" style="${anim?'':'animation:none'}"></div><aside class="drawer ${UI.drawer.wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${esc(d.title)}" style="${anim&&!UI.modal?'':'animation:none'}"><div class="dr-hd"><div class="sp" style="min-width:0">${d.eyebrow?`<div class="eyebrow">${d.eyebrow}</div>`:''}<h2 class="st">${d.title}</h2>${d.sub?`<div class="meta" style="margin-top:4px">${d.sub}</div>`:''}</div><button class="icb" data-act="closeLayer" aria-label="Kapat">${ic('x')}</button></div><div class="dr-bd">${d.body}</div>${d.foot?`<div class="dr-ft">${d.foot}</div>`:''}</aside>`}
  if(UI.modal){const m=UI.modal.fn();h+=`<div class="scrim" data-act="closeLayer" style="z-index:81;${anim?'':'animation:none'}"></div><div class="modal ${UI.modal.wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${esc(m.title)}" style="${anim?'':'animation:none'}"><div class="dr-hd"><div class="sp"><h2 class="st">${m.title}</h2>${m.sub?`<div class="meta" style="margin-top:4px">${m.sub}</div>`:''}</div><button class="icb" data-act="closeLayer" aria-label="Kapat">${ic('x')}</button></div><div class="dr-bd">${m.body}</div>${m.foot?`<div class="dr-ft">${m.foot}</div>`:''}</div>`}
  const scrollEl=L.querySelector('.dr-bd');const st=scrollEl?scrollEl.scrollTop:0;
  L.innerHTML=h;
  if(!anim){const ne=L.querySelector('.dr-bd');if(ne)ne.scrollTop=st}
  if(anim&&h){const f=L.querySelector('.modal,.drawer');setTimeout(()=>{const t=f&&f.querySelector('[autofocus]')||f&&f.querySelector('.dr-bd button,.dr-bd input,.dr-bd textarea,.dr-bd select')||f&&f.querySelector('.icb');t&&t.focus({preventScroll:true})},30)}
}
