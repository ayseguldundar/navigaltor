/* ================= SORU–CEVAP DÜZENLEYİCİ (Yeni Etkinlik) ================= */
const DISTR={
 'MAT7-1':['−4','−10','4','10'],'MAT7-2':['−8','8','−2','2'],'MAT7-3':['−3/4 < −2/3','−2/3 < −3/4','İkisi eşittir','Karşılaştırılamaz'],
 'MAT7-4':['23/20','5/9','5/20','1'],'MAT7-5':['2x + 7','4x + 7','2x + 3','3x + 7'],'MAT7-6':['6','11','8,5','12'],
 'MAT7-7':['300 km','182 km','270 km','360 km'],'MAT7-8':['9 yumurta','7 yumurta','12 yumurta','6 yumurta'],
 'MAT8-1':['√2 ve π','0,75 ve π','Yalnız √2','5/8 ve √2'],'MAT8-2':['2⁴','2¹¹','2⁻⁴','2²'],'MAT8-3':['4,5 · 10⁻⁴','4,5 · 10⁴','45 · 10⁻⁵','4,5 · 10⁻³'],
 'MAT8-4':['7 ile 8','25 ile 26','6 ile 7','8 ile 9'],'MAT8-5':['Mart','Ocak','Nisan','Şubat'],'MAT8-6':['5/8','5/3','3/8','1/5'],
 'MAT8-7':['10 cm','14 cm','48 cm','100 cm'],'MAT8-8':['(0,1) ve (1,3)','(0,2) ve (1,1)','(1,0) ve (0,1)','(0,0) ve (1,2)']
};
const L4='ABCD';
function bankQ(kid,i=0){const b=Q_BANK[kid],d=DISTR[kid];if(!b||!d)return {kind:'mc',kz:kid,q:'',opts:['','','',''],correct:'A',sol:''};const pos=i%4;const opts=d.slice(1);opts.splice(pos,0,d[0]);return {kind:'mc',kz:kid,q:b.q,opts,correct:L4[pos],ans:b.ans,sol:`Doğru cevap: ${b.ans}. Sık yapılan hata: ${b.wrong}`}}
function initQs(W){
  if(W.questions)return;
  if(W.type==='Dijital Ürün Stüdyosu'){const k=W.kz[0];const b=Q_BANK[k];W.questions=[{kind:'open',kz:k,q:b?b.q:'Ürününde ele alacağın soruyu yaz.',ans:b?b.ans:'',sol:'Ürününde bu sorunun çözümünü ve kontrol adımını göster.'}];return}
  const ks=W.kz.filter(k=>Q_BANK[k]);
  W.questions=ks.length?ks.map((k,i)=>bankQ(k,i)):[{kind:'mc',kz:W.kz[0],q:'',opts:['','','',''],correct:'A',sol:''}];
}
const qValid=q=>q.q.trim()&&(q.kind==='open'?(q.ans||'').trim():q.opts.every(o=>o.trim()));
function qEditor(W){
  initQs(W);const bad=UI.qBad;
  const poolKz=KZ.filter(k=>k.course===W.course&&Q_BANK[k.id]&&(!W.kz.length||W.kz.some(x=>kzOf(x).grade===k.grade)));
  return `<div style="margin-top:16px"><div class="row"><div class="sp"><div class="lab">Sorular ve cevaplar · ${W.questions.length} soru</div><div class="meta">Soru kökünü, seçenekleri, doğru cevabı ve öğrenci yanlış yaptığında gösterilecek çözümü düzenleyin.</div></div></div>
  <div class="col" style="gap:12px;margin-top:10px">${W.questions.map((q,i)=>{const miss=bad&&!qValid(q);return `<div class="card qcard ${miss?'qbad':''}" style="padding:14px">
    <div class="row"><span class="pill p-ink">Soru ${i+1}</span>${seg('qk'+i,[['mc','Çoktan seçmeli'],['open','Açık uçlu']],q.kind,'qKind')}${q.kz?`<span class="meta">${kzOf(q.kz).topic}</span>`:''}<span class="sp"></span>
     <button class="btn xs ghost" data-act="qMove" data-v="${i}|-1" ${i===0?'disabled':''} aria-label="Soruyu yukarı taşı">↑</button><button class="btn xs ghost" data-act="qMove" data-v="${i}|1" ${i===W.questions.length-1?'disabled':''} aria-label="Soruyu aşağı taşı">↓</button><button class="btn xs ghost" data-act="qDup" data-v="${i}">${ic('copy',13)} Çoğalt</button><button class="btn xs ghost" data-act="qDel" data-v="${i}" ${W.questions.length<2?'disabled':''}>${ic('x',13)} Sil</button></div>
    <div class="fld" style="margin-top:10px"><label for="qq${i}">Soru kökü</label><textarea class="ta" id="qq${i}" style="min-height:64px" data-inp="qField" data-i="${i}" data-f="q" placeholder="Soruyu yazın">${esc(q.q)}</textarea></div>
    ${q.kind==='mc'?`<div class="lab" style="margin-top:10px">Seçenekler <span class="meta">· doğru cevabı işaretleyin</span></div><div class="grid g2" style="gap:8px;margin-top:6px">${q.opts.map((o,j)=>`<label class="opt-row ${q.correct===L4[j]?'ok':''}"><input type="radio" name="qc${i}" data-chg="qCorrect" data-i="${i}" value="${L4[j]}" ${q.correct===L4[j]?'checked':''} aria-label="${L4[j]} doğru cevap"><span class="ol">${L4[j]}</span><input class="in" data-inp="qOpt" data-i="${i}" data-o="${j}" value="${esc(o)}" placeholder="Seçenek ${L4[j]}" aria-label="Seçenek ${L4[j]}"></label>`).join('')}</div>`:
     `<div class="fld" style="margin-top:10px"><label for="qa${i}">Beklenen cevap</label><input class="in" id="qa${i}" data-inp="qField" data-i="${i}" data-f="ans" value="${esc(q.ans||'')}" placeholder="Doğru cevap veya cevap anahtarı"></div>`}
    <div class="fld" style="margin-top:10px"><label for="qs${i}">Çözüm / açıklama <span class="meta">· yanlış cevapta öğrenciye gösterilir</span></label><textarea class="ta" id="qs${i}" style="min-height:56px" data-inp="qField" data-i="${i}" data-f="sol">${esc(q.sol||'')}</textarea></div>
    ${miss?`<div class="ferr" style="margin-top:6px">Bu soruda boş alan var: soru kökü ve ${q.kind==='mc'?'dört seçenek':'beklenen cevap'} gerekli.</div>`:''}</div>`}).join('')}</div>
  <div class="row" style="margin-top:10px"><button class="btn sm sec" data-act="qAdd">${ic('plus',14)} Boş soru ekle</button>${poolKz.length?`<select class="sel" style="width:auto" data-chg="qFromBank" aria-label="Soru havuzundan ekle"><option value="">+ Soru havuzundan ekle</option>${poolKz.map(k=>`<option value="${k.id}">${esc(k.topic)}</option>`).join('')}</select>`:''}</div></div>`;
}
Object.assign(ACT,{
  qField:t=>{UI.wiz.questions[+t.dataset.i][t.dataset.f]=t.value;t.closest('.qcard')&&t.closest('.qcard').classList.remove('qbad')},
  qOpt:t=>{UI.wiz.questions[+t.dataset.i].opts[+t.dataset.o]=t.value},
  qCorrect:t=>{const q=UI.wiz.questions[+t.dataset.i];q.correct=t.value;$$(`[name=qc${t.dataset.i}]`).forEach(r=>r.closest('.opt-row').classList.toggle('ok',r.checked))},
  qKind:el=>{const i=+el.dataset.k.slice(2);const q=UI.wiz.questions[i];q.kind=el.dataset.v;if(q.kind==='mc'&&!q.opts)q.opts=['','','',''];if(q.kind==='open'&&!q.ans&&q.opts)q.ans=q.opts[L4.indexOf(q.correct)]||'';render()},
  qMove:el=>{const[i,d]=el.dataset.v.split('|').map(Number);const a=UI.wiz.questions;[a[i],a[i+d]]=[a[i+d],a[i]];render()},
  qDup:el=>{const a=UI.wiz.questions;const i=+el.dataset.v;a.splice(i+1,0,JSON.parse(JSON.stringify(a[i])));render();toast('Soru çoğaltıldı')},
  qDel:el=>{const a=UI.wiz.questions;const i=+el.dataset.v;const rm=a.splice(i,1)[0];render();toast(`Soru ${i+1} silindi`,{undo:()=>{a.splice(i,0,rm);render()}})},
  qAdd:()=>{UI.wiz.questions.push({kind:'mc',kz:UI.wiz.kz[0],q:'',opts:['','','',''],correct:'A',sol:''});render();setTimeout(()=>{const t=$$('.qcard textarea');t.length&&t[t.length-3]&&t[t.length-3].focus()},30)},
  qFromBank:t=>{if(!t.value)return;UI.wiz.questions.push(bankQ(t.value,UI.wiz.questions.length));render();toast('Havuzdan soru eklendi · düzenleyebilirsiniz')},
  tryOpt:el=>{const[i,l]=el.dataset.v.split('|');UI.tryA=UI.tryA||{};UI.tryA[i]=l;render()},
  tryOpen:el=>{UI.tryA=UI.tryA||{};UI.tryA[el.dataset.v]=($('#to'+el.dataset.v).value||'').trim()||'—';render()},
  keyT:()=>{UI.showKey=!UI.showKey;render()}
});
function studentPreviewQs(qs){
  const A=UI.tryA||{};
  return qs.map((q,i)=>{const a=A[i];const ok=q.kind==='mc'?a===q.correct:a&&(q.ans||'').toLocaleLowerCase('tr').replace(/\s/g,'')===a.toLocaleLowerCase('tr').replace(/\s/g,'');
    return `<div class="card" style="padding:12px;margin-top:10px"><b>Soru ${i+1}</b><p style="margin:6px 0 10px">${esc(q.q||'(soru kökü boş)')}</p>
    ${q.kind==='mc'?`<div class="col" style="gap:6px">${q.opts.map((o,j)=>{const L=L4[j];const st=a?(L===q.correct?'right':L===a?'wrong':''):'';return `<button class="try ${st}" data-act="tryOpt" data-v="${i}|${L}" aria-pressed="${a===L}"><span class="ol">${L}</span>${esc(o||'—')}${st==='right'?ic('check',14):st==='wrong'?ic('x',14):''}</button>`}).join('')}</div>`:
      `<div class="row" style="flex-wrap:nowrap"><input class="in" id="to${i}" placeholder="Cevabını yaz" value="${a&&a!=='—'?esc(a):''}"><button class="btn sm sec" data-act="tryOpen" data-v="${i}">Kontrol et</button></div>`}
    ${a?`<div class="small ${ok?'':'ai-box'}" style="margin-top:8px">${ok?`<b>${ic('okc',14)} Doğru!</b>`:`<b>Tekrar dene.</b> ${esc(q.sol||'')}`}</div>`:''}
    ${UI.showKey?`<div class="meta" style="margin-top:6px">${ic('lock',11)} Cevap anahtarı: ${q.kind==='mc'?q.correct+' · '+esc(q.opts[L4.indexOf(q.correct)]):esc(q.ans||'')}</div>`:''}</div>`}).join('');
}

/* ================= DEĞERLENDİRİLECEKLER: görev, teslim, önizleme ================= */
const TASK={
  'İnfografik':'Günlük hayattan orantılı olan ve orantılı olmayan birer durum bul. Her biri için tablo ve kısa açıklama içeren tek sayfalık bir infografik hazırla. Orantılı olup olmadığını nasıl kontrol ettiğini göster.',
  'Sunum':'Sınıfında 20 kişilik kısa bir anket yap. Verileri uygun grafikle sun ve en az iki karşılaştırma cümlesi yaz (3 slayt).',
  'Basit kodlama':'Pisagor bağıntısını kare alanlarıyla gösteren basit bir program yaz ve çıktısını açıkla.',
  '_':'Problemi çözmeden önce Anla–Planla–Çöz–Kontrol et adımlarıyla bir çözüm planı yaz.'
};
const prodKind=a=>a.product||'Çözüm planı';
const errSub=sb=>sb.rubric&&sb.rubric[1]<3;
function stuSolution(a,s,sb){const e=errSub(sb);const p=prodKind(a);
  if(p==='İnfografik')return `Doğru orantı için market örneğini seçtim: 1 kg elma 15 TL ise 5 kg elma 75 TL olur; fiyatın kilograma bölümü hep 15. Orantılı olmayan durum için yaş ve boy örneğini seçtim: 7 yaşında 125 cm, 10 yaşında 140 cm. ${e?'14 yaşında 250 cm olur diye yazdım, çünkü yaş artınca boy da artıyor.':'Yaş artınca boy da artıyor ama bölüm sabit değil (125 ÷ 7 ile 140 ÷ 10 farklı), bu yüzden orantılı değil.'} İnfografikte iki durumu tablo ve küçük grafiklerle yan yana koydum.`;
  if(p==='Sunum')return `20 arkadaşıma en sevdikleri sporu sordum. Futbolu 8 kişi seçti (%40). Voleybol (5) basketboldan (4) 1 kişi fazla.${e?' Yüzmeyi seçenlerin oranını %30 yazdım.':' Yüzmeyi 3 kişi seçti (%15).'} Verileri sütun grafiğiyle gösterdim çünkü kategorileri karşılaştırmak kolay oluyor.`;
  if(p==='Basit kodlama')return 'Dik kenarları 3 ve 4 olan üçgenin kenarlarına kareler çizdim; 9 + 16 = 25 olduğunu gösteren kısa bir kod yazdım.';
  return `Anla: √2, 0,75, π ve 5/8 sayılarını rasyonel ve irrasyonel olarak ayıracağım. Planla: sayının a/b biçiminde yazılıp yazılamadığına bakacağım. Çöz: ${e?'0,75 ve π irrasyonel.':'0,75 = 3/4 ve 5/8 rasyonel; √2 ve π irrasyonel.'} Kontrol: ${e?'—':'3 ÷ 4 = 0,75 ✓'}`;
}
let fileName=(a,s)=>{const n=s.first.toLocaleLowerCase('tr').replace(/\s/g,'');return {'İnfografik':['oran-oranti-infografik_'+n+'.png','1,2 MB','image'],'Sunum':['okul-anketi-sunum_'+n+'.pdf','3 sayfa · 840 KB','present'],'Basit kodlama':['pisagor-model_'+n+'.py','2 KB','code']}[a.product]||['cozum-plani_'+n+'.pdf','1 sayfa · 210 KB','file']};
function infoSVG(s,sb,w='100%'){const e=errSub(sb);const name=esc(shortName(s))+' · '+s.section;
  const tbl=(x,y,h1,h2,rows)=>`<g transform="translate(${x},${y})"><rect width="230" height="${30+rows.length*28}" rx="10" fill="#fff" stroke="#E8C999"/><rect width="230" height="30" rx="10" fill="#F3E3C6"/><text x="16" y="20" font-size="13" font-weight="800" fill="#000">${h1}</text><text x="130" y="20" font-size="13" font-weight="800" fill="#000">${h2}</text>${rows.map((r,i)=>`<text x="16" y="${50+i*28}" font-size="14" fill="#000">${r[0]}</text><text x="130" y="${50+i*28}" font-size="14" font-weight="${r[2]?800:400}" fill="${r[2]?'#810000':'#000'}">${r[1]}</text>`).join('')}</g>`;
  return `<svg viewBox="0 0 600 860" width="${w}" role="img" aria-label="Öğrenci infografiği: Oran mı, orantı mı?" style="display:block;font-family:Manrope,Arial,sans-serif;background:#FFF8EC;border-radius:12px">
  <rect x="0" y="0" width="600" height="150" fill="#810000"/><circle cx="540" cy="30" r="70" fill="#9b1c16"/><circle cx="560" cy="120" r="40" fill="#5c0000"/>
  <text x="34" y="62" font-size="15" letter-spacing="3" font-weight="800" fill="#E8C999">MATEMATİK · ORAN VE ORANTI</text><text x="34" y="106" font-size="38" font-family="'Source Serif 4',Georgia,serif" font-weight="700" fill="#FFF4E4">Oran mı, orantı mı?</text><text x="34" y="132" font-size="14" fill="#F3E3C6">Günlük hayattan iki örnekle keşfet · Hazırlayan: ${name}</text>
  <text x="34" y="196" font-size="20" font-weight="800" fill="#000">1  Doğru orantı</text><text x="34" y="218" font-size="13" fill="#5a3d12">Biri artınca diğeri de aynı oranda artar.</text>
  <g transform="translate(34,232)"><circle cx="14" cy="14" r="12" fill="#a3302b"/><circle cx="40" cy="14" r="12" fill="#810000"/><circle cx="66" cy="14" r="12" fill="#a3302b"/><path d="M14 2c2-6 6-6 8-4" stroke="#5a3d12" stroke-width="2" fill="none"/><text x="92" y="19" font-size="13" fill="#000">Markette elma</text></g>
  ${tbl(34,272,'Elma (kg)','Fiyat (TL)',[['1','15'],['2','30'],['5','75']])}
  <g transform="translate(34,402)"><rect width="230" height="120" rx="10" fill="#fff" stroke="#E8C999"/><line x1="24" y1="100" x2="214" y2="100" stroke="#000"/><line x1="24" y1="100" x2="24" y2="14" stroke="#000"/><line x1="24" y1="100" x2="200" y2="22" stroke="#810000" stroke-width="3"/><circle cx="59" cy="84" r="4" fill="#810000"/><circle cx="94" cy="69" r="4" fill="#810000"/><circle cx="200" cy="22" r="4" fill="#810000"/><text x="120" y="116" font-size="11" fill="#5a3d12">kg</text><text x="6" y="56" font-size="11" fill="#5a3d12">TL</text></g>
  <rect x="34" y="536" width="230" height="40" rx="10" fill="#000"/><text x="50" y="561" font-size="14" font-weight="700" fill="#E8C999">Bölüm sabit: 30 ÷ 2 = 15</text>
  <text x="320" y="196" font-size="20" font-weight="800" fill="#000">2  Orantılı değil</text><text x="320" y="218" font-size="13" fill="#5a3d12">İkisi de artıyor ama bölüm sabit değil.</text>
  <g transform="translate(320,232)">${[0,1,2,3].map(i=>`<circle cx="${12+i*24}" cy="8" r="7" fill="#5c0000"/><rect x="${5+i*24}" y="16" width="14" height="14" rx="4" fill="#810000"/>`).join('')}<text x="104" y="22" font-size="13" fill="#000">Yaş ve boy</text></g>
  ${tbl(320,272,'Yaş','Boy (cm)',[['7','125'],['10','140'],['14',e?'250':'160',1]])}
  <g transform="translate(320,402)"><rect width="230" height="120" rx="10" fill="#fff" stroke="#E8C999"/><line x1="24" y1="100" x2="214" y2="100" stroke="#000"/><line x1="24" y1="100" x2="24" y2="14" stroke="#000"/>${e?'<line x1="24" y1="100" x2="200" y2="20" stroke="#810000" stroke-width="3"/>':'<path d="M24 70 Q90 40 200 34" stroke="#810000" stroke-width="3" fill="none"/>'}<text x="112" y="116" font-size="11" fill="#5a3d12">yaş</text><text x="4" y="56" font-size="11" fill="#5a3d12">cm</text></g>
  <rect x="320" y="536" width="230" height="40" rx="10" fill="#000"/><text x="336" y="561" font-size="14" font-weight="700" fill="#E8C999">${e?'Yaş 2 katı → boy 2 katı (?)':'125 ÷ 7 ≠ 140 ÷ 10'}</text>
  <rect x="34" y="604" width="532" height="140" rx="14" fill="#F3E3C6"/><text x="54" y="636" font-size="17" font-weight="800" fill="#000">Nasıl ayırt ederim?</text>
  <circle cx="62" cy="664" r="6" fill="#810000"/><text x="78" y="669" font-size="14" fill="#000">İki değerin <tspan font-weight="800">bölümü</tspan> sabitse → doğru orantı</text>
  <circle cx="62" cy="694" r="6" fill="#000"/><text x="78" y="699" font-size="14" fill="#000"><tspan font-weight="800">Bölüm</tspan> değişiyorsa → orantılı değil</text>
  <text x="54" y="728" font-size="13" fill="#5a3d12">İpucu: Tabloya bir satır daha ekleyip kuralı dene.</text>
  ${e?`<rect x="34" y="764" width="532" height="52" rx="12" fill="#fff" stroke="#E8C999" stroke-dasharray="5 4"/><text x="54" y="796" font-size="14" fill="#5a3d12">Kontrol: —</text>`:`<rect x="34" y="764" width="532" height="52" rx="12" fill="#fff" stroke="#810000"/><text x="54" y="796" font-size="15" font-weight="800" fill="#810000">Kontrol: 75 ÷ 5 = 15 ✓   ·   17,9 ≠ 14 ✓</text>`}
  <text x="34" y="844" font-size="11" fill="#5a3d12">Kaynak: Ders kitabı, Oran ve Orantı ünitesi · Öğrenci çalışması (kurgusal örnek)</text></svg>`;}
function slideSVG(n,s,sb,w='100%'){const e=errSub(sb);const H=`<svg viewBox="0 0 480 270" width="${w}" role="img" style="display:block;font-family:Manrope,Arial,sans-serif;border-radius:10px;background:#FFF8EC" aria-label="Sunum slaytı ${n}">`;
  if(n===1)return H+`<rect width="480" height="270" fill="#810000"/><circle cx="420" cy="40" r="80" fill="#9b1c16"/><text x="32" y="120" font-size="30" font-family="'Source Serif 4',Georgia,serif" font-weight="700" fill="#FFF4E4">Okulumuzda en</text><text x="32" y="156" font-size="30" font-family="'Source Serif 4',Georgia,serif" font-weight="700" fill="#FFF4E4">sevilen spor hangisi?</text><text x="32" y="196" font-size="14" fill="#E8C999">8. sınıf veri analizi · ${esc(shortName(s))} · ${s.section}</text></svg>`;
  if(n===2){const d=[['Futbol',8],['Voleybol',5],['Basketbol',4],['Yüzme',3]];return H+`<text x="28" y="40" font-size="20" font-weight="800" fill="#000">Anket sonuçları (n = 20)</text>${d.map((x,i)=>`<rect x="${60+i*100}" y="${230-x[1]*20}" width="56" height="${x[1]*20}" rx="6" fill="${i===0?'#810000':'#a3302b'}"/><text x="${88+i*100}" y="${222-x[1]*20}" text-anchor="middle" font-size="14" font-weight="800">${x[1]}</text><text x="${88+i*100}" y="252" text-anchor="middle" font-size="12">${x[0]}</text>`).join('')}<line x1="40" y1="230" x2="460" y2="230" stroke="#000"/></svg>`}
  return H+`<text x="28" y="44" font-size="20" font-weight="800" fill="#000">Ne öğrendim?</text><circle cx="40" cy="86" r="6" fill="#810000"/><text x="56" y="91" font-size="15">Futbolu seçenler %40 ile en kalabalık grup.</text><circle cx="40" cy="126" r="6" fill="#810000"/><text x="56" y="131" font-size="15">Voleybol, basketboldan 1 kişi fazla.</text><circle cx="40" cy="166" r="6" fill="#000"/><text x="56" y="171" font-size="15" fill="${e?'#810000':'#000'}">Yüzmeyi seçenler: ${e?'%30':'%15 (3 kişi)'}</text><text x="28" y="236" font-size="12" fill="#5a3d12">Grafik türü: sütun grafik · kategorileri karşılaştırmak için</text></svg>`;}
function planDoc(a,s,sb){const e=errSub(sb);const st=[['Anla','√2, 0,75, π ve 5/8 sayılarını rasyonel ve irrasyonel olarak ayır.'],['Planla','Sayı a/b biçiminde yazılabiliyor mu? Ona bakacağım.'],['Çöz',e?'0,75 ve π irrasyonel':'0,75 = 3/4 ve 5/8 rasyonel · √2 ve π irrasyonel'],['Kontrol et',e?'—':'3 ÷ 4 = 0,75 ✓']];
  return `<div style="background:#fff;border-radius:12px;padding:22px 24px;border:1px solid var(--krem-200)"><div class="eyebrow">Çözüm planım · ${esc(fullName(s))} · ${s.section}</div><h3 style="font-family:var(--serif);margin:6px 0 14px;font-size:20px">${esc(a.title)}</h3>${st.map((x,i)=>`<div class="row" style="align-items:flex-start;padding:10px 0;border-top:1px solid var(--line)"><span class="pill ${i===3&&e?'p-out':'p-ink'}" style="min-width:96px;justify-content:center">${i+1}. ${x[0]}</span><span class="sp" style="font-family:'Caveat',cursive,var(--sans);font-size:15px">${esc(x[1])}</span></div>`).join('')}</div>`;}
function prodThumb(a,s,sb){const p=prodKind(a);if(p==='İnfografik')return infoSVG(s,sb,'100%');if(p==='Sunum')return slideSVG(1,s,sb,'100%');return `<div style="background:#fff;padding:10px;border-radius:8px;font-size:9px;line-height:1.4">${ic(p==='Basit kodlama'?'code':'file',28)}<br><b>${esc(fileName(a,s)[0])}</b></div>`}
ACT.prodPreview=el=>{const[aid,sid]=el.dataset.v.split('|');const a=DB.acts.find(x=>x.id===aid);const s=stu(sid);const sb=a.subs[sid];const f=fileName(a,s);
  openModal(()=>{const p=prodKind(a);let body;
    if(p==='İnfografik')body=`<div style="max-width:560px;margin:0 auto;width:100%">${infoSVG(s,sb)}</div>`;
    else if(p==='Sunum'){const n=UI.slide||1;body=`<div style="max-width:640px;margin:0 auto;width:100%">${slideSVG(n,s,sb)}</div><div class="row" style="justify-content:center"><button class="btn sm sec" data-act="slideP" data-v="${n-1}" ${n<=1?'disabled':''}>${ic('cl',14)} Önceki</button><span class="small">Slayt ${n} / 3</span><button class="btn sm sec" data-act="slideP" data-v="${n+1}" ${n>=3?'disabled':''}>Sonraki ${ic('cr',14)}</button></div>`}
    else if(p==='Basit kodlama')body=`<pre style="background:#111;color:#E8C999;padding:16px;border-radius:12px;overflow:auto;font-size:13px">a = 4\nkare = (a + 3) ** 2\nparcalar = a*a + 3*a + 3*a + 3*3\nprint(kare, parcalar)  # 49 49</pre>`;
    else body=planDoc(a,s,sb);
    return {title:esc(f[0]),sub:`${esc(fullName(s))} · ${a.type}${a.product?' · '+a.product:''} · ${f[1]} · teslim ${fmtDL(sb.date)}`,body:body+`<div class="meta">${ic('info',12)} Kurgusal örnek öğrenci çalışması. Prototipte dosya indirme kapalıdır.</div>`,foot:`<button class="btn sec" data-act="closeLayer">Kapat</button><button class="btn pri" data-act="closeLayer">${ic('clipcheck',15)} Değerlendirmeye dön</button>`}},true)};
ACT.slideP=el=>{UI.slide=clamp(+el.dataset.v,1,3);drawLayer(false)};
function evalPage(){
  const secs=secScope();let list=pendingEvals().filter(x=>secs.includes(stu(x.sid).section)&&courseUnion().includes(x.a.course)&&(!F.student||x.sid===F.student));
  const fb=filterBar(['section','course','student'],list.length,{countLabel:'teslim bekliyor'});
  if(!list.length)return fb+`<div class="card panel">${stateBox('empty','Değerlendirme bekleyen teslim yok','Tüm teslimler değerlendirildi. Yeni teslimler geldiğinde burada sıralanır.',`<button class="btn sm sec" data-go="activities/tamamlanan">Tamamlananlara git</button>`)}</div>`;
  const key=x=>x.a.id+'|'+x.sid;let cur=list.find(x=>key(x)===UI.evSel)||list[0];UI.evSel=key(cur);UI.slide=1;
  const s=stu(cur.sid);const a=cur.a;const sb=cur.sub;const ai=sb.rubric;const tot=ai.reduce((x,y)=>x+y,0);const k=kzOf(a.kz[0]);const bank=Q_BANK[a.kz[0]]||{};const f=fileName(a,s);
  const prev=DB.acts.filter(o=>o.id!==a.id&&o.subs[s.id]&&o.subs[s.id].state==='tamamladı'&&o.subs[s.id].score!=null).slice(0,3);
  const D=['Başlangıç','Gelişiyor','Yeterli','İleri'];
  const fbText=`${s.first}, ${({'İnfografik':'infografiğin','Sunum':'sunumun','Basit kodlama':'kodun'})[a.product]||'çalışman'} ${k.topic.toLocaleLowerCase('tr')} konusunu ${ai[0]>=3?'doğru biçimde':'kısmen'} yansıtıyor. ${ai[1]<3?'Hesaplamalarından birini yeniden kontrol etmeni öneririm; tablodaki değerlerin kuralı sağlayıp sağlamadığına bak. ':''}${ai[2]>=3?'Görsel düzenin anlaşılır. ':'Başlık ve görselleri biraz daha düzenlersen mesajın daha net olur. '}Bir sonraki adım: çözüm yolunu bir cümleyle açıkla.`;
  const qs=a.questions&&a.questions.length?a.questions:[{q:bank.q,ans:bank.ans}];
  return fb+`<div class="split-l"><section class="card" style="padding:10px"><div class="eyebrow" style="padding:6px 8px">Kuyruk · ${list.length}</div><div class="col" style="gap:4px">${list.map(x=>{const st=stu(x.sid);return `<button class="thread ${key(x)===UI.evSel?'on':''}" data-act="evPick" data-v="${key(x)}">${avatar(st,34)}<span style="min-width:0" class="sp"><b class="small">${esc(fullName(st))}</b><br><span class="meta trunc" style="display:block">${esc(x.a.title)}</span></span><span class="meta">${fmtD(x.sub.date)}</span></button>`}).join('')}</div></section>
  <section class="card panel"><div class="row">${avatar(s,44)}<div class="sp"><div class="eyebrow">${a.type}${a.product?' · '+a.product:''} · ${s.section}</div><h2 class="st">${esc(fullName(s))} · ${esc(a.title)}</h2></div><span class="meta">Teslim ${fmtDL(sb.date)}</span></div>
   <div class="evbar" style="margin-top:14px"><div class="evbar-hd"><span class="pill p-ink">${ic('clip',12)} Görev ve teslim</span><span class="meta">${k.topic} · ${esc(k.name)}</span></div>
    <div class="evgrid"><div class="col" style="gap:10px"><div><div class="eyebrow">Öğrenciye verilen görev</div><p class="small" style="margin:6px 0 0">${esc(a.instructions||TASK[a.product]||TASK._)}</p></div>
      ${qs.map((q,i)=>`<div class="qbox"><div class="eyebrow">Soru ${qs.length>1?i+1:''}</div><p style="margin:4px 0 6px;font-weight:700">${esc(q.q||'')}</p><span class="meta">${ic('lock',11)} Cevap anahtarı: ${esc(q.ans||(q.opts?q.opts[L4.indexOf(q.correct)]:'—'))}</span></div>`).join('')}</div>
     <div class="col" style="gap:10px"><div><div class="eyebrow">Öğrencinin çözümü</div><p class="small sol" style="margin:6px 0 0">${esc(stuSolution(a,s,sb))}</p></div>
      <div class="fcard"><button class="fthumb" data-act="prodPreview" data-v="${key(cur)}" aria-label="${esc(f[0])} dosyasını önizle">${prodThumb(a,s,sb)}<span class="fzoom">${ic('eye',16)}</span></button><div class="sp" style="min-width:0"><b class="small trunc" style="display:block">${esc(f[0])}</b><span class="meta">${f[1]} · ${fmtD(sb.date)} yüklendi</span><div class="row" style="margin-top:8px"><button class="btn sm pri" data-act="prodPreview" data-v="${key(cur)}">${ic('eye',14)} Önizleme</button></div></div></div></div></div></div>
   <div class="evbar" style="margin-top:12px"><div class="evbar-hd"><span class="src a">${ic('spark',12)} AI önerisi</span><span class="meta sp">Rubrik puanları öneridir; son karar sizin</span><b id="rbTot" style="font-family:var(--serif);font-size:22px">${tot}/16 · ${Math.round(tot/16*100)}</b></div>
    <div class="rbgrid">${(a.rubric||RUBRIC).map((r,i)=>`<div class="fld"><label for="rb${i}">${esc(r)}</label><span class="pill p-ai" style="align-self:flex-start">AI: ${ai[i]} · ${D[ai[i]-1]}</span><select class="sel" id="rb${i}" data-chg="rbCh">${[1,2,3,4].map(v=>`<option value="${v}" ${v===ai[i]?'selected':''}>${v} · ${D[v-1]}</option>`).join('')}</select></div>`).join('')}</div></div>
   <div class="fld" style="margin-top:14px"><label for="evFb">Geri bildirim <span class="meta">· AI taslağı, düzenleyebilirsiniz</span></label><textarea class="ta" id="evFb">${esc(fbText)}</textarea></div>
   ${prev.length?`<div style="margin-top:12px"><div class="lab">Önceki çalışmalar</div><div class="row" style="margin-top:6px">${prev.map(o=>`<span class="pill p-gray">${esc(o.title)} · ${o.subs[s.id].score}</span>`).join('')}</div></div>`:''}
   <div class="row" style="margin-top:16px;justify-content:flex-end"><span class="meta sp">Onay sonrası puan, kazanım için yeni bir ölçüm olarak kaydedilir ve rapora yansır.</span><button class="btn pri" data-act="evApprove" data-v="${key(cur)}">${ic('check',15)} Onayla ve geri bildirim ver</button></div></section></div>`;
}

/* ================= EVDE DESTEK düzenleyici ================= */
const HOME_Q={'MAT7-4':[{q:'Pizzanın 1/4\'ünü sen, 2/8\'ini kardeşin yedi. Kim daha çok yedi?',a:'Eşit yediniz (2/8 = 1/4).',h:'Bir kâğıdı katlayarak iki parçayı üst üste koyun.'},{q:'Tarifte 3/4 su bardağı süt ve 1/2 su bardağı su var. Toplam kaç bardak sıvı?',a:'5/4 = 1 1/4 bardak',h:'Önce dörtte birlere çevirmesini isteyin.'}],
 'MAT7-7':[{q:'2 kalem 10 TL ise 5 kalem kaç TL olur?',a:'25 TL',h:'“Bir kalem kaç TL?” sorusuyla başlamasını isteyin.'}],
 'MAT8-1':[{q:'0,333… sayısı rasyonel midir? Neden?',a:'Evet; 1/3 olarak yazılabilir.',h:'Sayıyı kesir olarak yazmayı denemesini isteyin.'}]};
function hsWork(sid){UI.hsW=UI.hsW||{};if(UI.hsW[sid])return UI.hsW[sid];const s=stu(sid);const saved=DB.drafts.find(d=>d.id==='hs-'+sid);
  const w=Object.keys(DB.measures[sid]||{}).map(k=>({k:kzOf(k),m:mOf(sid,k)})).sort((a,b)=>a.m.v-b.m.v)[0];const k=w?w.k:null;const e=k?DB.errors.find(x=>x.sid===sid&&x.kz===k.id):null;
  const def={guide:`Sevgili veli, bu hafta ${s.first} ile ${k?k.topic.toLocaleLowerCase('tr'):'matematik'} üzerinde kısa çalışmalar yapmanızı öneriyoruz. Her oturum 10 dakikayı geçmesin; amaç doğru cevaptan çok düşünmesini konuşmak.`,
    items:k?[`${k.topic} için haftada 3 gün, 10 dakikalık günlük hayat örnekleri (mutfak, alışveriş).`,e&&e.type==='K'?'Kâğıt şeritlerle model kurup çocuğunuzdan nedenini anlatmasını isteyin.':e&&e.type==='I'?'Çözümü bitirince “işaret, işlem sırası, sonuç mantıklı mı?” kontrol listesini birlikte okuyun.':'Soruyu okuduktan sonra “Ne biliyoruz, ne arıyoruz?” sorularını sesli cevaplamasını isteyin.','Doğru cevaptan çok çabayı ve açıklamayı övün; yanlışları ipucu olarak konuşun.']:['Düzenli çalışma saatini sürdürün.'],
    qs:(k&&HOME_Q[k.id])?HOME_Q[k.id].map(x=>({...x})):k&&Q_BANK[k.id]?[{q:Q_BANK[k.id].q,a:Q_BANK[k.id].ans,h:'Önce tahmin etmesini, sonra çözmesini isteyin.'}]:[]};
  UI.hsW[sid]=saved?{guide:saved.guide??def.guide,items:saved.items.slice(),qs:(saved.qs||def.qs).map(x=>({...x}))}:def;UI.hsW[sid].ai=!saved;UI.hsW[sid].k=k;UI.hsW[sid].e=e;return UI.hsW[sid];}
function homeSupport(s){const W=hsWork(s.id);const id=s.id;
  return `<div class="row"><span class="src ${W.ai?'a':'o'}">${ic(W.ai?'spark':'edit',12)} ${W.ai?'AI taslağı':'Öğretmen düzenledi'}</span><span class="meta">${W.k?`Dayanak: ${esc(W.k.name)}${W.e?' · '+ERR[W.e.type].name:''}`:''}</span></div>
  <div class="fld"><label for="hsG">Veliye yönerge</label><textarea class="ta" id="hsG" data-inp="hsF" data-v="${id}" data-f="guide" style="min-height:70px">${esc(W.guide)}</textarea></div>
  <div><div class="lab">Öneriler</div><div class="col" style="gap:6px;margin-top:6px">${W.items.map((t,i)=>`<div class="row" style="flex-wrap:nowrap"><span class="pill p-krem">${i+1}</span><input class="in" data-inp="hsItem" data-v="${id}" data-i="${i}" value="${esc(t)}" aria-label="Öneri ${i+1}"><button class="btn xs ghost" data-act="hsItemDel" data-v="${id}|${i}" aria-label="Öneriyi sil">${ic('x',13)}</button></div>`).join('')}</div><button class="btn xs sec" style="margin-top:6px" data-act="hsItemAdd" data-v="${id}">${ic('plus',13)} Öneri ekle</button></div>
  <div><div class="lab">Evde birlikte çalışılacak sorular</div><div class="col" style="gap:10px;margin-top:6px">${W.qs.map((q,i)=>`<div class="card" style="padding:12px"><div class="row"><span class="pill p-ink">Soru ${i+1}</span><span class="sp"></span><button class="btn xs ghost" data-act="hsQDel" data-v="${id}|${i}">${ic('x',13)} Sil</button></div><div class="fld" style="margin-top:8px"><label for="hq${i}">Soru</label><textarea class="ta" id="hq${i}" style="min-height:54px" data-inp="hsQ" data-v="${id}" data-i="${i}" data-f="q">${esc(q.q)}</textarea></div><div class="grid g2" style="gap:8px;margin-top:8px"><div class="fld"><label for="ha${i}">Cevap</label><input class="in" id="ha${i}" data-inp="hsQ" data-v="${id}" data-i="${i}" data-f="a" value="${esc(q.a)}"></div><div class="fld"><label for="hh${i}">Veliye ipucu</label><input class="in" id="hh${i}" data-inp="hsQ" data-v="${id}" data-i="${i}" data-f="h" value="${esc(q.h||'')}"></div></div></div>`).join('')||'<span class="meta">Henüz soru yok.</span>'}</div><button class="btn xs sec" style="margin-top:6px" data-act="hsQAdd" data-v="${id}">${ic('plus',13)} Soru ekle</button></div>
  <div class="row" style="justify-content:flex-end"><button class="btn sm sec" data-act="hsSave" data-v="${id}">${ic('check',14)} Kaydet</button><button class="btn sm pri" data-act="hsToReport" data-v="${id}">${ic('file',14)} Veli raporuna ekle</button></div>`;}
Object.assign(ACT,{
  hsF:t=>{hsWork(t.dataset.v)[t.dataset.f]=t.value},
  hsItem:t=>{hsWork(t.dataset.v).items[+t.dataset.i]=t.value},
  hsItemAdd:el=>{hsWork(el.dataset.v).items.push('');render()},
  hsItemDel:el=>{const[id,i]=el.dataset.v.split('|');hsWork(id).items.splice(+i,1);render()},
  hsQ:t=>{hsWork(t.dataset.v).qs[+t.dataset.i][t.dataset.f]=t.value},
  hsQAdd:el=>{hsWork(el.dataset.v).qs.push({q:'',a:'',h:''});render()},
  hsQDel:el=>{const[id,i]=el.dataset.v.split('|');hsWork(id).qs.splice(+i,1);render()},
  hsSave:el=>{const id=el.dataset.v;const W=hsWork(id);const key='hs-'+id;const qs=W.qs.filter(q=>q.q.trim());const items=W.items.map(x=>x.trim()).filter(Boolean);
    commit('Evde Destek kaydedildi',()=>{DB.drafts=DB.drafts.filter(d=>d.id!==key);DB.drafts.push({id:key,kind:'Evde Destek',sid:id,guide:W.guide,items,qs,d:TODAY})});UI.hsW[id]=null}
});
function hsReport(s){const hs=DB.drafts.find(d=>d.id==='hs-'+s.id);const W=hs||hsWork(s.id);
  return `<h3 class="st" style="font-size:17px;margin:20px 0 8px">Evde Destek önerileri</h3><div class="ai-box"><div class="row"><span class="src ${hs?'o':'a'}">${ic(hs?'edit':'spark',12)} ${hs?'Öğretmen düzenledi':'AI taslağı'}</span><span class="sp"></span><button class="btn xs sec" data-act="hsEditGo" data-v="${s.id}">${ic('edit',13)} Düzenle</button></div>${W.guide?`<p class="small" style="margin:8px 0">${esc(W.guide)}</p>`:''}<ol class="small" style="margin:8px 0 0;padding-left:18px">${W.items.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>${(W.qs||[]).length?`<div class="lab" style="margin-top:10px">Evde birlikte çalışılacak sorular</div>${W.qs.map((q,i)=>`<div class="small" style="margin-top:6px"><b>${i+1}. ${esc(q.q)}</b><br><span class="muted">Cevap: ${esc(q.a)}${q.h?' · İpucu: '+esc(q.h):''}</span></div>`).join('')}`:''}</div>`;}
ACT.hsEditGo=el=>{UI.scrollTo='sec-evde';go('student/assess/'+el.dataset.v)};
