# gera "foto de papel rasgado": recorte, P&B com contraste, borda creme rasgada, sombra
import sys, random, math
from PIL import Image, ImageOps, ImageFilter, ImageDraw, ImageEnhance
src, out, crop = sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv)>3 else None
seed=int(sys.argv[4]) if len(sys.argv)>4 else 1
random.seed(seed)
im=Image.open(src).convert('L')
if crop:
    l,t,r,b=[float(v) for v in crop.split(',')]; W,H=im.size; im=im.crop((int(l*W),int(t*H),int(r*W),int(b*H)))
im=ImageOps.autocontrast(im,cutoff=2); im=ImageEnhance.Contrast(im).enhance(1.25)
# leve tom sépia/creme
im=ImageOps.colorize(im,black='#1d1a17',white='#f3ead8')
W,H=im.size; B=int(min(W,H)*0.045)
CW,CH=W+2*B,H+2*B
def torn(w,h,amp,step):
    pts=[]
    for x in range(0,w+step,step): pts.append((x,random.uniform(0,amp)))
    for y in range(0,h+step,step): pts.append((w-random.uniform(0,amp),y))
    for x in range(w,-step,-step): pts.append((x,h-random.uniform(0,amp)))
    for y in range(h,-step,-step): pts.append((random.uniform(0,amp),y))
    return pts
mask=Image.new('L',(CW,CH),0); ImageDraw.Draw(mask).polygon(torn(CW,CH,B*0.55,max(4,B//3)),fill=255)
paper=Image.new('RGB',(CW,CH),'#efe4cc')
# textura do papel
noise=Image.effect_noise((CW,CH),18).convert('L'); paper=Image.blend(paper,Image.merge('RGB',[noise]*3),0.06)
paper.paste(im,(B,B))
# rasgo interno irregular na foto (borda da foto também levemente irregular)
inner=Image.new('L',(CW,CH),0); ImageDraw.Draw(inner).polygon([(x+B*0.6,y+B*0.6) for x,y in torn(CW-int(B*1.2),CH-int(B*1.2),B*0.5,max(4,B//3))],fill=255)
base=Image.new('RGB',(CW,CH),'#efe4cc'); base=Image.blend(base,Image.merge('RGB',[noise]*3),0.06)
comp=Image.composite(paper,base,inner)
# grão
g=Image.effect_noise((CW,CH),25).convert('L'); comp=Image.blend(comp,Image.merge('RGB',[g]*3),0.05)
res=comp.convert('RGBA'); res.putalpha(mask)
res.thumbnail((1400,1400)); res.save(out)
print(out,res.size)
