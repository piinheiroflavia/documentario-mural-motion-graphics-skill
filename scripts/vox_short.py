"""Short vertical no ESTILO VOX (retícula, duotone, letras com imagem dentro, recortes em camadas, setas à mão, etiquetas laranja, jornal com marca-texto).
uso: python3 vox_short.py PROJETO cenas.json SAIDA.mp4
cenas.json = {"de":"c1a","ate":"c1e","cenas":[{"de":"c1a","ate":"c1b","pan":1,"camadas":[...]} ...]}  (ver SKILL.md)"""
import json,sys,os,math,subprocess
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); import perfil as PF
P,CF,OUT=sys.argv[1],sys.argv[2],sys.argv[3]; K=os.path.dirname(os.path.abspath(__file__))
tl=json.load(open(P+'/narr/timeline.json')); ids=[s['id'] for s in tl['seg']]; SS={s['id']:s for s in tl['seg']}
cfg=json.load(open(CF)); i=ids.index(cfg['ate']); fim=(SS[cfg['ate']]['b']+0.8 if i+1>=len(ids) else SS[ids[i+1]]['a']-0.3)+2.0; ini=SS[cfg['de']]['a']-0.4
cfg.update({'tl':tl,'ini':ini,'fim':fim})
html=open(K+'/../engine/vox_short.html').read().replace('__CFG__',json.dumps(cfg,ensure_ascii=False))
html=PF.aplicar(html,PF.carregar(P))
open(P+'/vox_short.html','w').write(html)
N=math.ceil((fim-ini)*30); F=P+'/vox_frames'; subprocess.run(['rm','-rf',F]); os.makedirs(F)
js=f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1920}}}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://{os.path.abspath(P)}/vox_short.html');await p.evaluate(()=>window.ready);await p.waitForTimeout(1200);
const a=+process.argv[2],z=+process.argv[3];for(let i=a;i<z;i++){{await p.evaluate(t=>render(t),i/30);await p.screenshot({{path:'{F}/f'+String(i).padStart(5,'0')+'.jpg',type:'jpeg',quality:90}});}}await b.close();}})()"""
open(P+'/_vox.js','w').write(js)
if len(sys.argv)>4 and sys.argv[4]=='previa':
    for t in [float(x) for x in sys.argv[5:]]: subprocess.run(['node',P+'/_vox.js',str(int(t*30)),str(int(t*30)+1)])
    sys.exit()
Q=(N+1)//2; ps=[subprocess.Popen(['node',P+'/_vox.js',str(a),str(b)]) for a,b in [(0,Q),(Q,N)]]; [p.wait() for p in ps]
d=fim-ini; subprocess.run(['ffmpeg','-loglevel','error','-y','-ss',str(ini),'-t',str(d),'-i',P+'/mix.wav','-af',f'afade=t=in:d=0.3,afade=t=out:st={d-1.2}:d=1.2,loudnorm=I=-14',P+'/vox.wav'],check=True)
subprocess.run(['ffmpeg','-loglevel','error','-y','-framerate','30','-i',F+'/f%05d.jpg','-i',P+'/vox.wav','-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest',OUT],check=True)
print('short estilo Vox pronto:',OUT,round(d,1),'s')
