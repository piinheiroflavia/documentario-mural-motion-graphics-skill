"""Gera PROJETO/world.js automaticamente a partir de PROJETO/plano.json (+ narr/timeline.json e imagens em A/).
uso: python3 gerar_mural.py PROJETO
Depois: build.py → render.js (prévia) → ajustes finos direto no world.js, se precisar."""
import json, sys, os, math
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); import perfil as PF
from PIL import Image
P=sys.argv[1]; PERFIL=PF.carregar(P); TX=PERFIL['textos']; plano=json.load(open(P+'/plano.json')); tl=json.load(open(P+'/narr/timeline.json'))
T={s['id']:s for s in tl['seg']}; ids=[s['id'] for s in tl['seg']]
def sz(src):
    try: w,h=Image.open(P+'/A/'+src).size; return w/h
    except Exception: return 1.4
CITY={'roma':[12.5,41.9],'ravena':[12.2,44.42],'const':[28.98,41.01]}
CITY.update({k:v[:2] for k,v in plano.get('cidades',{}).items()})
TEMA=plano.get('tema',PERFIL.get('tema_padrao','cortica')); mats_cycle=plano.get('superficies',['manu','grid','dark'])
W=[]; CAM=[]; MATS=[]; STR=[]; LOC=[]; SAB=[]; KW=[]; CHS=[]; TLB=[]; NH=[]; MAPS={}
BW,BH,GAP=2100,1200,500; COLS=5
def nxt(i): return ids[ids.index(i)+1] if ids.index(i)+1<len(ids) else None
def js(o): return json.dumps(o,ensure_ascii=False)
def endt(i): n=nxt(i); return f"a('{n}')" if n else "TL.end+1"
slot=0; last_pin=None; mi=0
for tr in plano['trechos']:
    i=tr['id']; tipo=tr.get('tipo','normal'); col=slot%COLS; row=slot//COLS
    x0=col*(BW+GAP)+(row%2)*300; y0=row*(BH+GAP); slot+=1
    at=f"a('{i}')"
    if tr.get('ano') is not None or tr.get('anos'):
        o={'cur':[[0,tr['ano']]]} if tr.get('ano') is not None else {'cur':tr['anos']}
        for kk in ['marks','fill','band']:
            if tr.get(kk): o[kk]=tr[kk]
        TLB.append([i,o])
    if tipo=='vinheta': TLB.append([i,{'noTL':1}])
    if tipo=='capitulo':
        CHS.append([i,tr['n'],tr['titulo']])
        W.append({'k':'img','src':tr['fundo'],'x':x0+150,'y':y0,'w':1500,'at':f"{at}-1.0",'dim':1})
        W.append({'k':'chap','x':x0+900,'y':y0+380,'at':f"{at}-0.4",'n':tr['n'],'t':tr['titulo']})
        hh=1500/sz(tr['fundo'])
        CAM+= [[f"{at}+0.3",x0+900,y0+hh/2-40,0.95],[f"{endt(i)}-0.9",x0+910,y0+hh/2-40,1.02]]
        MATS.append([x0+80,y0-90,x0+1720,y0+hh+90,'dark',0]); last_pin=None; continue
    if tipo=='mapa':
        m='m%d'%mi; mi+=1; mw,mh=2600,1462
        st={'cities':{c:f"cl((t-({at}+{0.8+0.5*k}))/0.4,0,1)" for k,c in enumerate(tr.get('cidades',[]))}}
        MAPS[m]={'x':x0,'y':y0-130,'w':mw,'h':mh,'view':tr.get('vista','med'),'st':tr,'at':at}
        W.append({'k':'map','m':m})
        foco=tr.get('foco')
        CAM.append([f"{at}+0.6",x0+mw/2,y0-130+mh/2,0.72])
        if foco: CAM.append([f"{at}+3.6",'FOCO',[m,foco],1.4])
        CAM.append([f"{endt(i)}-1.0",x0+mw/2+40,y0-130+mh/2,0.76] if not foco else [f"{endt(i)}-1.0",'FOCO',[m,foco,-300,0],1.0])
        for k,ph in enumerate(tr.get('imagens',[])):
            c=CITY[ph.get('cidade',foco)]; W.append({'k':'pin','m':m,'src':ph['src'],'lon':c[0],'lat':c[1],'dx':ph.get('dx',-760 if k==0 else -860),'dy':ph.get('dy',-560 if k==0 else 140),'w':ph.get('w',540),'at':f"{at}+{2.6+1.4*k}",'id':ph.get('credito','')})
            STR.append([f"pin{len([w for w in W if w['k']=='pin'])-1}",[m,c[0],c[1]],f"{at}+{3.0+1.4*k}"])
        for n in tr.get('notas',[]):
            c=CITY[n.get('cidade',foco or tr['cidades'][0])]; W.append({'k':'anote','m':m,'html':n['html'],'lon':c[0],'lat':c[1],'dx':n.get('dx',-1200),'dy':n.get('dy',-560),'w':n.get('w',620),'at':f"{at}+{n.get('at',1.5)}"})
        if tr.get('anotacao'):
            c=CITY[foco]; NH.append({'html':tr['anotacao'],'at':f"{at}+2.6",'m':[m,c[0],c[1]],'dx':-520,'dy':-180})
        if tr.get('onde'): c=CITY[tr['onde']]; LOC.append([f"{at}+2.6",endt(i),c[0],c[1],tr.get('onde_nome',tr['onde'].title())])
        MATS.append([x0-60,y0-200,x0+mw+60,y0+mh-60,'grid',0.5]); last_pin=None
    else:
        # bloco normal: imagens à esquerda (até 3), textos à direita
        b0=len(W); imgs=tr.get('imagens',[]); notes=tr.get('notas',[]); x=x0+60; y=y0+60; first=None; prev=None
        widths={1:[1000],2:[620,560],3:[560,420,420]}.get(len(imgs),[])
        if tipo in ('titulo','recap','pergunta','vinheta','citacao','jornal','arvore','fluxo','calendario','colunas'): widths=[min(w,700) for w in widths]
        maxh=0
        for k,ph in enumerate(imgs):
            w=ph.get('w',widths[k] if k<len(widths) else 420); h=w/sz(ph['src'])
            if len(imgs)==3 and k>0: xx=x0+60+widths[0]+60; yy=y0+60+(k-1)*(h+90)
            else: xx=x; yy=y+(k%2)*40
            name=f"{i}_img{k}"; e={'k':'img','name':name,'src':ph['src'],'x':xx,'y':yy,'w':w,'at':f"{at}+{(-0.6 if k==0 else 0.6+1.4*k)}",'rot':ph.get('rot',[-2,3,-3][k%3]),'id':ph.get('credito','')}
            for kk in ['reveal','polaroid','fg','depth']:
                if kk in ph: e[kk]=ph[kk]
            W.append(e); x=xx+w+70; maxh=max(maxh,yy-y0+h)
            for q in ph.get('quem',[]): W.append({'k':'lbl','ref':name,'cx':q['cx'],'cy':q['cy'],'txt':q['txt'],'dx':q.get('dx',-40),'dy':q.get('dy',-140),'at':f"{at}+{q.get('at',1.5)}"})
            if prev: STR.append([prev,name,f"{at}+{1.0+1.4*k}"])
            prev=name; first=first or name
        tx=x if imgs else x0+80; ty=y0+(200 if imgs else 80)
        if tipo=='titulo':
            W.append({'k':'tag','html':tr.get('tag',''),'x':x0+80,'y':y0+120,'at':f"{at}+0.2"})
            W.append({'k':'ttl','html':tr['titulo'],'x':x0+80,'y':y0+180,'at':f"{at}+0.4",'size':100})
            if imgs: # imagem à direita do título
                for e in W[-2-len(imgs)-sum(len(p.get('quem',[])) for p in imgs):-2]:
                    if e['k']=='img': e['x']+=1000
            maxh=max(maxh,520)
        elif tipo=='agenda':
            W.append({'k':'agenda','name':f"{i}_txt0",'aw':640,'ah':10,'x':tx,'y':ty,'at':f"{at}+0.3",'items':tr['itens']}); maxh=max(maxh,560)
            if prev: STR.append([prev,f"{i}_txt0",f"{at}+1.6"])
        elif tipo=='recap':
            W.append({'k':'recap','name':f"{i}_txt0",'x':x0+80,'y':y0+60,'at':f"{at}-0.2",'title':tr.get('titulo',TX['recapitulando']),'items':tr['itens'],'gap':tr.get('gap',2.6)})
            xr=x0+1160
            for e in W:
                if e.get('name','').startswith(i+'_img'): e['x']=xr; e['y']=y0+60+(int(e['name'][-1]))*40; xr+=e['w']*0.75
            maxh=max(maxh,620)
        elif tipo=='citacao':
            W.append({'k':'quote','x':tx,'y':ty,'w':1300 if not imgs else 1100,'at':f"{at}+0.2",'latin':tr['original'],'pt':tr['traducao'],'ref':tr['ref']}); maxh=max(maxh,560)
        elif tipo=='jornal':
            W.append({'k':'jornal','name':f"{i}_txt0",'x':tx,'y':ty,'w':980,'at':f"{at}+0.2",'nome':tr.get('nome','GAZETA'),'data':tr.get('data',''),'titulo':tr['titulo'],'texto':tr['texto'],'id':tr.get('credito','')}); maxh=max(maxh,700)
        elif tipo=='arvore': W.append({'k':'tree','x':tx,'y':ty,'at':f"{at}-0.2"}); maxh=max(maxh,560)
        elif tipo=='fluxo': W.append({'k':'flow','x':tx,'y':ty-40,'at':f"{at}+0.4",'steps':tr['passos']}); maxh=max(maxh,720)
        elif tipo=='calendario': W.append({'k':'cal','x':tx,'y':ty,'at':f"{at}+1.0",'months':tr['meses'],'sc':0.75}); maxh=max(maxh,420)
        elif tipo=='colunas':
            for k,c in enumerate(tr['colunas']): W.append({'k':'col','x':tx+k*820,'y':ty,'w':760,'at':f"{at}+{0.2+0.3*k}",'head':c['titulo'],'color':c.get('cor','#B3261E' if k==0 else '#2F7F86'),'items':c['itens'],'who':c.get('quem',''),'static':c.get('fixo',0)})
            maxh=max(maxh,560)
        elif tipo=='pergunta':
            W.append({'k':'bigq','html':tr['pergunta'],'x':x0+100,'y':y0+120,'at':f"{at}+0.2"}); W.append({'k':'cta','x':x0+100,'y':y0+620,'at':f"{at}+2.0",'html':'<b>'+TX['comente']+'</b>'})
            for e in W:
                if e.get('name','').startswith(i+'_img'): e['dim']=1; e['x']=x0; e['y']=y0; e['w']=1500
            maxh=900
        elif tipo=='vinheta':
            img=plano.get('vinheta_imagem',PERFIL['vinheta'].get('imagem'))
            if img: W.append({'k':'img','src':img,'x':x0+1150,'y':y0+0,'w':300,'at':f"{at}-0.2",'rot':-2,'depth':False})
            W.append({'k':'ttl','html':PERFIL['canal']['nome'],'x':x0+80,'y':y0+80,'at':f"{at}-0.1",'size':120})
            W.append({'k':'tag','html':PERFIL['canal']['handle'],'x':x0+86,'y':y0+230,'at':f"{at}+0.2"})
            for k,(ic,txt) in enumerate(PERFIL['vinheta']['itens'][:3]):
                W.append({'k':'note','html':f'<span style="font-size:44px">{ic}</span> <b style="font-size:40px">{txt}</b>','x':x0+80,'y':y0+310+k*130,'w':620 if len(txt)<24 else 900,'at':f"{at}+{[0.9,2.0,3.6][k]}"})
            maxh=760
        ny=ty
        for k,n in enumerate(notes):
            name=f"{i}_n{k}"; e={'k':'note','name':name,'html':n['html'] if isinstance(n,dict) else n,'x':tx,'y':ny,'w':(n.get('w',680) if isinstance(n,dict) else 680),'at':f"{at}+{(n.get('at',0.8+1.6*k) if isinstance(n,dict) else 0.8+1.6*k)}"}
            if isinstance(n,dict) and n.get('ideia'): e['html']='<div class="h">'+TX['para_ter_ideia']+'</div>'+e['html']
            W.append(e); ny+=240
            if prev and k==0: STR.append([prev,name,f"{at}+1.4"])
        if tr.get('marca'): W.append({'k':'mk','html':tr['marca'],'x':tx,'y':max(ny,y0+maxh+20),'at':f"{at}+1.8",'color':'#B3261E'})
        DW={'agenda':640,'recap':1000,'tree':1000,'flow':960,'cal':720,'bigq':1300,'ttl':950,'tag':420,'mk':700,'cta':900}
        DH={'agenda':520,'recap':420,'tree':480,'flow':690,'cal':360,'bigq':420,'ttl':230,'tag':50,'mk':80,'cta':110,'note':200,'quote':420,'jornal':640,'col':420}
        bx0,by0,bx1,by1=1e9,1e9,-1e9,-1e9
        for e in W[b0:]:
            if e['k'] in ('lbl',): continue
            ex,ey=e.get('x',x0),e.get('y',y0); ew=e.get('w',DW.get(e['k'],600)); eh=(e['w']/sz(e['src'])+40 if e['k']=='img' else DH.get(e['k'],200))
            if e['k']=='img' and e.get('polaroid'): ew+=44; eh+=118
            bx0,by0,bx1,by1=min(bx0,ex),min(by0,ey),max(bx1,ex+ew),max(by1,ey+eh)
        if bx0>1e8: bx0,by0,bx1,by1=x0,y0,x0+1500,y0+800
        cw,ch=bx1-bx0,by1-by0
        z=max(0.68,min(1.12,1800/(cw+160),860/(ch+80)))
        CAM+= [[f"{at}+0.5",(bx0+bx1)/2,(by0+by1)/2+10,z],[f"{endt(i)}-0.9",(bx0+bx1)/2+30,(by0+by1)/2+10,z*1.04]]
        x0m,y0m=bx0-80,by0-80; cw+=160; ch+=160
        if tipo!='pergunta': MATS.append([x0m,y0m,x0m+cw,y0m+ch,mats_cycle[(slot)%len(mats_cycle)],[-1,0.8,-0.6,1.2][slot%4]])
        if last_pin and first: STR.append([last_pin,first,f"{at}+0.4"])
        last_pin=prev or last_pin
    if tr.get('onde') and tipo!='mapa': c=CITY[tr['onde']]; LOC.append([f"{at}-0.4",endt(i),c[0],c[1],tr.get('onde_nome',tr['onde'].title())])
    if tr.get('sabia'): SAB.append([f"{at}+1.0",f"{endt(i)}-0.3",tr['sabia']])
    if tr.get('palavra'): KW.append([f"{at}+0.8",f"{endt(i)}-0.3",tr['palavra'][0],tr['palavra'][1]])
if not TLB: TLB.append([plano['trechos'][0]['id'],{'cur':[[0,plano.get('ano',2000)]]}])
# ---- escreve world.js
def expr(v): return v if isinstance(v,str) and ("a('" in v or 'TL.' in v) else js(v)
def obj(e):
    return '{'+','.join(f"{k}:{expr(v) if k=='at' else js(v)}" for k,v in e.items())+'}'
NOMES={'roma':'Roma','ravena':'Ravena','const':'Constantinopla'}; NOMES.update({k:v[2] for k,v in plano.get('cidades',{}).items()})
out=[f"const TEMA={js(TEMA)};","Object.assign(CITY,"+js({k:[v[0],v[1],NOMES.get(k,k.title())] for k,v in CITY.items()})+");"]
ms=[]
for m,M in MAPS.items():
    tr=M['st']; at=M['at']; cities=','.join(f"{c}:cl((t-({at}+{0.8+0.5*k}))/0.4,0,1)" for k,c in enumerate(tr.get('cidades',[])))
    route=''
    if tr.get('rota'): route=f",route:ease((t-({at}+{tr.get('rota_at',2.0)}))/3.0),crown:{js(bool(tr.get('coroa')))}"
    extra=''
    if tr.get('regioes'): extra+=f",west:cl((t-({at}+2.5))/1,0,1)*0.9,east:cl((t-({at}+3.2))/1,0,1),labels:1"
    ms.append(f"{m}:{{x:{M['x']},y:{M['y']},w:{M['w']},h:{M['h']},view:{js(M['view'])},state:t=>({{cities:{{{cities}}}{route}{extra}}})}}")
out.append("const MAPS={"+",\n ".join(ms)+"};")
out.append("const W=[\n "+",\n ".join(obj(e) for e in W)+"];")
ck=[]
for k in CAM:
    if k[1]=='FOCO':
        f=k[2]; m=f[0]; c=f[1]; dx=f[2] if len(f)>2 else 60; dy=f[3] if len(f)>3 else 40
        ck.append(f"[{k[0]},mapWorldOf('{m}',CITY.{c}[0],CITY.{c}[1])[0]+{dx},mapWorldOf('{m}',CITY.{c}[0],CITY.{c}[1])[1]+{dy},{k[3]}]")
    else: ck.append(f"[{k[0]},{k[1]:.0f},{k[2]:.0f},{k[3]:.3f}]")
ck.sort(key=lambda s:0)
out.append("function camKeys(){setCam([[0,"+ck[0].split(',',1)[1].rsplit(',',0)[0]+"," if False else "function camKeys(){const K=["+",\n ".join(ck)+"]; K.unshift([0,K[0][1],K[0][2],K[0][3]]); setCam(K.sort((p,q)=>p[0]-q[0]));}")
def lst(name,L): out.append(f"const {name}=["+",".join('['+','.join(expr(v) if isinstance(v,str) and ("a('" in v or 'TL.' in v) else js(v) for v in r)+']' for r in L)+"];")
lst('LOCATOR',LOC); lst('SABIA',SAB); lst('KW',KW)
out.append("const CHS=["+",".join(f"[{js(c[0])},{js(c[1])},{js(c[2])}]" for c in CHS)+(",['%s',null,null]"%plano['fim_capitulos'] if plano.get('fim_capitulos') else '')+"];")
out.append("const TLB=["+",".join(f"[{js(i)},{js(o)}]" for i,o in TLB)+"];")
lst('STRINGS',STR)
out.append("const NOTES_HAND=["+",".join('{'+f"html:{js(n['html'])},at:{n['at']},m:{js(n['m'])},dx:{n['dx']},dy:{n['dy']}"+'}' for n in NH)+"];")
out.append("const MATS="+js([[round(v,1) if isinstance(v,(int,float)) else v for v in m] for m in MATS])+";")
open(P+'/world.js','w').write('\n'.join(out)); print('world.js gerado:',len(W),'elementos,',len(CAM),'chaves de câmera')
