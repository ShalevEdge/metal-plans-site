const fs=require('fs'),vm=require('vm'),assert=require('assert');
const path=require('path');const root=path.resolve(__dirname,'..')+path.sep;
const state={mp_projects:[{uid:'p1',name:'gate',price:'5000',dep:'1000',workMinutes:120,expenses:[{id:'manual1',category:'material',amount:700}]}],mp_inventory_v1:[]};
const MP={
 get:(k,f)=>state[k]??f,set:(k,v)=>state[k]=JSON.parse(JSON.stringify(v)),
 projects:()=>state.mp_projects,saveProjects:v=>state.mp_projects=JSON.parse(JSON.stringify(v)),
 inventory:()=>state.mp_inventory_v1,saveInventory:v=>state.mp_inventory_v1=JSON.parse(JSON.stringify(v))
};
const window={};const crypto={randomUUID:(()=>{let x=0;return()=>('test-'+(++x));})()};
vm.runInNewContext(fs.readFileSync(root+'operations.js','utf8'),{MP,window,crypto,Date,Math,Number,JSON});
const F=window.ForgeOps;const p=MP.projects()[0];let a=F.analysis(p,80);
assert.strictEqual(a.revenue,5000);assert.strictEqual(a.spent,700);assert.strictEqual(a.labor,160);assert.strictEqual(a.contribution,4140);
assert.strictEqual(F.analysis(p,0).incomplete,true);
const order=F.savePurchase({supplier:'Supplier',ref:'123',projectUid:'p1',lines:[{profile:'40x40x2',length:6000,qty:2,unitPrice:150}],status:'ordered'});
assert.strictEqual(F.purchaseTotal(order),300);
const receipt=F.markReceived(order.id);
assert.strictEqual(receipt.ok,true);assert.strictEqual(receipt.count,2);
assert.strictEqual(MP.inventory().length,2);
assert.strictEqual(MP.projects()[0].expenses.length,2);
assert.strictEqual(F.analysis(MP.projects()[0],80).contribution,3840);
assert.strictEqual(F.markReceived(order.id).ok,false);
assert.strictEqual(MP.inventory().length,2);
assert.strictEqual(MP.projects()[0].expenses.length,2);
console.log(JSON.stringify({tests:12,passed:12,contribution:F.analysis(MP.projects()[0],80).contribution,inventory:MP.inventory().length,expenses:MP.projects()[0].expenses.length}));
