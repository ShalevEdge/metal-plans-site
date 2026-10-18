/* SHALVERO FORGE – theme.js: מצב יום/לילה + ניצוצות ומיקרו-אנימציות תעשייתיות (נטען מ-app.js) */
(function(){
'use strict';
if(window.__forgeTheme)return;window.__forgeTheme=1;
const K='forge_theme_v1';let mode='night';try{mode=localStorage.getItem(K)||'night'}catch(e){}
const root=document.documentElement;const apply=()=>{root.classList.toggle('fx-day',mode==='day');const b=document.getElementById('fxTheme');if(b){b.textContent=mode==='day'?'🌙':'☀️';b.title=mode==='day'?'מעבר למצב לילה':'מעבר למצב יום (לסדנה מוארת)'}};
apply();
const css=`
html.fx-day{filter:invert(1) hue-rotate(180deg);background:#fff}
html.fx-day img,html.fx-day video,html.fx-day canvas,html.fx-day picture,html.fx-day .fp-stage,html.fx-day #detail .views svg,html.fx-day .vw svg,html.fx-day .thumb svg,html.fx-day .fx-keep{filter:invert(1) hue-rotate(180deg)}
@media print{html.fx-day,html.fx-day *{filter:none!important}}
#fxTheme{position:fixed;bottom:16px;inset-inline-start:16px;z-index:55;width:46px;height:46px;border-radius:50%;border:1px solid rgba(249,115,22,.6);background:#11161d;color:#fff;font-size:20px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.4);transition:transform .2s}
#fxTheme:hover{transform:rotate(25deg) scale(1.08)}
.fx-spark{position:fixed;width:3px;height:3px;border-radius:50%;pointer-events:none;z-index:80;background:#ffd27a;box-shadow:0 0 6px 2px #f97316;animation:fxsp .55s ease-out forwards}
@keyframes fxsp{to{transform:translate(var(--dx),var(--dy));opacity:0}}
.btn,button.btn,a.btn{transition:transform .12s,box-shadow .2s}
.btn:active{transform:translateY(1px) scale(.98)}
.card,.g-scr{transition:transform .18s,box-shadow .25s}
@media(hover:hover){.grid .card:hover{transform:translateY(-2px)}}
@media(prefers-reduced-motion:reduce){.fx-spark{display:none}.btn,.card{transition:none}}
@media print{#fxTheme,.fx-spark{display:none!important}}`;
const st=document.createElement('style');st.id='fxCss';st.textContent=css;(document.head||root).appendChild(st);
function sparks(x,y){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let i=0;i<12;i++){const s=document.createElement('i');s.className='fx-spark';const a=Math.random()*Math.PI*2,d=20+Math.random()*45;s.style.cssText=`left:${x}px;top:${y}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d+18}px`;document.body.appendChild(s);setTimeout(()=>s.remove(),600)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.btn,.nav-primary,button.fp-b');if(b)sparks(e.clientX,e.clientY)},true);
function btn(){if(document.getElementById('fxTheme')||!document.body)return;const b=document.createElement('button');b.id='fxTheme';b.type='button';b.setAttribute('aria-label','מצב יום/לילה');
 b.onclick=()=>{mode=mode==='day'?'night':'day';try{localStorage.setItem(K,mode)}catch(e){}apply()};document.body.appendChild(b);apply()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',btn);else btn();
try{if(!document.querySelector('script[src$="forge-ui.js"]')){const u=document.createElement('script');u.src='forge-ui.js';(document.head||document.documentElement).appendChild(u)}}catch(e){}
})();
