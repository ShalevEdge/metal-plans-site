(()=>{
const thicknessBands=[
 {max:3,diameters:'2.5–3.2',preferred:2.5,prep:'בדרך כלל ללא פאזה; לשמור על חיבור נקי והתאמה טובה.'},
 {max:5,diameters:'2.5–4.0',preferred:3.2,prep:'לפי סוג המחבר; בעובי מעל כ-3 מ״מ עשוי להידרש ריתוך רב-שכבתי.'},
 {max:10,diameters:'3.2–4.8',preferred:4.0,prep:'ריתוך רב-שכבתי והכנת שפות לפי המחבר, החדירה הנדרשת וה-WPS.'},
 {max:15,diameters:'3.2–5.0',preferred:4.0,prep:'ריתוך רב-שכבתי; לבדוק פאזה, מרווח שורש וחימום מוקדם לפי החומר וה-WPS.'}
];
const ampByDiameter={'2.5':[70,100],'3.2':[100,150],'4':[140,200],'4.0':[140,200],'5':[160,230],'5.0':[160,230]};
const positions=[
 {code:'F1',name:'מילאת שטוח',level:'קל יחסית',note:'מחבר קמץ/פינה המרותך מלמעלה.'},
 {code:'F2',name:'מילאת אופקי',level:'בינוני',note:'ציר התפר אופקי; זווית פעולה טיפוסית סביב 45°.'},
 {code:'F3',name:'מילאת ניצב',level:'מתקדם',note:'כלפי מעלה או מטה; דורש שליטה באמבט ובקצב.'},
 {code:'F4',name:'מילאת מעל הראש',level:'קשה',note:'דורש שליטה גבוהה באמבט והקפדה מוגברת על בטיחות.'},
 {code:'G1',name:'השקה שטוח',level:'קל יחסית',note:'תפר השקה המרותך מלמעלה.'},
 {code:'G2',name:'השקה אופקי',level:'בינוני',note:'תפר השקה אופקי.'},
 {code:'G3',name:'השקה ניצב',level:'מתקדם',note:'תפר השקה בתנוחה ניצבת.'},
 {code:'G4',name:'השקה מעל הראש',level:'קשה',note:'תפר השקה מעל הראש.'}
];
const defects=[
 {id:'porosity',name:'חרירים / חורים',look:'חורים עגולים על פני התפר או בתוכו',causes:['חומר אם מלוכלך בשמן או חלודה','לחות בחומר או באלקטרודה','רוח חזקה באזור הקשת','זווית פעולה לא נכונה'],actions:['ניקוי וייבוש לפני ריתוך','הגנה מרוח','בדיקת אלקטרודות והגדרות העבודה']},
 {id:'slag',name:'לכידת סיגים',look:'שלאקה כלואה בין זחלים או בשורש',causes:['ניקוי לא מספק בין זחלים','תמרון או זווית לא נכונים','גישה לא טובה לשורש'],actions:['ניקוי עד מתכת נקייה בין זחלים','שיפור סדר הזחלים והגישה למחבר']},
 {id:'lack-penetration',name:'חוסר חדירה',look:'שורש המחבר לא מחובר לכל העומק הנדרש',causes:['השקעת חום נמוכה','מרווח שורש קטן מדי','תנועה שגויה או קצב גבוה'],actions:['בדיקת מרווח ופאזה','התאמת זרם וקוטר אלקטרודה','שליטה בקשת ובקצב']},
 {id:'lack-fusion',name:'חוסר התכה',look:'זחל נראה מחובר אך לא הותך כראוי לשפת חומר האם',causes:['חום נמוך','זווית עבודה לא מתאימה','קצב מהיר מדי'],actions:['כוונון פרמטרים','ניקוי השפה','שינוי זווית וקצב']},
 {id:'undercut',name:'קעקוע / Undercut',look:'תעלה לאורך שפת הריתוך',causes:['זרם גבוה מדי','זווית או תמרון לא נכונים','מהירות לא מתאימה'],actions:['הקטנת זרם או קוטר לפי הצורך','שהייה מבוקרת בשוליים','שיפור זווית פעולה']},
 {id:'overlap',name:'חפייה קרה',look:'חומר רתך נשפך מעבר לשפה ללא התכה טובה',causes:['חום לא מספיק','קצב או זווית לא מתאימים'],actions:['הגדלת ההתכה בפועל','תיקון תנועה וזווית']},
 {id:'reinforcement',name:'תפיחת יתר',look:'תפר גבוה וקמור מדי',causes:['קצב איטי מדי','כוונון לא מתאים','תמרון שגוי'],actions:['איזון זרם וקצב','שמירה על אמבט אחיד']},
 {id:'excess-penetration',name:'חדירת יתר',look:'חומר בולט מדי בצד האחורי של השורש',causes:['מרווח שורש גדול מדי','השקעת חום גבוהה מדי'],actions:['תיקון מרווח שורש','הפחתת חום בהתאם לנוהל']},
 {id:'hydrogen',name:'סידוק מימני / סידוק קר',look:'סדק שעלול להתפתח באיחור, לעיתים מתחת לפני השטח',causes:['לחות ומימן','מבנה חומר רגיש','מאמצים פנימיים וקצב קירור גבוה'],actions:['שמירת אלקטרודות דלות מימן יבשות','שקילת חימום מוקדם לפי WPS','הפחתת ריתום יתר ובקרה על הקירור']}
];
const inspections=[
 {name:'בדיקה חזותית',type:'לא הורסת',detect:'צורת התפר, קעקועים, תפיחה, התזות, סדקים גלויים ואחידות.'},
 {name:'בדיקת שבירה',type:'הורסת',detect:'איכות התכה וחדירה, סיגים ופגמים פנימיים באזור השבר.'},
 {name:'מאקרו',type:'הורסת',detect:'חתך התפר: עומק התכה, חדירת שורש, יחס צלעות ופגמים בין זחלים.'},
 {name:'כפיפה',type:'הורסת',detect:'התנהגות המחבר והופעת פגמים לאחר עיוות מבוקר.'},
 {name:'צבע חודר',type:'לא הורסת',detect:'אי-רציפויות וסדקים הפתוחים לפני השטח.'},
 {name:'רדיוגרפיה / רנטגן',type:'לא הורסת',detect:'פגמים פנימיים וצורתם, עם תיעוד של אזור הבדיקה.'}
];
const safety=[
 'מסכת ריתוך מלאה עם דרגת כהות מתאימה, כפפות וביגוד מגן מלא.',
 'נעלי בטיחות; בעבודה מעל הראש להוסיף הגנה מתאימה לגוף ולראש.',
 'להפעיל שאיבת עשן / אוורור ולמנוע חשיפה של אחרים לסנוור הקשת.',
 'לבדוק לפני עבודה שכבלים, ידית וצבת הארקה מבודדים, יבשים וללא נזק.',
 'לחבר הארקה קרוב ככל האפשר לאזור העבודה ועל מתכת נקייה מצבע, חלודה וגריז.',
 'אין לרתך בסביבה רטובה ואין לקרר מחזיק אלקטרודה במים.',
 'להרחיק נייר, קרטון, עץ וחומרים דליקים ולבדוק שאין גיצים במקומות נסתרים.',
 'בחציבה, השחזה והסרת סיגים להשתמש במגן עיניים שקוף ובהגנת שמיעה.'
];
function parseProfileThickness(profile){const nums=String(profile||'').replace(/,/g,'.').match(/\d+(?:\.\d+)?/g);if(!nums||nums.length<3)return null;return +nums[nums.length-1]}
function dominantThickness(parts){const score=new Map();for(const r of(parts||[])){const t=parseProfileThickness(r[1]);if(!t)continue;score.set(t,(score.get(t)||0)+(+r[3]||1))}return [...score.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||null}
function bandFor(t){return thicknessBands.find(x=>t<=x.max)||null}
function recommend(t,{electrode='E6013',diameter}={}){
 t=+t||0;const band=bandFor(t),manualDiameter=diameter!==undefined&&diameter!==null&&diameter!=='';let d=+(manualDiameter?diameter:(band?.preferred||0));let amps=d?(ampByDiameter[String(d)]||ampByDiameter[d.toFixed?.(1)]||null):null;
 if(d&&electrode==='E6013'&&Math.abs(d-3.2)<.15)amps=[75,125];
 if(d&&electrode==='E7018'&&Math.abs(d-3.2)<.15)amps=[120,170];
 return {thickness:t,band,diameter:d,amps,electrode,warning:!band?'הטבלה הלימודית בספר נעצרת סביב 15 מ״מ; מעל לכך יש לעבוד לפי WPS/תקן ונתוני היצרן.':''};
}
function planSummary(parts){const t=dominantThickness(parts);if(!t)return null;return recommend(t)}
function renderPlanCard(input){const parts=Array.isArray(input)?input:input?.parts;const r=planSummary(parts);if(!r)return'<div class="notice">לא ניתן לחלץ עובי דופן אוטומטי מהפרופילים. פתחו את מרכז הריתוך והזינו עובי ידנית.</div>';const a=r.amps?`${r.amps[0]}–${r.amps[1]} A`:'לפי יצרן/WPS';return `<div class="weld-intel"><div class="wi-head"><span class="wi-mark">W</span><div><b>Welding Intelligence · SMAW</b><small>המלצת פתיחה לימודית לתוכנית</small></div></div><div class="wi-grid"><div><span>עובי דופן דומיננטי</span><b>${r.thickness} מ״מ</b></div><div><span>אלקטרודה התחלתית</span><b>${r.electrode} · Ø${r.diameter} מ״מ</b></div><div><span>טווח זרם מנחה</span><b>${a}</b></div><div><span>הכנת מחבר</span><b>${r.band?.prep||'לפי WPS'}</b></div></div><p class="muted wi-note">זהו כלי עזר המבוסס על טבלאות לימודיות לריתוך באלקטרודה מצופה. בפועל נתוני היצרן, WPS, סוג המחבר, תנוחה, חומר והתקן גוברים על ההמלצה.</p><a class="btn ghost" href="welding.html?t=${encodeURIComponent(r.thickness)}&d=${encodeURIComponent(r.diameter)}">פתח מרכז ריתוך מלא</a></div>`}
window.WELD={thicknessBands,ampByDiameter,positions,defects,inspections,safety,parseProfileThickness,dominantThickness,bandFor,recommend,planSummary,renderPlanCard};
})();

