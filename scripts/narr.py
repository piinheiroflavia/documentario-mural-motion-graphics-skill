"""Gera a narração (Kokoro, voz definida no perfil do canal) e o timeline.json a partir de roteiro.json.
uso: python3 narr.py PROJETO --kokoro PASTA_COM_MODELO [--speed 0.9]
roteiro.json = [{"id":"i1","txt":"legenda","say":"texto falado (opcional, números por extenso)"}, ...]
ids que começam com C (capítulo), R (recapitulação) ganham pausa maior depois."""
import json, os, sys, argparse, numpy as np, soundfile as sf
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); import perfil as PF
from kokoro_onnx import Kokoro
ap=argparse.ArgumentParser(); ap.add_argument('proj'); ap.add_argument('--kokoro',required=True); ap.add_argument('--speed',type=float,default=None); ap.add_argument('--only',default='')
A=ap.parse_args(); P=A.proj; VZ=PF.carregar(P)['voz']; SPEED=A.speed or VZ.get('velocidade',0.9); os.makedirs(P+'/narr',exist_ok=True)
seg=json.load(open(P+'/roteiro.json'))
k=Kokoro(A.kokoro+'/kokoro-v1.0.onnx',A.kokoro+'/voices-v1.0.bin')
t=0.6; out=[]
for s in seg:
    f=f"{P}/narr/{s['id']}.wav"
    if os.path.exists(f) and s['id'] not in A.only.split(','):
        a,sr=sf.read(f)
    else:
        a,sr=k.create(s.get('say') or s['txt'],voice=VZ['kokoro'],speed=SPEED,lang=VZ['lang']); i=np.where(np.abs(a)>0.01)[0]; a=a[max(0,i[0]-240):i[-1]+2400]; sf.write(f,a,sr)
    d=len(a)/sr; out.append({'id':s['id'],'a':round(t,3),'b':round(t+d,3),'txt':s['txt']}); t+=d+(0.9 if s['id'][0] in 'CR' else 0.55)
json.dump({'seg':out,'end':round(t+2.5,3)},open(P+'/narr/timeline.json','w'),ensure_ascii=False,indent=0)
print('duração total: %d min %02d s'%(int(t+2.5)//60,int(t+2.5)%60))
