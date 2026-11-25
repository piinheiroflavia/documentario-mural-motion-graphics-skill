"""Monta PROJETO/index.html = cabeçalho + utilidades + mapa + world.js do projeto + motor.
uso: python3 build.py PROJETO"""
import json, sys, os, shutil
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); import perfil as PF
P=sys.argv[1]; K=os.path.dirname(os.path.abspath(__file__))+'/..'
os.makedirs(P+'/lib',exist_ok=True)
for f in ['land50.js','topojson-client.min.js']:
    if not os.path.exists(P+'/lib/'+f): shutil.copy(K+'/lib/'+f,P+'/lib/'+f)
tl=json.load(open(P+'/narr/timeline.json'))
util='''const TL=%s; const S={}; TL.seg.forEach(s=>S[s.id]=s);
const $=id=>document.getElementById(id);
const cl=(x,a,b)=>Math.max(a,Math.min(b,x)); const ease=x=>{x=cl(x,0,1);return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;}; const eo=x=>1-Math.pow(1-cl(x,0,1),3);
const back=x=>{x=cl(x,0,1);const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);};
const a=id=>{if(!S[id]) throw new Error('id de narração inexistente: '+id); return S[id].a;};
function aspectFix(V,ar){let [vx,vy,vw,vh]=V; if(vw/vh>ar){const nh=vw/ar; vy-=(nh-vh)/2; vh=nh;} else {const nw=vh*ar; vx-=(nw-vw)/2; vw=nw;} return [vx,vy,vw,vh];}
const IMG='A/';
'''%json.dumps(tl,ensure_ascii=False)
html=open(K+'/engine/page_head.html').read()+'<script>\n'+util+open(K+'/engine/map.js').read()+'\n'+open(K+'/engine/engine.js').read()+'\n'+open(P+'/world.js').read()+'\nconst END=TL.end;\nwindow.ready=Promise.all([loadMap(),preload(),document.fonts.ready]).then(()=>{build(); window.render=render; render(0); return 1;});\n</script></body></html>'
html=PF.aplicar(html,PF.carregar(P))
open(P+'/index.html','w').write(html); print('ok',P+'/index.html')
