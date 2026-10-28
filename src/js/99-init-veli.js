/* ================= INIT (veli paneli) ================= */
if(!location.hash||!location.hash.startsWith('#v-')){try{history.replaceState(null,"","#v-home")}catch(e){location.hash="v-home"}}
document.documentElement.classList.toggle('collapsed',UI.collapsed);
onRoute();
