/* resmi program görünümü eylemleri */
Object.assign(ACT,{rsSet:el=>{UI.rp[el.dataset.k]=el.dataset.k==='g'?+el.dataset.v:el.dataset.v;render()},rsTog:el=>{UI.rp.open[el.dataset.v]=!UI.rp.open[el.dataset.v];render()},rsAll:()=>{const R=UI.rp;const any=Object.values(R.open).some(Boolean);R.open={};if(!any)RESMI[R.c][R.g].u.forEach(u=>R.open[R.c+R.g+'-'+u.no]=true);render()}});
