
(function(){
 const path=location.pathname;
 if(path.includes('/sprachlernapp/')){
  const header=document.querySelector('header.fw50-nav');
  if(header && !document.querySelector('.v63-learningbar')){
   const bar=document.createElement('nav');bar.className='v63-learningbar';bar.setAttribute('aria-label','LERNWERK Navigation');
   const items=[['/sprachlernapp/','Start'],['/sprachlernapp/dashboard.html','Dashboard'],['/sprachlernapp/lernpfad.html','Lernpfad'],['/sprachlernapp/mission.html','Mission'],['/sprachlernapp/practice-lab.html','Practice Lab'],['/sprachlernapp/level-test.html','Level Test'],['/sprachlernapp/passport.html','Passport'],['/sprachlernapp/ai-tutor.html','AI Tutor']];
   bar.innerHTML='<div class="v63-learningbar__inner">'+items.map(([u,t])=>'<a '+(path===u?'aria-current="page" ':'')+'href="'+u+'">'+t+'</a>').join('')+'</div>';header.after(bar);
  }
 }
 window.LW63={
  get(){try{return JSON.parse(localStorage.getItem('sprachwerkQuest')||'{}')}catch(e){return{}}},
  save(s){localStorage.setItem('sprachwerkQuest',JSON.stringify(s));window.SprachwerkCloud?.queueSave?.()},
  addXP(n,lang){const s=this.get();s.xp=(s.xp||0)+n;s.dailyXP=(s.dailyXP||0)+n;s.activity=s.activity||{};const d=new Date().toISOString().slice(0,10);s.activity[d]=(s.activity[d]||0)+n;if(lang){s.languageXP=s.languageXP||{};s.languageXP[lang]=(s.languageXP[lang]||0)+n}s.lastLanguage=lang||s.lastLanguage;this.save(s);return s},
  names:{de:'Deutsch',en:'Englisch',fr:'Französisch',es:'Spanisch',it:'Italienisch',ru:'Russisch',pt:'Portugiesisch'},
  flags:{de:'🇩🇪',en:'🇬🇧',fr:'🇫🇷',es:'🇪🇸',it:'🇮🇹',ru:'🇷🇺',pt:'🇵🇹'},
  levels:['A1','A2','B1','B2','C1'],
  levelForLesson(n){return this.levels[Math.min(4,Math.floor((Number(n)-1)/4))]},
  completedFor(lang){const c=this.get().completed||{};return Object.keys(c).filter(k=>c[k]&&k.startsWith(lang+'-')).length},
  levelProgress(lang,level){const i=this.levels.indexOf(level),c=this.get().completed||{};let n=0;for(let x=i*4+1;x<=i*4+4;x++)if(c[lang+'-'+x])n++;return n},
  streak(){const a=this.get().activity||{};let d=new Date(),n=0;for(;;){const k=d.toISOString().slice(0,10);if((a[k]||0)>0)n++;else if(n>0||k!==new Date().toISOString().slice(0,10))break;d.setDate(d.getDate()-1);if(n>365)break}return n},
  emit(name,detail){window.FW_TRACK?.(name,detail||{});document.dispatchEvent(new CustomEvent('lw63:'+name,{detail:detail||{}}))}
 };
})();
