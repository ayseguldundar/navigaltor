/* ===== Gerçek yapay zekâ bağlantısı =====
   Öğretmen giriş yapmışsa (window.naviAuth, /app/oturum.js) "Yapay zekâdan iste" Claude ile özgün taslak üretir.
   Giriş yoksa demo davranışı (hazır yapıdan uyarlama) sürer ve bu açıkça belirtilir. */
(function(){
  // Yapay zekânın önerdiği görsel parametreleri beklenmedikse sayfa bozulmasın.
  const _vr=VIS.render;
  VIS.render=function(v,k){try{return _vr(v,k)}catch(e){console.warn('Görsel çizilemedi',e);const t=v&&v.type;
    return `<figure class="vis"><div class="vis-body"><div class="vis-stat">${VIS_IC[t]||'🖼️'} ${esc(VIS_NM[t]||'Görsel')}</div></div>${v&&v.caption?`<figcaption>${ic('info',13)} ${esc(v.caption)}</figcaption>`:''}</figure>`}};

  const live=()=>!!(window.naviAuth&&window.naviAuth.isStaff&&window.naviAuth.isStaff());
  const _gen=ACT.aiGen;
  ACT.aiGen=async function(){
    if(!live())return _gen();
    const F=UI.ai;F.busy=true;F.res=null;F.err='';render();
    const G=RESMI[F.c]&&RESMI[F.c][F.g];const u=G?(G.u[F.u]||G.u[0]):null;
    const b21=(window.B21&&B21[F.c]&&B21[F.c][F.g]&&u&&B21[F.c][F.g][u.no])||null;
    let structure='';try{const base=aiBuild({...F,v:1});structure=base.steps.map(s=>s.title+' ('+s.mode+')').join(' → ')}catch(e){}
    try{
      const r=await window.naviAuth.callFn('yz-etkinlik',{course:F.c,grade:+F.g,unit:u?u.ad:'',
        outcome:F.k||(u?[].concat(u.kapsam||[]).join(' '):''),level:F.lvl,duration:F.dur,format:F.fmt,note:F.note||'',
        skills21:b21?b21.s:[],digital:b21?b21.d:[],structure});
      const a=r.activity||{};
      F.res={...a,course:F.c,grade:+F.g,themeNo:u?u.no:0,themeName:u?u.ad:(a.themeName||''),
        kazanim:Array.isArray(a.kazanim)&&a.kazanim.length?a.kazanim:[F.k],tools:a.tools||[],digital:a.digital||[],
        steps:(a.steps||[]).map(s=>({warn:'',...s,items:s.items||[]})),checklist:a.checklist||[],navi:a.navi||[],rubric:a.rubric||[],
        diff:a.diff||{destek:'',ileri:''},aiLevel:F.lvl,live:true};
      F.v=(F.v||0)+1;F.quota=r.quota||null;
    }catch(e){F.err=e.message||'Taslak üretilemedi.'}
    F.busy=false;render();
    const el=$('.ai-res')||$('.ai-err');el&&el.scrollIntoView({behavior:'smooth',block:'start'});
  };

  const _form=aiForm;
  aiForm=function(){
    const F=UI.ai;let h=_form();
    const banner=live()
      ?`<div class="ai-mode on">${ic('spark',14)} <b>Gerçek yapay zekâ açık.</b> Taslak, seçtiğiniz kazanım ve öğrenci düzeyine göre Claude ile özgün üretilir (yaklaşık 30–60 sn). Öğrenci bilgisi gönderilmez.${F&&F.quota?` · Bugün: ${F.quota.used+1}/${F.quota.limit}`:''}</div>`
      :`<div class="ai-mode">${ic('info',14)} <b>Demo modu:</b> taslak hazır etkinlik yapısından uyarlanır. Gerçek yapay zekâ için <a href="/giris#ogretmen">öğretmen hesabıyla giriş yapın</a>.</div>`;
    if(F&&F.err)h=h.replace('</section>',`<div class="ai-err" role="alert">${ic('alert',14)} ${esc(F.err)}</div></section>`);
    return banner+h};

  // Gerçek üretimde "Başka bir taslak üret" yeni bir istek gönderir.
  ACT.aiAgain=()=>ACT.aiGen();
})();
