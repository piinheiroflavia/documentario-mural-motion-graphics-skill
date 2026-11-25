"""Baixa e trata as imagens do exemplo (todas em domínio público: The Met Open Access e Library of Congress).
uso: python3 exemplo/baixar_imagens.py   (cria exemplo/A/)"""
import json, os, sys, subprocess, urllib.request
H=os.path.dirname(os.path.abspath(__file__)); A=H+'/A'; R=H+'/_baixados'; SC=H+'/../scripts'
os.makedirs(A,exist_ok=True); os.makedirs(R,exist_ok=True)
UA={'User-Agent':'Mozilla/5.0 (documentario-mural-motion-graphics)'}
def get(url,dest):
    if os.path.exists(dest): return
    with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=180) as r, open(dest,'wb') as f: f.write(r.read())
def met(obj,dest):
    d=json.load(urllib.request.urlopen(urllib.request.Request(f'https://collectionapi.metmuseum.org/public/collection/v1/objects/{obj}',headers=UA),timeout=60))
    assert d.get('isPublicDomain'), f'objeto {obj} não está em domínio público'
    get(d['primaryImage'],dest)
loc=lambda path,dest: get(f'https://tile.loc.gov/storage-services/service/pnp/{path}v.jpg',dest)
# (nome, origem, tratamento, recorte)
met(360270,R+'/colosseo.jpg'); met(256774,R+'/inscr2.jpg'); met(367767,R+'/soldiers.jpg'); met(248494,R+'/relief.jpg'); met(252884,R+'/constantino.jpg'); met(247993,R+'/augusto.jpg')
loc('ppmsca/52600/52669',R+'/traiano.jpg'); loc('pcrd/1b00000/1b09000/1b09400/1b09493',R+'/palazzo.jpg'); loc('pcrd/1b00000/1b09000/1b09500/1b09534',R+'/pineta.jpg')
loc('pcrd/1b00000/1b09000/1b09400/1b09494',R+'/apollinare.jpg'); loc('ppmsc/06000/06081',R+'/golden.jpg'); loc('ppmsca/03000/03035',R+'/sophia.jpg')
get('https://tile.loc.gov/image-services/iiif/service:gmd:gmd7:g7420:g7420:ct003757/full/pct:60/0/default.jpg',R+'/map1725.jpg')
from PIL import Image; Image.MAX_IMAGE_PIXELS=None
if not os.path.exists(R+'/map1725_const.jpg'): Image.open(R+'/map1725.jpg').crop((150,1950,1750,3050)).save(R+'/map1725_const.jpg')
py=lambda *a: subprocess.run([sys.executable,'-I',*a],check=True)
for n,crop,seed in [('colosseo','0.04,0.14,0.96,0.86',3),('traiano','0.02,0.02,0.98,0.95',38),('pineta','0.03,0.04,0.97,0.86',16),('golden','0,0,1,0.9',14),('sophia','0,0,1,0.95',12),('soldiers','0.01,0.01,0.99,0.99',31),('inscr2','0.02,0.05,0.98,0.95',34)]:
    py(SC+'/paper.py',f'{R}/{n}.jpg',f'{A}/{n}.png',crop,str(seed))
for n,crop,seed in [('palazzo','0.02,0.03,0.98,0.97',15),('apollinare','0.03,0.04,0.97,0.96',39),('relief','0.08,0.04,0.92,0.96',41),('map1725_const','0,0,1,1',21)]:
    py(SC+'/paper_color.py',f'{R}/{n}.jpg',f'{A}/{"map1725c" if n.startswith("map") else n}.png',crop,str(seed))
py(SC+'/cutout.py',R+'/constantino.jpg',A+'/constantino.png')
subprocess.run([sys.executable,'-I',SC+'/cutout.py',R+'/augusto.jpg',A+'/augusto.png'],check=True,env={**os.environ,'DARK':'75'})
for n in ['pineta','palazzo','golden','sophia','soldiers','apollinare','map1725_const','colosseo']:
    Image.open(f'{R}/{n}.jpg').convert('RGB').save(f'{A}/raw_{n}.jpg',quality=90)
print('imagens prontas em',A)
