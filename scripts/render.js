// uso: node render.js PROJETO [t1 t2 ...]  (prévia em PNG)   |   node render.js PROJETO all INICIO FIM  (quadros JPG)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const P=path.resolve(process.argv[2]); const args=process.argv.slice(3);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+P+'/index.html');await p.evaluate(()=>window.ready);await p.waitForTimeout(1500);
if(args[0]==='all'){const N=Math.ceil(await p.evaluate(()=>END)*30); fs.mkdirSync(P+'/frames',{recursive:true}); const s0=+args[1]||0,s1=Math.min(N,+args[2]||N);
 for(let i=s0;i<s1;i++){await p.evaluate(t=>render(t),i/30);await p.screenshot({path:`${P}/frames/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:90});}}
else {fs.mkdirSync(P+'/previa',{recursive:true}); for(const t of args.map(Number)){await p.evaluate(t=>render(t),t);await p.screenshot({path:`${P}/previa/s_${t}.png`});}}
await b.close();})()
