/* Kunai Online — blended ground for the Aozora map.
   The 1 m class grid becomes smooth terrain fields (blurred indicators); each terrain layer is cut out of its field
   with a noise-perturbed soft threshold, so every border is organic and fades into its neighbour:
   grass → worn soil → path, grass → kerb → flagstones, bank → wet sand → shallow → deep water with foam.
   Edges then get hand-painted details (grass overhanging the path, pebbles, wet stones). */
window.KGROUND = (() => {
  const TAU = Math.PI * 2;
  const sm = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  // value noise + fbm (deterministic, world-space so chunks join seamlessly)
  const hash = (i, j) => { let h = (i * 374761393 + j * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const vn = (x, y) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1); return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy; };
  const fbm = (x, y) => .55 * vn(x * .45, y * .45) + .3 * vn(x * 1.3 + 17, y * 1.3 + 5) + .15 * vn(x * 3.1 + 41, y * 3.1 + 9) - .5;

  // theme (optional): region ground tiles {base, forest, path, plaza, rock, water, planks} and flags {tufts, flowers, drift:[light,dark]}
  function init(G, GW, GH, x0, y0, theme) {
    const blur = (src, passes) => { let a = Float32Array.from(src), b = new Float32Array(a.length);
      for (let p = 0; p < passes; p++) {
        for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const k = j * GW + i; b[k] = (a[k] * 2 + (i > 0 ? a[k - 1] : a[k]) + (i < GW - 1 ? a[k + 1] : a[k])) / 4; }
        for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const k = j * GW + i; a[k] = (b[k] * 2 + (j > 0 ? b[k - GW] : b[k]) + (j < GH - 1 ? b[k + GW] : b[k])) / 4; } }
      return a; };
    const ind = test => { const f = new Float32Array(GW * GH); for (let k = 0; k < f.length; k++) f[k] = test(G[k]) ? 1 : 0; return f; };
    const F = {
      path: blur(ind(v => v === 1), 2), forest: blur(ind(v => v === 4), 3), rock: blur(ind(v => v === 3), 2), plaza: blur(ind(v => v === 5), 1),
      water: blur(ind(v => v === 2 || v === 6), 2), deep: blur(ind(v => v === 2 || v === 6), 7), bridge: blur(ind(v => v === 6), 1) };
    const at = (f, x, y) => { let gx = x - x0 - .5, gy = y - y0 - .5; if (gx < 0) gx = 0; if (gy < 0) gy = 0; if (gx > GW - 1.001) gx = GW - 1.001; if (gy > GH - 1.001) gy = GH - 1.001;
      const i = gx | 0, j = gy | 0, fx = gx - i, fy = gy - j, k = j * GW + i; return (f[k] * (1 - fx) + f[k + 1] * fx) * (1 - fy) + (f[k + GW] * (1 - fx) + f[k + GW + 1] * fx) * fy; };
    const T = Object.assign({}, TEX); if (theme) for (const k of ['grass', 'forest', 'path', 'plaza', 'rock', 'water', 'planks']) { const v = theme[k === 'grass' ? 'base' : k]; if (v) T[k] = v; }
    return { F, at, T, theme: theme || null };
  }

  // ---------- textures (painted, 256 px tiles)
  function texCanvas(size, paint) { const c = document.createElement('canvas'); c.width = c.height = size; paint(c.getContext('2d'), size); return c; }
  const R = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const wrapDraw = (q, S, x, y, r, f) => { for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) if (x + dx > -r && x + dx < S + r && y + dy > -r && y + dy < S + r) f(x + dx, y + dy); };
  const TEX = {
    grass: texCanvas(256, (q, S) => { const r = R(3); q.fillStyle = '#7dab52'; q.fillRect(0, 0, S, S);
      for (let i = 0; i < 90; i++) { const x = r() * S, y = r() * S, rr = 8 + r() * 18; q.fillStyle = r() < .5 ? 'rgba(170,215,105,.16)' : 'rgba(60,110,40,.14)'; wrapDraw(q, S, x, y, rr, (a, b) => { q.beginPath(); q.ellipse(a, b, rr, rr * .7, r() * 3, 0, TAU); q.fill(); }); }
      for (let i = 0; i < 900; i++) { const x = r() * S, y = r() * S, l = 3 + r() * 4, a = -Math.PI / 2 + (r() - .5) * .9; q.strokeStyle = r() < .5 ? 'rgba(150,200,90,.55)' : 'rgba(70,120,45,.5)'; q.lineWidth = 1; q.beginPath(); q.moveTo(x, y); q.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); q.stroke(); } }),
    forest: texCanvas(256, (q, S) => { const r = R(5); q.fillStyle = '#5f8e3f'; q.fillRect(0, 0, S, S);
      for (let i = 0; i < 80; i++) { const x = r() * S, y = r() * S, rr = 8 + r() * 16; q.fillStyle = r() < .5 ? 'rgba(130,175,80,.18)' : 'rgba(35,70,30,.2)'; wrapDraw(q, S, x, y, rr, (a, b) => { q.beginPath(); q.ellipse(a, b, rr, rr * .7, r() * 3, 0, TAU); q.fill(); }); }
      for (let i = 0; i < 60; i++) { const x = r() * S, y = r() * S; q.fillStyle = ['rgba(150,110,50,.45)', 'rgba(190,140,60,.4)', 'rgba(110,80,40,.45)'][i % 3]; wrapDraw(q, S, x, y, 4, (a, b) => { q.beginPath(); q.ellipse(a, b, 3, 1.6, r() * 3, 0, TAU); q.fill(); }); }
      for (let i = 0; i < 800; i++) { const x = r() * S, y = r() * S, l = 3 + r() * 4, a = -Math.PI / 2 + (r() - .5) * .9; q.strokeStyle = r() < .5 ? 'rgba(120,170,70,.5)' : 'rgba(40,85,35,.5)'; q.lineWidth = 1; q.beginPath(); q.moveTo(x, y); q.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); q.stroke(); } }),
    path: texCanvas(256, (q, S) => { const r = R(7); q.fillStyle = '#dcc592'; q.fillRect(0, 0, S, S);
      for (let i = 0; i < 70; i++) { const x = r() * S, y = r() * S, rr = 10 + r() * 22; q.fillStyle = r() < .5 ? 'rgba(250,236,200,.22)' : 'rgba(170,135,80,.16)'; wrapDraw(q, S, x, y, rr, (a, b) => { q.beginPath(); q.ellipse(a, b, rr, rr * .6, r() * 3, 0, TAU); q.fill(); }); }
      for (let i = 0; i < 260; i++) { const x = r() * S, y = r() * S, rr = .8 + r() * 2.2; wrapDraw(q, S, x, y, rr + 2, (a, b) => { q.fillStyle = 'rgba(120,95,55,.45)'; q.beginPath(); q.ellipse(a + .6, b + .6, rr, rr * .7, 0, 0, TAU); q.fill(); q.fillStyle = ['#cdb68a', '#bfa67a', '#e6d4aa'][i % 3]; q.beginPath(); q.ellipse(a, b, rr, rr * .7, 0, 0, TAU); q.fill(); }); } }),
    plaza: texCanvas(256, (q, S) => { const r = R(13); q.fillStyle = '#8f8573'; q.fillRect(0, 0, S, S);
      const rowH = 32; for (let y = 0; y < S; y += rowH) { let x = (y / rowH) % 2 ? -18 : 0; while (x < S) { const w = 30 + r() * 26, l = 200 + r() * 30 | 0, t = r();
          q.fillStyle = `rgb(${l},${l - 8 - (t * 10 | 0)},${l - 26 - (t * 14 | 0)})`; const rr = 5; q.beginPath(); q.roundRect ? q.roundRect(x + 2, y + 2, w - 4, rowH - 4, rr) : q.rect(x + 2, y + 2, w - 4, rowH - 4); q.fill();
          q.fillStyle = 'rgba(255,255,255,.18)'; q.fillRect(x + 4, y + 3, w - 9, 3); q.fillStyle = 'rgba(80,70,55,.18)'; q.fillRect(x + 4, y + rowH - 6, w - 8, 3);
          if (r() < .3) { q.strokeStyle = 'rgba(90,80,60,.3)'; q.lineWidth = 1; q.beginPath(); q.moveTo(x + w * r(), y + 4); q.lineTo(x + w * r(), y + rowH - 4); q.stroke(); }
          x += w; } }
      for (let i = 0; i < 40; i++) { q.fillStyle = 'rgba(90,120,60,.35)'; q.beginPath(); q.ellipse(r() * S, ((r() * S / rowH) | 0) * rowH + 1, 4 + r() * 6, 1.6, 0, 0, TAU); q.fill(); } }),
    rock: texCanvas(256, (q, S) => { const r = R(11); q.fillStyle = '#8b8a84'; q.fillRect(0, 0, S, S);
      for (let i = 0; i < 70; i++) { const x = r() * S, y = r() * S, rr = 10 + r() * 22; wrapDraw(q, S, x, y, rr + 4, (a, b) => { q.fillStyle = 'rgba(50,50,48,.3)'; q.beginPath(); q.ellipse(a + 3, b + 3, rr, rr * .7, 0, 0, TAU); q.fill(); q.fillStyle = ['#9a9993', '#8e8c86', '#a7a59e'][i % 3]; q.beginPath(); q.ellipse(a, b, rr, rr * .7, 0, 0, TAU); q.fill(); q.fillStyle = 'rgba(255,255,255,.15)'; q.beginPath(); q.ellipse(a - rr * .3, b - rr * .3, rr * .5, rr * .25, 0, 0, TAU); q.fill(); }); } }),
    water: texCanvas(256, (q, S) => { const r = R(9); q.fillStyle = '#4aa0c4'; q.fillRect(0, 0, S, S);
      for (let i = 0; i < 50; i++) { const x = r() * S, y = r() * S, rr = 14 + r() * 26; q.fillStyle = r() < .5 ? 'rgba(120,200,230,.18)' : 'rgba(30,100,150,.15)'; wrapDraw(q, S, x, y, rr, (a, b) => { q.beginPath(); q.ellipse(a, b, rr, rr * .5, 0, 0, TAU); q.fill(); }); }
      for (let i = 0; i < 70; i++) { const x = r() * S, y = r() * S, l = 6 + r() * 14; wrapDraw(q, S, x, y, l, (a, b) => { q.strokeStyle = 'rgba(225,248,255,.55)'; q.lineWidth = 1.3; q.lineCap = 'round'; q.beginPath(); q.moveTo(a - l / 2, b); q.quadraticCurveTo(a, b - 2.5, a + l / 2, b); q.stroke(); }); } }),
    planks: texCanvas(256, (q, S) => { const r = R(15); q.fillStyle = '#9c6e43'; q.fillRect(0, 0, S, S);
      for (let y = 0; y < S; y += 16) { const t = r(); q.fillStyle = `rgb(${160 + t * 30 | 0},${112 + t * 22 | 0},${70 + t * 14 | 0})`; q.fillRect(0, y + 1, S, 13); q.fillStyle = 'rgba(60,35,15,.7)'; q.fillRect(0, y + 14, S, 2); q.fillStyle = 'rgba(255,230,190,.22)'; q.fillRect(0, y + 1, S, 2);
        for (let k = 0; k < 3; k++) { q.strokeStyle = 'rgba(90,55,25,.35)'; q.lineWidth = 1; q.beginPath(); q.moveTo(r() * S, y + 5 + r() * 5); q.lineTo(r() * S, y + 5 + r() * 5); q.stroke(); }
        const nx = r() * S; q.fillStyle = '#4a3020'; q.beginPath(); q.arc(nx, y + 7.5, 1.4, 0, TAU); q.fill(); } })
  };

  // ---------- one chunk
  let SCR = null;   // one scratch canvas reused by every layer
  function chunk(env, ci, cj, CH, PM, SP, z) { const it = chunkGen(env, ci, cj, CH, PM, SP, z); let r; while (!(r = it.next()).done); return r.value; }
  // the same work, cut in small steps: the map advances it a few milliseconds per frame (no freeze when walking)
  function* chunkGen(env, ci, cj, CH, PM, SP, z) {
    const { F, at } = env, TX = env.T || TEX, TH = env.theme || {}, pw = CH * PM * z, ph = CH * SP * PM * z;
    const c = document.createElement('canvas'); c.width = Math.ceil(pw); c.height = Math.ceil(ph); const q = c.getContext('2d');
    const RES = 6, N = CH * RES, M = N + 2, X0 = ci * CH, Y0 = cj * CH;
    // per sample fields (world coordinates of sample centres; one extra sample all around for seamless upscaling)
    const S = {}; for (const k in F) S[k] = new Float32Array(M * M);
    const NZ = new Float32Array(M * M), NZ2 = new Float32Array(M * M);
    for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) { const x = X0 + (i - .5) / RES, y = Y0 + (j - .5) / RES, k = j * M + i;
      for (const f in F) S[f][k] = at(F[f], x, y); NZ[k] = fbm(x, y); NZ2[k] = fbm(x * 2.3 + 91, y * 2.3 + 37); }
    const sx = pw / N, sy = ph / N;
    const pat = (tex, scale) => { const p = q.createPattern(tex, 'repeat'), s = z * scale, T = tex.width * s, Ty = tex.height * s * SP;
      p.setTransform(new DOMMatrix().translate(-(((X0 * PM * z) % T) + T) % T, -(((Y0 * SP * PM * z) % Ty) + Ty) % Ty).scale(s, s * SP)); return p; };
    const maskCv = document.createElement('canvas'); maskCv.width = maskCv.height = M; const mq = maskCv.getContext('2d'), id = mq.createImageData(M, M);
    const layer = (alphaFn, paint) => { let any = false; for (let k = 0; k < M * M; k++) { const a = alphaFn(k); id.data[k * 4 + 3] = a * 255; if (a > .004) any = true; } if (!any) return;
      mq.putImageData(id, 0, 0); if (!SCR || SCR.width !== c.width || SCR.height !== c.height) { SCR = document.createElement('canvas'); SCR.width = c.width; SCR.height = c.height; } const L = SCR, lq = L.getContext('2d'); lq.globalCompositeOperation = 'source-over'; lq.clearRect(0, 0, L.width, L.height);
      paint(lq); lq.globalCompositeOperation = 'destination-in'; lq.imageSmoothingEnabled = true; lq.imageSmoothingQuality = 'high'; lq.drawImage(maskCv, 0, 0, M, M, -sx, -sy, M * sx, M * sy); q.drawImage(L, 0, 0); };
    const fill = style => lq => { lq.fillStyle = style; lq.fillRect(0, 0, c.width, c.height); };
    const fillTex = (tex, scale, tint) => lq => { lq.fillStyle = pat(tex, scale); lq.fillRect(0, 0, c.width, c.height); if (tint) { lq.fillStyle = tint; lq.fillRect(0, 0, c.width, c.height); } };

    // base grass and its large-scale colour drift (kills visible tiling)
    q.fillStyle = pat(TX.grass, .45); q.fillRect(0, 0, c.width, c.height);
    const DR = TH.drift || ['rgba(178,212,104,.5)', 'rgba(62,108,44,.45)'];
    layer(k => sm(.08, .3, NZ[k]) * .55, fill(DR[0])); yield;
    layer(k => sm(.1, .32, -NZ2[k]) * .5, fill(DR[1])); yield;
    // forest floor: very soft
    layer(k => sm(.3, .75, S.forest[k] + NZ[k] * .45), fillTex(TX.forest, .45)); yield;
    // rock
    layer(k => sm(.42, .52, S.rock[k] + NZ[k] * .3), fill('rgba(70,68,62,.55)')); yield;
    layer(k => sm(.48, .56, S.rock[k] + NZ[k] * .3), fillTex(TX.rock, .5)); yield;
    // dirt path: worn soil halo, then the path itself with an irregular edge
    layer(k => sm(.18, .46, S.path[k] + NZ2[k] * .35) * .7, fill('rgba(170,140,85,.6)')); yield;
    layer(k => sm(.42, .54, S.path[k] + NZ2[k] * .28), fillTex(TX.path, .45)); yield;
    // plaza: kerb then flagstones (cleaner edges: it is built)
    layer(k => sm(.36, .42, S.plaza[k] + NZ2[k] * .06), fill('#7d7464')); yield;
    layer(k => sm(.44, .48, S.plaza[k] + NZ2[k] * .06), fillTex(TX.plaza, .5)); yield;
    // water: wet sand bank, damp line, shallow water, deep water, foam
    const wv = k => S.water[k] + NZ[k] * .16;
    // a region can retint its water (theme.water tints: bank false = no wet sand, shallow / deep colours) — Kumo's sea of clouds
    const WT = TH.waterTint || {};
    if (WT.bank !== false) { layer(k => sm(.12, .34, wv(k) + NZ2[k] * .12), fillTex(TX.path, .45, 'rgba(200,175,120,.35)')); yield;
      layer(k => sm(.3, .44, wv(k)), fill('rgba(118,98,62,.55)')); yield; }
    layer(k => sm(.46, .5, wv(k)), fillTex(TX.water, .5)); yield;
    layer(k => sm(.45, .58, wv(k)) * (1 - sm(.55, .8, wv(k))), fill(WT.shallow || 'rgba(140,215,225,.45)')); yield;
    layer(k => sm(.62, .95, S.deep[k] + NZ[k] * .1) * .75, fill(WT.deep || 'rgba(22,78,128,.6)')); yield;
    layer(k => { const v = wv(k); return sm(.46, .5, v) * (1 - sm(.5, .545, v)) * sm(-.15, .05, NZ2[k]); }, fill('rgba(245,252,255,.9)')); yield;
    layer(k => { const v = wv(k) + NZ2[k] * .05; return sm(.58, .6, v) * (1 - sm(.6, .63, v)) * sm(.05, .2, NZ2[k]) * .6; }, fill('rgba(235,250,255,.8)')); yield;
    // bridges: crisp wooden decks with a dark rim
    layer(k => sm(.32, .4, S.bridge[k]), fill('rgba(50,30,15,.85)')); yield;
    layer(k => sm(.42, .46, S.bridge[k]), fillTex(TX.planks, .5)); yield;

    // ---------- hand-painted details along the borders
    const rnd = (() => { let s = (ci * 73856093 ^ cj * 19349663) >>> 0 || 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const smp = (f, x, y) => { const i = Math.max(0, Math.min(M - 1, Math.round(x * RES + .5))), j = Math.max(0, Math.min(M - 1, Math.round(y * RES + .5))); return S[f][j * M + i]; };
    const nzS = (x, y) => { const i = Math.max(0, Math.min(M - 1, Math.round(x * RES + .5))), j = Math.max(0, Math.min(M - 1, Math.round(y * RES + .5))); return [NZ[j * M + i], NZ2[j * M + i]]; };
    const tuft = (X, Y, s, dark) => { for (let b = 0; b < 6; b++) { const a = -Math.PI / 2 + (b - 2.5) * .3 + (rnd() - .5) * .2, l = s * (4 + rnd() * 3.5); q.strokeStyle = b % 2 ? (dark ? 'rgba(55,100,35,.9)' : 'rgba(75,125,45,.9)') : 'rgba(145,195,85,.9)'; q.lineWidth = Math.max(.8, s * .5); q.lineCap = 'round';
        q.beginPath(); q.moveTo(X + (b - 2.5) * s * .45, Y); q.quadraticCurveTo(X + Math.cos(a) * l * .5, Y + Math.sin(a) * l * .5, X + Math.cos(a) * l, Y + Math.sin(a) * l * .8); q.stroke(); } };
    const pebble = (X, Y, s, wet) => { q.fillStyle = wet ? 'rgba(40,50,45,.4)' : 'rgba(110,90,60,.45)'; q.beginPath(); q.ellipse(X + s * .3, Y + s * .3, s * 1.2, s * .7, 0, 0, TAU); q.fill();
      q.fillStyle = wet ? ['#7f8a84', '#6e7a74', '#8f988f'][(rnd() * 3) | 0] : ['#b9ad95', '#a69a82', '#c9bea6'][(rnd() * 3) | 0]; q.beginPath(); q.ellipse(X, Y, s * 1.2, s * .7, rnd() - .5, 0, TAU); q.fill();
      q.fillStyle = 'rgba(255,255,245,.45)'; q.beginPath(); q.ellipse(X - s * .35, Y - s * .2, s * .45, s * .22, 0, 0, TAU); q.fill(); };
    const flower = (X, Y, s) => { const col = ['#ffffff', '#f4d35e', '#e86a8a', '#b06ad0', '#ffffff'][(rnd() * 5) | 0]; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; q.fillStyle = col; q.beginPath(); q.ellipse(X + Math.cos(a) * s * .9, Y + Math.sin(a) * s * .6, s * .7, s * .45, a, 0, TAU); q.fill(); } q.fillStyle = '#f2c43a'; q.beginPath(); q.arc(X, Y, s * .4, 0, TAU); q.fill(); };
    const step = .45, live = [];
    for (let y = 0; y < CH; y += step) { if (Math.floor(y / 2) !== Math.floor((y - step) / 2)) yield; for (let x = 0; x < CH; x += step) {
      const px = x + (rnd() - .5) * step, py = y + (rnd() - .5) * step, X = px * PM * z, Y = py * SP * PM * z, s = z * (1.3 + rnd() * .8);
      const [n1, n2] = nzS(px, py), aP = sm(.42, .54, smp('path', px, py) + n2 * .28), aPl = sm(.44, .48, smp('plaza', px, py) + n2 * .06), wv = smp('water', px, py) + n1 * .16,
        aW = sm(.46, .5, wv), aSand = sm(.12, .34, wv), aR = sm(.48, .56, smp('rock', px, py) + n1 * .3), aB = smp('bridge', px, py);
      if (aB > .3 || aR > .6) continue;
      const t = rnd();
      if (aW > .02) continue;                                                             // no details on water
      if (aSand > .25 && aSand < .98) { if (t < .1) pebble(X, Y, s * .9, true); else if (t < .14 && aSand < .6) tuft(X, Y, s * .9, true); continue; }
      if (aP > .12 && aP < .7) { if (t < .26 && TH.tufts !== false) tuft(X, Y, s * (aP < .4 ? 1 : .75)); else if (t < .36) pebble(X, Y, s * .8); continue; }
      if (aP >= .7) { if (t < .025) pebble(X, Y, s * .7); continue; }
      if (aPl > .08 && aPl < .6) { if (t < .22) tuft(X, Y, s * .8, true); continue; }
      if (aPl >= .6) { if (t < .012) tuft(X, Y, s * .5, true); continue; }
      // open grass
      if (TH.tufts === false) { if (t < .02) pebble(X, Y, s * .8); continue; }
      if (t < .035) tuft(X, Y, s); else if (t < .1) live.push([X / z, Y / z, s / z, (rnd() * 3) | 0, rnd()]); else if (t < .118 && TH.flowers !== false) flower(X, Y, s); else if (t < .125) pebble(X, Y, s * .9);
    }
    }
    // water mask (inside the foam line) for the animated reflections drawn every frame
    let any = false; for (let k = 0; k < M * M; k++) { const v = S.water[k] + NZ[k] * .16, a = sm(.53, .62, v) * (1 - sm(.3, .45, S.bridge[k])); id.data[k * 4 + 3] = a * 255; if (a > .01) any = true; }
    if (any) { const wm = document.createElement('canvas'); wm.width = wm.height = M; wm.getContext('2d').putImageData(id, 0, 0); c.wmask = wm; c.wsx = sx / z; c.wsy = sy / z; }
    c.tufts = live;
    return c;
  }
  // ---------- animation helpers
  // wind: slow swell + flutter + gusts sweeping across the village (world metres, seconds)
  const wind = (t, x, y) => (window.KGROUND && KGROUND.windAmp || 1) * .5 * Math.sin(t * 1.3 + x * .08 + y * .05) + (window.KGROUND && KGROUND.windAmp || 1) * .3 * Math.sin(t * 2.9 + x * .31 - y * .17) + (window.KGROUND && KGROUND.windAmp || 1) * 1.3 * Math.pow(Math.max(0, Math.sin(t * .55 - x * .035 - y * .02)), 4);
  const waveTex = texCanvas(256, (q, S) => { const r = R(21);
    for (let i = 0; i < 46; i++) { const x = r() * S, y = r() * S, l = 10 + r() * 22, a = .35 + r() * .45; wrapDraw(q, S, x, y, l, (X, Y) => { q.strokeStyle = 'rgba(235,252,255,' + a + ')'; q.lineWidth = 1.2 + r() * 1.2; q.lineCap = 'round'; q.beginPath(); q.moveTo(X - l / 2, Y); q.quadraticCurveTo(X, Y - 3.5, X + l / 2, Y); q.stroke(); }); }
    for (let i = 0; i < 26; i++) { const x = r() * S, y = r() * S, l = 14 + r() * 26; wrapDraw(q, S, x, y, l, (X, Y) => { q.strokeStyle = 'rgba(20,70,110,.22)'; q.lineWidth = 2; q.beginPath(); q.moveTo(X - l / 2, Y + 2); q.quadraticCurveTo(X, Y + 5, X + l / 2, Y + 2); q.stroke(); }); } });
  const sparkTex = texCanvas(256, (q, S) => { const r = R(23); for (let i = 0; i < 18; i++) { const x = r() * S, y = r() * S, s = 2 + r() * 2.5; q.fillStyle = 'rgba(255,255,255,.95)'; q.beginPath(); q.moveTo(x - s * 2, y); q.lineTo(x, y - s * .6); q.lineTo(x + s * 2, y); q.lineTo(x, y + s * .6); q.closePath(); q.fill(); } });
  // live grass tuft sprites: 3 shapes × 9 bend angles, per zoom level
  const tuftCache = {};
  function tuftSprite(v, bend, z) { const key = v + ':' + bend + ':' + z; if (tuftCache[key]) return tuftCache[key];
    const s = z * 1.7, W = Math.ceil(s * 20), H = Math.ceil(s * 14), c = document.createElement('canvas'); c.width = W; c.height = H; const q = c.getContext('2d'), r = R(31 + v * 7), b = (bend - 4) / 4;
    const nb = 5 + v; for (let i = 0; i < nb; i++) { const a = -Math.PI / 2 + (i - (nb - 1) / 2) * .26 + (r() - .5) * .2, l = s * (4.5 + r() * 4 + v), x0 = W / 2 + (i - (nb - 1) / 2) * s * .5, y0 = H - 2;
      const tx = x0 + Math.cos(a) * l + b * l * .55, ty = y0 + Math.sin(a) * l * (1 - Math.abs(b) * .15);
      q.strokeStyle = i % 2 ? 'rgba(72,122,44,.95)' : 'rgba(148,198,88,.95)'; q.lineWidth = Math.max(.9, s * .55); q.lineCap = 'round';
      q.beginPath(); q.moveTo(x0, y0); q.quadraticCurveTo(x0 + Math.cos(a) * l * .45 + b * l * .1, y0 + Math.sin(a) * l * .5, tx, ty); q.stroke(); }
    return (tuftCache[key] = c); }
  return { init, chunk, chunkGen, fbm, wind, waveTex, sparkTex, tuftSprite };
})();
