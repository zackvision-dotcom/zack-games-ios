/* Kunai Online — the great gate of Aozora, modelled in metres and rendered with ISO (one shared 3/4 camera).
   Scale: M world units per metre; a ninja is ~1.7 m, the door leaves are 18 m tall. */
window.KGATE = (() => {
  const M = 24;
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const JP = '"Yu Mincho","Hiragino Mincho ProN","MS Mincho","Noto Serif JP",serif';

  /* ---------- painted textures (pixels; mapped onto faces in world units) ---------- */
  function planks(g, x0, W, H, o, r) {
    const pw = o.pw, grain = o.grain || '92,40,12', seam = o.seam || 'rgba(38,14,4,.9)';
    for (let x = x0; x < x0 + W - 1; x += pw) {
      g.fillStyle = o.cols[(r() * o.cols.length) | 0]; g.fillRect(x, 0, pw, H);
      const q = g.createLinearGradient(0, 0, 0, H); for (let i = 0; i <= 5; i++) q.addColorStop(i / 5, r() < .5 ? `rgba(255,232,190,${r() * .14})` : `rgba(70,30,8,${r() * .16})`); g.fillStyle = q; g.fillRect(x, 0, pw, H);
      for (let i = 0; i < 11; i++) { g.strokeStyle = `rgba(${grain},${.1 + r() * .2})`; g.lineWidth = .5 + r() * 1.4; let gx = x + 3 + r() * (pw - 6); g.beginPath(); g.moveTo(gx, 0); for (let y = 0; y <= H; y += 10) { gx += (r() - .5) * 1.5; gx = Math.min(x + pw - 3, Math.max(x + 3, gx)); g.lineTo(gx, y); } g.stroke(); }
      if (r() < .65) { const kx = x + pw * (.3 + r() * .4), ky = 20 + r() * (H - 40); for (let k = 4; k > 0; k--) { g.strokeStyle = `rgba(${grain},.32)`; g.lineWidth = 1; g.beginPath(); g.ellipse(kx, ky, k * 1.5, k * 3.8, 0, 0, 7); g.stroke(); } g.fillStyle = `rgba(${grain},.7)`; g.beginPath(); g.ellipse(kx, ky, 1.8, 3.2, 0, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(255,242,205,.3)'; g.fillRect(x + 1.5, 0, 2, H); g.fillStyle = 'rgba(45,18,5,.3)'; g.fillRect(x + pw - 6, 0, 4.5, H); g.fillStyle = seam; g.fillRect(x + pw - 1.6, 0, 1.6, H);
      const joints = o.joints === false ? [] : [10 + r() * (H - 20)];
      for (const jy of joints) { g.fillStyle = seam; g.fillRect(x, jy, pw, 1.8); g.fillStyle = 'rgba(255,240,200,.28)'; g.fillRect(x, jy + 1.8, pw, 1.4); }
      if (o.nails !== false) for (const ny of [...joints.flatMap(j => [j - 7, j + 9]), 12, H - 12]) for (const nx of [x + 6, x + pw - 10]) { g.fillStyle = 'rgba(28,16,10,.9)'; g.beginPath(); g.arc(nx, ny, 1.8, 0, 7); g.fill(); g.fillStyle = 'rgba(255,240,210,.55)'; g.beginPath(); g.arc(nx - .6, ny - .6, .75, 0, 7); g.fill(); g.fillStyle = 'rgba(90,40,10,.18)'; g.fillRect(nx - 1, ny + 2, 2, 6 + r() * 8); }
      for (let i = 0; i < 5; i++) { g.strokeStyle = `rgba(255,236,200,${.15 + r() * .15})`; g.lineWidth = .8; const sx = x + 3 + r() * (pw - 6), sy = r() * H; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + (r() - .5) * 5, sy + 5 + r() * 16); g.stroke(); }
    }
  }
  const T = {};
  function textures() {
    if (T.wall) return T;
    T.wall = ISO.texture('kg-wall', 256, 512, (g, W, H) => planks(g, 0, W, H, { pw: 32, cols: ['#e08a3e', '#d77f35', '#e9984c', '#cf7630', '#dc8840'] }, rng(3)));
    T.wall2 = ISO.texture('kg-wall2', 256, 512, (g, W, H) => planks(g, 0, W, H, { pw: 32, cols: ['#d2773a', '#c96d31', '#db8343', '#c2672c'] }, rng(9)));
    T.roof = ISO.texture('kg-roof', 256, 256, (g, W, H) => {
      // overlapping boards in horizontal courses: each course casts a shadow on the one below
      const r = rng(5), rowH = 32, cols = ['#c98f3c', '#bd8333', '#d39a48', '#b77c2e', '#cf9442'];
      for (let y = 0, row = 0; y < H; y += rowH, row++) {
        let x = -(row % 2) * 40; while (x < W) { const w = 48 + r() * 50; for (const dx of [-W, 0, W]) {
          const X = x + dx; g.fillStyle = cols[(r() * cols.length) | 0]; g.fillRect(X, y, w, rowH);
          for (let i = 0; i < 5; i++) { g.strokeStyle = `rgba(110,60,14,${.12 + r() * .2})`; g.lineWidth = .6 + r(); let gy = y + 4 + r() * (rowH - 8); g.beginPath(); g.moveTo(X, gy); for (let k = 0; k <= w; k += 8) { gy += (r() - .5) * 1.2; g.lineTo(X + k, Math.min(y + rowH - 4, Math.max(y + 3, gy))); } g.stroke(); }
          g.fillStyle = 'rgba(50,22,4,.85)'; g.fillRect(X + w - 1.5, y, 1.5, rowH);
          g.fillStyle = 'rgba(255,236,180,.3)'; g.fillRect(X + 1, y, 2, rowH); }
          x += w; }
        const q = g.createLinearGradient(0, y, 0, y + rowH); q.addColorStop(0, 'rgba(255,240,190,.38)'); q.addColorStop(.12, 'rgba(255,240,190,0)'); q.addColorStop(.75, 'rgba(60,26,4,0)'); q.addColorStop(1, 'rgba(60,26,4,.45)'); g.fillStyle = q; g.fillRect(0, y, W, rowH);
        g.fillStyle = 'rgba(40,16,2,.9)'; g.fillRect(0, y + rowH - 2, W, 2);
      }
      for (let i = 0; i < 34; i++) { g.fillStyle = r() < .55 ? 'rgba(96,120,40,.26)' : 'rgba(60,30,8,.2)'; g.beginPath(); g.ellipse(r() * W, r() * H, 3 + r() * 10, 2 + r() * 4, 0, 0, 7); g.fill(); }
    });
    T.dark = ISO.texture('kg-dark', 128, 128, (g, W, H) => planks(g, 0, W, H, { pw: 16, cols: ['#7a4524', '#6c3b1e', '#83502b'], grain: '40,16,4', nails: false }, rng(7)));
    T.stone = ISO.texture('kg-stone', 256, 256, (g, W, H) => stones(g, W, H, { rowH: 46, cols: ['#c9bea8', '#bdb19a', '#d3c9b4', '#b3a68e'], mortar: '#6d6252', seed: 4, cracks: 9 }));
    T.flag = ISO.texture('kg-flag', 256, 256, (g, W, H) => stones(g, W, H, { rowH: 36, cols: ['#d8c9a6', '#cdbd98', '#e0d3b2', '#c4b38c'], mortar: '#8b7a5a', seed: 8, cracks: 5, irregular: true }));
    T.doorL = door('風', 21); T.doorR = door('刃', 22);
    T.plaque = ISO.texture('kg-plaque', 720, 136, (g, W, H) => {
      stones(g, W, H, { rowH: H, cols: ['#cfc4ad'], mortar: '#6d6252', seed: 31, cracks: 4, single: true });
      g.strokeStyle = 'rgba(70,52,34,.75)'; g.lineWidth = 4; for (const yy of [14, H - 14]) { g.beginPath(); for (let x = 10; x <= W - 10; x += 4) { const y = yy + Math.sin(x / 26) * 4; x === 10 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
      g.strokeStyle = 'rgba(255,250,235,.45)'; g.lineWidth = 2; for (const yy of [17, H - 11]) { g.beginPath(); for (let x = 10; x <= W - 10; x += 4) { const y = yy + Math.sin(x / 26) * 4; x === 10 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
      const red = (fn) => { g.save(); g.translate(3, 3); g.globalAlpha = .5; fn('rgba(60,10,6,1)'); g.restore(); fn('#d23a2c'); };
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold 86px ${JP}`;
      red(c => { g.fillStyle = c; g.fillText('忍', W * .2, H / 2 + 4); g.fillText('火', W * .8, H / 2 + 4); });
      red(c => leafMark(g, W / 2, H / 2 + 2, 40, c));
      wear(g, W, H, 40);
    });
    return T;
  }
  function leafMark(g, cx, cy, R, col) {
    g.save(); g.translate(cx, cy); g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = R * .16;
    g.beginPath(); for (let a = 0; a <= Math.PI * 3.1; a += .08) { const r = R * .08 + a * R * .055; g.lineTo(Math.cos(a + 2) * r, Math.sin(a + 2) * r); } g.stroke();
    g.beginPath(); g.moveTo(R * .52, -R * .3); g.bezierCurveTo(R * .95, R * .2, R * .4, R * .85, -R * .2, R * .62); g.lineTo(-R * .95, R * .95); g.lineTo(-R * .62, R * .22); g.bezierCurveTo(-R * .9, -R * .5, -R * .1, -R * .95, R * .45, -R * .6); g.stroke();
    g.restore();
  }
  function wear(g, W, H, n) { const r = rng(W + H); for (let i = 0; i < n; i++) { g.fillStyle = r() < .5 ? 'rgba(255,248,230,.35)' : 'rgba(60,40,20,.25)'; g.beginPath(); g.ellipse(r() * W, r() * H, 1 + r() * 4, .6 + r() * 2, r() * 3, 0, 7); g.fill(); } }
  function stones(g, W, H, o) {
    const r = rng(o.seed); g.fillStyle = o.mortar; g.fillRect(0, 0, W, H);
    const block = (x, y, w, h) => {
      const p = 2.4, c = o.cols[(r() * o.cols.length) | 0], j = o.irregular ? 5 : 1.5;
      const pts = [[x + p + r() * j, y + p + r() * j], [x + w - p - r() * j, y + p + r() * j], [x + w - p - r() * j, y + h - p - r() * j], [x + p + r() * j, y + h - p - r() * j]];
      const path = () => { g.beginPath(); for (let i = 0; i < 4; i++) { const a = pts[i], b = pts[(i + 1) % 4], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; i ? g.quadraticCurveTo(a[0], a[1], m[0], m[1]) : g.moveTo(m[0], m[1]); } const a = pts[0], m = [(a[0] + pts[1][0]) / 2, (a[1] + pts[1][1]) / 2]; g.quadraticCurveTo(a[0], a[1], m[0], m[1]); g.closePath(); };
      path(); g.fillStyle = c; g.fill(); g.save(); g.clip();
      const q = g.createLinearGradient(x, y, x + w * .6, y + h); q.addColorStop(0, 'rgba(255,252,238,.38)'); q.addColorStop(.45, 'rgba(255,252,238,0)'); q.addColorStop(1, 'rgba(50,36,22,.32)'); g.fillStyle = q; g.fillRect(x, y, w, h);
      for (let i = 0; i < w * h / 40; i++) { g.fillStyle = r() < .5 ? 'rgba(255,255,245,.25)' : 'rgba(70,55,40,.22)'; g.fillRect(x + r() * w, y + r() * h, 1.2, 1.2); }
      for (let i = 0; i < 3; i++) { g.fillStyle = `rgba(90,80,60,${r() * .12})`; g.beginPath(); g.ellipse(x + r() * w, y + r() * h, 4 + r() * w * .2, 3 + r() * h * .2, 0, 0, 7); g.fill(); }
      g.restore(); path(); g.lineWidth = 1.6; g.strokeStyle = 'rgba(48,36,24,.55)'; g.stroke();
    };
    if (o.single) block(0, 0, W, H);
    else for (let y = 0, row = 0; y < H; y += o.rowH, row++) { let x = -(row % 2) * o.rowH * .8; while (x < W) { const w = o.rowH * (1 + r() * 1.3); for (const dx of [-W, 0, W]) block(x + dx, y, w, o.rowH); x += w; } }
    for (let i = 0; i < o.cracks; i++) { let x = r() * W, y = r() * H, a = r() * 6.3; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 7 + r() * 8; k++) { a += (r() - .5) * 1.4; x += Math.cos(a) * 6; y += Math.sin(a) * 6; g.lineTo(x, y); } g.strokeStyle = 'rgba(40,28,18,.75)'; g.lineWidth = 1.4; g.stroke(); g.translate(1, 1); g.strokeStyle = 'rgba(255,250,235,.35)'; g.lineWidth = .8; g.stroke(); g.translate(-1, -1); }
  }
  function door(ch, seed) {
    return ISO.texture('kg-door-' + ch, 336, 864, (g, W, H) => {
      const r = rng(seed); planks(g, 0, W, H, { pw: 42, cols: ['#5b9a4f', '#4f8c46', '#64a557', '#4a8442', '#57954c'], grain: '22,58,20', seam: 'rgba(14,36,14,.9)', joints: false, nails: false }, r);
      // frame
      const fw = 26; g.fillStyle = '#336a32'; g.fillRect(0, 0, W, fw); g.fillRect(0, H - fw, W, fw); g.fillRect(0, 0, fw, H); g.fillRect(W - fw, 0, fw, H);
      g.fillStyle = 'rgba(200,255,180,.25)'; g.fillRect(0, 0, W, 3); g.fillRect(0, 0, 3, H); g.fillStyle = 'rgba(10,30,10,.5)'; g.fillRect(fw, fw, W - 2 * fw, 4); g.fillRect(fw, fw, 4, H - 2 * fw);
      // rails with iron straps
      for (const ry of [H * .2, H * .8]) { g.fillStyle = '#2f5f2e'; g.fillRect(0, ry - 22, W, 44); g.fillStyle = 'rgba(200,255,180,.22)'; g.fillRect(0, ry - 22, W, 4); g.fillStyle = 'rgba(8,24,8,.55)'; g.fillRect(0, ry + 18, W, 5);
        g.fillStyle = '#3d4446'; g.fillRect(0, ry - 9, W, 18); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, ry - 9, W, 3);
        for (let x = 22; x < W; x += 52) { g.fillStyle = '#22282a'; g.beginPath(); g.arc(x, ry, 6, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(x - 2, ry - 2, 2, 0, 7); g.fill(); } }
      // the kana, painted red and chipped
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold ${W * .78}px ${JP}`; g.lineJoin = 'round';
      g.lineWidth = 16; g.strokeStyle = 'rgba(40,8,6,.55)'; g.strokeText(ch, W / 2 + 4, H / 2 + 6); g.fillStyle = '#d8352b'; g.fillText(ch, W / 2, H / 2);
      g.save(); g.globalCompositeOperation = 'source-atop'; for (let i = 0; i < 160; i++) { g.fillStyle = r() < .6 ? 'rgba(255,190,160,.25)' : 'rgba(80,140,70,.55)'; g.beginPath(); g.ellipse(W * .15 + r() * W * .7, H * .3 + r() * H * .4, 1 + r() * 4, .8 + r() * 2.5, r() * 3, 0, 7); g.fill(); } g.restore();
      // moss & grime at the foot
      const q = g.createLinearGradient(0, H * .8, 0, H); q.addColorStop(0, 'rgba(30,50,20,0)'); q.addColorStop(1, 'rgba(30,50,20,.4)'); g.fillStyle = q; g.fillRect(0, H * .8, W, H * .2);
    });
  }

  /* ---------- the model ---------- */
  function build(o) {
    o = o || {}; const t = textures(), S = new ISO.Scene(), m = v => v * M;
    const mat = (tex, tw, x) => Object.assign({ tex, tw: m(tw) }, x || {});
    const WALL = mat(t.wall, 5.2), WALL2 = mat(t.wall2, 5.2), ROOF = mat(t.roof, 6), DARK = mat(t.dark, 2.4), STONE = mat(t.stone, 6), FLAG = mat(t.flag, 5);
    const sym = f => { f(1); f(-1); };

    // ground: stone apron in a half circle, floor of the passage
    const ap = []; for (let i = 0; i <= 40; i++) { const a = Math.PI * i / 40; ap.push([m(Math.cos(a) * 17), m(1 + Math.sin(a) * 15), 0]); }
    S.face(ap, FLAG, { n: [0, 0, 1], O: [m(-17), m(1), 0], U: [1, 0, 0], V: [0, 1, 0], ground: true });
    S.face([[m(-7), m(-6), 0], [m(7), m(-6), 0], [m(7), m(1), 0], [m(-7), m(1), 0]], FLAG, { n: [0, 0, 1], O: [m(-7), m(-6), 0], U: [1, 0, 0], V: [0, 1, 0], ground: true });
    S.face([[m(-7), m(-6), 0], [m(7), m(-6), 0], [m(7), m(.9), 0], [m(-7), m(.9), 0]], { color: 'rgba(40,20,10,.42)' }, { n: [0, 0, 1], ground: true, edges: false });

    // enclosure walls running off both sides
    sym(s => { const xa = m(24 * s), xb = m(44 * s), x0 = Math.min(xa, xb), x1 = Math.max(xa, xb);
      S.box(x0, x1, m(-4), m(-1), 0, m(12), { front: WALL2, top: DARK }, { eave: m(1.5) });
      S.box(x0, x1, m(-4.3), m(-.6), m(12), m(12.7), { front: DARK, top: DARK }, { bias: 2 });
      S.box(x0, x1, m(-1), m(-.2), 0, m(1), { front: STONE, top: STONE }, { bias: 2 }); });

    // wings: plank blocks with shed roofs and three pipes each
    sym(s => { const x0 = s > 0 ? m(12) : m(-24), x1 = s > 0 ? m(24) : m(-12);
      S.box(x0, x1, m(-5), 0, 0, m(15), { front: WALL }, { eave: m(3) });
      S.box(x0, x1, 0, m(.8), 0, m(1.2), { front: STONE, top: STONE }, { bias: 3 });
      // pilasters
      for (const px of [x0, x1 - m(1.1)]) S.box(px, px + m(1.1), 0, m(.5), 0, m(15), { front: DARK }, { bias: 4 });
      const ry = y => m(17.6) - (y + m(5.8)) * (2.9 / 7);   // roof height along y
      S.face([[x0 - m(.4 * (s < 0)), m(-5.8), ry(m(-5.8))], [x1 + m(.4 * (s > 0)), m(-5.8), ry(m(-5.8))], [x1 + m(.4 * (s > 0)), m(1.2), ry(m(1.2))], [x0 - m(.4 * (s < 0)), m(1.2), ry(m(1.2))]], ROOF, { O: [x0, m(-5.8), ry(m(-5.8))], U: [1, 0, 0], V: ISO.norm([0, 7, -2.9]), bias: 6 });
      S.box(x0 - m(.4 * (s < 0)), x1 + m(.4 * (s > 0)), m(1.2), m(1.5), ry(m(1.2)) - m(.7), ry(m(1.2)), { front: DARK }, { bias: 7 });
      // pipes: up the back of the roof, over the eave and down the front to the ground
      for (let i = 0; i < 3; i++) { const px = (s > 0 ? x0 : x1) + s * m(3.4 + i * 1.5), r = m(.32);
        const path = [[px, m(-5.4), ry(m(-5.4)) + r], [px, m(1.0), ry(m(1.0)) + r], [px, m(1.55), ry(m(1.2)) - m(.2)], [px, m(1.6), ry(m(1.2)) - m(1.2)], [px, m(1.6), m(1.4)], [px, m(2.2), m(.35)], [px, m(3.2), m(.3)]];
        S.tube(path, r, { color: '#9aa1a4', shine: 'rgba(255,255,255,.6)' }, { bias: 90 });
        for (const cz of [m(4), m(9), ry(m(1.2)) - m(1.8)]) S.tube([[px - r * 1.4, m(1.5), cz], [px + r * 1.4, m(1.5), cz]], m(.14), { color: '#4a4f52' }, { bias: 95, shine: false });
      }
    });

    // central block: tall plank tower with the passage cut through
    const hole = [[m(-7), 0], [m(7), 0], [m(7), m(18)], [m(-7), m(18)]];
    S.extrude([[m(-12), 0], [m(12), 0], [m(12), m(25)], [m(-12), m(25)]], [hole], 0, m(-6), WALL, DARK, { edgeLines: true, eave: m(4) });
    // passage reveals (inner walls) and the far opening
    S.face([[m(-7), m(-6), 0], [m(-7), 0, 0], [m(-7), 0, m(18)], [m(-7), m(-6), m(18)]], WALL2, { n: [1, 0, 0], O: [m(-7), m(-6), m(18)], U: [0, 1, 0], V: [0, 0, -1], cull: false, bias: -60, ao: true });
    S.face([[m(7), 0, 0], [m(7), m(-6), 0], [m(7), m(-6), m(18)], [m(7), 0, m(18)]], WALL2, { n: [-1, 0, 0], O: [m(7), 0, m(18)], U: [0, -1, 0], V: [0, 0, -1], cull: false, bias: -60, ao: true });
    // stone frame (inset arch) with lintel plaque
    S.extrude([[m(-9.5), 0], [m(9.5), 0], [m(9.5), m(22)], [m(-9.5), m(22)]], [[[m(-7), 0], [m(7), 0], [m(7), m(18)], [m(-7), m(18)]]], m(.9), 0, STONE, STONE, { bias: 40 });
    S.box(m(-7.6), m(7.6), m(.9), m(1.2), m(18.4), m(21.4), { front: mat(t.plaque, 15.2, { whole: true }), top: STONE }, { bias: 60 });
    // stone footings at the base of the tower
    sym(s => { const xa = s * m(9.5), xb = s * m(12); S.box(Math.min(xa, xb), Math.max(xa, xb), 0, m(.8), 0, m(1.2), { front: STONE, top: STONE }, { bias: 45 }); });

    // gable roof over the tower, ridge cap, white railing and the black cables
    const RZ = y => y > m(-3) ? m(28.6) - (y + m(3)) * (4.2 / 4.4) : m(28.6) + (y + m(3)) * (4.2 / 4.4);
    S.face([[m(-12.9), m(-3), RZ(m(-3))], [m(12.9), m(-3), RZ(m(-3))], [m(12.9), m(1.4), RZ(m(1.4))], [m(-12.9), m(1.4), RZ(m(1.4))]], ROOF, { O: [m(-12.9), m(-3), RZ(m(-3))], U: [1, 0, 0], V: ISO.norm([0, 4.4, -4.2]), bias: 20 });
    S.face([[m(12.9), m(-3), RZ(m(-3))], [m(-12.9), m(-3), RZ(m(-3))], [m(-12.9), m(-7.4), RZ(m(-7.4))], [m(12.9), m(-7.4), RZ(m(-7.4))]], ROOF, { O: [m(12.9), m(-3), RZ(m(-3))], U: [-1, 0, 0], V: ISO.norm([0, -4.4, -4.2]), bias: 20 });
    S.box(m(-12.9), m(12.9), m(1.4), m(1.75), RZ(m(1.4)) - m(.8), RZ(m(1.4)), { front: DARK }, { bias: 22 });
    S.box(m(-13.1), m(13.1), m(-3.5), m(-2.5), RZ(m(-3)) - m(.2), RZ(m(-3)) + m(.5), { front: DARK, top: DARK }, { bias: 30 });
    const top = RZ(m(-3)) + m(.5), white = { color: '#f2ede2', shine: 'rgba(255,255,255,.9)' };
    for (let x = -12; x <= 12; x += 2) S.tube([[m(x), m(-3), top], [m(x), m(-3), top + m(1.5)]], m(.14), white, { bias: 60 });
    for (const hz of [.75, 1.5]) S.tube([[m(-12.2), m(-3), top + m(hz)], [m(12.2), m(-3), top + m(hz)]], m(.13), white, { bias: 61 });
    for (let c = 0; c < 3; c++) { const path = [], y0 = -2 + c * 1.2; for (let x = -12.6; x <= 12.6; x += .4) { const y = m(y0 + Math.sin(x * .55 + c * 1.7) * .45); path.push([m(x), y, RZ(y) + m(.25)]); } S.tube(path, m(.12), { color: '#25211f', shine: 'rgba(255,255,255,.3)' }, { bias: 40 + c }); }

    // the two great door leaves: open outward (70°) or shut
    const open = o.open !== false, A = open ? 56 * Math.PI / 180 : 0, th = m(.55), dh = m(18);
    S.leaf(m(-7), m(.9), A, m(7), th, 0, dh, mat(t.doorL, 7, { whole: true }), mat(t.dark, 1.5), { bias: 70 });
    // right leaf: hinge on the right, outside face is the leaf's back face
    const B = Math.PI - A; const ca = Math.cos(B), sa = Math.sin(B), hx = m(7), hy = m(.9) + th;
    const L = (u, v, z) => [hx + u * ca - v * sa, hy + u * sa + v * ca, z], fu = [ca, sa, 0], fn = [-sa, ca, 0], w = m(7);
    S.face([L(w, 0, 0), L(0, 0, 0), L(0, 0, dh), L(w, 0, dh)], mat(t.doorR, 7, { whole: true }), { n: [sa, -ca, 0], O: L(w, 0, dh), U: [-ca, -sa, 0], V: [0, 0, -1], ao: true, bias: 70 });
    S.face([L(0, 0, dh), L(w, 0, dh), L(w, th, dh), L(0, th, dh)], mat(t.dark, 1.5), { n: [0, 0, 1], O: L(0, 0, dh), U: fu, V: fn, bias: 70 });
    S.face([L(w, th, 0), L(w, 0, 0), L(w, 0, dh), L(w, th, dh)], mat(t.dark, 1.5), { n: fu, O: L(w, th, dh), U: [sa, -ca, 0], V: [0, 0, -1], bias: 70 });
    S.face([L(0, th, 0), L(w, th, 0), L(w, th, dh), L(0, th, dh)], mat(t.doorR, 7, { whole: true }), { n: fn, O: L(0, th, dh), U: fu, V: [0, 0, -1], ao: true, bias: 70 });
    return S;
  }
  return { M, build, textures, planks, stones, rng, leafMark, wear, JP };
})();
