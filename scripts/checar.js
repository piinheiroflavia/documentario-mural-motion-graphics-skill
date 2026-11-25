// Checagem automática: percorre o vídeo e aponta texto embaixo da legenda/linha do tempo/caixas fixas, texto cortado na borda e textos sobrepostos.
// uso: node checar.js PROJETO [passo_em_segundos=1]  → PROJETO/checagem/relatorio.txt + quadros com problema
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const P=path.resolve(process.argv[2]); const STEP=+(process.argv[3]||1);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+P+'/index.html');await p.evaluate(()=>window.ready);await p.waitForTimeout(1000);
const END=await p.evaluate(()=>END); fs.mkdirSync(P+'/checagem',{recursive:true}); const out=[]; let lastKey=''; let prevSet=new Set();
for(let t=0.5;t<END;t+=STEP){
 const r=await p.evaluate(t=>{render(t); const TXT=['note','tag','ttl','mk','agenda','recap','quote','col','anote','cta','jornal','bigq','chap','both'];
  const R=el=>{const q=el.getBoundingClientRect(); return {x:q.left,y:q.top,w:q.width,h:q.height};};
  const ov={}; ['subt','tlbar','chap','kw','loc','sabia'].forEach(id=>{const el=document.getElementById(id); if(el&&el.style.display!=='none'&&getComputedStyle(el).display!=='none'&&el.textContent.trim()!==''||id==='tlbar'&&el.style.display!=='none') ov[id]=R(el);});
  const items=[]; W.forEach(e=>{if(!TXT.includes(e.k)||!e._d) return; const d=e._d; if(d.style.display==='none'||d.style.visibility==='hidden'||+(d.style.opacity||1)<0.6) return; const q=R(d); if(q.w<5) return; if(q.x>1920||q.y>1080||q.x+q.w<0||q.y+q.h<0) return; items.push({k:e.k,txt:(d.textContent||'').trim().slice(0,40),...q});});
  const hit=(a,b,m=0)=>a.x<b.x+b.w-m&&a.x+a.w>b.x+m&&a.y<b.y+b.h-m&&a.y+a.h>b.y+m; const area=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
  const probs=[];
  items.forEach(it=>{for(const [id,o] of Object.entries(ov)) if(hit(it,o,4)&&area(it,o)>0.06*it.w*it.h) probs.push(`"${it.txt}" (${it.k}) embaixo de ${id}`);
   const vis=Math.max(0,Math.min(it.x+it.w,1920)-Math.max(it.x,0))*Math.max(0,Math.min(it.y+it.h,1080)-Math.max(it.y,0)); if(vis<0.85*it.w*it.h&&it.w*it.h>4000) probs.push(`"${it.txt}" (${it.k}) cortado na borda`);});
  for(let i=0;i<items.length;i++) for(let j=i+1;j<items.length;j++){const A=items[i],B=items[j]; if(area(A,B)>0.15*Math.min(A.w*A.h,B.w*B.h)) probs.push(`"${A.txt}" sobre "${B.txt}"`);}
  return probs;},t);
 const cur=new Set(r); const keep=r.filter(x=>prevSet.has(x)); prevSet=cur; r.length=0; r.push(...keep);
 if(r.length){const key=r.join('|'); if(key!==lastKey){await p.screenshot({path:`${P}/checagem/t_${t.toFixed(1)}.png`}); out.push(`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')} (${t.toFixed(1)} s)\n  - `+r.join('\n  - '));} lastKey=key;} else lastKey='';
}
fs.writeFileSync(P+'/checagem/relatorio.txt',out.length?out.join('\n'):'Nenhum problema encontrado.'); console.log(out.length?out.length+' momentos com problema — veja checagem/relatorio.txt':'Nenhum problema encontrado.');
await b.close();})()
