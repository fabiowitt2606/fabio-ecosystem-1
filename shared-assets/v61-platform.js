(function(){
'use strict';
const cfg=window.FW_SITE_CONFIG||{};
const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const get=(k,d={})=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}};
const set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const toast=(m)=>{let t=qs('.v61-toast');if(!t){t=document.createElement('div');t.className='v61-toast';document.body.appendChild(t)}t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)};
window.FW61={get,set,toast};
// Global search launcher
function searchInit(){
 if(qs('.v61-search-overlay'))return;
 const ov=document.createElement('div');ov.className='v61-search-overlay';ov.innerHTML='<div class="v61-search-box" role="dialog" aria-modal="true" aria-label="Website durchsuchen"><div class="v61-search-head"><input aria-label="Suche" placeholder="Suche in Fabio Ecosystem …"><button class="v61-close" aria-label="Schließen">×</button></div><div class="v61-search-results"><p style="color:#64798b;padding:8px">Tippe mindestens 2 Zeichen.</p></div></div>';document.body.appendChild(ov);
 let index=[];fetch('/search-index-v61.json').then(r=>r.ok?r.json():[]).then(x=>index=x).catch(()=>{});
 const input=qs('input',ov), results=qs('.v61-search-results',ov);
 const open=()=>{ov.classList.add('open');document.body.style.overflow='hidden';setTimeout(()=>input.focus(),30)};
 const close=()=>{ov.classList.remove('open');document.body.style.overflow=''};
 qsa('.fw50-menu').forEach(m=>{if(!qs('.v61-search-trigger',m)){const b=document.createElement('button');b.className='v61-search-trigger';b.type='button';b.textContent='⌕ Suche';b.onclick=open;const c=qs('.fw50-cta',m);m.insertBefore(b,c||null)}});
 qsa('.fw50-mobile__panel').forEach(m=>{if(!qs('[data-v61-search]',m)){const a=document.createElement('a');a.href='#';a.dataset.v61Search='1';a.textContent='⌕ Suche';a.onclick=e=>{e.preventDefault();const d=m.closest('details');if(d)d.removeAttribute('open');open()};const meta=qs('.fw50-mobile__meta',m);m.insertBefore(a,meta||null)}});
 qs('.v61-close',ov).onclick=close;ov.addEventListener('click',e=>{if(e.target===ov)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();if(q.length<2){results.innerHTML='<p style="color:#64798b;padding:8px">Tippe mindestens 2 Zeichen.</p>';return}const hits=index.filter(x=>((x.title||'')+' '+(x.description||'')+' '+(x.text||'')).toLowerCase().includes(q)).slice(0,12);results.innerHTML=hits.length?hits.map(x=>'<a href="'+x.url+'"><b>'+escapeHtml(x.title||x.url)+'</b><span>'+escapeHtml(x.description||'')+'</span></a>').join(''):'<p style="color:#64798b;padding:8px">Keine Treffer.</p>'});
 }
 function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
 // Mobile quick bar
 if(!qs('.v61-mobile-bar')){const bar=document.createElement('nav');bar.className='v61-mobile-bar';bar.setAttribute('aria-label','Schnellnavigation');bar.innerHTML='<a href="/">⌂<br>Start</a><a href="/sprachlernapp/">📚<br>Lernen</a><a href="/my-ecosystem.html">◎<br>Dashboard</a><a href="/sprachschule/trial-lesson.html">📅<br>Termin</a>';document.body.appendChild(bar)}
 searchInit();
})();