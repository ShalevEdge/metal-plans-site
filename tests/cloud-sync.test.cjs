// Cloud adapter deterministic unit tests — no network or real credentials.
const fs=require('fs'), vm=require('vm'), assert=require('node:assert/strict'), path=require('path');
const root=path.resolve(__dirname,'..'), docs=new Map(), store=new Map();
let actor={id:'alice',email:'alice@example.com',is_anonymous:false}, revCounter=0, dispatches=[], loginRequest=null,simulateMailLimit=false,passwordLogin=null,passwordUpdate=null;
const key=(w,k)=>w+':'+k;
const client={
 auth:{
  async getUser(){return{data:{user:actor},error:null}},
  async signInWithOtp(input){loginRequest=input;return{error:simulateMailLimit?{status:429,code:'over_email_send_rate_limit',message:'email rate limit exceeded'}:null}},
  async signInWithPassword(input){passwordLogin=input;return{data:{user:actor},error:null}},
  async updateUser(input){passwordUpdate=input;return{data:{user:actor},error:null}},
  async signOut(){actor=null;return{error:null}}
 },
 async rpc(fn,p){
  if(fn==='forge_bootstrap')return{data:actor?.id==='alice'?'workshop-alice':'workshop-bob',error:null};
  if(fn==='forge_save_document'){
   const k=key(p.p_workshop_id,p.p_doc_key),cur=docs.get(k);
   if((cur?.revision||0)!==p.p_expected_revision)return{data:{status:'conflict'},error:null};
   const r={doc_key:p.p_doc_key,payload:p.p_payload,revision:(cur?.revision||0)+1,updated_at:new Date().toISOString()};
   docs.set(k,r);return{data:{status:'ok',revision:r.revision},error:null};
  }throw Error(fn)
 },
 from(table){assert.equal(table,'forge_documents');return{select(){return{eq:async(column,workshop)=>({
  data:[...docs.entries()].filter(([k])=>k.startsWith(workshop+':')).map(([,v])=>v),error:null
 })}}}}
};
const localStorage={
 getItem:k=>store.has(k)?store.get(k):null,
 setItem:(k,v)=>store.set(k,String(v)),
 removeItem:k=>store.delete(k)
};
const context={
 window:{FORGE_CLOUD_CONFIG:{url:'https://example.supabase.co',publishableKey:'sb_publishable_test'},supabase:{createClient:()=>client}},
 localStorage,
 MP:{settings:()=>({biz:'Forge'})},
 document:{dispatchEvent:e=>dispatches.push(e.type),hidden:false,body:{prepend(){}}},
 CustomEvent:class{constructor(type){this.type=type}},
 navigator:{onLine:true},
 addEventListener(){},
 Date,JSON,Math,Number,String,Error,Map,Promise,RegExp,setTimeout,clearTimeout,URL
};
vm.runInNewContext(fs.readFileSync(path.join(root,'cloud-sync.js'),'utf8'),context);
const C=context.window.ForgeCloud;
async function run(){
 assert.equal(await C.init(),client);
 assert.equal(C.user().id,'alice');
 await C.sendLink('alice@example.com');
 assert.equal(loginRequest.options.emailRedirectTo,'https://shalevedge.github.io/metal-plans-site/account.html');
 assert.ok(C.emailCooldownUntil()>Date.now());
 await assert.rejects(C.sendLink('alice@example.com'),/מושהית/);
 await assert.rejects(C.sendLink('not-an-email'),/כתובת אימייל לא תקינה/);
 store.delete('forge_email_retry_after_v1');
 simulateMailLimit=true;
 await assert.rejects(C.sendLink('alice@example.com'),/מכסת הודעות האימייל/);
 assert.ok(C.emailCooldownUntil()>Date.now()+55*60*1000);
 simulateMailLimit=false;
 // Password sign-in does not use the mail transport or email cooldown.
 assert.equal(await C.signInPassword('alice@example.com','a-test-password'),true);
 assert.equal(passwordLogin.email,'alice@example.com');
 await assert.rejects(C.setPassword('short'),/12/);
 assert.equal(await C.setPassword('long-test-password-2026'),true);
 assert.equal(passwordUpdate.password,'long-test-password-2026');
 store.set('mp_projects',JSON.stringify([{uid:'1',name:'Gate'}]));
 store.set('mp_settings_v1',JSON.stringify({biz:'Forge'}));
 assert.deepEqual(JSON.parse(JSON.stringify(await C.uploadFirst())),{uploaded:2});
 assert.equal(docs.get(key('workshop-alice','mp_projects')).revision,1);
 // Retrying a successful first upload is safe (no duplicate/new revision).
 assert.equal((await C.uploadFirst()).uploaded,2);
 assert.equal(docs.get(key('workshop-alice','mp_projects')).revision,1);
 // Reformatting equivalent JSON does not produce a false conflict.
 store.set('mp_projects',JSON.stringify([{uid:'1',name:'Gate'}],null,2));
 let unchanged=await C.sync();
 assert.equal(unchanged.conflicts.length,0);
 assert.equal(docs.get(key('workshop-alice','mp_projects')).revision,1);
 // Interrupted first upload may be resumed without replacing existing matching data.
 docs.delete(key('workshop-alice','mp_settings_v1'));
 assert.equal((await C.uploadFirst()).uploaded,2);
 assert.equal(docs.get(key('workshop-alice','mp_settings_v1')).revision,1);

 // Upload newer local change with optimistic revision.
 store.set('mp_projects',JSON.stringify([{uid:'1',name:'Gate edited locally'}]));
 let s=await C.sync();
 assert.equal(s.changed[0].direction,'upload');
 assert.equal(docs.get(key('workshop-alice','mp_projects')).revision,2);
 // Download newer remote change.
 const row=docs.get(key('workshop-alice','mp_projects'));row.payload=[{uid:'1',name:'Remote version'}];row.revision++;
 s=await C.sync();
 assert.equal(s.changed[0].direction,'download');assert.match(store.get('mp_projects'),/Remote version/);
 // Conflict when both local and remote edited.
 store.set('mp_projects',JSON.stringify([{uid:'1',name:'Local conflict'}]));
 row.payload=[{uid:'1',name:'Remote conflict'}];row.revision++;
 s=await C.sync();assert.equal(s.conflicts.length,1);assert.equal(s.conflicts[0].type,'simultaneous-edit');
 assert.match(store.get('mp_projects'),/Local conflict/);
 await C.resolve('mp_projects','cloud');
 assert.match(store.get('mp_projects'),/Remote conflict/);
 // Reject replay stale revision and avoid overwrite.
 const outdated=await client.rpc('forge_save_document',{p_workshop_id:'workshop-alice',p_doc_key:'mp_projects',p_payload:[],p_expected_revision:1});
 assert.equal(outdated.data.status,'conflict');
 // Cross-account guard.
 actor={id:'bob',email:'bob@example.com',is_anonymous:false};
 await assert.rejects(C.ensureWorkshop(),/חשבון אחר/);
 assert.equal(docs.get(key('workshop-alice','mp_projects')).revision,4);
 console.log('FORGE_CLOUD_TESTS PASS: safe retry, canonical JSON, partial upload, revisions, conflict and cross-account.');
}
run().catch(e=>{console.error(e);process.exit(1)});
