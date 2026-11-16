/* Kunai Gaiden — painting kit for props: real material textures (granite, polished stone, wood grain, weathered wood,
   bronze patina, washi, roof tiles, moss) used as pattern fills, shaded per face like the textured buildings.
   Units: world units (24 per metre). PK.fill(g, path, 'granite', tone) / PK.box / PK.cyl / PK.engrave / PK.moss. */
window.PK = (() => {
  const M = 24, TAU = Math.PI * 2, SPn = Math.sin(38 * Math.PI / 180);
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const C = {}, mk = (id, w, h, metres, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h, rng(id.length * 97 + w)); C[id] = { c, k: metres * M / w }; };
  const dots = (g, W, H, r, n, cols, s0, s1) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; const x = r() * W, y = r() * H, s = s0 + r() * (s1 - s0); for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) { g.beginPath(); g.ellipse(x + dx, y + dy, s, s * (.6 + r() * .5), r() * 3, 0, TAU); g.fill(); } } };
  // rough grey granite: salt-and-pepper grains, a few mica glints
  mk('granite', 128, 128, 1.4, (g, W, H, r) => { g.fillStyle = '#8e8c86'; g.fillRect(0, 0, W, H); dots(g, W, H, r, 900, ['#6e6c68', '#a8a6a0', '#5a5856', '#b8b6ae', '#7c7a74'], .6, 2.2); dots(g, W, H, r, 40, ['rgba(255,255,255,.7)'], .4, .9); });
  // polished dark granite for grave stones: deep grey, fine grains, smooth
  mk('polished', 128, 128, 1.2, (g, W, H, r) => { g.fillStyle = '#3c3c42'; g.fillRect(0, 0, W, H); dots(g, W, H, r, 700, ['#4a4a52', '#2c2c32', '#5c5c66', '#34343a'], .4, 1.4); dots(g, W, H, r, 60, ['rgba(220,220,235,.35)'], .3, .7); });
  // weathered old stone with lichen
  mk('oldstone', 128, 128, 1.4, (g, W, H, r) => { g.fillStyle = '#7d7b70'; g.fillRect(0, 0, W, H); dots(g, W, H, r, 500, ['#6a685e', '#908e82', '#5a5a50'], 1, 4); dots(g, W, H, r, 70, ['rgba(190,200,150,.45)', 'rgba(220,210,160,.4)', 'rgba(150,160,120,.4)'], 2, 6); });
  // wood with vertical grain and a few knots
  const wood = (g, W, H, r, base, dark, light) => { g.fillStyle = base; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 46; i++) { const x = r() * W, a = .15 + r() * .35; g.strokeStyle = r() < .6 ? `rgba(${dark},${a})` : `rgba(${light},${a * .7})`; g.lineWidth = .6 + r() * 1.6; g.beginPath(); for (let y = 0; y <= H; y += 8) g.lineTo(x + Math.sin(y * .05 + i) * 1.5, y); g.stroke(); }
    for (let i = 0; i < 2; i++) { const x = r() * W, y = r() * H; g.strokeStyle = `rgba(${dark},.6)`; g.lineWidth = 1.2; for (let k = 1; k < 5; k++) { g.beginPath(); g.ellipse(x, y, k * 1.6, k * 3.2, 0, 0, TAU); g.stroke(); } } };
  mk('wood', 64, 128, .9, (g, W, H, r) => wood(g, W, H, r, '#8a6440', '50,30,15', '230,190,140'));
  mk('darkwood', 64, 128, .9, (g, W, H, r) => wood(g, W, H, r, '#5a3c26', '25,12,5', '200,150,100'));
  mk('oldwood', 64, 128, .9, (g, W, H, r) => wood(g, W, H, r, '#a89a84', '60,55,45', '235,228,210'));
  mk('newwood', 64, 128, .9, (g, W, H, r) => wood(g, W, H, r, '#dcc49a', '130,95,55', '255,245,220'));
  mk('bronze', 96, 96, 1, (g, W, H, r) => { g.fillStyle = '#6f7a52'; g.fillRect(0, 0, W, H); dots(g, W, H, r, 300, ['#8aa070', '#56603e', '#9cb486', '#4a5034', 'rgba(150,200,170,.5)'], 1, 4); });
  mk('washi', 96, 96, .8, (g, W, H, r) => { g.fillStyle = '#f3ecdc'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(160,140,110,.25)'; g.lineWidth = .7; for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + r() * 10, y + r() * 6, x + r() * 16 - 4, y + r() * 12); g.stroke(); } });
  mk('tiles', 96, 96, 1.2, (g, W, H, r) => { g.fillStyle = '#34353d'; g.fillRect(0, 0, W, H); for (let x = 0; x < W; x += 12) { const q = g.createLinearGradient(x, 0, x + 12, 0); q.addColorStop(0, '#5c5e6a'); q.addColorStop(.5, '#44464f'); q.addColorStop(1, '#25262c'); g.fillStyle = q; g.fillRect(x, 0, 11, H); } for (let y = 0; y < H; y += 12) { g.fillStyle = 'rgba(10,10,14,.5)'; g.fillRect(0, y, W, 2); } });
  mk('moss', 64, 64, .6, (g, W, H, r) => { g.fillStyle = '#4a7230'; g.fillRect(0, 0, W, H); dots(g, W, H, r, 260, ['#5f8a3a', '#3a5a26', '#7aa64a', '#2e4a20'], .6, 2); });
  mk('straw', 64, 64, .6, (g, W, H, r) => { g.fillStyle = '#c8a860'; g.fillRect(0, 0, W, H); g.lineWidth = 1; for (let i = 0; i < 120; i++) { g.strokeStyle = r() < .5 ? 'rgba(120,90,40,.5)' : 'rgba(250,230,170,.5)'; const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2 + r() * 3, y + 10 + r() * 8); g.stroke(); } });
  mk('bamboo', 32, 128, .5, (g, W, H, r) => { const q = g.createLinearGradient(0, 0, W, 0); q.addColorStop(0, '#9ab45a'); q.addColorStop(.4, '#c8d880'); q.addColorStop(1, '#5a7a30'); g.fillStyle = q; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(60,80,30,.6)'; for (let y = 20; y < H; y += 44) g.fillRect(0, y, W, 3); });
  mk('water', 96, 96, 1, (g, W, H, r) => { const q = g.createLinearGradient(0, 0, 0, H); q.addColorStop(0, '#5a8a90'); q.addColorStop(1, '#2a4a52'); g.fillStyle = q; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(220,245,250,.35)'; g.lineWidth = 1; for (let i = 0; i < 14; i++) { const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 6, y - 2, x + 14, y); g.stroke(); } });

  // terracotta, sandstone, packed snow, blue ice, black iron, canvas cloth, grey slate for the later regions
  mk('clay', 96, 96, 1, (g, W, H, r) => { g.fillStyle = '#a8603a'; g.fillRect(0, 0, W, H); dots(g, W, H, r, 500, ['#b8704a', '#94522e', '#c88a5e', '#7e4626'], .8, 3); dots(g, W, H, r, 30, ['rgba(240,220,190,.35)'], 1, 3); });
  mk('sandstone', 128, 128, 1.6, (g, W, H, r) => { g.fillStyle = '#c8a878'; g.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 6 + r() * 10) { g.fillStyle = r() < .5 ? 'rgba(150,110,60,.22)' : 'rgba(250,230,190,.22)'; g.fillRect(0, y, W, 2 + r() * 4); } dots(g, W, H, r, 500, ['#b89462', '#d8bc8e', '#a8844e'], .5, 2); });
  mk('snow', 96, 96, 1.2, (g, W, H, r) => { g.fillStyle = '#e8eef4'; g.fillRect(0, 0, W, H); dots(g, W, H, r, 400, ['#f8fbff', '#d4dde8', '#c8d4e2', '#ffffff'], 1, 5); });
  mk('ice', 96, 96, 1.2, (g, W, H, r) => { g.fillStyle = '#a8cfe0'; g.fillRect(0, 0, W, H); dots(g, W, H, r, 120, ['rgba(255,255,255,.4)', 'rgba(110,170,200,.4)'], 3, 12); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1; for (let i = 0; i < 16; i++) { let x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 3; k++) { x += (r() - .5) * 26; y += (r() - .5) * 26; g.lineTo(x, y); } g.stroke(); } });
  mk('iron', 96, 96, 1, (g, W, H, r) => { g.fillStyle = '#4a4c50'; g.fillRect(0, 0, W, H); dots(g, W, H, r, 300, ['#5a5c62', '#3a3c40', '#62646a'], .5, 2); dots(g, W, H, r, 50, ['rgba(140,70,30,.45)', 'rgba(110,55,25,.4)'], 1, 5); });
  mk('cloth', 64, 64, .5, (g, W, H, r) => { g.fillStyle = '#d8ccb0'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(120,100,70,.18)'; for (let i = 0; i < W; i += 3) { g.fillRect(i, 0, 1, H); g.fillRect(0, i, W, 1); } dots(g, W, H, r, 40, ['rgba(140,120,90,.2)'], 2, 6); });
  mk('slate', 128, 128, 1.4, (g, W, H, r) => { g.fillStyle = '#5a646c'; g.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 4 + r() * 8) { g.fillStyle = r() < .5 ? 'rgba(30,36,42,.3)' : 'rgba(170,185,195,.2)'; g.fillRect(0, y, W, 1 + r() * 3); } dots(g, W, H, r, 200, ['#6a747c', '#4a545c'], .5, 2); });

  const pat = (g, id) => { const T = C[id], p = g.createPattern(T.c, 'repeat'); p.setTransform(new DOMMatrix().scale(T.k)); return p; };
  // tone overlay per face: lit top, plain front, shaded side; light from the top-left
  const TONE = { top: ['rgba(255,252,240,.22)', 'rgba(255,252,240,.1)'], front: ['rgba(255,250,235,.12)', 'rgba(20,16,10,.2)'], side: ['rgba(10,8,6,.32)', 'rgba(10,8,6,.45)'], lit: ['rgba(255,250,235,.25)', 'rgba(20,16,10,.05)'] };
  function fill(g, path, id, tone, box) { path(); g.fillStyle = pat(g, id); g.fill(); const t = TONE[tone || 'front'], b = box || [0, -60, 0, 0];
    path(); const q = g.createLinearGradient(b[0], b[1], b[2], b[3]); q.addColorStop(0, t[0]); q.addColorStop(1, t[1]); g.fillStyle = q; g.fill(); }
  const poly = (g, pts) => () => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
  // a block seen by the camera: front face, lit top, shaded right side, bevelled edges
  function box(g, x, y, w, h, d, id, o) { o = o || {}; const dd = d * SPn, sk = dd * .6;
    fill(g, poly(g, [[x, y], [x, y - h], [x + w, y - h], [x + w, y]]), id, 'front', [x, y - h, x, y]);
    fill(g, poly(g, [[x, y - h], [x + sk, y - h - dd], [x + w + sk, y - h - dd], [x + w, y - h]]), id, 'top', [x, y - h - dd, x, y - h]);
    fill(g, poly(g, [[x + w, y], [x + w, y - h], [x + w + sk, y - h - dd], [x + w + sk, y - dd]]), id, 'side', [x + w, 0, x + w + sk, 0]);
    g.lineWidth = 1.1; g.strokeStyle = 'rgba(255,255,245,.38)'; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + w, y - h); g.lineTo(x + w + sk, y - h - dd); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w + sk, y - dd); g.stroke();
    if (o.moss) moss(g, poly(g, [[x, y], [x, y - h], [x + w, y - h], [x + w, y]]), x, y, w, h * o.moss); }
  // a vertical cylinder (vase, post, barrel)
  function cyl(g, x, y, r, h, id, o) { o = o || {}; const ry = r * SPn * .5;
    const body = () => { g.beginPath(); g.moveTo(x - r, y - h); g.lineTo(x - r, y); g.ellipse(x, y, r, ry, 0, Math.PI, 0, true); g.lineTo(x + r, y - h); g.closePath(); };
    body(); g.fillStyle = pat(g, id); g.fill(); body(); const q = g.createLinearGradient(x - r, 0, x + r, 0); q.addColorStop(0, 'rgba(10,8,6,.15)'); q.addColorStop(.28, 'rgba(255,250,235,.22)'); q.addColorStop(.7, 'rgba(10,8,6,.18)'); q.addColorStop(1, 'rgba(10,8,6,.5)'); g.fillStyle = q; g.fill();
    if (o.top !== false) { g.beginPath(); g.ellipse(x, y - h, r, ry, 0, 0, TAU); g.fillStyle = pat(g, o.topId || id); g.fill(); g.fillStyle = o.hollow ? 'rgba(15,12,8,.65)' : 'rgba(255,250,235,.2)'; g.beginPath(); g.ellipse(x, y - h, r * (o.hollow ? .8 : 1), ry * (o.hollow ? .8 : 1), 0, 0, TAU); g.fill(); } }
  // text cut into stone: dark groove with a light lower lip
  function engrave(g, t, x, y, size, col) { g.font = `900 ${size}px "Yu Mincho","Hiragino Mincho ProN","MS Mincho",serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(255,255,255,.22)'; g.fillText(t, x + .8, y + .9); g.fillStyle = col || 'rgba(8,8,10,.75)'; g.fillText(t, x, y); }
  // moss and lichen creeping up from the base of a shape
  function moss(g, clipPath, x, y, w, h, seed) { const r = rng(seed || (x * 7 + y) | 0); g.save(); clipPath(); g.clip();
    for (let i = 0; i < 40; i++) { const px = x + r() * w, py = y - Math.pow(r(), 2) * h; g.fillStyle = ['rgba(90,130,60,.7)', 'rgba(60,95,40,.7)', 'rgba(150,170,100,.5)', 'rgba(200,205,150,.4)'][(r() * 4) | 0]; g.beginPath(); g.ellipse(px, py, 1.5 + r() * 4, 1 + r() * 2.5, 0, 0, TAU); g.fill(); } g.restore(); }
  const ell = (g, x, y, rx, ry, col, a) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), a || 0, 0, TAU); g.fill(); };
  const shadow = (g, rx, dx) => ell(g, dx === undefined ? rx * .25 : dx, 2, rx, rx * SPn * .55, 'rgba(20,16,10,.3)');
  // sprite wrapper for ISO scenes
  const obj = (b, fn) => ({ bounds: () => b, render(g, s, ro) { fn(g, (ro || {}).layer); },
    bake(s, dpr, ro) { const bb = this.bounds(); let d = dpr || 1; const w = (bb.x1 - bb.x0) * s, hh = (bb.y1 - bb.y0) * s; d = Math.min(d, 4096 / Math.max(w, hh, 1));
      const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w * d)); c.height = Math.max(1, Math.ceil(hh * d)); const g = c.getContext('2d');
      g.setTransform(d * s, 0, 0, d * s, -bb.x0 * d * s, -bb.y0 * d * s); this.render(g, s * d, ro); return { canvas: c, ox: -bb.x0 * s, oy: -bb.y0 * s, w, h: hh }; }, faces: [], lines: [], sprites: [] });
  const scene = (o, bias) => { const S = new ISO.Scene(); S.sprite(0, 0, 0, o, { bias: bias || 2 }); return S; };
  const canvasOf = id => C[id].c;
  return { canvasOf, M, SPn, TAU, rng, pat, fill, poly, box, cyl, engrave, moss, ell, shadow, obj, scene };
})();
