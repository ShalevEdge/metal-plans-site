(()=>{
  const J=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v??f}catch{return f}};
  const S=(k,v)=>{localStorage.setItem(k,JSON.stringify(v));if(['mp_projects','mp_inventory_v1','mp_settings_v1','mp_purchase_orders_v1'].includes(k))
      document.dispatchEvent(new CustomEvent('forge:local-change',{detail:{key:k}}));};
  const navItems=[
    ['hub.html','מרכז'],['start.html','מדריך'],['new-job.html','עבודה חדשה'],['plans.html','תוכניות'],['optimizer.html','חיתוך'],['production.html','ייצור'],
    ['welding.html','ריתוך'],['purchasing.html','רכש'],['finance.html','רווחיות'],['projects.html','פרויקטים'],['inventory.html','מלאי'],['workshop.html','המסגריה'],
    ['smart.html','עוזר חכם'],['account.html','חשבון']
  ];
  window.MP={
    K:{settings:'mp_settings_v1',projects:'mp_projects',inventory:'mp_inventory_v1',account:'mp_account_v1',jobDraft:'mp_job_draft_v1'},
    get:J,set:S,
    jobDraft(){return J(this.K.jobDraft,null)},
    saveJobDraft(v){if(v)S(this.K.jobDraft,v);else localStorage.removeItem(this.K.jobDraft)},
    clearJobDraft(){localStorage.removeItem(this.K.jobDraft)},
    esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    money:n=>'₪'+Math.round(+n||0).toLocaleString('en-US'),
    settings(){return Object.assign({mat:'fe',ppk:{},fin:{},rate:180,costRate:0,marg:25,vat:18,biz:'',phone:'',install:0,stock:6000,kerf:3,waste:8,suppliers:[]},J('mp_settings_v1',{}))},
    saveSettings(v){S('mp_settings_v1',v)},
    projects(){return J('mp_projects',[])},saveProjects(v){S('mp_projects',v)},
    inventory(){return J('mp_inventory_v1',[])},saveInventory(v){S('mp_inventory_v1',v)},
    backup(){
      const data={version:1,createdAt:new Date().toISOString(),origin:location.origin,data:{}};
      for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('mp_'))data.data[k]=localStorage.getItem(k)}
      const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');
      a.href=URL.createObjectURL(b);a.download='shalvero-forge-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),500)
    },
    restore(file){return new Promise((ok,no)=>{
      if(file.size>10*1024*1024){no(Error('הגיבוי גדול מדי'));return}
      const r=new FileReader();r.onload=()=>{
        const before=new Map();
        try{
          const o=JSON.parse(r.result);
          if(!o||o.version!==1||!o.data||typeof o.data!=='object'||Array.isArray(o.data))throw Error('מבנה גיבוי לא תקין');
          const entries=Object.entries(o.data).filter(([k])=>k.startsWith('mp_'));
          if(!entries.length)throw Error('אין נתונים לשחזור');
          for(const [k,v] of entries){
            if(!/^mp_[a-z0-9_]{1,80}$/.test(k)||typeof v!=='string'||v.length>8*1024*1024)throw Error('מפתח או גודל נתון לא תקין');
            const parsed=JSON.parse(v);
            if(['mp_projects','mp_inventory_v1','mp_purchase_orders_v1'].includes(k)&&!Array.isArray(parsed))throw Error('נדרש מערך ב־'+k);
            if(['mp_settings_v1','mp_account_v1'].includes(k)&&(parsed===null||typeof parsed!=='object'||Array.isArray(parsed)))throw Error('נתון לא תקין ב־'+k);
            before.set(k,localStorage.getItem(k));
          }
          try{for(const [k,v] of entries)localStorage.setItem(k,v)}
          catch(e){for(const [k,old] of before){try{if(old===null)localStorage.removeItem(k);else localStorage.setItem(k,old)}catch{}}throw e}
          // A restored backup must not be uploaded silently using an old cloud revision.
          localStorage.removeItem('forge_cloud_auto_v1');
          localStorage.removeItem('forge_cloud_sync_v1');
          ok();
        }catch(e){no(e)}
      };r.onerror=no;r.readAsText(file);
    })},
    nav(active=''){
      return `<div class="top"><div class="wrap topin">
        <a class="brand forge-nav-brand" href="index.html" aria-label="SHALVERO FORGE — דף הבית"><span class="forge-mark">SF</span><span class="forge-brand-text"><strong>SHALVERO</strong><em>FORGE</em></span></a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="forgeNav" onclick="MP.toggleNav(this)"><span>תפריט</span><i aria-hidden="true">☰</i></button>
        <span class="net-badge ${navigator.onLine?'online':'offline'}" data-net-status role="status" aria-live="polite" aria-label="מצב רשת: ${navigator.onLine?'אונליין':'אופליין'}"><i aria-hidden="true"></i><span>${navigator.onLine?'אונליין':'אופליין'}</span></span>
        <nav class="nav" id="forgeNav" aria-label="ניווט ראשי">${navItems.map(([u,n])=>`<a href="${u}" class="${active===u?'on':''}${u==='new-job.html'?' nav-primary':''}">${n}</a>`).join('')}</nav>
      </div></div>`
    },
    toggleNav(btn){
      const nav=btn.closest('.topin')?.querySelector('.nav');if(!nav)return;
      const open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',open?'true':'false');
      btn.querySelector('i').textContent=open?'✕':'☰';
    },
    sw(){if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{})}
  };
  // Optional cloud bootstrap: a missing backend must never block offline/local work.
  const loadScript=url=>new Promise((resolve,reject)=>{const x=document.createElement('script');x.src=url;x.async=true;x.onload=resolve;x.onerror=()=>reject(Error('טעינת שירות הענן נכשלה'));document.head.appendChild(x)});
  let cloudLoader=null;
  MP.loadCloud=()=>{
    if(!cloudLoader)cloudLoader=loadScript('cloud-config.js').then(()=>{
      const c=window.FORGE_CLOUD_CONFIG;
      if(!c?.url||!c?.publishableKey)return null;
      return loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.109.0/dist/umd/supabase.js').then(()=>loadScript('cloud-sync.js')).then(()=>window.ForgeCloud);
    }).catch(e=>{cloudLoader=null;throw e});
    return cloudLoader;
  };
  if(localStorage.getItem('forge_cloud_auto_v1')==='1'){
    MP.loadCloud().then(cloud=>cloud?.startBackground()).catch(()=>{});
  }
  document.addEventListener('click',e=>{
    const link=e.target.closest?.('.nav a');if(!link)return;
    const top=link.closest('.topin');const nav=top?.querySelector('.nav'),btn=top?.querySelector('.nav-toggle');
    if(nav?.classList.contains('open')){nav.classList.remove('open');btn?.setAttribute('aria-expanded','false');if(btn?.querySelector('i'))btn.querySelector('i').textContent='☰'}
  });
  const updateNet=()=>document.querySelectorAll('[data-net-status]').forEach(el=>{const on=navigator.onLine;el.classList.toggle('online',on);el.classList.toggle('offline',!on);el.setAttribute('aria-label','מצב רשת: '+(on?'אונליין':'אופליין'));const t=el.querySelector('span');if(t)t.textContent=on?'אונליין':'אופליין'});
  addEventListener('online',updateNet);addEventListener('offline',updateNet);
  MP.sw();
})();
