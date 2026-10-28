/* ===== bağlantı kancaları: kütüphane + yapay zekâ taslakları + tanışma formu ===== */
function syncAiDrafts(){if(!DB||!DB.aiDrafts)return;DB.aiDrafts.forEach(x=>{if(!ACTLIB.some(a=>a.id===x.id))ACTLIB.push(x)})}
const _r28=render;render=function(e){try{syncAiDrafts();if(typeof ensureLib==='function')ensureLib()}catch(err){console.error(err)}_r28(e);try{if(typeof role==='function'&&role()!=='s'&&UI.ob){const I=obState();if(!I.done){I.seen=0;UI._obShown=0;save()}UI.ob=null;drawOb()}if(typeof obAuto==='function')obAuto()}catch(err){console.error(err)}};
