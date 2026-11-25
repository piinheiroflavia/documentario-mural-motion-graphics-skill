"""Capa no estilo Vox a partir de um JSON de camadas. Longo: 1280x720 (exporta 1280x720 e 2560x1440). Short: 1080x1920.
uso: python3 capa_vox.py PROJETO capa.json SAIDA.png"""
import json,sys,os,subprocess
P,CF,OUT=sys.argv[1:4]; K=os.path.dirname(os.path.abspath(__file__)); cfg=json.load(open(CF))
html=open(K+'/../engine/capa_vox.html').read().replace('__CFG__',json.dumps(cfg,ensure_ascii=False)); open(P+'/_capa.html','w').write(html)
js=f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:{cfg['w']},height:{cfg['h']}}},deviceScaleFactor:{cfg.get('escala',2 if cfg['w']<1500 else 1)}}});
await p.goto('file://{os.path.abspath(P)}/_capa.html');await p.evaluate(()=>window.ready);await p.waitForTimeout(600);await p.screenshot({{path:'{os.path.abspath(OUT)}'}});await b.close();}})()"""
open(P+'/_capa.js','w').write(js); subprocess.run(['node',P+'/_capa.js'],check=True); print('capa:',OUT)
