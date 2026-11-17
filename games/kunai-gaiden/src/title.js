/* Kunai Gaiden: cinematic title screen.
   A dusk over a ninja village, painted by code: textured sky and clouds, sun shafts, misty ridges, a village whose windows
   light up, a ninja on a rooftop with his scarf in the wind, falling leaves with depth of field, embers, film grain,
   letterbox and a slow camera push. Static layers are painted once into offscreen canvases (freed when the game starts),
   the animation only composes them (30 fps), so the world can keep loading behind. The game's buttons are kept (same ids). */
(() => {
  const $ = s => document.querySelector(s);
  const FONT = document.createElement('link'); FONT.rel = 'stylesheet'; FONT.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Shippori+Mincho+B1:wght@800&display=swap'; document.head.appendChild(FONT);
  const CSS = `
  #k-cine{position:fixed;inset:0;z-index:19;width:100%;height:100%;display:none;background:#07060c}
  body.tcine #k-cine{display:block}
  html body.tcine #k-title{background:none!important;display:block!important;padding:0!important;overflow:hidden}
  html body.tcine #k-title[hidden]{display:none!important}
  body.tcine #k-title .box{position:absolute;inset:0;max-width:none;padding:0!important;margin:0;background:none!important;border:0!important;box-shadow:none!important;text-align:left;display:flex;flex-direction:column;justify-content:center;padding-left:clamp(22px,6vw,90px)!important;gap:4px;pointer-events:none}
  body.tcine #k-title .box::before,body.tcine #k-title .box::after{display:none!important}
  body.tcine #k-title .box>*{pointer-events:auto}
  body.tcine #k-title .rod,body.tcine #k-title .vt,body.tcine #k-title .leaf,body.tcine #k-title .box>p:not(.help){display:none!important}
  body.tcine #k-title h1{position:relative;margin:0;font:800 clamp(26px,min(6.4vw,11.5vh),88px)/1 'Cinzel',serif!important;letter-spacing:.04em;color:transparent!important;background:linear-gradient(180deg,#fff6dc 0%,#f2d38a 45%,#c7893a 100%);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 2px 0 rgba(0,0,0,.55)) drop-shadow(0 0 24px rgba(255,170,80,.35));max-width:15ch;text-wrap:balance;opacity:0;transform:translateY(14px);transition:opacity 1.6s ease .9s,transform 1.6s ease .9s}
  body.tcine #k-title h1 em{display:block;margin-top:12px!important;font:800 clamp(12px,1.7vw,19px)/1.2 'Shippori Mincho B1',serif!important;letter-spacing:.32em!important;-webkit-text-fill-color:#f6ebd3;color:#f6ebd3!important;text-transform:none;opacity:.9}
  body.tcine.tin #k-title h1{opacity:1;transform:none}
  body.tcine #k-title .kj{position:absolute;left:clamp(10px,3vw,40px);top:50%;transform:translateY(-58%);font:800 clamp(140px,30vw,380px)/1 'Shippori Mincho B1',serif;color:rgba(255,190,110,.07);pointer-events:none;z-index:-1;opacity:0;transition:opacity 3s ease .4s}
  body.tcine.tin #k-title .kj{opacity:1}
  body.tcine #k-title .row{display:flex!important;flex-direction:column;align-items:flex-start;gap:8px!important;margin-top:clamp(14px,3.2vh,30px)!important;opacity:0;transform:translateY(10px);transition:opacity 1.2s ease 1.9s,transform 1.2s ease 1.9s}
  body.tcine.tin #k-title .row{opacity:1;transform:none}
  body.tcine #k-title .row #k-cont{order:-1}
  body.tcine #k-title .kbtn{all:unset;box-sizing:border-box;cursor:pointer;min-width:min(300px,62vw);min-height:44px;padding:10px 22px 10px 18px;border-radius:2px;font:600 clamp(12px,1.25vw,15px)/1.2 'Cinzel',serif!important;letter-spacing:.14em;text-transform:uppercase;color:#f6ebd3!important;background:linear-gradient(90deg,rgba(18,14,24,.72),rgba(18,14,24,.25))!important;border-left:2px solid rgba(232,181,74,.55)!important;box-shadow:none!important;text-shadow:0 1px 2px #000;transition:background .25s,border-color .25s,padding .25s,color .25s;-webkit-tap-highlight-color:transparent}
  body.tcine #k-title .kbtn:hover,body.tcine #k-title .kbtn:focus-visible{background:linear-gradient(90deg,rgba(224,71,47,.55),rgba(224,71,47,0))!important;border-left-color:#ffcf7a!important;padding-left:26px;outline:none}
  body.tcine #k-title .kbtn:disabled{opacity:.45;cursor:default}
  body.tcine #k-title #k-cont:not([hidden]){background:linear-gradient(90deg,rgba(224,71,47,.78),rgba(224,71,47,.12))!important;border-left-color:#ffcf7a!important}
  body.tcine #k-title .kbtn[hidden]{display:none!important}
  body.tcine #k-title #k-max{align-self:flex-start;width:auto!important;margin-top:6px!important;min-height:34px;font-size:clamp(10px,1vw,12px)!important;letter-spacing:.12em;opacity:.8!important;background:none!important;border-left-color:rgba(246,235,211,.25)!important;padding:6px 18px!important}
  body.tcine #k-title #k-max{opacity:0!important;transition:opacity 1.2s ease 2.3s}body.tcine.tin #k-title #k-max{opacity:.8!important}
  body.tcine #k-title .help#k-tload{position:fixed;left:clamp(22px,6vw,90px);top:calc(var(--lb,0px) + 10px);margin:0;font:600 11px 'M PLUS Rounded 1c',sans-serif!important;letter-spacing:.08em;color:rgba(246,235,211,.6)!important;display:flex;align-items:center;gap:8px}
  body.tcine #k-title .help#k-tload::before{content:'';width:7px;height:7px;border-radius:50%;background:#e8b54a;box-shadow:0 0 8px #e8b54a;animation:tpulse 1.2s ease-in-out infinite}
  body.tcine #k-title .foot{position:fixed;right:clamp(14px,3vw,40px);bottom:calc(var(--lb,0px) + 12px);font:600 10px 'M PLUS Rounded 1c',sans-serif;letter-spacing:.1em;color:rgba(246,235,211,.45);text-align:right;pointer-events:none}
  @keyframes tpulse{50%{opacity:.25}}
  @media (max-height:430px){body.tcine #k-title .kbtn{min-width:min(260px,50vw)}body.tcine #k-title h1 em{margin-top:6px!important}body.tcine #k-title .kbtn{min-height:38px;padding:7px 18px 7px 14px}body.tcine #k-title .row{gap:5px!important;margin-top:10px!important}}
  @media (prefers-reduced-motion:reduce){body.tcine #k-title h1,body.tcine #k-title .row,body.tcine #k-title .kj,body.tcine #k-title #k-max{transition:none}}`;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  /* ---------- noise ---------- */
  const hash = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const sm = t => t * t * (3 - 2 * t);
  function vnoise(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = sm(xf), v = sm(yf);
    const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  const fbm = (x, y, s, o) => { let v = 0, a = .5, f = 1; for (let i = 0; i < (o || 5); i++) { v += a * vnoise(x * f, y * f, s + i * 17); f *= 2.03; a *= .5; } return v; };
  let seedR = 7; const rnd = () => (seedR = (seedR * 16807) % 2147483647) / 2147483647;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; };

  /* ---------- the painted layers ---------- */
  let cv = null, g = null, W = 0, H = 0, L = null, running = false, t0 = 0, raf = 0, last = 0, mx = 0, my = 0, leaves = [], embers = [], LS = null;
  const SUN = [.7, .56];   // sun position (fraction of the frame)
  function paint() { seedR = 7;
    const w = W, h = H, Ly = {};
    // sky: night blue to embers, sun glow, big soft halo
    const sky = mk(w, h), q = sky.getContext('2d'); let gr = q.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0d0c22'); gr.addColorStop(.3, '#2b1d3f'); gr.addColorStop(.52, '#8a3a3a'); gr.addColorStop(.62, '#e0763a'); gr.addColorStop(.7, '#f5b25a'); gr.addColorStop(1, '#f7c779'); q.fillStyle = gr; q.fillRect(0, 0, w, h);
    const sx = SUN[0] * w, sy = SUN[1] * h; gr = q.createRadialGradient(sx, sy, 0, sx, sy, h * .9); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(.04, 'rgba(255,214,140,.95)'); gr.addColorStop(.12, 'rgba(255,160,80,.45)'); gr.addColorStop(.4, 'rgba(220,90,60,.18)'); gr.addColorStop(1, 'rgba(120,40,60,0)'); q.fillStyle = gr; q.fillRect(0, 0, w, h);
    q.fillStyle = '#fff8e6'; q.beginPath(); q.arc(sx, sy, h * .045, 0, 7); q.fill();
    // stars at the top
    for (let i = 0; i < 140; i++) { const x = rnd() * w, y = rnd() * h * .32, a = (1 - y / (h * .32)) * rnd() * .8; q.fillStyle = `rgba(255,250,235,${a})`; q.fillRect(x, y, rnd() < .1 ? 2 : 1, 1); }
    Ly.sky = sky;
    // clouds: fbm texture, lit underneath by the sun
    const cw = Math.ceil(w * 1.6), ch = Math.ceil(h * .5), cl = mk(cw / 3, ch / 3), cq = cl.getContext('2d'), id = cq.createImageData(cl.width, cl.height), D = id.data;
    for (let y = 0; y < cl.height; y++) for (let x = 0; x < cl.width; x++) { const nx = x / cl.width * 9, ny = y / cl.height * 3.2, n = fbm(nx, ny * 2.2, 3, 6), band = Math.sin(Math.PI * y / cl.height), a = Math.max(0, (n - .47) * 3.2) * band, k = (y * cl.width + x) * 4, lit = y / cl.height;
      D[k] = 255; D[k + 1] = 150 + 70 * (1 - lit); D[k + 2] = 120 + 60 * (1 - lit); D[k + 3] = Math.min(255, a * 200); }
    cq.putImageData(id, 0, 0); const clouds = mk(cw, ch), cq2 = clouds.getContext('2d'); cq2.imageSmoothingQuality = 'high'; cq2.drawImage(cl, 0, 0, cw, ch);
    cq2.globalCompositeOperation = 'source-atop'; gr = cq2.createLinearGradient(0, 0, 0, ch); gr.addColorStop(0, 'rgba(60,40,80,.85)'); gr.addColorStop(.6, 'rgba(160,70,70,.4)'); gr.addColorStop(1, 'rgba(255,190,120,.2)'); cq2.fillStyle = gr; cq2.fillRect(0, 0, cw, ch); Ly.clouds = clouds;
    // ridges: atmospheric perspective, textured
    const ridge = (base, amp, freq, seed, top, bot, tex) => { const c = mk(w, h), r = c.getContext('2d'); r.beginPath(); r.moveTo(0, h);
      for (let x = 0; x <= w; x += 4) { const n = fbm(x / w * freq, seed, seed, 6), sharp = Math.abs(fbm(x / w * freq * 2.3, seed + 3, seed + 9, 4) - .5) * 2; r.lineTo(x, base * h - (n * .8 + sharp * .35) * amp * h); }
      r.lineTo(w, h); r.closePath(); const gg = r.createLinearGradient(0, (base - amp) * h, 0, h); gg.addColorStop(0, top); gg.addColorStop(1, bot); r.fillStyle = gg; r.fill();
      if (tex) { r.globalCompositeOperation = 'source-atop'; for (let i = 0; i < w * h / 900 * tex; i++) { const x = rnd() * w, y = rnd() * h; r.fillStyle = rnd() < .5 ? 'rgba(255,220,180,.05)' : 'rgba(0,0,10,.07)'; r.fillRect(x, y, 2 + rnd() * 6, 1 + rnd() * 2); } }
      // sun rim on the crest
      r.globalCompositeOperation = 'source-atop'; const rim = r.createRadialGradient(sx, sy, 0, sx, sy, w * .45); rim.addColorStop(0, 'rgba(255,190,110,.35)'); rim.addColorStop(1, 'rgba(255,190,110,0)'); r.fillStyle = rim; r.fillRect(0, 0, w, h); return c; };
    Ly.r1 = ridge(.62, .2, 2.2, 11, '#9a5a6a', '#d78a62', .4); Ly.r2 = ridge(.68, .17, 3.1, 23, '#5e3a55', '#a8605a', .7); Ly.r3 = ridge(.74, .13, 4.4, 37, '#33243f', '#5e3a4a', 1);
    // mist strips
    const fogw = Math.ceil(w * 1.5), fogh = Math.ceil(h * .22), fl = mk(fogw / 4, fogh / 4), fq = fl.getContext('2d'), fid = fq.createImageData(fl.width, fl.height), F = fid.data;
    for (let y = 0; y < fl.height; y++) for (let x = 0; x < fl.width; x++) { const n = fbm(x / fl.width * 7, y / fl.height * 2, 51, 5), band = Math.sin(Math.PI * y / fl.height), k = (y * fl.width + x) * 4; F[k] = 255; F[k + 1] = 200; F[k + 2] = 170; F[k + 3] = Math.max(0, n - .35) * 2.2 * band * 255; }
    fq.putImageData(fid, 0, 0); const fog = mk(fogw, fogh); fog.getContext('2d').drawImage(fl, 0, 0, fogw, fogh); Ly.fog = fog;
    // the village: roofs, pagodas, a tower, trees; windows in a separate layer so they can flicker
    const vil = mk(w, h), v = vil.getContext('2d'), lit = mk(w, h), lq = lit.getContext('2d'), base = .8 * h, U = h / 900;
    const roof = (x, y, wd, hh, col, tiers) => { for (let t = 0; t < (tiers || 1); t++) { const ww = wd * (1 - t * .2), yy = y - t * hh * 1.25, xx = x + (wd - ww) / 2;
        v.fillStyle = col; v.fillRect(xx + ww * .12, yy, ww * .76, hh); v.beginPath(); v.moveTo(xx - ww * .14, yy + hh * .05); v.quadraticCurveTo(xx + ww * .5, yy - hh * .95, xx + ww * 1.14, yy + hh * .05); v.quadraticCurveTo(xx + ww * .5, yy - hh * .35, xx - ww * .14, yy + hh * .05); v.fill();
        v.beginPath(); v.moveTo(xx - ww * .14, yy + hh * .05); v.lineTo(xx - ww * .2, yy - hh * .1); v.lineTo(xx - ww * .05, yy - hh * .02); v.moveTo(xx + ww * 1.14, yy + hh * .05); v.lineTo(xx + ww * 1.2, yy - hh * .1); v.lineTo(xx + ww * 1.05, yy - hh * .02); v.fill();
        for (let k = 0; k < 4; k++) if (rnd() < .55) { const wx = xx + ww * (.2 + k * .17), wy = yy + hh * .4; lq.shadowColor = 'rgba(255,170,70,.9)'; lq.shadowBlur = 10 * U; lq.fillStyle = rnd() < .2 ? '#ffe2a4' : '#ffb35a'; lq.fillRect(wx, wy, ww * .07, hh * .3); } }
      // warm rim from the sun on the right edge of the roofs
      v.fillStyle = 'rgba(255,150,80,.18)'; v.fillRect(x + wd * .88, y - hh * .6, wd * .06, hh * .5); };
    // trees behind
    const tree = (x, y, r, col) => { v.fillStyle = col; for (let i = 0; i < 7; i++) { v.beginPath(); v.arc(x + (rnd() - .5) * r * 1.4, y - rnd() * r * .9, r * (.45 + rnd() * .4), 0, 7); v.fill(); } };
    for (let i = 0; i < 40; i++) tree(rnd() * w, base - 30 * U - rnd() * 40 * U, (24 + rnd() * 30) * U, '#22192e');
    // a tall cliff with a waterfall on the left
    v.fillStyle = '#251b31'; v.beginPath(); v.moveTo(0, base); v.lineTo(0, base - 330 * U); v.bezierCurveTo(60 * U, base - 360 * U, 150 * U, base - 340 * U, 230 * U, base - 300 * U); v.lineTo(300 * U, base - 140 * U); v.lineTo(340 * U, base); v.fill();
    const wf = v.createLinearGradient(0, base - 300 * U, 0, base); wf.addColorStop(0, 'rgba(200,180,200,.5)'); wf.addColorStop(1, 'rgba(255,220,200,.15)'); v.fillStyle = wf; v.fillRect(180 * U, base - 300 * U, 16 * U, 300 * U);
    // the rows of houses, pagodas, the tower
    const cols = ['#1c1528', '#21182e', '#191324'];
    for (let row = 0; row < 3; row++) { let x = -40 * U + rnd() * 30 * U; const yb = base - 6 * U + row * 26 * U;
      while (x < w + 40 * U) { const wd = (60 + rnd() * 70) * U, hh = (22 + rnd() * 16) * U; roof(x, yb - hh - row * 4 * U, wd, hh, cols[row], rnd() < .12 ? 3 : rnd() < .3 ? 2 : 1); x += wd * (.75 + rnd() * .4); } }
    roof(w * .44, base - 150 * U, 120 * U, 40 * U, '#181222', 5);   // the great pagoda
    roof(w * .24, base - 90 * U, 80 * U, 30 * U, '#1a1426', 3);
    v.fillStyle = '#141020'; v.fillRect(0, base + 70 * U, w, h);   // the ground under the village
    // lanterns strung across the street
    for (let s = 0; s < 3; s++) { const y0 = base + (20 + s * 18) * U, x0 = w * (.08 + s * .28), x1 = x0 + w * .22; v.strokeStyle = 'rgba(20,14,26,.9)'; v.lineWidth = 1.2 * U; v.beginPath(); v.moveTo(x0, y0); v.quadraticCurveTo((x0 + x1) / 2, y0 + 22 * U, x1, y0); v.stroke();
      for (let k = 1; k < 8; k++) { const u = k / 8, lx = x0 + (x1 - x0) * u, ly = y0 + 22 * U * 4 * u * (1 - u) * .5 + 6 * U; lq.shadowColor = 'rgba(255,90,40,1)'; lq.shadowBlur = 14 * U; lq.fillStyle = '#ff7a3a'; lq.beginPath(); lq.ellipse(lx, ly, 4 * U, 5.5 * U, 0, 0, 7); lq.fill(); } }
    Ly.vil = vil; Ly.lit = lit;
    // the foreground: a tiled roof ridge, textured, with the ninja on it
    const fg = mk(w, h), f = fg.getContext('2d'); const ry = h * .9;
    f.fillStyle = '#0a0810'; f.beginPath(); f.moveTo(-10, h); f.lineTo(-10, ry + 30 * U); f.quadraticCurveTo(w * .35, ry - 10 * U, w * .62, ry - 34 * U); f.quadraticCurveTo(w * .86, ry - 52 * U, w + 10, ry - 92 * U); f.lineTo(w + 10, h); f.fill();
    f.save(); f.clip(); f.strokeStyle = 'rgba(255,170,110,.08)'; f.lineWidth = 2 * U; for (let i = 0; i < 70; i++) { const x = i / 70 * w * 1.1; f.beginPath(); f.moveTo(x, h); f.lineTo(x + 40 * U, ry - 80 * U); f.stroke(); }
    for (let i = 0; i < 2600; i++) { f.fillStyle = rnd() < .5 ? 'rgba(255,200,160,.035)' : 'rgba(0,0,0,.2)'; f.fillRect(rnd() * w, ry - 90 * U + rnd() * (h - ry + 90 * U), 1 + rnd() * 3, 1); } f.restore();
    // sun rim along the ridge line
    f.strokeStyle = 'rgba(255,170,90,.55)'; f.lineWidth = 2 * U; f.beginPath(); f.moveTo(-10, ry + 30 * U); f.quadraticCurveTo(w * .35, ry - 10 * U, w * .62, ry - 34 * U); f.quadraticCurveTo(w * .86, ry - 52 * U, w + 10, ry - 92 * U); f.stroke();
    // ridge-end ornament
    f.fillStyle = '#0a0810'; f.beginPath(); f.moveTo(w * .985, ry - 90 * U); f.quadraticCurveTo(w * 1.01, ry - 140 * U, w * .955, ry - 150 * U); f.quadraticCurveTo(w * .99, ry - 120 * U, w * .96, ry - 92 * U); f.fill();
    Ly.fg = fg;
    // vignette + colour grade
    const vg = mk(w, h), vq = vg.getContext('2d'); gr = vq.createRadialGradient(w * .55, h * .5, h * .2, w * .5, h * .55, Math.hypot(w, h) * .62); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(4,2,10,.78)'); vq.fillStyle = gr; vq.fillRect(0, 0, w, h);
    gr = vq.createLinearGradient(0, 0, w * .55, 0); gr.addColorStop(0, 'rgba(6,4,14,.62)'); gr.addColorStop(1, 'rgba(6,4,14,0)'); vq.fillStyle = gr; vq.fillRect(0, 0, w, h); Ly.vig = vg;   // darker on the left, behind the title
    // film grain tiles
    Ly.grain = [0, 1, 2].map(() => { const c = mk(160, 160), gq = c.getContext('2d'), gd = gq.createImageData(160, 160); for (let i = 0; i < gd.data.length; i += 4) { const n = Math.random() * 255; gd.data[i] = gd.data[i + 1] = gd.data[i + 2] = n; gd.data[i + 3] = 255; } gq.putImageData(gd, 0, 0); return c; });
    // leaf sprites at three depths of field
    LS = []; const LC = ['#7a9a3a', '#d9772b', '#b8462a', '#e0a040'];
    for (const blur of [0, 2, 5]) LS.push(LC.map(c => { const s = 44, cn = mk(s, s), lq2 = cn.getContext('2d'); if (blur) lq2.filter = `blur(${blur}px)`; lq2.translate(s / 2, s / 2); lq2.fillStyle = c; lq2.beginPath(); lq2.moveTo(-12, 0); lq2.quadraticCurveTo(0, -9, 12, 0); lq2.quadraticCurveTo(0, 9, -12, 0); lq2.fill(); lq2.strokeStyle = 'rgba(0,0,0,.25)'; lq2.lineWidth = 1; lq2.beginPath(); lq2.moveTo(-11, 0); lq2.lineTo(11, 0); lq2.stroke(); return cn; }));
    return Ly; }

  // the ninja: back to us, facing the village; scarf and ponytail in the wind; rim light from the sun
  function ninja(q, x, y, s, t) { const wind = Math.sin(t * 2.1) * .5 + Math.sin(t * 3.7) * .3;
    const body = col => { q.fillStyle = col; q.beginPath();
      q.moveTo(x - 9 * s, y); q.lineTo(x - 7 * s, y - 34 * s); q.lineTo(x - 13 * s, y - 70 * s); q.quadraticCurveTo(x - 15 * s, y - 92 * s, x - 6 * s, y - 96 * s); q.lineTo(x + 6 * s, y - 96 * s); q.quadraticCurveTo(x + 15 * s, y - 92 * s, x + 13 * s, y - 70 * s); q.lineTo(x + 8 * s, y - 34 * s); q.lineTo(x + 10 * s, y); q.lineTo(x + 3 * s, y); q.lineTo(x + 1 * s, y - 30 * s); q.lineTo(x - 2 * s, y - 30 * s); q.lineTo(x - 3 * s, y); q.closePath(); q.fill();
      // arms, one hand on the kunai pouch
      q.beginPath(); q.moveTo(x - 13 * s, y - 88 * s); q.quadraticCurveTo(x - 20 * s, y - 70 * s, x - 15 * s, y - 52 * s); q.lineTo(x - 11 * s, y - 54 * s); q.quadraticCurveTo(x - 14 * s, y - 70 * s, x - 9 * s, y - 84 * s); q.fill();
      q.beginPath(); q.moveTo(x + 13 * s, y - 88 * s); q.quadraticCurveTo(x + 19 * s, y - 68 * s, x + 12 * s, y - 50 * s); q.lineTo(x + 8 * s, y - 52 * s); q.quadraticCurveTo(x + 13 * s, y - 68 * s, x + 9 * s, y - 84 * s); q.fill();
      // head, tousled hair and a tied-up topknot
      q.beginPath(); q.arc(x, y - 106 * s, 11 * s, 0, 7); q.fill();
      q.beginPath(); q.ellipse(x - wind * s, y - 110 * s, 13 * s, 10 * s, 0, Math.PI, 0); q.fill();
      q.beginPath(); q.arc(x - wind * 1.5 * s, y - 121 * s, 4.5 * s, 0, 7); q.fill(); };
    // scarf and ponytail behind, waving to the left
    const tail = (y0, len, wd, ph) => { q.beginPath(); q.moveTo(x - 4 * s, y0); for (let i = 1; i <= 10; i++) { const u = i / 10; q.lineTo(x - 4 * s - u * len * s, y0 + Math.sin(t * 5 + u * 5 + ph) * u * 7 * s + wind * u * 8 * s - u * 4 * s); }
      for (let i = 10; i >= 0; i--) { const u = i / 10; q.lineTo(x - 4 * s - u * len * s, y0 + wd * s * (1 - u * .6) + Math.sin(t * 5 + u * 5 + ph) * u * 7 * s + wind * u * 8 * s - u * 4 * s); } q.fill(); };
    q.fillStyle = '#ff9a5a'; tail(y - 92 * s + 1, 64, 8, 0); tail(y - 121 * s + 1, 26, 5, 1.3);
    q.fillStyle = '#0b0912'; tail(y - 92 * s, 64, 7, 0); tail(y - 121 * s, 26, 4.4, 1.3);   // scarf, ponytail
    q.save(); q.translate(1.6 * s, -1 * s); body('#ffa463'); q.restore(); body('#0b0912');
  }

  function resize() { const r = Math.min(1.25, devicePixelRatio || 1) * (document.body.classList.contains('touch') ? .9 : 1); W = Math.round(innerWidth * r); H = Math.round(innerHeight * r); cv.width = W; cv.height = H; L = paint();
    leaves = Array.from({ length: 34 }, () => newLeaf(true)); embers = Array.from({ length: 36 }, () => newEmber(true)); }
  const newLeaf = init => ({ x: Math.random() * W * 1.2, y: init ? Math.random() * H : -40, z: .35 + Math.random() * 1.4, r: Math.random() * 6, vr: (Math.random() - .5) * 3, c: (Math.random() * 4) | 0, ph: Math.random() * 6 });
  const newEmber = init => ({ x: W * (.2 + Math.random() * .8), y: init ? H * (.55 + Math.random() * .4) : H * .95, v: 6 + Math.random() * 16, ph: Math.random() * 6, s: .6 + Math.random() * 1.6 });

  function frame(now) { if (!running) return; raf = requestAnimationFrame(frame); if (now - last < 32) return; const dt = Math.min(.1, (now - last) / 1000); last = now; const t = (now - t0) / 1000, U = H / 900;
    // camera: a slow push in, a breath of parallax with the pointer
    const push = 1.06 + .035 * (.5 - .5 * Math.cos(t / 22)), pmx = mx * W * .012, pmy = my * H * .01;
    const layer = (img, depth, ox, oy) => { const s = push * (1 + depth * .02), w = img.width * s, h = img.height * s; g.drawImage(img, (W - w) / 2 + pmx * depth + (ox || 0), (H - h) / 2 + pmy * depth + (oy || 0), w, h); };
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; layer(L.sky, 0);
    // god rays from the sun
    { const sx = W / 2 + (SUN[0] * W - W / 2) * push, sy = H / 2 + (SUN[1] * H - H / 2) * push; g.save(); g.globalCompositeOperation = 'lighter'; g.translate(sx, sy);
      for (let i = 0; i < 9; i++) { const a = -Math.PI * .5 + (i - 4) * .32 + Math.sin(t * .13 + i * 1.7) * .05, wd = .05 + (i % 3) * .03, len = H * 1.4, gr = g.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len); gr.addColorStop(0, `rgba(255,200,130,${.1 + .04 * Math.sin(t * .4 + i)})`); gr.addColorStop(1, 'rgba(255,200,130,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - wd) * len, Math.sin(a - wd) * len); g.lineTo(Math.cos(a + wd) * len, Math.sin(a + wd) * len); g.fill(); }
      g.restore(); }
    // clouds drifting
    { const c = L.clouds, off = (t * 6 * U) % (c.width / 2); g.globalAlpha = .9; g.drawImage(c, -off - c.width * .1 + pmx * .2, H * .08 + pmy * .2); g.drawImage(c, c.width - off - c.width * .1 + pmx * .2, H * .08 + pmy * .2); g.globalAlpha = 1; }
    layer(L.r1, .4); layer(L.r2, .8);
    { const f = L.fog, off = (t * 10 * U) % f.width; g.globalAlpha = .38; g.drawImage(f, -off, H * .55 + pmy * .9); g.drawImage(f, f.width - off, H * .55 + pmy * .9); g.globalAlpha = 1; }
    layer(L.r3, 1.2); layer(L.vil, 1.8);
    // lights: a slow breathing, some windows flicker
    g.globalAlpha = .85 + .15 * Math.sin(t * 1.3) + (Math.random() < .04 ? -.15 : 0); g.globalCompositeOperation = 'lighter'; layer(L.lit, 1.8); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    { const f = L.fog, off = (t * 16 * U + f.width / 3) % f.width; g.globalAlpha = .28; g.drawImage(f, -off, H * .7 + pmy * 1.5, f.width, f.height * 1.3); g.drawImage(f, f.width - off, H * .7 + pmy * 1.5, f.width, f.height * 1.3); g.globalAlpha = 1; }
    // embers rising from the lanterns
    g.globalCompositeOperation = 'lighter'; for (const e of embers) { e.y -= e.v * dt * U * 2; e.x += Math.sin(t * 1.5 + e.ph) * .4 * U; if (e.y < H * .35) Object.assign(e, newEmber(false)); const a = Math.min(1, (e.y - H * .35) / (H * .2)) * (.5 + .5 * Math.sin(t * 6 + e.ph));
      g.fillStyle = `rgba(255,170,80,${a * .8})`; g.beginPath(); g.arc(e.x + pmx * 2, e.y + pmy * 2, e.s * U * 2.2, 0, 7); g.fill(); } g.globalCompositeOperation = 'source-over';
    // foreground roof + ninja (they move the most)
    layer(L.fg, 3); { const s = push * (1 + 3 * .02), nx = W / 2 + (W * .74 - W / 2) * s + pmx * 3, ny = H / 2 + (H * .9 - 30 * U - 4 * U - H / 2) * s + pmy * 3; ninja(g, nx, ny, 1.55 * U * s, t); }
    // leaves: the nearest are big and blurred (depth of field)
    for (const l of leaves) { l.y += (30 + 40 * l.z) * dt * U; l.x -= (40 + 30 * Math.sin(t * .7 + l.ph)) * l.z * dt * U; l.r += l.vr * dt; if (l.y > H + 40 || l.x < -60) Object.assign(l, newLeaf(false), { x: W * (.3 + Math.random() * .9) });
      const lvl = l.z > 1.35 ? 2 : l.z < .55 ? 1 : 0, sp = LS[lvl][l.c], sz = sp.width * l.z * U * 1.4; g.save(); g.translate(l.x + pmx * l.z * 2, l.y + pmy * l.z * 2); g.rotate(l.r); g.scale(1, Math.abs(Math.sin(t * 2.5 + l.ph)) * .7 + .3); g.globalAlpha = l.z < .55 ? .55 : .95; g.drawImage(sp, -sz / 2, -sz / 2, sz, sz); g.restore(); }
    g.globalAlpha = 1; g.drawImage(L.vig, 0, 0, W, H);
    // film grain
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = .09; const gt = L.grain[(t * 24 | 0) % 3], ox = Math.random() * 160, oy = Math.random() * 160; for (let y = -oy; y < H; y += 160) for (let x = -ox; x < W; x += 160) g.drawImage(gt, x, y); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    // letterbox sliding in, then the fade from black
    const lb = Math.max(H * .06, (H - W / 2.39) / 2) * Math.min(1, t / 2.2); g.fillStyle = '#000'; g.fillRect(0, 0, W, lb); g.fillRect(0, H - lb, W, lb); document.body.style.setProperty('--lb', (lb / (H / innerHeight)) + 'px');
    if (t < 2.4) { g.fillStyle = `rgba(0,0,0,${1 - t / 2.4})`; g.fillRect(0, 0, W, H); }
  }

  function start() { if (running) return; if (!cv) { cv = document.createElement('canvas'); cv.id = 'k-cine'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv); g = cv.getContext('2d'); addEventListener('resize', () => { if (running) { clearTimeout(start.rt); start.rt = setTimeout(resize, 200); } });
      addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }); }
    const T = $('#k-title .box'); if (T && !T.querySelector('.kj')) { const k = document.createElement('div'); k.className = 'kj'; k.textContent = '刃'; T.prepend(k); const f = document.createElement('div'); f.className = 'foot'; f.innerHTML = 'Kunai Gaiden · un jeu original'; T.appendChild(f); }
    running = true; document.body.classList.add('tcine'); resize(); t0 = last = performance.now(); raf = requestAnimationFrame(frame); setTimeout(() => document.body.classList.add('tin'), 60); }
  function stop() { if (!running) return; running = false; cancelAnimationFrame(raf); document.body.classList.remove('tcine', 'tin');
    // give the memory back to the game
    if (L) { for (const k in L) { const v = L[k]; for (const c of Array.isArray(v) ? v : [v]) if (c && c.width !== undefined) c.width = c.height = 0; } L = null; } LS = null; if (cv) cv.width = cv.height = 1; }
  // test hook: draw one frame at a given time (a hidden tab gets no animation frames)
  window.KTITLE = { draw: sec => { if (!running) { const T = $('#k-title'); if (!(T && !T.hidden && T.querySelector('#k-trow'))) return false; start(); } last = 0; const r = running; t0 = performance.now() - sec * 1000; frame(performance.now()); cancelAnimationFrame(raf); if (r) raf = requestAnimationFrame(frame); return true; } };
  // the title screen is shown while #k-title holds the menu buttons (the character creator reuses #k-title: no cinematic there)
  setInterval(() => { const T = $('#k-title'), on = !!(T && !T.hidden && T.querySelector('#k-trow')); if (on) start(); else stop(); }, 150);
})();
