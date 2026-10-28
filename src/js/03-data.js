/* ================= DATA MODEL (fictional) ================= */
const TODAY = '2026-11-04';
const TEACHER = {name:'Selin Yılmaz', short:'SY', branch:'Matematik', course:'MAT', guidance:['7/A'], sections:['7/A','7/B','8/A','8/B'],
  org:'Atatürk Ortaokulu', orgShort:'Atatürk', email:'selin.yilmaz@ataturkoo.k12.demo', user:'selin.yilmaz', phone:'(555) 010 20 30'};
const SECTIONS = ['7/A','7/B','8/A','8/B'];
const GRADE_OF = s => +s[0];
const REHBER = {'7/A':'Selin Yılmaz','7/B':'Murat Kalkan','8/A':'Esra Toprak','8/B':'Okan Sarı'};
const COURSES = {
  MAT:{id:'MAT',name:'Matematik',teacher:'Selin Yılmaz'},
  TUR:{id:'TUR',name:'Türkçe',teacher:'Derya Şen'},
  FEN:{id:'FEN',name:'Fen Bilimleri',teacher:'Burak Ekin'},
  SOS:{id:'SOS',name:'Sosyal Bilgiler',teacher:'Gül Aksoy'},
  ING:{id:'ING',name:'İngilizce',teacher:'Cem Ural'}
};
// Rehber öğretmen kendi sınıfında tüm dersleri, diğer şubelerde yalnızca kendi branşını görür
const visibleCourses = sec => TEACHER.guidance.includes(sec) ? Object.keys(COURSES) : [TEACHER.course];
const WEEKS = ['2026-09-14','2026-09-21','2026-09-28','2026-10-05','2026-10-12','2026-10-19','2026-10-26','2026-11-02'];
const SKILLS = ['Eleştirel düşünme','Problem çözme','Yaratıcılık','İletişim','İş birliği','Dijital beceri'];

const KZ = [];
function addKz(course,grade,unit,unitName,topic,code,name,skill,win,state){KZ.push({id:`${course}${grade}-${KZ.filter(k=>k.course===course&&k.grade===grade).length+1}`,course,grade,unit,unitName,topic,code,name,skill,win,state});}
/* Kazanım kodu, adı ve tema bilgisi resmi programdan (21-resmi.js · tymm.meb.gov.tr) okunur; burada yalnızca kod + kısa konu etiketi verilir */
function rKz(course,grade,code){const G=(RESMI[course]||{})[grade];if(!G)return null;for(const u of G.u)for(const c of u.c)if(c[0]===code)return {unitNo:u.no,unitName:u.ad,text:c[1],alt:c[2],url:u.url,kapsam:u.kapsam};return null}
function addKzR(course,grade,code,topic,skill,win,state){const r=rKz(course,grade,code)||{unitNo:0,unitName:'—',text:null};const name=r.text||(r.kapsam?'Tema kapsamı: '+[].concat(r.kapsam).join(' '):'Çıktı metni resmi sayfadan alınamadı');addKz(course,grade,r.unitNo,r.unitName,topic,code,name,skill,win,state);const k=KZ[KZ.length-1];k.alt=r.alt||[];k.url=r.url||null;k.textMissing=!r.text}
// MATEMATİK 7 (resmi kod: MAT.7.x.y)
addKzR('MAT',7,'MAT.7.1.1','Tam sayılar','Problem çözme',[0,2],'ok');
addKzR('MAT',7,'MAT.7.1.4','Tam sayılarla işlemler','Problem çözme',[1,3],'ok');
addKzR('MAT',7,'MAT.7.1.3','Rasyonel sayıları sıralama','Eleştirel düşünme',[2,4],'ok');
addKzR('MAT',7,'MAT.7.1.4','Kesirler','Problem çözme',[3,5],'ok');
addKzR('MAT',7,'MAT.7.2.1','Cebirsel ifadeler','Eleştirel düşünme',[4,6],'ok');
addKzR('MAT',7,'MAT.7.2.2','Denklemler','Problem çözme',[6,7],'partial');
addKzR('MAT',7,'MAT.7.1.6','Oran-orantı','Problem çözme',[7,7],'thin');
addKzR('MAT',7,'MAT.7.1.7','Doğru orantı problemleri','Problem çözme',null,'none');
// MATEMATİK 8
addKzR('MAT',8,'MAT.8.1.3','Gerçek sayılar','Eleştirel düşünme',[0,2],'ok');
addKzR('MAT',8,'MAT.8.1.1','Üslü ifadeler','Eleştirel düşünme',[1,3],'ok');
addKzR('MAT',8,'MAT.8.1.1','Bilimsel gösterim','Dijital beceri',[2,4],'ok');
addKzR('MAT',8,'MAT.8.1.2','Kareköklü ifadeler','Eleştirel düşünme',[3,5],'ok');
addKzR('MAT',8,'MAT.8.6.1','Veri analizi','Dijital beceri',[4,6],'ok');
addKzR('MAT',8,'MAT.8.7.1','Olasılık','Problem çözme',[6,7],'partial');
addKzR('MAT',8,'MAT.8.3.5','Pisagor bağıntısı','Yaratıcılık',[7,7],'thin');
addKzR('MAT',8,'MAT.8.2.2','Doğrusal fonksiyonlar','Dijital beceri',null,'none');
// 7/A rehberlik kapsamındaki diğer dersler
addKzR('TUR',7,'T.O.7.7','Ana fikir ve çıkarım','Eleştirel düşünme',[0,4],'ok');
addKzR('TUR',7,'T.O.7.4','Söz varlığı','İletişim',[2,6],'ok');
addKzR('TUR',7,'T.Y.7.3','Paragraf yazma','Yaratıcılık',[5,7],'partial');
addKzR('FEN',7,'FB.7.1.1','Uzay teknolojileri','İletişim',[0,3],'ok');
addKzR('FEN',7,'FB.7.2.3','Enerji dönüşümü','Eleştirel düşünme',[3,6],'ok');
addKzR('FEN',7,'FB.7.2.2','Kinetik ve potansiyel enerji','Problem çözme',[6,7],'partial');
addKzR('SOS',7,'SB.7.1.1','Etkili iletişim','İletişim',[0,4],'ok');
addKzR('SOS',7,'SB.7.2.1','Küreselleşme','Eleştirel düşünme',[3,7],'ok');
addKzR('ING',7,'ENG.7.1.S1','School life (speaking)','İletişim',[0,4],'ok');
addKzR('ING',7,'ENG.7.3.V1','Staying healthy and fit','İletişim',[3,7],'ok');
// önceki sınıf ön koşulu (simülasyon)
addKzR('FEN',6,'FB.6.4.5','Işık ve renkler (6. sınıf)','Eleştirel düşünme',null,'none');

const ERR = {
  K:{name:'Kavram / kazanım eksikliği', short:'Kavram', icon:'bulb', subs:['Kavram yanılgısı','Ön koşul eksikliği','Temsil dönüştürme güçlüğü'],
     inter:['Somut örnek ve model kullanımı','Farklı temsil (sayı doğrusu, alan modeli)','Ön koşul kazanım çalışması'], act:'Kavram pekiştirme'},
  I:{name:'İşlem hatası', short:'İşlem', icon:'calc', subs:['İşaret hatası','İşlem sırası hatası','Aktarma / dikkat hatası'],
     inter:['Adım adım uygulama','Kontrol listesiyle çözüm','Benzer işlem pratiği'], act:'İşlem pratiği'},
  S:{name:'Strateji eksikliği', short:'Strateji', icon:'compass', subs:['Problemi modelleme güçlüğü','Yöntem seçimi','Sonucu kontrol etmeme'],
     inter:['Çözüm planı (Anla–Planla–Çöz–Kontrol et)','Yöntem karşılaştırma','Düşünme soruları'], act:'Strateji geliştirme'}
};
const Q_BANK = {
 'MAT7-1':{q:'(−7) − (−3) işleminin sonucu kaçtır?',wrong:'−10 buldu; çıkarmayı ters işaretle toplamaya çevirmedi.',ans:'−4',pref:['I','K']},
 'MAT7-2':{q:'(−6) · (−4) ÷ (−3) işleminin sonucu kaçtır?',wrong:'8 buldu; son bölmede işareti değiştirmedi.',ans:'−8',pref:['I','I','K']},
 'MAT7-3':{q:'−2/3 ve −3/4 sayılarını küçükten büyüğe sıralayınız.',wrong:'−2/3 < −3/4 yazdı; negatif sayılarda büyüklüğü mutlak değere göre yorumladı.',ans:'−3/4 < −2/3',pref:['K','K','S']},
 'MAT7-4':{q:'3/4 + 2/5 işleminin sonucu kaçtır?',wrong:'Payları ve paydaları ayrı ayrı topladı: 5/9.',ans:'23/20',pref:['K','K','I']},
 'MAT7-5':{q:'3x + 2 − x + 5 ifadesini sadeleştiriniz.',wrong:'4x + 7 yazdı; −x terimini toplama olarak aldı.',ans:'2x + 7',pref:['I','K']},
 'MAT7-6':{q:'Bir sayının 2 katının 5 fazlası 17 ise sayı kaçtır?',wrong:'Denklemi 2x − 5 = 17 kurdu; ifadeyi modelleyemedi.',ans:'6',pref:['S','S','I']},
 'MAT7-7':{q:'Bir araç sabit hızla 3 saatte 180 km gidiyor. Aynı hızla 5 saatte kaç km gider?',wrong:'182 km buldu; orantı yerine fark (toplamsal) ilişkisi kurdu.',ans:'300 km',pref:['S','K']},
 'MAT7-8':{q:'Bir tarifte 2 su bardağı una 3 yumurta gerekiyor. 6 su bardağı un için kaç yumurta gerekir?',wrong:'7 yazdı; aradaki farkı ekledi.',ans:'9 yumurta',pref:['S']},
 'MAT8-1':{q:'√2, 0,75, π ve 5/8 sayılarından hangileri irrasyoneldir?',wrong:'0,75’i de seçti; ondalık gösterimi olan her sayıyı irrasyonel sandı.',ans:'√2 ve π',pref:['K','K','S']},
 'MAT8-2':{q:'2⁵ · 2³ ÷ 2⁴ işleminin sonucu kaçtır?',wrong:'2^(5·3−4) yazdı; üsleri çarptı.',ans:'2⁴',pref:['K','I']},
 'MAT8-3':{q:'0,00045 sayısını bilimsel gösterimle yazınız.',wrong:'4,5 · 10⁴ yazdı; üssün işaretini yanlış belirledi.',ans:'4,5 · 10⁻⁴',pref:['I','K']},
 'MAT8-4':{q:'√50 hangi iki ardışık doğal sayı arasındadır?',wrong:'25 ile 26 arasında yazdı; karekökü yarıya bölmeyle karıştırdı.',ans:'7 ile 8',pref:['K','K']},
 'MAT8-5':{q:'Sütun grafiğe göre hangi ay satışlar bir önceki aya göre en çok azalmıştır?',wrong:'En düşük değere sahip ayı seçti; artış-azalışı yorumlamadı.',ans:'Mart',pref:['S','K']},
 'MAT8-6':{q:'Torbada 3 kırmızı, 5 mavi top var. Mavi top çekme olasılığı?',wrong:'5/3 yazdı; tüm çıktıları paydaya yazmadı.',ans:'5/8',pref:['K','I']},
 'MAT8-7':{q:'Dik kenarları 6 cm ve 8 cm olan dik üçgenin hipotenüsü kaç cm’dir?',wrong:'14 cm yazdı; kenar uzunluklarını doğrudan topladı.',ans:'10 cm',pref:['K']},
 'MAT8-8':{q:'y = 2x + 1 doğrusunun grafiğini çiziniz.',wrong:'—',ans:'—',pref:['S']}
};

/* seeded RNG */
function mkRng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const isoAdd=(iso,days)=>{const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)};
const daysBetween=(a,b)=>Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5);

function buildDB(){
  const R = mkRng(20261104);
  const pick = a => a[Math.floor(R()*a.length)];
  const NAMES = [
    ['Mert','Aydın','E'],['Zeynep','Kaya','K'],['Ali','Tekin','E'],['Elif','Yıldız','K'],['Defne','Çelik','K'],['Yusuf','Öztürk','E'],['Ecrin','Arslan','K'],['Kerem','Doğan','E'],
    ['Asya','Kılıç','K'],['Ömer','Aslan','E'],['Nehir','Çetin','K'],['Emir','Kara','E'],['Azra','Koç','K'],['Aras','Kurt','E'],['Ela','Polat','K'],['Çınar','Erdem','E'],
    ['Lina','Güneş','K'],['Efe','Bulut','E'],['Duru','Akın','K'],['Kuzey','Yalçın','E'],['Mira','Korkmaz','K'],['Baran','Tunç','E'],['Ada','Ateş','K'],['Toprak','Sezer','E'],
    ['Eylül','Uçar','K'],['Arda','Duman','E'],['Beren','Bozkurt','K'],['Eymen','Ekinci','E'],['İpek','Kaplan','K'],['Poyraz','Özdemir','E'],['Ayşe Nur','Karaosmanoğlu','K'],['Deniz','Aksu','E']
  ];
  const MOM=['Ayşe','Fatma','Emine','Sevgi','Derya','Gül','Pınar','Esra','Burcu','Melek','Nur','Seda','Hande','Canan','Özlem','Tuba'];
  const DAD=['Mehmet','Ahmet','Mustafa','Hasan','Murat','Serkan','Emre','Burak','Volkan','Cem','Okan','Tolga','Kaan','Levent','Sinan','Abdurrahman'];
  const phone=()=>`(555) 0${Math.floor(10+R()*89)} ${String(Math.floor(R()*100)).padStart(2,'0')} ${String(Math.floor(R()*100)).padStart(2,'0')}`;
  const SKIN=['#F3CDA9','#E5B48E','#C98C64','#F6D7BC','#D9A27A'], HAIR=['#2a1a12','#4a2c1a','#120c08','#7a4a26','#5b3418'], SHIRT=['#810000','#1b1b1b','#5c0000','#3a2a20'];
  const students = NAMES.map((n,i)=>{
    const sec = SECTIONS[Math.floor(i/8)], grade=GRADE_OF(sec);
    let ability = .55+R()*.38;
    const id='s'+(i+1);
    const over={s1:.47,s2:.6,s3:.7,s9:.55,s18:.58,s26:.5,s4:.74,s21:.86};
    if(over[id]) ability=over[id];
    const twoParents = R()<.3 || id==='s31' || id==='s5';
    const momFirst = R()<.6;
    const p1 = momFirst?{name:MOM[i%16]+' '+n[1],rel:'Anne'}:{name:DAD[i%16]+' '+n[1],rel:'Baba'};
    const parents=[{...p1,phone:phone(),email:(p1.name.split(' ')[0]).toLocaleLowerCase('tr')+'.'+i+'@veli.demo'}];
    if(id==='s31'){parents[0]={name:'Abdurrahman Karaosmanoğlu',rel:'Baba',phone:phone(),email:'a.karaosmanoglu@veli.demo'}}
    if(twoParents){const p2=momFirst?{name:DAD[(i+5)%16]+' '+n[1],rel:'Baba'}:{name:MOM[(i+3)%16]+' '+n[1],rel:'Anne'};parents.push({...p2,phone:phone(),email:p2.name.split(' ')[0].toLocaleLowerCase('tr')+'.'+i+'b@veli.demo'})}
    const by = grade===7?2013+(R()<.75?1:0):2012+(R()<.75?1:0);
    const fs = R(), fp=R();
    return {id,no:String(1201+i*7+Math.floor(R()*5)),first:n[0],last:n[1],g:n[2],section:sec,grade,
      birth:`${by}-${String(1+Math.floor(R()*12)).padStart(2,'0')}-${String(1+Math.floor(R()*27)).padStart(2,'0')}`,
      phone:phone(), email:n[0].toLocaleLowerCase('tr').replace(/\s/g,'')+'.'+n[1].toLocaleLowerCase('tr').slice(0,3)+'@ogrenci.demo',
      parents, ability, district:pick(['Bakırköy','Bahçelievler','Zeytinburnu','Güngören']), status:'Aktif',
      look:{skin:pick(SKIN),hair:pick(HAIR),shirt:pick(SHIRT),bg:['#F6ECDB','#EFDDBF','#F3E3C9','#EAD2AC'][i%4]},
      form:{student: fs<.72?'done':fs<.88?'pend':'miss', parent: fp<.66?'done':fp<.86?'pend':'miss'},
      tests:{calisma: R()<.7?'done':R()<.6?'pend':'miss', ilgi: grade===8?(R()<.6?'done':'pend'):(R()<.3?'done':'miss')},
      lastLogin: id==='s2'?9:Math.floor(R()*4), part:0
    };
  });
  students.find(s=>s.id==='s1').form.student='done';
  // measures
  const measures={};
  const visibleFor = s => visibleCourses(s.section);
  students.forEach(s=>{
    measures[s.id]={};
    KZ.filter(k=>k.grade===s.grade && visibleFor(s).includes(k.course)).forEach(k=>{
      if(k.state==='none') return;
      if(k.state==='thin' && R()<.82) return;
      if(k.state==='partial' && R()<.35) return;
      let ease = {'MAT7-4':-14,'MAT7-6':-8,'MAT7-3':-6,'MAT8-1':-9,'MAT8-4':-7,'MAT8-2':-3}[k.id]||0;
      if(k.id==='MAT7-4' && s.section==='7/A') ease-=4;
      if(k.id==='MAT8-5' && s.section==='8/B') ease-=10;
      const n = k.state==='thin'?1:(k.state==='partial'?1+Math.floor(R()*2):2+Math.floor(R()*3));
      const arr=[];
      for(let j=0;j<n;j++){
        const w = Math.min(7, k.win[0]+Math.floor((k.win[1]-k.win[0]+1)*(j/n)) + (R()<.4?1:0));
        let sc = s.ability*100 + ease + (R()-.5)*16 + j*3;
        if(s.id==='s3' && k.course==='MAT' && w>=5) sc -= 16;
        if(s.id==='s1' && k.course==='MAT') sc -= 8;
        arr.push({d:isoAdd(WEEKS[w],1+Math.floor(R()*4)),s:Math.round(Math.max(8,Math.min(100,sc))),src:pick(['Uyarlanabilir set','Çıkış kartı','Kısa ölçüm','Ünite testi'])});
      }
      arr.sort((a,b)=>a.d<b.d?-1:1);
      measures[s.id][k.id]=arr;
    });
  });
  // errors
  const errors=[]; let eid=1;
  students.forEach(s=>{
    Object.entries(measures[s.id]).map(([kid,arr])=>({kid,arr,mv:arr.slice(-3).reduce((a,b)=>a+b.s,0)/Math.min(3,arr.length)})).filter(x=>x.kid.startsWith('MAT')&&x.mv<64).sort((a,b)=>a.mv-b.mv).slice(0,3).forEach(({kid,arr,mv})=>{
      const bank=Q_BANK[kid]; const nErr = mv<46?2:1;
      const used=new Set();
      for(let j=0;j<nErr;j++){
        let t = bank.pref[Math.floor(R()*bank.pref.length)]; if(used.has(t)) t = ['K','I','S'].find(x=>!used.has(x)); used.add(t);
        const count = mv<45?3+Math.floor(R()*2):1+Math.floor(R()*2.6);
        const dates = Array.from({length:count},(_,q)=>arr[Math.min(arr.length-1,q)]?.d||arr[0].d).map((d,q)=>isoAdd(d,q));
        errors.push({id:'e'+(eid++),sid:s.id,kz:kid,type:t,sub:ERR[t].subs[Math.floor(R()*3)],count,dates,
          q:bank.q,step:t===(bank.pref[0])?bank.wrong:altStep(t,bank),ans:bank.ans,
          evidence: count>=3?'Güçlü':count===2?'Orta':'Zayıf',
          alts: altExpl(t), inter: ERR[t].inter[Math.floor(R()*3)], status:'Açık', post:null, history:[{d:dates[dates.length-1],t:'Sistem örüntüyü tespit etti'}], teacherNote:''});
      }
    });
  });
  function altStep(t,b){return t==='K'?'Kavramsal temsil hatası: '+b.wrong:t==='I'?'İşlem adımında hata: '+b.wrong:'Çözüm planı eksik: '+b.wrong}
  function altExpl(t){return {K:['İşlem dikkatsizliği olabilir — benzer işlemli sorularda doğru','Soru kökünü yanlış okuma'],I:['Kavram eksikliği olabilir — açıklama istendiğinde gerekçe veremedi','Süre baskısı'],S:['Okuduğunu anlama güçlüğü','Ön koşul kavram eksikliği']}[t]}
  // activities
  const A=(o)=>o;
  const acts=[
    A({id:'a1',title:'Kesirlerle toplama – alan modeli',type:'Kavram pekiştirme',course:'MAT',sections:['7/A'],kz:['MAT7-4'],src:'Öğretmen',created:'2026-10-27',due:'2026-11-06',status:'Atandı',needsEval:false}),
    A({id:'a2',title:'Tam sayılar uyarlanabilir set',type:'Uyarlanabilir soru çalışması',course:'MAT',sections:['7/A','7/B'],kz:['MAT7-1','MAT7-2'],src:'Sistem',created:'2026-10-20',due:'2026-11-03',status:'Atandı',needsEval:false}),
    A({id:'a3',title:'Rasyonel sayılar · aralıklı tekrar (2. hafta)',type:'Aralıklı tekrar',course:'MAT',sections:['7/B'],kz:['MAT7-3'],src:'Sistem',created:'2026-10-26',due:'2026-11-09',status:'Atandı',needsEval:false,interval:'2 hafta'}),
    A({id:'a4',title:'Üslü ifadeler adım adım pratik',type:'İşlem pratiği',course:'MAT',sections:['8/A'],kz:['MAT8-2'],src:'Öğretmen',created:'2026-10-22',due:'2026-11-02',status:'Atandı',needsEval:false}),
    A({id:'a5',title:'Rasyonel mi irrasyonel mi? karar kartları',type:'Strateji geliştirme',course:'MAT',sections:['8/B'],kz:['MAT8-1'],src:'Öğretmen',created:'2026-10-24',due:'2026-11-05',status:'Atandı',needsEval:true}),
    A({id:'a6',title:'Oran-orantı infografiği',type:'Dijital Ürün Stüdyosu',product:'İnfografik',course:'MAT',sections:['7/A'],kz:['MAT7-7'],src:'Öğretmen',created:'2026-10-21',due:'2026-11-03',status:'Atandı',needsEval:true}),
    A({id:'a7',title:'Okul anketi: veri sunumu',type:'Dijital Ürün Stüdyosu',product:'Sunum',course:'MAT',sections:['8/A'],kz:['MAT8-5'],src:'Öğretmen',created:'2026-10-19',due:'2026-11-01',status:'Atandı',needsEval:true}),
    A({id:'a8',title:'Ünite 1 Sıfır Hata',type:'Ünite sonu Sıfır Hata',course:'MAT',sections:['7/A'],kz:['MAT7-1','MAT7-2'],src:'Sistem',created:'2026-10-01',due:'2026-10-10',status:'Tamamlandı',needsEval:false}),
    A({id:'a9',title:'Gerçek sayılar uyarlanabilir set',type:'Uyarlanabilir soru çalışması',course:'MAT',sections:['8/B'],kz:['MAT8-1'],src:'Sistem',created:'2026-09-28',due:'2026-10-08',status:'Tamamlandı',needsEval:false}),
    A({id:'a10',title:'Karekök tahmin oyunu',type:'Kavram pekiştirme',course:'MAT',sections:['8/A','8/B'],kz:['MAT8-4'],src:'Öğretmen',created:'2026-10-28',due:'2026-11-07',status:'Atandı',needsEval:false}),
    A({id:'a11',title:'Cebirsel ifadeler kavram kartları',type:'Kavram pekiştirme',course:'MAT',sections:['7/B'],kz:['MAT7-5'],src:'Öğretmen',created:'2026-11-02',due:'2026-11-12',status:'Taslak',needsEval:false}),
    A({id:'a12',title:'Pisagor bağıntısı: basit kodlama ile model',type:'Dijital Ürün Stüdyosu',product:'Basit kodlama',course:'MAT',sections:['8/B'],kz:['MAT8-7'],src:'Öğretmen',created:'2026-10-12',due:'2026-10-24',status:'Arşiv',needsEval:true})
  ];
  acts.forEach(a=>{
    a.targets = students.filter(s=>a.sections.includes(s.section)).map(s=>s.id);
    a.subs={};
    a.targets.forEach(sid=>{
      const s=students.find(x=>x.id===sid);
      if(a.status==='Taslak'){return}
      const r=R(); const done = a.status!=='Atandı' ? r<.92 : r < .35+s.ability*.6;
      const prog = !done && r<.85;
      const st = done?'tamamladı':prog?'devam':'başlamadı';
      const sub={state:st};
      if(done){sub.score=Math.round(Math.max(30,Math.min(100,s.ability*100+(R()-.5)*20)));sub.date=isoAdd(a.created,2+Math.floor(R()*7));
        if(a.needsEval){sub.evaluated = a.status!=='Atandı' || R()<.25; sub.rubric=[1,2,3,4].map(()=>Math.max(1,Math.min(4,Math.round(s.ability*4+(R()-.5)*1.4))));}
      }
      a.subs[sid]=sub;
    });
  });
  // participation
  students.forEach(s=>{const my=acts.filter(a=>a.status!=='Taslak'&&a.targets.includes(s.id));const ok=my.filter(a=>a.subs[s.id].state!=='başlamadı').length;s.part=my.length?Math.round(ok/my.length*100):100;if(s.id==='s2')s.part=40;if(s.id==='s18')s.part=50});
  // alerts
  const alerts=[]; let aid=1;
  const avgM=(sid,course)=>{const v=Object.entries(measures[sid]).filter(([k])=>!course||k.startsWith(course)).map(([,a])=>a.slice(-3).reduce((x,y)=>x+y.s,0)/Math.min(3,a.length));return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
  students.forEach(s=>{
    const myErr=errors.filter(e=>e.sid===s.id); const am=avgM(s.id,'MAT');
    if(am<55 || (myErr.length>=4 && am<62)){
      const e0=myErr.sort((a,b)=>b.count-a.count)[0];
      alerts.push({id:'al'+(aid++),sid:s.id,cat:'risk',course:'MAT',signal:`%${Math.round(am)} doğruluk · ${myErr.length} hata örüntüsü`,reason:'Birden fazla kazanımda düşük yeterlik ve tekrarlayan hata',kz:e0?e0.kz:null,date:isoAdd(TODAY,-Math.floor(R()*5)),prio:am<50?'Yüksek':'Orta',status:'Yeni',action:e0?ERR[e0.type].act+' etkinliği':'Görüşme planla',etype:e0?e0.type:null,history:[]});
    }
    // drop
    const lastMat = Object.entries(measures[s.id]).filter(([k])=>k.startsWith('MAT')).map(([k,a])=>({k,a})).filter(x=>x.a.length>=2);
    lastMat.forEach(x=>{const d=x.a[x.a.length-1].s-x.a[x.a.length-2].s; if(d<=-16 && alerts.filter(a=>a.sid===s.id&&a.cat==='dusus').length===0) alerts.push({id:'al'+(aid++),sid:s.id,cat:'dusus',course:'MAT',signal:`${d} puan düşüş`,reason:`Karşılaştırılabilir iki ölçüm: ${x.a[x.a.length-2].s} → ${x.a[x.a.length-1].s} (${x.a[x.a.length-1].src})`,kz:x.k,date:x.a[x.a.length-1].d,prio:d<=-22?'Yüksek':'Orta',status:'Yeni',action:'Hata kanıtlarını incele, kısa ölçüm ata',etype:null,history:[]})});
    if(s.part<60 || s.lastLogin>=7){
      alerts.push({id:'al'+(aid++),sid:s.id,cat:'katilim',course:'MAT',signal:s.lastLogin>=7?`${s.lastLogin} gün giriş yok`:`%${s.part} katılım`,reason:s.lastLogin>=7?'Son giriş 7 günden eski; 2 etkinliğe başlamadı':'Beklenen etkinliklerin yarısından azına başladı',kz:null,date:isoAdd(TODAY,-1),prio:s.lastLogin>=7?'Yüksek':'Orta',status:'Yeni',action:'Görüşme veya veli geri bildirimi taslağı',etype:null,history:[]});
    }
  });
  // ensure doc examples exist (Ali Tekin drop)
  if(!alerts.find(a=>a.sid==='s3'&&a.cat==='dusus')) alerts.push({id:'al'+(aid++),sid:'s3',cat:'dusus',course:'MAT',signal:'−14 puan düşüş',reason:'Ünite testleri: 72 → 58 (Kesirlerle toplama ve çıkarma)',kz:'MAT7-4',date:'2026-11-02',prio:'Orta',status:'Yeni',action:'Kesirler hata kanıtlarını incele',etype:null,history:[]});
  const st=['Yeni','İnceleniyor','Müdahale Atandı','Kontrol Bekleniyor','Yeni','Yeni','İnceleniyor'];
  alerts.forEach((a,i)=>{a.status=st[i%st.length]; if(a.prio==='Orta'&&R()<.3)a.prio='Düşük'; if(a.status!=='Yeni')a.history.push({d:isoAdd(a.date,1),t:'Öğretmen inceledi'}); if(a.status==='Müdahale Atandı'||a.status==='Kontrol Bekleniyor')a.history.push({d:isoAdd(a.date,2),t:'Müdahale atandı: '+a.action});});
  // weekly dimension series (dijital, 21yy) per section
  const dims={};
  SECTIONS.forEach((sec,si)=>{dims[sec]={dij:[],yy:[]};let b1=58+si*3+R()*6,b2=55+R()*8;for(let w=0;w<8;w++){b1+= (R()-.35)*4; b2+=(R()-.4)*3.5; dims[sec].dij.push({v:Math.round(b1),n:6+Math.floor(R()*5)}); dims[sec].yy.push({v:Math.round(b2),n:4+Math.floor(R()*5)})}});
  // tests & exams
  const tests=[
    {id:'t1',name:'Kesirler tanılayıcı test',kind:'Tanılayıcı',course:'MAT',sections:['7/A','7/B'],kz:['MAT7-3','MAT7-4'],date:'2026-10-23',status:'Uygulandı',nq:6},
    {id:'t2',name:'Tam sayılar çıkış kartı',kind:'Ders içi kısa ölçüm',course:'MAT',sections:['7/A'],kz:['MAT7-1','MAT7-2'],date:'2026-10-02',status:'Uygulandı',nq:4},
    {id:'t3',name:'Üslü ifadeler kısa ölçüm',kind:'Ders içi kısa ölçüm',course:'MAT',sections:['8/A','8/B'],kz:['MAT8-2','MAT8-3'],date:'2026-10-16',status:'Uygulandı',nq:5},
    {id:'t4',name:'Denklem ön test',kind:'Tanılayıcı',course:'MAT',sections:['7/A','7/B'],kz:['MAT7-6'],date:'2026-11-10',status:'Planlandı',nq:5}
  ];
  const exams=[
    {id:'x1',name:'1. Yazılı · 7. sınıf Matematik',grade:7,sections:['7/A','7/B'],date:'2026-11-18',dur:40,status:'Planlandı',kz:['MAT7-1','MAT7-2','MAT7-3','MAT7-4','MAT7-5','MAT7-6'],nq:12},
    {id:'x2',name:'Ortak Sınav · 8. sınıf Ünite 1–2',grade:8,sections:['8/A','8/B'],date:'2026-10-21',dur:40,status:'Sonuçlandı',kz:['MAT8-1','MAT8-2','MAT8-3'],nq:10},
    {id:'x3',name:'Ortak Sınav · 7. sınıf Ünite 1',grade:7,sections:['7/A','7/B'],date:'2026-10-09',dur:40,status:'Sonuçlandı',kz:['MAT7-1','MAT7-2'],nq:10}
  ];
  // question items for tests/exams
  const items={};
  [...tests,...exams].forEach(t=>{
    const tgt=students.filter(s=>t.sections.includes(s.section));
    items[t.id]=Array.from({length:t.nq},(_,qi)=>{
      const kid=t.kz[qi%t.kz.length]; const bank=Q_BANK[kid]; const correct='ABCD'[Math.floor(R()*4)];
      const diff = .35+R()*.5;
      const resp={}; const dist={A:0,B:0,C:0,D:0,Boş:0};
      const done = t.status==='Planlandı'?[]:tgt;
      done.forEach(s=>{const pc=Math.max(.1,Math.min(.96,s.ability*1.05+(diff-.6)*.45)); let ch; if(R()<.05) ch='Boş'; else if(R()<pc) ch=correct; else {const w='ABCD'.replace(correct,''); ch=R()<.6?w[0]:w[1+Math.floor(R()*2)]} dist[ch]++; resp[s.id]={c:ch,t:Math.round(35+R()*80)}});
      return {n:qi+1,kz:kid,stem:qi%2===0?bank.q:bank.q.replace('kaçtır','nedir'),correct,dist,resp,distractor:'ABCD'.replace(correct,'')[0],note:bank.wrong};
    });
  });
  // content library
  const content=[
    {id:'c1',title:'Kesirlerle toplama: alan modeliyle açıklama',type:'Açıklama',course:'MAT',grade:7,kz:'MAT7-4',source:'Kurum',ver:3,updated:'2026-10-12',body:'Paydaları farklı iki kesri toplarken önce kesirleri aynı bütüne göre ifade ederiz. 3/4 ve 2/5 için ortak bütün 20 eş parçadır: 15/20 + 8/20 = 23/20.'},
    {id:'c2',title:'3/4 + 2/5 örnek çözüm',type:'Örnek çözüm',course:'MAT',grade:7,kz:'MAT7-4',source:'Öğretmen',ver:2,updated:'2026-10-26',body:'1) Paydaları eşitle: 4 ve 5 için 20. 2) 3/4 = 15/20, 2/5 = 8/20. 3) Payları topla: 23/20. 4) Kontrol: 23/20 > 1 mi? 3/4 + 2/5 yaklaşık 0,75 + 0,4 = 1,15 → mantıklı.'},
    {id:'c3',title:'Doğru orantı problemleri çözüm videosu',type:'Çözüm videosu',course:'MAT',grade:7,kz:'MAT7-7',source:'Kurum',ver:1,updated:'2026-10-30',body:'4 dk 20 sn · Yol–zaman ilişkisi tablo ve grafik üzerinden gösterilir; oranın sabit kaldığı vurgulanır.'},
    {id:'c4',title:'Denklem kurma: 5 bağlam sorusu',type:'Soru',course:'MAT',grade:7,kz:'MAT7-6',source:'AI taslağı',ver:1,updated:'2026-11-03',body:'1) Bir sayının 3 katının 4 eksiği 20 ise sayı kaçtır? 2) Ece\'nin yaşının 2 katı ile 7\'nin toplamı 33\'tür… (5 soru, AI taslağı — öğretmen onayı bekliyor)'},
    {id:'c5',title:'Rasyonel mi irrasyonel mi? karar kartı',type:'Etkinlik yönergesi',course:'MAT',grade:8,kz:'MAT8-1',source:'Öğretmen',ver:2,updated:'2026-10-18',body:'Sayı iki tam sayının oranı (a/b) olarak yazılabiliyorsa rasyonel, yazılamıyorsa irrasyoneldir. Öğrenciler 6 sayı kartını iki kutuya ayırır ve gerekçesini yazar.'},
    {id:'c6',title:'Bilimsel gösterim alıştırma seti',type:'Soru',course:'MAT',grade:8,kz:'MAT8-3',source:'Kurum',ver:4,updated:'2026-10-08',body:'12 soru · kolaydan zora · negatif üslü örnekler ağırlıklı.'},
    {id:'c7',title:'Karekök tahmini sayı doğrusu',type:'Açıklama',course:'MAT',grade:8,kz:'MAT8-4',source:'AI taslağı',ver:1,updated:'2026-11-01',body:'√50 değerini 49 ve 64 tam karelerinin arasında konumlandır: 7 < √50 < 8; 50, 49\'a daha yakın olduğu için √50 ≈ 7,07.'},
    {id:'c8',title:'Okul anketi veri sunumu yönergesi',type:'Etkinlik yönergesi',course:'MAT',grade:8,kz:'MAT8-5',source:'Öğretmen',ver:1,updated:'2026-10-19',body:'Gruplar 20 kişilik anket verisini sütun ve çizgi grafiğe dönüştürür; en az iki karşılaştırma cümlesi yazar.'}
  ];
  content.forEach(c=>c.history=[{v:c.ver,d:c.updated,by:c.source==='AI taslağı'?'AI taslağı':c.source==='Kurum'?'Kurum zümresi':'Selin Yılmaz',body:c.body}]);
  const goals=[
    {id:'g1',goal:'Paydaları farklı kesirlerle toplama yapar ve sonucu tahminle kontrol eder.',crit:'5 sorudan en az 4\'ünde doğru sonuç + tahmin cümlesi',kz:'MAT7-4',act:'Kesirlerle toplama – alan modeli',method:'Çıkış kartı + kontrol ölçümü',skills:['Problem çözme','Eleştirel düşünme']},
    {id:'g2',goal:'Orantılı durumları tabloyla modelleyip çözüm yolunu açıklar.',crit:'Tablo + doğru sonuç + gerekçe (rubrik 3/4)',kz:'MAT7-7',act:'Oran-orantı infografiği',method:'Dijital ürün rubriği',skills:['Problem çözme','İletişim','Dijital beceri']},
    {id:'g3',goal:'Bir sayının rasyonel ya da irrasyonel olduğuna gerekçeli karar verir.',crit:'6 karttan 5\'inde doğru sınıflama',kz:'MAT8-1',act:'Rasyonel mi irrasyonel mi? karar kartları',method:'Strateji gözlem formu',skills:['Eleştirel düşünme','Problem çözme']},
    {id:'g4',goal:'Anket verisini uygun grafikle sunar ve iki karşılaştırma yapar.',crit:'Sunum rubriği ≥ 12/16',kz:'MAT8-5',act:'Okul anketi: veri sunumu',method:'Dijital ürün rubriği + akran değerlendirme',skills:['Dijital beceri','İletişim','İş birliği']},
    {id:'g5',goal:'Pisagor bağıntısını kare alanlarıyla veya kodla görselleştirir.',crit:'Model doğru + açıklama',kz:'MAT8-7',act:'Pisagor bağıntısı: basit kodlama ile model',method:'Dijital ürün rubriği',skills:['Yaratıcılık','Dijital beceri']}
  ];
  const notifs=[
    {id:'n1',type:'Teslim',text:'Oran-orantı infografiği için 3 yeni teslim',sec:'7/A',d:'2026-11-04',read:false,to:'activities/degerlendirilecek'},
    {id:'n2',type:'Risk eşiği',text:'Mert Aydın destek önceliği eşiğini aştı (%42 doğruluk)',sec:'7/A',d:'2026-11-04',read:false,to:'attention/riskli'},
    {id:'n3',type:'Bekleyen değerlendirme',text:'Rasyonel mi irrasyonel mi? karar kartları: değerlendirme bekleyen teslimler var',sec:'8/B',d:'2026-11-03',read:false,to:'activities/degerlendirilecek'},
    {id:'n4',type:'Tekrar zamanı',text:'Rasyonel sayılar aralıklı tekrar (1 ay) 9 Kasım\'da açılacak',sec:'7/B',d:'2026-11-03',read:true,to:'activities/tum'},
    {id:'n5',type:'İdare duyurusu',text:'Zümre toplantısı 7 Kasım Cuma 15:30, öğretmenler odası',sec:'',d:'2026-11-02',read:false,to:null},
    {id:'n6',type:'Teslim',text:'Okul anketi veri sunumu: 5 teslim tamamlandı',sec:'8/A',d:'2026-11-01',read:true,to:'activities/degerlendirilecek'},
    {id:'n7',type:'Risk eşiği',text:'Zeynep Kaya 9 gündür giriş yapmadı',sec:'7/A',d:'2026-11-03',read:false,to:'attention/katilim'},
    {id:'n8',type:'İdare duyurusu',text:'1. dönem yazılı sınav takvimi yayımlandı',sec:'',d:'2026-10-28',read:true,to:'assessments/sinavlar'},
    {id:'n9',type:'Tekrar zamanı',text:'Tam sayılar 2 haftalık tekrar seti hazır — atama bekliyor',sec:'7/A',d:'2026-10-30',read:true,to:'activities/yeni'}
  ];
  const threads=[
    {id:'m1',sid:'s2',who:'parent',pi:0,msgs:[{f:'them',t:'Merhaba hocam, Zeynep bu hafta biraz hastaydı, etkinliklere giremedi.',d:'2026-11-02 19:40'},{f:'me',t:'Geçmiş olsun. Döndüğünde kesirler etkinliğini birlikte planlayalım.',d:'2026-11-03 08:15'}],unread:false},
    {id:'m2',sid:'s1',who:'parent',pi:0,msgs:[{f:'them',t:'Mert evde kesirlerde zorlanıyor, nasıl destek olabiliriz?',d:'2026-11-03 21:05'}],unread:true},
    {id:'m3',sid:'s9',who:'student',msgs:[{f:'them',t:'Hocam infografikte kaynak göstermem gerekiyor mu?',d:'2026-11-03 17:22'}],unread:true},
    {id:'m4',sid:'s18',who:'parent',pi:0,msgs:[{f:'me',t:'Efe\'nin son iki etkinliğe başlamadığını görüyorum, birlikte bakabilir miyiz?',d:'2026-10-30 12:10'},{f:'them',t:'Tabii, bu akşam konuşacağız.',d:'2026-10-30 18:44'}],unread:false},
    {id:'m5',sid:'s26',who:'student',msgs:[{f:'them',t:'Rasyonel-irrasyonel karar kartımı yükledim.',d:'2026-11-01 16:02'}],unread:false}
  ];
  const meetings=[
    {id:'mt1',sid:'s1',d:'2026-11-05',time:'15:30',kind:'Veli görüşmesi',note:'Kesirler desteği'},
    {id:'mt2',sid:'s2',d:'2026-11-06',time:'12:40',kind:'Öğrenci görüşmesi',note:'Katılım planı'},
    {id:'mt3',sid:'s3',d:'2026-11-10',time:'10:00',kind:'Veli görüşmesi',note:'Düşüş nedenleri'}
  ];
  const observations=[
    {id:'o1',sid:'s1',d:'2026-10-29',text:'Kesir modellerini kullanınca doğru çözüyor; sembolik gösterime geçişte zorlanıyor.',by:'Selin Yılmaz'},
    {id:'o2',sid:'s4',d:'2026-10-24',text:'Grup çalışmasında çözüm yolunu arkadaşlarına açık biçimde anlattı.',by:'Selin Yılmaz'},
    {id:'o3',sid:'s3',d:'2026-11-02',text:'Son haftalarda derse geç katılıyor; ödev teslimleri düzensiz.',by:'Selin Yılmaz'}
  ];
  const schedule=[
    {time:'08:40',sec:'7/A',course:'MAT',topic:'Kesirlerle toplama ve çıkarma',kz:'MAT7-4'},
    {time:'09:30',sec:'7/A',course:'MAT',topic:'Kesirler · çıkış kartı',kz:'MAT7-4'},
    {time:'11:20',sec:'8/B',course:'MAT',topic:'Ünite 2 tekrarı · Üslü ifadeler',kz:'MAT8-2'},
    {time:'13:50',sec:'7/B',course:'MAT',topic:'Cebirsel ifadeler',kz:'MAT7-5'},
    {time:'14:40',sec:'8/A',course:'MAT',topic:'Veri analizi · grafik yorumlama',kz:'MAT8-5'}
  ];
  return {v:5,students,measures,errors,acts,alerts,dims,tests,exams,items,content,goals,notifs,threads,meetings,observations,schedule,
    groups:{},drafts:[],reports:[],reportNotes:[],
    settings:{riskTh:55,partTh:60,sens:'Orta',actDays:7,defSections:[],openGuidance:true,notifEmail:true,notifPush:true,digest:'Günlük'},
    visited:{}, riskBaseline:3};
}
