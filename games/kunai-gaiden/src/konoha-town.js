/* Kunai Online — Aozora town kit on the shared ISO camera (metres, same scale as the gate and the Gardien office).
   Houses with roof water tanks, apartment blocks, the ramen stand, shops, utility poles, trees and street props.
   Every builder returns a Scene positioned with its front-centre at the origin (front = +y). */
window.KTOWN = (() => {
  const M = 24, K = KGATE, rng = K.rng, JP = K.JP, m = v => v * M;
  const cache = {};
  const mixHex = (a, b, t) => { const h = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)), A = h(a), B = h(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const tex = (id, w, h, fn) => ISO.texture('kt-' + id, w, h, fn);
  const mat = (t, tw, x) => Object.assign({ tex: t, tw: m(tw) }, x || {});
  const mottled = (g, W, H, base, seed, n) => { const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, W, H);
    for (let i = 0; i < (n || 240); i++) { g.fillStyle = r() < .5 ? 'rgba(255,250,235,.16)' : 'rgba(70,50,30,.12)'; g.beginPath(); g.ellipse(r() * W, r() * H, 3 + r() * 14, 2 + r() * 6, r() * 3, 0, 7); g.fill(); } return r; };

  /* ---------- textures ---------- */
  function plaster(base, seed) { return cache['pl' + base] || (cache['pl' + base] = tex('plaster' + base, 256, 256, (g, W, H) => { const r = mottled(g, W, H, base, seed || 3);
    for (let i = 0; i < 6; i++) { const x = r() * W, q = g.createLinearGradient(0, 0, 0, H); q.addColorStop(0, 'rgba(90,70,50,.14)'); q.addColorStop(1, 'rgba(90,70,50,0)'); g.fillStyle = q; g.fillRect(x, 0, 6 + r() * 14, H * (.3 + r() * .5)); }
    for (let i = 0; i < 4; i++) { let x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - .5) * 10; y += 4 + r() * 6; g.lineTo(x, y); } g.strokeStyle = 'rgba(60,40,30,.35)'; g.lineWidth = 1; g.stroke(); } })); }
  function tiles(base, seed) { return cache['ti' + base] || (cache['ti' + base] = tex('tiles' + base, 256, 256, (g, W, H) => {
    const r = rng(seed || 7), rowH = 26, tw = 22, dark = 'rgba(20,20,40,.55)';
    for (let y = 0, row = 0; y < H; y += rowH, row++) { const off = (row % 2) * tw / 2;
      for (let x = -tw; x < W + tw; x += tw) { const X = x + off, v = (r() - .5) * .14;
        g.fillStyle = base; g.fillRect(X, y, tw, rowH); g.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,30,${-v})`; g.fillRect(X, y, tw, rowH);
        const q = g.createLinearGradient(X, 0, X + tw, 0); q.addColorStop(0, 'rgba(255,255,255,.28)'); q.addColorStop(.35, 'rgba(255,255,255,0)'); q.addColorStop(.8, 'rgba(0,0,30,.25)'); q.addColorStop(1, 'rgba(0,0,30,.45)'); g.fillStyle = q; g.fillRect(X, y, tw, rowH);
        g.fillStyle = dark; g.beginPath(); g.ellipse(X + tw / 2, y + rowH, tw / 2, 5, 0, 0, Math.PI); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(X + tw / 2, y + rowH - 3, tw / 2 - 3, 2.5, 0, Math.PI, 0); g.fill();
        g.fillStyle = dark; g.fillRect(X + tw - 1.2, y, 1.2, rowH); }
      if (r() < .4) { g.fillStyle = 'rgba(90,120,50,.25)'; g.beginPath(); g.ellipse(r() * W, y + rowH * .6, 8 + r() * 10, 3, 0, 0, 7); g.fill(); } } })); }
  function windowTex(frame, style) { const id = 'win' + frame + style; return cache[id] || (cache[id] = tex(id, 128, 160, (g, W, H) => {
    g.fillStyle = frame; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(255,240,210,.25)'; g.fillRect(0, 0, W, 4); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, H - 6, W, 6);
    if (style === 'shoji') { g.fillStyle = '#f1e7cf'; g.fillRect(10, 10, W - 20, H - 20); g.strokeStyle = frame; g.lineWidth = 3; for (let x = 10 + (W - 20) / 3; x < W - 12; x += (W - 20) / 3) { g.beginPath(); g.moveTo(x, 10); g.lineTo(x, H - 10); g.stroke(); } for (let y = 10 + (H - 20) / 4; y < H - 12; y += (H - 20) / 4) { g.beginPath(); g.moveTo(10, y); g.lineTo(W - 10, y); g.stroke(); }
      const q = g.createLinearGradient(0, 10, 0, H); q.addColorStop(0, 'rgba(255,220,150,.25)'); q.addColorStop(1, 'rgba(120,80,40,.2)'); g.fillStyle = q; g.fillRect(10, 10, W - 20, H - 20); return; }
    const gl = g.createLinearGradient(0, 0, W, H); gl.addColorStop(0, '#5f8fa3'); gl.addColorStop(.5, '#2b4656'); gl.addColorStop(1, '#4d7486'); g.fillStyle = gl; g.fillRect(12, 12, W - 24, H - 24);
    g.fillStyle = 'rgba(230,245,255,.28)'; g.beginPath(); g.moveTo(20, H - 12); g.lineTo(60, 12); g.lineTo(80, 12); g.lineTo(40, H - 12); g.fill();
    if (style === 'curtain') { g.fillStyle = '#e8d6b0'; g.beginPath(); g.moveTo(12, 12); g.quadraticCurveTo(30, 60, 22, H - 20); g.lineTo(12, H - 12); g.fill(); g.beginPath(); g.moveTo(W - 12, 12); g.quadraticCurveTo(W - 30, 60, W - 22, H - 20); g.lineTo(W - 12, H - 12); g.fill(); }
    g.fillStyle = frame; g.fillRect(W / 2 - 4, 12, 8, H - 24); g.fillRect(12, H / 2 - 4, W - 24, 8); })); }
  function doorTex(frame) { const id = 'door' + frame; return cache[id] || (cache[id] = tex(id, 128, 224, (g, W, H) => {
    g.fillStyle = frame; g.fillRect(0, 0, W, H); g.fillStyle = '#efe2c2'; g.fillRect(10, 10, W / 2 - 14, H - 20); g.fillRect(W / 2 + 4, 10, W / 2 - 14, H - 20);
    g.strokeStyle = frame; g.lineWidth = 3; for (const x0 of [10, W / 2 + 4]) { for (let y = 10 + 30; y < H - 12; y += 30) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + W / 2 - 14, y); g.stroke(); } g.beginPath(); g.moveTo(x0 + (W / 2 - 14) / 2, 10); g.lineTo(x0 + (W / 2 - 14) / 2, H - 10); g.stroke(); }
    g.fillStyle = 'rgba(80,40,20,.35)'; g.fillRect(10, H - 40, W - 20, 30); })); }
  function sign(text, bg, fg, w, h) { const id = 'sign' + text + bg; return cache[id] || (cache[id] = tex(id, w || 256, h || 96, (g, W, H) => {
    g.fillStyle = bg; g.fillRect(0, 0, W, H); mottled(g, W, H, bg, 9, 40); g.lineWidth = 6; g.strokeStyle = 'rgba(40,20,10,.8)'; g.strokeRect(3, 3, W - 6, H - 6);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold ${Math.min(H * .7, W / text.length * .9)}px ${JP}`; g.fillText(text, W / 2, H / 2 + 3); })); }
  function noren(text, col) { const id = 'noren' + text + col; return cache[id] || (cache[id] = tex(id, 300, 150, (g, W, H) => {
    g.clearRect(0, 0, W, H); const n = text.length, pw = W / n;
    for (let i = 0; i < n; i++) { g.fillStyle = col; g.fillRect(i * pw + 2, 0, pw - 4, H - 4 - (i % 2) * 6); const q = g.createLinearGradient(0, 0, 0, H); q.addColorStop(0, 'rgba(0,0,0,.25)'); q.addColorStop(.2, 'rgba(0,0,0,0)'); q.addColorStop(1, 'rgba(0,0,0,.2)'); g.fillStyle = q; g.fillRect(i * pw + 2, 0, pw - 4, H);
      g.fillStyle = '#f6f0e2'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold ${pw * .62}px ${JP}`; g.fillText(text[i], i * pw + pw / 2, H * .55); } })); }
  function awning(a, b) { const id = 'awn' + a + b; return cache[id] || (cache[id] = tex(id, 128, 128, (g, W, H) => { for (let x = 0; x < W; x += 32) { g.fillStyle = (x / 32) % 2 ? a : b; g.fillRect(x, 0, 32, H); } g.fillStyle = 'rgba(0,0,0,.15)'; for (let x = 0; x < W; x += 32) g.fillRect(x + 28, 0, 4, H); })); }
  function leafTex(base, seed) { return cache['lf' + base] || (cache['lf' + base] = tex('leaf' + base, 192, 192, (g, W, H) => { const r = mottled(g, W, H, base, seed || 21, 0);
    for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, s = 4 + r() * 7; g.fillStyle = r() < .55 ? 'rgba(200,240,120,.38)' : 'rgba(20,50,15,.4)'; g.beginPath(); g.ellipse(x, y, s, s * .55, r() * 3, 0, 7); g.fill(); } })); }
  const bark = () => cache.bark || (cache.bark = tex('bark', 64, 128, (g, W, H) => { const r = mottled(g, W, H, '#6b4a30', 33, 60); for (let i = 0; i < 14; i++) { g.strokeStyle = 'rgba(30,15,5,.5)'; g.lineWidth = 1 + r() * 1.5; const x = r() * W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - .5) * 8, H); g.stroke(); } }));
  const metal = () => cache.metal || (cache.metal = tex('metal', 128, 128, (g, W, H) => { const r = mottled(g, W, H, '#8e979b', 44, 80); for (let x = 0; x < W; x += 16) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, 0, 2, H); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(x + 2, 0, 2, H); } g.fillStyle = 'rgba(140,70,30,.25)'; for (let i = 0; i < 10; i++) g.fillRect(r() * W, r() * H, 3, 8 + r() * 14); }));

  const T = () => { const t = K.textures(); return { WOOD: mat(t.wall, 4), WOOD2: mat(t.wall2, 4), DARK: mat(t.dark, 2), STONE: mat(t.stone, 4), FLAG: mat(t.flag, 4), ROOFW: mat(t.roof, 4) }; };

  /* ---------- water tank (the classic Aozora rooftop silhouette) ---------- */
  function tank(S, x, y, z, r, hgt) {
    const MT = mat(metal(), 2), DK = T().DARK;
    for (const [dx, dy] of [[-.7, -.7], [.7, -.7], [-.7, .7], [.7, .7]]) S.box(x + m(dx * r) - m(.12), x + m(dx * r) + m(.12), y + m(dy * r) - m(.12), y + m(dy * r) + m(.12), z, z + m(1.2), { front: DK, top: DK }, { bias: 20 });
    S.cylinder(x, y, m(r), z + m(1.2), z + m(1.2 + hgt), MT, 18, { cap: false, bias: 21 });
    S.frustum(x, y, m(r + .1), m(.25), z + m(1.2 + hgt), z + m(1.2 + hgt + r * .7), MT, { seg: 18, bias: 22 });
    S.tube([[x + m(r * .9), y + m(.2), z + m(1.6)], [x + m(r * .9 + .6), y + m(.4), z + m(1.2)], [x + m(r * .9 + .6), y + m(.4), z - m(1)]], m(.12), { color: '#7d868a' }, { bias: 23 });
  }

  /* ---------- builders ---------- */
  /* Aozora house, in a classic street style: a boxy 2–3 storey block in a pastel colour, a flat roof with a parapet
     and a water tank, small tiled pent roofs (hisashi) over every storey, balconies, a vertical kanji sign, sometimes a round
     corner tower with a dome. */
  function vsign(text, bg, fg) { const id = 'vs' + text + bg; return cache[id] || (cache[id] = tex(id, 64, 64 * text.length + 16, (g, W, H) => {
    g.fillStyle = bg; g.fillRect(0, 0, W, H); g.lineWidth = 5; g.strokeStyle = 'rgba(30,15,5,.85)'; g.strokeRect(2.5, 2.5, W - 5, H - 5);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold 46px ${JP}`; [...text].forEach((ch, i) => g.fillText(ch, W / 2, 40 + i * 64)); })); }
  function house(o) {
    o = Object.assign({ w: 8, d: 6, floors: 2, wall: '#cfdcb8', pent: '#5f8a4a', frame: '#4a3a2a', tank: true, seed: 1, door: true, balcony: null, sign: null, signBg: '#7a2a20', tower: null }, o);
    const S = new ISO.Scene(), tt = T(), r = rng(o.seed), PL = mat(plaster(o.wall, o.seed), 4), PT = mat(tiles(o.pent, o.seed), 2.4), W2 = o.w / 2, d = o.d, fh = 2.9, top = m(fh * o.floors + .4);
    const WIN = mat(windowTex(o.frame, o.seed % 2 ? 'curtain' : 'glass'), 1.1, { whole: true }), SHO = mat(windowTex(o.frame, 'shoji'), 1.1, { whole: true }), DOOR = mat(doorTex(o.frame), 1.6, { whole: true });
    const wallDepth = z => top / 2 * .62 - z * .62;   // keeps details glued to the big front wall in the painter sort
    S.face([[m(-W2 - 1), m(-d), 0], [m(W2 + 1), m(-d), 0], [m(W2 + 1), m(1.3), 0], [m(-W2 - 1), m(1.3), 0]], tt.FLAG, { n: [0, 0, 1], O: [m(-W2 - 1), m(-d), 0], U: [1, 0, 0], V: [0, 1, 0], ground: true });
    S.box(m(-W2), m(W2), m(-d), 0, 0, top, { front: PL, top: mat(plaster(mixHex(o.wall, '#8a8070', .35), o.seed + 1), 4) }, { eave: m(.5) });
    S.box(m(-W2), m(W2), 0, m(.08), 0, m(.6), { front: tt.STONE }, { bias: wallDepth(m(.3)) + 2 });
    // traditional districts: a tiled gable roof instead of the flat roof
    // hipped (irimoya-like) tile roof: the hipped ends read from the fixed camera, a dark ridge cap with raised end tiles (onigawara)
    if (o.pitched) { const zR = top + m(d * .36), ins = (d + 1.6) / 2 * .8;
      S.hip(m(-W2), m(W2), m(-d), 0, top, zR, mat(tiles(o.pent, o.seed + 9), 2.6), { over: m(.8), ridge: .8, fascia: tt.DARK, bias: 12 });
      const rx0 = -W2 - .8 + ins, rx1 = W2 + .8 - ins;
      if (rx1 > rx0) S.box(m(rx0 - .15), m(rx1 + .15), m(-d * .5 - .22), m(-d * .5 + .22), zR - m(.08), zR + m(.3), { front: tt.DARK, top: tt.DARK }, { bias: 13 });
      for (const ex of rx1 > rx0 ? [rx0 - .15, rx1 + .15] : [0]) S.box(m(ex - .25), m(ex + .25), m(-d * .5 - .3), m(-d * .5 + .3), zR - m(.05), zR + m(.75), { front: tt.DARK, top: tt.DARK }, { bias: 14 }); }
    else {
    // parapet ring on the flat roof
    for (const [a0, a1, b0, b1] of [[-W2 - .1, W2 + .1, -.3, .1], [-W2 - .1, W2 + .1, -d - .1, -d + .3], [-W2 - .1, -W2 + .3, -d, 0], [W2 - .3, W2 + .1, -d, 0]]) S.box(m(a0), m(a1), m(b0), m(b1), top, top + m(.55), { front: mat(plaster(mixHex(o.wall, '#ffffff', .25), o.seed + 2), 3), top: tt.DARK }, { bias: 3 }); }
    const n = Math.max(1, Math.floor((o.w - 1.6) / 2.1));
    for (let f = 0; f < o.floors; f++) { const z0 = m(f * fh), zb = z0 + m(f ? 1 : .9), zp = z0 + m(fh - .15);
      for (let i = 0; i < n; i++) { const cx = -W2 + 1.1 + (o.w - 2.2) * (n === 1 ? .5 : i / (n - 1));
        if (!f && o.door && Math.abs(cx) < 1.35) continue;   // the entrance (built below) takes the middle of the ground floor
        if (o.tower && !o.pitched && Math.abs(cx - o.tower * (W2 - .2)) < 2.15) continue;   // the round corner tower stands in front of this part of the façade
        S.decal(m(cx - .55), m(cx + .55), m(.02), zb, zb + m(1.375), f ? WIN : SHO, { wall: [0, top], bias: 4 }); }
      // pent roof over this storey: a short sloped strip of tiles with a dark fascia
      if (f < o.floors - (o.pitched ? 1 : 0)) { const out = f ? .7 : 1.05, zt = zp + m(.1), zbot = zp - m(.45);
        S.face([[m(-W2 - .15), 0, zt], [m(W2 + .15), 0, zt], [m(W2 + .15), m(out), zbot], [m(-W2 - .15), m(out), zbot]], PT, { O: [m(-W2), 0, zt], U: [1, 0, 0], V: ISO.norm([0, out, -.55]), bias: wallDepth(zp) + 6 });
        S.box(m(-W2 - .15), m(W2 + .15), m(out), m(out + .08), zbot - m(.12), zbot, { front: tt.DARK }, { bias: wallDepth(zp) + 7 }); } }
    // the entrance, always centred (where the game lets you in): sliding door in a dark frame, a noren curtain, stone steps
    if (o.door) { const NR = [['暖簾', '#2b3a6a'], ['御宿', '#7a2a20'], ['茶屋', '#2f5a4a'], ['和室', '#4a2f5a']][o.seed % 4];
      S.decal(m(-.82), m(.82), m(.03), m(.6), m(2.55), DOOR, { wall: [0, top], bias: 4 });
      for (const x of [-.95, .95]) S.box(m(x - .09), m(x + .09), 0, m(.16), m(.55), m(2.72), { front: tt.DARK, top: tt.DARK }, { bias: wallDepth(m(1.5)) + 5 });
      S.box(m(-1.08), m(1.08), 0, m(.18), m(2.6), m(2.8), { front: tt.DARK, top: tt.DARK }, { bias: wallDepth(m(2.7)) + 6 });
      S.decal(m(-.9), m(.9), m(.95), m(1.85), m(2.3), mat(noren(NR[0], NR[1]), 1.8, { whole: true }), { bias: wallDepth(m(2.75)) + 9 });   // hung from the front edge of the eave, where it shows
      S.box(m(-.8), m(.8), m(.08), m(.55), 0, m(.36), { front: tt.STONE, top: tt.STONE }, { bias: 3 });
      S.box(m(-.9), m(.9), m(.55), m(1.05), 0, m(.16), { front: tt.STONE, top: tt.STONE }, { bias: 3 }); }
    // balcony with a railing on the upper storey
    if (o.balcony) { const z0 = m(fh * (o.floors - 1) + .15), bx0 = o.balcony < 0 ? -W2 : W2 - 3.2, bx1 = bx0 + 3.2;
      S.box(m(bx0), m(bx1), 0, m(1), z0, z0 + m(.15), { front: tt.WOOD2, top: tt.WOOD2 }, { bias: wallDepth(z0) + 8 });
      S.tube([[m(bx0), m(.95), z0 + m(.95)], [m(bx1), m(.95), z0 + m(.95)]], m(.05), { color: '#5a3a24' }, { bias: wallDepth(z0) + 9 });
      for (let k = 0; k <= 8; k++) S.tube([[m(bx0 + k * .4), m(.95), z0 + m(.15)], [m(bx0 + k * .4), m(.95), z0 + m(.95)]], m(.035), { color: '#5a3a24' }, { bias: wallDepth(z0) + 9, shine: false }); }
    // vertical shop sign hanging from the corner
    if (o.sign) { const sw = .62, sh = .5 + o.sign.length * .62, x = W2 - .55, z1 = top - m(.6);
      S.face([[m(x), m(.25), z1 - m(sh)], [m(x), m(.25 + sw), z1 - m(sh)], [m(x), m(.25 + sw), z1], [m(x), m(.25), z1]], { color: o.signBg }, { n: [1, 0, 0], cull: false, bias: wallDepth(z1) + 10 });
      S.face([[m(x - sw), m(.3), z1 - m(sh)], [m(x), m(.3), z1 - m(sh)], [m(x), m(.3), z1], [m(x - sw), m(.3), z1]], mat(vsign(o.sign, o.signBg, '#f6e8c0'), sw, { whole: true }), { n: [0, 1, 0], O: [m(x - sw), m(.3), z1], U: [1, 0, 0], V: [0, 0, -1], bias: wallDepth(z1) + 11 }); }
    // round corner tower with a dome cap (a Aozora signature)
    if (o.tower && !o.pitched) { const tx = m(o.tower * (W2 - .2)), ty = m(-.9), th = top + m(1.6);
      S.cylinder(tx, ty, m(1.5), 0, th, mat(plaster(mixHex(o.wall, '#ffffff', .15), o.seed + 3), 4), 22, { cap: false, eave: m(.4), bias: 12 });
      S.frustum(tx, ty, m(1.75), m(1.75), th, th + m(.2), tt.DARK, { seg: 22, bias: 13 }); S.sphere(tx, ty, th + m(.2), m(1.7), mat(tiles(o.pent, o.seed + 4), 2), { bands: 4, seg: 22, squash: .55, bias: 14 });
      for (let f = 0; f < o.floors; f++) S.face([[tx - m(.4), ty + m(1.52), m(f * fh + 1.1)], [tx + m(.4), ty + m(1.52), m(f * fh + 1.1)], [tx + m(.4), ty + m(1.52), m(f * fh + 2.2)], [tx - m(.4), ty + m(1.52), m(f * fh + 2.2)]], mat(windowTex(o.frame, 'glass'), .8, { whole: true }), { n: [0, 1, 0], O: [tx - m(.4), ty + m(1.52), m(f * fh + 2.2)], U: [1, 0, 0], V: [0, 0, -1], bias: 15 }); }
    if (o.tank && !o.pitched) tank(S, m(-W2 * .4 + r() * 2), m(-d * .5), top, .8, 1.2);
    S.tube([[m(-W2 + .4), m(.2), top], [m(-W2 + .4), m(.2), m(.3)]], m(.08), { color: '#8a9296' }, { bias: 9 });
    if (o.seed % 3 === 0 && n >= 2 && !o.pitched) S.box(m(.75), m(1.65), m(0), m(.5), m(fh + 1.1), m(fh + 1.7), { front: mat(metal(), 1), top: mat(metal(), 1) }, { bias: wallDepth(m(fh + .7)) + 9 });
    return S;
  }
  function apartment(o) {
    o = Object.assign({ w: 12, d: 8, floors: 4, wall: '#d9c9a8', frame: '#3d4a52', seed: 4 }, o);
    const S = new ISO.Scene(), tt = T(), PL = mat(plaster(o.wall, o.seed), 5), W2 = o.w / 2, d = o.d, fh = 2.9, top = m(fh * o.floors + .6);
    const WIN = mat(windowTex(o.frame, 'glass'), 1.2, { whole: true }), WIN2 = mat(windowTex(o.frame, 'curtain'), 1.2, { whole: true }), DOOR = mat(doorTex('#4a3020'), 1.8, { whole: true });
    S.face([[m(-W2 - 1), m(-d), 0], [m(W2 + 1), m(-d), 0], [m(W2 + 1), m(1.5), 0], [m(-W2 - 1), m(1.5), 0]], tt.FLAG, { n: [0, 0, 1], O: [m(-W2 - 1), m(-d), 0], U: [1, 0, 0], V: [0, 1, 0], ground: true });
    S.box(m(-W2), m(W2), m(-d), 0, 0, top, { front: PL, top: mat(plaster('#b8ab90', 2), 4) }, { eave: m(.4) });
    for (const [a0, a1, b0, b1] of [[-W2 - .15, W2 + .15, -.35, .15], [-W2 - .15, W2 + .15, -d - .15, -d + .35], [-W2 - .15, -W2 + .35, -d, 0], [W2 - .35, W2 + .15, -d, 0]]) S.box(m(a0), m(a1), m(b0), m(b1), top, top + m(.6), { front: tt.DARK, top: tt.DARK }, { bias: 3 });
    const r = rng(o.seed), n = Math.floor((o.w - 1.6) / 2);
    for (let f = 0; f < o.floors; f++) { const zb = m(f * fh + .9);
      if (f) { S.box(m(-W2), m(W2), 0, m(.12), zb - m(.5), zb - m(.32), { front: tt.DARK }, { bias: top / 2 * .62 - zb * .62 + 3 }); }
      if (!f) S.decal(m(-.9), m(.9), m(.02), 0, m(2.6), DOOR, { bias: 4, wall: [0, top] });
      for (let i = 0; i < n; i++) { const cx = n === 1 ? 0 : -W2 + 1.4 + (o.w - 2.8) * i / (n - 1);
        if (!f && Math.abs(cx) < 1.7) continue;
        S.decal(m(cx - .6), m(cx + .6), m(.02), zb, zb + m(1.5), r() < .5 ? WIN : WIN2, { bias: 4, wall: [0, top] });
        if (f && r() < .35) S.box(m(cx - .8), m(cx + .8), m(.02), m(.6), zb - m(.2), zb, { front: tt.DARK, top: tt.DARK }, { bias: top / 2 * .62 - zb * .62 + 5 }); } }
    // balconies with railings on one side
    for (let f = 1; f < o.floors; f++) { const z0 = m(f * fh + .3); S.box(m(W2 - 3.6), m(W2 - .4), 0, m(1.1), z0, z0 + m(.18), { front: tt.STONE, top: tt.STONE }, { bias: top / 2 * .62 - z0 * .62 + 6 });
      S.tube([[m(W2 - 3.6), m(1.05), z0 + m(1)], [m(W2 - .4), m(1.05), z0 + m(1)]], m(.06), { color: '#e8e4da' }, { bias: top / 2 * .62 - z0 * .62 + 8 });
      for (let k = 0; k <= 8; k++) S.tube([[m(W2 - 3.6 + k * .4), m(1.05), z0 + m(.2)], [m(W2 - 3.6 + k * .4), m(1.05), z0 + m(1)]], m(.04), { color: '#e8e4da' }, { bias: top / 2 * .62 - z0 * .62 + 8, shine: false }); }
    tank(S, m(-W2 * .45), m(-d * .5), top, 1, 1.6); tank(S, m(W2 * .5), m(-d * .45), top, .8, 1.2);
    S.tube([[m(-W2 + .6), m(.2), top], [m(-W2 + .6), m(.2), m(.3)]], m(.11), { color: '#8a9296' }, { bias: 9 });
    S.tube([[m(-W2 + 1), m(.2), top], [m(-W2 + 1), m(.2), m(.3)]], m(.11), { color: '#8a9296' }, { bias: 9 });
    return S;
  }
  function ramen(o) {
    o = Object.assign({ name: '一楽', col: '#f0e6cf' }, o);
    const S = new ISO.Scene(), tt = T(), PL = mat(plaster('#e9dcc0', 6), 4), RF = mat(tiles('#7a3428', 6), 3);
    S.face([[m(-5), m(-5), 0], [m(5), m(-5), 0], [m(5), m(3), 0], [m(-5), m(3), 0]], tt.FLAG, { n: [0, 0, 1], O: [m(-5), m(-5), 0], U: [1, 0, 0], V: [0, 1, 0], ground: true });
    S.box(m(-4), m(4), m(-4), m(-.6), 0, m(3.4), { front: PL, top: tt.DARK });
    S.box(m(-3.6), m(3.6), m(-.6), m(.5), 0, m(1.1), { front: tt.WOOD, top: tt.DARK }, { bias: 3 });        // counter
    S.box(m(-3.8), m(3.8), m(-.6), m(.7), m(1.1), m(1.2), { front: tt.DARK, top: mat(plaster('#d8c9a2', 7), 2) }, { bias: 4 });
    for (const x of [-3.9, 3.6]) S.box(m(x), m(x + .3), m(.4), m(.7), 0, m(3.4), { front: tt.DARK }, { bias: 5 });
    S.decal(m(-3.6), m(3.6), m(.72), m(2.15), m(3.4), mat(noren('ラーメン一楽', '#c8352c'), 7.2, { whole: true }), { bias: 7 });
    S.hip(m(-4), m(4), m(-4), m(.7), m(3.4), m(4.8), RF, { over: m(.8), fascia: tt.DARK, ridge: .7, bias: 8 });
    S.decal(m(-1.6), m(1.6), m(.4), m(4.5), m(5.7), mat(sign(o.name, '#f2e2b4', '#b0261f', 256, 96), 3.2, { whole: true }), { bias: 12 });
    for (let i = 0; i < 5; i++) { const x = -3 + i * 1.5; S.cylinder(m(x), m(1.4), m(.35), m(.7), m(.85), { color: '#c8352c' }, 12, { bias: 9 }); S.cylinder(m(x), m(1.4), m(.08), 0, m(.7), { color: '#3a3a3a' }, 6, { cap: false, bias: 8 }); }
    for (const x of [-4.4, 4.4]) { S.sphere(m(x), m(.9), m(2.6), m(.5), { color: '#e8402f' }, { bands: 5, seg: 12, squash: 1.3, bias: 12 }); S.tube([[m(x), m(.9), m(3.3)], [m(x), m(.9), m(3.6)]], m(.05), { color: '#222' }, { bias: 12 }); }
    return S;
  }
  function shop(o) {
    o = Object.assign({ w: 7, d: 5, wall: '#e3d4b4', roof: '#3f6e5a', a: '#e2b04a', b: '#f4efe2', name: '道具屋', seed: 9 }, o);
    const S = new ISO.Scene(), tt = T(), PL = mat(plaster(o.wall, o.seed), 4), RF = mat(tiles(o.roof, o.seed), 3.4), W2 = o.w / 2;
    S.face([[m(-W2 - 1), m(-o.d), 0], [m(W2 + 1), m(-o.d), 0], [m(W2 + 1), m(2.5), 0], [m(-W2 - 1), m(2.5), 0]], tt.FLAG, { n: [0, 0, 1], O: [m(-W2 - 1), m(-o.d), 0], U: [1, 0, 0], V: [0, 1, 0], ground: true });
    S.box(m(-W2), m(W2), m(-o.d), 0, 0, m(5.6), { front: PL, top: tt.DARK }, { eave: m(.6) });
    S.decal(m(-W2 + .6), m(W2 - .6), m(.02), m(.2), m(2.6), mat(windowTex('#4a3020', 'glass'), o.w - 1.2, { whole: false }), { bias: 3, wall: [0, m(5.6)] });
    S.decal(m(-.8), m(.8), m(.03), 0, m(2.7), mat(doorTex('#4a3020'), 1.6, { whole: true }), { bias: 4, wall: [0, m(5.6)] });
    // striped awning sloping out over the shop window
    S.face([[m(-W2 - .1), 0, m(3.3)], [m(W2 + .1), 0, m(3.3)], [m(W2 + .1), m(1.6), m(2.7)], [m(-W2 - .1), m(1.6), m(2.7)]], mat(awning(o.a, o.b), 2), { O: [m(-W2), 0, m(3.3)], U: [1, 0, 0], V: ISO.norm([0, 1.6, -.6]), bias: 6 });
    S.box(m(-W2 - .1), m(W2 + .1), m(1.6), m(1.65), m(2.4), m(2.7), { front: mat(awning(o.a, o.b), 2) }, { bias: 7 });
    S.decal(m(-1.8), m(1.8), m(.03), m(3.8), m(5), mat(sign(o.name, '#3a2618', '#f2d27a', 256, 84), 3.6, { whole: true }), { bias: 5, wall: [0, m(5.6)] });
    S.gable(m(-W2), m(W2), m(-o.d), 0, m(5.6), m(5.6 + o.d * .4), RF, { over: m(.6), fascia: tt.DARK, bias: 8 });
    for (let i = 0; i < 3; i++) S.box(m(-W2 + .4 + i * .9), m(-W2 + 1.2 + i * .9), m(.3), m(1.1), 0, m(.6 + (i % 2) * .2), { front: tt.WOOD2, top: tt.WOOD2 }, { bias: 9 });   // crates
    S.cylinder(m(W2 - .8), m(.8), m(.45), 0, m(1), tt.WOOD, 12, { bias: 9 });                                                                           // barrel
    return S;
  }
  function pole(o) {
    o = o || {}; const S = new ISO.Scene(), tt = T(), h = o.h || 9;
    S.cylinder(0, 0, m(.18), 0, m(h), mat(bark(), 1), 10, { bias: 0 });
    S.box(m(-1.2), m(1.2), m(-.1), m(.1), m(h - 1), m(h - .8), { front: tt.DARK, top: tt.DARK }, { bias: 2 });
    for (const x of [-1, -.35, .35, 1]) S.cylinder(m(x), 0, m(.07), m(h - .8), m(h - .55), { color: '#e8e2d2' }, 6, { bias: 3 });
    S.box(m(.2), m(.6), m(.15), m(.55), m(h - 3), m(h - 2.2), { front: mat(metal(), .5), top: mat(metal(), .5) }, { bias: 3 });
    return S;
  }
  function tree(o) { o = Object.assign({ kind: 'round', h: 6, seed: 1 }, o); const S = new ISO.Scene(); S.sprite(0, 0, 0, TREES.make({ kind: o.kind === 'pine' ? 'pine' : o.blossom ? 'sakura' : 'broad', h: o.h * 1.15, seed: o.seed })); return S; }
  function tree3d(o) {
    o = Object.assign({ kind: 'round', h: 6, r: 2.6, leaf: '#4f8a3a', seed: 1 }, o);
    const S = new ISO.Scene(), r = rng(o.seed), LF = mat(leafTex(o.leaf, o.seed), 2.4), BK = mat(bark(), 1);
    if (o.kind === 'pine') { S.cylinder(0, 0, m(.3), 0, m(o.h * .4), BK, 10, { cap: false });
      for (let i = 0; i < 4; i++) { const z = o.h * (.25 + i * .18), rr = o.r * (1 - i * .2); S.frustum(0, 0, m(rr), m(rr * .2), m(z), m(z + o.h * .3), LF, { seg: 16, bias: 2 + i }); }
      return S; }
    S.cylinder(0, 0, m(.32), 0, m(o.h * .55), BK, 10, { cap: false });
    S.tube([[0, 0, m(o.h * .45)], [m(.9), m(.2), m(o.h * .65)]], m(.14), { color: '#6b4a30' }, { bias: 1 });
    const blobs = [[0, 0, o.h * .7, o.r], [-o.r * .55, .2, o.h * .58, o.r * .7], [o.r * .55, -.2, o.h * .6, o.r * .72], [r() * .6 - .3, .4, o.h * .9, o.r * .62]];
    blobs.forEach(([x, y, z, rr], i) => S.sphere(m(x), m(y), m(z), m(rr), LF, { bands: 6, seg: 16, bias: 3 + i, squash: .85 }));
    if (o.blossom) for (let i = 0; i < 26; i++) { const a = r() * 6.28, rr = o.r * (.5 + r() * .5); S.sphere(m(Math.cos(a) * rr), m(Math.sin(a) * rr * .6 + .4), m(o.h * (.55 + r() * .4)), m(.18), { color: o.blossom }, { bands: 2, seg: 6, bias: 9 }); }
    return S;
  }
  function lantern() { const S = new ISO.Scene(), tt = T();
    S.box(m(-.35), m(.35), m(-.35), m(.35), 0, m(.4), { front: tt.STONE, top: tt.STONE });
    S.cylinder(0, 0, m(.15), m(.4), m(1.3), tt.STONE, 10, { cap: false });
    S.box(m(-.45), m(.45), m(-.45), m(.45), m(1.3), m(1.9), { front: { color: '#f4d98a' }, top: tt.STONE }, { bias: 2 });
    S.hip(m(-.45), m(.45), m(-.45), m(.45), m(1.9), m(2.3), tt.STONE, { over: m(.2), ridge: .05, bias: 3 });
    return S; }
  function bench() { const S = new ISO.Scene(), tt = T(); S.box(m(-1.2), m(1.2), m(-.3), m(.3), m(.42), m(.52), { front: tt.WOOD, top: tt.WOOD }, { bias: 2 });
    for (const x of [-1, .9]) S.box(m(x), m(x + .12), m(-.25), m(.25), 0, m(.42), { front: tt.DARK }, { bias: 1 }); return S; }
  function trainingPost() { const S = new ISO.Scene(), tt = T(); S.cylinder(0, 0, m(.25), 0, m(1.7), tt.WOOD, 12, { cap: true });
    for (const z of [.5, 1.2]) S.cylinder(0, 0, m(.27), m(z), m(z + .15), { color: '#c9a35a' }, 12, { cap: false, bias: 2 }); return S; }
  function fence(len) { const S = new ISO.Scene(), tt = T(); for (let x = 0; x <= len; x += 1) S.box(m(x - .08), m(x + .08), m(-.08), m(.08), 0, m(1.1), { front: tt.WOOD2, top: tt.WOOD2 }, { bias: 1 });
    for (const z of [.4, .85]) S.box(0, m(len), m(.08), m(.14), m(z), m(z + .12), { front: tt.WOOD2, top: tt.WOOD2 }, { bias: 2 }); return S; }
  function rock(o) { o = o || {}; const S = new ISO.Scene(), tt = T(); S.sphere(0, 0, m(.3), m(o.r || 1), mat(K.textures().stone, 2), { bands: 4, seg: 10, squash: .6 }); S.sphere(m(.6), m(.3), m(.2), m((o.r || 1) * .55), mat(K.textures().stone, 2), { bands: 4, seg: 9, squash: .6, bias: 2 }); return S; }
  function bush(o) { o = o || {}; const S = new ISO.Scene(); S.sprite(0, 0, 0, TREES.make({ kind: 'bush', seed: o.seed || 3, flowers: o.flowers })); return S; }
  function bush3d(o) { o = o || {}; const S = new ISO.Scene(), LF = mat(leafTex(o.leaf || '#4a7f35', 5), 1.6); S.sphere(0, 0, m(.5), m(.9), LF, { bands: 4, seg: 12, squash: .8 }); S.sphere(m(.7), m(.2), m(.4), m(.65), LF, { bands: 4, seg: 10, squash: .8, bias: 2 }); S.sphere(m(-.6), m(.25), m(.35), m(.6), LF, { bands: 4, seg: 10, squash: .8, bias: 2 }); return S; }
  return { house, apartment, ramen, shop, pole, tree, lantern, bench, trainingPost, fence, rock, bush, tank, plaster, tiles, windowTexPub: windowTex, doorTexPub: doorTex };
})();
