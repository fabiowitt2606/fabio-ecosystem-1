(function(){
 const form=document.getElementById('v60-plan-form'), out=document.getElementById('v60-plan-result');
 if(!form||!out)return;
 const goals={general:'Alltag & allgemeine Kommunikation',business:'Beruf & Business',exam:'Prüfungsvorbereitung',travel:'Reise & Alltag',speaking:'Freies Sprechen'};
 const focus={A1:['Grundwortschatz','Aussprache & feste Satzmuster','Basisgrammatik','kurze Hörtexte'],A2:['Alltagswortschatz','Vergangenheit & Modalität','Dialoge','Lesen'],B1:['aktive Redemittel','Nebensätze & Zeiten','Hörverstehen','freies Sprechen'],B2:['Präzision & Kollokationen','komplexe Strukturen','authentische Inhalte','längere Gespräche'],C1:['Register & Nuancen','idiomatische Sprache','Argumentation','fachliche Inhalte']};
 form.addEventListener('submit',e=>{
  e.preventDefault(); const d=new FormData(form), lang=d.get('language'), level=d.get('level'), goal=d.get('goal'), hours=Number(d.get('hours')||3), weeks=Number(d.get('weeks')||8);
  const sessions=Math.max(3,Math.min(7,Math.round(hours*2))); const mins=Math.max(15,Math.round(hours*60/sessions)); const items=focus[level]||focus.B1;
  let html=`<span class="v60-badge">${lang} · ${level} · ${weeks} Wochen</span><h3>Dein persönlicher Lernplan</h3><p>Ziel: <strong>${goals[goal]||goal}</strong>. Plane ca. <strong>${sessions} kurze Einheiten à ${mins} Minuten</strong> pro Woche.</p>`;
  const phases=[['Woche 1–2','Baseline & Routine',items[0]],['Woche 3–4','Aktivierung',items[1]],['Woche 5–6','Expansion',items[2]],['Woche 7–'+weeks,'Transfer & Konsolidierung',items[3]]];
  html+=phases.map(x=>`<div class="v60-plan-week"><strong>${x[0]}</strong><div><b>${x[1]}</b><br>${x[2]} · 1 kurze Wiederholungseinheit pro Woche · aktives Sprechen/Schreiben einplanen.</div></div>`).join('');
  html+=`<div class="v60-actions"><a class="v60-btn alt" href="/sprachlernapp/${d.get('code')||'de'}/">Kurs öffnen</a><a class="v60-btn ghost" href="../downloads/language-resources/8-week-language-learning-plan.pdf" download>Planer als PDF</a></div>`;
  out.innerHTML=html;out.hidden=false;localStorage.setItem('lernwerkPlanV60',JSON.stringify(Object.fromEntries(d.entries())));window.FW_TRACK?.('learning_plan_created',{level,goal,weeks});out.scrollIntoView({behavior:'smooth',block:'nearest'});
 });
 const map={Deutsch:'de',Englisch:'en',Französisch:'fr',Spanisch:'es',Italienisch:'it',Russisch:'ru',Portugiesisch:'pt'};
 const language=form.querySelector('[name=language]');
 language?.addEventListener('change',()=>{let h=form.querySelector('[name=code]');if(!h){h=document.createElement('input');h.type='hidden';h.name='code';form.appendChild(h);}h.value=map[language.value]||'de';});
 language?.dispatchEvent(new Event('change'));
})();
