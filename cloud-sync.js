/* SHALVERO FORGE cloud adapter — explicit adoption, optimistic locking, local-first.
 * Works only after a configured Supabase project and RLS migration are verified.
 * NO service role key, no automatic overwrite of unknown cloud/local data.
 */
(()=>{
  'use strict';
  const DOCS=['mp_projects','mp_inventory_v1','mp_settings_v1','mp_purchase_orders_v1'];
  const S='forge_cloud_sync_v1', B='forge_cloud_binding_v1', A='forge_cloud_auto_v1';
  let client=null, user=null, workshop=null, running=null, timer=null, initialized=false;
  const cfg=()=>window.FORGE_CLOUD_CONFIG||{};
  const err=e=>new Error(e?.message||String(e||'שגיאה לא ידועה'));
  const ensure=()=>{if(!client)throw Error('חיבור הענן לא הוגדר');if(!user||!workshop)throw Error('צריך להתחבר לחשבון תחילה');guard()};
  const norm=v=>JSON.stringify(v,(key,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
  const hash=x=>{if(x==null)return null;let n=2166136261;for(let i=0;i<x.length;i++){n^=x.charCodeAt(i);n=Math.imul(n,16777619)}return(n>>>0).toString(16)};
  function binding(){try{return JSON.parse(localStorage.getItem(B)||'null')}catch{return null}}
  function guard(){const b=binding();if(b&&(b.user!==user.id||b.workshop!==workshop))throw Error('במכשיר יש נתונים מקומיים המשויכים לחשבון אחר. כדי למנוע ערבוב מידע, יש להשתמש בפרופיל דפדפן נפרד או לגבות ולהפריד נתונים לפני מעבר חשבון.');}
  function bind(){guard();localStorage.setItem(B,JSON.stringify({user:user.id,workshop}))}
  function meta(){try{const v=JSON.parse(localStorage.getItem(S)||'null');return v?.user===user.id&&v?.workshop===workshop?v:{user:user.id,workshop,docs:{}}}catch{return{user:user.id,workshop,docs:{}}}}
  function setMeta(m){localStorage.setItem(S,JSON.stringify(m))}
  function valid(k,v){return k==='mp_settings_v1'?v!==null&&typeof v==='object'&&!Array.isArray(v):Array.isArray(v)}
  function local(k){const raw=localStorage.getItem(k);if(raw===null)return{raw:null,payload:null,hash:null};
    try{const payload=JSON.parse(raw);if(!valid(k,payload))throw Error('type');return{raw,payload,hash:hash(norm(payload))}}
    catch{throw Error('נתון מקומי פגום: '+k+'. הורד גיבוי ובדוק את הקובץ לפני סנכרון.');}}
  async function getCloud(){
    ensure();const {data,error}=await client.from('forge_documents').select('doc_key,payload,revision,updated_at').eq('workshop_id',workshop);
    if(error)throw err(error);
    return new Map((data||[]).map(x=>[x.doc_key,x]));
  }
  async function saveOne(k,payload,revision){
    ensure();const {data,error}=await client.rpc('forge_save_document',{p_workshop_id:workshop,p_doc_key:k,p_payload:payload,p_expected_revision:revision});
    if(error)throw err(error);if(data?.status!=='ok')throw Error('התנגשות גרסאות ב־'+k+'. נדרש פתרון ידני.');
    return data.revision;
  }
  function stamp(m,k,rev){m.docs[k]={revision:rev,hash:local(k).hash};setMeta(m)}
  function writeLocal(k,payload){
    if(payload!==null&&!valid(k,payload))throw Error('נתון ענן במבנה שגוי: '+k);
    if(payload===null) localStorage.removeItem(k);
    else localStorage.setItem(k,norm(payload));
    document.dispatchEvent(new CustomEvent('forge:cloud-updated',{detail:{key:k}}));
  }
  const hasLocal=()=>DOCS.some(k=>localStorage.getItem(k)!==null);
  async function init(){
    if(initialized)return client;
    const c=cfg();
    if(!c.url||!c.publishableKey||!/^https:\/\/[a-zA-Z0-9.-]+\/?$/.test(c.url)||!window.supabase?.createClient)return null;
    client=window.supabase.createClient(c.url,c.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'forge-supabase-auth'}});
    initialized=true;
    const {data,error}=await client.auth.getUser();if(!error&&data?.user)user=data.user;
    return client;
  }
  async function ensureWorkshop(){
    if(!client)throw Error('יש להגדיר חיבור לענן');const res=await client.auth.getUser();
    if(res.error||!res.data?.user)throw Error('לא נמצאה כניסה תקפה לחשבון');user=res.data.user;
    if(user.is_anonymous)throw Error('יש להשתמש בחשבון מאומת');const b=binding();if(b&&b.user!==user.id)throw Error('כבר משויכים כאן נתונים מקומיים לחשבון אחר. יש לעבוד בפרופיל דפדפן נפרד.');
    const {data,error}=await client.rpc('forge_bootstrap',{p_name:MP.settings()?.biz||'המסגריה שלי'});
    if(error)throw err(error);workshop=data;guard();return workshop;
  }
  async function sendLink(email){
    if(!client)throw Error('שירות הענן אינו מחובר');if(!email||!/^\S+@\S+\.\S+$/.test(email))throw Error('כתובת אימייל לא תקינה');
    // Always point magic links to the production origin, never localhost/preview.
    // Supabase must additionally allow this redirect in Authentication > URL Configuration.
    const redirect='https://shalevedge.github.io/metal-plans-site/account.html';
    const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:redirect}});
    if(error)throw err(error);return true;
  }
  async function signOut(){if(client){const {error}=await client.auth.signOut();if(error)throw err(error)} user=null;workshop=null;stopBackground();}
  async function uploadFirst(){
    await ensureWorkshop();if(!hasLocal())throw Error('לא נמצאו נתונים מקומיים להעלאה');
    const remote=await getCloud(),m=meta();
    // Safe retry after a partial upload. Never overwrite a differing cloud version.
    for(const k of DOCS){
      const l=local(k),r=remote.get(k);
      if(r&&l.raw===null)throw Error('בענן קיימים נתונים שאינם במכשיר: '+k);
      if(r&&hash(norm(r.payload))!==l.hash)throw Error('נמצאה גרסת ענן שונה עבור '+k+'. יש לפתור התנגשות לפני העלאה.');
    }
    for(const k of DOCS){
      const l=local(k),r=remote.get(k);
      if(r){stamp(m,k,r.revision);continue}
      if(l.raw===null)continue;
      const rev=await saveOne(k,l.payload,0);stamp(m,k,rev)
    }
    bind();return{uploaded:Object.keys(m.docs).length};
  }
  async function downloadFirst(){
    await ensureWorkshop();const remote=await getCloud();if(!remote.size)throw Error('בענן אין נתונים להורדה');
    // Caller must download a local backup and confirm first.
    const m=meta();for(const k of DOCS){const x=remote.get(k);writeLocal(k,x?x.payload:null);if(x)stamp(m,k,x.revision);else delete m.docs[k]}
    setMeta(m);bind();return{downloaded:remote.size};
  }
  async function sync(){
    await ensureWorkshop();
    if(running)return running;
    running=(async()=>{
      const remote=await getCloud(),m=meta(),conflicts=[],changed=[];
      for(const k of DOCS){
        const l=local(k),r=remote.get(k),prev=m.docs[k],remoteHash=r?hash(norm(r.payload)):null;
        if(!prev){
          if(!r&&!l.raw)continue;
          if(r&&l.raw&&remoteHash===l.hash){stamp(m,k,r.revision);continue}
          conflicts.push({key:k,type:r?'initial-remote':'initial-local'});continue;
        }
        if(!r){conflicts.push({key:k,type:'remote-missing'});continue}
        const lc=l.hash!==prev.hash,rc=r.revision!==prev.revision;
        if(!lc&&!rc)continue;
        if(l.hash===remoteHash){stamp(m,k,r.revision);continue}
        if(lc&&rc){conflicts.push({key:k,type:'simultaneous-edit'});continue}
        if(lc){
          if(l.raw===null){conflicts.push({key:k,type:'local-deleted'});continue}
          try{const rev=await saveOne(k,l.payload,prev.revision);stamp(m,k,rev);changed.push({key:k,direction:'upload'})}
          catch(e){conflicts.push({key:k,type:'revision-race',error:e.message})}
        }else{writeLocal(k,r.payload);stamp(m,k,r.revision);changed.push({key:k,direction:'download'})}
      }
      setMeta(m);if(!conflicts.length)bind();return{changed,conflicts};
    })();
    try{return await running}finally{running=null}
  }
  async function resolve(key,choice){
    await ensureWorkshop();if(!DOCS.includes(key)||!['local','cloud'].includes(choice))throw Error('פעולה לא נתמכת');
    const remote=await getCloud(),r=remote.get(key),m=meta(),l=local(key);
    if(choice==='local'){
      if(l.raw===null)throw Error('אין נתון מקומי להעלאה');
      const rev=await saveOne(key,l.payload,r?.revision||0);stamp(m,key,rev);
    }else{
      if(!r)throw Error('אין נתון בענן להורדה');
      writeLocal(key,r.payload);stamp(m,key,r.revision);
    }
    bind();return{key,choice};
  }
  function stopBackground(){if(timer)clearTimeout(timer);timer=null;document.removeEventListener('forge:local-change',schedule);window.removeEventListener('online',schedule);document.removeEventListener('visibilitychange',visibility)}
  async function background(){
    if(!navigator.onLine||document.hidden||localStorage.getItem(A)!=='1')return;
    try{const result=await sync();if(result.changed.some(x=>x.direction==='download'))showBanner('נתונים חדשים הגיעו מהענן. יש לרענן את העמוד להצגתם.');
      if(result.conflicts.length)showBanner('קיימת התנגשות נתונים. פתח את חשבון וגיבוי כדי לבחור גרסה.');}
    catch(e){showBanner('הסנכרון לא הושלם: '+e.message)}
  }
  function showBanner(message){
    if(document.getElementById('forgeCloudBanner'))return;
    const el=document.createElement('div');el.id='forgeCloudBanner';el.className='notice';
    el.style.cssText='position:sticky;top:0;z-index:9999;padding:12px;display:flex;gap:12px;align-items:center;justify-content:center;';
    const t=document.createElement('span');t.textContent=message;
    const a=document.createElement('a');a.href='account.html';a.className='btn ghost small';a.textContent='פתח חשבון';
    el.append(t,a);document.body.prepend(el);
  }
  function schedule(){if(timer)clearTimeout(timer);timer=setTimeout(background,1300)}
  function visibility(){if(!document.hidden)schedule()}
  async function startBackground(){
    if(localStorage.getItem(A)!=='1')return;
    await init();if(!client)return;await ensureWorkshop();const bound=binding();
    if(!bound||bound.user!==user.id||bound.workshop!==workshop)return;
    stopBackground();document.addEventListener('forge:local-change',schedule);
    window.addEventListener('online',schedule);document.addEventListener('visibilitychange',visibility);
    schedule();
  }
  window.ForgeCloud={init,ensureWorkshop,sendLink,signOut,uploadFirst,downloadFirst,sync,resolve,startBackground,stopBackground,
    user:()=>user,workshop:()=>workshop,docs:DOCS,hasLocal,meta:()=>user&&workshop?meta():null,isConfigured:()=>!!cfg().url&&!!cfg().publishableKey};
})();
