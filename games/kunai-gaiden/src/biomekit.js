/* Kunai Gaiden — shared building kit for the remaining regions (Kiri, Suna, Iwa, Kusa, Taki, Ame, Kumo, Iron, Snow, Uzushio).
   Textured ISO volumes (round drums, blocks, towers, bridges, walls, gates) and textured painted props, all parameterised
   by colour and material so each village keeps its own look. Units: metres (24 world units each), front = +y. */
window.KBIOME = (() => {
  const M = 24, TAU = Math.PI * 2, m = v => v * M, SPn = Math.sin(38 * Math.PI / 180), CP = Math.cos(38 * Math.PI / 180);
  const rng = PK.rng, cache = {};
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  // surface textures, generated per (kind, colour)
  function surface(kind, col) { const id = kind + col; if (cache[id]) return cache[id]; const r = rng(id.length * 31 + kind.charCodeAt(0));
    const t = ISO.texture('kb-' + id, 128, 128, (g, W, H) => { g.fillStyle = col; g.fillRect(0, 0, W, H); const lt = mix(col, '#ffffff', .25), dk = mix(col, '#000000', .3);
      const speck = (n, a) => { for (let i = 0; i < n; i++) { g.fillStyle = r() < .5 ? lt : dk; g.globalAlpha = a; g.beginPath(); g.ellipse(r() * W, r() * H, 2 + r() * 8, 1.5 + r() * 4, r() * 3, 0, TAU); g.fill(); } g.globalAlpha = 1; };
      if (kind === 'plaster' || kind === 'clay') { speck(160, .18); if (kind === 'clay') { g.strokeStyle = dk; g.globalAlpha = .35; g.lineWidth = 1; for (let i = 0; i < 8; i++) { let x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - .5) * 16; y += 4 + r() * 8; g.lineTo(x, y); } g.stroke(); } g.globalAlpha = 1; } }
      if (kind === 'stone') { for (let y = 0; y < H; y += 32) for (let x = (y / 32 % 2) * 24; x < W + 24; x += 48) { const v = r() * .25; g.fillStyle = mix(col, v > .12 ? '#ffffff' : '#000000', Math.abs(v - .12)); g.fillRect(x + 1.5, y + 1.5, 45, 29); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + 1.5, y + 1.5, 45, 4); } g.fillStyle = dk; g.globalAlpha = .6; for (let y = 0; y < H; y += 32) g.fillRect(0, y, W, 2); g.globalAlpha = 1; }
      if (kind === 'wood') { for (let x = 0; x < W; x += 16) { g.fillStyle = mix(col, r() < .5 ? '#ffffff' : '#000000', r() * .15); g.fillRect(x, 0, 15, H); g.fillStyle = dk; g.fillRect(x + 15, 0, 1.4, H); } g.strokeStyle = dk; g.globalAlpha = .3; for (let i = 0; i < 30; i++) { const x = r() * W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 2, H); g.stroke(); } g.globalAlpha = 1; }
      if (kind === 'metal') { for (let y = 0; y < H; y += 32) for (let x = 0; x < W; x += 64) { g.fillStyle = mix(col, r() < .5 ? '#ffffff' : '#000000', r() * .14); g.fillRect(x + 1, y + 1, 62, 30); g.fillStyle = dk; for (const [a, b] of [[4, 4], [58, 4], [4, 26], [58, 26]]) { g.beginPath(); g.arc(x + a, y + b, 1.6, 0, TAU); g.fill(); } }
        for (let i = 0; i < 12; i++) { const x = r() * W, y0 = r() * H, q = g.createLinearGradient(0, y0, 0, y0 + 40); q.addColorStop(0, 'rgba(120,60,30,.4)'); q.addColorStop(1, 'rgba(120,60,30,0)'); g.fillStyle = q; g.fillRect(x, y0, 3, 40); } }
      if (kind === 'tiles') { for (let x = 0; x < W; x += 16) { const q = g.createLinearGradient(x, 0, x + 16, 0); q.addColorStop(0, lt); q.addColorStop(.5, col); q.addColorStop(1, dk); g.fillStyle = q; g.fillRect(x, 0, 15, H); } g.fillStyle = dk; for (let y = 0; y < H; y += 16) g.fillRect(0, y, W, 2); }
      if (kind === 'rock') { for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * H, w = 14 + r() * 30; g.fillStyle = mix(col, r() < .5 ? '#ffffff' : '#000000', r() * .2); g.beginPath(); g.ellipse(x, y, w, w * .5, (r() - .5) * .5, 0, TAU); g.fill(); } g.strokeStyle = dk; g.lineWidth = 1.6; for (let i = 0; i < 10; i++) { let x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - .5) * 14; y += 6 + r() * 8; g.lineTo(x, y); } g.stroke(); } }
      if (kind === 'ice') { const q = g.createLinearGradient(0, 0, W, H); q.addColorStop(0, lt); q.addColorStop(1, col); g.fillStyle = q; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1.2; for (let i = 0; i < 18; i++) { let x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 3; k++) { x += (r() - .5) * 30; y += (r() - .5) * 30; g.lineTo(x, y); } g.stroke(); } }
      if (kind === 'snow') { speck(220, .25); for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(r() * W, r() * H, 1 + r() * 2, 0, TAU); g.fill(); } }
      if (kind === 'thatch') { for (let i = 0; i < 500; i++) { g.strokeStyle = r() < .5 ? dk : lt; g.globalAlpha = .45; g.lineWidth = 1; const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y + 12 + r() * 8); g.stroke(); } g.globalAlpha = 1; }
      if (kind === 'glass') { const q = g.createLinearGradient(0, 0, W, H); q.addColorStop(0, lt); q.addColorStop(1, dk); g.fillStyle = q; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(10, 0, 8, H); g.fillRect(26, 0, 3, H); }
      if (kind === 'water') { g.fillStyle = col; g.fillRect(0, 0, W, H); for (let i = 0; i < 36; i++) { g.fillStyle = r() < .5 ? lt : dk; g.globalAlpha = .3; g.beginPath(); g.ellipse(16 + r() * (W - 32), 6 + r() * (H - 12), 8 + r() * 12, 3 + r() * 4, 0, 0, TAU); g.fill(); } g.globalAlpha = 1; g.strokeStyle = 'rgba(230,248,252,.35)'; g.lineWidth = 1.2; for (let i = 0; i < 26; i++) { const x = r() * (W - 24), y = 4 + r() * (H - 8); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8, y - 2, x + 18, y); g.stroke(); } }
    }); return cache[id] = t; }
  const mat = (kind, col, tw, x) => Object.assign({ tex: surface(kind, col), tw: m(tw || 2) }, x || {});
  const winTex = (frame, glass, lit) => { const id = 'win' + frame + glass + (lit ? 1 : 0); if (cache[id]) return cache[id];
    return cache[id] = ISO.texture('kb-' + id, 96, 128, (g, W, H) => { g.fillStyle = frame; g.fillRect(0, 0, W, H); const q = g.createLinearGradient(0, 0, W, H); q.addColorStop(0, lit ? '#ffe2a0' : mix(glass, '#ffffff', .3)); q.addColorStop(1, lit ? '#f0a848' : mix(glass, '#000000', .3)); g.fillStyle = q; g.fillRect(8, 8, W - 16, H - 16);
      g.fillStyle = frame; g.fillRect(W / 2 - 3, 8, 6, H - 16); g.fillRect(8, H / 2 - 3, W - 16, 6); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(14, 12, 6, H / 2 - 18); }); };
  const doorTex = (col) => { const id = 'door' + col; if (cache[id]) return cache[id]; return cache[id] = ISO.texture('kb-' + id, 96, 160, (g, W, H) => { g.fillStyle = mix(col, '#000000', .45); g.fillRect(0, 0, W, H); g.fillStyle = col; g.fillRect(8, 10, W / 2 - 10, H - 10); g.fillRect(W / 2 + 2, 10, W / 2 - 10, H - 10); g.fillStyle = 'rgba(0,0,0,.3)'; for (let y = 30; y < H; y += 30) g.fillRect(8, y, W - 16, 3); g.fillStyle = '#d8b060'; g.fillRect(W / 2 - 8, H / 2, 4, 14); g.fillRect(W / 2 + 4, H / 2, 4, 14); }); };
  const signTex = (txt, bg, fg, vertical) => { const id = 'sg' + txt + bg + (vertical ? 'v' : ''); if (cache[id]) return cache[id]; const w = vertical ? 80 : 90 * txt.length + 40, h = vertical ? 80 * txt.length + 30 : 110;
    return cache[id] = ISO.texture('kb-' + id, w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = mix(bg, '#000000', .5); g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6); g.fillStyle = fg; g.font = `900 ${vertical ? 62 : 74}px "Yu Mincho","Hiragino Mincho ProN",serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; [...txt].forEach((c, i) => vertical ? g.fillText(c, W / 2, 20 + 80 * (i + .5)) : g.fillText(c, 20 + 90 * (i + .5), H / 2 + 4)); }); };
  // a window or door laid tangent to a drum
  function panel(S, cx, cy, r, a, z0, z1, w, M2, bias) { const ux = Math.sin(a), uy = -Math.cos(a), rr = r + w * w / (8 * r) + .04, px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr, A = [m(px - ux * w / 2), m(py - uy * w / 2)], B = [m(px + ux * w / 2), m(py + uy * w / 2)];
    S.face([[A[0], A[1], m(z0)], [B[0], B[1], m(z0)], [B[0], B[1], m(z1)], [A[0], A[1], m(z1)]], M2, { n: [Math.cos(a), Math.sin(a), 0], O: [A[0], A[1], m(z1)], U: [ux, uy, 0], V: [0, 0, -1], bias }); }

  /* ---------- volumes ---------- */
  // a round building: drum, optional bands, windows around the camera side, a door facing the street, dome / cone / flat roof
  function drum(o) { o = Object.assign({ r: 4, h: 7, floors: 2, wall: ['plaster', '#d8d4c8'], roof: 'dome', roofMat: ['tiles', '#5a6a7a'], band: null, frame: '#3a3a40', glass: '#6a9ab0', door: '#5a4030', lit: false, cy: 0, sign: null }, o);
    const S = new ISO.Scene(), W = mat(o.wall[0], o.wall[1], 4), R = mat(o.roofMat[0], o.roofMat[1], 2.5), cy = -o.r + o.cy, wallH = o.h, low = z => Math.max(0, wallH / 2 - z) * 24 * .62 + 4;
    S.cylinder(0, m(cy), m(o.r), 0, m(wallH), W, 30, { cap: o.roof === 'flat', eave: m(.4) });
    if (o.band) for (let f = 1; f < o.floors; f++) S.frustum(0, m(cy), m(o.r + .35), m(o.r + .05), m(f * wallH / o.floors - .3), m(f * wallH / o.floors), mat(o.band[0], o.band[1], 2), { seg: 30, bias: 6 });
    const fh = wallH / o.floors; for (let f = 0; f < o.floors; f++) for (const a of [Math.PI / 2 - .55, Math.PI / 2, Math.PI / 2 + .55]) { if (!f && a === Math.PI / 2 && o.door) continue; panel(S, 0, cy, o.r, a, f * fh + fh * .3, f * fh + fh * .78, .9, { tex: winTex(o.frame, o.glass, o.lit), tw: m(.9), whole: true }, low(f * fh + fh * .5)); }
    if (o.door) { panel(S, 0, cy, o.r, Math.PI / 2, 0, Math.min(2.4, fh * .85), 1.5, { tex: doorTex(o.door), tw: m(1.5), whole: true }, low(1.2) + 2); }
    if (o.sign) panel(S, 0, cy, o.r, Math.PI / 2, wallH - 1.4, wallH - .3, 2.6, { tex: signTex(o.sign, '#2a2a30', '#f2d27a'), tw: m(2.6), whole: true }, 8);
    if (o.roof === 'dome') S.sphere(0, m(cy), m(wallH), m(o.r + .4), R, { bands: 5, seg: 30, squash: .55, bias: 10 });
    if (o.roof === 'cone') S.frustum(0, m(cy), m(o.r + .8), m(.2), m(wallH), m(wallH + o.r * 1.1), R, { seg: 30, bias: 10 });
    if (o.roof === 'flat') S.ringWall(0, m(cy), m(o.r - .3), m(o.r + .05), m(wallH), m(wallH + .5), 0, TAU, W, mat(o.roofMat[0], o.roofMat[1], 2), { seg: 30, bias: 10 });
    if (o.roof === 'cap') { S.frustum(0, m(cy), m(o.r + .6), m(o.r * .55), m(wallH), m(wallH + o.r * .35), R, { seg: 30, bias: 10 }); S.disc(0, m(cy), m(o.r * .55), m(wallH + o.r * .35), W, { seg: 24, bias: 11 }); }
    return S; }
  // a rectangular building: windows grid, a centred door, flat (parapet) / gable / hip roof
  function block(o) { o = Object.assign({ w: 8, d: 7, h: 6, floors: 2, wall: ['plaster', '#d8d4c8'], roof: 'flat', roofMat: ['tiles', '#5a5a64'], frame: '#3a3a40', glass: '#6a9ab0', door: '#5a4030', lit: false, sign: null, base: null, pipes: false }, o);
    const S = new ISO.Scene(), W = mat(o.wall[0], o.wall[1], 4), R = mat(o.roofMat[0], o.roofMat[1], 2.5), W2 = o.w / 2, top = m(o.h), fh = o.h / o.floors;
    if (o.base) S.box(m(-W2 - .2), m(W2 + .2), m(-o.d - .2), m(.2), 0, m(.6), { front: mat(o.base[0], o.base[1], 2), top: mat(o.base[0], o.base[1], 2) });
    S.box(m(-W2), m(W2), m(-o.d), 0, o.base ? m(.6) : 0, top, { front: W, top: mat(o.roofMat[0], mix(o.roofMat[1], '#000000', .2), 3), left: W, right: W }, { eave: m(.4) });
    const n = Math.max(1, Math.floor((o.w - 1) / 2.2));
    for (let f = 0; f < o.floors; f++) for (let i = 0; i < n; i++) { const cx = n === 1 ? 0 : -W2 + 1.2 + (o.w - 2.4) * i / (n - 1); if (!f && o.door && Math.abs(cx) < 1.3) continue; S.decal(m(cx - .55), m(cx + .55), m(.02), m(f * fh + fh * .3), m(f * fh + fh * .8), { tex: winTex(o.frame, o.glass, o.lit), tw: m(1.1), whole: true }, { wall: [0, top], bias: 4 }); }
    if (o.door) S.decal(m(-.8), m(.8), m(.03), o.base ? m(.6) : 0, m(Math.min(2.5, fh * .9)), { tex: doorTex(o.door), tw: m(1.6), whole: true }, { wall: [0, top], bias: 5 });
    if (o.sign) S.decal(m(-1.6), m(1.6), m(.04), top - m(1.2), top - m(.3), { tex: signTex(o.sign, '#2a2a30', '#f2d27a'), tw: m(3.2), whole: true }, { wall: [0, top], bias: 6 });
    if (o.roof === 'flat') for (const [a0, a1, b0, b1] of [[-W2 - .1, W2 + .1, -.3, .1], [-W2 - .1, W2 + .1, -o.d - .1, -o.d + .3], [-W2 - .1, -W2 + .3, -o.d, 0], [W2 - .3, W2 + .1, -o.d, 0]]) S.box(m(a0), m(a1), m(b0), m(b1), top, top + m(.5), { front: W, top: R }, { bias: 3 });
    if (o.roof === 'gable') S.gable(m(-W2 - .1), m(W2 + .1), m(-o.d), 0, top, top + m(o.d * .35), R, { over: m(.6), fascia: mat('wood', '#2a2018', 1), bias: 10 });
    if (o.roof === 'hip') S.hip(m(-W2 - .1), m(W2 + .1), m(-o.d), 0, top, top + m(Math.min(o.w, o.d) * .35), R, { over: m(.8), ridge: .5, fascia: mat('wood', '#2a2018', 1), bias: 10 });
    if (o.pipes) for (const x of [-W2 + .5, W2 - .7]) S.tube([[m(x), m(.25), top + m(.5)], [m(x), m(.25), m(.2)]], m(.14), { color: '#6a6e72' }, { bias: 9 });
    return S; }
  // a tall tower: square or round shaft, platform or cone on top
  function tower(o) { o = Object.assign({ w: 3, h: 16, round: false, wall: ['stone', '#8a8478'], top: 'cone', roofMat: ['tiles', '#5a5a64'], frame: '#3a3a40', glass: '#6a9ab0', lit: false }, o);
    const S = new ISO.Scene(), W = mat(o.wall[0], o.wall[1], 3), R = mat(o.roofMat[0], o.roofMat[1], 2), w = o.w / 2, cy = -w;
    if (o.round) S.cylinder(0, m(cy), m(w), 0, m(o.h), W, 22, { cap: true }); else S.box(m(-w), m(w), m(cy - w), m(cy + w), 0, m(o.h), { front: W, top: W, left: W, right: W });
    for (let z = 2; z < o.h - 2; z += 3) S.decal(m(-.4), m(.4), m(cy + w + .03), m(z), m(z + 1.2), { tex: winTex(o.frame, o.glass, o.lit), tw: m(.8), whole: true }, { bias: 4 });
    if (o.top === 'cone') o.round ? S.frustum(0, m(cy), m(w + .6), m(.1), m(o.h), m(o.h + w * 2.2), R, { seg: 22, bias: 8 }) : S.hip(m(-w - .3), m(w + .3), m(cy - w - .3), m(cy + w + .3), m(o.h), m(o.h + w * 2), R, { over: m(.6), ridge: .05, bias: 8 });
    if (o.top === 'platform') { S.box(m(-w - .8), m(w + .8), m(cy - w - .8), m(cy + w + .8), m(o.h), m(o.h + .3), { front: W, top: W }, { bias: 8 }); S.hip(m(-w - .9), m(w + .9), m(cy - w - .9), m(cy + w + .9), m(o.h + 2.3), m(o.h + 3.3), R, { over: m(.4), ridge: .05, bias: 9 });
      for (const [x, y] of [[-w - .6, cy - w - .6], [w + .6, cy - w - .6], [-w - .6, cy + w + .6], [w + .6, cy + w + .6]]) S.box(m(x - .1), m(x + .1), m(y - .1), m(y + .1), m(o.h + .3), m(o.h + 2.3), { front: W, left: W }, { bias: 8 }); }
    return S; }
  // a straight bridge span on posts or arches
  function bridgeSpan(o) { o = Object.assign({ len: 12, w: 3, z: 3, mat: ['wood', '#7a5a3a'], rail: true, posts: true }, o); const S = new ISO.Scene(), D = mat(o.mat[0], o.mat[1], 2), L = o.len;
    if (o.posts) for (let x = 0; x <= L; x += 4) for (const y of [-o.w, 0]) S.box(m(x - .15), m(x + .15), m(y - .15), m(y + .15), 0, m(o.z), { front: D, left: D, right: D }, { bias: 1 });
    S.box(0, m(L), m(-o.w), 0, m(o.z), m(o.z + .3), { front: D, top: D }, { bias: 3 });
    if (o.rail) for (const y of [-o.w, -.1]) { S.box(0, m(L), m(y), m(y + .1), m(o.z + 1), m(o.z + 1.12), { front: D, top: D }, { bias: 5 }); for (let x = 0; x <= L; x += 1.5) S.box(m(x - .06), m(x + .06), m(y), m(y + .1), m(o.z + .3), m(o.z + 1), { front: D }, { bias: 5 }); }
    return S; }
  // a defensive wall segment with optional crenels
  function wallSeg(o) { o = Object.assign({ len: 10, h: 4, t: 1.2, mat: ['stone', '#8a8478'], cren: true, cap: null }, o); const S = new ISO.Scene(), W = mat(o.mat[0], o.mat[1], 3);
    S.box(0, m(o.len), m(-o.t), 0, 0, m(o.h), { front: W, top: W, left: W, right: W });
    if (o.cren) for (let x = 0; x < o.len; x += 1.2) S.box(m(x), m(x + .6), m(-o.t), 0, m(o.h), m(o.h + .6), { front: W, top: W }, { bias: 2 });
    if (o.cap) S.gable(m(-.2), m(o.len + .2), m(-o.t - .3), m(.3), m(o.h), m(o.h + .5), mat(o.cap[0], o.cap[1], 2), { over: m(.2), bias: 3 });
    return S; }
  // a gate: two pillars, a lintel, a name board
  function gate(o) { o = Object.assign({ w: 8, h: 6, mat: ['stone', '#8a8478'], roof: null, sign: null, signBg: '#2a2a30' }, o); const S = new ISO.Scene(), W = mat(o.mat[0], o.mat[1], 2), w = o.w / 2;
    for (const x of [-w, w]) S.box(m(x - .6), m(x + .6), m(-.6), m(.6), 0, m(o.h), { front: W, left: W, right: W, top: W }, { bias: 3 });
    S.box(m(-w - .9), m(w + .9), m(-.7), m(.7), m(o.h), m(o.h + .8), { front: W, top: W }, { bias: 5 });
    if (o.sign) S.decal(m(-2), m(2), m(.72), m(o.h - 1.6), m(o.h - .2), { tex: signTex(o.sign, o.signBg, '#f2d27a'), tw: m(4), whole: true }, { bias: 8 });
    if (o.roof) S.hip(m(-w - 1.2), m(w + 1.2), m(-1.2), m(1.2), m(o.h + .8), m(o.h + 2), mat(o.roof[0], o.roof[1], 2), { over: m(.5), ridge: .4, bias: 10 });
    return S; }

  /* ---------- textured painted props ---------- */
  const { box, cyl, fill, poly, pat, ell, shadow, obj, scene, moss, engrave } = PK;
  const lg = (g, x0, y0, x1, y1, st) => { const q = g.createLinearGradient(x0, y0, x1, y1); st.forEach((c, i) => q.addColorStop(i / (st.length - 1), c)); return q; };
  const tint = (g, path, col, a) => { path(); g.globalAlpha = a; g.fillStyle = col; g.fill(); g.globalAlpha = 1; };
  // a cluster of rocks in a given tint
  function rocks(o) { o = Object.assign({ n: 4, s: 1.4, col: null, seed: 3, moss: .5, id: 'granite' }, o); const R0 = o.s * M;
    return scene(obj({ x0: -R0 * 2.6, y0: -R0 * 1.8, x1: R0 * 2.6, y1: 12 }, (g, layer) => { const r = rng(o.seed); if (layer !== 'objects') { shadow(g, R0 * 1.8); if (layer === 'ground') return; }
      const rs = []; for (let i = 0; i < o.n; i++) rs.push([(r() - .5) * R0 * 2.6, (r() - .3) * R0 * .5, R0 * (.45 + r() * .6)]); rs.sort((a, b) => a[1] - b[1]);
      for (const [x, y, rr] of rs) { const pts = []; for (let i = 0; i <= 9; i++) { const a = Math.PI + i / 9 * Math.PI, k = .8 + r() * .35; pts.push([x + Math.cos(a) * rr * k, y + Math.sin(a) * rr * .9 * k]); }
        const p = () => { g.beginPath(); g.moveTo(x - rr, y); pts.forEach(q => g.lineTo(q[0], q[1])); g.lineTo(x + rr, y); g.ellipse(x, y, rr, rr * .25, 0, 0, Math.PI); g.closePath(); };
        fill(g, p, o.id, 'front', [x - rr, y - rr, x + rr, y]); if (o.col) tint(g, p, o.col, .35); p(); g.fillStyle = lg(g, x - rr, y - rr, x + rr, y, ['rgba(255,250,235,.25)', 'rgba(0,0,0,0)', 'rgba(15,12,8,.4)']); g.fill(); if (o.moss) moss(g, p, x - rr, y, rr * 2, rr * o.moss, (x | 0) + o.seed); } })); }
  // a stack of crates and barrels
  function cargo(o) { o = Object.assign({ wood: 'wood', seed: 5 }, o); const U = M * .8;
    return scene(obj({ x0: -U * 2.4, y0: -U * 2.4, x1: U * 2.6, y1: 8 }, (g, layer) => { if (layer !== 'objects') { shadow(g, U * 2); if (layer === 'ground') return; }
      box(g, -U * 2, 0, U * 1.3, U * 1, U * 1.1, o.wood); box(g, -U * .6, 0, U * 1.1, U * .9, U * 1, o.wood); box(g, -U * 1.7, -U, U * 1.1, U * .9, U * 1, o.wood);
      for (const x of [U * 1.0, U * 1.85]) { cyl(g, x, 0, U * .42, U * 1, 'darkwood', {}); for (const k of [.2, .8]) { g.strokeStyle = '#3a3a3a'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, -U * k, U * .42, U * .42 * SPn * .5, 0, 0, Math.PI); g.stroke(); } } })); }
  // a lamp on a post (paper, metal or stone)
  function lamp(o) { o = Object.assign({ post: 'darkwood', shade: 'washi', glow: '#ffc870', h: 3 }, o); const U = M;
    return scene(obj({ x0: -U * 1.6, y0: -U * (o.h + 1.6), x1: U * 1.6, y1: 8 }, (g, layer) => { if (layer !== 'objects') { shadow(g, U * .5); const q = g.createRadialGradient(0, -U * o.h, 2, 0, -U * o.h, U * 2); q.addColorStop(0, o.glow + '66'); q.addColorStop(1, o.glow + '00'); g.fillStyle = q; g.fillRect(-U * 2, -U * (o.h + 2), U * 4, U * 4); if (layer === 'ground') return; }
      box(g, -U * .08, 0, U * .16, U * o.h, U * .16, o.post); box(g, -U * .3, -U * o.h, U * .6, U * .7, U * .6, o.shade); g.fillStyle = o.glow + 'aa'; g.fillRect(-U * .3, -U * (o.h + .7), U * .6, U * .7);
      fill(g, poly(g, [[-U * .45, -U * (o.h + .7)], [-U * .05, -U * (o.h + 1.05)], [U * .25, -U * (o.h + 1.05)], [U * .6, -U * (o.h + .7)]]), o.post, 'top'); })); }
  // a banner on a pole
  function banner(o) { o = Object.assign({ txt: '霧', col: '#2a4a8a' }, o); const U = M;
    return scene(obj({ x0: -U, y0: -U * 4.4, x1: U * 1.2, y1: 6 }, (g, layer) => { if (layer !== 'objects') { shadow(g, U * .4); if (layer === 'ground') return; }
      box(g, -2, 0, 4, U * 4.2, 4, 'darkwood'); const fl = poly(g, [[2, -U * 4.1], [U * .7, -U * 4.1], [U * .72, -U * 1.4], [2, -U * 1.35]]); fill(g, fl, 'washi', 'front'); tint(g, fl, o.col, .82);
      g.fillStyle = '#f6eed8'; g.font = `900 ${U * .5}px "Yu Mincho",serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; [...o.txt].forEach((c, i) => g.fillText(c, U * .36, -U * (3.5 - i * .7))); })); }
  // a tent
  function tent(o) { o = Object.assign({ col: '#c8b088', w: 4 }, o); const U = M, W = U * o.w;
    return scene(obj({ x0: -W * .7, y0: -U * 3, x1: W * .7, y1: 8 }, (g, layer) => { if (layer !== 'objects') { shadow(g, W * .55); if (layer === 'ground') return; }
      const c = () => { g.beginPath(); g.moveTo(-W * .55, 0); g.lineTo(0, -U * 2.6); g.lineTo(W * .55, 0); g.closePath(); }; fill(g, c, 'washi', 'front'); tint(g, c, o.col, .6); c(); g.fillStyle = lg(g, -W / 2, 0, W / 2, 0, ['rgba(255,250,235,.25)', 'rgba(0,0,0,0)', 'rgba(15,12,8,.35)']); g.fill();
      g.fillStyle = 'rgba(30,24,16,.75)'; g.beginPath(); g.moveTo(-U * .55, 0); g.lineTo(0, -U * 1.7); g.lineTo(U * .55, 0); g.closePath(); g.fill(); box(g, -U * .05, -U * 2.5, U * .1, U * .5, U * .1, 'darkwood'); })); }
  // a campfire
  function fire() { const R = M * .9;
    return scene(obj({ x0: -R * 2, y0: -R * 3, x1: R * 2, y1: 12 }, (g, layer) => { if (layer !== 'objects') { const q = g.createRadialGradient(0, 0, 4, 0, 0, R * 2.2); q.addColorStop(0, 'rgba(255,170,70,.35)'); q.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = q; g.fillRect(-R * 2.2, -R * 1.2, R * 4.4, R * 2.4); ell(g, 0, 0, R * .8, R * .3, '#2a1e16'); if (layer === 'ground') return; }
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, x = Math.cos(a) * R, y = Math.sin(a) * R * .42; box(g, x - R * .2, y, R * .4, R * .22, R * .3, 'granite'); }
      for (const [w, h, c] of [[R * .6, R * 1.6, '#e0502a'], [R * .45, R * 1.25, '#f08a2a'], [R * .28, R * .9, '#ffd25a']]) { g.fillStyle = c; g.beginPath(); g.moveTo(-w, -4); g.quadraticCurveTo(-w * .9, -h * .5, -w * .1, -h); g.quadraticCurveTo(w * .1, -h * .55, w * .3, -h * .7); g.quadraticCurveTo(w * .9, -h * .4, w, -4); g.closePath(); g.fill(); } })); }
  // a low fence segment
  function fence(o) { o = Object.assign({ len: 5, id: 'oldwood', h: 1.1 }, o); const U = M, L = U * o.len;
    return scene(obj({ x0: -U * .3, y0: -U * (o.h + .4), x1: L + U * .3, y1: 8 }, (g, layer) => { if (layer !== 'objects') { ell(g, L / 2, 3, L * .55, 6, 'rgba(20,16,10,.25)'); if (layer === 'ground') return; }
      for (let x = 0; x <= L; x += U * .9) box(g, x - 3, 0, 6, U * o.h, 6, o.id); for (const y of [-U * o.h * .4, -U * o.h * .85]) fill(g, poly(g, [[0, y], [L, y], [L, y + 5], [0, y + 5]]), o.id, 'front'); })); }
  // a cart
  function cart(o) { o = Object.assign({ load: 'straw' }, o); const U = M * .9;
    return scene(obj({ x0: -U * 2.8, y0: -U * 2.4, x1: U * 2.8, y1: 12 }, (g, layer) => { if (layer !== 'objects') { shadow(g, U * 2); if (layer === 'ground') return; }
      box(g, -U * 1.8, -U * .7, U * 3.2, U * .5, U * 1.5, 'wood'); g.strokeStyle = '#3a2616'; g.lineWidth = 3; g.beginPath(); g.moveTo(U * 1.4, -U * .85); g.lineTo(U * 2.7, -U * .5); g.stroke();
      fill(g, () => { g.beginPath(); g.ellipse(-U * .2, -U * 1.3, U * 1.4, U * .45, 0, Math.PI, TAU); g.closePath(); }, o.load, 'top');
      for (const x of [-U * 1.3, U * .9]) { g.strokeStyle = '#2a1a10'; g.lineWidth = 3.5; g.beginPath(); g.ellipse(x, -U * .35, U * .36, U * .36, 0, 0, TAU); g.stroke(); g.lineWidth = 1.2; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; g.beginPath(); g.moveTo(x, -U * .35); g.lineTo(x + Math.cos(a) * U * .34, -U * .35 + Math.sin(a) * U * .34); g.stroke(); } } })); }
  // pots and jars
  function jars(o) { o = Object.assign({ id: 'clay', col: '#b06a3a' }, o); const U = M * .7;
    return scene(obj({ x0: -U * 2, y0: -U * 2, x1: U * 2.2, y1: 8 }, (g, layer) => { if (layer !== 'objects') { shadow(g, U * 1.6); if (layer === 'ground') return; }
      for (const [x, s] of [[-U * 1.1, 1], [0, 1.25], [U * 1.1, .85]]) { const p = () => { g.beginPath(); g.moveTo(x - U * .2 * s, -U * 1.3 * s); g.quadraticCurveTo(x - U * .7 * s, -U * .9 * s, x - U * .4 * s, 0); g.lineTo(x + U * .4 * s, 0); g.quadraticCurveTo(x + U * .7 * s, -U * .9 * s, x + U * .2 * s, -U * 1.3 * s); g.closePath(); };
        fill(g, p, o.id, 'front', [x - U * .6 * s, -U * 1.3 * s, x, 0]); if (o.col) tint(g, p, o.col, .25); p(); g.fillStyle = lg(g, x - U * .6 * s, 0, x + U * .6 * s, 0, ['rgba(255,240,210,.3)', 'rgba(0,0,0,0)', 'rgba(0,0,0,.35)']); g.fill(); ell(g, x, -U * 1.3 * s, U * .22 * s, U * .07 * s, '#2a1a10'); } })); }
  // a statue on a plinth (generic guardian)
  function statueSmall(o) { o = Object.assign({ id: 'granite', kanji: '守' }, o); const U = M * .9;
    return scene(obj({ x0: -U * 1.6, y0: -U * 3.6, x1: U * 1.6, y1: 8 }, (g, layer) => { if (layer !== 'objects') { shadow(g, U); if (layer === 'ground') return; }
      box(g, -U * .8, 0, U * 1.6, U * .6, U * 1.2, o.id); const b = () => { g.beginPath(); g.moveTo(-U * .55, -U * .6); g.quadraticCurveTo(-U * .7, -U * 2.2, -U * .3, -U * 2.6); g.lineTo(U * .3, -U * 2.6); g.quadraticCurveTo(U * .7, -U * 2.2, U * .55, -U * .6); g.closePath(); };
      fill(g, b, o.id, 'front', [-U, 0, U, 0]); b(); g.fillStyle = lg(g, -U * .6, 0, U * .6, 0, ['rgba(255,250,235,.25)', 'rgba(0,0,0,0)', 'rgba(15,12,8,.4)']); g.fill(); ell(g, 0, -U * 2.95, U * .38, U * .42, '#9a988e'); engrave(g, o.kanji, 0, -U * 1.6, U * .45); })); }
  const T = o => () => scene(TREES.make(o));
  return { M, m, mix, surface, mat, winTex, doorTex, signTex, panel, drum, block, tower, bridgeSpan, wallSeg, gate, rocks, cargo, lamp, banner, tent, fire, fence, cart, jars, statueSmall, T, lg, tint };
})();
