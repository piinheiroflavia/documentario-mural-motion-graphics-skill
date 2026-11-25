// Capa 16:9 no estilo do vídeo: usa o mural num momento do vídeo como fundo + título grande à esquerda.
// uso: node capa.js PROJETO ID_DO_TRECHO "Título<br>em linhas" "DESTAQUE" [ETIQUETA] [imagem_recortada.png]
const {chromium}=require('playwright');const path=require('path');
const [,,proj,id,titulo,dest,tag,recorte]=process.argv; const P=path.resolve(proj);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+P+'/index.html');await p.evaluate(()=>window.ready);await p.waitForTimeout(1200);
await p.evaluate(([id,titulo,dest,tag,recorte])=>{const s=TL.seg.find(q=>q.id===id); render(s.a+(s.b-s.a)*0.8);
 ['subt','chap','kw','loc','sabia','tlbar','shtitle','shcta'].forEach(i=>{const e=document.getElementById(i); if(e) e.style.display='none';});
 const o=document.createElement('div'); o.style.cssText='position:absolute;inset:0;z-index:50';
 o.innerHTML=`<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(21,17,13,.92) 0%,rgba(21,17,13,.7) 45%,rgba(21,17,13,0) 72%)"></div>
 <div class="tag" style="left:90px;top:110px;font-size:34px">${tag||''}</div>
 <div style="position:absolute;left:84px;top:180px;font:700 150px/0.98 'Cormorant Garamond',serif;color:#F4EBD6;text-shadow:0 6px 24px rgba(0,0,0,.5)">${titulo} <span style="color:#F2C94C">${dest||''}</span></div>`+
 (recorte?`<img src="A/${recorte}" style="position:absolute;right:60px;bottom:0;height:900px;filter:drop-shadow(20px 24px 0 rgba(0,0,0,.35))">`:'');
 document.getElementById('st').appendChild(o);},[id,titulo,dest,tag,recorte]);
await p.waitForTimeout(800); await p.screenshot({path:P+'/capa.png'}); await b.close(); console.log('capa:',P+'/capa.png');})()
