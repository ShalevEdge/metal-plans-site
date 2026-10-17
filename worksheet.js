/* SHALVERO FORGE – worksheet.js
   1) כל סוגי החומרים בשוק + כרטיס חומר
   2) "דף עבודה למסגר": הסבר פשוט ליד השרטוט + ביצוע מההתחלה עד הסוף
   3) הדפסה בכל גודל דף (A4–A0, Letter…), לאורך/לרוחב, עמוד לכל מבט, קנה מידה מדויק
   נטען אחרי הסקריפט הראשי של plans.html ועוטף את show() בלי לשנות אותו. */
(function(){
'use strict';
if(typeof MAT==='undefined'||typeof show!=='function')return;

/* ---------- 1. חומרים ---------- */
const MATX={
 fe:{n:'ברזל שחור S235 (ST37) – לצביעה',rho:7.85,ppk:9,fin:4,fn:'יסוד + צבע',grp:'פלדה',
  use:'החומר הנפוץ ביותר: שערים, מעקות, סורגים, מסגרות.',weld:'MAG (חוט ER70S-6 + גז) או אלקטרודה E6013 / E7018',care:'חייב יסוד וצבע – בלי צבע יחליד.'},
 fe355:{n:'פלדה S355 (ST52) – חוזק גבוה',rho:7.85,ppk:10.5,fin:4,fn:'יסוד + צבע',grp:'פלדה',
  use:'קונסטרוקציה, קורות נושאות, סככות ופרגולות גדולות.',weld:'MAG (ER70S-6) או E7018. בעובי מעל 25 מ״מ – חימום מוקדם',care:'לבדוק תעודת חומר כשמהנדס דורש S355.'},
 ga:{n:'ברזל מגולוון חם (טבילה אחרי ייצור)',rho:7.85,ppk:9,fin:6,fn:'גלוון חם אחרי ייצור',grp:'פלדה',
  use:'עבודות חוץ שצריכות לשרוד שנים: שערים, גדרות, מעקות חוץ.',weld:'מרתכים בשחור ושולחים לגלוון. להשאיר חורי ניקוז ואוורור בפרופילים סגורים!',care:'בלי חורי אוורור הפרופיל יכול להתפוצץ באמבט הגלוון.'},
 pg:{n:'פרופיל מגולוון מפעל (סנדזימיר / Pre-galv)',rho:7.85,ppk:10,fin:1.5,fn:'צבע תיקון אבץ בריתוכים',grp:'פלדה',
  use:'פרגולות, גדרות קלות, מבנים – מגיע כבר מגולוון.',weld:'MAG. לנקות אבץ לפני ריתוך, ואחרי – ספריי אבץ קר על התפר',care:'עשן אבץ מזיק! ריתוך רק עם אוורור טוב ומסכה.'},
 eg:{n:'פח / פרופיל מגולוון אלקטרולטי',rho:7.85,ppk:10,fin:3,fn:'צבע',grp:'פלדה',
  use:'עבודות פנים, ארונות, חיפויים – שכבת אבץ דקה.',weld:'MAG / נקודות. לנקות לפני ריתוך',care:'לא מתאים לחוץ בלי צבע.'},
 cor:{n:'פלדת קורטן (Corten / עמידה באקלים)',rho:7.85,ppk:18,fin:0,fn:'חלודה מבוקרת (ללא צבע)',grp:'פלדה',
  use:'עיצוב: אדניות, חיפויים, גדרות "חלודות", פסלים.',weld:'MAG עם חוט מתאים לקורטן (למשל ER80S-G) כדי שגם התפר "יחליד" באותו צבע',care:'מכתים בטון ואבן מתחת בשנה הראשונה – לתכנן ניקוז.'},
 ss:{n:'נירוסטה 304',rho:7.93,ppk:42,fin:3,fn:'ליטוש / הברשה',grp:'נירוסטה',
  use:'מעקות, ידיות, מטבחים, עבודות פנים וחוץ רגילות.',weld:'TIG עם מוט ER308L (או MIG עם גז מתאים)',care:'כלים נפרדים בלבד (דיסק, מברשת) – ברזל מזהם את הנירוסטה ויוצר כתמי חלודה.'},
 ss316:{n:'נירוסטה 316 (ימית)',rho:7.98,ppk:55,fin:3,fn:'ליטוש / הברשה',grp:'נירוסטה',
  use:'ליד הים (עד ~5 ק״מ), בריכות, כימיקלים.',weld:'TIG עם מוט ER316L',care:'כמו 304 – כלים נפרדים, לא לגעת בברזל.'},
 ss430:{n:'נירוסטה 430 (פריטית)',rho:7.7,ppk:30,fin:2,fn:'הברשה',grp:'נירוסטה',
  use:'עבודות פנים בלבד, חיפויים ודקורציה. זולה, מגנטית.',weld:'TIG עם מוט ER309L / ER430 – ריתוך מוגבל',care:'לא לחוץ – מחלידה.'},
 al:{n:'אלומיניום 6063 (פרופילים)',rho:2.7,ppk:38,fin:0,fn:'ללא / אנודייז',grp:'אלומיניום',
  use:'שערים קלים, פרגולות, מעקות זכוכית, חלונות – לא מחליד ושוקל שליש מברזל.',weld:'TIG (זרם AC) עם מוט ER4043 או ER5356, או MIG עם רולר מיוחד',care:'צריך מכונת ריתוך מתאימה. לנקות שמן ותחמוצת לפני ריתוך.'},
 al6061:{n:'אלומיניום 6061 (קונסטרוקטיבי)',rho:2.7,ppk:42,fin:0,fn:'ללא / אנודייז',grp:'אלומיניום',
  use:'מבנים נושאים קלים, סולמות, נגררים.',weld:'TIG AC עם ER4043 / ER5356',care:'ריתוך מחליש את האזור הסמוך – לתכנן חוזק בהתאם.'},
 alp:{n:'אלומיניום צבוע בתנור (אלקטרוסטטי)',rho:2.7,ppk:46,fin:0,fn:'צבע תנור מפעל',grp:'אלומיניום',
  use:'פרגולות ושערים מוכנים בצבע, בלי צביעה בשטח.',weld:'עדיף חיבור בברגים/זוויות. ריתוך שורף את הצבע',care:'להזמין חיתוכים מדויקים מראש.'},
 br:{n:'פליז',rho:8.5,ppk:60,fin:3,fn:'ליטוש + לכה',grp:'מתכות אחרות',
  use:'עיטורים, ידיות, מעקות יוקרה.',weld:'הלחמה קשה (כסף/פליז) או TIG בזהירות',care:'עשן אבץ בחימום – אוורור טוב.'},
 cu:{n:'נחושת',rho:8.96,ppk:70,fin:2,fn:'לכה / פטינה',grp:'מתכות אחרות',
  use:'עיטורים, מרזבים, עבודות אמנות.',weld:'הלחמה קשה או TIG עם חימום',care:'מוליכה חום מאוד – צריך יותר זרם.'},
 wi:{n:'ברזל דקורטיבי (עיטורים יצוקים/מחושלים)',rho:7.85,ppk:16,fin:5,fn:'יסוד + צבע',grp:'פלדה',
  use:'שערים ומעקות בסגנון קלאסי – חיצים, ספירלות, עלים.',weld:'MAG / אלקטרודה. ברזל יציקה אמיתי – אלקטרודת ניקל בלבד',care:'רוב העיטורים בשוק הם פלדה מחושלת ומתרתכים רגיל – לשאול את הספק.'}
};
for(const k of Object.keys(MATX)){MAT[k]=Object.assign({},MAT[k]||{},MATX[k])}

/* ---------- עזרים ---------- */
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const F=n=>Math.round(n).toLocaleString('en-US');
const m2=mm=>{const m=mm/1000;return m>=1?m.toFixed(m<10?2:1).replace(/\.?0+$/,'')+' מטר':F(mm/10)+' ס״מ'};
const LS={get(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const curMat=()=>{let m='fe';try{m=(getSet().mat)||'fe'}catch(e){}return MAT[m]?m:'fe'};
const catOf=k=>{try{const c=CATS.find(c=>c[1].includes(k));return c?c[0]:''}catch(e){return''}};
const FRAME=/מסגרת|קורה|עמוד|רגל|משקוף|מיתר|קורת|זרוע|מאחז|טבעת|בסיס|מוביל/;
const FILL=/מוט|מילוי|שבכה|פס |פס$|תריס|שלב|מרישה|רפטר|מפריד|חיזוק|תומך|תומכת|אלכסון|קשר/;

/* מידות מסגרת ראשית מתוך המודל (לבדיקת אלכסונים) */
function frameBox(p){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9,n=0;
 for(const e of p.model){if(!e.n||!(e.role==='m'||e.role==='post'))continue;for(const q of[...e.A,...e.B]){n++;
  x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);z0=Math.min(z0,q[2]);z1=Math.max(z1,q[2])}}
 return n?{w:x1-x0,h:y1-y0,d:z1-z0}:null}

/* ---------- 2. דף עבודה למסגר ---------- */
const TIPS={
 'שערים ודלתות':['לפני ההתקנה בודקים שהעמודים בשטח ישרים (פלס) ושהמרחק ביניהם תואם לשרטוט.','צירים / גלגלים מרתכים רק אחרי שהכנף ישרה לגמרי.','בודקים שהשער נפתח ונסגר חלק, בלי להיתקע ובלי לשפשף ברצפה.','בשער חשמלי – מנוע, עיניים ופס בטיחות לפי ת״י 900-21.03. לא סוגרים פרויקט בלי בדיקה.'],
 'מעקות, גדרות וסורגים':['המרווח בין מוטות לא יותר מ-10 ס״מ – שראש של ילד לא יעבור (ת״י 1142).','גובה מעקה נמדד מהרצפה הגמורה (אחרי ריצוף), לא מהבטון.','עיגון לבטון: ברגים / עוגן כימי לפי הוראות היצרן, לא לקצר.','מעקה לא אמור "לזוז" כשנשענים עליו – בודקים בכוח.'],
 'מדרגות וסולמות':['כל מדרגה באותו גובה בדיוק – הבדל קטן גורם למעידות.','מסמנים את המדרגות על המיתר לפני ריתוך, מהמדרגה התחתונה כלפי מעלה.','חייבים מאחז יד / מעקה – בטיחות.','סולם מעל 3 מטר – צריך כלוב בטיחות.'],
 'הצללה ומבנים':['העמודים חייבים להיות ישרים (פלס בשני כיוונים) לפני שמניחים קורות.','מוסיפים שיפוע לניקוז מים.','מבנה עם גג – עומסי רוח: בדיקת מהנדס, ולפעמים היתר בנייה.','מתקינים בשני אנשים לפחות – החלקים ארוכים וכבדים.'],
 'ריהוט':['מרתכים על שולחן ישר כדי שהרהיט לא "ידדה".','משייפים פינות חדות – אנשים נוגעים ברהיט.','רגליות מתכווננות מתקנות רצפה עקומה.'],
 'סדנה ותעשייה':['מסמנים על המדף את העומס המקסימלי.','שולחן ריתוך – הפלטה צריכה להיות ישרה; מרתכים אותה בנקודות לסירוגין.','עגלה – גלגלים עם בלם בצד אחד לפחות.'],
 'חוץ, גינה ובית':['עבודת חוץ – מגולוון או יסוד טוב + 2 שכבות צבע.','מתקן לילדים (נדנדה) – בודקים יציבות ומרחב בטיחות מסביב.','מסתור גז / מזגן – משאירים אוורור, לא סוגרים לגמרי.']
};
function guideHTML(p){
 const mk=curMat(),mt=MAT[mk],{rows}=pack(p.parts),cat=catOf(p.k),fb=frameBox(p),tot=p.parts.reduce((a,r)=>a+r[3],0);
 const fr=p.parts.map((r,i)=>({r,i})).filter(x=>FRAME.test(x.r[0])),fi=p.parts.map((r,i)=>({r,i})).filter(x=>!FRAME.test(x.r[0]));
 const num=i=>`<b class="ws-n">${i+1}</b>`;
 const ang=p.parts.map((r,i)=>({r,i})).filter(x=>x.r[4]);
 const diag=fb&&fb.w>200&&fb.h>200?Math.round(Math.hypot(fb.w,fb.h)):0,diagT=fb&&fb.w>200&&fb.d>200?Math.round(Math.hypot(fb.w,fb.d)):0;
 const sec=(id,ic,t,body,open)=>`<details class="ws-s" ${open?'open':''}><summary><span class="ws-ic">${ic}</span>${t}</summary><div class="ws-b">${body}</div></details>`;
 const legend=`<div class="ws-leg">
  <div><svg viewBox="0 0 120 34"><line x1="6" y1="22" x2="114" y2="22" stroke="#6B7680"/><line x1="6" y1="15" x2="6" y2="29" stroke="#6B7680"/><line x1="114" y1="15" x2="114" y2="29" stroke="#6B7680"/><text x="60" y="15" font-size="13" text-anchor="middle" fill="#B93E07" font-weight="700">1,600</text></svg><p><b>קו מידה.</b> המספר = המרחק בין שני הקווים הקטנים, ב<b>מילימטרים</b>. 1,600 = 160 ס״מ = 1.6 מטר.</p></div>
  <div><svg viewBox="0 0 120 34"><circle cx="60" cy="17" r="12" fill="#fff" stroke="#B93E07" stroke-width="2"/><text x="60" y="22" font-size="14" text-anchor="middle" fill="#B93E07" font-weight="700">3</text></svg><p><b>עיגול עם מספר.</b> זה "שם" של החלק. מחפשים את אותו מספר ברשימת החיתוך – שם כתוב מה לחתוך.</p></div>
  <div><svg viewBox="0 0 120 34"><rect x="10" y="6" width="44" height="22" fill="#DCE1E6" stroke="#1F2328"/><rect x="66" y="6" width="44" height="22" fill="#F9C7A3" stroke="#1F2328"/></svg><p><b>צבעים בשרטוט.</b> אפור = פרופילים. כתום = עמודים / חלקים ראשיים שנושאים משקל. בז׳ = עץ או משטח (לא כלול בחיתוך).</p></div>
  <div><svg viewBox="0 0 120 34"><line x1="6" y1="20" x2="114" y2="20" stroke="#6B7680" stroke-width="1.5" stroke-dasharray="8 5"/></svg><p><b>קו מקווקו למטה</b> = הרצפה / האדמה.</p></div>
  <div><svg viewBox="0 0 120 34"><rect x="30" y="4" width="60" height="26" fill="url(#wsmh)" stroke="#1F2328"/><defs><pattern id="wsmh" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 0L8 8M8 0L0 8" stroke="#7E8890" stroke-width=".8"/></pattern></defs></svg><p><b>משבצות / קווים אלכסוניים</b> = רשת או קיר (הקיר רק כדי להראות איפה זה מותקן).</p></div>
 </div>`;
 const views=`<ul><li><b>חזית</b> – כמו שעומדים מול העבודה ומסתכלים ישר.</li><li><b>מבט צד</b> – כמו שעומדים בצד ומסתכלים. רואים את העובי / העומק.</li><li><b>מבט על</b> – כמו ציפור שמסתכלת מלמעלה.</li><li><b>איזומטרי</b> – תמונה בתלת-ממד, כדי להבין איך הכל מתחבר. לא מודדים ממנה.</li></ul>`;
 const prof=`<div class="ws-prof"><svg viewBox="0 0 150 110"><rect x="25" y="15" width="90" height="60" fill="#DCE1E6" stroke="#1F2328" stroke-width="2"/><rect x="33" y="23" width="74" height="44" fill="#fff" stroke="#1F2328"/><line x1="25" y1="88" x2="115" y2="88" stroke="#B93E07"/><text x="70" y="103" font-size="13" text-anchor="middle" fill="#B93E07" font-weight="700">60</text><line x1="130" y1="15" x2="130" y2="75" stroke="#B93E07"/><text x="142" y="49" font-size="13" text-anchor="middle" fill="#B93E07" font-weight="700">40</text><text x="29" y="12" font-size="11" fill="#B93E07" font-weight="700">2</text></svg>
  <p>פרופיל <b dir="ltr">60×40×2</b> = צינור מלבני: <b>60</b> מ״מ רוחב, <b>40</b> מ״מ גובה, דופן בעובי <b>2</b> מ״מ. אם יש רק שני מספרים (למשל <span dir="ltr">40×3</span>) – זה פס שטוח: 40 רוחב, 3 עובי.</p></div>`;
 const read=legend+`<h4>4 התמונות של השרטוט</h4>`+views+`<h4>איך קוראים פרופיל</h4>`+prof+`<div class="ws-tip">🧠 <b>כלל זהב:</b> מודדים פעמיים, חותכים פעם אחת. כל המספרים בשרטוט הם במילימטרים (מ״מ). 1 מטר = 1,000 מ״מ.</div>`;
 const buy=`<p>לפני שמתחילים, בודקים שיש את כל החומר:</p><ul class="ws-chk">${rows.map(r=>`<li><span class="ws-box"></span><b>${r.bars}</b> מוטות של <b dir="ltr">${E(r.p)}</b> באורך 6 מטר</li>`).join('')}${p.hw.map(h=>`<li><span class="ws-box"></span>${E(h)}</li>`).join('')}</ul><p class="ws-mut">חומר: <b>${E(mt.n)}</b></p>`;
 const safety=`<ul class="ws-chk"><li><span class="ws-box"></span>משקפי מגן לחיתוך ולהשחזה, מסכת ריתוך, כפפות ריתוך, אטמי אוזניים.</li><li><span class="ws-box"></span>בגדים ארוכים מכותנה (לא סינתטי – נמס). נעלי עבודה.</li><li><span class="ws-box"></span>אזור נקי מחומרים דליקים, מטף זמין.</li><li><span class="ws-box"></span>אוורור טוב – במיוחד במגולוון ובפליז (עשן אבץ מזיק).</li><li><span class="ws-box"></span>הארקה של מכונת הריתוך מחוברת קרוב לעבודה.</li></ul>`;
 const cut=`<ol class="ws-steps">
  <li>לוקחים מוט ומסמנים עליו את החיתוכים עם סופר / גיר. משתמשים ב<b>"סימון חיתוכים על המוט"</b> בהמשך הדף – הוא מראה מאיזה מוט לחתוך כל חלק, כך שיישאר הכי מעט פסולת.</li>
  <li>חותכים כל חלק לפי הרשימה:<ul class="ws-chk">${p.parts.map(([n,pr,l,q,a],i)=>`<li><span class="ws-box"></span>${num(i)} <b>${E(n)}</b> – לחתוך <b>${q}</b> ${q>1?'חתיכות':'חתיכה'} באורך <b>${F(l)} מ״מ</b> (${m2(l)}) מפרופיל <b dir="ltr">${E(pr)}</b>${a?` · <span class="ws-ang">חיתוך בזווית ${a}°</span>`:''}</li>`).join('')}</ul></li>
  ${ang.length?`<li>חלקים עם <b>זווית</b>: מסובבים את המסור לזווית שכתובה. אם המסור מודד מהקו הישר – מכוונים ל-${ang.map(x=>`${90-x.r[4]}°`).filter((v,i,a)=>a.indexOf(v)===i).join(' / ')}. חותכים קודם חתיכת ניסיון.</li>`:''}
  <li>אחרי כל חיתוך מורידים את ה<b>גרד</b> (השוליים החדים) עם פצירה או דיסק – אחרת החלקים לא נצמדים טוב ואפשר להיחתך.</li>
  <li>כותבים על כל חלק את המספר שלו בטוש – כך לא מתבלבלים בהרכבה.</li>
  <li>שאריות מעל 50 ס״מ – לא זורקים! מכניסים למלאי.</li></ol>`;
 const asm=`<ol class="ws-steps">
  <li>מניחים את החלקים על <b>משטח ישר</b> (שולחן ריתוך או רצפה ישרה), לפי השרטוט בחזית.</li>
  ${fr.length?`<li>קודם בונים את ה<b>שלד / המסגרת</b>: ${fr.map(x=>`${num(x.i)} ${E(x.r[0])}`).join(', ')}.</li>`:''}
  <li>מחברים כל פינה ב<b>נקודת ריתוך קטנה</b> (״טאק״) – זה כמו מסמר זמני. עדיין לא מרתכים עד הסוף!</li>
  ${diag?`<li><b>בדיקת ישרות (אלכסונים):</b> מודדים מפינה לפינה, ב-X. שני האלכסונים חייבים להיות <b>שווים</b> – בערך <b>${F(diag)} מ״מ</b> כל אחד. אם יש הבדל – דוחפים קלות את הפינה הארוכה עד שהם שווים.</li>`:''}
  ${diagT?`<li>מבט מלמעלה: גם כאן שני האלכסונים שווים – בערך <b>${F(diagT)} מ״מ</b>.</li>`:''}
  <li>בודקים עם <b>פלס</b> שהכל ישר, ועם <b>זווית ישרה (גוניה)</b> שכל פינה 90°.</li>
  ${fi.length?`<li>עכשיו מוסיפים את שאר החלקים: ${fi.map(x=>`${num(x.i)} ${E(x.r[0])}`).join(', ')}. מסמנים קודם על המסגרת איפה כל אחד נכנס – במרווחים שווים, לפי השרטוט.</li>`:''}
  <li>שוב טאקים בלבד, ושוב בדיקת אלכסונים ופלס.</li></ol>
  <div class="ws-tip">💡 טריק למרווחים שווים: חותכים "מרווח" מעץ או משארית בדיוק ברוחב הרווח, ומשתמשים בו כשבלונה בין מוט למוט.</div>`;
 const weld=`<ol class="ws-steps">
  <li>שיטת ריתוך מומלצת לחומר הזה: <b>${E(mt.weld||'לפי החומר')}</b>.</li>
  <li>מרתכים <b>לסירוגין</b>: קצת בצד אחד, אחר כך בצד השני, אחר כך בפינה רחוקה. אם מרתכים הכל בצד אחד – החום מעקם את העבודה.</li>
  <li>מתחילים מהשלד (המסגרת), ורק אחר כך את המילוי.</li>
  <li>אחרי כמה ריתוכים – בודקים שוב אלכסונים ופלס. עדיף לתקן עכשיו מאשר בסוף.</li>
  <li>נותנים לריתוך להתקרר לבד – <b>לא מקררים במים</b> (זה מחליש אותו).</li>
  <li>מנקים את הסיגים (הקליפה השחורה) בפטיש סיגים ובמברשת פלדה.</li></ol>
  <p class="ws-mut">יש הגדרות זרם, זוויות ופתרון תקלות ב<a href="welding.html">מרכז הריתוך</a>.</p>`;
 const finish=`<ol class="ws-steps">
  <li>משחיזים ריתוכים בולטים במקומות שרואים או נוגעים בהם (ידיות, מעקות, חלק עליון).</li>
  <li>מנקים שמן ולכלוך (מדלל / מסיר שומנים) – צבע לא נדבק על שמן.</li>
  <li>גימור לחומר הזה: <b>${E(mt.fn||'לפי החומר')}</b>.</li>
  ${mk==='ga'?'<li>נשלח לגלוון: לוודא שיש <b>חורי אוורור וניקוז</b> בכל פרופיל סגור (כ-10 מ״מ בכל קצה)!</li>':''}
  ${mt.care?`<li>⚠️ ${E(mt.care)}</li>`:''}</ol>`;
 const inst=`<ol class="ws-steps">${(TIPS[cat]||[]).map(t=>`<li>${E(t)}</li>`).join('')}<li>מורידים פינות חדות ושאריות ריתוך באזורים שאנשים נוגעים.</li><li>מנקים את השטח, אוספים שאריות וברגים.</li></ol>`;
 const done=`<ul class="ws-chk"><li><span class="ws-box"></span>כל המידות תואמות לשרטוט (±2 מ״מ).</li><li><span class="ws-box"></span>אלכסונים שווים, הכל בפלס.</li><li><span class="ws-box"></span>אין ריתוכים חסרים או סדוקים.</li><li><span class="ws-box"></span>אין פינות חדות.</li><li><span class="ws-box"></span>חלקים נעים (שער/דלת) זזים חלק.</li><li><span class="ws-box"></span>הגימור אחיד, בלי כתמים.</li><li><span class="ws-box"></span>צילמתי את העבודה הגמורה.</li></ul>`;
 const words=`<dl class="ws-dict"><dt>פרופיל</dt><dd>צינור / מוט מתכת שמגיע באורך 6 מטר.</dd><dt>חתך</dt><dd>הצורה של הפרופיל כשחותכים אותו (ריבוע, מלבן, פס).</dd><dt>טאק</dt><dd>נקודת ריתוך קטנה וזמנית שמחזיקה חלקים במקום.</dd><dt>גרד</dt><dd>קצוות חדים שנשארים אחרי חיתוך.</dd><dt>קרף</dt><dd>כמה המסור "אוכל" בחיתוך (בערך ${typeof KERF!=='undefined'?KERF:3} מ״מ).</dd><dt>אלכסון</dt><dd>מרחק מפינה לפינה הנגדית – בודקים איתו שהמסגרת ישרה.</dd><dt>פלס</dt><dd>כלי עם בועה שבודק שמשהו ישר.</dd><dt>גוניה</dt><dd>כלי בצורת L לבדיקת זווית ישרה (90°).</dd><dt>סיגים</dt><dd>הקליפה השחורה שעל הריתוך אחרי אלקטרודה.</dd><dt>מ״מ / ס״מ / מ׳</dt><dd>10 מ״מ = 1 ס״מ. 1,000 מ״מ = 1 מטר.</dd></dl>`;
 return `<section class="ws" data-sec="guide" id="wsGuide">
 <div class="ws-head"><div><p class="ws-k">דף עבודה למסגר</p><h2>איך בונים את זה – מההתחלה עד הסוף</h2><p class="ws-mut">${E(p.name)} · ${E(sz(p))} · ${tot} חלקים · ${E(mt.n)}</p></div><div class="ws-sign"><span>מבצע: ______________</span><span>תאריך: ____/____</span></div></div>
 ${sec('read','📐','1. איך קוראים את השרטוט',read,true)}
 ${sec('buy','📦','2. בודקים שיש את כל החומר',buy,true)}
 ${sec('safe','🦺','3. בטיחות לפני שמתחילים',safety,true)}
 ${sec('cut','✂️','4. מסמנים וחותכים',cut,true)}
 ${sec('asm','🧩','5. מרכיבים (עדיין בלי לרתך עד הסוף)',asm,true)}
 ${sec('weld','🔥','6. ריתוך',weld,true)}
 ${sec('fin','🎨','7. ניקוי וגימור',finish,true)}
 ${sec('inst','🔧','8. התקנה ובדיקה בשטח',inst,true)}
 ${sec('done','✅','9. בדיקה אחרונה לפני מסירה',done,true)}
 ${sec('dict','📖','מילון מילים',words,false)}
 </section>`;
}

/* ---------- כרטיס חומר ---------- */
function matCard(k){const m=MAT[k];if(!m)return'';return`<div class="ws-mat"><b>${E(m.n)}</b> · משקל ${m.rho} ק״ג לליטר${m.use?`<br>🏗️ ${E(m.use)}`:''}${m.weld?`<br>🔥 ריתוך: ${E(m.weld)}`:''}${m.fn?`<br>🎨 גימור: ${E(m.fn)}`:''}${m.care?`<br>⚠️ ${E(m.care)}`:''}<br><span class="ws-mut">מחיר ברירת מחדל: ₪${m.ppk} לק״ג – הערכה בלבד, לעדכן לפי הספק.</span></div>`}
function enhanceMaterial(){const sel=document.getElementById('mt');if(!sel)return;
 const groups={};for(const[k,v]of Object.entries(MAT)){(groups[v.grp||'אחר']??=[]).push([k,v])}
 const cur=sel.value;sel.innerHTML=Object.entries(groups).map(([g,a])=>`<optgroup label="${E(g)}">${a.map(([k,v])=>`<option value="${k}" ${k===cur?'selected':''}>${E(v.n)}</option>`).join('')}</optgroup>`).join('');
 let box=document.getElementById('wsMat');if(!box){box=document.createElement('div');box.id='wsMat';(sel.closest('.trow')||sel.parentNode).after(box)}
 box.innerHTML=matCard(sel.value);
 sel.addEventListener('change',()=>{box.innerHTML=matCard(sel.value);const g=document.getElementById('wsGuide');if(g&&CUR){const t=document.createElement('div');t.innerHTML=guideHTML(CUR);g.replaceWith(t.firstElementChild)}});
}

/* ---------- 3. הדפסה ---------- */
const PAPER={A4:[210,297],A3:[297,420],A2:[420,594],A1:[594,841],A0:[841,1189],A5:[148,210],Letter:[216,279],Legal:[216,356],Tabloid:[279,432]};
const SECS=[['draw','שרטוטים (4 מבטים)'],['guide','דף עבודה למסגר – הסבר פשוט'],['cut','רשימת חיתוך'],['buy','רשימת קנייה'],['bars','סימון חיתוכים על המוט'],['hw','פרזול והערות']];
const PKEY='forge_print_v1';
function printPanel(){const s=LS.get(PKEY,{size:'A4',or:'portrait',mode:'fit',sec:{draw:1,guide:1,cut:1,buy:1,bars:1,hw:1}});
 return`<div class="ws-pr no-print" id="wsPrint"><h2>🖨️ הדפסה לסדנה</h2>
 <div class="ws-prrow"><label>גודל דף<select id="pps">${Object.keys(PAPER).map(k=>`<option ${k===s.size?'selected':''}>${k}</option>`).join('')}</select></label>
 <label>כיוון<select id="ppo"><option value="portrait" ${s.or==='portrait'?'selected':''}>לאורך ▯</option><option value="landscape" ${s.or==='landscape'?'selected':''}>לרוחב ▭</option></select></label>
 <label>גודל השרטוט<select id="ppm"><option value="fit" ${s.mode==='fit'?'selected':''}>4 מבטים יחד בעמוד</option><option value="big" ${s.mode==='big'?'selected':''}>גדול – כל מבט בעמוד מלא</option><option value="scale" ${s.mode==='scale'?'selected':''}>בקנה מידה מדויק (1:10, 1:20…)</option></select></label></div>
 <div class="ws-prchk">${SECS.map(([k,t])=>`<label><input type="checkbox" data-ps="${k}" ${s.sec[k]?'checked':''}> ${t}</label>`).join('')}</div>
 <p><button class="btn" id="ppgo">הדפסה / שמירה כ-PDF</button></p>
 <p class="ws-mut">בחלון ההדפסה: לבחור את אותו גודל דף, ושוליים "ברירת מחדל". בקנה מידה מדויק – לבחור <b>"גודל אמיתי / 100%"</b> ולא "התאם לדף". כל השרטוטים יוצאים בשחור-לבן ברור.</p></div>`}
function readPanel(){const s={size:$v('pps'),or:$v('ppo'),mode:$v('ppm'),sec:{}};document.querySelectorAll('[data-ps]').forEach(c=>s.sec[c.dataset.ps]=c.checked?1:0);LS.set(PKEY,s);return s}
function $v(id){const e=document.getElementById(id);return e?e.value:''}
const SCALES=[1,2,2.5,5,10,15,20,25,30,40,50,75,100,150,200];
function doPrint(){const s=readPanel(),card=document.querySelector('#detail .card');if(!card)return window.print();
 let[w,h]=PAPER[s.size]||PAPER.A4;if(s.or==='landscape')[w,h]=[h,w];
 const mg=10,aw=w-2*mg,ah=h-2*mg-14;
 let st=document.getElementById('wsPage');if(!st){st=document.createElement('style');st.id='wsPage';document.head.appendChild(st)}
 st.textContent=`@page{size:${w}mm ${h}mm;margin:${mg}mm}`;
 const cls=['ws-printing'];for(const[k]of SECS)if(!s.sec[k])cls.push('pr-hide-'+k);if(s.mode!=='fit')cls.push('pr-'+s.mode);
 document.body.classList.add(...cls);
 const det=[...card.querySelectorAll('details')],was=det.map(d=>d.open);det.forEach(d=>d.open=true);
 const saved=[];
 if(s.mode!=='fit'){card.querySelectorAll('.views .vw').forEach(f=>{const svg=f.querySelector('svg'),cap=f.querySelector('figcaption');if(!svg)return;
  saved.push([svg,svg.getAttribute('style'),cap,cap?cap.textContent:'']);
  const vb=(svg.getAttribute('viewBox')||'0 0 100 100').split(/[\s,]+/).map(Number),vw=vb[2],vh=vb[3];
  if(s.mode==='big'){const k=Math.min(aw/vw,ah/vh);svg.setAttribute('style',`width:${(vw*k).toFixed(1)}mm;height:${(vh*k).toFixed(1)}mm;max-height:none;max-width:none;display:block;margin:0 auto`)}
  else{const N=SCALES.find(n=>vw/n<=aw&&vh/n<=ah)||Math.ceil(Math.max(vw/aw,vh/ah)/10)*10;
   svg.setAttribute('style',`width:${(vw/N).toFixed(2)}mm;height:${(vh/N).toFixed(2)}mm;max-height:none;max-width:none;display:block;margin:0 auto`);
   if(cap)cap.textContent=`${cap.textContent} · קנ״מ 1:${N} (בהדפסה בגודל אמיתי 100%)`}})}
 const undo=()=>{document.body.classList.remove(...cls);det.forEach((d,i)=>d.open=was[i]);saved.forEach(([svg,stl,cap,txt])=>{stl==null?svg.removeAttribute('style'):svg.setAttribute('style',stl);if(cap)cap.textContent=txt});st.textContent='';removeEventListener('afterprint',undo)};
 addEventListener('afterprint',undo);setTimeout(()=>{window.print();setTimeout(()=>{if(document.body.classList.contains('ws-printing')&&!matchMedia('print').matches)undo()},1500)},50)}

/* סימון אזורים בגיליון לפי כותרות (להסתרה בהדפסה) */
function tagSections(card){const map=[['רשימת חיתוך','cut'],['קנייה','buy'],['סימון חיתוכים','bars'],['פרזול','hw'],['הערות','hw']];let key='draw';
 for(const el of[...card.children]){if(el.matches('.tools,.ws,.ws-pr,.no-print'))continue;
  if(el.tagName==='H2'){const m=map.find(([a])=>el.textContent.includes(a));if(m)key=m[1]}
  el.dataset.sec=el.dataset.sec||key}}

/* ---------- סגנון ---------- */
const css=`
.ws{margin:18px 0;border:2px solid var(--or,#E8590C);border-radius:16px;padding:16px;background:rgba(232,89,12,.06)}
.ws-head{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-end;border-bottom:1px solid rgba(232,89,12,.35);padding-bottom:10px;margin-bottom:8px}
.ws-head h2{margin:2px 0 4px;font-size:clamp(22px,4vw,30px)}.ws-k{font-weight:900;font-size:13px;color:var(--ort,#B93E07);letter-spacing:.5px;margin:0}
.ws-sign{display:flex;flex-direction:column;gap:6px;font-size:14px;opacity:.85}
.ws-s{margin:8px 0;border-radius:12px;padding:0;overflow:hidden}.ws-s>summary{cursor:pointer;font-weight:900;font-size:18px;padding:12px 14px;list-style:none;display:flex;gap:10px;align-items:center}
.ws-s>summary::-webkit-details-marker{display:none}.ws-s>summary::after{content:'▾';margin-inline-start:auto;opacity:.6}.ws-s:not([open])>summary::after{content:'◂'}
.ws-ic{font-size:22px}.ws-b{padding:0 16px 14px;font-size:17px;line-height:1.75}
.ws-b h4{margin:14px 0 6px;font-size:17px}
.ws-leg{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(250px,100%),1fr));gap:10px}.ws-leg>div{display:flex;gap:10px;align-items:center;border:1px solid rgba(127,127,127,.3);border-radius:10px;padding:8px}
.ws-leg svg,#detail .ws-leg svg{width:110px!important;max-width:110px!important;height:auto!important;max-height:none!important;flex:none;background:#fff!important;border-radius:6px;padding:0!important;border:0!important}.ws-leg p{margin:0;font-size:15px;line-height:1.5;flex:1;min-width:0}
.ws-prof{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.ws-prof svg,#detail .ws-prof svg{width:150px!important;max-width:150px!important;height:auto!important;max-height:none!important;background:#fff!important;border-radius:8px;flex:none;padding:0!important;border:0!important}.ws-prof p{margin:0;flex:1;min-width:200px}
.ws-tip{border-right:4px solid var(--or,#E8590C);background:rgba(232,89,12,.1);border-radius:8px;padding:10px 12px;margin:10px 0;font-size:16px}
.ws-steps{padding-inline-start:24px}.ws-steps>li{margin:8px 0}.ws-steps>li::marker{font-weight:900;color:var(--ort,#B93E07)}
.ws-chk{list-style:none;padding:0;margin:6px 0}.ws-chk li{display:flex;gap:10px;align-items:flex-start;margin:6px 0}
.ws-box{flex:none;width:18px;height:18px;border:2px solid currentColor;border-radius:4px;margin-top:5px;opacity:.75}
.ws-n{display:inline-block;min-width:24px;height:24px;border:2px solid var(--ort,#B93E07);color:var(--ort,#B93E07);border-radius:50%;text-align:center;line-height:20px;font-size:13px;margin-inline-end:4px}
.ws-ang{font-weight:900;color:var(--ort,#B93E07)}.ws-mut{opacity:.75;font-size:14px}
.ws-dict{display:grid;grid-template-columns:max-content 1fr;gap:6px 14px;margin:0}.ws-dict dt{font-weight:900}.ws-dict dd{margin:0}
.ws-mat{margin:10px 0;padding:10px 12px;border-radius:10px;border:1px solid rgba(127,127,127,.35);font-size:15px;line-height:1.7}
.ws-pr{margin:18px 0;padding:14px 16px;border-radius:14px;border:1px solid rgba(127,127,127,.35)}
.ws-prrow{display:flex;gap:10px;flex-wrap:wrap}.ws-prrow label{display:flex;flex-direction:column;gap:4px;font-weight:700;font-size:14px}.ws-prrow select{min-width:170px;padding:10px;font-size:16px;border-radius:8px}
.ws-prchk{display:flex;flex-wrap:wrap;gap:8px 18px;margin:12px 0}.ws-prchk label{display:flex;gap:6px;align-items:center;font-size:15px;cursor:pointer}
.ws-print-top{margin-inline-start:8px}
@media print{
 *{color:#000!important;text-shadow:none!important;box-shadow:none!important}
 html,body{overflow:visible!important;height:auto!important;background:#fff!important}
 main,main.wrap{max-width:none!important;margin:0!important;padding:0!important;width:auto!important}
 #detail .card,#detail .card *,#detail .card.weld-plan-v2{box-shadow:none!important;filter:none!important}
 #detail .card{overflow:visible!important}
 body::before,body::after,main::before,main::after,#detail::before,#detail::after,#detail .card::before,#detail .card::after{display:none!important;content:none!important}
 body:has(#detail .card) main>*:not(#detail),body:has(#detail .card) #nav,body:has(#detail .card) .more,body.ws-printing main>*:not(#detail),body.ws-printing #nav,body.ws-printing header,body.ws-printing footer,body.ws-printing .more,body.ws-printing #more,body.ws-printing .type-picker-btn{display:none!important}
 #detail,#detail:not(:empty){position:static!important;inset:auto!important;overflow:visible!important;padding:0!important;margin:0!important;background:#fff!important;max-height:none!important;height:auto!important;transform:none!important}
 #detail .card{max-width:none!important;width:auto!important;margin:0!important;padding:0!important;transform:none!important;border:0!important;border-radius:0!important;filter:none!important}
 #detail .card>*{max-width:100%!important}
 .vw{border:0!important;border-radius:0!important;padding:0!important}
 body,#detail,#detail .card,.vw,details,table,th,td,.ws,.ws-s,.ws-leg>div,.ws-tip,.ws-mat,.warn,.meta>span{background:#fff!important;background-image:none!important}
 .vw,.ws,.ws-s,.ws-leg>div,table,td,th,.tb td{border-color:#888!important}
 #detail .card{border:0!important;padding:0!important;margin:0!important}
 .ws{border:2px solid #000!important;break-before:page;padding:6mm}.ws-s{break-inside:auto}.ws-s>summary{border-bottom:1px solid #999;font-size:16pt}
 .ws-s>summary::after{display:none}.ws-b{font-size:12pt}.ws-chk li,.ws-steps>li,.ws-leg>div{break-inside:avoid}
 .ws-tip{border:1px solid #000!important;border-right:4px solid #000!important}
 .pr-hide-draw [data-sec=draw],.pr-hide-guide [data-sec=guide],.pr-hide-cut [data-sec=cut],.pr-hide-buy [data-sec=buy],.pr-hide-bars [data-sec=bars],.pr-hide-hw [data-sec=hw]{display:none!important}
 .pr-big .views,.pr-scale .views{display:block!important}
 .pr-big .vw,.pr-scale .vw{break-after:page;page-break-after:always;border:0!important;padding:0!important;text-align:center}
 .pr-big .vw figcaption,.pr-scale .vw figcaption{font-size:14pt;border:0!important;text-align:right}
 .cbar,.ws-pr{display:none!important}
}`;
const stl=document.createElement('style');stl.id='wsCss';stl.textContent=css;document.head.appendChild(stl);

/* ---------- חיבור ל-show() ---------- */
let CUR=null;
const orig=show;
show=function(id){orig(id);try{enhance(id)}catch(e){console.error('worksheet',e)}};
function enhance(id){CUR=null;if(!id)return;const card=document.querySelector('#detail .card');if(!card)return;
 const p=plan(id);if(!p||p.err)return;CUR=p;
 tagSections(card);
 const tb=card.querySelector('table.tb');const g=document.createElement('div');g.innerHTML=guideHTML(p);(tb||card.querySelector('.views')).after(g.firstElementChild);
 const bottom=[...card.querySelectorAll('p.no-print')].pop();const pp=document.createElement('div');pp.innerHTML=printPanel();(bottom?bottom.before(pp.firstElementChild):card.appendChild(pp.firstElementChild));
 document.getElementById('ppgo').onclick=doPrint;
 card.querySelectorAll('[data-ps],#pps,#ppo,#ppm').forEach(el=>el.addEventListener('change',readPanel));
 card.querySelectorAll('button').forEach(b=>{if(/^הדפסה/.test(b.textContent.trim())&&b.id!=='ppgo'){b.removeAttribute('onclick');b.onclick=()=>{document.getElementById('wsPrint').scrollIntoView({behavior:'smooth',block:'center'})};b.textContent='🖨️ הדפסה – בחירת גודל דף'}});
 const cb=card.querySelector('.cbar');if(cb&&!cb.querySelector('.ws-print-top')){const b=document.createElement('button');b.className='btn ws-print-top';b.style.cssText='padding:6px 12px;font-size:14px';b.textContent='🖨️ הדפסה לסדנה';b.onclick=()=>document.getElementById('wsPrint').scrollIntoView({behavior:'smooth',block:'center'});cb.appendChild(b)}
 enhanceMaterial();
}
if(location.hash)show(decodeURIComponent(location.hash.slice(1)));
})();
