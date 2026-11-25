"""Trilha calma (acordes suaves) + toque nos capítulos + narração. Sem som nas imagens.
uso: python3 mix.py PROJETO"""
import json, sys, numpy as np, soundfile as sf
P=sys.argv[1]; SR=44100; tl=json.load(open(P+'/narr/timeline.json')); END=tl['end']; N=int(END*SR)+SR; t=np.arange(N)/SR
ch=[[220,261.6,329.6],[174.6,220,261.6],[130.8,164.8,196],[196,246.9,293.7]]; mus=np.zeros(N); L=4.0
for i in range(int(END/L)+1):
    f=ch[i%4]; a=int(i*L*SR); b=min(N,int((i+1)*L*SR)+SR); tt=np.arange(b-a)/SR; e=np.minimum(1,tt/1.2)*np.exp(-tt/5)
    for fr in f: mus[a:b]+=0.020*np.sin(2*np.pi*fr*tt)*e+0.007*np.sin(2*np.pi*fr*2*tt)*e
    tp=np.arange(min(b-a,int(2*SR)))/SR; mus[a:a+len(tp)]+=0.03*np.sin(2*np.pi*f[2]*2*tp)*np.exp(-3*tp)
mus+=0.025*np.sin(2*np.pi*55*t)*(0.6+0.4*np.sin(2*np.pi*0.05*t)); mus*=np.clip(t/2,0,1)*np.clip((END-t)/3,0,1); mix=mus.copy()
t2=np.arange(int(1.5*SR))/SR; chime=(np.sin(2*np.pi*523.3*t2)+0.6*np.sin(2*np.pi*784*t2)+0.4*np.sin(2*np.pi*1046.5*t2))*np.exp(-2.2*t2)*0.05
for s in tl['seg']:
    if s['id'][0]=='C' or s['id']=='fim': i=int((s['a']-0.3)*SR); mix[i:i+len(chime)]+=chime[:max(0,min(len(chime),N-i))]
    v,sr=sf.read(f"{P}/narr/{s['id']}.wav"); x=np.arange(0,len(v),sr/SR); v=np.interp(x,np.arange(len(v)),v); i=int(s['a']*SR); mix[i:i+len(v)]+=v[:N-i]*1.35
sf.write(P+'/mix.wav',np.stack([np.clip(mix,-.98,.98)]*2,1),SR); print('ok',END)
