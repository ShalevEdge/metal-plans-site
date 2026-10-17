(()=>{
  const J=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v??f}catch{return f}};
  const S=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const navItems=[
    ['hub.html','מרכז'],['new-job.html','עבודה חדשה'],['plans.html','תוכניות'],['optimizer.html','חיתוך'],
    ['welding.html','ריתוך'],['projects.html','פרויקטים'],['inventory.html','מלאי'],['workshop.html','המסגריה'],
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
    settings(){return Object.assign({mat:'fe',ppk:{},fin:{},rate:180,marg:25,vat:18,biz:'',phone:'',install:0,stock:6000,kerf:3,waste:8,suppliers:[]},J('mp_settings_v1',{}))},
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
    restore(file){return new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!o||!o.data)throw Error('backup');Object.entries(o.data).forEach(([k,v])=>{if(k.startsWith('mp_')&&typeof v==='string')localStorage.setItem(k,v)});ok()}catch(e){no(e)}};r.onerror=no;r.readAsText(file)})},
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
  document.addEventListener('click',e=>{
    const link=e.target.closest?.('.nav a');if(!link)return;
    const top=link.closest('.topin');const nav=top?.querySelector('.nav'),btn=top?.querySelector('.nav-toggle');
    if(nav?.classList.contains('open')){nav.classList.remove('open');btn?.setAttribute('aria-expanded','false');if(btn?.querySelector('i'))btn.querySelector('i').textContent='☰'}
  });
  const updateNet=()=>document.querySelectorAll('[data-net-status]').forEach(el=>{const on=navigator.onLine;el.classList.toggle('online',on);el.classList.toggle('offline',!on);el.setAttribute('aria-label','מצב רשת: '+(on?'אונליין':'אופליין'));const t=el.querySelector('span');if(t)t.textContent=on?'אונליין':'אופליין'});
  addEventListener('online',updateNet);addEventListener('offline',updateNet);
  MP.sw();
})();
