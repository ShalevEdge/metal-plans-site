/* SHALVERO FORGE – forge-plus.js (נטען אחרי worksheet.js בדף התוכניות)
   תלת-ממד מסתובב + אנימציית הרכבה · מצב סדנה (צעד-צעד, הקראה, התקדמות) · QR בדף המודפס
   מחשבון פינות 45° · מדבקות לחלקים · שליחה לעובד · קישור לחתימת לקוח */
(function(){
'use strict';
if(typeof show!=='function'||typeof plan!=='function')return;
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const F=n=>Math.round(n).toLocaleString('en-US');
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const b64=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const base=()=>location.href.replace(/[^/]*$/,'');
const planUrl=id=>base()+'plans.html#'+encodeURIComponent(id);
const FRAME=/מסגרת|קורה|עמוד|רגל|משקוף|מיתר|קורת|זרוע|מאחז|טבעת|בסיס|מוביל/;
let CUR=null,CURID='';

/* ---------- QR (ספרייה חיצונית, נטענת בעצלות; אם לא נטענה – פשוט לא מוצג) ---------- */
let qrP=null;
function qrLib(){if(window.qrcode)return Promise.resolve(window.qrcode);if(qrP)return qrP;
 qrP=new Promise(r=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';s.onload=()=>r(window.qrcode||null);s.onerror=()=>r(null);document.head.appendChild(s)});return qrP}
async function qrSvg(text,cell){const q=await qrLib();if(!q)return'';try{const o=q(0,'M');o.addData(text);o.make();return o.createSvgTag({cellSize:cell||3,margin:1,scalable:true})}catch(e){return''}}

/* ---------- 1. תלת-ממד מסתובב + הרכבה ---------- */
const pal=r=>{try{return(PAINT&&(r==='m'||r==='post')&&typeof PAINTS!=='undefined'&&PAINTS[PAINT])?PAINTS[PAINT]:((COL[r]||COL.m))}catch(e){return['#DCE1E6','#F1F3F5','#B9C1CA']}};
function open3D(){const p=CUR;if(!p)return;
 const mdl=p.model.filter(e=>e.A&&e.B);const keyOf=e=>e.n?e.n+'|'+e.p:'';
 const parts=p.parts.map((r,i)=>({i,key:r[0]+'|'+r[1],r}));
 const order=[...mdl].sort((a,b)=>{const w=e=>!e.n?3:FRAME.test(e.n)?0:(e.role==='post'?1:2);return w(a)-w(b)});
 let ex=[1e9,-1e9,1e9,-1e9,1e9,-1e9];for(const e of mdl)for(const q of[...e.A,...e.B]){ex[0]=Math.min(ex[0],q[0]);ex[1]=Math.max(ex[1],q[0]);ex[2]=Math.min(ex[2],q[1]);ex[3]=Math.max(ex[3],q[1]);ex[4]=Math.min(ex[4],q[2]);ex[5]=Math.max(ex[5],q[2])}
 const c=[(ex[0]+ex[1])/2,(ex[2]+ex[3])/2,(ex[4]+ex[5])/2],R=Math.max(ex[1]-ex[0],ex[3]-ex[2],ex[5]-ex[4])*.75||1000;
 const FC=mdl.map(e=>({e,f:faces(e)}));
 let yaw=-.7,pitch=.45,zoom=1,hi=null,shown=mdl.length,anim=null;
 const ov=document.createElement('div');ov.className='fp-ov';ov.innerHTML=`<div class="fp-3d"><div class="fp-bar"><b>🧊 ${E(p.name)} – תלת-ממד</b><span class="fp-mut">גוררים כדי לסובב · גלגלת / צביטה לזום · נוגעים בחלק ברשימה כדי להדגיש</span><button class="fp-x" aria-label="סגירה">✕</button></div>
 <div class="fp-body"><div class="fp-stage"><svg id="fp3" viewBox="-1 -1 2 2" preserveAspectRatio="xMidYMid meet"></svg><div class="fp-cap" id="fpCap"></div></div>
 <div class="fp-side"><div class="fp-btns"><button class="btn" id="fpPlay">▶ הצג הרכבה</button><button class="btn ghost" id="fpReset">⟲ איפוס</button></div>
 <div class="fp-views"><button data-v="front">חזית</button><button data-v="side">צד</button><button data-v="top">על</button><button data-v="iso">איזומטרי</button></div>
 <ol class="fp-list">${parts.map(x=>`<li data-k="${E(x.key)}"><b>${x.i+1}</b> ${E(x.r[0])} <span>${F(x.r[2])} × ${x.r[3]}</span></li>`).join('')}</ol></div></div></div>`;
 document.body.appendChild(ov);document.body.classList.add('fp-lock');
 const svg=ov.querySelector('#fp3'),cap=ov.querySelector('#fpCap');
 function draw(){const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  const T=q=>{const x=q[0]-c[0],y=-(q[1]-c[1]),z=q[2]-c[2];const x1=x*cy-z*sy,z1=x*sy+z*cy;const y2=y*cp-z1*sp,z2=y*sp+z1*cp;return[x1/R*zoom,-y2/R*zoom,z2]};
  const N=n=>{const x=n[0],y=-n[1],z=n[2];const x1=x*cy-z*sy,z1=x*sy+z*cy;return[x1,y*cp-z1*sp,y*sp+z1*cp]};
  const vis=new Set(order.slice(0,shown));const P=[];
  for(const{e,f}of FC){if(!vis.has(e))continue;const hk=hi&&keyOf(e)===hi;
   for(const fc of f){const n=N(fc.N);if(n[2]>-1e-6)continue;const pts=fc.F.map(T),d=pts.reduce((a,q)=>a+q[2],0)/pts.length;
    const col=pal(e.role),li=Math.max(0,-n[2])*.5+Math.max(0,n[1])*.5,fill=hk?'#F97316':(n[1]>.5?col[1]:(li>.55?col[0]:col[2]));
    P.push({d,pts,fill,hk})}}
  P.sort((a,b)=>b.d-a.d);
  svg.innerHTML=P.map(o=>`<polygon points="${o.pts.map(q=>q[0].toFixed(4)+','+q[1].toFixed(4)).join(' ')}" fill="${o.fill}" stroke="${o.hk?'#7C2D12':'#1F2328'}" stroke-width="${o.hk?1.6:.7}" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`).join('')}
 let raf=0;const req=()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;draw()})};
 let drag=null,pinch=null;
 svg.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY,yaw,pitch];svg.setPointerCapture(e.pointerId)});
 svg.addEventListener('pointermove',e=>{if(!drag)return;yaw=drag[2]+(e.clientX-drag[0])*.01;pitch=Math.max(-1.5,Math.min(1.5,drag[3]+(e.clientY-drag[1])*.01));req()});
 svg.addEventListener('pointerup',()=>drag=null);svg.addEventListener('pointercancel',()=>drag=null);
 svg.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.4,Math.min(4,zoom*(e.deltaY<0?1.1:.9)));req()},{passive:false});
 svg.addEventListener('touchmove',e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch)zoom=Math.max(.4,Math.min(4,zoom*d/pinch));pinch=d;drag=null;req()}},{passive:true});
 svg.addEventListener('touchend',()=>pinch=null);
 ov.querySelectorAll('.fp-list li').forEach(li=>li.onclick=()=>{const k=li.dataset.k;hi=hi===k?null:k;ov.querySelectorAll('.fp-list li').forEach(x=>x.classList.toggle('on',x.dataset.k===hi));draw()});
 const VW={front:[0,0],side:[-Math.PI/2,0],top:[0,1.5],iso:[-.7,.45]};
 ov.querySelectorAll('.fp-views button').forEach(b=>b.onclick=()=>{[yaw,pitch]=VW[b.dataset.v];req()});
 ov.querySelector('#fpReset').onclick=()=>{clearInterval(anim);anim=null;[yaw,pitch]=VW.iso;zoom=1;hi=null;shown=mdl.length;cap.textContent='';ov.querySelectorAll('.fp-list li').forEach(x=>x.classList.remove('on'));req()};
 ov.querySelector('#fpPlay').onclick=()=>{clearInterval(anim);shown=0;req();const step=Math.max(60,Math.min(450,9000/order.length));
  anim=setInterval(()=>{shown++;const e=order[shown-1];if(e&&e.n){const ix=parts.findIndex(x=>x.key===keyOf(e));cap.textContent=`${ix>=0?ix+1+' · ':''}${e.n}`}
   if(shown>=order.length){clearInterval(anim);anim=null;cap.textContent='✓ ההרכבה הושלמה'}req()},step)};
 const close=()=>{clearInterval(anim);ov.remove();document.body.classList.remove('fp-lock');removeEventListener('keydown',esc,true)};
 const esc=e=>{if(e.key==='Escape'){e.stopImmediatePropagation();e.preventDefault();close()}};addEventListener('keydown',esc,true);
 ov.querySelector('.fp-x').onclick=close;ov.addEventListener('click',e=>{if(e.target===ov)close()});draw()}

/* ---------- 2. מצב סדנה (צעד-צעד) ---------- */
function stepsFromGuide(){const g=document.getElementById('wsGuide');if(!g)return[];const out=[];
 g.querySelectorAll('details.ws-s').forEach(d=>{const t=(d.querySelector('summary')||{}).textContent||'';if(/מילון/.test(t))return;
  const items=[...d.querySelectorAll(':scope .ws-b > ol.ws-steps > li, :scope .ws-b > ul.ws-chk > li, :scope .ws-b ol.ws-steps ul.ws-chk > li')];
  const seen=new Set();for(const li of items){const c=li.cloneNode(true);c.querySelectorAll('ul').forEach(u=>u.remove());const txt=c.textContent.replace(/\s+/g,' ').trim();if(!txt||seen.has(txt))continue;seen.add(txt);out.push({sec:t.trim(),html:c.innerHTML,txt})}});return out}
function confetti(host){const cs=['#F97316','#FBBF24','#22C55E','#38BDF8','#F43F5E'];for(let i=0;i<70;i++){const s=document.createElement('i');s.className='fp-cf';s.style.cssText=`left:${Math.random()*100}%;background:${cs[i%5]};animation-delay:${Math.random()*.6}s;transform:rotate(${Math.random()*360}deg)`;host.appendChild(s);setTimeout(()=>s.remove(),2600)}}
function openWorkshop(){const p=CUR;if(!p)return;const S=stepsFromGuide();if(!S.length)return;
 const KEY='forge_ws_progress_'+CURID;let done=LS.get(KEY,{}),i=Math.min(S.length-1,LS.get(KEY+'_i',0)),voice=LS.get('forge_ws_voice',false);
 const ov=document.createElement('div');ov.className='fp-ov fp-wm';document.body.appendChild(ov);document.body.classList.add('fp-lock');
 const say=t=>{try{speechSynthesis.cancel();if(!voice)return;const u=new SpeechSynthesisUtterance(t);u.lang='he-IL';u.rate=.95;const hv=speechSynthesis.getVoices().find(v=>/^he|iw/i.test(v.lang));if(hv)u.voice=hv;speechSynthesis.speak(u)}catch(e){}};
 function render(){const s=S[i],n=Object.keys(done).filter(k=>done[k]).length,pct=Math.round(n/S.length*100);
  ov.innerHTML=`<div class="fp-wbox"><div class="fp-wtop"><b>🛠️ מצב סדנה</b><span>${E(p.name)}</span><button class="fp-x" aria-label="יציאה">✕</button></div>
  <div class="fp-prog"><i style="width:${pct}%"></i></div><p class="fp-wmeta">צעד ${i+1} מתוך ${S.length} · הושלמו ${n} (${pct}%)</p>
  <p class="fp-wsec">${E(s.sec)}</p><div class="fp-wtxt ${done[i]?'ok':''}">${s.html}</div>
  <div class="fp-wbtns"><button class="fp-b fp-prev" ${i===0?'disabled':''}>→ הקודם</button><button class="fp-b fp-done ${done[i]?'on':''}">${done[i]?'✓ בוצע':'סימון: בוצע'}</button><button class="fp-b fp-next">${i===S.length-1?'סיום 🏁':'הבא ←'}</button></div>
  <div class="fp-wfoot"><button class="fp-v">${voice?'🔊 הקראה: פועלת':'🔈 הקראה: כבויה'}</button><button class="fp-r">איפוס התקדמות</button></div></div>`;
  ov.querySelector('.fp-x').onclick=close;
  ov.querySelector('.fp-prev').onclick=()=>{if(i>0){i--;save();render();say(S[i].txt)}};
  ov.querySelector('.fp-next').onclick=()=>{if(i<S.length-1){i++;save();render();say(S[i].txt)}else finish()};
  ov.querySelector('.fp-done').onclick=()=>{done[i]=!done[i];save();if(done[i]&&i<S.length-1){i++;render();say(S[i].txt)}else if(done[i])finish();else render()};
  ov.querySelector('.fp-v').onclick=()=>{voice=!voice;LS.set('forge_ws_voice',voice);render();say(S[i].txt)};
  ov.querySelector('.fp-r').onclick=()=>{done={};i=0;save();render()}}
 function finish(){const n=Object.keys(done).filter(k=>done[k]).length;render();const box=ov.querySelector('.fp-wbox');
  box.insertAdjacentHTML('beforeend',`<div class="fp-fin">${n===S.length?'🎉 כל הכבוד! כל הצעדים הושלמו':'🏁 הגעת לסוף. נשארו '+(S.length-n)+' צעדים לא מסומנים'}</div>`);if(n===S.length){confetti(ov);say('כל הכבוד! הפרויקט הושלם')}}
 const save=()=>{LS.set(KEY,done);LS.set(KEY+'_i',i)};
 const key=e=>{if(e.key==='Escape'){e.stopImmediatePropagation();e.preventDefault();close();return}if(e.key==='ArrowLeft')ov.querySelector('.fp-next')?.click();if(e.key==='ArrowRight')ov.querySelector('.fp-prev')?.click()};addEventListener('keydown',key,true);
 function close(){try{speechSynthesis.cancel()}catch(e){}ov.remove();document.body.classList.remove('fp-lock');removeEventListener('keydown',key,true)}
 render();say(S[i].txt)}

/* ---------- 3. פינות 45° ---------- */
function miterHTML(p){const fr=p.parts.map((r,i)=>({r,i})).filter(x=>FRAME.test(x.r[0])&&!x.r[4]);if(!fr.length)return'';
 return`<div class="fp-card" data-sec="cut"><h3>📐 פינות ב-45° (מחשבון)</h3><p class="fp-mut">ברירת המחדל בתוכנית היא חיתוך ישר 90°. מי שמעדיף פינות 45° (נראה נקי יותר) – בוחר חלק:</p>
 <div class="fp-row"><select id="fpMi">${fr.map(x=>`<option value="${x.i}">#${x.i+1} ${E(x.r[0])} – ${F(x.r[2])} מ״מ (${E(x.r[1])})</option>`).join('')}</select></div><div id="fpMo" class="fp-mo"></div></div>`}
function bindMiter(p){const s=document.getElementById('fpMi'),o=document.getElementById('fpMo');if(!s)return;
 const upd=()=>{const r=p.parts[+s.value],w=+String(r[1]).split('×')[0]||40;
  o.innerHTML=`<p>אם החלק הזה <b>נכנס בין שני חלקים</b> בפינות (נוגע בהם מבפנים): אורך חיצוני לחיתוך 45° = <b>${F(r[2])} + 2 × ${w} = ${F(r[2]+2*w)} מ״מ</b>.</p><p>אם החלק הזה <b>עובר לכל האורך</b> (החלקים האחרים נוגעים בו): האורך נשאר <b>${F(r[2])} מ״מ</b>, רק חותכים את הקצוות ב-45°.</p><p class="fp-mut">ב-45° שני החלקים בכל פינה נחתכים בזווית – ואז כולם באורך החיצוני. מודדים מהקצה החיצוני (הצד הארוך) של החיתוך.</p>`};
 s.onchange=upd;upd()}

/* ---------- 4. מדבקות לחלקים ---------- */
function printLabels(){const p=CUR;if(!p)return;const L=[];p.parts.forEach(([n,pr,l,q,a],i)=>{for(let k=1;k<=q;k++)L.push({i:i+1,n,pr,l,a,k,q})});
 const w=window.open('','_blank');if(!w){alert('יש לאפשר חלונות קופצים');return}
 w.document.write(`<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>מדבקות – ${E(p.name)}</title><style>@page{size:A4;margin:8mm}body{font-family:Heebo,Arial,sans-serif;margin:0}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}.l{border:1.5px dashed #444;border-radius:3mm;padding:2.5mm 3mm;height:33mm;box-sizing:border-box;break-inside:avoid;display:flex;gap:3mm;align-items:center}.n{font-size:30pt;font-weight:900;min-width:16mm;text-align:center;border:2px solid #000;border-radius:50%;width:16mm;height:16mm;line-height:15mm;font-size:16pt}.t b{display:block;font-size:11pt}.t span{font-size:9.5pt;display:block}.big{font-size:15pt!important;font-weight:900}.c{font-size:7.5pt;color:#555}h1{font-size:13pt;margin:0 0 3mm}</style></head><body><h1>מדבקות לחלקים · ${E(p.name)} · ${E(sz(p))} · ${L.length} מדבקות</h1><div class="g">${L.map(x=>`<div class="l"><div class="n">${x.i}</div><div class="t"><b>${E(x.n)}</b><span class="big">${F(x.l)} מ״מ</span><span dir="ltr" style="text-align:right">${E(x.pr)}${x.a?' · '+x.a+'°':''}</span><span class="c">${x.k}/${x.q} · ${E(CURID)}</span></div></div>`).join('')}</div><script>onload=()=>setTimeout(()=>print(),300)<\/script></body></html>`);w.document.close()}

/* ---------- 5. שליחה לעובד ---------- */
function workerForm(){const box=document.getElementById('fpWorker');if(!box)return;box.hidden=!box.hidden;if(box.hidden)return;
 let S={};try{S=getSet()}catch(e){}
 box.innerHTML=`<div class="fp-row"><label>שם העובד<input id="fpWn"></label><label>טלפון העובד (וואטסאפ)<input id="fpWp" inputmode="tel" placeholder="05X-XXXXXXX"></label><label>תאריך יעד<input id="fpWd" type="date"></label></div><label class="fp-full">הערות לעובד<textarea id="fpWt" rows="2" placeholder="למשל: לצבוע אפור אנתרציט, התקנה ביום ה׳"></textarea></label>
 <div class="fp-row"><button class="btn" id="fpWs">שליחה בוואטסאפ 📲</button><button class="btn ghost" id="fpWc">העתקת קישור</button></div><p class="fp-mut">העובד מקבל קישור לדף משימה: התוכנית, מצב סדנה, רשימת בדיקה וכפתור "סיימתי" שחוזר אליך בוואטסאפ. בלי פרטי לקוח.</p>`;
 const link=()=>base()+'worker.html#d='+b64({v:1,id:CURID,name:CUR.name,size:sz(CUR),w:document.getElementById('fpWn').value.trim(),due:document.getElementById('fpWd').value,notes:document.getElementById('fpWt').value.trim(),boss:(S.biz||''),bp:(S.phone||''),parts:CUR.parts.reduce((a,r)=>a+r[3],0)});
 const ph=v=>{v=String(v||'').replace(/\D/g,'');return v.startsWith('0')?'972'+v.slice(1):v};
 document.getElementById('fpWs').onclick=()=>{const t=`שלום ${document.getElementById('fpWn').value.trim()}, יש לך משימה חדשה: ${CUR.name} (${sz(CUR)}).\nכל הפרטים כאן:\n${link()}`;window.open('https://wa.me/'+ph(document.getElementById('fpWp').value)+'?text='+encodeURIComponent(t),'_blank')};
 document.getElementById('fpWc').onclick=e=>{navigator.clipboard?.writeText(link()).then(()=>e.target.textContent='הועתק ✓',()=>{})}}

/* ---------- 6. קישור לחתימת לקוח ---------- */
function signLink(){const q=s=>document.querySelector(s);const rows=[...document.querySelectorAll('#qsum tr')];const tot=rows.length?rows[rows.length-1].lastElementChild.textContent.trim():'';
 const net=(rows.find(r=>/לפני מע/.test(r.textContent))||{lastElementChild:{textContent:''}}).lastElementChild.textContent.trim();
 const d={v:1,biz:(q('#qb')||{}).value||'',bp:(q('#qp')||{}).value||'',cust:(q('#qc')||{}).value||'',item:CUR.name+' – '+sz(CUR),mat:((q('#mt')||{}).selectedOptions||[{}])[0].textContent||'',net,tot,date:new Date().toISOString().slice(0,10),valid:14,plan:CURID,no:'Q'+Date.now().toString().slice(-6)};
 if(!tot){alert('קודם ממלאים את מחשבון הצעת המחיר');return}
 const url=base()+'sign.html#d='+b64(d),ph=String(d.bp).replace(/\D/g,'');
 const box=document.getElementById('fpSign');box.hidden=false;box.innerHTML=`<p>קישור לחתימה נוצר עבור <b>${E(d.cust||'הלקוח')}</b> · סה״כ <b>${E(tot)}</b>.</p><div class="fp-row"><button class="btn" id="fpSw">שליחה ללקוח בוואטסאפ 📲</button><button class="btn ghost" id="fpSc">העתקת קישור</button></div><p class="fp-mut">הלקוח פותח, קורא, חותם באצבע ומאשר – והאישור חוזר אליך בוואטסאפ. שמרו את ה-PDF החתום שהלקוח מוריד.</p>`;
 document.getElementById('fpSw').onclick=()=>window.open('https://wa.me/?text='+encodeURIComponent(`שלום${d.cust?' '+d.cust:''}, מצורפת הצעת מחיר ל${d.item} (${tot}).\nלצפייה ואישור בחתימה:\n${url}`),'_blank');
 document.getElementById('fpSc').onclick=e=>navigator.clipboard?.writeText(url).then(()=>e.target.textContent='הועתק ✓',()=>{})}


/* ---------- 7. שליחת שרטוט + הסבר פשוט בוואטסאפ ---------- */
function liTexts(re,max){const d=[...document.querySelectorAll('#wsGuide details.ws-s')].find(x=>re.test((x.querySelector('summary')||{}).textContent||''));if(!d)return[];
 return[...d.querySelectorAll('li')].map(li=>{const c=li.cloneNode(true);c.querySelectorAll('ul,.ws-box,svg').forEach(u=>u.remove());return c.textContent.replace(/\s+/g,' ').trim()}).filter(Boolean).slice(0,max)}
function waText(link,nimg){const p=CUR,L=[];const sep='────────';
 L.push(`🔧 *${p.name}*`,`📏 ${sz(p)}`,nimg?`📷 שלחתי לך ${nimg} תמונות: השרטוט מכל הכיוונים + רשימת חיתוך. כל המידות במ״מ.`:'','',sep,'*✂️ שלב 1 – חיתוך*');
 p.parts.forEach(([n,pr,l,q,a],i)=>L.push(`${i+1}) ${n} – ${q} חתיכות באורך *${F(l)} מ״מ* (${(l/10).toFixed(1).replace(/\.0$/,'')} ס״מ) · פרופיל ${pr}${a?` · קצוות בזווית ${a}°`:''}`));
 L.push('💡 כותבים על כל חתיכה את המספר שלה בטוש.');try{const SL=spacingLines();if(SL.length){L.push('',sep,'*📏 מרווחים (חשוב!)*');SL.forEach(x=>L.push('• '+x.txt));L.push(`💡 קוצב באורך ${fmt(SL[0].g.gap)} מ״מ בין חלק לחלק = מרווחים שווים בלי למדוד.`)}}catch(e){}L.push('',sep,'*🧩 שלב 2 – הרכבה*');
 const asm=liTexts(/מרכיבים/,8);(asm.length?asm:['מניחים את חלקי המסגרת על משטח ישר לפי השרטוט','מחברים בנקודות ריתוך קטנות בפינות','מודדים את שני האלכסונים – הם חייבים להיות שווים','מוסיפים את חלקי המילוי במרווחים שווים']).forEach((t,i)=>L.push(`${i+1}. ${t}`));
 L.push('',sep,'*🔥 שלב 3 – ריתוך וגימור*');[...liTexts(/ריתוך/,3),...liTexts(/גימור/,3)].forEach(t=>L.push('• '+t));
 if(PAINT&&PAINTS[PAINT])L.push('',`🎨 צבע: ${(window.__fpColName||{})[PAINT]||(typeof PN!=='undefined'&&PN[PAINT])||PAINT}`);
 L.push('',sep,'📐 *השרטוט המלא + מצב סדנה צעד-צעד:*',link,'','⚠️ לא בטוח במשהו? עוצרים ושואלים לפני שחותכים.');
 return L.join('\n')}
function loadSvg(svg,w){return new Promise(r=>{try{const c=svg.cloneNode(true);const vb=(svg.getAttribute('viewBox')||'0 0 800 600').split(/[\s,]+/).map(Number);const h=Math.round(w*vb[3]/vb[2]);
 c.setAttribute('width',w);c.setAttribute('height',h);c.removeAttribute('style');c.setAttribute('xmlns','http://www.w3.org/2000/svg');
 const img=new Image();img.onload=()=>r({img,w,h});img.onerror=()=>r(null);img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(c))}catch(e){r(null)}})}
const blobOf=cv=>new Promise(r=>cv.toBlob(b=>r(b),'image/png'));
function head(x,W,title,sub,n){x.fillStyle='#111827';x.fillRect(0,0,W,130);x.fillStyle='#F97316';x.fillRect(0,126,W,6);x.direction='rtl';x.textAlign='right';
 x.fillStyle='#fff';x.font='900 52px Heebo,Arial,sans-serif';x.fillText(title,W-40,62);x.font='500 30px Heebo,Arial,sans-serif';x.fillStyle='#CBD5E1';x.fillText(sub,W-40,108);
 x.textAlign='left';x.fillStyle='#FB923C';x.font='900 40px Heebo,Arial,sans-serif';x.fillText(n,40,80)}
async function viewPng(svg,cap,k,N){const vb=(svg.getAttribute('viewBox')||'0 0 800 600').split(/[\s,]+/).map(Number),ar=vb[3]/vb[2];let dw=1920;if(dw*ar>1800)dw=Math.round(1800/ar);const W=Math.max(1400,dw+80),o=await loadSvg(svg,dw);if(!o)return null;const cv=document.createElement('canvas');cv.width=W;cv.height=o.h+130+90+40;const x=cv.getContext('2d');
 x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);head(x,W,`${CUR.name} – ${cap}`,`${sz(CUR)} · כל המידות במילימטרים (מ״מ)`,`${k}/${N}`);x.drawImage(o.img,(W-o.w)/2,150,o.w,o.h);
 x.direction='rtl';x.textAlign='right';x.fillStyle='#6B7280';x.font='500 26px Heebo,Arial,sans-serif';x.fillText('עיגול עם מספר = מספר החלק ברשימת החיתוך · קו מקווקו = הרצפה',W-40,cv.height-36);return blobOf(cv)}
async function cutPng(k,N){let SL=[];try{SL=spacingLines()}catch(e){}const P=CUR.parts,W=2000,RH=84,H=130+40+RH*(P.length+1)+110+(SL.length?110+70+SL.length*62:0);const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
 x.fillStyle='#fff';x.fillRect(0,0,W,H);head(x,W,`${CUR.name} – רשימת חיתוך`,`${sz(CUR)} · ${P.reduce((a,r)=>a+r[3],0)} חתיכות · אורכים במ״מ`,`${k}/${N}`);
 const C=[['#',110],['שם החלק',640],['כמות',170],['אורך (מ״מ)',330],['פרופיל',420],['זווית',250]];let y=170;x.direction='rtl';
 const row=(cells,bg,font,col)=>{x.fillStyle=bg;x.fillRect(40,y,W-80,RH);let X=W-40;cells.forEach((t,i)=>{const w=C[i][1];x.fillStyle=col[i]||col[0];x.font=font[i]||font[0];x.textAlign='center';x.fillText(String(t),X-w/2,y+RH/2+14);X-=w});x.strokeStyle='#E5E7EB';x.lineWidth=2;x.strokeRect(40,y,W-80,RH);y+=RH};
 row(C.map(c=>c[0]),'#F3F4F6',['900 32px Heebo,Arial'],['#111827']);
 P.forEach(([n,pr,l,q,a],i)=>row([i+1,n,'× '+q,F(l),pr,a?a+'°':'ישר 90°'],i%2?'#FFFFFF':'#FFF7ED',['900 40px Heebo,Arial','600 34px Heebo,Arial','900 40px Heebo,Arial','900 46px Heebo,Arial','500 32px Heebo,Arial','500 30px Heebo,Arial'],['#F97316','#111827','#111827','#B45309','#374151','#374151']));
 x.textAlign='right';x.fillStyle='#6B7280';x.font='500 28px Heebo,Arial';x.fillText('כותבים על כל חתיכה את המספר שלה בטוש. מודדים פעמיים – חותכים פעם אחת.',W-40,y+60);
 if(SL.length){let yy=y+110;x.fillStyle='#E0F2FE';x.fillRect(40,yy,W-80,70+SL.length*62);x.fillStyle='#0369A1';x.font='900 38px Heebo,Arial';x.fillText('📏 מרווחים',W-70,yy+52);x.font='700 32px Heebo,Arial';x.fillStyle='#0C4A6E';SL.forEach((l,i)=>x.fillText('• '+l.txt,W-70,yy+110+i*62,W-140))}return blobOf(cv)}
async function buildFiles(){const figs=[...document.querySelectorAll('#detail .views figure.vw')];const N=figs.length+1,fs=[];let k=1;
 for(const fg of figs){const svg=fg.querySelector('svg');const cap=(fg.querySelector('figcaption')||{}).textContent||'מבט';const b=svg&&await viewPng(svg,cap.trim(),k,N);if(b)fs.push(new File([b],`${String(k).padStart(2,'0')}-${CURID}-${cap.trim().replace(/\s+/g,'-')}.png`,{type:'image/png'}));k++}
 const c=await cutPng(N,N);if(c)fs.push(new File([c],`${String(N).padStart(2,'0')}-${CURID}-רשימת-חיתוך.png`,{type:'image/png'}));return fs}
function waForm(){const box=document.getElementById('fpWa');if(!box)return;box.hidden=!box.hidden;if(box.hidden)return;
 box.innerHTML=`<h3>📲 שליחה לרתך בוואטסאפ</h3><p class="fp-mut">שני שלבים: קודם התמונות עם כל המידות, אחר כך הודעת הסבר מסודרת.</p>
 <div class="fp-row"><label>טלפון הרתך<input id="fpWaP" inputmode="tel" placeholder="05X-XXXXXXX"></label></div>
 <div class="fp-wa-th" id="fpWaTh"><span class="fp-mut">מכין תמונות…</span></div>
 <div class="fp-steps2"><button class="fp-s2" id="fpWaI" disabled><b>1</b><span>שליחת השרטוטים<small id="fpWaIc">תמונות עם מידות</small></span></button>
 <button class="fp-s2" id="fpWaT"><b>2</b><span>שליחת הסבר הבנייה<small>הודעה מסודרת צעד-צעד + קישור</small></span></button></div>
 <div class="fp-row"><button class="btn ghost" id="fpWaC">העתקת ההסבר</button><button class="btn ghost" id="fpWaD">הורדת התמונות</button></div>
 <details><summary>איך נראית ההודעה</summary><pre id="fpWaPre" style="white-space:pre-wrap;font-family:inherit;font-size:14px"></pre></details>`;
 const link=()=>planUrl(CURID).replace('plans.html#','plans.html?ws=1#');const ph=v=>{v=String(v||'').replace(/\D/g,'');return v.startsWith('0')?'972'+v.slice(1):v};
 let files=[];const txt=()=>waText(link(),files.length);document.getElementById('fpWaPre').textContent=txt();
 const th=document.getElementById('fpWaTh'),bi=document.getElementById('fpWaI');
 buildFiles().then(fs=>{files=fs;window.__fpFiles=fs.length;document.getElementById('fpWaPre').textContent=txt();
  th.innerHTML=fs.map(f=>`<img src="${URL.createObjectURL(f)}" alt="${E(f.name)}" title="${E(f.name)}">`).join('');bi.disabled=!fs.length;document.getElementById('fpWaIc').textContent=`${fs.length} תמונות: ${fs.length-1} מבטים + רשימת חיתוך`;
  th.querySelectorAll('img').forEach(i=>i.onclick=()=>window.open(i.src,'_blank'))});
 const dl=()=>files.forEach((f,i)=>setTimeout(()=>{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove()},i*250));
 bi.onclick=async()=>{if(navigator.canShare&&navigator.canShare({files})){try{await navigator.share({files,title:CUR.name});bi.classList.add('done')}catch(_){}}
  else{dl();bi.classList.add('done');alert('במחשב: התמונות הורדו לתיקיית ההורדות.\nפותחים את הצ׳אט עם הרתך בוואטסאפ ווב, גוררים את כל התמונות לחלון – ושולחים.\nאחר כך לוחצים על שלב 2.')}};
 document.getElementById('fpWaT').onclick=e=>{window.open('https://wa.me/'+ph(document.getElementById('fpWaP').value)+'?text='+encodeURIComponent(txt()),'_blank');e.currentTarget.classList.add('done')};
 document.getElementById('fpWaC').onclick=e=>navigator.clipboard?.writeText(txt()).then(()=>e.target.textContent='הועתק ✓',()=>{});
 document.getElementById('fpWaD').onclick=dl}

/* ---------- 8. טבלת צבעים: RAL לפי מק״ט + בחירה חופשית לפי העין ---------- */
const RAL=[["1000","בז' ירקרק","#BEBD7F"],["1001","בז'","#C2B078"],["1002","צהוב חול","#C6A664"],["1003","צהוב אות","#E5BE01"],["1004","צהוב זהב","#CDA434"],["1005","צהוב דבש","#A98307"],["1006","צהוב תירס","#E4A010"],["1007","צהוב נרקיס","#DC9D00"],["1011","בז' חום","#8A6642"],["1013","לבן צדפה","#EAE6CA"],["1014","שנהב","#E1CC4F"],["1015","שנהב בהיר","#E6D690"],["1016","צהוב גופרית","#EDFF21"],["1018","צהוב אבץ","#F8F32B"],["1019","בז' אפור","#9E9764"],["1020","צהוב זית","#999950"],["1021","צהוב קדמיום","#F3DA0B"],["1023","צהוב תנועה","#FAD201"],["1024","צהוב אוקר","#AEA04B"],["1028","צהוב מלון","#F4A900"],["1032","צהוב רתמה","#D6AE01"],["1033","צהוב דליה","#F3A505"],["1034","צהוב פסטל","#EFA94A"],["2000","כתום צהבהב","#ED760E"],["2001","כתום אדמדם","#C93C20"],["2002","כתום אדום","#CB2821"],["2003","כתום פסטל","#FF7514"],["2004","כתום טהור","#F44611"],["2008","כתום בהיר","#F75E25"],["2009","כתום תנועה","#F54021"],["2010","כתום אות","#D84B20"],["2011","כתום עמוק","#EC7C26"],["3000","אדום אש","#AF2B1E"],["3001","אדום אות","#A52019"],["3002","אדום כרמין","#A2231D"],["3003","אדום רובי","#9B111E"],["3004","אדום ארגמן","#75151E"],["3005","אדום יין","#5E2129"],["3007","אדום שחור","#412227"],["3009","אדום תחמוצת","#642424"],["3011","אדום חום","#781F19"],["3012","אדום בז'","#C1876B"],["3013","אדום עגבניה","#A12312"],["3015","ורוד בהיר","#D36E70"],["3016","אדום אלמוג","#B32821"],["3020","אדום תנועה","#CC0605"],["3027","אדום פטל","#C51D34"],["3031","אדום מזרחי","#B32428"],["4001","סגול אדמדם","#6D3F5B"],["4004","סגול בורדו","#6D1F3B"],["4005","סגול כחלחל","#6C4675"],["4006","סגול תנועה","#A03472"],["4008","סגול אות","#924E7D"],["4010","מג'נטה","#CF3476"],["5000","כחול סגול","#354D73"],["5001","כחול ירקרק","#1F3438"],["5002","כחול אולטרמרין","#20214F"],["5003","כחול ספיר","#1D1E33"],["5005","כחול אות","#1E2460"],["5007","כחול מבריק","#3E5F8A"],["5009","כחול תכלת","#025669"],["5010","כחול אנציאן","#0E294B"],["5011","כחול פלדה","#231A24"],["5012","כחול בהיר","#3B83BD"],["5013","כחול קובלט","#1E213D"],["5014","כחול יונה","#606E8C"],["5015","כחול שמיים","#2271B3"],["5017","כחול תנועה","#063971"],["5018","טורקיז","#3F888F"],["5021","כחול מים","#256D7B"],["5023","כחול רחוק","#49678D"],["5024","כחול פסטל","#5D9B9B"],["6000","ירוק פטינה","#316650"],["6001","ירוק אמרלד","#287233"],["6002","ירוק עלה","#2D572C"],["6003","ירוק זית","#424632"],["6005","ירוק אזוב","#2F4538"],["6009","ירוק אשוח","#31372B"],["6011","ירוק רזדה","#587246"],["6018","ירוק צהבהב","#57A639"],["6019","ירוק פסטל","#BDECB6"],["6020","ירוק כרום","#2E3A23"],["6021","ירוק חיוור","#89AC76"],["6024","ירוק תנועה","#308446"],["6029","ירוק מנטה","#20603D"],["6032","ירוק אות","#317F43"],["7000","אפור סנאי","#78858B"],["7001","אפור כסף","#8A9597"],["7004","אפור אות","#969992"],["7005","אפור עכבר","#646B63"],["7011","אפור ברזל","#434B4D"],["7012","אפור בזלת","#4E5754"],["7015","אפור צפחה","#434750"],["7016","אפור אנתרציט","#293133"],["7021","אפור שחור","#23282B"],["7022","אפור אומבר","#332F2C"],["7024","אפור גרפיט","#474A51"],["7030","אפור אבן","#8B8C7A"],["7031","אפור כחלחל","#474B4E"],["7032","אפור חצץ","#B8B799"],["7035","אפור בהיר","#D7D7D7"],["7036","אפור פלטינה","#7F7679"],["7037","אפור אבק","#7D7F7D"],["7038","אפור אגט","#B5B8B1"],["7039","אפור קוורץ","#6C6960"],["7040","אפור חלון","#9DA1AA"],["7042","אפור תנועה A","#8D948D"],["7044","אפור משי","#CAC4B0"],["7045","אפור טלה 1","#909090"],["7046","אפור טלה 2","#82898F"],["7047","אפור טלה 4","#D0D0D0"],["8001","חום אוקר","#955F20"],["8003","חום טיט","#734222"],["8004","חום נחושת","#8E402A"],["8007","חום צבי","#59351F"],["8011","חום אגוז","#5B3A29"],["8014","חום ספיה","#382C1E"],["8015","חום ערמון","#633A34"],["8016","חום מהגוני","#4C2F27"],["8017","חום שוקולד","#45322E"],["8019","חום אפור","#403A3A"],["8022","חום שחור","#212121"],["8023","חום כתום","#A65E2E"],["8024","חום בז'","#79553D"],["8025","חום חיוור","#755C48"],["8028","חום אדמה","#4E3B31"],["9001","לבן קרם","#FDF4E3"],["9002","לבן אפור","#E7EBDA"],["9003","לבן אות","#F4F4F4"],["9004","שחור אות","#282828"],["9005","שחור עמוק","#0A0A0A"],["9006","אלומיניום לבן","#A5A5A5"],["9007","אלומיניום אפור","#8F8F8F"],["9010","לבן טהור","#FFFFFF"],["9011","שחור גרפיט","#1C1C1C"],["9016","לבן תנועה","#F6F6F6"],["9017","שחור תנועה","#1E1E1E"],["9018","לבן פפירוס","#D7D7D7"]];
const shade=(h,k)=>{const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=x=>Math.round(k>0?x+(255-x)*k:x*(1+k));return'#'+[f(r),f(g),f(b)].map(x=>Math.max(0,Math.min(255,x)).toString(16).padStart(2,'0')).join('')};
window.__fpColName=window.__fpColName||{};
function setColor(hex,name){const k='x'+hex.slice(1).toLowerCase();PAINTS[k]=[hex,shade(hex,.22),shade(hex,-.28)];window.__fpColName[k]=name;
 const rec=LS.get('forge_colors_recent',[]).filter(x=>x[0]!==hex);rec.unshift([hex,name]);LS.set('forge_colors_recent',rec.slice(0,12));
 PAINT=k;const d=document.getElementById('detail'),y=d?d.scrollTop:0;show(CURID);if(d)d.scrollTop=y}
function openColors(){const ov=document.createElement('div');ov.className='fp-ov';const rec=LS.get('forge_colors_recent',[]);
 const grp={1:'צהובים ובז׳',2:'כתומים',3:'אדומים',4:'סגולים',5:'כחולים',6:'ירוקים',7:'אפורים',8:'חומים',9:'לבנים ושחורים'};
 ov.innerHTML=`<div class="fp-3d fp-col"><div class="fp-bar"><b>🎨 טבלת צבעים להדמיה</b><span class="fp-mut">לפי מק״ט RAL · חיפוש לפי מספר או שם · או בחירה חופשית לפי העין</span><button class="fp-x" aria-label="סגירה">✕</button></div>
 <div class="fp-colb"><div class="fp-row"><label>חיפוש (למשל 7016 או אנתרציט)<input id="fpCs" placeholder="מק״ט RAL / שם צבע"></label>
 <label>בחירה לפי העין<input type="color" id="fpCp" value="#293133" style="width:70px;height:44px;padding:2px"></label><label>או קוד HEX<input id="fpCh" placeholder="#293133" dir="ltr" style="min-width:120px"></label><button class="btn" id="fpCa">החלה</button><button class="btn ghost" id="fpC0">ללא צבע</button></div>
 ${rec.length?`<p class="fp-mut">אחרונים:</p><div class="fp-sw">${rec.map(([h,n])=>`<button data-h="${h}" data-n="${E(n)}" title="${E(n)}" style="background:${h}"></button>`).join('')}</div>`:''}
 <div id="fpCl">${Object.entries(grp).map(([g,t])=>`<h4>${t}</h4><div class="fp-ral">${RAL.filter(r=>r[0][0]===g).map(([c,n,h])=>`<button data-h="${h}" data-n="RAL ${c} ${E(n)}" data-q="${c} ${E(n)}"><i style="background:${h}"></i><b>RAL ${c}</b><span>${E(n)}</span></button>`).join('')}</div>`).join('')}</div>
 <div class="fp-ralnote"><b>✔ המק״טים כאן הם קודי RAL Classic אמיתיים</b> – התקן האירופי שכל יצרן צבע ותנור צבע אלקטרוסטטי מכיר. אומרים לספק למשל <b>"RAL 7016"</b> ומקבלים בדיוק את הצבע הזה, בכל חברה.<br>⚠️ המסך עצמו לא מציג צבע מדויק (כל מסך שונה ותלוי בתאורה), ולכן הריבוע הוא <b>המחשה</b>. מה שקובע הוא המק״ט. להחלטה סופית מול לקוח – מסתכלים על מניפת RAL מודפסת אצל הספק.<br>🎯 צבע שנבחר "לפי העין" או לפי HEX <b>אינו מק״ט</b> – הספק יצטרך להתאים אותו לפי דוגמה. עדיף לבחור RAL.</div></div></div>`;
 document.body.appendChild(ov);document.body.classList.add('fp-lock');
 const close=()=>{ov.remove();document.body.classList.remove('fp-lock');removeEventListener('keydown',esc,true)};const esc=e=>{if(e.key==='Escape'){e.stopImmediatePropagation();close()}};addEventListener('keydown',esc,true);
 ov.querySelector('.fp-x').onclick=close;ov.addEventListener('click',e=>{if(e.target===ov)close()});
 ov.querySelectorAll('button[data-h]').forEach(b=>b.onclick=()=>{close();setColor(b.dataset.h,b.dataset.n)});
 const cp=ov.querySelector('#fpCp'),ch=ov.querySelector('#fpCh');cp.oninput=()=>ch.value=cp.value;
 ov.querySelector('#fpCa').onclick=()=>{let h=(ch.value||cp.value).trim();if(!/^#?[0-9a-f]{6}$/i.test(h))return alert('קוד HEX לא תקין, למשל #293133');if(h[0]!=='#')h='#'+h;close();setColor(h,'צבע לפי בחירה '+h.toUpperCase()+' (לא מק״ט – להתאמה לפי דוגמה)')};
 ov.querySelector('#fpC0').onclick=()=>{close();PAINT=null;show(CURID)};
 ov.querySelector('#fpCs').oninput=e=>{const q=e.target.value.trim();ov.querySelectorAll('.fp-ral button').forEach(b=>b.hidden=q&&!b.dataset.q.includes(q));ov.querySelectorAll('#fpCl h4').forEach(h=>h.hidden=!!q)}}


/* ---------- 9. לשוניות בגיליון + סרגל פעולות מסודר ---------- */
const TABS=[['draw','📐','שרטוט'],['cut','✂️','חיתוך וקנייה'],['guide','👷','איך בונים'],['price','💰','חומר ומחיר'],['send','📤','הדפסה ושליחה']];
function tabOf(el){if(el.classList.contains('close'))return'';const sec=el.dataset.sec;
 if(el.id==='wsGuide')return'guide';if(el.id==='wsPrint'||(el.tagName==='P'&&el.classList.contains('no-print')))return'send';
 if(el.classList.contains('tools'))return'price';if(sec==='cut'||sec==='buy'||sec==='bars'||sec==='hw')return'cut';
 if(el.classList.contains('views')||el.classList.contains('tb'))return'draw';return''}
function setTab(k){const card=document.querySelector('#detail .card');if(!card)return;LS.set('forge_sheet_tab',k);
 card.querySelectorAll(':scope>*').forEach(el=>{const t=el.dataset.fpTab;if(t)el.classList.toggle('fp-tabh',t!==k)});
 card.querySelectorAll('.fp-tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===k))}
window.fpTab=setTab;
let wasOpen=null;const openAll=()=>{const ds=[...document.querySelectorAll('#wsGuide details.ws-s')];if(!ds.length||wasOpen)return;wasOpen=ds.map(d=>d.open);ds.forEach(d=>d.open=true)};
const restore=()=>{const ds=[...document.querySelectorAll('#wsGuide details.ws-s')];if(wasOpen&&ds.length===wasOpen.length)ds.forEach((d,i)=>d.open=wasOpen[i]);wasOpen=null};
addEventListener('beforeprint',openAll);addEventListener('afterprint',restore);
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#ppgo'))openAll()},true);
function tidy(card){const cb=card.querySelector('.cbar'),meta=card.querySelector('.meta');if(!cb)return;
 // סרגל פעולות ראשי
 const act=document.createElement('div');act.className='fp-act no-print';
 act.innerHTML=`<button data-a="ws"><em>🛠️</em><b>מצב סדנה</b><span>צעד אחרי צעד</span></button><button data-a="wa"><em>📲</em><b>לרתך</b><span>שרטוט + הסבר</span></button><button data-a="pr"><em>🖨️</em><b>הדפסה</b><span>כל גודל דף</span></button><button data-a="3d"><em>🧊</em><b>תלת-ממד</b><span>סיבוב והרכבה</span></button>`;
 (meta||cb).insertAdjacentElement('afterend',act);
 act.onclick=e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
  if(a==='ws')openWorkshop();else if(a==='3d')open3D();else{setTab('send');if(a==='wa'){const w=document.getElementById('fpWa');if(w&&w.hidden)waForm();(w||document.getElementById('wsPrint')).scrollIntoView({behavior:'smooth',block:'start'})}else document.getElementById('wsPrint').scrollIntoView({behavior:'smooth',block:'start'})}};
 // שורת צבע קומפקטית: מסתירים כפילויות
 cb.querySelectorAll('#fp3b,#fpWb,#fpWaTop').forEach(b=>b.remove());
 [...cb.querySelectorAll('button')].filter(b=>/הדפסה/.test(b.textContent)).forEach(b=>b.remove());
 const dxf=cb.querySelector('#dxf');const pr=document.getElementById('wsPrint');if(dxf&&pr){dxf.classList.add('ghost');pr.querySelector('.fp-row')?.appendChild(dxf)}
 cb.classList.add('fp-cbar');const col=cb.querySelector('#fpColB');if(col)col.textContent='🎨 עוד צבעים (RAL)';
 // לשוניות
 const tb=document.createElement('div');tb.className='fp-tabs no-print';tb.setAttribute('role','tablist');
 tb.innerHTML=TABS.map(([k,i,n])=>`<button role="tab" data-t="${k}"><em>${i}</em>${n}</button>`).join('');cb.insertAdjacentElement('afterend',tb);
 tb.onclick=e=>{const b=e.target.closest('button');if(b){setTab(b.dataset.t);tb.scrollIntoView({block:'start',behavior:'smooth'})}};
 card.querySelectorAll(':scope>*').forEach(el=>{const t=tabOf(el);if(t)el.dataset.fpTab=t});
 const pl=document.getElementById('wsPrint')&&document.getElementById('wsPrint').nextElementSibling;
 // דף העבודה: אקורדיון – פרק אחד פתוח בכל פעם
 const g=document.getElementById('wsGuide');if(g){const ds=[...g.querySelectorAll('details.ws-s')];ds.forEach(d=>{d.open=false;d.addEventListener('toggle',()=>{if(d.open&&!wasOpen)ds.forEach(x=>{if(x!==d)x.open=false})})})}
 setTab(LS.get('forge_sheet_tab','draw'))}


/* ---------- 10. מרווחים: מידה בין מוט למוט בשרטוט, בתמונות ובהסבר ---------- */
function bb(e,P){let a=[1e9,-1e9,1e9,-1e9];for(const q of[...e.A,...e.B]){const p=P(q);a[0]=Math.min(a[0],p[0]);a[1]=Math.max(a[1],p[0]);a[2]=Math.min(a[2],p[1]);a[3]=Math.max(a[3],p[1])}return a}
function spacing(vk){vk=vk||'front';const P=VIEWS[vk].P,els=M.filter(e=>e.A&&e.B),G=new Map();
 for(const e of els){if(!e.n)continue;const k=e.n+'|'+e.p+'|'+Math.round(e.len);(G.get(k)||G.set(k,[]).get(k)).push(e)}const out=[];
 for(const[k,g]of G){if(g.length<3||/מסגרת/.test(k))continue;const B=g.map(e=>({e,b:bb(e,P)}));
  const cx=B.map(o=>(o.b[0]+o.b[1])/2),cy=B.map(o=>(o.b[2]+o.b[3])/2),sx=Math.max(...cx)-Math.min(...cx),sy=Math.max(...cy)-Math.min(...cy);
  const ax=sx>=sy?0:1;if((ax?sy:sx)<1)continue;const lo=ax?2:0,hi=ax?3:1,olo=ax?0:2,ohi=ax?1:3;
  B.sort((a,b)=>a.b[lo]-b.b[lo]||a.b[olo]-b.b[olo]);const rows=B.filter((o,i)=>i===0||Math.abs(o.b[lo]-B[i-1].b[lo])>.5);if(rows.length<B.length){const t=B.length;B.length=0;B.push(...rows.filter(o=>o.b[olo]===Math.min(...rows.filter(x=>Math.abs(x.b[lo]-o.b[lo])<.5).map(x=>x.b[olo]))))}const gaps=[];for(let i=1;i<B.length;i++)gaps.push(B[i].b[lo]-B[i-1].b[hi]);
  if(Math.min(...gaps)<=0.5)continue;
  // לא מבלבלים קבוצות מפוצלות (שתי כנפיים): לוקחים את המרווח השכיח
  const gs=[...gaps].sort((a,b)=>a-b),gap=gs[Math.floor(gs.length/2)],run=[B[0]];for(let i=1;i<B.length;i++){if(Math.abs(gaps[i-1]-gap)<2)run.push(B[i]);else if(run.length<3){run.length=0;run.push(B[i])}else break}
  if(run.length<3)continue;const f0=run[0].b,w=f0[hi]-f0[lo],oMin=Math.min(...run.map(o=>o.b[olo])),oMax=Math.max(...run.map(o=>o.b[ohi]));
  let edge=null,ref=null;for(const o of els){if(g.includes(o))continue;const b=bb(o,P);if(b[ohi]<oMin+1||b[olo]>oMax-1)continue;if(b[hi]<=f0[lo]+.5&&(edge==null||f0[lo]-b[hi]<edge)){edge=f0[lo]-b[hi];ref=o}}
  const name=k.split('|')[0],prof=k.split('|')[1];
  out.push({vk,ax,name,prof,n:run.length,total:g.length,gap,pitch:gap+w,w,edge:edge!=null&&edge<gap*3?edge:null,refName:ref&&ref.n||'',run,lo,hi,olo,ohi,oMin,oMax})}
 return out}
const view0=view;
view=function(vk,o){let svg=view0(vk,o||{});o=o||{};if(o.thumb||vk==='iso'||!svg)return svg;let S;try{S=spacing(vk)}catch(e){return svg}if(!S.length)return svg;
 const m=svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/);if(!m)return svg;let[vx,vy,vw,vh]=m.slice(1).map(Number);const vy0=vy,vb1=vy+vh;
 const Sz=Math.max(vw,vh)/1.32,fs=Sz/24,C='#0369A1',L=(a,b,c,d,w)=>`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${C}" stroke-width="${w||1}" vector-effect="non-scaling-stroke"/>`;
 const T=(x,y,t,r,sz,col)=>`<text x="${x}" y="${y}" fill="${col||C}" font-size="${sz||fs*.72}" font-family="Heebo,Arial" font-weight="800" text-anchor="middle"${r?` transform="rotate(-90 ${x} ${y})"`:''}>${t}</text>`;
 let add='',k0=0,k1=0,bottom=vb1;
 // תווית מרווח ליד כל קבוצה
 for(const g of S.slice(0,3)){const r=g.run,last=r[r.length-1].b,first=r[0].b;
  if(g.ax===0){const y=g.oMin-fs*(.9+1.3*k0++);add+=L(first[0],y,last[1],y,.7)+L(first[0],y-fs*.2,first[0],y+fs*.2)+L(last[1],y-fs*.2,last[1],y+fs*.2)+T((first[0]+last[1])/2,y-fs*.25,`${g.n} × ${g.name} · מרווח נקי ${fmt(g.gap)} מ״מ`,0,fs*.6);vy=Math.min(vy,y-fs*1.1)}
  else{const x=g.oMax+fs*(.9+1.3*k1++);add+=L(x,first[2],x,last[3],.7)+L(x-fs*.2,first[2],x+fs*.2,first[2])+L(x-fs*.2,last[3],x+fs*.2,last[3])+T(x+fs*.45,(first[2]+last[3])/2,`${g.n} × ${g.name} · מרווח ${fmt(g.gap)}`,1,fs*.6);vw=Math.max(vw,x+fs*1.2-vx)}}
 // פרט מוגדל לקבוצה הראשית
 const g=S[0],r=g.run,P=VIEWS[vk].P,ax=g.ax,lo=ax?2:0,hi=ax?3:1;
 const start=g.edge!=null?r[0].b[lo]-g.edge:r[0].b[lo],refW=g.edge!=null?Math.min(g.edge*.6+40,80):30,R0=start-refW,R1=r[Math.min(2,r.length-1)].b[hi]+g.gap*.35;
 const span=R1-R0,oth=Math.min(span*.62,(ax?g.oMax-g.oMin:g.oMax-g.oMin)),O0=ax?g.oMax-oth:g.oMin,O1=O0+oth;
 const rx=ax?O0:R0,ry=ax?R0:O0,rw=ax?oth:span,rh=ax?span:oth;
 const IW=Math.min(Sz*.62,vw*.9),k=IW/rw,IH=rh*k,ix=vx+(vw-IW)/2,iy=vb1+fs*1.2;
 const pol=[];for(const e of M)for(const f of faces(e)){if(dot(f.N,VIEWS[vk].V)<=1e-6)continue;const col=(typeof PAINT!=='undefined'&&PAINT&&/^(m|post|wheel)$/.test(e.role)?PAINTS[PAINT]:(COL[e.role]||COL.m))[0];pol.push({d:dot(f.fc,VIEWS[vk].V),pts:f.F.map(P),col})}
 pol.sort((a,b)=>a.d-b.d);
 const inner=pol.map(p=>`<polygon points="${p.pts.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ')}" fill="${p.col}" stroke="#1F2328" stroke-width="1" vector-effect="non-scaling-stroke"/>`).join('');
 add+=`<rect x="${ix-fs*.3}" y="${iy-fs*1.5}" width="${IW+fs*.6}" height="${IH+fs*4.2}" rx="${fs*.4}" fill="#F0F9FF" stroke="${C}" stroke-width="1.4" vector-effect="non-scaling-stroke"/>`+T(ix+IW/2,iy-fs*.45,'🔍 פרט מוגדל – מרווחים',0,fs*.75)+(()=>{const id="fpc"+vk+Math.random().toString(36).slice(2,7);return`<clipPath id="${id}"><rect x="${ix}" y="${iy}" width="${IW}" height="${IH}"/></clipPath><g clip-path="url(#${id})"><g transform="translate(${ix} ${iy}) scale(${k}) translate(${-rx} ${-ry})">${inner}</g></g>`})();
 const map=v=>ax?iy+(v-ry)*k:ix+(v-rx)*k;const pts=[];if(g.edge!=null)pts.push(start);for(let i=0;i<Math.min(2,r.length);i++){pts.push(r[i].b[lo],r[i].b[hi])}if(r.length>2)pts.push(r[2].b[lo]);
 const dl=ax?ix+IW+fs*.9:iy+IH+fs*1.0;
 if(ax===0){add+=L(map(pts[0]),dl,map(pts[pts.length-1]),dl,1.2);for(const p of pts)add+=L(map(p),dl-fs*.25,map(p),dl+fs*.25,1.2)+L(map(p),iy+IH,map(p),dl,.5);
  for(let i=0;i<pts.length-1;i++){const d=pts[i+1]-pts[i];if(d>.5)add+=T((map(pts[i])+map(pts[i+1]))/2,dl+fs*.95,fmt(d),0,fs*.68,i%2===(g.edge!=null?0:1)?C:'#475569')}
  const cc1=map(r[0].b[lo]+g.w/2),cc2=map(r[1].b[lo]+g.w/2),yc=iy+fs*.9;add+=`<line x1="${cc1}" y1="${yc}" x2="${cc2}" y2="${yc}" stroke="#B45309" stroke-width="1.2" stroke-dasharray="5 3" vector-effect="non-scaling-stroke"/>`+T((cc1+cc2)/2,yc-fs*.25,`מרכז-מרכז ${fmt(g.pitch)}`,0,fs*.6,'#B45309')}
 else{add+=L(dl,map(pts[0]),dl,map(pts[pts.length-1]),1.2);for(const p of pts)add+=L(dl-fs*.25,map(p),dl+fs*.25,map(p),1.2)+L(ix+IW,map(p),dl,map(p),.5);
  for(let i=0;i<pts.length-1;i++){const d=pts[i+1]-pts[i];if(d>.5)add+=T(dl+fs*.7,(map(pts[i])+map(pts[i+1]))/2,fmt(d),1,fs*.68)}}
 add+=T(ix+IW/2,iy+IH+fs*2.3,'כחול = רווח ריק בין החלקים',0,fs*.5,'#334155');
 bottom=iy+IH+fs*3.1;if(ax)vw=Math.max(vw,dl+fs*1.5-vx);
 const ny=Math.min(vy0,vy),nh=bottom-ny+fs*.4;
 return svg.replace(m[0],`viewBox="${vx} ${ny} ${vw} ${nh}"`).replace(/<\/svg>$/,add+'</svg>')};
function spacingLines(){const seen=new Set(),L=[];for(const vk of['front','top','side'])for(const g of spacing(vk)){const key=g.name+'|'+g.prof;if(seen.has(key))continue;seen.add(key);
 L.push({g,txt:`${g.name} (${g.prof}): ${g.n} יח׳${g.total>g.n?` בכל שורה (${g.total} סה״כ)`:''} · מרווח נקי ${fmt(g.gap)} מ״מ בין חלק לחלק · מרכז-מרכז ${fmt(g.pitch)} מ״מ`+(g.edge!=null?` · הראשון במרחק ${fmt(g.edge)} מ״מ מ${g.refName||'המסגרת'}`:'')})}return L}
window.fpSpacing=()=>spacingLines();
function guideSpacing(){const g=document.getElementById('wsGuide');if(!g||g.querySelector('.fp-spc'))return;const L=spacingLines();if(!L.length)return;
 const d=[...g.querySelectorAll('details.ws-s')].find(x=>/מרכיבים/.test((x.querySelector('summary')||{}).textContent||''));const host=d?d.querySelector('.ws-b')||d:g;
 host.insertAdjacentHTML('afterbegin',`<div class="fp-spc"><b>📏 מרווחים – בדיוק לפי המידות:</b><ul>${L.map(x=>`<li>${E(x.txt)}</li>`).join('')}</ul><p>💡 טריק: חותכים <b>קוצב</b> (פיסת עץ/פרופיל) באורך המרווח הנקי – <b>${fmt(L[0].g.gap)} מ״מ</b> – ומניחים אותו בין חלק לחלק. ככה כל המרווחים יוצאים שווים בלי למדוד כל פעם.</p></div>`)}

/* ---------- חיבור לגיליון ---------- */
function plus(id){CUR=null;CURID='';if(!id)return;const card=document.querySelector('#detail .card');if(!card)return;const p=plan(id);if(!p||p.err)return;CUR=p;CURID=id;
 const cb=card.querySelector('.cbar');if(cb){cb.insertAdjacentHTML('beforeend',`<button class="btn fp-t" id="fp3b">🧊 תלת-ממד</button><button class="btn fp-t" id="fpWb">🛠️ מצב סדנה</button><button class="btn fp-t" id="fpWaTop">📲 לרתך בוואטסאפ</button><button class="btn fp-t" id="fpColB">🎨 טבלת צבעים RAL</button>`);
  document.getElementById('fp3b').onclick=open3D;document.getElementById('fpWb').onclick=openWorkshop;document.getElementById('fpColB').onclick=openColors;document.getElementById('fpWaTop').onclick=()=>{const b=document.getElementById('fpWa');if(b&&b.hidden)waForm();(b||document.getElementById('wsPrint')).scrollIntoView({behavior:'smooth'})};if(PAINT&&window.__fpColName[PAINT]){const t=document.createElement('span');t.className='fp-cn';t.textContent='🎨 '+window.__fpColName[PAINT];cb.appendChild(t)}}
 const url=planUrl(id);qrSvg(url,3).then(s=>{if(!s||CURID!==id)return;const h=document.querySelector('#wsGuide .ws-head');if(h&&!h.querySelector('.fp-qr'))h.insertAdjacentHTML('beforeend',`<div class="fp-qr" title="סורקים בטלפון ופותחים את התוכנית">${s}<span>סרקו לפתיחה בטלפון</span></div>`);
  const tb=card.querySelector('table.tb');if(tb&&!card.querySelector('.fp-qrtb'))tb.insertAdjacentHTML('beforebegin',`<div class="fp-qrtb">${s}<span>סרקו: התוכנית בטלפון</span></div>`)});
 const tools=card.querySelector('.tools');
 if(tools){tools.insertAdjacentHTML('beforebegin',miterHTML(p));bindMiter(p);
  const qp=document.getElementById('qpdf');if(qp){qp.insertAdjacentHTML('afterend',` <button class="btn ghost" id="fpSignB">✍️ קישור לחתימת הלקוח</button><div id="fpSign" class="fp-card" hidden></div>`);document.getElementById('fpSignB').onclick=signLink}}
 const pr=document.getElementById('wsPrint');if(pr){pr.insertAdjacentHTML('beforeend',`<div class="fp-row"><button class="btn ghost" id="fpLab">🏷️ הדפסת מדבקות לחלקים</button><button class="btn ghost" id="fpWk">👷 שליחה לעובד</button><button class="btn" id="fpWaB">📲 שרטוט + הסבר בוואטסאפ</button></div><div id="fpWorker" class="fp-card" hidden></div><div id="fpWa" class="fp-card" hidden></div>`);
  document.getElementById('fpLab').onclick=printLabels;document.getElementById('fpWk').onclick=workerForm;document.getElementById('fpWaB').onclick=waForm}
 try{guideSpacing()}catch(e){console.error('spc',e)}
 try{tidy(card)}catch(e){console.error('tidy',e)}
 if(new URLSearchParams(location.search).get('ws')==='1'&&!window.__fpAuto){window.__fpAuto=1;setTimeout(openWorkshop,300)}}

/* ---------- סגנון ---------- */
const css=`
.fp-lock{overflow:hidden!important}
.fp-ov{position:fixed;inset:0;z-index:60;background:rgba(5,8,12,.82);display:flex;align-items:center;justify-content:center;padding:10px;backdrop-filter:blur(3px)}
.fp-3d{background:#0f151c;color:#f5f7f9;border:1px solid #2b3540;border-radius:18px;width:min(1200px,100%);height:min(820px,100%);display:flex;flex-direction:column;overflow:hidden}
.fp-bar{display:flex;gap:12px;align-items:center;padding:10px 14px;border-bottom:1px solid #2b3540;flex-wrap:wrap}.fp-bar b{font-size:18px}
.fp-mut{opacity:.7;font-size:13px}.fp-x{margin-inline-start:auto;background:#1b232c;color:#fff;border:1px solid #3a4652;border-radius:999px;width:40px;height:40px;font-size:18px;cursor:pointer}
.fp-body{display:grid;grid-template-columns:1fr 290px;flex:1;min-height:0}
.fp-stage{position:relative;background:radial-gradient(circle at 50% 40%,#f8fafc,#dfe5ea);min-height:0}
.fp-stage svg{width:100%;height:100%;touch-action:none;cursor:grab;display:block}.fp-stage svg:active{cursor:grabbing}
.fp-cap{position:absolute;bottom:12px;inset-inline:12px;text-align:center;font-weight:900;font-size:18px;color:#7c2d12;text-shadow:0 1px 0 #fff}
.fp-side{border-inline-start:1px solid #2b3540;padding:12px;overflow:auto;display:flex;flex-direction:column;gap:10px}
.fp-btns{display:flex;gap:8px;flex-wrap:wrap}.fp-views{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}
.fp-views button{background:#1b232c;color:#fff;border:1px solid #3a4652;border-radius:8px;padding:6px 0;cursor:pointer;font:inherit;font-size:13px}
.fp-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:4px}.fp-list li{padding:7px 9px;border:1px solid #2b3540;border-radius:8px;cursor:pointer;font-size:14px}
.fp-list li b{display:inline-block;min-width:22px;color:#fb923c}.fp-list li span{display:block;opacity:.65;font-size:12px}.fp-list li.on{background:rgba(249,115,22,.2);border-color:#f97316}
@media(max-width:760px){.fp-body{grid-template-columns:1fr;grid-template-rows:1fr 220px}.fp-side{border:0;border-top:1px solid #2b3540}}
.fp-wm{align-items:stretch}.fp-wbox{background:#0b0f14;color:#fff;width:min(900px,100%);margin:auto;border-radius:20px;border:2px solid #f97316;padding:18px;display:flex;flex-direction:column;gap:10px;max-height:100%;overflow:auto}
.fp-wtop{display:flex;gap:10px;align-items:center;font-size:18px}.fp-wtop span{opacity:.7}
.fp-prog{height:14px;background:#1b232c;border-radius:99px;overflow:hidden}.fp-prog i{display:block;height:100%;background:linear-gradient(90deg,#f97316,#fbbf24);transition:width .35s}
.fp-wmeta{margin:0;opacity:.75}.fp-wsec{margin:6px 0 0;color:#fb923c;font-weight:900;font-size:20px}
.fp-wtxt{font-size:clamp(22px,4.2vw,34px);line-height:1.45;font-weight:700;min-height:160px;padding:14px;border-radius:14px;background:#111821;border:1px solid #2b3540}
.fp-wtxt.ok{border-color:#22c55e;box-shadow:inset 0 0 0 2px rgba(34,197,94,.35)}.fp-wtxt .ws-box{display:none}.fp-wtxt .ws-n{border-color:#fb923c;color:#fb923c}
.fp-wbtns{display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:10px}.fp-b{font:inherit;font-size:22px;font-weight:900;padding:20px 8px;border-radius:14px;border:2px solid #3a4652;background:#1b232c;color:#fff;cursor:pointer}
.fp-b:disabled{opacity:.35}.fp-done{border-color:#22c55e}.fp-done.on{background:#16a34a}.fp-next{background:#f97316;border-color:#f97316}
.fp-wfoot{display:flex;gap:10px;justify-content:space-between}.fp-wfoot button{background:none;border:1px solid #3a4652;color:#cbd5e1;border-radius:10px;padding:8px 12px;font:inherit;cursor:pointer}
.fp-fin{font-size:26px;font-weight:900;text-align:center;padding:14px;border-radius:14px;background:rgba(34,197,94,.15);border:1px solid #22c55e}
.fp-cf{position:fixed;top:-10px;width:9px;height:14px;z-index:70;animation:fpfall 2.4s ease-in forwards}@keyframes fpfall{to{top:105vh;transform:rotate(720deg)}}
.fp-t{padding:6px 12px!important;font-size:14px!important;margin-inline-start:6px}
.fp-card{margin:14px 0;padding:12px 14px;border:1px solid rgba(127,127,127,.35);border-radius:12px}.fp-card h3{margin:0 0 6px}
.fp-row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin:8px 0}.fp-row label,.fp-full{display:flex;flex-direction:column;gap:4px;font-weight:700;font-size:14px}.fp-full{margin:8px 0}
.fp-row select,.fp-row input,.fp-full textarea{padding:10px;font-size:16px;border-radius:8px;min-width:180px;font-family:inherit}.fp-mo p{margin:6px 0}
.fp-qr{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11px}.fp-qr svg,.fp-qrtb svg{width:84px!important;height:84px!important;max-width:84px!important;background:#fff;padding:3px;border-radius:6px}
.fp-qrtb{display:none}.fp-spc{border:2px solid #0369A1;background:rgba(3,105,161,.12);border-radius:12px;padding:10px 14px;margin:0 0 12px}.fp-spc ul{margin:6px 0;padding-inline-start:20px}.fp-spc p{margin:6px 0 0}
.fp-wa-th{display:flex;gap:8px;overflow-x:auto;padding:6px 0;min-height:60px;align-items:center}.fp-wa-th img{height:110px;border-radius:10px;border:1px solid rgba(127,127,127,.4);background:#fff;cursor:zoom-in;flex:none}
.fp-steps2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}@media(max-width:600px){.fp-steps2{grid-template-columns:1fr}}
.fp-s2{font:inherit;cursor:pointer;display:flex;gap:12px;align-items:center;text-align:start;padding:16px;border-radius:14px;border:2px solid #22c55e;background:rgba(34,197,94,.1);color:inherit}
.fp-s2 b{flex:none;width:40px;height:40px;border-radius:50%;background:#22c55e;color:#fff;display:grid;place-items:center;font-size:20px}.fp-s2 span{display:flex;flex-direction:column;font-weight:900;font-size:18px}.fp-s2 small{font-weight:500;font-size:13px;opacity:.75}
.fp-s2:disabled{opacity:.45;cursor:wait}.fp-s2.done{background:rgba(34,197,94,.28)}.fp-s2.done b:after{content:" ✓"}
.fp-act{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0 8px}
.fp-act button{font:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;padding:14px 6px;border-radius:16px;border:1px solid rgba(249,115,22,.45);background:linear-gradient(180deg,rgba(249,115,22,.16),rgba(249,115,22,.04));color:inherit;transition:transform .15s,box-shadow .2s}
.fp-act button:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(249,115,22,.25)}.fp-act em{font-style:normal;font-size:28px}.fp-act b{font-size:16px}.fp-act span{font-size:12px;opacity:.7}
@media(max-width:600px){.fp-act{grid-template-columns:repeat(4,1fr);gap:6px}.fp-act button{padding:10px 2px;border-radius:12px}.fp-act em{font-size:24px}.fp-act b{font-size:13px}.fp-act span{display:none}}
.fp-cbar{gap:6px!important;font-size:14px;opacity:.95}.fp-cbar #fpColB{padding:5px 12px!important;font-size:13px!important;background:transparent!important;border:1px solid rgba(127,127,127,.5)!important;box-shadow:none!important}
.fp-tabs{position:sticky;top:0;z-index:5;display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;margin:10px -4px 14px;padding:6px 4px;background:rgba(14,19,26,.94);backdrop-filter:blur(8px);border-bottom:1px solid rgba(127,127,127,.25)}
.fp-tabs::-webkit-scrollbar{display:none}
.fp-tabs button{flex:1 0 auto;font:inherit;font-weight:700;font-size:15px;white-space:nowrap;cursor:pointer;padding:10px 14px;border-radius:12px;border:1px solid transparent;background:transparent;color:inherit;opacity:.65;display:flex;gap:6px;align-items:center;justify-content:center}
.fp-tabs button em{font-style:normal}.fp-tabs button.on{opacity:1;background:rgba(249,115,22,.15);border-color:#f97316;color:#fb923c}
@media screen{.fp-tabh{display:none!important}}
#detail .card{background-clip:padding-box}

.fp-col{height:auto;max-height:100%}.fp-colb{padding:12px 14px;overflow:auto}.fp-colb h4{margin:14px 0 6px;color:#fb923c}
.fp-ral{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px}.fp-ral button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;background:#151c24;color:#fff;border:1px solid #2b3540;border-radius:10px;padding:6px;cursor:pointer;font:inherit;text-align:start}
.fp-ralnote{margin:14px 0 4px;padding:10px 12px;border:1px solid #f97316;border-radius:10px;background:rgba(249,115,22,.1);font-size:14px;line-height:1.6}.fp-ral button[hidden],#fpCl h4[hidden]{display:none!important}.fp-ral button:hover{border-color:#f97316}.fp-ral i{display:block;width:100%;height:38px;border-radius:6px;border:1px solid rgba(255,255,255,.2)}.fp-ral b{font-size:13px}.fp-ral span{font-size:11px;opacity:.75}
.fp-sw{display:flex;gap:6px;flex-wrap:wrap}.fp-sw button{width:34px;height:34px;border-radius:50%;border:2px solid #fff;cursor:pointer}.fp-cn{margin-inline-start:8px;font-size:13px;font-weight:700}
html.fx-day .fp-ral i,html.fx-day .fp-sw button,html.fx-day input[type=color]{filter:invert(1) hue-rotate(180deg)}
@media print{.fp-t,.fp-ov,#fpWorker,#fpWa,#fpSign,#fpSignB,.fp-card:not([data-sec]){display:none!important}
 .fp-qrtb{display:flex!important;flex-direction:row-reverse;align-items:center;gap:6px;justify-content:flex-start;font-size:9pt}.fp-qrtb svg,.fp-qr svg{width:24mm!important;height:24mm!important}
 .pr-hide-cut .fp-card[data-sec=cut],.pr-hide-draw .fp-qrtb{display:none!important}}`;
const st=document.createElement('style');st.id='fpCss';st.textContent=css;document.head.appendChild(st);

const prev=show;show=function(id){prev(id);try{plus(id)}catch(e){console.error('forge-plus',e)}};
if(location.hash)show(decodeURIComponent(location.hash.slice(1)));
})();
