/* ================= ÖĞRENCİ: Navi ile tanışalım (ilk giriş formu) + emoji karakterli profil ================= */
const OB_Q=[
 {q:'Sana nasıl seslenmemi istersin?',h:'Kısa cevap: Adını veya kullanmak istediğin takma adı yazabilirsin.',t:'text'},
 {q:'Kaçıncı sınıfa gidiyorsun?',t:'one',o:['5. sınıf','6. sınıf','7. sınıf','8. sınıf']},
 {q:'Hangi derslerle uğraşmak daha çok hoşuna gidiyor?',h:'Birden fazla seçebilirsin.',t:'multi',o:['Türkçe','Matematik','Fen Bilimleri','Sosyal Bilgiler / T.C. İnkılap Tarihi ve Atatürkçülük','İngilizce','Din Kültürü ve Ahlak Bilgisi','Başka bir ders: …']},
 {q:'Hangi derslerde daha çok yardıma ihtiyaç duyuyorsun?',h:'Birden fazla seçebilirsin.',t:'multi',o:['Türkçe','Matematik','Fen Bilimleri','Sosyal Bilgiler / T.C. İnkılap Tarihi ve Atatürkçülük','İngilizce','Din Kültürü ve Ahlak Bilgisi','Başka bir ders: …','Şimdilik bilmiyorum.']},
 {q:'Bu yıl en çok neyi başarmak istiyorsun?',h:'En fazla iki seçenek seçebilirsin.',t:'multi',max:2,o:['Derslerde anlatılanları daha iyi anlamak','Sınav notlarımı yükseltmek','Daha düzenli çalışmak','Zorlandığım soruları çözebilmek','Kendi projemi veya ürünümü yapmak','Girmek istediğim liseye hazırlanmak','Henüz karar vermedim.','Başka bir hedefim var: …']},
 {q:'Hangisi seni çalışmaya daha çok heveslendirir?',h:'En fazla iki seçenek seçebilirsin.',t:'multi',max:2,o:['Merak ettiğim bir şeyi öğrenmek','Önceden yapamadığım bir şeyi yapabilmek','Hedefime yaklaştığımı görmek','Emek verdiğimin fark edilmesi','Puan, rozet veya küçük ödüller kazanmak','Öğrendiklerimi günlük hayatta kullanmak','Başka: …']},
 {q:'Boş zamanlarında nelerle ilgilenirsin?',h:'Birden fazla seçebilirsin.',t:'multi',o:['Spor ve hareket','Oyunlar ve bulmacalar','Kitaplar ve hikâyeler','Resim, tasarım veya el işleri','Müzik','Hayvanlar ve doğa','Bilim ve deneyler','Teknoloji ve kodlama','Başka: …']},
 {q:'Okul dışında ders çalışmaya başlamak senin için genellikle nasıldır?',t:'one',o:['Çoğu zaman kendim başlarım.','Biri hatırlatınca başlarım.','Ne yapacağım belli olursa daha kolay başlarım.','Başlamak isterim ama sık sık ertelerim.','Günden güne değişir.']},
 {q:'Ödevlerini genellikle ne zaman yaparsın?',t:'one',o:['Verildiği gün','Teslim gününden önce, parça parça','Çoğunlukla son gün','Bazen yetiştiremiyorum.','Ödeve göre değişiyor.']},
 {q:'Okuldan sonra hangi zamanda çalışmak sana daha uygun gelir?',t:'one',o:['Eve geldikten kısa süre sonra','Biraz dinlendikten sonra','Akşam yemeğinden önce','Akşam yemeğinden sonra','Her gün değişir.','Henüz bilmiyorum.']},
 {q:'Son bir haftayı düşün: Bir günde okul dışında ödev ve ders için genellikle ne kadar zaman ayırdın?',t:'one',o:['Hiç zaman ayırmadım.','30 dakikadan az','30 dakika–1 saat arası','1 saatten fazla–2 saat arası','2 saatten fazla','Hatırlamıyorum.']},
 {q:'Ders çalışırken en çok ne dikkatini dağıtır?',h:'En fazla iki seçenek seçebilirsin.',t:'multi',max:2,o:['Telefon, tablet veya bilgisayardaki başka şeyler','Çevremdeki sesler','Aklıma gelen düşünceler','Yorgunluk veya uykumun gelmesi','Çalışmanın uzun sürmesi','Genellikle dikkatimi sürdürebiliyorum.','Başka: …']},
 {q:'Yeni bir konuyu öğrenmeye başlarken önce hangisini denemek istersin?',t:'one',o:['Kısa bir açıklama okumak','Bir örneğin çözümünü izlemek','Görsellerle anlatım görmek','Küçük bir etkinlik yapmak','Önce kendim bir soru denemek','Konuya göre değişir.']},
 {q:'Bir soruda takıldığında genellikle ilk ne yaparsın?',t:'one',o:['Soruyu yeniden okurum.','Farklı bir çözüm yolu denerim.','Bir ipucu veya yardım isterim.','Çözümüne bakarım.','Soruyu geçerim.','Soruya göre değişir.']},
 {q:'Bir soruyu çözerken en çok hangi noktada zorlanırsın?',h:'Birden fazla seçebilirsin.',t:'multi',o:['Sorunun ne istediğini anlamakta','Konuyla ilgili bilgiyi hatırlamakta','Çözüme nasıl başlayacağımı bulmakta','İşlemleri doğru yapmakta','Çözümü sonuna kadar götürmekte','Cevabımı kontrol etmekte','Henüz bilmiyorum.']},
 {q:'Bir soruyu yanlış yaptığını gördüğünde genellikle ne yaparsın?',t:'one',o:['Nerede yanlış yaptığımı bulmaya çalışırım.','Çözümü inceleyip yeniden denerim.','Birinden açıklamasını isterim.','Sonra bakmak için işaretlerim.','Başka bir soruya geçerim.','Duruma göre değişir.']},
 {q:'Bir soruda benden yardım istediğinde önce ne yapmamı istersin?',t:'one',o:['Küçük bir ipucu ver.','Sorunun ne istediğini açıkla.','Benzer bir örnek göster.','Benimle adım adım çöz.','Önce nerede takıldığımı sor.']},
 {q:'Birlikte çalışırken sana nasıl yol göstermemi istersin?',t:'one',o:['Ne yapacağımı sırayla göster.','Birkaç seçenek sun, ben seçeyim.','Önce ben deneyeyim, gerektiğinde yardım et.','Küçük hedefler belirleyip aralarda ilerlememi göster.','Birlikte deneyip karar verelim.']},
 {q:'Seni daha iyi tanımam için söylemek istediğin başka bir şey var mı?',h:'İstersen yazabilirsin. Bu soruyu boş bırakabilirsin.',t:'long'}
];
const OB_INTRO_T='Navi ile tanışalım! 👋';
const OB_INTRO='Merhaba, ben Navi! Sana uygun çalışmalar hazırlamak için seni biraz tanımak istiyorum. Bu bir sınav değil; doğru ya da yanlış cevap yok. Sana en uygun cevabı seçmen yeterli. İstemediğin soruyu geçebilir, cevaplarını daha sonra değiştirebilirsin.';
const OB_END='Tanıştığımıza sevindim! Birlikte deneyerek sana en uygun çalışma yolunu bulacağız. 🌟';
const isOther=o=>/…$/.test(o);
function obState(){const S=DB.st;S.intro=S.intro||{done:false,a:{}};return S.intro}
function obOpen(step){UI.ob={i:step==null?-1:step};drawOb()}
function drawOb(){let el=$('#obLayer');if(!UI.ob){el&&el.remove();document.body.classList.remove('ob-on');return}
  if(!el){el=document.createElement('div');el.id='obLayer';document.body.appendChild(el)}document.body.classList.add('ob-on');
  const I=obState();const i=UI.ob.i;let inner='';
  if(i===-1)inner=`<div class="ob-intro">${naviFig('welcome',170)}<h2 id="obT">${OB_INTRO_T}</h2><p>${OB_INTRO}</p><button class="btn pri lg ob-go" data-act="obNext">Hadi başlayalım</button></div>`;
  else if(i>=OB_Q.length)inner=`<div class="ob-intro ob-end">${naviFig('celebrate',170)}<p class="ob-endt" id="obT">${OB_END}</p><button class="btn pri lg ob-go" data-act="obClose">Kapat</button></div>`;
  else{const Q=OB_Q[i];const a=I.a[i];const sel=Array.isArray(a&&a.v)?a.v:(a&&a.v!=null?[a.v]:[]);
    let body='';
    if(Q.t==='text')body=`<input class="in big ob-in" id="obTxt" data-inp="obTxt" maxlength="30" value="${esc(a&&a.v||'')}" placeholder="Adın veya takma adın" aria-label="${esc(Q.q)}">`;
    else if(Q.t==='long')body=`<textarea class="ta ob-in" id="obTxt" data-inp="obTxt" maxlength="400" placeholder="İstersen buraya yaz…" aria-label="${esc(Q.q)}">${esc(a&&a.v||'')}</textarea>`;
    else body=`<div class="ob-opts ${Q.t}" role="${Q.t==='one'?'radiogroup':'group'}" aria-labelledby="obT">${Q.o.map((o,k)=>{const on=sel.includes(o);return `<button class="ob-opt ${on?'on':''}" role="${Q.t==='one'?'radio':'checkbox'}" aria-checked="${on}" data-act="obPick" data-v="${k}"><span class="ob-mk">${on?ic('check',13):''}</span><span>${esc(o.replace(/: …$/,''))}</span></button>`}).join('')}</div>
      ${sel.some(isOther)?`<input class="in ob-in" id="obOther" data-inp="obOther" maxlength="60" value="${esc(a&&a.other||'')}" placeholder="Kısaca yaz…" aria-label="Diğer">`:''}
      ${Q.max?`<div class="meta" style="margin-top:6px">${sel.length}/${Q.max} seçildi</div>`:''}`;
    inner=`<div class="ob-top"><span class="ob-n">${i+1} / ${OB_Q.length}</span><div class="ob-bar"><i style="width:${(i)/OB_Q.length*100}%"></i></div><button class="icb" data-act="obLater" aria-label="Daha sonra devam et">${ic('x')}</button></div>
      <div class="ob-q">${navi(i%3===0?'ask':i%3===1?'smile':'wait',52)}<div><h2 id="obT">${esc(Q.q)}</h2>${Q.h?`<p class="ob-h">${esc(Q.h)}</p>`:''}</div></div>${body}
      <div class="ob-foot">${i>0?`<button class="btn sec" data-act="obBack">${ic('cl',15)} Geri</button>`:'<span></span>'}<span class="sp"></span><button class="btn ghost" data-act="obSkip">Bu soruyu geç</button><button class="btn pri" data-act="obNext">${i===OB_Q.length-1?'Bitir':'Devam'} ${ic('cr',15)}</button></div>`}
  el.innerHTML=`<div class="ob-scrim"></div><div class="ob-card" role="dialog" aria-modal="true" aria-labelledby="obT">${inner}</div>`;
  const f=el.querySelector('#obTxt,.ob-opt,.ob-go');f&&setTimeout(()=>f.focus(),30)}
Object.assign(ACT,{
  obNext:()=>{const I=obState();const i=UI.ob.i;if(i>=0&&i<OB_Q.length){const Q=OB_Q[i];if(Q.t==='text'||Q.t==='long'){const v=($('#obTxt')||{}).value||'';if(v.trim())I.a[i]={v:v.trim()};else delete I.a[i]}}save();UI.ob.i=i+1;drawOb()},
  obBack:()=>{UI.ob.i=Math.max(-1,UI.ob.i-1);drawOb()},
  obSkip:()=>{const I=obState();delete I.a[UI.ob.i];save();UI.ob.i++;drawOb()},
  obPick:el=>{const I=obState();const i=UI.ob.i;const Q=OB_Q[i];const o=Q.o[+el.dataset.v];const cur=I.a[i]||{};
    if(Q.t==='one'){I.a[i]={v:o,other:cur.other}}else{let v=Array.isArray(cur.v)?cur.v.slice():[];if(v.includes(o))v=v.filter(x=>x!==o);else{if(Q.max&&v.length>=Q.max){toast(`En fazla ${Q.max} seçenek seçebilirsin`);return}v.push(o)}if(v.length)I.a[i]={v,other:cur.other};else delete I.a[i]}
    save();drawOb()},
  obTxt:el=>{},
  obOther:el=>{const I=obState();const i=UI.ob.i;if(I.a[i]){I.a[i].other=el.value;save()}},
  obLater:()=>{UI.ob=null;drawOb();toast('Tanışma formuna Profil sayfasından devam edebilirsin')},
  obClose:()=>{const I=obState();I.done=true;I.date=stuToday();const nm=I.a[0]&&I.a[0].v;if(nm)DB.st.nick=nm;save();UI.ob=null;drawOb();render();toast('Navi seni tanıdı · önerilerin buna göre hazırlanacak')},
  obEdit:()=>obOpen(0)
});
document.addEventListener('keydown',e=>{if(UI.ob&&e.key==='Escape'){ACT.obLater()}});
/* özet (öğretmen raporu ve profil için) */
function obSummary(){const I=obState();const g=i=>{const a=I.a[i];if(!a)return null;const v=Array.isArray(a.v)?a.v.map(x=>isOther(x)&&a.other?a.other:x.replace(/: …$/,'')):[isOther(a.v)&&a.other?a.other:a.v];return v.join(', ')};
  return OB_Q.map((Q,i)=>({q:Q.q,a:g(i)}))}

/* ---- emoji karakterli öğrenci profil fotoğrafı ---- */
function stuEmoji(size=40){return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" class="stu-emoji" role="img" aria-label="Öğrenci karakteri">
 <circle cx="32" cy="32" r="32" fill="#FFE7A8"/><path d="M8 64c2-12 12-18 24-18s22 6 24 18z" fill="#C2408A"/><path d="M24 46l8 8 8-8" fill="#fff"/>
 <path d="M14 30c0-14 8-22 18-22s18 8 18 22c0 6-2 12-4 16H18c-2-4-4-10-4-16z" fill="#3A2416"/>
 <circle cx="32" cy="31" r="15" fill="#F6C9A0"/><path d="M17 28c3-9 10-13 15-13s12 4 15 13c-6-1-12-5-15-9-3 4-9 8-15 9z" fill="#3A2416"/>
 <ellipse cx="26" cy="31" rx="2.2" ry="2.6" fill="#2B2118"/><ellipse cx="38" cy="31" rx="2.2" ry="2.6" fill="#2B2118"/><circle cx="26.8" cy="30" r=".8" fill="#fff"/><circle cx="38.8" cy="30" r=".8" fill="#fff"/>
 <circle cx="22" cy="36" r="2.6" fill="#F59AA8" opacity=".6"/><circle cx="42" cy="36" r="2.6" fill="#F59AA8" opacity=".6"/><path d="M27 38c2.5 3 7.5 3 10 0" stroke="#7A2E1E" stroke-width="2" fill="none" stroke-linecap="round"/>
 <path d="M44 14l3-5 2 6z" fill="#FFC24B"/><circle cx="47" cy="14" r="3" fill="#FFC24B"/></svg>`}
/* öğrenci kabuğu: avatar yerine emoji karakter */
(function(){const swap=html=>html.replace(/<div class="av" style="background:[^"]*;color:#fff">EY<\/div>/g,`<div class="av av-emoji">${stuEmoji(36)}</div>`).replace(/<span class="av" style="background:[^"]*">EY<\/span>/g,`<span class="av av-emoji">${stuEmoji(30)}</span>`);
  if(typeof stuSidebar==='function'){const _s=stuSidebar;stuSidebar=function(){return swap(_s())}}
  if(typeof stuTop==='function'){const _t=stuTop;stuTop=function(P){return swap(_t(P))}}
  if(typeof parSidebar==='function'){const _p=parSidebar;parSidebar=function(){return _p().replace(/<span class="av" style="background:[^"]*">EY<\/span>/,`<span class="av av-emoji">${stuEmoji(30)}</span>`)}}
})();
/* profil sayfası: büyük emoji avatar + tanışma formu */
if(PAGES['o-profil']){const _pp=PAGES['o-profil'];PAGES['o-profil']=(...a)=>{const P=_pp(...a);const I=obState();const sm=obSummary();const n=sm.filter(x=>x.a).length;
  const card=`<section class="ocard ob-prof">
   <div class="card-hd"><div class="t"><h3 class="o-h" style="font-size:18px">Navi ile tanışma formu</h3><div class="meta">${I.done?`${fmtD(I.date)} tarihinde doldurdun · ${n}/${OB_Q.length} soru cevaplı`:'Henüz tamamlanmadı'}</div></div><button class="btn sm pri" data-act="obEdit">${ic('edit',14)} ${I.done?'Cevaplarımı değiştir':'Forma devam et'}</button></div>
   ${n?`<div class="ob-sum">${sm.filter(x=>x.a).slice(0,8).map(x=>`<div><span>${esc(x.q)}</span><b>${esc(x.a)}</b></div>`).join('')}</div>`:''}</section>`;
  const h=P.html.replace(/<svg class="av-img [^"]*"[\s\S]*?<\/svg>/,`<span class="ob-big">${stuEmoji(84)}</span>`);const i=h.indexOf('</section>')+10;return {...P,html:h.slice(0,i)+card+h.slice(i)}}}
/* ilk girişte otomatik aç */
function obAuto(){if(!DB.st||UI.ob||UI._obShown)return;if(typeof role==='function'&&role()!=='s')return;const I=obState();if(!I.done&&!I.seen){I.seen=1;UI._obShown=1;save();setTimeout(()=>{if(role()==='s')obOpen(-1);else{I.seen=0;UI._obShown=0;save()}},350)}}
