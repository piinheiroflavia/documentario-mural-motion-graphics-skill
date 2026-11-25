const VERT=location.hash.includes('vertical'); const VW=VERT?1080:1920, VH=VERT?1920:1080, ZM=VERT?0.86:1;
if(VERT) document.documentElement.classList.add('vert');
// CAM: [tempo, x, y, zoom]. Voos longos ganham um ponto intermediário afastado.
let CAM=[];
function setCam(K){const out=[K[0]]; for(let i=1;i<K.length;i++){const p=K[i-1],q=K[i]; const d=Math.hypot(q[1]-p[1],q[2]-p[2]); if(d>2600) out.push([(p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2,Math.min(p[3],q[3])*Math.max(0.28,1500/d)]); out.push(q);} CAM=out;}
function camAt(t){const K=CAM,n=K.length; if(t<=K[0][0]) return K[0].slice(1); if(t>=K[n-1][0]) return K[n-1].slice(1);
 let i=0; while(i<n-2&&t>K[i+1][0]) i++;
 const out=[]; for(const j of [1,2,3]){const v=q=>j===3?Math.log(K[q][3]):K[q][j];
  const sl=q=>(v(q+1)-v(q))/(K[q+1][0]-K[q][0]);
  const m=q=>{if(q===0||q===n-1) return 0; const s0=sl(q-1),s1=sl(q); if(s0*s1<=0) return 0; const w1=2*(K[q+1][0]-K[q][0])+(K[q][0]-K[q-1][0]), w2=(K[q+1][0]-K[q][0])+2*(K[q][0]-K[q-1][0]); return (w1+w2)/(w1/s0+w2/s1);};
  const h=K[i+1][0]-K[i][0], u=(t-K[i][0])/h; const h00=2*u*u*u-3*u*u+1,h10=u*u*u-2*u*u+u,h01=-2*u*u*u+3*u*u,h11=u*u*u-u*u;
  const r=h00*v(i)+h10*h*m(i)+h01*v(i+1)+h11*h*m(i+1); out.push(j===3?Math.exp(r):r);}
 return out;}
const LATIN='Senatus populusque Romanus imperium tenuit per saecula multa; urbs aeterna, caput mundi, leges et vias dedit gentibus. Odoacer, anno quadringentesimo septuagesimo sexto, Romulum Augustulum deposuit et insignia imperii Constantinopolim misit. Hesperium Romanae gentis imperium cum hoc Augustulo periit. ';
function buildMats(){const Wd=$('world'); MATS.forEach(([x0,y0,x1,y1,tp,r])=>{const d=document.createElement('div'); d.className='mat mat-'+tp; d.style.cssText+=`left:${x0}px;top:${y0}px;width:${x1-x0}px;height:${y1-y0}px;transform:rotate(${r}deg)`; if(tp==='manu') d.innerHTML=`<div class="lat">${LATIN.repeat(Math.ceil((x1-x0)*(y1-y0)/60000))}</div>`; Wd.appendChild(d);});}

const IMSZ={};
function mk(tag,cls){const e=document.createElement(tag); if(cls) e.className=cls; return e;}
function mapWorldOf(m,lon,lat){const M=MAPS[m]; const [vx,vy,vw,vh]=M.V; return [M.x+(PX(lon)-vx)/vw*M.w, M.y+(PY(lat)-vy)/vh*M.h];}
function treeSVG(){const L=[['Português',0],['Espanhol',1],['Italiano',2],['Francês',3]]; let s=`<svg width="1000" height="500" style="overflow:visible"><rect x="330" y="0" width="300" height="100" fill="#151210"/><text x="480" y="66" text-anchor="middle" font-family="Cormorant Garamond" font-weight="700" font-size="58" fill="#F4EBD6">Latim</text>`;
 L.forEach(([n,q])=>{const x=40+q*240; s+=`<g class="br" data-q="${q}" opacity="0"><path d="M480 100 C480 180 ${x+100} 180 ${x+100} 260" stroke="#151210" stroke-width="5" fill="none"/><rect x="${x}" y="260" width="200" height="80" fill="#F4EBD6" stroke="#151210" stroke-width="4"/><text x="${x+100}" y="312" text-anchor="middle" font-family="Inter" font-weight="700" font-size="${n==='Português'?34:30}" fill="${n==='Português'?'#B3261E':'#151210'}">${n}</text></g>`;});
 s+=`<g class="ex" opacity="0"><text x="40" y="440" font-family="Inter" font-weight="600" font-size="38" fill="#151210">aqua → <tspan fill="#B3261E" font-weight="800">água</tspan>   ·   lex → <tspan fill="#B3261E" font-weight="800">lei</tspan>   ·   oculus → <tspan fill="#B3261E" font-weight="800">olho</tspan></text></g></svg>`; return s;}
function build(){if(typeof TEMA!=='undefined') document.documentElement.classList.add('tema-'+TEMA); const HP=new URLSearchParams(location.hash.slice(1)); if(HP.get('titulo')) $('shtitle').innerHTML=HP.get('titulo'); window.SHORTFIM=+(HP.get('fim')||0);for(const m in MAPS){const M=MAPS[m]; M.V=aspectFix(MV[M.view],M.w/M.h);} camKeys(); buildMats(); const Wd=$('world'); const byName={};
 let pc=0; W.forEach(e=>{if(e.k==='pin'&&!e.name) e.name='pin'+(pc++); if(e.html&&e.html.includes('QUEM DEPÔS')) e.name='note_od'; if(e.name) byName[e.name]=e;}); window.BYN=byName;
 W.forEach(e=>{let d;
  if(e.k==='img'){d=mk('div','el'+(e.dim?'':' ph')); const ih=e.h?e.w*1.3:null; const sz=IMSZ[IMG+e.src]||[1,1]; e.H=ih||e.w*sz[1]/sz[0]; e.ww=ih?ih*sz[0]/sz[1]:e.w;
   const deep=!e.dim&&e.depth!==false&&!e.h; const st=`${ih?'height:'+ih+'px':'width:'+e.w+'px'};display:block;${e.dim?'filter:sepia(.3) brightness(.62);box-shadow:0 30px 60px rgba(0,0,0,.45)':''}`;
   let inner=deep?`<div class="win" style="width:${e.ww}px;height:${e.H}px;overflow:hidden;position:relative"><img class="pic" src="${IMG+e.src}" style="${st};transform-origin:50% 50%"></div>`:`<img class="pic" src="${IMG+e.src}" style="${st}">`;
   if(e.fg){const fs=IMSZ[IMG+e.fg.src]||[1,1]; e.fg.hh=e.fg.w*fs[1]/fs[0]; inner+=`<img class="fg" src="${IMG+e.fg.src}" style="position:absolute;left:${e.fg.x}px;top:${e.fg.y}px;width:${e.fg.w}px;filter:drop-shadow(14px 18px 10px rgba(0,0,0,.45))">`;}
   if(e.polaroid){d.className='el pola'; d.style.padding='22px 22px 96px 22px'; d.style.background='#F7F3EA'; inner+=`<div class="pcap">${e.polaroid}</div>`+(e.id?`<div class="pcr">${e.id.replace(/<[^>]+>/g,'')}</div>`:''); e.ww+=44; e.H+=118;}
   else if(e.id) inner+=`<div class="id" style="left:8px;bottom:-30px">${e.id}</div>`;
   d.innerHTML=inner;}
  else if(e.k==='jornal'){d=mk('div','jornal'); d.style.width=(e.w||760)+'px'; d.innerHTML=`<div class="jn">${e.nome||'GAZETA'}</div><div class="jd">${e.data||''}</div><div class="jt">${e.titulo}</div><div class="jc">${e.texto}</div>`+(e.id?`<div class="id" style="left:8px;bottom:-30px">${e.id}</div>`:'');}
  else if(e.k==='tag'){d=mk('div','tag'); d.innerHTML=e.html; d.style.fontSize='30px';}
  else if(e.k==='ttl'){d=mk('div','ttl'); d.innerHTML=e.html; d.style.fontSize=e.size+'px'; d.style.color=e.color||'#151210';}
  else if(e.k==='mk'){d=mk('div','mk'); d.innerHTML=e.html; d.style.color=e.color; d.style.fontSize='54px';}
  else if(e.k==='note'){d=mk('div','note'); d.style.width=e.w+'px'; d.innerHTML=e.html;}
  else if(e.k==='anote'){const [px,py]=mapWorldOf(e.m,e.lon,e.lat); e.x=px+e.dx; e.y=py+e.dy; d=mk('div','note'); d.style.width=e.w+'px'; d.innerHTML=e.html; if(e.html.includes('PARA TER')) d.style.borderLeft='12px solid #F2C94C';}
  else if(e.k==='agenda'){d=mk('div','note'); d.style.width='640px'; d.innerHTML='<div class="h">NESTE VÍDEO</div>'+e.items.map(x=>`<div class="ai" style="opacity:0;font:600 32px/1.6 Inter">${x}</div>`).join('');}
  else if(e.k==='recap'){d=mk('div','note'); d.style.width=(e.w||1000)+'px'; d.style.padding='34px 44px'; d.innerHTML=`<div style="font:700 60px 'Cormorant Garamond',serif;color:#151210;margin-bottom:14px">${e.title}</div>`+e.items.map(x=>`<div class="ri" style="font:600 32px/1.5 Inter;opacity:0"><span style="color:#2F7F86">●</span> ${x}</div>`).join('');}
  else if(e.k==='chap'){d=mk('div'); d.innerHTML=`<div style="transform:translateX(-50%);text-align:center;width:max-content"><div style="font:800 30px Inter;letter-spacing:.4em;color:#F4EBD6;background:#151210;padding:8px 18px;display:inline-block">${e.n}</div><div style="font:700 120px/1.05 'Cormorant Garamond',serif;color:#151210;background:#F4EBD6;padding:10px 46px 18px;margin-top:16px;box-shadow:12px 14px 0 rgba(0,0,0,.3);white-space:nowrap">${e.t}</div></div>`;}
  else if(e.k==='map'){const M=MAPS[e.m]; e.x=M.x; e.y=M.y; e.at=-99; d=mk('div','el ph'); d.style.cssText+=`width:${M.w}px;height:${M.h}px;background:#EFE4CC`; d.innerHTML='<div class="mp"></div><div class="yr" style="position:absolute;left:70px;top:190px"></div><div class="id" style="right:10px;bottom:-30px">Mapa base: Natural Earth (domínio público) · fronteiras aproximadas</div>';}
  else if(e.k==='pin'){const [px,py]=mapWorldOf(e.m,e.lon,e.lat); e.px=px; e.py=py; e.x=px+e.dx; e.y=py+e.dy; d=mk('div','el ph'); d.innerHTML=`<img src="${IMG+e.src}" style="width:${e.w}px;display:block"><div class="id" style="left:8px;bottom:-30px">${e.id}</div>`; e.ww=e.w; e.H=e.w*0.7;
   const ln=document.createElementNS('http://www.w3.org/2000/svg','svg'); ln.setAttribute('class','ov'); ln.setAttribute('width','10'); ln.setAttribute('height','10'); ln.style.cssText='position:absolute;left:0;top:0;overflow:visible'; Wd.appendChild(ln); e._ln=ln;}
  else if(e.k==='circ'||e.k==='lbl'){const R=byName[e.ref]; const ix=R.x+R.ww*e.cx, iy=R.y+R.H*e.cy; e.x=ix; e.y=iy; d=mk('div');
   if(e.k==='circ') d.innerHTML=`<svg width="10" height="10" style="position:absolute;left:0;top:0;overflow:visible"></svg><div class="mk" style="position:absolute;left:${-e.r-330}px;top:-30px;color:#B3261E;font-size:52px">${e.lab}</div>`;
   else d.innerHTML=`<svg width="10" height="10" style="position:absolute;left:0;top:0;overflow:visible"></svg><div class="tag" style="position:absolute;left:${e.dx}px;top:${e.dy-50}px;font-size:26px;background:#151210;color:#F4EBD6;white-space:nowrap;transform:translateX(${e.dx<0?'-50%':'0'})">${e.txt}</div>`;}
  else if(e.k==='quote'){d=mk('div','note'); d.style.width=e.w+'px'; d.style.borderLeft='12px solid #8a6a3a'; d.innerHTML=`<div class="h">FONTE DA ÉPOCA</div><div style="font:italic 600 48px/1.25 'Cormorant Garamond',serif;color:#5b4630">${e.latin}</div><div class="qp" style="font:600 40px/1.35 Inter;color:#151210;margin-top:18px;opacity:0">${e.pt}</div><div style="font:500 22px Inter;color:#666;margin-top:14px">${e.ref}</div>`;}
  else if(e.k==='tree'){d=mk('div','el'); d.innerHTML=treeSVG();}
  else if(e.k==='flow'){d=mk('div','el'); d.innerHTML=e.steps.map((s,q)=>`<div class="fs" style="position:absolute;left:0;top:${q*230}px;width:960px;opacity:0"><div class="note" style="position:relative;width:880px"><div class="h">${s[0].toUpperCase()}</div><b style="font-size:34px">${s[1]}</b></div>${q<e.steps.length-1?'<div style="position:absolute;left:420px;top:150px;font:800 60px Archivo;color:#151210">↓</div>':''}</div>`).join('');}
  else if(e.k==='cal'){d=mk('div','el'); d.innerHTML=e.months.map(([m,w],q)=>`<div class="cm" style="position:absolute;left:${q*500}px;top:0;width:440px;height:470px;background:#F4EBD6;box-shadow:10px 14px 0 rgba(0,0,0,.28);opacity:0"><div style="height:120px;background:#B3261E;color:#F4EBD6;font:700 84px/120px 'Cormorant Garamond',serif;text-align:center">${m}</div><div style="padding:34px;font:500 28px Inter;color:#333">em homenagem a<br><b style="font:700 56px 'Cormorant Garamond',serif;color:#151210">${w}</b></div></div>`).join(''); d.style.scale=String(e.sc||1); d.style.transformOrigin='0 0';}
  else if(e.k==='col'){d=mk('div','note'); d.style.width=e.w+'px'; d.style.borderTop=`14px solid ${e.color}`; d.innerHTML=`<div style="font:700 66px 'Cormorant Garamond',serif;color:${e.color}">${e.head}</div>`+e.items.map(x=>`<div class="ci" style="font:600 32px/1.5 Inter;opacity:${e.static?1:0}">• ${x}</div>`).join('')+(e.who?`<div style="font:600 22px Inter;color:#666;margin-top:12px">${e.who}</div>`:'');}
  else if(e.k==='both'){d=mk('div','el'); d.innerHTML=`<div class="tag" style="position:relative;font-size:44px;background:#151210;color:#F4EBD6;padding:14px 30px;white-space:nowrap">perdas reais <span style="color:#F2C94C">+</span> continuidades</div>`;}
  else if(e.k==='bigq'){d=mk('div'); d.style.cssText='font:700 96px/1.05 "Cormorant Garamond",serif;color:#F4EBD6;white-space:nowrap';d.innerHTML=e.html;}
  else if(e.k==='cta'){d=mk('div','note'); d.style.width='900px'; d.style.fontSize='40px'; d.style.borderLeft='12px solid #F2C94C'; d.innerHTML=e.html;}
  d.style.position='absolute'; d.style.left=e.x+'px'; d.style.top=e.y+'px'; Wd.appendChild(d); e._d=d;});
 const sv=document.createElementNS('http://www.w3.org/2000/svg','svg'); sv.id='strings'; sv.setAttribute('width','10'); sv.setAttribute('height','10'); sv.style.cssText='position:absolute;left:0;top:0;overflow:visible;pointer-events:none'; Wd.appendChild(sv);}
const TACK=`<svg width="46" height="46" style="position:absolute;left:50%;top:-18px;margin-left:-23px;overflow:visible"><ellipse cx="27" cy="30" rx="15" ry="7" fill="rgba(0,0,0,.35)"/><circle cx="23" cy="20" r="15" fill="#C8302A" stroke="#7a1a16" stroke-width="2"/><circle cx="18" cy="15" r="5" fill="rgba(255,255,255,.55)"/></svg>`;
const TAPE=`<div style="position:absolute;left:-24px;top:-14px;width:150px;height:44px;background:rgba(238,228,195,.8);transform:rotate(-24deg);box-shadow:0 2px 4px rgba(0,0,0,.2)"></div><div style="position:absolute;right:-24px;top:-14px;width:150px;height:44px;background:rgba(238,228,195,.8);transform:rotate(22deg);box-shadow:0 2px 4px rgba(0,0,0,.2)"></div>`;
const PINNED=['img','pin','note','agenda','recap','quote','col','anote','cta','jornal'];
function anchorOf(r){if(Array.isArray(r)) return mapWorldOf(r[0],r[1],r[2]); const e=window.BYN[r]; return e?pinPos(e):null;}
function pinPos(e){if(e.k==='img'||e.k==='pin') return [e.x+(e.ww||e.w)*0.5, e.y+22]; return [e.x+(e.w||(e.k==='recap'?1000:e.k==='jornal'?760:600))*0.5, e.y+18];}
function PIN(x,y,s,rot){const PINC=(typeof TEMA!=='undefined'&&TEMA==='quadro')?['#3B7BD6','#2A63B8','#2558A8','#173F7D']:['#D9372D','#C2281F','#B3221B','#8E1712'];return `<g transform="translate(${x} ${y}) scale(${s}) rotate(${rot})">
 <ellipse cx="22" cy="12" rx="20" ry="9" fill="rgba(0,0,0,.32)"/><path d="M4 4 L34 -6" stroke="rgba(0,0,0,.28)" stroke-width="10" stroke-linecap="round" transform="translate(10 12)"/>
 <ellipse cx="0" cy="0" rx="15" ry="7" fill="${PINC[3]}"/><ellipse cx="0" cy="-2" rx="15" ry="7" fill="${PINC[1]}"/>
 <path d="M-6 -4 L6 1 L22 -30 L11 -35 Z" fill="${PINC[2]}"/><path d="M-2 -3 L3 -1 L17 -31 L13 -33 Z" fill="rgba(255,255,255,.28)"/>
 <ellipse cx="17" cy="-34" rx="19" ry="10" transform="rotate(-28 17 -34)" fill="${PINC[3]}"/><ellipse cx="17" cy="-37" rx="19" ry="10" transform="rotate(-28 17 -37)" fill="${PINC[0]}"/>
 <ellipse cx="11" cy="-41" rx="7" ry="3.5" transform="rotate(-28 11 -41)" fill="rgba(255,255,255,.6)"/></g>`;}
function drawStrings(t){let s='',pins='';
 STRINGS.forEach(([A,B,at])=>{const k=t-at; if(k<0) return; const p=eo(k/1.0); const P=anchorOf(A),Q=anchorOf(B); if(!P||!Q) return;
  const qx=P[0]+(Q[0]-P[0])*p, qy=P[1]+(Q[1]-P[1])*p; const mx=(P[0]+qx)/2, my=(P[1]+qy)/2+Math.hypot(qx-P[0],qy-P[1])*0.03;
  s+=`<path d="M${P[0]+8} ${P[1]+10} Q${mx+8} ${my+12} ${qx+8} ${qy+10}" stroke="rgba(0,0,0,.28)" stroke-width="6" fill="none"/><path d="M${P[0]} ${P[1]} Q${mx} ${my} ${qx} ${qy}" stroke="#A3201A" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="M${P[0]} ${P[1]} Q${mx} ${my} ${qx} ${qy}" stroke="#D9443A" stroke-width="2" fill="none" stroke-dasharray="3 5" opacity=".8"/>`;
  if(Array.isArray(B)&&p>0.98) pins+=PIN(Q[0],Q[1],1.15,0);});
 W.forEach((e,i)=>{if(!PINNED.includes(e.k)||e.dim||!e._d||e._d.style.display==='none') return; const k=t-e.at; if(k<0.3) return; const p=back(cl((k-0.3)/0.35,0,1)); const [x,y]=pinPos(e); pins+=`<g opacity="${cl((k-0.3)/0.15,0,1)}">${PIN(x,y-(1-p)*40,1.15*p+0.001,(i%3-1)*6)}</g>`;});
 (NOTES_HAND||[]).forEach(n=>{const k=t-n.at; if(k<0) return; const [px,py]=mapWorldOf(n.m[0],n.m[1],n.m[2]); s+=`<foreignObject x="${px+n.dx}" y="${py+n.dy}" width="600" height="300"><div xmlns="http://www.w3.org/1999/xhtml" style="font:400 64px/1.05 'Permanent Marker',cursive;color:#B3261E;clip-path:inset(0 ${100-100*cl(k/1.0,0,1)}% 0 0);transform:rotate(-6deg)">${n.html}</div></foreignObject>`;});
 $('strings').innerHTML=s+pins;}
function tlAt(t){let cur=[TLB[0][1],t]; TLB.forEach(([id,o])=>{const s=a(id)-0.35; if(t>=s) cur=[o,t-s];}); return cur;}
function render(t){
 const [cx,cy,z]=camAt(t); const sway=Math.sin(t*0.37)*6, sway2=Math.cos(t*0.29)*4, rot=Math.sin(t*0.21)*0.35;
 drawStrings(t); $('world').style.transform=`translate(${VW/2}px,${VH*0.435}px) rotate(${rot}deg) scale(${z*ZM}) translate(${-cx+sway}px,${-cy+sway2}px)`;
 $('desk').style.transform=`translate(${VW/2}px,${VH*0.435}px) scale(${(0.55+z*0.45)*ZM}) translate(${-cx*0.6}px,${-cy*0.6}px)`; $('lamp').style.background=`radial-gradient(ellipse 55% 60% at ${48+Math.sin(t*0.13)*10}% ${40+Math.cos(t*0.11)*8}%,rgba(255,226,170,.22),rgba(0,0,0,0) 70%)`;
 W.forEach(e=>{const d=e._d,k=t-e.at;
  // só desenha o que está perto da câmera (desempenho)
  const near=Math.abs((e.x||0)-cx)<VW/(z*ZM)+3000&&Math.abs((e.y||0)-cy)<1080/z+2500; d.style.display=near?'':'none'; if(e._ln) e._ln.style.display=near?'':'none'; if(!near) return;
  if(e.k==='map'){const M=MAPS[e.m], st=M.state(t); d.querySelector('.mp').innerHTML=mapSVG(Object.assign({view:M.V,w:M.w,h:M.h},st));
   const yr=d.querySelector('.yr'); if(st.year){const y=Math.round(st.year); const lab=y<700?'c. 476':y<1300?'c. 1025':'1453'; yr.innerHTML=`<div style="font:800 18px Archivo;letter-spacing:.2em;color:#151210;background:#F2C94C;padding:6px 12px;display:inline-block">IMPÉRIO DO ORIENTE</div><div style="font:700 96px 'Cormorant Garamond',serif;color:#13464b">${lab}</div>`;} else yr.innerHTML=''; return;}
  if(k<0){d.style.visibility='hidden'; if(e._ln) e._ln.innerHTML=''; return;} d.style.visibility='visible'; const p=eo(k/1.1), r=e.rot||0;
  if(e.k==='img'||e.k==='pin'){d.style.opacity=p; d.style.transform=`translateY(${(1-p)*50}px) scale(${0.92+0.08*p}) rotate(${r+(1-p)*3}deg)`;
   const pic=d.querySelector('.pic'); if(e.reveal&&pic){const rv=eo((k-0.3)/1.6); pic.style.filter=`blur(${(1-rv)*14}px) grayscale(${1-rv}) brightness(${0.7+0.3*rv})`;}
   if(pic&&d.querySelector('.win')){const ex=e.x+(e.ww||e.w)/2, ey=e.y+(e.H||400)/2; const ox=cl((cx-ex)/1500,-1,1), oy=cl((cy-ey)/1200,-1,1); pic.style.transform=`scale(1.10) translate(${-ox*22}px,${-oy*16}px)`;}
   const fg=d.querySelector('.fg'); if(fg){const ex=e.x+(e.ww||e.w)/2; const ox=cl((cx-ex)/1500,-1,1); fg.style.transform=`translate(${ox*38}px,${-6*eo(k/2)}px) scale(${1+0.03*eo(k/3)})`;}
   if(e._ln) e._ln.innerHTML='';}
  else if(e.k==='circ'){d.querySelector('svg').innerHTML=`<circle cx="0" cy="0" r="${e.r}" stroke="#B3261E" stroke-width="9" fill="none" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${1-eo(k/0.8)}" transform="rotate(-90)"/>`; d.querySelector('.mk').style.clipPath=`inset(0 ${100-100*cl((k-0.5)/0.9,0,1)}% 0 0)`;}
  else if(e.k==='lbl'){const q=eo(k/0.6); d.querySelector('svg').innerHTML=`<circle r="${12*q}" fill="#F2C94C" stroke="#151210" stroke-width="4"/><path d="M0 0 L${e.dx*q} ${(e.dy)*q}" stroke="#151210" stroke-width="4"/>`; const tg=d.querySelector('.tag'); tg.style.opacity=cl((k-0.4)/0.4,0,1);}
  else if(e.k==='jornal'){d.style.opacity=p; d.style.transform=`translateY(${(1-p)*40}px) rotate(${r||-1.5}deg)`; d.querySelectorAll('u.sub').forEach(u=>{u.style.backgroundSize=`${100*eo((k-(+u.dataset.at))/0.8)}% 5px`;});}
  else if(e.k==='mk'){d.style.clipPath=`inset(0 ${100-100*cl(k/1.0,0,1)}% 0 0)`; d.style.transform=`rotate(-3deg)`;}
  else if(e.k==='agenda'){d.style.opacity=p; d.querySelectorAll('.ai').forEach((x,q)=>{x.style.opacity=cl((k-0.6-q*0.8)/0.4,0,1);});}
  else if(e.k==='recap'){d.style.opacity=p; d.querySelectorAll('.ri').forEach((x,q)=>{x.style.opacity=cl((k-1.0-q*e.gap)/0.5,0,1);});}
  else if(e.k==='quote'){d.style.opacity=p; d.querySelector('.qp').style.opacity=cl((k-2.4)/0.7,0,1);}
  else if(e.k==='tree'){d.querySelectorAll('.br').forEach(g=>{g.setAttribute('opacity',cl((k-1.0-(+g.dataset.q)*0.6)/0.5,0,1));}); d.querySelector('.ex').setAttribute('opacity',cl((k-3.8)/0.6,0,1));}
  else if(e.k==='flow'){d.querySelectorAll('.fs').forEach((x,q)=>{const st=e.steps[q][2]; x.style.opacity=cl((k-st)/0.6,0,1); x.style.transform=`translateY(${(1-eo((k-st)/0.6))*26}px)`;});}
  else if(e.k==='cal'){d.querySelectorAll('.cm').forEach((x,q)=>{const pp=eo((k-q*1.2)/0.6); x.style.opacity=pp; x.style.transform=`translateY(${(1-pp)*30}px) rotate(${q?3:-3}deg)`;});}
  else if(e.k==='col'){d.style.opacity=p; d.style.transform=`translateY(${(1-p)*30}px)`; if(!e.static) d.querySelectorAll('.ci').forEach((x,q)=>{x.style.opacity=cl((k-1.4-q*2.2)/0.5,0,1);});}
  else {d.style.opacity=p; d.style.transform=`translateY(${(1-p)*30}px)`;}
  d.querySelectorAll('mark.hl').forEach(h=>{h.style.backgroundSize=`${100*eo((k-(+h.dataset.at))/0.7)}% 42%`;});
 });
 // overlays
 let lc=null; LOCATOR.forEach(L=>{if(t>=L[0]&&t<L[1]) lc=L;}); const lo=$('loc');
 if(lc){const k=Math.min(cl((t-lc[0])/0.5,0,1),cl((lc[1]-t)/0.5,0,1)); lo.style.display=''; lo.style.opacity=k; const V=aspectFix(MV.med,320/190);
  lo.innerHTML=`<div class="h2">ONDE FICA</div>`+mapSVG({view:V,w:320,h:190,cities:{}}).replace(/<\/svg>$/,`<circle cx="${PX(lc[2])}" cy="${PY(lc[3])}" r="${V[2]/320*11}" fill="#B3261E" stroke="#151210" stroke-width="${V[2]/320*3}"/></svg>`)+`<div class="lb">${lc[4]}</div>`;} else lo.style.display='none';
 let sb=null; SABIA.forEach(s=>{if(t>=s[0]&&t<s[1]) sb=s;}); const so=$('sabia'); if(sb){so.style.display=''; const k=Math.min(eo((t-sb[0])/0.6),cl((sb[1]-t)/0.5,0,1)); so.style.opacity=k; so.style.transform=`translateX(${(1-k)*-60}px)`; so.querySelector('.d').textContent=sb[2];} else so.style.display='none';
 let kw=null; KW.forEach(s=>{if(t>=s[0]&&t<s[1]) kw=s;}); const ko=$('kw'); if(kw){ko.style.display=''; ko.querySelector('.w').textContent=kw[2]; ko.querySelector('.d').textContent=kw[3]; ko.style.transform=`translateX(${(1-eo((t-kw[0])/0.6))*700}px)`;} else ko.style.display='none';
 let ch=null; CHS.forEach(c=>{if(t>=a(c[0])-1.0) ch=c;}); if(ch&&ch[1]&&t>=a(ch[0])+3.4&&!kw&&!sb){$('chap').style.display=''; $('chap').querySelector('.k').textContent=ch[1]; $('chap').querySelector('.t').textContent=ch[2];} else $('chap').style.display='none';
 // linha do tempo
 const T=tlAt(t), tl=T[0], u=T[1]; $('tlbar').style.display=tl.noTL?'none':''; $('subt').style.bottom=tl.noTL?'40px':'110px';
 if(!tl.noTL){const X=y=>130+(y-300)/1700*1660; let cyr=tl.curFn?tl.curFn(t):(()=>{let y=tl.cur[0][1]; for(let q=1;q<tl.cur.length;q++){const pp=ease((u-tl.cur[q][0])/1.2); if(pp>0) y=y+(tl.cur[q][1]-y)*pp;} return y;})();
  let s=`<line x1="130" y1="40" x2="1790" y2="40" stroke="#6b6156" stroke-width="4"/>`;
  for(let y=300;y<=2000;y+=100){const big=y%500===0; s+=`<line x1="${X(y)}" y1="${big?28:33}" x2="${X(y)}" y2="${big?52:47}" stroke="#6b6156" stroke-width="3"/>`; if(big||[400,700,1200,1400,1700,1800].includes(y)) s+=`<text x="${X(y)}" y="76" text-anchor="middle" font-family="Inter" font-weight="600" font-size="17" fill="#9c9183">${y}</text>`;}
  if(tl.band){const [ya,yb,tt,lab]=tl.band; const pp=cl((u-tt)/0.8,0,1); if(pp>0) s+=`<rect x="${X(ya)}" y="30" width="${(X(yb)-X(ya))*pp}" height="20" fill="#B3261E" opacity=".75"/><text x="${X((ya+yb)/2)}" y="20" text-anchor="middle" font-family="Inter" font-weight="700" font-size="19" fill="#ff9c8c" opacity="${pp}">${lab}</text>`;}
  if(tl.fill){const [ya,yb,tt,du,lab]=tl.fill; const pp=ease((u-tt)/du); if(pp>0){s+=`<line x1="${X(ya)}" y1="40" x2="${X(ya+(yb-ya)*pp)}" y2="40" stroke="#2F7F86" stroke-width="10" stroke-linecap="round"/>`; if(pp>0.3) s+=`<text x="${X((ya+yb)/2)}" y="20" text-anchor="middle" font-family="Inter" font-weight="700" font-size="19" fill="#7fd0d6">${lab}</text>`;}}
  const MK=(tl.marks||[]).filter(m=>u>=m[2]); const lastM=MK.length?MK[MK.length-1]:null;
  (tl.marks||[]).forEach(([y,lab,tt])=>{const pp=cl((u-tt)/0.4,0,1); if(pp>0){s+=`<circle cx="${X(y)}" cy="40" r="${9*pp}" fill="#F4EBD6" stroke="#151210" stroke-width="3"/>`; if(lastM&&lastM[0]===y) s+=`<text x="${X(y)}" y="20" text-anchor="${X(y)>1650?'end':'middle'}" font-family="Inter" font-weight="700" font-size="18" fill="#F4EBD6" opacity="${pp}">${y} · ${lab}</text>`;}});
  s+=`<circle cx="${X(cyr)}" cy="40" r="13" fill="#F2C94C" stroke="#151210" stroke-width="3"/><rect x="${X(cyr)-40}" y="54" width="80" height="26" rx="4" fill="#F2C94C"/><text x="${X(cyr)}" y="74" text-anchor="middle" font-family="Archivo" font-weight="800" font-size="20" fill="#151210">${Math.round(cyr)}</text>`; $('tl').innerHTML=s;}
 let st=''; TL.seg.forEach(q=>{if(q.txt&&t>=q.a&&t<q.b+0.25) st=q.txt;}); $('subt').textContent=st; if(VERT&&window.SHORTFIM){const k=t-(window.SHORTFIM-3); $('shcta').style.display=k>0?'block':'none'; $('shcta').style.opacity=cl(k/0.4,0,1);}
 $('grain').style.backgroundPosition=`${(Math.floor(t*8)*97)%300}px ${(Math.floor(t*8)*53)%300}px`;
}
function preload(){return Promise.all([...new Set(W.filter(e=>e.src).map(e=>IMG+e.src))].map(u=>new Promise(r=>{const im=new Image(); im.onload=()=>{IMSZ[u]=[im.naturalWidth,im.naturalHeight]; r();}; im.onerror=()=>r(); im.src=u; (window._k=window._k||[]).push(im);})));}
