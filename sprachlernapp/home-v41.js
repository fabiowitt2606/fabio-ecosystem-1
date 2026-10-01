document.addEventListener("DOMContentLoaded",()=>{
  const button=document.querySelector(".v41-menu-button"),menu=document.querySelector(".v41-menu");
  if(button&&menu){button.addEventListener("click",()=>{const open=menu.classList.toggle("open");button.setAttribute("aria-expanded",String(open))});menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{menu.classList.remove("open");button.setAttribute("aria-expanded","false")}));}
  document.querySelectorAll("[data-language-link]").forEach(a=>a.addEventListener("click",()=>{try{const state=JSON.parse(localStorage.getItem("sprachwerkQuest")||"{}");state.lastLanguage=a.dataset.languageLink;state.language=a.dataset.languageLink;localStorage.setItem("sprachwerkQuest",JSON.stringify(state));}catch(e){}}));
  document.querySelectorAll("[data-paypal-donate]").forEach(a=>{const url=window.FW_SITE_CONFIG?.paypalDonationUrl||"";if(url&&!url.includes("DEIN_PAYPAL_BUTTON_ID"))a.href=url;else a.addEventListener("click",e=>{e.preventDefault();alert("Der PayPal-Spendenlink ist noch nicht konfiguriert.")})});
});
// ===== v43 training shortcut =====
document.addEventListener("DOMContentLoaded",()=>{
  const a=document.getElementById("v43-training-link");if(!a)return;
  try{const s=JSON.parse(localStorage.getItem("sprachwerkQuest")||"{}");const lang=["de","en","fr","es","it","ru","pt"].includes(s.lastLanguage)?s.lastLanguage:"en";a.href=`/sprachlernapp/${lang}/?tab=training`;}catch(e){}
});
