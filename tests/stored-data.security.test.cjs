const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(process.env.FORGE_TEST_ROOT||path.resolve(__dirname,'..'));
let browser;
before(async()=>{browser=await chromium.launch({headless:true,...(process.env.FORGE_TEST_CHROME?{executablePath:process.env.FORGE_TEST_CHROME}:{})});});
after(async()=>{await browser?.close();});
async function fixture(file,uid){
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.setDefaultTimeout(5000);
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',route=>{
  const u=new URL(route.request().url());
  if(u.origin!=='http://127.0.0.1')return route.abort();
  const f=path.resolve(root,'.'+u.pathname);
  if(!f.startsWith(root+path.sep)||!fs.existsSync(f))return route.fulfill({status:404,body:''});
  return route.fulfill({path:f,contentType:f.endsWith('.js')?'application/javascript':f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':undefined});
 });
 await page.goto('http://127.0.0.1/projects.html');
 await page.evaluate(async uid=>{
  const project={uid,name:'security fixture',cust:'synthetic customer',status:'אושר',date:'2026-10-28',price:'100',dep:'0'};
  const backup={version:1,data:{mp_projects:JSON.stringify([project])}};
  await MP.restore(new File([JSON.stringify(backup)],'synthetic-backup.json',{type:'application/json'}));
 },uid);
 await page.goto('http://127.0.0.1/'+file);
 return {context,page,errors};
}
const restoredIdentifier='synthetic " identifier & <text>';
for(const file of ['projects.html','production.html'])test(file+' preserves restored identifier punctuation while editing',async()=>{
 const {context,page,errors}=await fixture(file,restoredIdentifier);
 try{
  assert.equal(await page.locator('article[data-uid]').first().getAttribute('data-uid'),restoredIdentifier);
  if(file==='projects.html')await page.locator('details.project-details summary').first().click();
  const input=page.locator(file==='projects.html'?'input[data-k="cust"]':'input[data-note]').first();
  await input.fill('edited safely');await input.press('Tab');
  assert.equal(await page.evaluate(()=>MP.projects()[0].uid),restoredIdentifier);
  assert.equal(await page.evaluate(file=>file==='projects.html'?MP.projects()[0].cust:MP.projects()[0].productionNote,file),'edited safely');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
test('production timer handles a restored identifier without selector injection',async()=>{
 const uid='synthetic"identifier]';
 const {context,page,errors}=await fixture('production.html',uid);
 try{
  await page.clock.install();await page.locator('button[data-start]').first().click();
  await page.clock.fastForward(16000);
  assert.equal(await page.locator('[data-live-project]').first().getAttribute('data-live-project'),uid);
  assert.deepEqual(errors,[]);
  await page.locator('button[data-stop]').first().click();
  assert.ok(await page.evaluate(()=>MP.projects()[0].workMinutes)>0);
 }finally{await context.close();}
});
