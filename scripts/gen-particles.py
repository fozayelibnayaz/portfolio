#!/usr/bin/env python3
"""Optional portrait asset generator. Run from project root with Pillow, numpy
and opencv-python installed. The checked-in assets work without Python.
The GrabCut mask is calibrated to the supplied portrait in src/assets/avatar.jpg.
"""
import cv2, numpy as np
from PIL import Image, ImageDraw
import random
im=cv2.imread('src/assets/avatar.jpg'); im=cv2.resize(im,(640,640))
mask=np.full((640,640),cv2.GC_BGD,np.uint8)
# hand-drawn loose person boundary, mask GrabCut refines it
poly=np.array([[190,640],[0,640],[30,560],[90,450],[150,380],[205,350],[205,290],[197,250],[197,180],[202,112],[242,47],[316,25],[380,32],[420,71],[432,121],[427,173],[442,194],[425,251],[408,300],[390,333],[417,348],[500,371],[600,412],[640,466],[640,640]],np.int32)
cv2.fillPoly(mask,[poly],cv2.GC_PR_FGD)
cv2.ellipse(mask,(315,168),(78,120),0,0,360,cv2.GC_FGD,-1)
cv2.ellipse(mask,(360,480),(115,95),0,0,360,cv2.GC_FGD,-1)
bgd=np.zeros((1,65),np.float64); fgd=bgd.copy()
cv2.grabCut(im,mask,None,bgd,fgd,4,cv2.GC_INIT_WITH_MASK)
alpha=np.where((mask==2)|(mask==0),0,255).astype('uint8')
rgba=cv2.cvtColor(im,cv2.COLOR_BGR2RGBA); rgba[:,:,3]=alpha
Image.fromarray(rgba).save('public/img/portrait-cutout.webp', quality=85, method=6)
# Random, brightness-driven points, like reference rather than a halftone grid.
rng=random.Random(31); p=Image.fromarray(rgba).resize((360,360)); px=p.load(); out=Image.new('RGBA',(1080,1080)); draw=ImageDraw.Draw(out)
for y in range(2,359,2):
 for x in range(2,359,2):
  r,g,b,a=px[x,y]
  if a<100: continue
  lum=(r*.21+g*.71+b*.08)/255
  # Keep black clothes legible, but reduce any noise in the silhouette.
  if rng.random() > min(.98, .48+lum*.65): continue
  jx=rng.uniform(-2.6,2.6); jy=rng.uniform(-2.6,2.6)
  rad=(.7+1.95*lum)*rng.uniform(.60,1.30)
  opacity=int(100+155*lum)
  cx=x*3+jx; cy=y*3+jy
  draw.ellipse((cx-rad,cy-rad,cx+rad,cy+rad),fill=(245,248,248,opacity))
out.save('public/img/portrait-particles.png',optimize=True)
