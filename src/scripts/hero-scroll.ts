/* Native, reversible scroll: the image breaks into woven horizontal weft, then
   the map and introduction are drawn in. Never intercept the visitor's wheel. */
const hero = document.querySelector<HTMLElement>('.hero');
const wide = matchMedia('(min-width: 1024px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
if (hero) {
  const frame = hero.querySelector<HTMLElement>('.hero__portrait');
  const image = frame?.querySelector<HTMLImageElement>('img');
  const canvas = frame?.querySelector<HTMLCanvasElement>('.hero__unweave');
  const ctx = canvas?.getContext('2d');
  const buffer = document.createElement('canvas');
  const bctx = buffer.getContext('2d');
  let ready = false, queued = false, lastWidth = 0, lastHeight = 0;
  const clamp = (n:number) => Math.max(0, Math.min(1, n));

  const prepare = () => {
    if (!frame || !image?.complete || !image.naturalWidth || !canvas || !ctx || !bctx) return false;
    const rect = frame.getBoundingClientRect(), imgRect = image.getBoundingClientRect();
    const w = Math.round(rect.width), h = Math.round(rect.height);
    if (!w || !h) return false;
    canvas.width = buffer.width = w; canvas.height = buffer.height = h;
    lastWidth = w; lastHeight = h;
    // The same colour and weave are baked into this offscreen render so the
    // static image and the animated canvas join without a visible flash.
    bctx.fillStyle = '#e1e8f5'; bctx.fillRect(0, 0, w, h);
    bctx.fillStyle = 'rgba(148,181,251,.72)';
    for (let y = 1; y < h; y += 3) for (let x = 1; x < w; x += 3) bctx.fillRect(x, y, 1, 1);
    bctx.drawImage(image, imgRect.left - rect.left, imgRect.top - rect.top, imgRect.width, imgRect.height);
    bctx.strokeStyle = 'rgba(235,242,255,.30)'; bctx.lineWidth = 1;
    bctx.beginPath(); for (let x = 0; x < w; x += 3) { bctx.moveTo(x+.5, 0); bctx.lineTo(x+.5, h); }
    for (let y = 0; y < h; y += 3) { bctx.moveTo(0, y+.5); bctx.lineTo(w, y+.5); } bctx.stroke();
    ready = true; return true;
  };
  const renderThreads = (progress:number) => {
    if (!frame || !canvas || !ctx) return;
    if (!ready || frame.clientWidth !== lastWidth || frame.clientHeight !== lastHeight) prepare();
    if (!ready) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const t = clamp((progress - .045) / .80);
    const edge = Math.max(0, Math.min(h, h * (1 - t * 1.12)));
    if (edge > 0) ctx.drawImage(buffer, 0, 0, w, edge, 0, 0, w, edge);
    // Alternating rows are pulled outward like threads from the fabric. The
    // displaced part is transparent, rather than a hard rectangle wipe.
    const fringe = Math.min(190, h * .29), step = 5;
    for (let y = Math.floor(edge); y < Math.min(h, edge + fringe); y += step) {
      const f = (y - edge) / fringe;
      const alpha = (1 - f) * (1 - clamp((t - .8) / .2));
      if (alpha <= 0) continue;
      const pull = Math.round((f * f * 0.23 + f * .08) * w);
      const half = Math.floor(w / 2), row = Math.min(3, h-y);
      ctx.globalAlpha = alpha;
      ctx.drawImage(buffer, 0, y, half, row, -pull, y, half, row);
      ctx.drawImage(buffer, half, y, w-half, row, half+pull, y, w-half, row);
    }
    ctx.globalAlpha = 1;
  };
  const update = () => {
    queued = false;
    if (!wide.matches || reduced.matches) {
      hero.classList.remove('is-unweaving', 'is-unwoven');
      for (const p of ['--hero-p','--hero-out','--hero-in','--hero-name','--hero-map','--hero-words','--hero-band']) hero.style.removeProperty(p);
      return;
    }
    const p = Math.max(0, Math.min(1.6, -hero.getBoundingClientRect().top / innerHeight));
    hero.style.setProperty('--hero-p', String(p));
    hero.style.setProperty('--hero-out', String(1-clamp(p/.32)));
    hero.style.setProperty('--hero-name', String(clamp(p/.59)));
    hero.style.setProperty('--hero-band', String(1-clamp(p/.18)));
    hero.style.setProperty('--hero-in', String(clamp((p-.36)/.19)));
    hero.style.setProperty('--hero-map', String(clamp((p-.42)/.6)));
    hero.style.setProperty('--hero-words', String(clamp((p-.55)/.56)));
    hero.classList.toggle('is-unwoven', p >= .98);
    const unweaving = p > .045 && p < .98;
    if (unweaving && (!ready ? prepare() : true)) {
      hero.classList.add('is-unweaving'); renderThreads(p);
    } else hero.classList.remove('is-unweaving');
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  image?.addEventListener('load', () => { ready = false; schedule(); });
  addEventListener('scroll', schedule, { passive:true });
  addEventListener('resize', () => {ready=false; schedule();}, { passive:true });
  reduced.addEventListener('change', schedule);
  schedule();
}
export {};
