import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageEnhance, ImageDraw
src,out=sys.argv[1],sys.argv[2]
im=Image.open(src).convert('RGB'); im.thumbnail((1400,1400)); a=np.asarray(im).astype(float)
mx=a.max(2); mn=a.min(2); sat=(mx-mn)/np.maximum(mx,1)
import os
TH=float(os.environ.get('TH','0.12'))
bgish=(sat<TH)&(mx>float(os.environ.get('MINV','40')))
if os.environ.get('DARK'): bgish=(mx<float(os.environ.get('DARK')))
m=Image.fromarray(((~bgish)*255).astype('uint8'))
m=m.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))  # abertura
m=m.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))  # fechamento
# fundo = conectado às bordas (flood fill de 0 a partir dos cantos marcando 128)
W,H=m.size
for p in [(0,0),(W-1,0),(0,H-1),(W-1,H-1),(W//2,0),(0,H//2),(W-1,H//2)]:
    if m.getpixel(p)==0: ImageDraw.floodfill(m,p,128)
arr=np.asarray(m); fg=arr!=128
fgm=Image.fromarray((fg*255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
g=ImageOps.grayscale(im); g=ImageOps.autocontrast(g,cutoff=1); g=ImageEnhance.Contrast(g).enhance(1.3)
g=ImageOps.colorize(g,black='#1d1a17',white='#f3ead8')
bm=Image.fromarray((fg*255).astype('uint8')).filter(ImageFilter.MaxFilter(27)).filter(ImageFilter.GaussianBlur(1))
base=Image.new('RGBA',im.size,(0,0,0,0)); base.paste(Image.new('RGBA',im.size,(239,228,204,255)),(0,0),bm)
base.paste(g.convert('RGBA'),(0,0),fgm)
base=base.crop(base.getbbox()); base.save(out); print(out,base.size)
