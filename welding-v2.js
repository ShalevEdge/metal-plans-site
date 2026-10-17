(()=>{
'use strict';
if(!window.WELD) return;
const advanced={
 principles:[
  {t:'קשת ואמבט ריתוך',d:'בקשת חשמלית האנרגיה מותכת את חומר האם ואת חומר המילוי. אורך קשת, זרם, זווית ומהירות התקדמות משפיעים יחד על צורת הזחל, החדירה וההתכה.'},
  {t:'אזור מושפע מחום (HAZ)',d:'גם חומר שלא הותך עשוי לשנות תכונות בגלל החום. קצב הקירור, עובי החומר, ריתום והרכב הפלדה משפיעים על התוצאה.'},
  {t:'סיגים והגנת האמבט',d:'ב-SMAW ציפוי האלקטרודה מייצב את הקשת, מגן על אמבט הריתוך ותורם ליצירת סיגים. בין זחלים יש להסיר סיגים היטב.'},
  {t:'התפשטות, התכווצות ועיוות',d:'המתכת מתפשטת בחימום ומתכווצת בקירור. סדר תקים וריתוכים, ריתום נכון וריתוך מאוזן עוזרים לצמצם עיוותים ומאמצים פנימיים.'}
 ],
 prep:[
  {max:3,text:'בדרך כלל אין צורך בפאזה בעובי עד כ-3 מ״מ; יש לוודא התאמה, ניקיון ומרווח לפי המפרט.'},
  {max:5,text:'מעל 3 מ״מ יש לבחון הכנת שפה/פאזה לפי המחבר וה-WPS; לעיתים נדרש ריתוך רב-זחלי.'},
  {max:10,text:'בחומר עבה יותר נדרשים בדרך כלל תפר שורש, מילוי וכיסוי במספר זחלים; גיאומטריית המחבר לפי WPS/שרטוט.'},
  {max:999,text:'עובי משמעותי: אין לקבוע הכנת מחבר, חימום קדם או סדר זחלים מכלל אצבע. יש לפעול לפי WPS/תקן/מהנדס ריתוך.'}
 ],
 heat:[
  'חימום קדם עשוי להקטין קצב קירור ולהפחית קשיות ושבירות באזור המושפע מחום.',
  'חימום קדם מסייע לסילוק לחות מפני השטח ובכך מפחית סיכון לסידוק מימני.',
  'חימום קדם יכול להקטין השפעות של ריתום יתר; הטמפרטורה עצמה חייבת להיקבע לפי WPS/תקן ולא לפי האתר.'
 ],
 electrical:[
  {t:'הארקה',d:'צבת הארקה צריכה להיות מחוברת היטב, קרוב ככל האפשר לאזור העבודה, על שטח נקי מצבע, חלודה, שמן ולכלוך.'},
  {t:'כבלי ריתוך',d:'חתך הכבל נקבע לפי הזרם והאורך. משתמשים בכבל ריתוך תקני, גמיש ובעל בידוד תקין; אין לבחור חתך מהאתר ללא נתוני יצרן/WPS.'},
  {t:'קוטביות',d:'DCEN/DCEP משנים את חלוקת החום והתנהגות הקשת. הבחירה תלויה באלקטרודה ובהוראות היצרן/המפרט.'}
 ],
 qualification:['תהליך הריתוך (למשל SMAW)','סוג המחבר וצורת הדגם','טווח עובי החומר','קבוצת/סוג חומר האם','תנוחת הריתוך','סוג ציפוי האלקטרודה והמיומנות הנדרשת'],
 glossary:[
  ['זחל ריתוך','מתכת הריתוך המונחת במעבר אחד; יכול להיות זחל מיתרי צר או זחל רחב בצידוד.'],
  ['ריתוך הכלבה / תקים','קטעי ריתוך קצרים לקיבוע חלקי המחבר לפני או במהלך הריתוך. סדר התקים משפיע על הדיוק והעיוות.'],
  ['אורך קשת','המרחק בין קצה ליבת האלקטרודה לבין אמבט הריתוך.'],
  ['מכתש','שקע בקצה הזחל שנוצר בעת הפסקת הקשת; חיבור מחדש דורש ניקוי ומילוי נאות.'],
  ['חוסר חדירה','חדירה פחותה מהנדרש בשורש המחבר; פגם משמעותי.'],
  ['חוסר התכה','אי התחברות מספקת בין חומר הרתך לחומר האם או בין זחלים.'],
  ['קעקוע / Undercut','תעלה בשולי הזחל שנגרמה בין היתר מפרמטרים או תמרון לא מתאימים.'],
  ['סידוק מימני','סידוק קר הקשור בין היתר למימן שמקורו בלחות, למבנה מתכתי רגיש ולמאמצים; עלול להופיע באיחור.'],
  ['צוואר ריתוך','מידה גיאומטרית מרכזית בריתוך מילאת; נמדדת לפי הגדרת התקן הרלוונטי.'],
  ['HAZ','האזור בחומר האם שלא הותך אך תכונותיו השתנו בגלל חום הריתוך.']
 ]
};
function esc(s){return window.MP?.esc?MP.esc(s):String(s)}
function thicknessPrep(t){t=+t||0;return advanced.prep.find(x=>t<=x.max)?.text||advanced.prep.at(-1).text}
function processRisk(t,e,pos){const notes=[];t=+t||0;if(t>3)notes.push('יש לבחון הכנת פאזה/רב-זחלי לפי WPS.');if(t>=10)notes.push('עובי גבוה מגדיל רגישות לקצב קירור ולעיוות; בדוק דרישת חימום קדם.');if(e==='E7018')notes.push('אלקטרודה בסיסית/דלת מימן: הקפד על אחסון וייבוש לפי הוראות היצרן וה-WPS ועל הסרת סיגים בין זחלים.');if(['F3','F4','G3','G4'].includes(pos))notes.push('תנוחה מורכבת: נדרש שליטה באמבט, קשת קצרה וטכניקה המתאימה לתנוחה.');return notes}
function jointLabel(j){return {fillet:'קמץ / מילאת',butt:'השקה',lap:'חפייה'}[j]||j}
function buildAdvanced(){
 const host=document.getElementById('weldAdvanced');if(!host)return;
 host.innerHTML=`<section class="weld-section"><p class="section-kicker">10 · תורת התהליך</p><h2>מה קורה למתכת בזמן ריתוך</h2><div class="grid">${advanced.principles.map(x=>`<div class="card"><h3>${x.t}</h3><p class="muted">${x.d}</p></div>`).join('')}</div></section>
 <section class="weld-section"><p class="section-kicker">11 · הכנת מחבר וחום</p><h2>Joint & Heat Advisor</h2><div class="card"><div class="wi-grid" id="advSummary"></div><div id="advWarnings"></div></div><div class="grid" style="margin-top:12px">${advanced.heat.map((x,i)=>`<div class="card"><span class="pill">${i+1}</span><p>${x}</p></div>`).join('')}</div></section>
 <section class="weld-section"><p class="section-kicker">12 · חשמל וציוד</p><h2>מערכת הריתוך והחיבורים</h2><div class="grid">${advanced.electrical.map(x=>`<div class="card"><h3>${x.t}</h3><p class="muted">${x.d}</p></div>`).join('')}</div></section>
 <section class="weld-section"><p class="section-kicker">13 · תחום הסמכה</p><h2>Qualification Scope Check</h2><div class="card"><p>המערכת לא מאשרת הסמכה. היא מזכירה אילו משתנים צריך להשוות לתעודת הרתך ולדרישות העבודה:</p><div class="qual-grid">${advanced.qualification.map(x=>`<label class="qual-row"><input type="checkbox"><span>${x}</span></label>`).join('')}</div><div class="notice" style="margin-top:12px"><b>כלל עבודה:</b> שינוי מחוץ לתחום ההסמכה — למשל תהליך, עובי, חומר או תנוחה — מחייב בדיקה מול התעודה/התקן לפני ביצוע.</div></div></section>
 <section class="weld-section"><p class="section-kicker">14 · שפת השרטוט</p><h2>בונה סימן ריתוך בסיסי</h2><div class="card"><div class="formgrid"><label>מחבר<select id="symJoint"><option value="fillet">מילאת / קמץ</option><option value="butt">השקה</option></select></label><label>צד<select id="symSide"><option value="arrow">צד החץ</option><option value="other">הצד השני</option></select></label><label>מידה <span class="unit">מ״מ</span><input id="symSize" type="number" min="0" step="0.5" value="6"></label></div><div id="symbolOut" class="symbol-builder"></div><p class="muted">זהו כלי המחשה לקריאת שרטוט. סימן ביצוע סופי חייב להתאים לתקן, לשרטוט המאושר ול-WPS.</p></div></section>
 <section class="weld-section"><p class="section-kicker">15 · מילון ריתוך</p><h2>מונחים מקצועיים</h2><div class="card"><input id="glossaryQ" placeholder="חפש: חדירה, מכתש, HAZ, תקים..."><div id="glossary" class="defect-grid" style="margin-top:12px"></div></div></section>`;
 bindAdvanced();
}
function bindAdvanced(){
 const inputs=['th','el','dia','joint','pos'].map(id=>document.getElementById(id)).filter(Boolean);
 function refresh(){const t=+document.getElementById('th')?.value||0,e=document.getElementById('el')?.value||'',j=document.getElementById('joint')?.value||'',p=document.getElementById('pos')?.value||'';const a=document.getElementById('advSummary'),w=document.getElementById('advWarnings');if(a)a.innerHTML=`<div><span>עובי</span><b>${t||'—'} מ״מ</b></div><div><span>מחבר</span><b>${jointLabel(j)}</b></div><div><span>הכנת מחבר</span><b>${thicknessPrep(t)}</b></div><div><span>תנוחה</span><b>${p}</b></div>`;const n=processRisk(t,e,p);if(w)w.innerHTML=n.length?`<div class="warn" style="margin-top:12px"><b>נקודות לבדיקה לפני ריתוך:</b><ul>${n.map(x=>`<li>${x}</li>`).join('')}</ul></div>`:'<div class="okb" style="margin-top:12px">אין התראת תהליך נוספת מתוך כללי ההדרכה; עדיין יש לפעול לפי WPS/שרטוט/יצרן.</div>'}
 inputs.forEach(x=>x.addEventListener('input',refresh));refresh();
 const sj=document.getElementById('symJoint'),ss=document.getElementById('symSide'),sz=document.getElementById('symSize');
 function sym(){const o=document.getElementById('symbolOut');if(!o)return;const y=ss.value==='arrow'?56:30,s=esc(sz.value||''),glyph=sj.value==='fillet'?`<path d="M180 ${y} l22 -22 v22 z" fill="none" stroke="currentColor" stroke-width="3"/>`:`<path d="M180 ${y-18} l12 18 l12 -18" fill="none" stroke="currentColor" stroke-width="3"/>`;o.innerHTML=`<svg viewBox="0 0 520 100" role="img" aria-label="המחשת סימן ריתוך"><line x1="70" y1="56" x2="430" y2="56" stroke="currentColor" stroke-width="3"/><line x1="70" y1="56" x2="28" y2="84" stroke="currentColor" stroke-width="3"/><path d="M28 84 l12 -2 l-7 -10 z" fill="currentColor"/>${glyph}<text x="145" y="${y-7}" fill="currentColor" font-size="20" text-anchor="end">${s}</text><path d="M430 56 l35 -20 m-35 20 l35 20" fill="none" stroke="currentColor" stroke-width="3"/></svg>`}
 [sj,ss,sz].forEach(x=>x&&x.addEventListener('input',sym));if(sj)sym();
 const q=document.getElementById('glossaryQ');function gloss(){const z=(q?.value||'').trim().toLowerCase(),out=document.getElementById('glossary');if(!out)return;out.innerHTML=advanced.glossary.filter(([a,b])=>!z||(a+' '+b).toLowerCase().includes(z)).map(([a,b])=>`<details class="defect"><summary><b>${a}</b></summary><div class="defect-body"><p>${b}</p></div></details>`).join('')||'<div class="empty">לא נמצא מונח מתאים.</div>'}if(q)q.addEventListener('input',gloss);gloss();
}
WELD.advanced=advanced;WELD.thicknessPrep=thicknessPrep;WELD.processRisk=processRisk;
document.addEventListener('DOMContentLoaded',buildAdvanced);
})();

// Enrich plan-level welding guidance without changing the geometry engine.
if(window.WELD?.renderPlanCard && !window.WELD._v2Wrapped){
  const base=WELD.renderPlanCard;
  WELD.renderPlanCard=function(input){
    const html=base(input),parts=Array.isArray(input)?input:input?.parts,t=WELD.dominantThickness(parts);
    if(!t) return html;
    const prep=WELD.thicknessPrep(t),heat=t>=10?'<div class="warn" style="margin-top:8px"><b>בדוק חימום קדם:</b> בעובי זה קצב הקירור, קשיות ועיוות מקבלים משקל גדול יותר. אין לקבוע טמפרטורה ללא WPS/תקן.</div>':'';
    return html+`<div class="card weld-plan-v2" style="margin-top:10px"><h3>בדיקת תהליך לפני ביצוע</h3><p><b>עובי דופן דומיננטי:</b> ${t} מ״מ</p><p><b>הכנת מחבר:</b> ${prep}</p>${heat}<p class="muted">לפני ריתוך בפועל יש לאמת חומר, מחבר, תנוחה, אלקטרודה, קוטביות, WPS והסמכת רתך.</p><a class="btn ghost" href="welding.html?t=${encodeURIComponent(t)}">פתח FORGE Welding Intelligence</a></div>`;
  };
  WELD._v2Wrapped=true;
}
