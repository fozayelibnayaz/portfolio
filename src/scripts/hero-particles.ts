/* A progressive enhancement: the static particle portrait is visible before
   this loads, on reduced motion, or if canvas/image decoding isn't available. */
const canvas = document.querySelector<HTMLCanvasElement>('.hero__particles');
const hero = document.querySelector<HTMLElement>('.hero');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if (canvas && hero && !reduced.matches) {
  const context = canvas.getContext('2d');
  const source = canvas.dataset.source;
  if (context && source) {
    const image = new Image();
    image.onload = () => {
      const sample = document.createElement('canvas'); sample.width = 180; sample.height = 180;
      const sc = sample.getContext('2d', { willReadFrequently: true });
      if (!sc) return;
      sc.drawImage(image, 0, 0, 180, 180);
      const pixels = sc.getImageData(0, 0, 180, 180).data;
      type Point = { x:number; y:number; r:number; alpha:number; phase:number };
      const points: Point[] = [];
      for (let y=0; y<180; y++) for (let x=0; x<180; x++) {
        const i=(y*180+x)*4;
        if (pixels[i+3] < 100) continue;
        const light=(pixels[i]*.21+pixels[i+1]*.71+pixels[i+2]*.08)/255;
        if (Math.random() > Math.min(.98,.48+light*.65)) continue;
        points.push({x:x*4+(Math.random()-.5)*3, y:y*4+(Math.random()-.5)*3, r:(.5+light*1.3)*(.7+Math.random()*.6), alpha:.42+light*.56, phase:Math.random()*6.28});
      }
      let active=true, mouseX=-9999, mouseY=-9999, last=0, frame=0;
      const c=canvas, ctx=context;
      hero!.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const r=c.getBoundingClientRect(); mouseX=(e.clientX-r.left)*720/r.width; mouseY=(e.clientY-r.top)*720/r.height;
      }, {passive:true});
      hero!.addEventListener('pointerleave',()=>{mouseX=-9999;mouseY=-9999});
      const draw=(time:number)=>{
        if (!active || document.hidden || reduced.matches) { frame=0; return; }
        frame=requestAnimationFrame(draw);
        if(time-last<40) return; last=time;
        ctx.clearRect(0,0,720,720);
        for(const p of points){
          const dx=p.x-mouseX,dy=p.y-mouseY,dist=Math.hypot(dx,dy), force=dist<58?(1-dist/58)*11:0;
          const x=p.x+(dist ? dx/dist*force:0)+Math.sin(time*.00065+p.phase)*.7;
          const y=p.y+(dist ? dy/dist*force:0)+Math.cos(time*.0007+p.phase)*.7;
          ctx.fillStyle=`rgba(245,248,248,${p.alpha})`;ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();
        }
      };
      canvas.classList.add('is-live');
      frame=requestAnimationFrame(draw);
      const observer=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;if(active && !frame && !reduced.matches)frame=requestAnimationFrame(draw)}, {threshold:0});
      observer.observe(hero!);
      document.addEventListener('visibilitychange',()=>{if(!document.hidden && active && !frame && !reduced.matches)frame=requestAnimationFrame(draw)});
      reduced.addEventListener('change',()=>{c.classList.toggle('is-live',!reduced.matches);if(!reduced.matches && active && !frame)frame=requestAnimationFrame(draw)});
    };
    image.src=source;
  }
}
