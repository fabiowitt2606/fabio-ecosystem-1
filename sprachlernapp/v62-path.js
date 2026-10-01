(()=>{
const langs={de:{name:'Deutsch',flag:'🇩🇪'},en:{name:'Englisch',flag:'🇬🇧'},fr:{name:'Französisch',flag:'🇫🇷'},es:{name:'Spanisch',flag:'🇪🇸'},it:{name:'Italienisch',flag:'🇮🇹'},ru:{name:'Russisch',flag:'🇷🇺'},pt:{name:'Portugiesisch',flag:'🇵🇹'}};
const levels=[
 {id:'A1',name:'Grundlagen',goal:'Einfache Sätze verstehen und bilden, über dich selbst sprechen und zentrale Alltagssituationen bewältigen.'},
 {id:'A2',name:'Alltag',goal:'In häufigen Alltagssituationen selbstständiger kommunizieren und vertraute Themen genauer beschreiben.'},
 {id:'B1',name:'Selbstständig',goal:'Zusammenhängend sprechen, Erfahrungen erklären und die wichtigsten beruflichen und privaten Situationen bewältigen.'},
 {id:'B2',name:'Sicher kommunizieren',goal:'Komplexere Inhalte verstehen, differenziert argumentieren und spontan mit Muttersprachlern interagieren.'},
 {id:'C1',name:'Fortgeschritten',goal:'Sprache flexibel, präzise und situationsgerecht in anspruchsvollen privaten und beruflichen Kontexten verwenden.'}
];
const q=new URLSearchParams(location.search);let code=q.get('lang')||'de';if(!langs[code])code='de';
const info=langs[code],data=APP_DATA.languages[code],grammar=(window.GRAMMAR_V23||{})[code]||[];
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
document.title=`LERNWERK · ${info.name} Lernpfad A1–C1`;
document.getElementById('v62-path-title').textContent=`${info.flag} ${info.name}: Dein Lernpfad A1–C1`;
document.getElementById('v62-path-intro').textContent=`20 Grammatiklektionen, 20 thematische Wortschatzkategorien und 1.000 Wörter – in einer klaren Reihenfolge von den Grundlagen bis zur fortgeschrittenen Kommunikation.`;
document.getElementById('v62-open-language').href=`/sprachlernapp/${code}/`;
document.getElementById('v62-path-switch').innerHTML=Object.entries(langs).map(([c,x])=>`<a class="${c===code?'active':''}" href="lernpfad.html?lang=${c}">${x.flag} ${x.name}</a>`).join('');
const cats=data.vocab||[];
const root=document.getElementById('v62-path-levels');
root.innerHTML=levels.map((lv,li)=>{
 const gl=grammar.filter(x=>x.cefr===lv.id); const vc=cats.slice(li*4,li*4+4);
 return `<details class="v62-path-level" ${li===0?'open':''}><summary><span class="v62-level-badge">${lv.id}</span><div><h2>${lv.name}</h2><p>${lv.goal}</p></div><span class="v62-path-count">4 Grammatik · 4 Kategorien · 200 Wörter</span></summary><div class="v62-path-body"><div class="v62-path-col"><h3>📘 Grammatik – in empfohlener Reihenfolge</h3><div class="v62-lesson-list">${gl.map(g=>`<a class="v62-path-item" href="/sprachlernapp/${code}/?tab=grammar&lesson=${g.id}"><span><b>Lektion ${g.id}: ${esc(g.title)}</b><small>${esc(g.summary)} · ${esc(g.rule)}</small></span><em>Lernen →</em></a>`).join('')}</div></div><div class="v62-path-col"><h3>🧠 Wortschatz – thematisch lernen</h3><div class="v62-vocab-list">${vc.map(c=>`<a class="v62-path-item" href="/sprachlernapp/${code}/?tab=vocab&category=${encodeURIComponent(c.name)}"><span><b>${esc(c.icon||'💬')} ${esc(c.name)}</b><small>${esc(c.description)} · ${(c.items||[]).length} Wörter</small></span><em>Trainieren →</em></a>`).join('')}</div></div></div></details>`;
}).join('');
})();
