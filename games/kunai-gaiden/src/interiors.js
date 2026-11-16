/* Kunai Online — house interiors. Each house of the map gets a furnished Japanese room built with the same 3D kit
   (seeded by the house): tatami or plank floor, plaster back wall with posts, beam, shoji panels, a tokonoma alcove with a
   hanging scroll and ikebana, and furniture by room type (home, kitchen, study, dojo): chabudai and zabuton, tansu chest,
   andon lamp, futon, kamado stove and pots, scroll shelf, weapon rack, bonsai, treasure chest.
   The room shell is one image; every piece of furniture is its own sorted image so the hero walks around them. */
window.KINT = (() => {
  const M = 24, m = v => v * M;
  const R = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };
  const mat = (t, tw, x) => Object.assign({ tex: t, tw: m(tw) }, x || {});
  const INK = '#2a2230';
  /* ---------- textures ---------- */
  function tatami(W, D, seed) { const P = 64, r = R(seed); return cv(Math.ceil(W * P), Math.ceil(D * P), (q, w, h) => { q.fillStyle = '#5a4630'; q.fillRect(0, 0, w, h);
      // mats of 0.9 × 1.8 m, alternating orientation row by row
      for (let y = 0, row = 0; y < h; y += (row % 2 ? .9 : 1.8) * P, row++) { const mh = (row % 2 ? .9 : 1.8) * P, mw = (row % 2 ? 1.8 : .9) * P; for (let x = (row % 3) * -.45 * P; x < w; x += mw) {
          const base = r() < .5 ? [201, 194, 122] : [190, 182, 108]; q.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`; q.fillRect(x + 2, y + 2, mw - 4, mh - 4);
          q.strokeStyle = 'rgba(120,110,50,.35)'; q.lineWidth = 1; if (mw > mh) for (let k = 0; k < mh; k += 3) { q.beginPath(); q.moveTo(x + 4, y + k); q.lineTo(x + mw - 4, y + k); q.stroke(); } else for (let k = 0; k < mw; k += 3) { q.beginPath(); q.moveTo(x + k, y + 4); q.lineTo(x + k, y + mh - 4); q.stroke(); }
          q.fillStyle = '#2f4a3a'; if (mw > mh) { q.fillRect(x + 2, y + 2, mw - 4, 5); q.fillRect(x + 2, y + mh - 7, mw - 4, 5); } else { q.fillRect(x + 2, y + 2, 5, mh - 4); q.fillRect(x + mw - 7, y + 2, 5, mh - 4); }
          q.fillStyle = 'rgba(255,250,210,.12)'; q.fillRect(x + 8, y + 8, mw * .4, mh * .3); } } }); }
  function planks(W, D, seed) { const P = 64, r = R(seed); return cv(Math.ceil(W * P), Math.ceil(D * P), (q, w, h) => { for (let y = 0; y < h; y += 14) { let x = -r() * 120; while (x < w) { const l = 90 + r() * 140, t = r(); q.fillStyle = `rgb(${150 + t * 30 | 0},${104 + t * 22 | 0},${62 + t * 14 | 0})`; q.fillRect(x, y, l, 13);
          q.strokeStyle = 'rgba(80,45,20,.35)'; q.lineWidth = 1; q.beginPath(); q.moveTo(x + 6, y + 5 + r() * 4); q.quadraticCurveTo(x + l / 2, y + 2 + r() * 8, x + l - 6, y + 6); q.stroke(); q.fillStyle = 'rgba(60,32,14,.75)'; q.fillRect(x + l - 1, y, 2, 13); x += l + 1; } q.fillStyle = 'rgba(50,28,12,.8)'; q.fillRect(0, y + 13, w, 1.5); q.fillStyle = 'rgba(255,230,190,.12)'; q.fillRect(0, y, w, 2); } }); }
  const shoji = (lit) => cv(128, 220, (q, w, h) => { q.fillStyle = '#5a3a22'; q.fillRect(0, 0, w, h); q.fillStyle = lit ? '#fff4d0' : '#f4efe2'; q.fillRect(7, 7, w - 14, h - 14); const g = q.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,.3)'); g.addColorStop(1, 'rgba(160,140,100,.18)'); q.fillStyle = g; q.fillRect(7, 7, w - 14, h - 14);
    q.strokeStyle = '#6a4428'; q.lineWidth = 3; for (let x = 7 + (w - 14) / 3; x < w - 10; x += (w - 14) / 3) { q.beginPath(); q.moveTo(x, 7); q.lineTo(x, h - 7); q.stroke(); } for (let y = 7 + (h - 14) / 6; y < h - 10; y += (h - 14) / 6) { q.beginPath(); q.moveTo(7, y); q.lineTo(w - 7, y); q.stroke(); }
    q.fillStyle = '#4a2e18'; q.fillRect(0, h * .55, w, 12); q.fillStyle = '#c9a050'; q.beginPath(); q.arc(w - 18, h * .5, 5, 0, 7); q.fill(); });
  const scrollArt = (kind, ch) => cv(90, 240, (q, w, h) => { q.fillStyle = '#4a5a6a'; q.fillRect(0, 0, w, h); q.fillStyle = '#f2ead4'; q.fillRect(9, 22, w - 18, h - 50); q.fillStyle = '#2a2230'; q.fillRect(0, 0, w, 10); q.fillRect(0, h - 16, w, 16);
    q.fillStyle = 'rgba(40,40,50,.85)'; if (kind === 0) { q.beginPath(); q.moveTo(14, 150); q.lineTo(36, 80); q.lineTo(52, 118); q.lineTo(62, 96); q.lineTo(78, 150); q.closePath(); q.fill(); q.fillStyle = '#c8322a'; q.beginPath(); q.arc(60, 60, 10, 0, 7); q.fill(); }
    else { q.font = '400 46px "Potta One",serif'; q.textAlign = 'center'; const C = ch || [['忍', '耐'], ['和', '平'], ['道', '心'], ['炎', '志']]; q.fillText(C[kind % C.length][0], w / 2, 100); q.font = '400 30px serif'; q.fillText(C[kind % C.length][1], w / 2, 150); }
    q.fillStyle = '#b8322a'; q.fillRect(w - 26, h - 46, 12, 12); });
  const drawers = () => cv(128, 120, (q, w, h) => { q.fillStyle = '#7a4a28'; q.fillRect(0, 0, w, h); for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { const x = 6 + c * 60, y = 6 + r * 38; q.fillStyle = '#9a6236'; q.fillRect(x, y, 56, 34); q.strokeStyle = '#3a2214'; q.lineWidth = 2; q.strokeRect(x, y, 56, 34);
      q.fillStyle = '#2a2230'; q.fillRect(x + 20, y + 14, 16, 5); q.fillStyle = '#c9a050'; q.fillRect(x + 22, y + 15, 12, 3); } });
  const paper = (lit) => cv(64, 96, (q, w, h) => { q.fillStyle = '#3a2214'; q.fillRect(0, 0, w, h); q.fillStyle = lit ? '#ffe2a0' : '#f2e6c8'; q.fillRect(5, 5, w - 10, h - 10); q.strokeStyle = '#3a2214'; q.lineWidth = 2; q.beginPath(); q.moveTo(w / 2, 5); q.lineTo(w / 2, h - 5); q.moveTo(5, h / 2); q.lineTo(w - 5, h / 2); q.stroke(); });
  const fabric = (c1, c2) => cv(64, 64, (q, w, h) => { q.fillStyle = c1; q.fillRect(0, 0, w, h); q.fillStyle = c2; for (let i = 0; i < 6; i++) { q.beginPath(); q.arc(10 + (i % 3) * 22, 14 + Math.floor(i / 3) * 30, 6, 0, 7); q.fill(); } });

  // regional floors: flagstones, packed clay, iron plates, light boards
  function flags(W, D, seed, col) { const P = 64, r = R(seed); return cv(Math.ceil(W * P), Math.ceil(D * P), (q, w, h) => { q.fillStyle = shade(col, -.35); q.fillRect(0, 0, w, h);
      for (let y = 0, row = 0; y < h; y += 46, row++) for (let x = -(row % 2) * 34; x < w; x += 68) { q.fillStyle = shade(col, (r() - .5) * .18); q.fillRect(x + 2, y + 2, 64, 42); q.fillStyle = 'rgba(255,255,255,.08)'; q.fillRect(x + 2, y + 2, 64, 5); } }); }
  function clay(W, D, seed, col) { const P = 64, r = R(seed); return cv(Math.ceil(W * P), Math.ceil(D * P), (q, w, h) => { q.fillStyle = col; q.fillRect(0, 0, w, h);
      for (let i = 0; i < w * h / 500; i++) { q.fillStyle = r() < .5 ? 'rgba(255,240,210,.12)' : 'rgba(80,50,20,.12)'; q.beginPath(); q.ellipse(r() * w, r() * h, 6 + r() * 20, 3 + r() * 8, r() * 3, 0, 7); q.fill(); }
      const cw = Math.min(w * .6, 300), ch = Math.min(h * .45, 200), cx = (w - cw) / 2, cy = h * .4; q.fillStyle = '#8a2a22'; q.fillRect(cx, cy, cw, ch); q.strokeStyle = '#e0b060'; q.lineWidth = 6; q.strokeRect(cx + 10, cy + 10, cw - 20, ch - 20);
      q.fillStyle = '#2a4a6a'; for (let k = 0; k < 5; k++) { q.beginPath(); q.moveTo(cx + cw / 2, cy + 30 + k * (ch - 60) / 4); q.lineTo(cx + cw / 2 + 24, cy + 40 + k * (ch - 60) / 4); q.lineTo(cx + cw / 2, cy + 50 + k * (ch - 60) / 4); q.lineTo(cx + cw / 2 - 24, cy + 40 + k * (ch - 60) / 4); q.fill(); } }); }
  function plates(W, D, seed, col) { const P = 64, r = R(seed); return cv(Math.ceil(W * P), Math.ceil(D * P), (q, w, h) => { q.fillStyle = shade(col, -.3); q.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 96) { q.fillStyle = shade(col, (r() - .5) * .12); q.fillRect(x + 2, y + 2, 92, 60); q.fillStyle = 'rgba(0,0,0,.35)'; for (const [a, b] of [[8, 8], [86, 8], [8, 54], [86, 54]]) { q.beginPath(); q.arc(x + a, y + b, 2.5, 0, 7); q.fill(); }
        q.fillStyle = 'rgba(140,70,30,.18)'; q.fillRect(x + r() * 70, y + 20, 18, 30); } }); }
  function boards(W, D, seed, col) { const P = 64, r = R(seed); return cv(Math.ceil(W * P), Math.ceil(D * P), (q, w, h) => { for (let y = 0; y < h; y += 16) { const t = r(); q.fillStyle = shade(col, (t - .5) * .16); q.fillRect(0, y, w, 15); q.fillStyle = 'rgba(40,25,12,.45)'; q.fillRect(0, y + 15, w, 1.5); for (let x = r() * 200; x < w; x += 160 + r() * 120) q.fillRect(x, y, 1.5, 15); } }); }
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  // regional windows: an arched hole, a round porthole, a square pane — lit at night
  const pane = (kind, frame, glass, lit) => cv(128, 220, (q, w, h) => { q.fillStyle = 'rgba(0,0,0,0)'; q.clearRect(0, 0, w, h); const gl = lit ? '#ffe2a0' : glass;
    const path = () => { q.beginPath(); if (kind === 'round') q.arc(w / 2, h * .42, w * .36, 0, 7); else if (kind === 'arch') { q.moveTo(w * .14, h * .86); q.lineTo(w * .14, h * .36); q.arc(w / 2, h * .36, w * .36, Math.PI, 0); q.lineTo(w * .86, h * .86); q.closePath(); } else q.rect(w * .12, h * .14, w * .76, h * .64); };
    path(); q.fillStyle = frame; q.fill(); q.save(); q.scale(1, 1); path(); q.clip(); q.fillStyle = gl; q.fillRect(w * .2, 0, w * .6, h); q.fillStyle = 'rgba(255,255,255,.25)'; q.fillRect(w * .24, h * .2, w * .14, h * .4); q.restore();
    path(); q.strokeStyle = frame; q.lineWidth = 12; q.stroke(); if (kind === 'square') { q.lineWidth = 5; q.beginPath(); q.moveTo(w / 2, h * .14); q.lineTo(w / 2, h * .78); q.moveTo(w * .12, h * .46); q.lineTo(w * .88, h * .46); q.stroke(); } });
  // the style of each region's rooms: wall colours, floor, windows, the characters on the scrolls, room types, who lives there,
  // what they say, and which of the region's buildings can be entered
  const STYLES = {
  };

  /* ---------- a room ---------- */
  const cache = {};
  function build(id, w, d, seed, night, style, opt) { style = style || {}; opt = opt || {};
    const key = id + (night ? 'n' : '') + (style.id || '') + (opt.upper ? 'u' : ''); if (cache[key]) return cache[key];
    const r = R(seed * 31 + 7), W = Math.max(5, Math.min(13, w - .6)), D = Math.max(4.4, Math.min(10, d - .6)), x0 = -W / 2, x1 = W / 2, y0 = -D, H = 2.8;
    const TY = style.types || ['home', 'home', 'kitchen', 'study', 'dojo'], WC = style.walls || ['#efe3c4', '#e8d6b0', '#dfe2d0'], type = opt.type || TY[seed % TY.length], PL = mat(KTOWN.plaster(WC[seed % WC.length], seed), 3), DK = { color: '#4a2e1a' }, WD = { color: '#7a4e2c' }, LW = { color: '#9a6a3c' };
    const shell = new ISO.Scene(), items = [], cols = [];
    const floorTex = style.floor ? style.floor(W, D, seed, type) : type === 'dojo' || type === 'kitchen' ? planks(W, D, seed) : tatami(W, D, seed);
    shell.face([[m(x0), m(y0), 0], [m(x1), m(y0), 0], [m(x1), 0, 0], [m(x0), 0, 0]], mat(floorTex, W, { whole: true }), { n: [0, 0, 1], O: [m(x0), m(y0), 0], U: [1, 0, 0], V: [0, 1, 0], ground: true });
    // walls: back wall with posts, beam and shoji; side walls (seen from above); a low sill at the front with the doorway
    shell.box(m(x0 - .3), m(x1 + .3), m(y0 - .3), m(y0), 0, m(H), { front: PL, top: DK });
    for (const sx of [x0 - .3, x1]) shell.box(m(sx), m(sx + .3), m(y0), 0, 0, m(H), { front: PL, top: DK, left: PL, right: PL });
    for (let x = x0; x <= x1 + .01; x += W / Math.max(2, Math.round(W / 1.8))) shell.box(m(x - .09), m(x + .09), m(y0), m(y0 + .1), 0, m(H), { front: WD, top: DK }, { bias: 2 });
    shell.box(m(x0), m(x1), m(y0), m(y0 + .12), m(2.05), m(2.2), { front: WD, top: DK }, { bias: 3 });
    const sh = mat(style.window ? pane(style.window[0], style.window[1], style.window[2], night) : shoji(night), 1, { whole: true }), nSh = Math.max(1, Math.floor((W - 2.6) / 1.1));
    for (let i = 0; i < nSh; i++) { const xa = x0 + 2.4 + i * 1.1; shell.decal(m(xa), m(xa + 1.0), m(y0 + .02), m(.05), m(2.0), sh, { bias: 4 }); }
    // tokonoma alcove: raised platform, hanging scroll, ikebana
    shell.box(m(x0 + .2), m(x0 + 2.1), m(y0), m(y0 + .75), 0, m(.18), { front: DK, top: LW }, { bias: 3 });
    shell.decal(m(x0 + .8), m(x0 + 1.5), m(y0 + .03), m(.5), m(2.0), mat(scrollArt(seed % 5, style.kanji), 1, { whole: true }), { bias: 5 });
    const front = opt.upper ? [[x0 - .3, x1 + .3]] : [[x0 - .3, -1.0], [1.0, x1 + .3]];   // an upper floor has no door to the street
    for (const [a, b] of front) shell.box(m(a), m(b), 0, m(.25), 0, m(.3), { front: WD, top: DK });
    cols.push([x0 - 1, x1 + 1, y0 - 1, y0 + .15], [x0 - 1, x0 + .05, y0, .3], [x1 - .05, x1 + 1, y0, .3], [x0 - 1, -1.0, -.05, 1], [1.0, x1 + 1, -.05, 1], [x0 + .2, x0 + 2.1, y0, y0 + .8]); if (opt.upper) cols.push([-1.2, 1.2, -.05, 1]);
    const piece = (x, y, build, col, anchorY) => { const S = new ISO.Scene(); build(S); items.push({ x, y, S, ay: anchorY ?? 0 }); if (col) cols.push([x + col[0], x + col[1], y + col[2], y + col[3]]); };
    const ike = new ISO.Scene(); ike.cylinder(0, 0, m(.12), m(.18), m(.5), { color: '#3a4a6a' }, 10); ike.sphere(0, 0, m(.62), m(.16), { color: '#e86a8a' }, { bands: 3, seg: 10 }); ike.sphere(m(.1), m(.05), m(.7), m(.1), { color: '#f4d35e' }, { bands: 3, seg: 8 }); items.push({ x: x0 + 1.7, y: y0 + .4, S: ike, ay: 0 });
    // furniture by room type
    const cx = (x0 + x1) / 2 + .6, cy = y0 + D * .55;
    if (type !== 'dojo') { piece(cx, cy, S => { for (const [a, b] of [[-.42, -.25], [.42, -.25], [-.42, .25], [.42, .25]]) S.box(m(a - .04), m(a + .04), m(b - .04), m(b + .04), 0, m(.3), { front: DK, top: DK }); S.box(m(-.55), m(.55), m(-.38), m(.38), m(.3), m(.36), { front: WD, top: LW });
        S.cylinder(m(-.15), 0, m(.07), m(.36), m(.46), { color: '#e8e2d2' }, 8); S.cylinder(m(.2), m(.08), m(.1), m(.36), m(.42), { color: '#7a3428' }, 10); }, [-.6, .6, -.42, .42]);
      const cush = [fabric('#a8323a', '#e8b04a'), fabric('#4a3a7a', '#c9b0e0'), fabric('#2f6a5a', '#e8e0c0')];
      for (const [dx, dy] of [[0, -.75], [0, .75], [-.95, 0], [.95, 0]]) if (r() < .85) piece(cx + dx, cy + dy, S => S.box(m(-.27), m(.27), m(-.27), m(.27), 0, m(.08), { front: mat(cush[(r() * 3) | 0], .5), top: mat(cush[(r() * 3) | 0], .5) })); }
    piece(x1 - .9, y0 + .35, S => { S.box(m(-.65), m(.65), m(-.25), m(.25), 0, m(1.15), { front: mat(drawers(), 1.3, { whole: true }), top: LW }); S.box(m(-.7), m(.7), m(-.28), m(.28), m(1.15), m(1.2), { front: DK, top: DK }); if (r() < .6) S.cylinder(m(.35), 0, m(.12), m(1.2), m(1.45), { color: '#c9b08a' }, 10); }, [-.7, .7, -.3, .3]);
    piece(x0 + .5, y0 + 1.4, S => { S.box(m(-.17), m(.17), m(-.17), m(.17), m(.15), m(.82), { front: mat(paper(night), .34, { whole: true }), top: DK }); for (const [a, b] of [[-.17, -.17], [.17, -.17], [-.17, .17], [.17, .17]]) S.box(m(a - .02), m(a + .02), m(b - .02), m(b + .02), 0, m(.88), { front: DK, top: DK }); }, [-.2, .2, -.2, .2]);
    if (type === 'home' && D > 5.2) piece(x1 - 1.3, y0 + 2.6, S => { S.box(m(-.55), m(.55), m(-1), m(1), 0, m(.12), { front: { color: '#f2eee2' }, top: { color: '#f6f2e8' } }); S.box(m(-.53), m(.53), m(-.3), m(1), m(.12), m(.18), { front: mat(fabric('#3a5a9a', '#e8e0c0'), .6), top: mat(fabric('#3a5a9a', '#e8e0c0'), .6) }); S.box(m(-.3), m(.3), m(-.95), m(-.65), m(.12), m(.22), { front: { color: '#e8d8b0' }, top: { color: '#efe2c0' } }); }, null);
    if (type === 'kitchen') { piece(x0 + 1.2, -1.6, S => { S.box(m(-.9), m(.9), m(-.4), m(.4), 0, m(.85), { front: mat(KTOWN.plaster('#b8a88a', 5), 2), top: { color: '#6a5a4a' } }); for (const a of [-.45, .4]) { S.cylinder(m(a), 0, m(.24), m(.85), m(.95), { color: '#2a2a2e' }, 12); S.cylinder(m(a), 0, m(.2), m(.95), m(1.2), { color: '#4a4a52' }, 12); } }, [-.95, .95, -.45, .45]);
      piece(x1 - .7, -1.4, S => { S.box(m(-.3), m(.3), m(-.6), m(.6), 0, m(.9), { front: WD, top: LW }); for (let i = 0; i < 3; i++) S.cylinder(0, m(-.4 + i * .4), m(.13), m(.9), m(1.1), { color: ['#c9a06a', '#8a5a3a', '#e8e2d2'][i] }, 8); }, [-.35, .35, -.65, .65]); }
    if (type === 'study') piece(x0 + 3.2, y0 + .35, S => { S.box(m(-.8), m(.8), m(-.22), m(.22), 0, m(1.6), { front: WD, top: DK }); for (let sh2 = 0; sh2 < 3; sh2++) for (let k = 0; k < 5; k++) S.cylinder(m(-.6 + k * .3), m(.05), m(.07), m(.25 + sh2 * .5), m(.4 + sh2 * .5), { color: ['#e8e2d2', '#c8b48a', '#b8505c'][(k + sh2) % 3] }, 8); }, [-.85, .85, -.25, .25]);
    if (type === 'dojo') { piece(x0 + 3.4, y0 + .3, S => { S.box(m(-1), m(1), m(-.12), m(.12), m(.2), m(1.5), { front: DK, top: DK }); for (let k = 0; k < 3; k++) S.box(m(-.85), m(.85), m(.12), m(.18), m(.6 + k * .35), m(.66 + k * .35), { front: { color: '#2a2230' }, top: { color: '#c9a050' } }); }, [-1, 1, -.2, .2]);
      for (const [dx, dy] of [[-1.2, 0], [1.2, .6]]) piece(cx + dx, cy + dy, S => { S.cylinder(0, 0, m(.16), 0, m(1.4), { color: '#a87a4a' }, 10); S.box(m(-.35), m(.35), m(-.05), m(.05), m(.9), m(1.0), { front: { color: '#8a5a32' }, top: { color: '#8a5a32' } }); }, [-.25, .25, -.25, .25]); }
    if (r() < .6) piece(x1 - .45, -.9, S => { S.cylinder(0, 0, m(.2), 0, m(.28), { color: '#7a4a32' }, 12); S.cylinder(0, 0, m(.04), m(.28), m(.6), { color: '#5a3a24' }, 6); S.sphere(m(.05), 0, m(.72), m(.24), { color: '#4f8a3a' }, { bands: 3, seg: 10, squash: .6 }); S.sphere(m(-.12), m(.05), m(.6), m(.16), { color: '#5f9a42' }, { bands: 3, seg: 10, squash: .6 }); }, [-.25, .25, -.25, .25]);
    // a treasure chest somewhere along the walls
    const chest = { x: x0 + 2.6 + r() * (W - 4.5), y: y0 + .45 }; piece(chest.x, chest.y, S => { S.box(m(-.4), m(.4), m(-.26), m(.26), 0, m(.42), { front: { color: '#8a4a22' }, top: { color: '#a85a2a' } }); S.box(m(-.42), m(.42), m(-.28), m(.28), m(.42), m(.5), { front: { color: '#5a2e14' }, top: { color: '#6a3818' } }); S.box(m(-.06), m(.06), m(.26), m(.3), m(.25), m(.45), { front: { color: '#e0b04a' }, top: { color: '#e0b04a' } }); }, [-.45, .45, -.3, .3]);
    const resident = r() < .45 ? { x: cx - 1.6, y: cy - .3, look: (style.looks || ['villager', 'merchant', 'student', 'medic', 'jonin', 'kunoichi'])[(r() * (style.looks || [0, 0, 0, 0, 0, 0]).length) | 0] } : null;
    const room = { W, D, x0, x1, y0, shell, items, cols, chest, resident, type, lamp: [x0 + .5, y0 + 1.4], lines: style.lines, upper: !!opt.upper, title: opt.title };
    return (cache[key] = room); }
  function blocked(room, x, y) { if (x < room.x0 + .25 || x > room.x1 - .25 || y < room.y0 + .35) return true; if (y > -.05 && Math.abs(x) > .95) return true; if (y > 1.2) return true;
    for (const c of room.cols) if (x > c[0] - .25 && x < c[1] + .25 && y > c[2] - .2 && y < c[3] + .15) return true; return false; }
  const LINES = ['Les rouleaux secrets ? On raconte qu’ils sont cachés sur les plus hauts toits du village.', 'Kurogane… on l’a vu près des falaises au nord-ouest. Ne t’y aventure pas trop tôt.',
    'La nuit, les lucioles dansent au bord de l’eau. C’est mon moment préféré.', 'Aiko achète les herbes médicinales. Il en pousse partout dans l’herbe haute.', 'Un vrai ninja sait courir sur l’eau. Il paraît qu’il faut être au moins niveau 3.',
    'Les ennemis marqués d’une étoile, les Élites, laissent souvent du bel équipement.', 'Quand l’orage gronde, même les loups se cachent… enfin presque.', 'Enchaîne tes coups sans te faire toucher : les combos rapportent plus d’expérience !'];
  // stairs between floors: a flight of steps against the back wall going up, or the well with its railing coming down
  function stairsUp(room, x, to, label) { const y0 = room.y0, S = new ISO.Scene(), WD = { color: '#7a5a3a' }, TP = { color: '#9a7048' };
    for (let k = 0; k < 7; k++) S.box(m(-.6), m(.6), 0, m(2.1 - k * .3), 0, m(.3 * (k + 1)), { front: WD, top: TP, left: { color: '#5a3a22' }, right: { color: '#5a3a22' } });
    S.box(m(.6), m(.68), 0, m(2.1), 0, m(3), { front: { color: '#4a2e1a' }, left: { color: '#4a2e1a' }, right: { color: '#4a2e1a' } });
    room.items.push({ x, y: y0 + .05, S, ay: 0 }); room.cols.push([x - .65, x + .65, y0, y0 + 2.15]);
    const l = { x, y: y0 + 2.6, to, at: [x, y0 + 2.7], label: label || 'Monter à l’étage' }; (room.links = room.links || []).push(l); return l; }
  function stairsDown(room, x, to, label) { const y0 = room.y0, S = new ISO.Scene();
    S.box(m(-.6), m(.6), 0, m(2.1), 0, m(.02), { top: { color: '#1a120c' } }); for (let k = 0; k < 4; k++) S.box(m(-.55), m(.55), m(k * .5), m(k * .5 + .45), m(-.01), m(.015), { top: { color: '#3a2618' } });
    for (const [a, b, c, dd] of [[-.68, -.6, 0, 2.1], [.6, .68, 0, 2.1], [-.68, .68, 0, .08]]) S.box(m(a), m(b), m(c), m(dd), 0, m(.9), { front: { color: '#5a3a22' }, top: { color: '#7a5030' }, left: { color: '#4a2e1a' }, right: { color: '#4a2e1a' } });
    room.items.push({ x, y: y0 + .05, S, ay: 0 }); room.cols.push([x - .7, x + .7, y0, y0 + 2.15]);
    const l = { x, y: y0 + 2.6, to, at: [x, y0 + 2.7], label: label || 'Descendre' }; (room.links = room.links || []).push(l); return l; }
  // clear the furniture standing where stairs or a doorway will go (the six first collision boxes are the walls)
  function clearAt(r, x0, x1, y1) { const hit = (x, y) => x > x0 && x < x1 && y < y1; r.items = r.items.filter(it => !hit(it.x, it.y)); r.cols = r.cols.filter((c, i) => i < 6 || !hit((c[0] + c[1]) / 2, (c[2] + c[3]) / 2)); if (r.chest && hit(r.chest.x, r.chest.y)) r.chest = null; if (r.resident && hit(r.resident.x, r.resident.y)) r.resident.x = r.x0 + 1.4; }
  // a home of several floors: as many as the building outside is tall, bedrooms and studies above the ground floor
  function house(id, w, d, seed, night, style, floors) { const rooms = {}, n = Math.max(1, Math.min(4, floors || 1));
    for (let k = 0; k < n; k++) { const r = build(id + (k ? '_' + k : ''), w, d, seed + k * 7, night, style, k ? { upper: true, type: k === n - 1 ? 'home' : 'study', title: 'Maison · étage ' + k } : {});
      if (!r._stairs) { r._stairs = true; const sx = r.x1 - 1.1, clear = (x0, x1) => { const hit = (x, y) => x > x0 && x < x1 && y < r.y0 + 2.8;   // make room for the stairs: furniture there goes
          r.items = r.items.filter(it => !hit(it.x, it.y)); r.cols = r.cols.filter((c, i) => i < 6 || !((c[0] + c[1]) / 2 > x0 && (c[0] + c[1]) / 2 < x1 && (c[2] + c[3]) / 2 < r.y0 + 2.8)); if (r.chest && hit(r.chest.x, r.chest.y)) r.chest = null; if (r.resident && hit(r.resident.x, r.resident.y)) r.resident.x = r.x0 + 1.4; };
        clear(sx - (k && k < n - 1 ? 2.5 : 1) - .2, sx + .9); if (k < n - 1) stairsUp(r, sx, 'f' + (k + 1)); if (k) stairsDown(r, sx - (k < n - 1 ? 1.6 : 0), 'f' + (k - 1)); }
      rooms['f' + k] = r; }
    for (let k = 0; k < n; k++) for (const l of rooms['f' + k].links || []) { const tg = rooms[l.to], back = (tg.links || []).find(q => q.to === 'f' + k); if (back) l.at = [back.x, back.y + .3]; }
    return n === 1 ? rooms.f0 : { building: true, start: 'f0', rooms }; }
  // what a door leads to: a landmark, a home of several floors, or a single room
  function open(hs, id, seed, night, style) { return (hs.special && KINT.special && KINT.special(hs.special, night)) || house(id, hs.w, hs.d, seed, night, style, hs.floors); }
  for (const k in STYLES) STYLES[k].id = k;
  return { build, blocked, LINES, STYLES, house, open, stairsUp, stairsDown, clearAt };
})();
