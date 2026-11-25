// Renderiza um trecho do vídeo (em segundos) — usado pelos Shorts verticais.
// uso: node render_faixa.js PROJETO INICIO FIM PASTA "hash" i0 i1
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const [,,proj,ini,fim,pasta,hash,i0,i1]=process.argv; const P=path.resolve(proj); const V=hash.includes('vertical');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:V?{width:1080,height:1920}:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+P+'/index.html#'+hash);await p.evaluate(()=>window.ready);await p.waitForTimeout(1200); fs.mkdirSync(pasta,{recursive:true});
const N=Math.ceil((+fim-+ini)*30); for(let i=+i0||0;i<Math.min(N,+i1||N);i++){await p.evaluate(t=>render(t),+ini+i/30); await p.screenshot({path:`${pasta}/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:90});}
await b.close();})()
