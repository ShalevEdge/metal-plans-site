/* SHALVERO FORGE — local operations ledger V7 */
(()=> {
  'use strict';
  const STORAGE='mp_purchase_orders_v1';
  const safeNum=x=>{const v=Number(x);return Number.isFinite(v)&&v>=0?v:0};
  const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'forge-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  const P=()=>MP.projects();
  const O=()=>MP.get(STORAGE,[]);
  const saveOrders=o=>MP.set(STORAGE,o);
  const currency=n=>'₪'+safeNum(n).toLocaleString('he-IL',{maximumFractionDigits:2});
  function analysis(project,costRate){
    const saleRaw=project.price;
    const hasPrice=saleRaw!==''&&saleRaw!=null&&Number.isFinite(Number(saleRaw))&&Number(saleRaw)>=0;
    const revenue=hasPrice?safeNum(saleRaw):null;
    const expenses=Array.isArray(project.expenses)?project.expenses:[];
    const spent=expenses.reduce((s,e)=>s+safeNum(e.amount),0);
    const minutes=safeNum(project.workMinutes);
    const hourly=safeNum(project.hourCostRate||costRate);
    const labor=minutes*hourly/60;
    const incomplete=!hasPrice||!(hourly>0);
    const contribution=hasPrice?revenue-spent-labor:null;
    return {revenue,spent,labor,minutes,hourly,contribution,
      margin:revenue>0?100*contribution/revenue:null,
      incomplete,hasPrice,hasLaborRate:hourly>0,expenseCount:expenses.length};
  }
  function upsertProjectExpense(projectUid,expense){
    const items=P(),p=items.find(x=>x.uid===projectUid);
    if(!p)return false;
    p.expenses=Array.isArray(p.expenses)?p.expenses:[];
    const idx=p.expenses.findIndex(x=>x.id===expense.id);
    if(idx<0)p.expenses.push(expense);else p.expenses[idx]=expense;
    p.updatedAt=new Date().toISOString();MP.saveProjects(items);return true;
  }
  function removeExpense(projectUid,expenseId){
    const items=P(),p=items.find(x=>x.uid===projectUid);
    if(!p)return false;
    p.expenses=(Array.isArray(p.expenses)?p.expenses:[]).filter(x=>x.id!==expenseId);
    p.updatedAt=new Date().toISOString();MP.saveProjects(items);return true;
  }
  function saveQuote(projectUid,price,dep){
    const items=P(),p=items.find(x=>x.uid===projectUid);
    if(!p)return false;
    p.price=String(safeNum(price));p.dep=String(safeNum(dep));
    p.updatedAt=new Date().toISOString();MP.saveProjects(items);return true;
  }
  function purchaseTotal(order){return (order.lines||[]).reduce((s,l)=>s+safeNum(l.qty)*safeNum(l.unitPrice),0)}
  function savePurchase(order){
    const all=O(),o={...order,id:order.id||uid(),status:order.status||'טיוטה',updatedAt:new Date().toISOString()};
    const index=all.findIndex(x=>x.id===o.id);
    if(index===-1)all.unshift(o);else all[index]=o;
    saveOrders(all);return o;
  }
  function markReceived(id){
    const all=O(),o=all.find(x=>x.id===id);
    if(!o)return {ok:false,message:'הזמנה לא נמצאה'};
    if(o.receivedAt)return {ok:false,message:'ההזמנה כבר נקלטה בעבר — לא שוכפלה'};
    const lines=o.lines||[];
    const count=lines.reduce((s,l)=>s+safeNum(l.qty),0);
    if(!lines.length||count>100||lines.some(l=>!String(l.profile||'').trim()||!(safeNum(l.length)>=100)||!Number.isInteger(Number(l.qty))||Number(l.qty)<1||Number(l.qty)>50||!(Number.isFinite(Number(l.unitPrice))&&Number(l.unitPrice)>=0)))
      return {ok:false,message:'לפני קליטה נדרש פרופיל, אורך במ״מ, כמות תקינה (עד 50 לשורה ו־100 להזמנה) ומחיר'};
    const inv=MP.inventory(),today=new Date().toISOString().slice(0,10);
    for(const l of lines)for(let i=0;i<+l.qty;i++)inv.push({id:uid(),profile:String(l.profile).trim(),length:+l.length,type:'full',source:'הזמנת רכש '+(o.ref||''),date:today,purchaseId:o.id});
    MP.saveInventory(inv);
    const total=purchaseTotal(o);
    if(o.projectUid)upsertProjectExpense(o.projectUid,{id:'purchase:'+o.id,category:'חומר',description:'רכש '+(o.ref||o.supplier||''),amount:total,date:today,source:'purchase'});
    o.status='התקבל';o.receivedAt=new Date().toISOString();saveOrders(all);
    return {ok:true,count,total,linked:!!o.projectUid};
  }
  window.ForgeOps={analysis,upsertProjectExpense,removeExpense,saveQuote,purchaseTotal,savePurchase,markReceived,orders:O,uid,currency,safeNum};
})();
