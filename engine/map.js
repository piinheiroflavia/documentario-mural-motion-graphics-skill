// ---------- MAPA (Natural Earth, domínio público) ----------
let LAND='';
const LON0=-11,LON1=47,LAT0=55,LAT1=26, K=34, CO=Math.cos(40*Math.PI/180);
const PX=lon=>(lon-LON0)*K*CO*1.0*1.25, PY=lat=>(LAT0-lat)*K;
const MW=PX(LON1), MH=PY(LAT1);
const CITY={roma:[12.5,41.9,'Roma'],ravena:[12.2,44.42,'Ravena'],const:[28.98,41.01,'Constantinopla']};
const WEST=[[-9.6,43.6],[-1.6,48.8],[1.6,50.9],[4.3,51.6],[6.2,51.4],[7.0,50.3],[8.3,49.0],[8.6,47.6],[10.5,47.6],[13.0,48.3],[16.5,48.1],[18.9,47.8],[19.3,45.0],[19.2,42.0],[19.5,40.3],[20.6,36.5],[20.2,33.5],[20.0,29.5],[12,29.5],[5,31.5],[-2,33.2],[-6.5,32.6],[-10,34.5],[-9.9,36.9],[-9.6,43.6]];
const EAST=[[18.9,47.8],[22,44.6],[25.5,43.9],[28.6,45.3],[29.8,45.0],[33,44.2],[37,44.8],[41.6,41.5],[42.5,40.8],[44.5,38.5],[42.3,37.1],[40.3,36.3],[38.6,33.6],[36.2,31.6],[35.6,29.8],[34.8,28.6],[33.2,27.7],[32.8,24.0],[31.0,24.0],[30.5,28.5],[25.0,30.6],[20.0,29.5],[20.2,33.5],[20.6,36.5],[19.5,40.3],[19.2,42.0],[19.3,45.0],[18.9,47.8]];
const poly=P=>'M'+P.map(p=>PX(p[0]).toFixed(1)+' '+PY(p[1]).toFixed(1)).join(' L')+' Z';
async function loadMap(){const topo=window.LAND50; const land=topojson.feature(topo,topo.objects.land);
 let d=''; const inBox=c=>c.some(p=>p[0]>LON0-8&&p[0]<LON1+8&&p[1]>LAT1-6&&p[1]<LAT0+6);
 const ring=r=>{if(!inBox(r))return; d+='M'+r.map(p=>PX(p[0]).toFixed(1)+' '+PY(p[1]).toFixed(1)).join('L')+'Z';};
 land.features.forEach(f=>{const g=f.geometry; if(g.type==='Polygon') g.coordinates.forEach(ring); else g.coordinates.forEach(pl=>pl.forEach(ring));}); LAND=d;}
function mapSVG(o){ // o: {view:[x,y,w,h], west:0..1, east:0..1, route:0..1, cities:{id:k}, labels:0..1}
 const [vx,vy,vw,vh]=o.view; const U=vw/1920*1.35; let s=`<svg viewBox="${vx} ${vy} ${vw} ${vh}" width="${o.w}" height="${o.h}" style="display:block">`;
 s+=`<defs><clipPath id="landc"><path d="${LAND}"/></clipPath><pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="14" stroke="#9c8e70" stroke-width="2" opacity=".35"/></pattern></defs>`;
 s+=`<rect x="-500" y="-500" width="${MW+1000}" height="${MH+1000}" fill="#CFC3A2"/><rect x="-500" y="-500" width="${MW+1000}" height="${MH+1000}" fill="url(#hatch)"/>`;
 for(let lo=-10;lo<=50;lo+=10) s+=`<line x1="${PX(lo)}" y1="-500" x2="${PX(lo)}" y2="${MH+500}" stroke="#8a7a5a" stroke-width="1.2" opacity=".35"/>`;
 for(let la=30;la<=55;la+=5) s+=`<line x1="-500" y1="${PY(la)}" x2="${MW+500}" y2="${PY(la)}" stroke="#8a7a5a" stroke-width="1.2" opacity=".35"/>`;
 s+=`<path d="${LAND}" fill="#EBDDBB" stroke="#5b4630" stroke-width="${2.2*U}" stroke-linejoin="round"/>`;
 if(o.west>0) s+=`<g clip-path="url(#landc)"><path d="${poly(WEST)}" fill="#C8553D" opacity="${0.55*o.west}"/></g><path d="${poly(WEST)}" fill="none" stroke="#B3261E" stroke-width="${3*U}" stroke-dasharray="${10*U} ${8*U}" opacity="${o.west*0.7}"/>`;
 if(o.east>0) s+=`<g clip-path="url(#landc)"><path d="${poly(EAST)}" fill="#2F7F86" opacity="${0.55*o.east}"/></g><path d="${poly(EAST)}" fill="none" stroke="#1d5960" stroke-width="${3*U}" stroke-dasharray="${10*U} ${8*U}" opacity="${o.east*0.7}"/>`;
 (o.polys||[]).forEach(([P,col,op])=>{if(op>0.01) s+=`<g clip-path="url(#landc)"><path d="${poly(P)}" fill="${col}" opacity="${0.55*op}"/></g><path d="${poly(P)}" fill="none" stroke="#1d5960" stroke-width="${3*U}" stroke-dasharray="${10*U} ${8*U}" opacity="${op*0.7}"/>`;});
 if(o.labels){ if(o.west>0.5) s+=`<text x="${PX(2)}" y="${PY(40.5)}" class="maplab" style="font-size:${54*U}px;fill:#7a1f14" opacity="${o.west}">OCIDENTE</text>`; if(o.east>0.5||o.eLab) s+=`<text x="${PX(30)}" y="${PY(36.6)}" class="maplab" style="font-size:${54*U}px;fill:#13464b" opacity="${o.east}">ORIENTE</text>`;}
 if(o.route>0){const A=[PX(12.2),PY(44.42)],B=[PX(28.98),PY(41.01)]; const C1=[PX(18.5),PY(40.2)],C2=[PX(23.5),PY(37.0)];
  s+=`<path d="M${A[0]} ${A[1]} C${C1[0]} ${C1[1]} ${C2[0]} ${C2[1]} ${B[0]} ${B[1]}" stroke="#B3261E" stroke-width="${6*U}" fill="none" stroke-dasharray="18 12" pathLength="1000" style="stroke-dashoffset:${1000-1000*o.route}" stroke-linecap="round"/>`;
  const tt=o.route, bx=(1-tt)**3*A[0]+3*(1-tt)**2*tt*C1[0]+3*(1-tt)*tt*tt*C2[0]+tt**3*B[0], by=(1-tt)**3*A[1]+3*(1-tt)**2*tt*C1[1]+3*(1-tt)*tt*tt*C2[1]+tt**3*B[1];
  if(o.crown) s+=`<g transform="translate(${bx} ${by-30*U}) scale(${1.0*U})"><path d="M-22 10 L-26 -12 L-12 0 L0 -18 L12 0 L26 -12 L22 10 Z" fill="#F2C94C" stroke="#151210" stroke-width="3"/><rect x="-23" y="10" width="46" height="9" fill="#F2C94C" stroke="#151210" stroke-width="3"/></g>`;}
 for(const [id,k] of Object.entries(o.cities||{})){ if(k<=0) continue; const [lo,la,nm]=CITY[id]; const x=PX(lo),y=PY(la);
  s+=`<g transform="translate(${x} ${y}) scale(${back(k)*U})"><circle r="11" fill="#151210"/><circle r="5" fill="#F2C94C"/></g><text x="${x+18*U}" y="${y-14*U}" class="maplab" style="font-size:${34*U}px" opacity="${cl(k*2,0,1)}">${nm}</text>`;}
 return s+'</svg>';}

const MV={full:[0,0,MW,MH], italy:[PX(5),PY(49),PX(22)-PX(5),PY(36)-PY(49)], med:[PX(-4),PY(51),PX(40)-PX(-4),PY(30)-PY(51)], ital2:[PX(8),PY(47.5),PX(18)-PX(8),PY(40)-PY(47.5)]};
function lerpV(A,B,k){return A.map((v,i)=>v+(B[i]-v)*k);}




