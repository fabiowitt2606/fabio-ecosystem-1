const LANGS = ['de','en','fr','es','it','ru','pt'];
const state = JSON.parse(localStorage.getItem('sprachwerkQuest') || '{}');
state.language ||= 'en'; state.xp ||= 0; state.streak ||= 0; state.hearts ??= 5; state.completed ||= {}; state.words ||= {}; state.dailyXP ||= 0; state.lastDay ||= '';
const today = new Date().toISOString().slice(0,10); if(state.lastDay!==today){state.dailyXP=0;state.lastDay=today;}
const save=()=>{localStorage.setItem('sprachwerkQuest',JSON.stringify(state));if(typeof queueCloudSave==='function')queueCloudSave();};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const flagPath=code=>`../shared-assets/flags/${code==='en'?'gb':code}.svg`;
const lang=()=>APP_DATA.languages[state.language];
function levelInfo(){const level=Math.floor(state.xp/250)+1, base=(level-1)*250, p=(state.xp-base)/250;return{level,base,p:Math.min(1,p)}}
function updateStats(){const li=levelInfo();$('#player-level').textContent=`Level ${li.level}`;$('#xp-label').textContent=`${state.xp-li.base} / 250 XP`;$('#xp-bar').style.width=`${li.p*100}%`;$('#stat-xp').textContent=state.xp;$('#stat-hearts').textContent=state.hearts;$('#stat-lessons').textContent=Object.values(state.completed).filter(Boolean).length;$('#stat-words').textContent=Object.values(state.words).reduce((a,b)=>a+(b||0),0);$('#streak-label').textContent=`🔥 ${state.streak} Tage`;$('#daily-label').textContent=`${state.dailyXP} / 50 XP`;$('#daily-bar').style.width=`${Math.min(100,state.dailyXP/50*100)}%`;}
function awardXP(n,msg){state.xp+=n;state.dailyXP+=n;state.streak=Math.max(1,state.streak);save();updateStats();toast(`+${n} XP · ${msg}`);renderBadges();}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function renderLanguages(){const grid=$('#language-grid');grid.innerHTML='';LANGS.forEach(code=>{const L=APP_DATA.languages[code], done=Object.keys(state.completed).filter(k=>k.startsWith(code+':')&&state.completed[k]).length, words=Object.keys(state.words).filter(k=>k.startsWith(code+':')).reduce((a,k)=>a+(state.words[k]||0),0), pct=Math.min(100,((done/20)*70+(words/1000)*30));const b=document.createElement('button');b.className='language-card'+(code===state.language?' active':'');b.innerHTML=`<img class="flag" src="${flagPath(code)}" alt=""><h3>${L.name}</h3><p>${L.subtitle}</p><div class="language-progress"><i style="width:${pct}%"></i></div><small>${done}/20 Grammatik · ${words}/1000 Vokabeln</small>`;b.onclick=()=>{state.language=code;save();location.href=`/sprachlernapp/${code}/`};grid.appendChild(b)});}
function renderGrammar(){const L=lang(),map=$('#grammar-map');map.innerHTML='';L.grammar.forEach((lesson,i)=>{const key=`${state.language}:g:${i}`,complete=!!state.completed[key],locked=i>0&&!state.completed[`${state.language}:g:${i-1}`];const el=document.createElement('article');el.className='lesson-card '+(complete?'complete ':'')+(locked?'locked':'');el.innerHTML=`<div class="lesson-num">${complete?'✓':i+1}</div><h3>${lesson.title}</h3><p>${lesson.summary}</p><div class="lesson-footer"><span>${complete?'Abgeschlossen':'+'+(15+i%3*5)+' XP'}</span><button ${locked?'disabled':''}>${locked?'🔒 Gesperrt':complete?'Wiederholen':'Starten'}</button></div>`;if(!locked)el.querySelector('button').onclick=()=>openGrammar(i);map.appendChild(el)});}
function openGrammar(i){const lesson=lang().grammar[i],body=$('#lesson-modal-body');const q=lesson.quiz;body.innerHTML=`<div class="lesson-head"><span class="kicker">Lektion ${i+1} · ${lang().name}</span><h2>${lesson.title}</h2><p>${lesson.summary}</p></div><div class="lesson-rule">${lesson.rule}</div><div class="example-list">${lesson.examples.map(e=>`<div class="example"><strong>${e[0]}</strong><span>${e[1]}</span></div>`).join('')}</div><div class="quiz-box"><strong>Mini-Quiz</strong><p>${q.q}</p><div class="quiz-options">${q.options.map((o,n)=>`<button data-answer="${n}">${o}</button>`).join('')}</div></div>`;body.querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=()=>{const n=Number(btn.dataset.answer);if(n===q.correct){const key=`${state.language}:g:${i}`;if(!state.completed[key]){state.completed[key]=true;awardXP(15+i%3*5,'Grammatiklektion abgeschlossen')}else toast('Richtig ✓');save();renderGrammar();closeModal()}else{state.hearts=Math.max(0,state.hearts-1);save();updateStats();btn.style.borderColor='#ef6262';toast('Noch nicht – versuche es erneut')}});openModal()}
function renderVocab(){const L=lang(),grid=$('#vocab-grid'),query=($('#vocab-search').value||'').toLowerCase();grid.innerHTML='';L.vocab.forEach((cat,i)=>{const key=`${state.language}:v:${i}`,learned=state.words[key]||0;const hay=(cat.name+' '+cat.items.map(x=>x[0]+' '+x[1]).join(' ')).toLowerCase();if(query&&!hay.includes(query))return;const el=document.createElement('article');el.className='vocab-card';el.innerHTML=`<h3>${cat.icon} ${cat.name}</h3><p>${cat.description}</p><div class="vocab-meta"><span>${learned}/50 gelernt</span><span>${Math.round(learned/50*100)}%</span></div><div class="category-progress"><i style="width:${learned/50*100}%"></i></div><button>50 Karten lernen</button>`;el.querySelector('button').onclick=()=>openVocab(i,0);grid.appendChild(el)});}
function openVocab(catIndex,itemIndex){const cat=lang().vocab[catIndex],item=cat.items[itemIndex],body=$('#lesson-modal-body'),key=`${state.language}:v:${catIndex}`;body.innerHTML=`<div class="lesson-head"><span class="kicker">${cat.icon} ${cat.name} · Karte ${itemIndex+1}/50</span><h2>Vokabelarena</h2></div><div class="flashcard"><div><div class="target">${item[0]}</div><div class="translation">${item[1]}</div><div class="example-text">${item[2]}</div></div></div><div class="flash-nav"><button class="secondary" id="prev-word" style="color:#17324d;border-color:#dce7ee;background:#f5f9fb">← Zurück</button><button class="primary" id="know-word">Kann ich ✓</button><button class="secondary" id="next-word" style="color:#17324d;border-color:#dce7ee;background:#f5f9fb">Weiter →</button></div>`;$('#prev-word').onclick=()=>openVocab(catIndex,(itemIndex+49)%50);$('#next-word').onclick=()=>openVocab(catIndex,(itemIndex+1)%50);$('#know-word').onclick=()=>{state.words[key]=Math.max(state.words[key]||0,itemIndex+1);awardXP(2,'Vokabel gelernt');save();renderVocab();if(itemIndex===49)closeModal();else openVocab(catIndex,itemIndex+1)};openModal()}
const badges=[['🌱','Erster Schritt','1 Lektion abschließen',()=>Object.values(state.completed).filter(Boolean).length>=1],['🧠','Grammar Brain','10 Lektionen abschließen',()=>Object.values(state.completed).filter(Boolean).length>=10],['🏆','Grammar Master','50 Lektionen abschließen',()=>Object.values(state.completed).filter(Boolean).length>=50],['📚','Word Collector','100 Vokabeln lernen',()=>Object.values(state.words).reduce((a,b)=>a+(b||0),0)>=100],['💎','Word Vault','1.000 Vokabeln lernen',()=>Object.values(state.words).reduce((a,b)=>a+(b||0),0)>=1000],['🔥','On Fire','7 Tage Streak',()=>state.streak>=7],['🌍','Polyglot','In 3 Sprachen lernen',()=>new Set(Object.keys(state.completed).filter(k=>state.completed[k]).map(k=>k.split(':')[0])).size>=3],['⭐','XP Hero','2.500 XP erreichen',()=>state.xp>=2500]];
function renderBadges(){const grid=$('#badge-grid');grid.innerHTML='';badges.forEach(b=>{const unlocked=b[3]();const el=document.createElement('article');el.className='badge'+(unlocked?'':' locked');el.innerHTML=`<div class="badge-icon">${b[0]}</div><h3>${b[1]}</h3><p>${b[2]}</p><small>${unlocked?'Freigeschaltet ✓':'Noch gesperrt'}</small>`;grid.appendChild(el)})}
function renderAll(){renderLanguages();$('#active-language-title').textContent=lang().name;$('#active-language-subtitle').textContent=lang().subtitle;renderGrammar();renderVocab();renderBadges();updateStats()}
function openModal(){$('#lesson-modal').classList.add('open');$('#lesson-modal').setAttribute('aria-hidden','false')}function closeModal(){$('#lesson-modal').classList.remove('open');$('#lesson-modal').setAttribute('aria-hidden','true')}$$('[data-close]').forEach(x=>x.onclick=closeModal);
$$('.mode-tab').forEach(btn=>btn.onclick=()=>{$$('.mode-tab').forEach(x=>x.classList.remove('active'));$$('.mode-panel').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const p=$('#'+btn.dataset.mode+'-panel');if(p)p.classList.add('active')});
const vs=$('#vocab-search');if(vs)vs.addEventListener('input',renderVocab);
$$('[data-scroll]').forEach(b=>b.onclick=()=>{const t=$(b.dataset.scroll);if(t)t.scrollIntoView({behavior:'smooth'})});
const legacyNav=$('.nav-toggle'),legacyMenu=$('.main-nav');if(legacyNav&&legacyMenu)legacyNav.onclick=()=>legacyMenu.classList.toggle('open');
if($('#language-grid')&&$('#grammar-map')&&$('#vocab-grid')&&$('#badge-grid'))renderAll();



// ===== v19 Supabase cloud accounts =====
let cloudClient = null;
let cloudUser = null;
let cloudProfile = null;
let cloudSaveTimer = null;
let cloudReady = false;

function isSupabaseConfigured() {
  const cfg = window.SUPABASE_CONFIG || {};
  return !!(
    cfg.url &&
    cfg.publishableKey &&
    !cfg.url.includes("YOUR-PROJECT") &&
    !cfg.publishableKey.includes("YOUR_")
  );
}

function cloudToast(msg) {
  if (typeof toast === "function") return toast(msg);
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast show";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2600);
}

function cloudStatus(message, online=false) {
  const el = document.getElementById("account-status");
  if (!el) return;
  el.classList.toggle("is-online", online);
  const text = el.querySelector("span:last-child");
  if (text) text.textContent = message;
}

function cloudLevel(xp) {
  // Keep the same level model as the app dashboard.
  return Math.floor((xp || 0) / 250) + 1;
}

function applyCloudState(remoteState) {
  if (!remoteState || typeof remoteState !== "object") return;
  // Mutate the existing app state object so existing render functions keep working.
  const defaults = {
    language: "en", xp: 0, streak: 0, hearts: 5,
    completed: {}, words: {}, dailyXP: 0, lastDay: ""
  };
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, defaults, remoteState);
  localStorage.setItem("sprachwerkQuest", JSON.stringify(state));
  if (typeof renderAll === "function") renderAll();
}

function cloudSnapshot() {
  return JSON.parse(JSON.stringify(state));
}

async function fetchCloudProfile() {
  if (!cloudClient || !cloudUser) return null;
  const { data, error } = await cloudClient
    .from("profiles")
    .select("username")
    .eq("id", cloudUser.id)
    .single();
  if (error) {
    console.warn("Profile load:", error.message);
    return null;
  }
  return data;
}

async function fetchCloudProgress() {
  if (!cloudClient || !cloudUser) return null;
  const { data, error } = await cloudClient
    .from("user_progress")
    .select("state, updated_at")
    .eq("user_id", cloudUser.id)
    .single();
  if (error) {
    console.warn("Progress load:", error.message);
    return null;
  }
  return data;
}

async function saveCloudNow() {
  if (!cloudReady || !cloudClient || !cloudUser) return;
  const payload = cloudSnapshot();
  const { error } = await cloudClient
    .from("user_progress")
    .upsert({
      user_id: cloudUser.id,
      state: payload,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
  if (error) {
    console.warn("Cloud save:", error.message);
    cloudStatus("Sync-Fehler – lokaler Cache aktiv", true);
  } else {
    cloudStatus(`Cloud-Sync aktiv · ${cloudProfile?.username || cloudUser.email}`, true);
  }
}

function queueCloudSave() {
  if (!cloudReady || !cloudUser) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(saveCloudNow, 650);
}
window.queueCloudSave = queueCloudSave;

function grammarCloudPercent() {
  const completed = Object.values(state.completed || {}).filter(Boolean).length;
  return Math.min(100, Math.round(completed / 140 * 100));
}
function vocabCloudPercent() {
  const learned = Object.values(state.words || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
  return Math.min(100, Math.round(learned / 7000 * 100));
}

function refreshCloudAccountUI() {
  const username = cloudProfile?.username || cloudUser?.user_metadata?.username || "Gast";
  const profileUsername = document.getElementById("profile-username");
  const avatar = document.getElementById("account-avatar");
  const logout = document.getElementById("logout-btn");
  const level = document.getElementById("profile-level");
  const xp = document.getElementById("profile-xp");
  const streak = document.getElementById("profile-streak");
  const gLabel = document.getElementById("grammar-progress-label");
  const gBar = document.getElementById("grammar-progress-bar");
  const vLabel = document.getElementById("vocab-progress-label");
  const vBar = document.getElementById("vocab-progress-bar");

  if (!cloudUser) {
    if (profileUsername) profileUsername.textContent = "Gast";
    if (avatar) avatar.textContent = "?";
    if (logout) logout.hidden = true;
    if (level) level.textContent = "1";
    if (xp) xp.textContent = "0";
    if (streak) streak.textContent = "0";
    if (gLabel) gLabel.textContent = "0%";
    if (gBar) gBar.value = 0;
    if (vLabel) vLabel.textContent = "0%";
    if (vBar) vBar.value = 0;
    return;
  }

  if (profileUsername) profileUsername.textContent = username;
  if (avatar) avatar.textContent = username.slice(0,1).toUpperCase();
  if (logout) logout.hidden = false;
  if (level) level.textContent = cloudLevel(state.xp);
  if (xp) xp.textContent = state.xp || 0;
  if (streak) streak.textContent = state.streak || 0;
  const gp = grammarCloudPercent(), vp = vocabCloudPercent();
  if (gLabel) gLabel.textContent = gp + "%";
  if (gBar) gBar.value = gp;
  if (vLabel) vLabel.textContent = vp + "%";
  if (vBar) vBar.value = vp;
}

async function loadCloudUser(user) {
  cloudUser = user || null;
  if (!cloudUser) {
    cloudProfile = null;
    cloudReady = false;
    cloudStatus("Nicht angemeldet");
    refreshCloudAccountUI();
    return;
  }

  cloudStatus("Cloud-Profil wird geladen …", true);
  cloudProfile = await fetchCloudProfile();
  const progress = await fetchCloudProgress();
  if (progress?.state && Object.keys(progress.state).length) {
    applyCloudState(progress.state);
  } else {
    // First login: upload the current local cache so existing progress is not lost.
    await cloudClient.from("user_progress").upsert({
      user_id: cloudUser.id,
      state: cloudSnapshot(),
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
  }
  cloudReady = true;
  cloudStatus(`Cloud-Sync aktiv · ${cloudProfile?.username || cloudUser.email}`, true);
  refreshCloudAccountUI();
}

async function initSupabaseCloud() {
  if (!isSupabaseConfigured()) {
    cloudStatus("Supabase noch nicht konfiguriert");
    document.querySelectorAll("#register-form input,#login-form input,#register-form button,#login-form button")
      .forEach(el => el.disabled = true);
    const note = document.getElementById("cloud-config-note");
    if (note) note.hidden = false;
    return;
  }

  if (!window.supabase?.createClient) {
    cloudStatus("Supabase SDK konnte nicht geladen werden");
    return;
  }

  const cfg = window.SUPABASE_CONFIG;
  cloudClient = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  const { data: { session } } = await cloudClient.auth.getSession();
  await loadCloudUser(session?.user || null);

  cloudClient.auth.onAuthStateChange(async (_event, session) => {
    await loadCloudUser(session?.user || null);
  });

  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");

  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;

    if (username.length < 3 || password.length < 8) {
      cloudToast("Benutzername mindestens 3, Passwort mindestens 8 Zeichen.");
      return;
    }

    const { data, error } = await cloudClient.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });

    if (error) {
      cloudToast("Registrierung fehlgeschlagen: " + error.message);
      return;
    }

    registerForm.reset();
    if (data.session) {
      cloudToast("Account erstellt und angemeldet.");
    } else {
      cloudToast("Account erstellt. Bitte E-Mail bestätigen und danach einloggen.");
    }
  });

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const { error } = await cloudClient.auth.signInWithPassword({ email, password });
    if (error) {
      cloudToast("Login fehlgeschlagen. E-Mail und Passwort prüfen.");
      return;
    }
    loginForm.reset();
    cloudToast("Willkommen zurück!");
  });

  logoutBtn?.addEventListener("click", async () => {
    await saveCloudNow();
    await cloudClient.auth.signOut();
    cloudToast("Ausgeloggt.");
  });
}

document.addEventListener("DOMContentLoaded", initSupabaseCloud);
window.SprachwerkCloud = {
  saveNow: saveCloudNow,
  queueSave: queueCloudSave,
  getUser: () => cloudUser
};

// ===== v20 Verbtabellen =====
function initVerbTables(){
 const sel=document.getElementById("verb-language"),q=document.getElementById("verb-search"),grid=document.getElementById("verb-grid"),dlg=document.getElementById("verb-dialog"),out=document.getElementById("verb-dialog-content");
 if(!sel||!grid||!window.VERB_DATA)return;
 sel.innerHTML=Object.entries(VERB_META).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join("");
 sel.value=(typeof state!=="undefined"&&VERB_DATA[state.language])?state.language:"de";
 const render=()=>{let s=(q.value||"").toLowerCase();grid.innerHTML=VERB_DATA[sel.value].filter(v=>v.verb.toLowerCase().includes(s)).map(v=>`<button class="verb-card" data-r="${v.rank}"><b>${v.rank}</b><span><strong>${v.verb}</strong><small>${v.translation}</small></span><em>Konjugieren →</em></button>`).join("")};
 grid.onclick=e=>{let b=e.target.closest(".verb-card");if(!b)return;let v=VERB_DATA[sel.value][+b.dataset.r-1],pr=VERB_META[sel.value][1];let tab=(t,a)=>`<div class="tense-card"><h4>${t}</h4>${pr.map((p,i)=>`<div class="conj-row"><span>${p}</span><strong>${a[i]}</strong></div>`).join("")}</div>`;out.innerHTML=`<span class="app-kicker">${VERB_META[sel.value][0]} · #${v.rank}</span><h2>${v.verb}</h2><div class="tense-grid">${tab("Präsens",v.present)}${tab("Vergangenheit",v.past)}${tab("Zukunft",v.future)}</div><p class="verb-note">${v.exact?"Explizit hinterlegte Konjugation.":"Regelbasiertes Lernparadigma; unregelmäßige Formen bitte mit der Grammatiklektion abgleichen."}</p>`;dlg.showModal()};
 sel.onchange=render;q.oninput=render;document.getElementById("verb-dialog-close").onclick=()=>dlg.close();dlg.onclick=e=>{if(e.target===dlg)dlg.close()};render()
}
document.addEventListener("DOMContentLoaded",initVerbTables);


// v21: language cards on the main learning path open dedicated language pages.
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll("[data-lang]").forEach(el=>{
    const code=el.dataset.lang;
    if(!["de","en","fr","es","it","ru","pt"].includes(code)) return;
    el.style.cursor="pointer";
    el.addEventListener("click",(ev)=>{
      // On the dashboard, language selection now opens its dedicated page.
      if(location.pathname.endsWith("/sprachlernapp/") || location.pathname.endsWith("/sprachlernapp/index.html")){
        ev.preventDefault(); ev.stopImmediatePropagation();
        location.href=`/sprachlernapp/${code}/`;
      }
    },true);
  });
});



// ===== v24 professional dashboard, placement, PWA =====
function swState(){try{return JSON.parse(localStorage.getItem("sprachwerkQuest")||"{}")}catch{return{}}}
function swSave(s){localStorage.setItem("sprachwerkQuest",JSON.stringify(s));window.SprachwerkCloud?.queueSave?.()}
function levelFromXP(xp){return Math.floor((xp||0)/250)+1}
function renderProDashboard(){
 if(!document.getElementById("dash-level"))return;
 const s=swState(),xp=s.xp||0,streak=s.streak||0,daily=s.dailyXP||0;
 const name=(document.getElementById("profile-username")?.textContent||"").trim();
 document.getElementById("dash-greeting").textContent=name&&name!=="Gast"?`Guten Tag, ${name}`:"Willkommen bei Sprachwerk";
 document.getElementById("dash-level").textContent=levelFromXP(xp);
 document.getElementById("dash-xp").textContent=`${xp} XP`;
 document.getElementById("dash-daily").textContent=`${daily} / 50`;
 document.getElementById("dash-daily-bar").value=Math.min(50,daily);
 document.getElementById("dash-streak").textContent=`${streak} Tage`;
 const now=Date.now(),srs=s.srs||{},due=Object.values(srs).filter(x=>x.due<=now).length;
 document.getElementById("dash-due").textContent=due+(s.errors?.length||0);
 const langs={de:"Deutsch",en:"Englisch",fr:"Französisch",es:"Spanisch",it:"Italienisch",ru:"Russisch",pt:"Portugiesisch"};
 let recent=s.lastLanguage||s.language||"en";
 document.getElementById("continue-learning").href=`/sprachlernapp/${recent}/`;
 document.getElementById("dash-next-copy").textContent=`Nächster Schritt: ${langs[recent]||"Englisch"} weiterlernen.`;
 const bars=document.getElementById("weekly-bars"); let total=0;
 let days=["So","Mo","Di","Mi","Do","Fr","Sa"],activity=s.activity||{};
 bars.innerHTML="";
 for(let i=6;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);let key=d.toISOString().slice(0,10),v=activity[key]||0;total+=v;bars.innerHTML+=`<div><span style="height:${Math.min(100,10+v)}%"></span><small>${days[d.getDay()]}</small></div>`}
 document.getElementById("weekly-total").textContent=`${total} XP`;
 const grid=document.getElementById("activity-grid");grid.innerHTML="";
 for(let i=27;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);let key=d.toISOString().slice(0,10),v=activity[key]||0;grid.innerHTML+=`<span class="heat h${v?Math.min(4,Math.ceil(v/20)):0}" title="${key}: ${v} XP"></span>`}
 const rec=document.getElementById("recommendations"),errs=s.errors||[];
 rec.innerHTML=errs.length?`<div class="rec-item"><strong>${errs.length} Fehler wiederholen</strong><span>Starte mit deinen zuletzt falschen Grammatikfragen.</span></div>`:`<div class="rec-item"><strong>1 Grammatiklektion</strong><span>+ 10 Vokabeln + 5 Wiederholungen für dein Tagesziel.</span></div>`;
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(renderProDashboard,100));

let placement={lang:"de",index:0,score:0,answers:0,difficulty:0};
const levelOrder=["A1","A2","B1","B2","C1"];
function startPlacement(){
 placement={lang:document.getElementById("placement-language").value,index:0,score:0,answers:0,difficulty:0};
 renderPlacementQuestion();
 document.getElementById("placement-dialog").showModal();
}
function renderPlacementQuestion(){
 const bank=window.PLACEMENT_BANK?.[placement.lang]||[];
 if(placement.answers>=15||placement.index>=bank.length){finishPlacement();return}
 // adaptive: pick a question near current difficulty if available
 let target=levelOrder[Math.max(0,Math.min(levelOrder.length-1,placement.difficulty))];
 let q=bank.find((x,i)=>!x.used&&x.level===target)||bank.find(x=>!x.used);
 if(!q){finishPlacement();return}
 q.used=true;placement.current=q;
 document.getElementById("placement-content").innerHTML=`<span class="app-kicker">Frage ${placement.answers+1}</span><h2>${q.level} · ${q.q}</h2><div class="placement-options">${q.a.map((a,i)=>`<button data-place-answer="${i}">${a}</button>`).join("")}</div><p>Die Schwierigkeit passt sich nach jeder Antwort an.</p>`;
}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-place-answer]");if(!b)return;
 let correct=Number(b.dataset.placeAnswer)===placement.current.correct;
 placement.answers++;if(correct){placement.score++;placement.difficulty=Math.min(4,placement.difficulty+1)}else placement.difficulty=Math.max(0,placement.difficulty-1);
 renderPlacementQuestion();
});
function finishPlacement(){
 const pct=placement.answers?placement.score/placement.answers:0;
 let idx=Math.max(0,Math.min(4,Math.round((placement.difficulty+pct*4)/2)));
 let lvl=levelOrder[idx],s=swState();s.placement=s.placement||{};s.placement[placement.lang]={level:lvl,score:placement.score,total:placement.answers,date:new Date().toISOString()};s.lastLanguage=placement.lang;swSave(s);
 document.getElementById("placement-content").innerHTML=`<span class="app-kicker">Ergebnis</span><h2>Empfohlenes Niveau: ${lvl}</h2><p>${placement.score} von ${placement.answers} Fragen richtig.</p><a class="app-btn app-btn--primary" href="/sprachlernapp/${placement.lang}/">Lernpfad ${lvl} starten →</a>`;
}
document.addEventListener("DOMContentLoaded",()=>{
 document.getElementById("start-placement")?.addEventListener("click",startPlacement);
 document.getElementById("placement-close")?.addEventListener("click",()=>document.getElementById("placement-dialog").close());
 if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
});
let deferredPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;let b=document.getElementById("install-app");if(b)b.hidden=false});
document.addEventListener("click",async e=>{if(e.target.id==="install-app"&&deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;e.target.hidden=true}});



// ===== v25 onboarding + mastery summary =====
function v25State(){try{return JSON.parse(localStorage.getItem("sprachwerkQuest")||"{}")}catch{return{}}}
function v25Save(s){localStorage.setItem("sprachwerkQuest",JSON.stringify(s));window.SprachwerkCloud?.queueSave?.()}
const LANG_NAMES={de:"Deutsch",en:"Englisch",fr:"Französisch",es:"Spanisch",it:"Italienisch",ru:"Russisch",pt:"Portugiesisch"};

function renderOnboarding(){
 const s=v25State(),o=s.onboarding;
 if(!o)return;
 document.getElementById("onboarding-status").textContent=`${LANG_NAMES[o.lang]} · ${o.current} → ${o.target}`;
 document.getElementById("goal-language").value=o.lang;document.getElementById("current-level").value=o.current;document.getElementById("target-level").value=o.target;document.getElementById("daily-minutes").value=o.minutes;document.getElementById("motivation").value=o.motivation;if(o.date)document.getElementById("target-date").value=o.date;
 const plan=document.getElementById("study-plan");plan.hidden=false;
 document.getElementById("plan-days").textContent=o.minutes>=45?5:6;
 document.getElementById("plan-minutes").textContent=(o.minutes*(o.minutes>=45?5:6))+" Min.";
 document.getElementById("plan-priority").textContent=o.motivation==="beruf"?"Business + Sprechen":o.motivation==="pruefung"?"Grammatik + Tests":"Wortschatz + Kommunikation";
 document.getElementById("plan-next").textContent=o.current+" weiterlernen";
}
document.addEventListener("DOMContentLoaded",()=>{
 const f=document.getElementById("onboarding-form");
 f?.addEventListener("submit",e=>{
   e.preventDefault();let s=v25State();
   s.onboarding={lang:document.getElementById("goal-language").value,current:document.getElementById("current-level").value,target:document.getElementById("target-level").value,minutes:Number(document.getElementById("daily-minutes").value),motivation:document.getElementById("motivation").value,date:document.getElementById("target-date").value};
   s.lastLanguage=s.onboarding.lang;v25Save(s);renderOnboarding();renderMasteryOverview()
 });
 renderOnboarding();renderMasteryOverview()
});

function renderMasteryOverview(){
 const box=document.getElementById("mastery-summary");if(!box)return;
 const s=v25State(),m=s.mastery||{},lang=s.lastLanguage||s.language||"en";
 let vals=Array.from({length:20},(_,i)=>m[lang+"-"+(i+1)]||0);
 let avg=Math.round(vals.reduce((a,b)=>a+b,0)/20);
 box.innerHTML=`<div class="mastery-total"><span>${LANG_NAMES[lang]}</span><strong>${avg}%</strong><small>Gesamt-Mastery</small></div><div class="mastery-topic-grid">${vals.map((v,i)=>`<a href="/sprachlernapp/${lang}/" class="mastery-topic ${v<50?"low":v<80?"mid":"high"}"><span>L${i+1}</span><strong>${v}%</strong></a>`).join("")}</div>`;
}



// ===== v26 Free/Pro entitlement layer =====
async function getEntitlement(){
 const fallback={plan:"free",status:"local"};
 try{
   if(window.SprachwerkCloud?.getUser?.() && typeof cloudClient!=="undefined" && cloudClient){
     const u=window.SprachwerkCloud.getUser();const {data}=await cloudClient.from("subscriptions").select("plan,status,current_period_end").eq("user_id",u.id).maybeSingle();
     if(data)return data;
   }
 }catch(e){}
 return fallback;
}
window.SprachwerkEntitlement={get:getEntitlement};
document.addEventListener("DOMContentLoaded",async()=>{
 const ent=await getEntitlement();document.body.dataset.plan=ent.plan||"free";
 const badge=document.createElement("a");badge.href="pricing.html";badge.className="plan-badge";badge.textContent=(ent.plan||"free").toUpperCase();document.body.appendChild(badge);
});

// ===== v27 monetisation gates =====
const FREE_LIMITS={grammarLessons:4,vocabCards:100,storiesPerLevel:1};
async function swPlan(){
 try{
  if(typeof cloudClient!=="undefined"&&cloudClient&&window.SprachwerkCloud?.getUser?.()){
   const u=window.SprachwerkCloud.getUser();const {data}=await cloudClient.from("subscriptions").select("plan,status,current_period_end").eq("user_id",u.id).maybeSingle();
   if(data&&["active","trialing"].includes(data.status))return data.plan||"pro";
  }
 }catch(e){}
 return "free";
}
window.SprachwerkPlan={get:swPlan,limits:FREE_LIMITS};
function showUpgrade(reason="Diese Funktion ist Teil von Sprachwerk Pro."){
 const d=document.createElement("div");d.className="paywall-modal";d.innerHTML=`<div><button class="paywall-close">×</button><span class="app-kicker">Sprachwerk Pro</span><h2>Weiterlernen ohne Limits</h2><p>${reason}</p><a class="app-btn app-btn--primary" href="pricing.html">Pro ansehen</a><small>7 Tage Testphase sind technisch vorbereitet; finale Bedingungen vor Livegang festlegen.</small></div>`;document.body.appendChild(d);d.querySelector(".paywall-close").onclick=()=>d.remove();d.onclick=e=>{if(e.target===d)d.remove()}
}
window.showSprachwerkUpgrade=showUpgrade;

document.addEventListener("DOMContentLoaded",()=>{const d={A1:["Hafen der Grundlagen","Begrüßungen, Basisgrammatik und die ersten wichtigen Wörter meistern.",0],A2:["Insel des Alltags","Alltag, Reisen und Standardsituationen sicher bewältigen.",20],B1:["Handelsroute","Längere Gespräche führen und selbstständiger kommunizieren.",40],B2:["Sturmmeer","Komplexe Grammatik und anspruchsvollere Hörtexte meistern.",60],C1:["Schatzinsel","Nuancen verstehen und die Sprache flexibel einsetzen.",80]};let s={};try{s=JSON.parse(localStorage.getItem("sprachwerkQuest")||"{}")}catch(e){};let cc=document.getElementById("coin-count");if(cc)cc.textContent=s.coins||0;let ns=document.querySelectorAll(".quest-node");ns.forEach(n=>n.onclick=()=>{ns.forEach(x=>x.classList.remove("active"));n.classList.add("active");let a=d[n.dataset.level],c=Object.keys(s.completed||{}).length,p=Math.min(100,Math.max(a[2],c*5));document.getElementById("quest-title").textContent=n.dataset.level+" · "+a[0];document.getElementById("quest-copy").textContent=a[1];document.getElementById("quest-progress-bar").style.width=p+"%";document.getElementById("quest-progress-text").textContent=p+" % abgeschlossen";document.getElementById("quest-start").onclick=()=>location.href="/sprachlernapp/"+(s.lastLanguage||s.language||"en")+"/"});document.querySelector(".quest-node.active")?.click()});


// ===== v39 language-first navigation =====
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll("[data-language-link]");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const code = card.dataset.languageLink;
      try {
        const state = JSON.parse(localStorage.getItem("sprachwerkQuest") || "{}");
        state.lastLanguage = code;
        localStorage.setItem("sprachwerkQuest", JSON.stringify(state));
      } catch (_) {}
    });
  });

  const mission = document.getElementById("quest-start");
  if (mission) {
    mission.addEventListener("click", (e) => {
      e.preventDefault();
      let code = "en";
      try {
        const state = JSON.parse(localStorage.getItem("sprachwerkQuest") || "{}");
        code = state.lastLanguage || state.language || "en";
      } catch (_) {}
      location.href = `language-${code}.html`;
    }, true);
  }
});
