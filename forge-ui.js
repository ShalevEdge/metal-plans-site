/* SHALVERO FORGE – forge-ui.js
   שכבת עיצוב "בית מלאכה": תפריט מקובץ, גחלים מרחפות, כותרות מתכת, תפר ריתוך, כרטיסים עם מסמרות וחום,
   אנימציות כניסה, וסודות לגלות (מצב רתך, פטיש, קוד מאסטר, תעודה). נטען מ-theme.js בכל דף. */
(function(){
'use strict';
if(window.__forgeUI)return;window.__forgeUI=1;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const root=document.documentElement;root.classList.add('fu');

const css=`
html.fu body{background:
 radial-gradient(1200px 600px at 85% -10%,rgba(249,115,22,.10),transparent 60%),
 radial-gradient(900px 500px at -10% 110%,rgba(56,189,248,.06),transparent 60%),
 linear-gradient(rgba(148,163,184,.045) 1px,transparent 1px) 0 0/32px 32px,
 linear-gradient(90deg,rgba(148,163,184,.045) 1px,transparent 1px) 0 0/32px 32px,
 #080B0F!important;background-attachment:fixed!important}
#fuEmbers{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.75}
html.fu main,html.fu .top{position:relative;z-index:1}
#fuSeam{position:fixed;top:0;right:0;height:3px;width:0;z-index:90;background:linear-gradient(270deg,#fff7ed,#fbbf24 15%,#f97316 45%,#9a3412 80%,rgba(120,53,15,0));box-shadow:0 0 12px #f97316,0 0 3px #fff;animation:fuSeam 1.1s cubic-bezier(.6,.05,.3,1) forwards}
#fuSeam:after{content:"";position:absolute;left:-4px;top:-5px;width:12px;height:12px;border-radius:50%;background:#fff;box-shadow:0 0 18px 6px #fbbf24;animation:fuTip 1.1s forwards}
@keyframes fuSeam{to{width:100%}}@keyframes fuTip{80%{opacity:1}to{opacity:0}}
html.fu .forge-mark{position:relative;overflow:hidden}
html.fu .forge-mark:after{content:"";position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.55) 50%,transparent 60%);transform:translateX(-120%);animation:fuSheen 5s ease-in-out infinite 1s}
@keyframes fuSheen{0%,70%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
.fu-more{position:relative;display:inline-flex}
.fu-more>button{font:inherit;cursor:pointer;background:rgba(249,115,22,.10);color:#fdba74;border:1px solid rgba(249,115,22,.45);border-radius:999px;padding:6px 14px;font-weight:800;display:flex;gap:6px;align-items:center}
.fu-more>button i{font-style:normal;transition:transform .25s}.fu-more.open>button i{transform:rotate(180deg)}
.fu-panel{position:absolute;top:calc(100% + 10px);inset-inline-end:0;min-width:min(620px,92vw);background:linear-gradient(180deg,#141b23,#0d1218);border:1px solid #2b3540;border-radius:18px;padding:16px;box-shadow:0 30px 60px rgba(0,0,0,.55),0 0 0 1px rgba(249,115,22,.08);display:none;z-index:70;grid-template-columns:repeat(3,1fr);gap:14px}
.fu-more.open .fu-panel{display:grid;animation:fuDrop .22s ease-out}
@keyframes fuDrop{from{opacity:0;transform:translateY(-8px) scale(.98)}}
.fu-panel h5{margin:0 0 6px;font-size:12px;letter-spacing:.6px;color:#fb923c}
.fu-panel a{display:flex!important;gap:10px;align-items:center;padding:8px 10px!important;border-radius:10px;color:#e5e7eb!important;text-decoration:none!important;font-weight:700;white-space:nowrap}
.fu-panel a:hover,.fu-panel a.on{background:rgba(249,115,22,.14)}.fu-panel a em{font-style:normal;width:26px;text-align:center}
@media(max-width:980px){.fu-more{display:none!important}}
@media(min-width:981px){html.fu #forgeNav a.fu-hid{display:none!important}}
html.fu h1:not(#detail h1){background:linear-gradient(100deg,#f8fafc 0%,#cbd5e1 30%,#ffffff 45%,#94a3b8 60%,#e2e8f0 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent!important;-webkit-text-fill-color:transparent;animation:fuMetal 9s linear infinite}
html.fu h1:not(#detail h1) span,html.fu h1:not(#detail h1) em,html.fu h1:not(#detail h1) b{background:none!important;-webkit-text-fill-color:#fb923c;color:#fb923c!important;animation:fuGlow 3.2s ease-in-out infinite}
@keyframes fuGlow{0%,100%{text-shadow:0 0 14px rgba(249,115,22,.25)}50%{text-shadow:0 0 28px rgba(249,115,22,.6),0 0 2px #fed7aa}}
@keyframes fuMetal{to{background-position:-250% 0}}
.fu-bead{display:block;height:6px;margin:10px 0 4px;max-width:260px;border-radius:6px;position:relative;
 background:repeating-radial-gradient(circle at 3px 3px,#fdba74 0 2px,#c2410c 2.5px 3px,transparent 3.5px) 0 0/9px 6px;filter:drop-shadow(0 0 6px rgba(249,115,22,.55));
 clip-path:inset(0 0 0 100%);animation:fuBead 1.6s cubic-bezier(.4,.1,.2,1) .2s forwards}
@keyframes fuBead{to{clip-path:inset(0 0 0 0)}}
.fu-bead:after{content:"";position:absolute;top:-4px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 0 16px 6px #fbbf24;animation:fuBeadTip 1.6s cubic-bezier(.4,.1,.2,1) .2s forwards;right:0;opacity:0}
@keyframes fuBeadTip{0%{right:0;opacity:1}95%{opacity:1}to{right:100%;opacity:0}}
html.fu .card,html.fu .g-scr,html.fu .s-t,html.fu .s-tip,html.fu .stat{position:relative;isolation:isolate;
 background-image:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,0) 40%)!important}
html.fu main .card:before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:-1;
 background:radial-gradient(circle at 12px 12px,#3b4652 2.2px,#1a2129 3px,transparent 3.6px),radial-gradient(circle at calc(100% - 12px) 12px,#3b4652 2.2px,#1a2129 3px,transparent 3.6px),
 radial-gradient(circle at 12px calc(100% - 12px),#3b4652 2.2px,#1a2129 3px,transparent 3.6px),radial-gradient(circle at calc(100% - 12px) calc(100% - 12px),#3b4652 2.2px,#1a2129 3px,transparent 3.6px)}
@property --fuA{syntax:'<angle>';inherits:false;initial-value:0deg}
html.fu main .card:not(#detail .card):after,html.fu .s-t:after{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1.5px;pointer-events:none;opacity:0;transition:opacity .3s;
 background:conic-gradient(from var(--fuA),transparent 0 70%,#f97316 82%,#fff7ed 86%,#f97316 90%,transparent 100%);
 -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
html.fu main .card:hover:after,html.fu .s-t:hover:after{opacity:1;animation:fuSpin 2.2s linear infinite}
@keyframes fuSpin{to{--fuA:360deg}}
html.fu main a.card:hover,html.fu .s-t:hover{box-shadow:0 18px 40px rgba(0,0,0,.45),0 0 30px rgba(249,115,22,.12)!important}
html.fu .btn:not(.ghost){background:linear-gradient(180deg,#fb923c,#ea580c 55%,#c2410c)!important;position:relative;overflow:hidden;
 box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 -2px 0 rgba(0,0,0,.25),0 8px 22px rgba(234,88,12,.35)!important;text-shadow:0 1px 0 rgba(0,0,0,.25)}
html.fu .btn:not(.ghost):before{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.45) 50%,transparent 65%);transform:translateX(-130%);transition:transform .6s;pointer-events:none}
html.fu .btn:not(.ghost):hover:before{transform:translateX(130%)}
html.fu .btn.ghost{background:linear-gradient(180deg,#1b232c,#121820)!important;border-color:#344150!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
html.fu .tag{position:relative;overflow:hidden}
html.fu .tag:after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 40%,rgba(253,186,116,.35) 50%,transparent 60%);transform:translateX(-120%);animation:fuSheen 6s ease-in-out infinite 2s;pointer-events:none}
.fu-rv{opacity:0;transform:translateY(18px) scale(.985);transition:opacity .55s ease,transform .55s cubic-bezier(.2,.7,.2,1)}
.fu-rv.in{opacity:1;transform:none}
#fuToasts{position:fixed;bottom:84px;inset-inline-start:16px;z-index:95;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.fu-toast{pointer-events:auto;background:linear-gradient(180deg,#1c242d,#10161c);border:1px solid #f97316;color:#fff;border-radius:14px;padding:10px 14px;box-shadow:0 14px 30px rgba(0,0,0,.5),0 0 22px rgba(249,115,22,.25);display:flex;gap:10px;align-items:center;max-width:320px;animation:fuToast .35s ease-out}
.fu-toast b{display:block;color:#fdba74}.fu-toast span{font-size:13px;opacity:.85}.fu-toast em{font-style:normal;font-size:26px}
@keyframes fuToast{from{opacity:0;transform:translateY(12px)}}
#fuAnvil{position:fixed;bottom:16px;inset-inline-start:72px;z-index:55;height:46px;border-radius:999px;border:1px solid rgba(249,115,22,.6);background:#11161d;color:#fdba74;font:inherit;font-weight:900;padding:0 14px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.4);display:none;align-items:center;gap:6px}
#fuAnvil.show{display:flex}
.fu-cert{position:fixed;inset:0;z-index:99;background:rgba(3,6,10,.78);display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px)}
.fu-cert>div{width:min(560px,100%);max-height:100%;overflow:auto;background:radial-gradient(circle at 50% 0,rgba(249,115,22,.22),transparent 60%),#0f151c;border:2px solid #f97316;border-radius:22px;padding:24px;color:#fff;text-align:center;box-shadow:0 0 60px rgba(249,115,22,.25)}
.fu-cert h3{margin:4px 0 2px;font-size:28px}.fu-cert ul{list-style:none;padding:0;margin:16px 0;display:grid;gap:8px;text-align:start}
.fu-cert li{display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:12px;border:1px solid #2b3540;background:#121a22}.fu-cert li.no{opacity:.5;filter:grayscale(1)}
.fu-cert li em{font-style:normal;font-size:24px}.fu-cert li small{display:block;opacity:.7}
html.fu-weld,html.fu-weld *{cursor:crosshair!important}
#fuWeld{position:fixed;inset:0;pointer-events:none;z-index:96}
.fu-shake{animation:fuShake .45s cubic-bezier(.36,.07,.19,.97)}
@keyframes fuShake{10%,90%{transform:translate(-1px,1px)}20%,80%{transform:translate(3px,-2px)}30%,50%,70%{transform:translate(-5px,3px)}40%,60%{transform:translate(5px,-3px)}}
html.fu-master h1 span,html.fu-master h1 em,html.fu-master h1 b{-webkit-text-fill-color:#fbbf24!important;color:#fbbf24!important}
html.fu-master .forge-mark{box-shadow:0 0 0 2px #f59e0b,0 0 22px #f59e0b}
@media(prefers-reduced-motion:reduce){#fuEmbers,#fuSeam,.fu-bead:after{display:none}.fu-rv{opacity:1;transform:none}html.fu h1,html.fu h1 *{animation:none}}
@media print{#fuEmbers,#fuSeam,#fuToasts,#fuAnvil,#fuWeld,.fu-bead{display:none!important}html.fu h1,html.fu h1 *{-webkit-text-fill-color:#000!important;color:#000!important;background:none!important}.fu-rv{opacity:1!important;transform:none!important}}
html.fx-day #fuEmbers,html.fx-day #fuWeld{filter:invert(1) hue-rotate(180deg)}
`;
const st=document.createElement('style');st.id='fuCss';st.textContent=css;(document.head||root).appendChild(st);

function seam(){if(RM||!document.body)return;const s=document.createElement('div');s.id='fuSeam';document.body.appendChild(s);setTimeout(()=>s.remove(),1500)}

function embers(){if(RM||document.getElementById('fuEmbers'))return;const c=document.createElement('canvas');c.id='fuEmbers';c.setAttribute('aria-hidden','true');document.body.prepend(c);
 const x=c.getContext('2d');let W,H,P=[];const fit=()=>{const k=Math.min(devicePixelRatio||1,2);W=c.width=innerWidth*k;H=c.height=innerHeight*k;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px'};fit();addEventListener('resize',fit);
 const N=innerWidth<700?14:26,dp=devicePixelRatio||1;const mk=y=>({x:Math.random()*W,y:y==null?H+Math.random()*H*.3:y,r:(Math.random()*1.6+.6)*dp,vy:-(Math.random()*.35+.15)*dp,vx:(Math.random()-.5)*.25,a:Math.random()*.6+.2,t:Math.random()*6.28});
 for(let i=0;i<N;i++)P.push(mk(Math.random()*H));let run=true;document.addEventListener('visibilitychange',()=>{run=!document.hidden;if(run)requestAnimationFrame(tick)});
 function tick(){if(!run)return;x.clearRect(0,0,W,H);for(const p of P){p.t+=.02;p.x+=p.vx+Math.sin(p.t)*.25;p.y+=p.vy;if(p.y<-10)Object.assign(p,mk());
  const g=x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);const al=p.a*(.6+.4*Math.sin(p.t*3));g.addColorStop(0,`rgba(255,237,213,${al})`);g.addColorStop(.35,`rgba(251,146,60,${al*.7})`);g.addColorStop(1,'rgba(234,88,12,0)');
  x.fillStyle=g;x.beginPath();x.arc(p.x,p.y,p.r*4,0,6.283);x.fill()}requestAnimationFrame(tick)}requestAnimationFrame(tick)}

const PRIMARY=['hub.html','start.html','new-job.html','plans.html','projects.html'];
const GROUPS=[['🔧 סדנה',['optimizer.html','production.html','welding.html','inventory.html','workshop.html','gallery.html']],['📊 עסק',['dashboard.html','finance.html','purchasing.html','quotes.html','smart.html']],['⚙️ חשבון',['account.html','pricing.html','order.html']]];
const ICON={'optimizer.html':'📏','production.html':'🏭','welding.html':'⚡','inventory.html':'📦','workshop.html':'🏠','gallery.html':'📸','dashboard.html':'📊','finance.html':'💵','purchasing.html':'🛒','quotes.html':'🧾','smart.html':'🤖','account.html':'👤','pricing.html':'💳','order.html':'🔗'};
function navGroup(){const nav=document.getElementById('forgeNav');if(!nav||nav.dataset.fu)return;const links=[...nav.querySelectorAll(':scope>a')];if(links.length<9)return;nav.dataset.fu=1;
 const href=a=>a.getAttribute('href');const rest=links.filter(a=>!PRIMARY.includes(href(a)));rest.forEach(a=>a.classList.add('fu-hid'));
 const box=document.createElement('div');box.className='fu-more';const anyOn=rest.some(a=>a.classList.contains('on'));const used=new Set();
 const sec=GROUPS.map(([t,hs])=>{const L=hs.map(h=>rest.find(a=>href(a)===h)).filter(Boolean);L.forEach(a=>used.add(a));return L.length?`<div><h5>${t}</h5>${L.map(a=>`<a href="${href(a)}" class="${a.classList.contains('on')?'on':''}"><em>${ICON[href(a)]||'•'}</em>${a.textContent}</a>`).join('')}</div>`:''}).join('');
 const other=rest.filter(a=>!used.has(a));
 box.innerHTML=`<button type="button" aria-expanded="false" style="${anyOn?'background:rgba(249,115,22,.25)':''}">עוד כלים <i>▾</i></button><div class="fu-panel" role="menu">${sec}${other.length?`<div><h5>➕ עוד</h5>${other.map(a=>`<a href="${href(a)}"><em>•</em>${a.textContent}</a>`).join('')}</div>`:''}</div>`;
 nav.appendChild(box);const b=box.querySelector('button');b.onclick=e=>{e.stopPropagation();const o=box.classList.toggle('open');b.setAttribute('aria-expanded',o)};
 document.addEventListener('click',e=>{if(!box.contains(e.target))box.classList.remove('open')});document.addEventListener('keydown',e=>{if(e.key==='Escape')box.classList.remove('open')})}

function beads(){const h=document.querySelector('main h1')||document.querySelector('body h1');if(!h||(h.nextElementSibling&&h.nextElementSibling.classList.contains('fu-bead')))return;const b=document.createElement('i');b.className='fu-bead';b.setAttribute('aria-hidden','true');
 if(getComputedStyle(h).textAlign==='center')b.style.marginInline='auto';h.insertAdjacentElement('afterend',b)}
function reveal(){if(RM||!('IntersectionObserver'in window))return;const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px'});
 const sel='main .card,main .g-scr,main .s-t,main .s-tip,main .stat,main .s-flow a';let i=0;
 const scan=()=>document.querySelectorAll(sel).forEach(el=>{if(el.dataset.fuRv||el.closest('#detail,.fp-ov,.fu-cert'))return;el.dataset.fuRv=1;el.classList.add('fu-rv');el.style.transitionDelay=Math.min((i++%8)*45,315)+'ms';io.observe(el)});scan();
 new MutationObserver(()=>scan()).observe(document.querySelector('main')||document.body,{childList:true,subtree:true})}

const SECRETS=[['weld','🔥','מצב רתך','מקלידים את המילה "ריתוך" (או weld) בכל מקום באתר'],['hammer','🔨','מכת פטיש','5 לחיצות מהירות על הלוגו'],['master','👑','מאסטר המסגרייה','↑ ↑ ↓ ↓ ← → ← → במקלדת'],['night','🌙','משמרת לילה','נכנסים לאתר אחרי 22:00'],['heat','♨️','חום אדום','לחיצה ארוכה (2 שניות) על כפתור כתום']];
let found=LS.get('forge_secrets_v1',{});
function toast(em,t,s){let h=document.getElementById('fuToasts');if(!h){h=document.createElement('div');h.id='fuToasts';document.body.appendChild(h)}const d=document.createElement('div');d.className='fu-toast';d.innerHTML=`<em>${em}</em><div><b>${t}</b><span>${s}</span></div>`;while(h.children.length>2)h.firstChild.remove();h.appendChild(d);setTimeout(()=>{d.style.transition='opacity .4s';d.style.opacity=0;setTimeout(()=>d.remove(),400)},4200)}
function unlock(k){if(found[k])return;found[k]=Date.now();LS.set('forge_secrets_v1',found);const s=SECRETS.find(x=>x[0]===k);const n=Object.keys(found).length;toast(s[1],`גילית סוד: ${s[2]}!`,`${n}/${SECRETS.length} סודות · הסדן בפינה שומר אותם`);anvil();burst(innerWidth/2,innerHeight*.35,40)}
function anvil(){const n=Object.keys(found).length;if(!n||!document.body)return;let a=document.getElementById('fuAnvil');if(!a){a=document.createElement('button');a.id='fuAnvil';a.type='button';a.title='הסודות שגילית';a.onclick=cert;document.body.appendChild(a)}a.textContent=`⚒️ ${n}/${SECRETS.length}`;a.classList.add('show')}
function cert(){const n=Object.keys(found).length,all=n===SECRETS.length;const o=document.createElement('div');o.className='fu-cert';
 o.innerHTML=`<div><div style="font-size:42px">${all?'🏆':'⚒️'}</div><h3>${all?'תעודת מאסטר רתך':'הסודות של הסדנה'}</h3><p style="opacity:.75;margin:0">${all?'מצאת את כל הסודות. כבוד!':`מצאת ${n} מתוך ${SECRETS.length}. יש עוד בסדנה…`}</p>
 <ul>${SECRETS.map(([k,e,t,h])=>`<li class="${found[k]?'':'no'}"><em>${found[k]?e:'❔'}</em><div><b>${found[k]?t:'סוד נעול'}</b><small>${found[k]?h:'רמז: '+h.split(' ').slice(0,2).join(' ')+'…'}</small></div></li>`).join('')}</ul>
 <button class="btn" type="button">חזרה לעבודה</button></div>`;o.onclick=e=>{if(e.target===o||e.target.closest('button'))o.remove()};document.body.appendChild(o);if(all)burst(innerWidth/2,innerHeight/2,90)}
function burst(x0,y0,n){if(RM||!document.body)return;for(let i=0;i<n;i++){const s=document.createElement('i');s.className='fx-spark';const a=Math.random()*6.283,d=40+Math.random()*160;s.style.cssText=`left:${x0}px;top:${y0}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d+40}px;animation-duration:${.5+Math.random()*.6}s`;document.body.appendChild(s);setTimeout(()=>s.remove(),1300)}}
let actx=null;function clang(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const t=actx.currentTime,g=actx.createGain();g.connect(actx.destination);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.35,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+1.1);
 [523,1187,1760,2489].forEach((f,i)=>{const o=actx.createOscillator();o.type=i?'sine':'triangle';o.frequency.setValueAtTime(f,t);const gg=actx.createGain();gg.gain.value=[.6,.35,.22,.12][i];o.connect(gg);gg.connect(g);o.start(t);o.stop(t+1.1)})}catch(e){}}
let weldOn=false,wc=null,wx=null,trail=[];
function weld(on){weldOn=on;root.classList.toggle('fu-weld',on);if(on){if(!wc){wc=document.createElement('canvas');wc.id='fuWeld';document.body.appendChild(wc);wx=wc.getContext('2d');const fit=()=>{wc.width=innerWidth;wc.height=innerHeight};fit();addEventListener('resize',fit);requestAnimationFrame(wtick)}
  toast('🔥','מצב רתך פעיל','הזיזו את העכבר/האצבע. Esc או "ריתוך" שוב – כיבוי')}else{trail=[];if(wx)wx.clearRect(0,0,wc.width,wc.height)}}
function wtick(){if(!wx)return;wx.clearRect(0,0,wc.width,wc.height);const now=performance.now();trail=trail.filter(p=>now-p.t<2600);
 for(let i=1;i<trail.length;i++){const a=trail[i-1],b=trail[i];if(b.t-a.t>120)continue;const age=(now-b.t)/2600,col=age<.08?'255,255,240':age<.3?'253,186,116':age<.6?'234,88,12':'120,113,108';
  wx.strokeStyle=`rgba(${col},${1-age})`;wx.lineWidth=6-age*3;wx.lineCap='round';wx.shadowBlur=age<.3?18:0;wx.shadowColor='#f97316';wx.beginPath();wx.moveTo(a.x,a.y);wx.lineTo(b.x,b.y);wx.stroke()}
 wx.shadowBlur=0;requestAnimationFrame(wtick)}
addEventListener('pointermove',e=>{if(!weldOn)return;trail.push({x:e.clientX,y:e.clientY,t:performance.now()});if(Math.random()<.35&&!RM){const s=document.createElement('i');s.className='fx-spark';const a=Math.random()*6.283,d=10+Math.random()*30;s.style.cssText=`left:${e.clientX}px;top:${e.clientY}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d+20}px`;document.body.appendChild(s);setTimeout(()=>s.remove(),600)}},{passive:true});
let buf='',kseq=[];const KON=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight'];
addEventListener('keydown',e=>{const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
 if(e.key==='Escape'&&weldOn)weld(false);
 kseq.push(e.key);kseq=kseq.slice(-8);if(kseq.join()===KON.join()){root.classList.add('fu-master');try{sessionStorage.setItem('fuM','1')}catch(_){}unlock('master');toast('👑','מאסטר המסגרייה','כותרות בזהב – עד סוף הביקור')}
 if(e.key.length===1){buf=(buf+e.key.toLowerCase()).slice(-8);if(/ריתוך$|weld$/.test(buf)){buf='';weld(!weldOn);unlock('weld')}}});
let taps=[],tapT=null;document.addEventListener('click',e=>{const m=e.target.closest&&e.target.closest('.forge-nav-brand,.forge-mark');if(!m||e.ctrlKey||e.metaKey||e.shiftKey)return;const link=m.closest('a');e.preventDefault();const n=performance.now();taps=taps.filter(t=>n-t<1600);taps.push(n);clearTimeout(tapT);
 if(taps.length>=5){taps=[];clang();document.body.classList.remove('fu-shake');void document.body.offsetWidth;document.body.classList.add('fu-shake');const r=m.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,50);unlock('hammer')}
 else if(link){const c=taps.length;tapT=setTimeout(()=>{if(taps.length===c)location.href=link.href},c===1?380:700)}},true);
let heatT=null,heatB=null;document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.btn:not(.ghost)');if(!b)return;let k=0;heatB=b;clearInterval(heatT);
 heatT=setInterval(()=>{k++;if(k<4)return;b.style.filter=`saturate(${1+k*.08}) brightness(${1+k*.03})`;b.style.boxShadow=`0 0 ${k*3}px ${k}px rgba(249,115,22,${Math.min(.9,k*.05)})`;if(k>=20){clearInterval(heatT);const r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,45);b.style.filter='';b.style.boxShadow='';unlock('heat')}},100)});
const coolDown=()=>{clearInterval(heatT);if(heatB){heatB.style.filter='';heatB.style.boxShadow='';heatB=null}};addEventListener('pointerup',coolDown);addEventListener('pointercancel',coolDown);

function init(){seam();embers();navGroup();beads();reveal();anvil();try{if(sessionStorage.getItem('fuM'))root.classList.add('fu-master')}catch(e){}
 const h=new Date().getHours();if((h>=22||h<5)&&!found.night)setTimeout(()=>unlock('night'),2500);
 let n=0;const iv=setInterval(()=>{navGroup();beads();const nv=document.getElementById('forgeNav');if(++n>20||(nv&&nv.dataset.fu))clearInterval(iv)},150)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
