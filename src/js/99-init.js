/* ================= INIT ================= */
if(!location.hash){try{history.replaceState(null,"","#o-home")}catch(e){location.hash="o-home"}}
document.documentElement.classList.toggle('collapsed',UI.collapsed);
UI.navOpen.add(parseHash().r);
onRoute();
