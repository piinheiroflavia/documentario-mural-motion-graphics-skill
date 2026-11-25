# recorta moeda/medalha circular: acha o disco pelo contraste com o fundo cinza e aplica máscara circular com borda creme
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageOps, ImageEnhance, ImageFilter
src,out=sys.argv[1],sys.argv[2]; mode=sys.argv[3] if len(sys.argv)>3 else 'color'
im=Image.open(src).convert('RGB'); im.thumbnail((1200,1200)); a=np.asarray(im).astype(float)
bg=np.median(np.concatenate([a[:10].reshape(-1,3),a[-10:].reshape(-1,3),a[:,:10].reshape(-1,3),a[:,-10:].reshape(-1,3)]),axis=0)
diff=np.sqrt(((a-bg)**2).sum(2)); fg=diff>28
ys,xs=np.nonzero(fg); cx,cy=np.median(xs),np.median(ys)
r=np.percentile(np.sqrt((xs-cx)**2+(ys-cy)**2),97)
W,H=im.size; B=int(r*0.06)
if mode=='gray':
    g=ImageOps.autocontrast(ImageOps.grayscale(im),cutoff=1); im=ImageOps.colorize(g,black='#1d1a17',white='#f3ead8')
m=Image.new('L',(W,H),0); ImageDraw.Draw(m).ellipse((cx-r,cy-r,cx+r,cy+r),fill=255); m=m.filter(ImageFilter.GaussianBlur(1))
bm=Image.new('L',(W,H),0); ImageDraw.Draw(bm).ellipse((cx-r-B,cy-r-B,cx+r+B,cy+r+B),fill=255)
base=Image.new('RGBA',(W,H),(0,0,0,0)); base.paste(Image.new('RGBA',(W,H),(239,228,204,255)),(0,0),bm); base.paste(im.convert('RGBA'),(0,0),m)
base=base.crop(base.getbbox()); base.save(out); print(out,base.size)
