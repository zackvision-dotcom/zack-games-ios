/* Kunai Online — HD character on a small 3D rig.
   The skeleton, the coat, the head and the hair locks live in 3D (a = forward, b = character's right, c = up),
   so any of the 8 directions is just a different yaw of the same model. Everything is drawn as vector with ink
   outlines and three-tone cel shading, and re-baked at the exact zoom so it stays sharp. */
window.HERO = (() => {
  const INK = '#2a2230', LW = 1.9, TAU = Math.PI * 2;
  const C0 = {
    skin: ['#fde2cb', '#f2bb9a', '#d99476'], coat: ['#2f90aa', '#1f6a82', '#124a5d'], lining: ['#2a3556', '#1c2540', '#111830'],
    shirt: ['#393d57', '#282b42', '#1a1c2e'], pants: ['#2e3047', '#1f2133', '#131424'], wrap: ['#f5f2eb', '#d2cdc1', '#aaa497'],
    arm: ['#3b3547', '#29242f', '#19151e'], hair: ['#2b2a3b', '#191825', '#0c0b12'], belt: ['#f6f3ec', '#d8d2c4', '#b1aa99'],
    shoe: ['#33292a', '#211a1a', '#120d0d'], metal: ['#b48d3e', '#7e5f24', '#4e3a14'], sheath: ['#2c2533', '#18141c', '#0c0a0e'],
  };
  let C = C0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hexRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), toHex = c => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  const mixHex = (a, b, t) => { const A = hexRGB(a), B = hexRGB(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
  const tones = h => [h, mixHex(h, '#1c1430', .34), mixHex(h, '#120a20', .58)];
  /* looks: any of skin, hair, coat, pants, shirt, belt, arm, shoe, wrap (hex) + eyes (hex), coatLen (0..1), vest (hex),
     headband (true or cloth hex), scarf (hex), hairStyle ('short' | 'long' | 'spiky' | 'messy' | …),
     whiskers, bandEye ('L'|'R': headband slanted over that eye), bandTop (worn as a hairband), shoulder (hex), trim (hex|null) */
  function paletteOf(L) {
    if (!L) return C0; const c = Object.assign({}, C0);
    for (const k of ['skin', 'hair', 'coat', 'pants', 'shirt', 'belt', 'arm', 'shoe', 'wrap', 'shoulder']) if (L[k]) c[k] = tones(L[k]);
    if (L.coat) c.lining = tones(mixHex(L.coat, '#202848', .62));
    return c;
  }
  const irisOf = h => [mixHex(h, '#000010', .65), h, mixHex(h, '#ffffff', .55)];

  /* ---------- 2D drawing helpers ---------- */
  function smooth(g, pts) {
    g.beginPath(); const n = pts.length, mid = i => { const a = pts[i % n], b = pts[(i + 1) % n]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
    let m = mid(n - 1); g.moveTo(m[0], m[1]); for (let i = 0; i < n; i++) { m = mid(i); g.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); } g.closePath();
  }
  // three-tone cel: deep shade, shade band, base shifted toward the light (top-left), rim light, ink
  function cel(g, path, col, o) {
    o = o || {}; const d = o.d ?? 3;
    g.save(); path(); g.clip(); g.fillStyle = col[2]; g.fillRect(-600, -600, 1200, 1200);
    g.translate(-d * .4, -d * .4); path(); g.fillStyle = col[1]; g.fill();
    g.translate(-d * .6, -d * .6); path(); g.fillStyle = col[0]; g.fill(); g.translate(d, d);
    if (o.hi) { g.translate(1.5, 1.5); path(); g.lineWidth = o.hiW || 1.8; g.strokeStyle = o.hi; g.stroke(); g.translate(-1.5, -1.5); }
    g.restore(); if (o.ink !== false) { path(); g.lineWidth = o.lw || LW; g.lineJoin = 'round'; g.strokeStyle = INK; g.stroke(); }
  }
  const stroke = (g, pts, w, col) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; g.stroke(); };
  const curve = (g, a, c, b, w, col) => { g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(c[0], c[1], b[0], b[1]); g.lineWidth = w; g.lineCap = 'round'; g.strokeStyle = col; g.stroke(); };
  // a tapered tube through screen points; prof(seg,u) -> half width. Foreshortened segments collapse into round blobs.
  function tubePts(pts, prof) {
    const L = [], R = [], N = 6; let last = [0, 1];
    const dirOf = s => { const A = pts[s], B = pts[s + 1], dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy); if (l > .6) last = [dx / l, dy / l]; return last; };
    const dirs = []; for (let s = 0; s < pts.length - 1; s++) dirs.push(dirOf(s));
    for (let s = 0; s < pts.length - 1; s++) for (let i = s ? 1 : 0; i <= N; i++) {
      const u = i / N, A = pts[s], B = pts[s + 1], p = [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u];
      let d = dirs[s]; if (u === 1 && s < dirs.length - 1) { d = [d[0] + dirs[s + 1][0], d[1] + dirs[s + 1][1]]; const l = Math.hypot(d[0], d[1]) || 1; d = [d[0] / l, d[1] / l]; }
      const w = prof(s, u), n = [d[1], -d[0]]; L.push([p[0] + n[0] * w, p[1] + n[1] * w]); R.push([p[0] - n[0] * w, p[1] - n[1] * w]);
    }
    const d0 = dirs[0], d1 = dirs[dirs.length - 1], a = pts[0], b = pts[pts.length - 1], w0 = prof(0, 0), w1 = prof(dirs.length - 1, 1);
    return [[a[0] - d0[0] * w0 * .9, a[1] - d0[1] * w0 * .9], ...L, [b[0] + d1[0] * w1 * .9, b[1] + d1[1] * w1 * .9], ...R.reverse()];
  }
  let BULK = 1;
  const tube = (g, pts, prof, col, o) => { const P = tubePts(pts, (s2, u) => prof(s2, u) * BULK); cel(g, () => smooth(g, P), col, o); return P; };

  /* hand-drawn parts, in a local frame: x along the forearm / foot, y perpendicular */
  function inFrame(g, o, ang, flip, fn) { g.save(); g.translate(o[0], o[1]); g.rotate(ang); if (flip) g.scale(1, -1); fn(); g.restore(); }
  function fist(g, W, ang, flip, skin, k) {
    k = k || 1;
    inFrame(g, W, ang, flip, () => { g.scale(k, k);
      // back of the hand, knuckles, curled fingers, heel of the palm
      cel(g, () => { g.beginPath(); g.moveTo(-1, -4.6); g.quadraticCurveTo(5.5, -6.8, 10.2, -6); g.quadraticCurveTo(14.6, -5.2, 14.4, -1.2);
        g.quadraticCurveTo(14.4, 4.2, 9.6, 5.8); g.quadraticCurveTo(4.2, 6.8, .4, 4.6); g.quadraticCurveTo(-2, 0, -1, -4.6); g.closePath(); }, skin, { d: 1.2, lw: 1.5 });
      for (const y of [-3.4, -.4, 2.6]) { g.beginPath(); g.moveTo(14, y); g.quadraticCurveTo(11.6, y + .6, 10.4, y + 1.6); g.lineWidth = .9; g.strokeStyle = 'rgba(120,60,45,.75)'; g.stroke(); }
      g.beginPath(); g.moveTo(9.6, -5.6); g.quadraticCurveTo(10.6, -1, 9.6, 4.8); g.lineWidth = .8; g.strokeStyle = 'rgba(120,60,45,.4)'; g.stroke();
      // thumb resting along the index finger
      cel(g, () => { g.beginPath(); g.moveTo(1.4, -4.8); g.quadraticCurveTo(7.6, -8.6, 11.8, -4.6); g.quadraticCurveTo(8.4, -2.2, 3.2, -2.6); g.closePath(); }, skin, { d: .6, lw: 1.3 }); });
  }
  function shoe(g, A, toe, col, sole) {
    const dx = toe[0] - A[0], dy = toe[1] - A[1], L = Math.hypot(dx, dy), f = Math.min(1, L / 19);
    if (f < .42) {   // seen from the front / back: rounded toe cap with the sole under it
      cel(g, () => { g.beginPath(); g.moveTo(A[0] - 7.4, A[1] + 1); g.quadraticCurveTo(A[0] - 8, A[1] - 6.5, A[0], A[1] - 7); g.quadraticCurveTo(A[0] + 8, A[1] - 6.5, A[0] + 7.4, A[1] + 1);
        g.quadraticCurveTo(A[0] + 7.4, A[1] + 5.4, A[0], A[1] + 5.8); g.quadraticCurveTo(A[0] - 7.4, A[1] + 5.4, A[0] - 7.4, A[1] + 1); g.closePath(); }, col, { d: 1.2, lw: 1.5, hi: 'rgba(255,255,255,.22)' });
      g.beginPath(); g.moveTo(A[0] - 7, A[1] + 3.6); g.quadraticCurveTo(A[0], A[1] + 6.4, A[0] + 7, A[1] + 3.6); g.lineWidth = 2; g.strokeStyle = sole; g.stroke(); return; }
    const ang = Math.atan2(dy, dx), flip = Math.cos(ang) < 0;
    inFrame(g, A, ang, flip, () => { g.scale(f, 1);
      cel(g, () => { g.beginPath(); g.moveTo(-4.6, -7); g.quadraticCurveTo(-8.4, -1.6, -6.6, 4); g.lineTo(13.4, 4.6); g.quadraticCurveTo(18.6, 4.6, 18, .8);
        g.quadraticCurveTo(16.6, -3.8, 9.6, -4.6); g.quadraticCurveTo(4.6, -5, 3.4, -8.4); g.closePath(); }, col, { d: 1.2, lw: 1.5, hi: 'rgba(255,255,255,.22)' });
      g.beginPath(); g.moveTo(-6.4, 3.2); g.lineTo(14, 3.6); g.lineWidth = 2.2; g.strokeStyle = sole; g.stroke();
      g.beginPath(); g.moveTo(3.6, -6.6); g.quadraticCurveTo(6.6, -3.6, 10.6, -4.2); g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,.45)'; g.stroke(); });
  }

  /* anime eye (outer corner toward +x before mirroring): thick upper lash with a flick, gradient iris, big pupil, highlights */
  function eye(g, x, y, sx, m, s, iris) {
    iris = iris || ['#0a2560', '#1c6fe0', '#7cd0ff'];
    g.save(); g.translate(x, y); g.scale(m * sx * s, s);
    const white = () => { g.beginPath(); g.moveTo(-6.4, .8); g.quadraticCurveTo(-1, -8, 6.6, -1.6); g.quadraticCurveTo(2.4, 6.6, -6.4, .8); g.closePath(); };
    g.save(); white(); g.fillStyle = '#fbfaf7'; g.fill(); g.clip();
    const sh = g.createLinearGradient(0, -6, 0, 0); sh.addColorStop(0, 'rgba(70,80,130,.5)'); sh.addColorStop(1, 'rgba(70,80,130,0)'); g.fillStyle = sh; g.fillRect(-8, -8, 16, 8);
    const ir = g.createLinearGradient(0, -5, 0, 6); ir.addColorStop(0, iris[0]); ir.addColorStop(.45, iris[1]); ir.addColorStop(1, iris[2]);
    g.fillStyle = ir; g.beginPath(); g.arc(.4, .6, 5.1, 0, TAU); g.fill(); g.lineWidth = .8; g.strokeStyle = iris[0]; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(.4, 3.6, 3.4, 1.5, 0, 0, TAU); g.fill();
    g.fillStyle = '#05102b'; g.beginPath(); g.ellipse(.6, .4, 2.2, 2.9, 0, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(2.4, -1.8, 2, 1.6, -.4, 0, TAU); g.fill(); g.beginPath(); g.arc(-1.9, 3, .85, 0, TAU); g.fill();
    g.restore();
    g.fillStyle = INK; g.beginPath(); g.moveTo(-7.2, 1.2); g.quadraticCurveTo(-1.6, -10, 7.4, -3.2); g.lineTo(10.6, -5.6); g.lineTo(8.8, -1.6); g.lineTo(6.6, -1.2); g.quadraticCurveTo(-1, -7.2, -6.4, 1.6); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(3.2, -5.6); g.lineTo(6.2, -8.4); g.lineTo(4.8, -5); g.closePath(); g.fill();
    curve(g, [-2.6, 5.2], [3, 6.4], [6.6, .2], 1.1, INK);
    curve(g, [-4, -8.6], [2, -11.2], [7.4, -7], .9, 'rgba(20,16,25,.55)');
    g.restore();
  }

  /* ---------- 3D rig ---------- */
  // keyframed poses: each key is a full pose; values are blended with a smoothstep
  const IDLE = { h: 72, lean: .03, legR: { th: .06, bend: .06 }, legL: { th: -.05, bend: .05 }, armR: { sh: .08, el: .3 }, armL: { sh: -.06, el: .28 }, flap: 0, wind: 0, tilt: 0 };
  const mixP = (A, B, t) => { if (typeof A === 'number') return A + (B - A) * t; if (typeof A === 'boolean' || typeof A === 'string') return t < .5 ? A : B; const o = {}; for (const k in A) o[k] = k in B ? mixP(A[k], B[k], t) : A[k]; for (const k in B) if (!(k in o)) o[k] = B[k]; return o; };
  const fill = P => mixP(IDLE, P, 1);
  function keys(K, ph) { // K = [[t, pose], ...] with t in 0..1
    for (let i = 0; i < K.length - 1; i++) if (ph <= K[i + 1][0]) { const u = (ph - K[i][0]) / (K[i + 1][0] - K[i][0] || 1), s = u * u * (3 - 2 * u); return mixP(fill(K[i][1]), fill(K[i + 1][1]), s); }
    return fill(K[K.length - 1][1]);
  }
  const ARM = (sh, el, x) => Object.assign({ sh, el }, x || {}), LEG = (th, bend) => ({ th, bend });
  const ANIMS = {
    // punch combo strike: wind-up, straight right, recover (guard with the left)
    attack: [[0, { lean: .08, armR: ARM(-.5, 2.2), armL: ARM(.4, 1.9, { inw: .3 }), legR: LEG(-.15, .2), legL: LEG(.25, .3), h: 70 }],
             [.3, { lean: .02, armR: ARM(-.8, 2.4), armL: ARM(.5, 2, { inw: .3 }), legR: LEG(-.2, .2), legL: LEG(.3, .35), h: 69 }],
             [.45, { lean: .32, armR: ARM(1.55, .05, { inw: .25 }), armL: ARM(-.4, 2.1), legR: LEG(-.45, .15), legL: LEG(.5, .45), h: 66, mouth: true, wind: .5 }],
             [.7, { lean: .26, armR: ARM(1.45, .15, { inw: .2 }), armL: ARM(-.3, 2), legR: LEG(-.4, .15), legL: LEG(.45, .4), h: 67, mouth: true, wind: .3 }],
             [1, { lean: .08, armR: ARM(.2, 1.6), armL: ARM(.4, 1.9, { inw: .3 }), legR: LEG(-.15, .2), legL: LEG(.25, .3), h: 70 }]],
    // a high side kick
    kick: [[0, { lean: .05, armR: ARM(.4, 1.9), armL: ARM(.3, 1.9), legR: LEG(0, .1), legL: LEG(0, .1) }],
           [.3, { lean: -.15, armR: ARM(.6, 1.8, { out: .4 }), armL: ARM(-.3, 1.6, { out: .5 }), legR: LEG(.9, 1.6), legL: LEG(-.05, .1), h: 71 }],
           [.5, { lean: -.32, armR: ARM(-.6, 1.4, { out: .8 }), armL: ARM(-.9, 1.2, { out: .9 }), legR: LEG(1.55, .05), legL: LEG(-.1, .15), h: 70, mouth: true, wind: .5 }],
           [.75, { lean: -.25, armR: ARM(-.4, 1.4, { out: .6 }), armL: ARM(-.7, 1.2, { out: .7 }), legR: LEG(1.4, .2), legL: LEG(-.1, .15), h: 70, wind: .3 }],
           [1, { lean: .05, armR: ARM(.4, 1.9), armL: ARM(.3, 1.9), legR: LEG(0, .1), legL: LEG(0, .1) }]],
    // kunai throw: arm cocked behind the head, whipped forward
    throw: [[0, { lean: .02, armR: ARM(.1, .5) }],
            [.35, { lean: -.15, armR: ARM(-2.5, 1.2, { out: .3 }), armL: ARM(1.2, .5), legR: LEG(-.3, .15), legL: LEG(.3, .2), h: 70 }],
            [.55, { lean: .35, armR: ARM(1.35, .05), armL: ARM(-.6, .8), legR: LEG(-.45, .2), legL: LEG(.45, .35), h: 68, mouth: true, wind: .4 }],
            [1, { lean: .05, armR: ARM(.3, .6), armL: ARM(0, .4) }]],
    // hand seals: hands meet in front of the chest; 'sealN' cycles a few finger positions via a small bob
    seal: [[0, { armR: ARM(.2, .5), armL: ARM(.2, .5) }],
           [.25, { h: 70, lean: .06, armR: ARM(.75, 1.45, { inw: 1 }), armL: ARM(.75, 1.45, { inw: 1 }), legR: LEG(-.12, .15), legL: LEG(.12, .15), chakra: 1 }],
           [.5, { h: 69.5, lean: .06, armR: ARM(.85, 1.25, { inw: 1 }), armL: ARM(.85, 1.3, { inw: 1 }), legR: LEG(-.12, .15), legL: LEG(.12, .15), chakra: 1 }],
           [.75, { h: 70, lean: .06, armR: ARM(.7, 1.55, { inw: 1 }), armL: ARM(.7, 1.5, { inw: 1 }), legR: LEG(-.12, .15), legL: LEG(.12, .15), chakra: 1 }],
           [1, { h: 69.5, lean: .06, armR: ARM(.85, 1.25, { inw: 1 }), armL: ARM(.85, 1.3, { inw: 1 }), legR: LEG(-.12, .15), legL: LEG(.12, .15), chakra: 1 }]],
    // jutsu release: right palm thrust forward, left hand bracing the wrist
    cast: [[0, { armR: ARM(.75, 1.45, { inw: 1 }), armL: ARM(.75, 1.45, { inw: 1 }), chakra: 1 }],
           [.3, { lean: .22, armR: ARM(1.6, 0, { inw: .3 }), armL: ARM(1.25, .4, { inw: .9 }), legR: LEG(-.4, .15), legL: LEG(.45, .4), h: 67, mouth: true, wind: .7, chakra: 1 }],
           [.8, { lean: .2, armR: ARM(1.55, 0, { inw: .3 }), armL: ARM(1.2, .45, { inw: .9 }), legR: LEG(-.4, .15), legL: LEG(.45, .4), h: 67, wind: .6, chakra: 1 }],
           [1, { lean: .05, armR: ARM(.3, .6), armL: ARM(.2, .5) }]],
    // dodge roll-less dash: very low, arms trailing
    dash: [[0, { lean: .55, h: 64, armR: ARM(-1.3, .3, { out: .2 }), armL: ARM(-1.2, .3, { out: .2 }), legR: LEG(.85, 1.1), legL: LEG(-.9, .2), wind: 1.3 }],
           [1, { lean: .55, h: 64, armR: ARM(-1.35, .3, { out: .2 }), armL: ARM(-1.25, .3, { out: .2 }), legR: LEG(.9, 1.2), legL: LEG(-.95, .2), wind: 1.3 }]],
    // jump: take-off (one knee up, arms swept back) → tucked apex → legs opening for the landing; the frame follows vz
    jump: [[0, { lean: .15, h: 70, armR: ARM(-.9, .6, { out: .3 }), armL: ARM(-.8, .6, { out: .3 }), legR: LEG(.95, 1.7), legL: LEG(-.2, .5), wind: .8, flap: .6 }],
           [.5, { lean: .28, h: 65, armR: ARM(.6, 1.7, { out: .2 }), armL: ARM(.5, 1.7, { out: .2 }), legR: LEG(1.15, 2.1), legL: LEG(.95, 2), wind: .5, flap: -.4 }],
           [1, { lean: .02, h: 71, armR: ARM(-.4, .4, { out: .9 }), armL: ARM(-.35, .4, { out: .9 }), legR: LEG(.3, .35), legL: LEG(-.15, .55), wind: 1.1, flap: 1 }]],
    hurt: [[0, { lean: -.3, h: 70, armR: ARM(-.5, .6, { out: .6 }), armL: ARM(-.4, .7, { out: .6 }), legR: LEG(.25, .3), legL: LEG(-.1, .2), tilt: .3, closed: true }],
           [.5, { lean: -.22, h: 70.5, armR: ARM(-.35, .6, { out: .5 }), armL: ARM(-.3, .7, { out: .5 }), legR: LEG(.2, .3), legL: LEG(-.1, .2), tilt: .22, closed: true }],
           [1, { lean: -.3, h: 70, armR: ARM(-.5, .6, { out: .6 }), armL: ARM(-.4, .7, { out: .6 }), legR: LEG(.25, .3), legL: LEG(-.1, .2), tilt: .3, closed: true }]],
  };
  function poseOf(kind, ph) {
    const a = ph * TAU;
    if (kind === 'run' || kind === 'ninjarun' || kind === 'walk') {
      const ninja = kind === 'ninjarun', walk = kind === 'walk', amp = walk ? .45 : ninja ? 1.15 : .9;
      const leg = s => { const f = a + s; return { th: amp * Math.sin(f), bend: (walk ? .1 : .18) + (walk ? .55 : 1.45) * Math.pow(Math.max(0, Math.cos(f)), 1.1) }; };
      const arm = s => { const f = a + s; return walk ? { sh: -.35 * Math.sin(f), el: .35 + .2 * Math.sin(f) } : { sh: -1.0 * Math.sin(f), el: 1.6 + .3 * Math.sin(f) }; };
      const base = { h: (walk ? 72 : 70) + (walk ? 1.5 : 5) * Math.abs(Math.sin(a)), lean: walk ? .06 : ninja ? .62 : .3, legR: leg(0), legL: leg(Math.PI), armR: arm(Math.PI), armL: arm(0), flap: Math.sin(a * 2 + 1), wind: walk ? .15 : ninja ? 1.3 : 1, tilt: walk ? 0 : ninja ? -.35 : -.1, mouth: !walk && Math.cos(a * 2) > .4 };
      if (ninja) { base.armR = { sh: -.78 + .05 * Math.sin(a), el: .04, out: .12 }; base.armL = { sh: -.74 - .05 * Math.sin(a), el: .04, out: .12 }; base.lean = .85; base.h = 62 + 4 * Math.abs(Math.sin(a)); base.mouth = false; base.wind = 1.6; }   // the ninja run: chest and head forward, arms straight back
      return base;
    }
    if (ANIMS[kind]) return keys(ANIMS[kind], ph);
    const b = Math.sin(a);
    return Object.assign(fill({}), { h: 72 + b * .6, armR: { sh: .08 + b * .02, el: .3 }, flap: b * .2 });
  }
  function draw(g, o) {
    o = o || {}; const p = poseOf(o.anim || 'idle', o.phase || 0), yaw = (o.yaw || 0) * Math.PI / 180, LK = o.look || {};
    C = paletteOf(o.look); const iris = LK.eyes ? irisOf(LK.eyes) : o.iris;
    const F = [Math.sin(yaw), Math.cos(yaw)], R = [-Math.cos(yaw), Math.sin(yaw)];
    // proportions: head size, leg length, torso length (chibi styles use a big head and short limbs)
    const PR = Object.assign({ head: 1, leg: 1, torso: 1, bulk: 1 }, LK.prop), LS = PR.leg, TS = PR.torso, HS = PR.head; BULK = PR.bulk;
    const h = p.h * LS, cl = Math.cos(p.lean), sl = Math.sin(p.lean);
    const up = (a, b, c) => { const cc = (c - h) * TS; return [a * cl + cc * sl, b, h + cc * cl - a * sl]; };
    const P = (a, b, c) => [a * F[0] + b * R[0], -c + (a * F[1] + b * R[1]) * .12, a * F[1] + b * R[1]];
    const PU = (a, b, c) => P(...up(a, b, c));
    const items = [], put = (k, fn) => items.push({ k, fn });

    g.fillStyle = 'rgba(20,30,10,.25)'; g.beginPath(); g.ellipse(0, 0, 24 + 6 * Math.abs(F[0]), 6.5, 0, 0, TAU); g.fill();

    /* legs */
    for (const side of [1, -1]) {
      const Lg = side > 0 ? p.legR : p.legL, hb = 8.5 * BULK * side, sa = Lg.th - Lg.bend;
      const K = [34 * LS * Math.sin(Lg.th), hb, h - 34 * LS * Math.cos(Lg.th)], A = [K[0] + 32 * LS * Math.sin(sa), hb, K[2] - 32 * LS * Math.cos(sa)];
      const M = [K[0] + (A[0] - K[0]) * .42, hb, K[2] + (A[2] - K[2]) * .42];
      const fp = clamp(sa * .55, -.7, .5), toe = [A[0] + 15 * Math.cos(fp), hb, A[2] - 3 + 15 * Math.sin(fp)], heel = [A[0] - 5 * Math.cos(fp), hb, A[2] - 3 - 5 * Math.sin(fp)];
      const s2 = [P(0, hb, h), P(...K), P(...M), P(...A), P(...heel), P(...toe)];
      put((s2[1][2] + s2[3][2]) / 2, () => {
        shoe(g, s2[3], s2[5], C.shoe, '#6a5648');
        const W = tube(g, [s2[2], s2[3]], (s, u) => 8.4 - u * 1.8, C.wrap, { d: 1.6 });
        g.save(); smooth(g, W); g.clip(); for (let i = 1; i < 6; i++) { const t = i / 6, q = [s2[2][0] + (s2[3][0] - s2[2][0]) * t, s2[2][1] + (s2[3][1] - s2[2][1]) * t]; stroke(g, [[q[0] - 9, q[1] + 2.4], [q[0] + 9, q[1] - 2.4]], .9, 'rgba(90,80,70,.55)'); } g.restore();
        tube(g, [s2[0], s2[1], s2[2]], (s, u) => s ? 10.6 + 2.6 * Math.sin(Math.PI * u * .8) - u * 1.6 : 13.6 + 1.2 * Math.sin(Math.PI * u) - u * 3, C.pants, { d: 2.4, hi: 'rgba(140,150,200,.3)' });
        const k = s2[1], t = [s2[0][0] - k[0], s2[0][1] - k[1]], l = Math.hypot(...t) || 1, n = [t[1] / l, -t[0] / l];
        curve(g, [k[0] + n[0] * 7, k[1] + n[1] * 7 + 2], [k[0], k[1] + 5], [k[0] - n[0] * 6, k[1] - n[1] * 6 + 1], 1.3, 'rgba(0,0,0,.5)');
        curve(g, [k[0] + n[0] * 5, k[1] + n[1] * 5 - 5], [k[0] + 1, k[1] - 2], [k[0] - n[0] * 4, k[1] - n[1] * 4 - 6], 1.1, 'rgba(0,0,0,.4)');
      });
    }

    /* ring surfaces (coat skirt, torso, collar): quads around the body, split into the half facing us and the far half */
    function ring(levels, opts) {
      const S = 28, segs = [];
      const pt = (i, j) => { const Lv = levels[i], al = j / S * TAU, off = opts.offset ? opts.offset(i, al) : [0, 0, 0];
        const a = Lv.a * BULK * Math.cos(al) + off[0], b = Lv.b * BULK * Math.sin(al) + off[1], c = Lv.z + off[2]; return opts.upper ? PU(a, b, c) : P(a, b, c); };
      const grid = levels.map((_, i) => Array.from({ length: S + 1 }, (_, j) => pt(i, j)));
      for (let j = 0; j < S; j++) { const al = (j + .5) / S * TAU, na = Math.cos(al), nb = Math.sin(al), nd = na * F[1] + nb * R[1], nx = na * F[0] + nb * R[0];
        for (let i = 0; i < levels.length - 1; i++) { const kind = opts.kind ? opts.kind(al, i) : 'coat'; if (kind === 'none') continue;
          segs.push({ j, i, near: nd >= 0, nd, nx, kind, q: [grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]] }); } }
      const drawHalf = near => {
        const list = segs.filter(s => s.near === near); if (!list.length) return;
        for (const s of list) { const inside = !near && opts.open; const pal = inside ? C.lining : (s.kind === 'shirt' ? C.shirt : s.kind === 'shoulder' ? C.shoulder : (opts.pal || C.coat));
          const lx = inside ? -s.nx : s.nx, ld = inside ? -s.nd : s.nd, k = -.62 * lx + .45 * ld;
          const col = k > .22 ? pal[0] : k > -.3 ? pal[1] : pal[2];
          g.beginPath(); g.moveTo(s.q[0][0], s.q[0][1]); for (const v of s.q.slice(1)) g.lineTo(v[0], v[1]); g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = .8; g.strokeStyle = col; g.stroke(); }
        if (opts.folds) for (const fa of opts.folds) { const j = Math.round(fa / TAU * 28) % 28; if (!list.some(s => s.j === j && s.i === 0)) continue;
          stroke(g, grid.map(row => [row[j][0], row[j][1]]), 1.1, near ? 'rgba(6,30,40,.5)' : 'rgba(0,0,0,.35)'); }
        const last = levels.length - 1, has = (j, i) => list.some(s => s.j === ((j + 28) % 28) && s.i === i), opening = (j, i) => !segs.some(s => s.j === ((j + 28) % 28) && s.i === i);
        if (opts.trim && near) { g.lineWidth = 3.6; g.strokeStyle = opts.trim; g.lineCap = 'round';
          for (const s of list) { if (opening(s.j - 1, s.i)) { g.beginPath(); g.moveTo(s.q[0][0], s.q[0][1]); g.lineTo(s.q[3][0], s.q[3][1]); g.stroke(); } if (opening(s.j + 1, s.i)) { g.beginPath(); g.moveTo(s.q[1][0], s.q[1][1]); g.lineTo(s.q[2][0], s.q[2][1]); g.stroke(); } } }
        g.lineWidth = LW; g.strokeStyle = INK; g.lineCap = 'round';
        const seg = (a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
        for (const s of list) { if (s.i === last - 1 && opts.hem !== false) seg(s.q[3], s.q[2]);
          if (s.i === 0 && opts.top) seg(s.q[0], s.q[1]);
          if (!has(s.j - 1, s.i)) seg(s.q[0], s.q[3]);
          if (!has(s.j + 1, s.i)) seg(s.q[1], s.q[2]); }
      };
      return { far: () => drawHalf(false), near: () => drawHalf(true) };
    }
    const wind = p.wind, fl = p.flap, front = al => Math.abs(Math.atan2(Math.sin(al), Math.cos(al)));
    const cLen = LK.coatLen ?? 1, skirtLv = cLen > .7 ? [{ z: h + 8, a: 12, b: 15 }, { z: h - 10, a: 15, b: 18 }, { z: h - 30, a: 19, b: 21.5 }, { z: h - 40, a: 21, b: 23 }]
      : cLen > .3 ? [{ z: h + 8, a: 12, b: 15 }, { z: h - 6, a: 14.5, b: 17.5 }, { z: h - 16, a: 16.5, b: 19.5 }, { z: h - 22, a: 17.5, b: 20.5 }] : [{ z: h + 8, a: 12, b: 15 }, { z: h + 1, a: 13.2, b: 16.2 }, { z: h - 5, a: 14, b: 17 }];
    const skirt = ring(skirtLv, {
      open: true, trim: '#e9f3ee', folds: [.9, 1.9, 2.8, 3.6, 4.4, 5.3], kind: al => (front(al) < .36 + .3 * wind ? 'none' : 'coat'),
      offset: (i, al) => { if (!i) return [0, 0, 0]; const back = (1 - Math.cos(al)) / 2, k = i / 3 * cLen; return [-wind * k * (6 + 16 * back) + fl * k * 2 * back, 0, wind * k * back * (6 + fl * 3)]; },
    });
    put(-40, skirt.far); put(40, skirt.near);
    const torso = ring([{ z: h + 6, a: 12, b: 15.5 }, { z: h + 22, a: 13, b: 17.5 }, { z: h + 34, a: 13.5, b: 19 }, { z: h + 40, a: 11.5, b: 18.4 }, { z: h + 45, a: 8.5, b: 14 }, { z: h + 48.5, a: 6, b: 9.5 }], {
      upper: true, hem: false, trim: LK.trim === undefined ? '#e9f3ee' : LK.trim, folds: [2.2, 4.1], kind: (al, i) => (front(al) < [.16, .24, .34, .46, .56, .62][i] ? 'shirt' : (LK.shoulder && i >= 2 ? 'shoulder' : 'coat')),
    });
    put(45, torso.near);
    if (LK.vest) { const VP = tones(LK.vest);
      const vest = ring([{ z: h + 3, a: 13.6, b: 16.6 }, { z: h + 20, a: 14.6, b: 18 }, { z: h + 34, a: 15, b: 19 }, { z: h + 43, a: 11.6, b: 19.2 }, { z: h + 50, a: 9.5, b: 11 }], { upper: true, pal: VP, top: false, folds: [1.3, 5], kind: (al, i) => (front(al) < [.1, .1, .12, .2, .6][i] ? 'none' : 'coat') });
      put(46.5, () => { vest.near();
        for (const sd of [1, -1]) for (const z of [h + 27, h + 15]) { const q = PU(14.4, sd * 8.5, z); if (q[2] < 3) continue; const w = 5.5 * clamp(q[2] / 14, .3, 1);
          cel(g, () => { g.beginPath(); g.roundRect(q[0] - w, q[1] - 5, w * 2, 10, 2.5); }, VP, { d: 1.2, lw: 1.8 }); stroke(g, [[q[0] - w, q[1] - 2], [q[0] + w, q[1] - 2]], 1, 'rgba(0,0,0,.45)'); } }); }
    const belt = ring([{ z: h + 11, a: 13.6, b: 17.2 }, { z: h + 3, a: 13.4, b: 17 }], { upper: true, pal: C.belt, top: true });
    put(46, () => { belt.near();
      const k = PU(12, -4, h + 7); if (k[2] > 2) { cel(g, () => { g.beginPath(); g.ellipse(k[0], k[1], 4.2, 3.6, 0, 0, TAU); }, C.belt, { d: 1, lw: 2 }); cel(g, () => { g.beginPath(); g.moveTo(k[0] - 1, k[1] + 2); g.lineTo(k[0] - 4 + fl * 1.5, k[1] + 15); g.lineTo(k[0] + 1, k[1] + 14); g.lineTo(k[0] + 2.5, k[1] + 2); g.closePath(); }, C.belt, { d: 1, lw: 1.8 }); } });
    if (LK.crest === 'fan') { const q = PU(-15.5, 0, h + 30); if (q[2] > 2) put(46.8, () => { const sx = 6.5 * clamp(q[2] / 15, .2, 1);
        g.save(); g.translate(q[0], q[1]); g.lineWidth = 1.6; g.strokeStyle = INK;
        g.fillStyle = '#f4f1ea'; g.fillRect(-1.2, 4, 2.4, 8); g.strokeRect(-1.2, 4, 2.4, 8);
        g.beginPath(); g.ellipse(0, 0, sx, 6.5, 0, 0, Math.PI); g.fillStyle = '#f4f1ea'; g.fill();
        g.beginPath(); g.ellipse(0, 0, sx, 6.5, 0, Math.PI, TAU); g.fillStyle = '#c8282a'; g.fill();
        g.beginPath(); g.ellipse(0, 0, sx, 6.5, 0, 0, TAU); g.stroke(); g.restore(); }); }
    const kHilt = PU(12, -16, h + 6), kTip = PU(-38, -17, h - 6), kGrip = PU(26, -15, h + 11);
    if (LK.katana !== false) put((kHilt[2] + kTip[2]) / 2 > 0 ? 47 : -45, () => {
      tube(g, [kHilt, kTip], () => 2.7, C.sheath, { d: 1.2, hi: 'rgba(190,180,230,.6)', lw: 2 });
      cel(g, () => { g.beginPath(); g.arc(kTip[0], kTip[1], 3.1, 0, TAU); }, C.metal, { d: .8, lw: 1.8 });
      tube(g, [kHilt, kGrip], () => 2.5, ['#2a2531', '#1a1620', '#0e0c12'], { d: .8, lw: 2 });
      for (let i = 1; i < 4; i++) { const q = [kHilt[0] + (kGrip[0] - kHilt[0]) * i / 4, kHilt[1] + (kGrip[1] - kHilt[1]) * i / 4]; g.fillStyle = '#e8e2d4'; g.beginPath(); g.arc(q[0], q[1], 1.2, 0, TAU); g.fill(); }
      cel(g, () => { g.beginPath(); g.ellipse(kHilt[0], kHilt[1], 2.6, 4.4, 0, 0, TAU); }, C.metal, { d: .6, lw: 1.8 });
    });

    /* carried on the back */
    if (LK.back) { const bk = PU(-18, 0, h + 30), behind = bk[2] < 0, BK = LK.back;
      put(behind ? -46 : 47.6, () => {
        if (BK === 'gourd') { const lo = PU(-21, 2, h + 24), hi = PU(-21, 4, h + 50), nk = PU(-21, 3, h + 40), GP = tones('#c8a070');
          cel(g, () => { g.beginPath(); g.ellipse(lo[0], lo[1], 17, 15, 0, 0, TAU); }, GP, { d: 2, lw: 2.2 }); cel(g, () => { g.beginPath(); g.ellipse(hi[0], hi[1], 11, 10, 0, 0, TAU); }, GP, { d: 1.6, lw: 2 });
          cel(g, () => { g.beginPath(); g.ellipse(nk[0], nk[1], 6, 4, 0, 0, TAU); }, tones('#8a2a22'), { d: 1, lw: 1.6 }); const cork = PU(-21, 4, h + 61); cel(g, () => { g.beginPath(); g.ellipse(cork[0], cork[1], 4, 3, 0, 0, TAU); }, tones('#6a4a2a'), { d: .8, lw: 1.4 }); }
        else if (BK === 'fan') { const a = PU(-18, -14, h + 4), b = PU(-18, 10, h + 76); tube(g, [a, b], () => 7.5, tones('#3a2a22'), { d: 1.6, lw: 2.2 }); for (let k = 1; k <= 3; k++) { const q = [a[0] + (b[0] - a[0]) * k / 4, a[1] + (b[1] - a[1]) * k / 4]; g.fillStyle = '#b8261e'; g.beginPath(); g.arc(q[0], q[1], 3.2, 0, TAU); g.fill(); } }
        else if (BK === 'cleaver') { const a = PU(-19, -8, h + 66), b = PU(-19, 8, h - 32), d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...d), n = [-d[1] / l, d[0] / l], wd = 13;
          cel(g, () => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(b[0] + n[0] * wd, b[1] + n[1] * wd); g.lineTo(a[0] + n[0] * wd, a[1] + n[1] * wd); g.closePath(); }, tones('#c8d0d6'), { d: 2, lw: 2.2, hi: 'rgba(255,255,255,.8)' });
          const c = [b[0] + n[0] * wd * .5 - d[0] / l * 8, b[1] + n[1] * wd * .5 - d[1] / l * 8]; g.fillStyle = '#2a2230'; g.beginPath(); g.arc(c[0], c[1], 4, 0, TAU); g.fill(); tube(g, [a, [a[0] - d[0] / l * 14, a[1] - d[1] / l * 14]], () => 3, tones('#3a2a22'), { d: .8, lw: 1.8 }); }
        else if (BK === 'swords') for (let k = 0; k < 7; k++) { const t = (k - 3) / 3, a = PU(-17, t * 10, h + 2), b = PU(-17, t * 22, h + 62); tube(g, [a, b], () => 2.2, tones(k % 2 ? '#2a2a30' : '#5a4a3a'), { d: .8, lw: 1.6 }); cel(g, () => { g.beginPath(); g.ellipse(b[0], b[1], 2.4, 2.4, 0, 0, TAU); }, tones('#b48d3e'), { d: .5, lw: 1.2 }); }
        else if (BK === 'puppet') { const a = PU(-20, 0, h + 4), b = PU(-20, 0, h + 66); tube(g, [a, b], (s2, u) => 11 - u * 2, tones('#e8dcc0'), { d: 2, lw: 2 }); for (let k = 1; k < 7; k++) { const q = [a[0] + (b[0] - a[0]) * k / 7, a[1] + (b[1] - a[1]) * k / 7]; stroke(g, [[q[0] - 10, q[1] - 2], [q[0] + 10, q[1] + 2]], 1.2, 'rgba(90,70,40,.6)'); } }
        else if (BK === 'scroll') { const a = PU(-19, -24, h + 26), b = PU(-19, 24, h + 26); tube(g, [a, b], () => 9, tones('#c8402e'), { d: 2, lw: 2.2 }); for (const q of [a, b]) cel(g, () => { g.beginPath(); g.ellipse(q[0], q[1], 5, 9, 0, 0, TAU); }, tones('#e8dcc0'), { d: 1, lw: 1.6 }); }
      }); }

    /* arms */
    const fists = [];
    for (const side of [1, -1]) {
      const Am = side > 0 ? p.armR : p.armL, sb = 20 * BULK * side;
      const S = [0, sb * .86, h + 38], E = [20 * TS * Math.sin(Am.sh), sb + side * (2.5 + (Am.out || 0) * 10 - (Am.inw || 0) * 6), S[2] - 20 * Math.cos(Am.sh)], fa = Am.sh + Am.el;
      const W = [E[0] + 17 * TS * Math.sin(fa), sb + side * (1.5 + (Am.out || 0) * 16 - (Am.inw || 0) * 16.5), E[2] - 17 * Math.cos(fa)], Cf = [E[0] + 5 * Math.sin(fa), (E[1] * 3 + W[1]) / 4, E[2] - 5 * Math.cos(fa)], Fi = [W[0] + 4 * Math.sin(fa), W[1], W[2] - 4 * Math.cos(fa)];
      const s2 = [PU(...S), PU(...E), PU(...Cf), PU(...W), PU(...Fi)], dep = (s2[1][2] + s2[3][2] + s2[4][2]) / 3; fists.push(s2[4]);
      put(dep > 3 ? 55 + dep * .1 : -50 + dep * .1, () => {
        const fw = s2[3], fd = [s2[4][0] - fw[0], s2[4][1] - fw[1]], ang = Math.atan2(fd[1], fd[0]);
        // thumb on the upper side of the fist
        const flip = Math.cos(ang) < 0;
        fist(g, [fw[0] - Math.cos(ang) * 1.5, fw[1] - Math.sin(ang) * 1.5], ang, flip, C.skin, 1.05);
        const cuffEnd = [fw[0] - Math.cos(ang) * 1, fw[1] - Math.sin(ang) * 1];
        tube(g, [s2[0], s2[1], cuffEnd], (s, u) => s ? 9.6 + u * 1.6 : 8.6 + u * 1.2, C.coat, { d: 2.4, hi: 'rgba(170,230,245,.45)' });
        { const n = [-Math.sin(ang), Math.cos(ang)], c0 = [cuffEnd[0] - Math.cos(ang) * 2.4, cuffEnd[1] - Math.sin(ang) * 2.4];
          g.beginPath(); g.moveTo(c0[0] + n[0] * 10.6, c0[1] + n[1] * 10.6); g.lineTo(c0[0] - n[0] * 10.6, c0[1] - n[1] * 10.6); g.lineWidth = 3; g.strokeStyle = '#e9f3ee'; g.stroke(); g.lineWidth = 1.2; g.strokeStyle = INK; g.stroke(); }
        curve(g, [s2[1][0] - 4, s2[1][1] - 6], [s2[1][0] + 1, s2[1][1] - 1], [s2[1][0] - 3, s2[1][1] + 4], 1.1, 'rgba(6,30,40,.55)');
      });
    }

    /* neck, collar, head, hair */
    put(70, () => {
      tube(g, [PU(0, 0, h + 44), PU(1, 0, h + 58)], () => 5.6, C.skin, { d: 1.6, lw: 2 });
      const collar = ring([{ z: h + 45, a: 8, b: 9.5 }, { z: h + 53, a: 8.6, b: 10 }], { upper: true, open: true, top: true, kind: al => (front(al) < .45 ? 'none' : 'coat') });
      if (LK.hood) { const hood = ring([{ z: h + 38, a: 13, b: 18.5 }, { z: h + 45, a: 14.5, b: 17.5 }, { z: h + 51, a: 11, b: 13.5 }], { upper: true, open: true, top: true, trim: null, kind: al => (front(al) < .7 ? 'none' : 'coat'), offset: (i, al) => [-3 - i * 1.5, 0, 0] }); hood.far(); hood.near(); }
      else { collar.far(); collar.near(); }
      if (LK.scarf) { const SC = tones(LK.scarf), sc = ring([{ z: h + 43, a: 10.5, b: 12.5 }, { z: h + 50, a: 10, b: 12 }, { z: h + 55, a: 9, b: 10.5 }], { upper: true, pal: SC, top: true });
        const tail = [PU(-9, 3, h + 47), PU(-22 - wind * 14, 6, h + 40 + wind * 6 + fl * 2), PU(-34 - wind * 22, 8, h + 30 + wind * 10 + fl * 4)];
        if (tail[0][2] < 0) tube(g, tail, (s2, u) => 4.6 - u * .8, SC, { d: 1.6, lw: 2 }); sc.far(); sc.near(); if (tail[0][2] >= 0) tube(g, tail, (s2, u) => 4.6 - u * .8, SC, { d: 1.6, lw: 2 }); }
      const Hc3 = up(2, 0, h + 56 + 20 * HS / TS), r = 25 * HS, Hc = P(...Hc3), tilt = p.tilt;
      // head yaw: profile views keep a little of the face turned toward the camera
      let yd = ((o.yaw || 0) % 360 + 360) % 360, sg = 1; if (yd > 180) { yd = 360 - yd; sg = -1; }
      const hy = sg * (yd <= 90 ? yd * .72 : 64.8 + (yd - 90) * 1.28) * Math.PI / 180, HF = [Math.sin(hy), Math.cos(hy)], HR = [-Math.cos(hy), Math.sin(hy)];
      const S3 = (a, b, c) => { const ct = Math.cos(tilt), st = Math.sin(tilt), A = (a * ct + c * st) * r, B = b * r, Cc = (c * ct - a * st) * r;
        return [Hc[0] + A * HF[0] + B * HR[0], Hc[1] - Cc + (A * HF[1] + B * HR[1]) * .12, Hc[2] + A * HF[1] + B * HR[1]]; };
      const vis = (a, b) => a * HF[1] + b * HR[1];
      // hair locks in 3D: [root dir, tip dir, width, curl, swept by wind]
      const LOCKS = [
        // back volume, swept back by the wind
        [[-.45, .45, .7], [-1.25, .7, .05], 19, 3, 1], [[-.45, -.45, .7], [-1.25, -.7, .05], 19, -3, 1], [[-.7, 0, .6], [-1.4, 0, -.15], 21, 2, 1],
        [[-.3, .7, .5], [-1.0, 1.0, -.45], 16, 3, .7], [[-.3, -.7, .5], [-1.0, -1.0, -.45], 16, -3, .7],
        [[-.85, .3, 0], [-1.05, .55, -.95], 15, 2, .4], [[-.85, -.3, 0], [-1.05, -.55, -.95], 15, -2, .4], [[-.9, 0, -.15], [-1.05, 0, -1.05], 15, 2, .4],
        // crown: soft swept clumps instead of spikes
        [[.1, .35, .95], [-.75, .62, 1.12], 17, 4, .6], [[.1, -.35, .95], [-.75, -.62, 1.12], 17, -4, .6], [[.35, 0, .95], [-.55, 0, 1.3], 18, 3, .6],
        [[.0, .7, .7], [-.4, 1.12, .55], 14, 3, .4], [[.0, -.7, .7], [-.4, -1.12, .55], 14, -3, .4],
        // side locks framing the face down to the cheeks
        [[.35, .8, .45], [.62, 1.0, -.62], 13, -2, 0], [[.35, -.8, .45], [.62, -1.0, -.62], 13, 2, 0], [[.1, .9, .3], [.22, 1.12, -.5], 12, -2, .2], [[.1, -.9, .3], [.22, -1.12, -.5], 12, 2, .2],
        // bangs: seven clumps of different lengths down to the brow
        [[.5, .62, .75], [1.0, .74, -.08], 12, -2, 0], [[.6, .4, .8], [1.06, .44, -.18], 13, -2, 0], [[.64, .17, .82], [1.08, .18, -.02], 12, -1.5, 0], [[.66, -.04, .82], [1.09, -.05, -.2], 13, 1.5, 0],
        [[.64, -.25, .8], [1.07, -.28, -.04], 12, 2, 0], [[.6, -.45, .78], [1.04, -.5, -.16], 13, 2, 0], [[.5, -.64, .74], [.98, -.76, -.06], 12, 2, 0],
      ];
      const lockPts = L0 => { const [rd, td, w, curl, sw] = L0, n = Math.hypot(...rd), root = S3(rd[0] / n * .9, rd[1] / n * .9, rd[2] / n * .9), tip = S3(td[0] - wind * sw * .35, td[1], td[2] + wind * sw * .1);
        return { root, tip, w, curl, dep: (vis(rd[0], rd[1]) + vis(td[0], td[1])) / 2 }; };
      const drawLock = Lk => { const { root, tip, w, curl } = Lk, d = [tip[0] - root[0], tip[1] - root[1]], l = Math.hypot(...d) || 1, n = [-d[1] / l, d[0] / l];
        const m = [(root[0] + tip[0]) / 2 + n[0] * curl, (root[1] + tip[1]) / 2 + n[1] * curl];
        const path = () => { g.beginPath(); g.moveTo(root[0] + n[0] * w / 2, root[1] + n[1] * w / 2); g.quadraticCurveTo(m[0] + n[0] * w * .55, m[1] + n[1] * w * .55, tip[0], tip[1]); g.quadraticCurveTo(m[0] - n[0] * w * .45, m[1] - n[1] * w * .45, root[0] - n[0] * w / 2, root[1] - n[1] * w / 2); g.closePath(); };
        cel(g, path, C.hair, { d: 2.4, hi: 'rgba(130,145,200,.7)', hiW: 2, lw: 2.1 }); };
      if (LK.hairStyle === 'messy') { LOCKS.length = 0;
        const R = [[.0, .0, 1, .35, 0, 1.38, 17], [.3, .55, .8, .45, .95, 1.1, 15], [.3, -.55, .8, .45, -.95, 1.1, 15], [-.5, .4, .75, -.9, .8, 1.0, 17], [-.5, -.4, .75, -.9, -.8, 1.0, 17], [-.75, 0, .5, -1.25, 0, .55, 18],
          [-.4, .8, .3, -.85, 1.2, .05, 15], [-.4, -.8, .3, -.85, -1.2, .05, 15], [-.8, .35, 0, -1.15, .6, -.6, 14], [-.8, -.35, 0, -1.15, -.6, -.6, 14], [.1, .9, .35, .3, 1.25, -.35, 13], [.1, -.9, .35, .3, -1.25, -.35, 13],
          [.55, .45, .75, 1.0, .58, .02, 12], [.6, .2, .8, 1.08, .25, -.1, 12], [.62, -.05, .82, 1.1, -.06, .04, 12], [.6, -.3, .8, 1.06, -.38, -.12, 12], [.55, -.55, .74, .98, -.66, 0, 12], [.2, .15, .95, .1, .3, 1.55, 9]];
        for (const [a0, b0, c0, a1, b1, c1, w] of R) LOCKS.push([[a0, b0, c0], [a1, b1, c1], w, (a0 * 7 % 3) - 1.5, 0]); }
      if (LK.hairStyle === 'long') LOCKS.push([[-.6, .5, .3], [-.8, .9, -1.9], 16, 3, .7], [[-.6, -.5, .3], [-.8, -.9, -1.9], 16, -3, .7], [[-.85, 0, .2], [-1.0, 0, -2.0], 18, 2, .8], [[.1, .9, .3], [.25, 1.1, -1.4], 12, -2, .3], [[.1, -.9, .3], [.25, -1.1, -1.4], 12, 2, .3]);
      if (LK.hairStyle === 'spiky') LOCKS.push([[-.2, .5, .9], [-.6, .95, 1.55], 14, 3, .6], [[-.2, -.5, .9], [-.6, -.95, 1.55], 14, -3, .6], [[-.5, 0, .85], [-1.1, 0, 1.3], 15, 2, .8], [[.4, .3, .9], [.6, .5, 1.45], 12, -2, .2]);
      const STY = {
        fox: [[[.1, 0, 1], [-.1, 0, 1.68], 17], [[.3, .45, .85], [.45, .9, 1.45], 15], [[.3, -.45, .85], [.45, -.9, 1.45], 15], [[-.3, .5, .8], [-.55, 1.1, 1.3], 16], [[-.3, -.5, .8], [-.55, -1.1, 1.3], 16],
          [[-.6, 0, .75], [-1.3, 0, 1.25], 18], [[-.6, .45, .5], [-1.25, 1.0, .75], 16], [[-.6, -.45, .5], [-1.25, -1.0, .75], 16], [[-.85, .2, .1], [-1.5, .5, .15], 15], [[-.85, -.2, .1], [-1.5, -.5, .15], 15], [[-.88, 0, -.2], [-1.38, 0, -.62], 16], [[-.8, .42, -.2], [-1.3, .74, -.55], 15], [[-.8, -.42, -.2], [-1.3, -.74, -.55], 15],
          [[.0, .85, .5], [.15, 1.45, .6], 13], [[.0, -.85, .5], [.15, -1.45, .6], 13], [[.0, .9, .1], [.1, 1.35, -.3], 12], [[.0, -.9, .1], [.1, -1.35, -.3], 12],
          [[.55, .5, .75], [1.05, .72, -.05], 14], [[.62, .2, .8], [1.12, .26, -.18], 14], [[.64, -.1, .8], [1.12, -.14, -.06], 14], [[.58, -.42, .76], [1.06, -.64, -.14], 14]],
        crow: [[[-.6, 0, .7], [-1.55, 0, 1.15], 21], [[-.55, .45, .6], [-1.5, .78, .95], 18], [[-.55, -.45, .6], [-1.5, -.78, .95], 18], [[-.7, .25, .35], [-1.55, .5, .55], 17], [[-.7, -.25, .35], [-1.55, -.5, .55], 17],
          [[-.75, 0, .2], [-1.45, 0, .35], 17], [[0, 0, 1], [-.65, 0, 1.38], 18], [[.2, .4, .9], [-.35, .72, 1.22], 15], [[.2, -.4, .9], [-.35, -.72, 1.22], 15],
          [[.0, .9, .4], [.12, 1.12, -.55], 13], [[.0, -.9, .4], [.12, -1.12, -.55], 13], [[.45, .75, .6], [.85, .98, -.9], 13], [[.45, -.75, .6], [.85, -.98, -.9], 13],
          [[.6, .45, .75], [1.04, .56, -.35], 12], [[.6, -.45, .75], [1.04, -.56, -.35], 12], [[.65, .05, .8], [1.1, .1, -.12], 12]],
        silver: [[[0, 0, 1], [-.2, -.6, 1.8], 21], [[.2, .3, .9], [.12, -.08, 1.75], 17], [[-.3, .3, .85], [-.52, -.15, 1.7], 18], [[-.5, -.2, .8], [-.82, -.95, 1.45], 17], [[.1, -.5, .85], [.02, -1.15, 1.5], 16],
          [[-.6, .4, .6], [-1.05, .35, 1.3], 17], [[-.8, 0, .4], [-1.35, -.45, .85], 17], [[-.85, .3, .1], [-1.3, .5, .2], 15], [[-.85, -.3, .1], [-1.3, -.6, .25], 15], [[.3, .6, .7], [.38, .8, 1.25], 13],
          [[.1, .9, .3], [.2, 1.12, -.4], 12], [[.1, -.9, .3], [.2, -1.12, -.4], 12], [[.6, .3, .75], [1.06, .42, .08], 13], [[.62, -.2, .78], [1.08, -.26, .02], 13], [[.55, .58, .7], [.98, .72, -.02], 12]],
        // short, thick, spiky hair
        ember: [[[.1, 0, 1], [-.15, 0, 1.5], 17], [[.3, .45, .85], [.4, .85, 1.3], 15], [[.3, -.45, .85], [.4, -.85, 1.3], 15], [[-.3, .5, .8], [-.6, 1.0, 1.15], 16], [[-.3, -.5, .8], [-.6, -1.0, 1.15], 16],
          [[-.6, 0, .75], [-1.2, 0, 1.05], 18], [[-.75, .4, .3], [-1.25, .8, .35], 16], [[-.75, -.4, .3], [-1.25, -.8, .35], 16], [[-.85, 0, -.1], [-1.3, 0, -.4], 16],
          [[.0, .85, .45], [.15, 1.25, .3], 13], [[.0, -.85, .45], [.15, -1.25, .3], 13], [[.55, .45, .75], [1.0, .62, .02], 13], [[.62, .1, .8], [1.08, .14, -.08], 13], [[.6, -.3, .78], [1.04, -.46, 0], 13]],
        // slicked back : flat to the skull, swept backwards
        slick: [[[.5, 0, .9], [-1.15, 0, .95], 22], [[.4, .45, .8], [-1.1, .6, .75], 18], [[.4, -.45, .8], [-1.1, -.6, .75], 18], [[-.6, 0, .6], [-1.25, 0, .2], 20], [[0, .85, .4], [-.3, 1.05, .1], 13], [[0, -.85, .4], [-.3, -1.05, .1], 13]],
        // close-cropped 
        shaved: [[[.3, 0, .95], [-.6, 0, 1.08], 20], [[.0, .6, .75], [-.6, .8, .7], 16], [[.0, -.6, .75], [-.6, -.8, .7], 16], [[-.7, 0, .4], [-1.05, 0, .3], 18]],
        // a short bob down to the jaw 
        bob: [[[.0, 0, 1], [-.6, 0, 1.25], 18], [[-.6, 0, .6], [-1.15, 0, .3], 19], [[-.5, .55, .5], [-1.0, .9, -.3], 16], [[-.5, -.55, .5], [-1.0, -.9, -.3], 16], [[.2, .85, .4], [.4, 1.1, -.6], 13], [[.2, -.85, .4], [.4, -1.1, -.6], 13],
          [[.6, .35, .8], [1.05, .45, .0], 12], [[.62, -.1, .82], [1.08, -.12, -.05], 12], [[.58, -.45, .76], [1.04, -.6, 0], 12]],
        // hair swept back into a topknot
        onoki: [[[.4, 0, .9], [-1.05, 0, .85], 18], [[.2, .55, .7], [-.9, .75, .55], 15], [[.2, -.55, .7], [-.9, -.75, .55], 15], [[-.3, 0, 1], [-.45, 0, 1.7], 14], [[0, .85, .3], [-.2, 1.08, -.1], 12], [[0, -.85, .3], [-.2, -1.08, -.1], 12]],
      };
      // extra locks added to the default cut: pigtails, four ponytails, a bun, a long mane, a curtain over one eye
      const EXTRA = {
        pigtails: [[[-.5, .75, .1], [-.7, 1.15, -1.9], 15, 3, .6], [[-.5, -.75, .1], [-.7, -1.15, -1.9], 15, -3, .6]],
        temari: [[[-.6, .5, .7], [-1.3, .95, 1.05], 13, 3, .4], [[-.6, -.5, .7], [-1.3, -.95, 1.05], 13, -3, .4], [[-.7, .5, 0], [-1.35, 1, -.35], 13, 3, .4], [[-.7, -.5, 0], [-1.35, -1, -.35], 13, -3, .4]],
        bun: [[[-.2, .55, .85], [-.35, .75, 1.25], 22, 2, 0], [[-.2, .6, .8], [-.25, .85, 1.15], 18, -2, 0]],
        mane: [[[-.7, 0, .6], [-1.2, 0, -2.3], 22, 2, .9], [[-.6, .5, .5], [-1.05, .8, -2.1], 18, 3, .8], [[-.6, -.5, .5], [-1.05, -.8, -2.1], 18, -3, .8], [[-.2, .6, .95], [-.6, 1.0, 1.6], 14, 3, .5], [[-.2, -.6, .95], [-.6, -1.0, 1.6], 14, -3, .5], [[.1, .85, .4], [.3, 1.1, -1.2], 13, -2, .2], [[.1, -.85, .4], [.3, -1.1, -1.2], 13, 2, .2]],
        mei: [[[-.6, .5, .3], [-.8, .9, -1.9], 16, 3, .7], [[-.6, -.5, .3], [-.8, -.9, -1.9], 16, -3, .7], [[-.85, 0, .2], [-1.0, 0, -2.0], 18, 2, .8], [[.7, .32, .62], [1.12, .36, -.62], 16, -2, 0]],
      };
      if (STY[LK.hairStyle]) { LOCKS.length = 0; for (const [a, b, w] of STY[LK.hairStyle]) LOCKS.push([a, b, w, ((a[1] * 10 + a[0] * 3) % 3) - 1, LK.hairStyle === 'silver' ? .3 : .5]); }
      if (EXTRA[LK.hairStyle]) LOCKS.push(...EXTRA[LK.hairStyle]);
      if (LK.hairStyle === 'sakura') LOCKS.push([[-.6, .6, .3], [-.72, .98, -1.05], 15, 3, .5], [[-.6, -.6, .3], [-.72, -.98, -1.05], 15, -3, .5], [[-.85, 0, .2], [-1.02, 0, -1.08], 17, 2, .5], [[.2, .88, .3], [.32, 1.08, -1.0], 12, -2, .2], [[.2, -.88, .3], [.32, -1.08, -1.0], 12, 2, .2]);
      const locks = LOCKS.map(lockPts), behind = locks.filter(l => l.dep < -.15).sort((a, b) => a.dep - b.dep), infront = locks.filter(l => l.dep >= -.15).sort((a, b) => a.dep - b.dep);
      behind.forEach(drawLock);
      const headCircle = rr => { g.beginPath(); g.arc(Hc[0], Hc[1], rr, 0, TAU); };
      cel(g, () => headCircle(r + 2.5), C.hair, { d: 2.6, hi: 'rgba(130,145,200,.7)' });
      for (const sd of [1, -1]) { const v = vis(-.05, sd); if (v < -.35) continue; const e = S3(-.05, sd, -.3);
        cel(g, () => { g.beginPath(); g.ellipse(e[0], e[1], 3.4 + 1.6 * (1 - Math.abs(v)), 5.6, 0, 0, TAU); }, C.skin, { d: 1, lw: 1.8 }); }
      const HP = [];
      for (let la = -.35; la <= 1.001; la += .15) for (let lo = 0; lo < TAU; lo += TAU / 24) { const cr = Math.sqrt(Math.max(0, 1 - la * la)); HP.push([Math.cos(lo) * cr, Math.sin(lo) * cr, la]); }
      for (const sd of [-1, 1]) HP.push([.45, sd * .74, -.48], [.08, sd * .8, -.6], [.5, sd * .52, -.86], [.3, sd * .3, -1.06], [-.35, sd * .58, -.62]);
      HP.push([.6, 0, -1.2], [.45, 0, -1.12]);
      const hull = pts => { pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        const lo = [], up2 = []; for (const p2 of pts) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p2) <= 0) lo.pop(); lo.push(p2); }
        for (let k = pts.length - 1; k >= 0; k--) { const p2 = pts[k]; while (up2.length > 1 && cr(up2[up2.length - 2], up2[up2.length - 1], p2) <= 0) up2.pop(); up2.push(p2); } return lo.slice(0, -1).concat(up2.slice(0, -1)); };
      const face = hull(HP.map(q => S3(...q)));
      const facePath = () => { g.beginPath(); face.forEach((q, k) => k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); };
      cel(g, facePath, C.skin, { d: 2.4, lw: 2.6 });
      // hairline: walk the visible arc in angular order (left silhouette -> front -> right silhouette)
      const HN = 64, arc = [];
      for (let i = 0; i < HN; i++) { const al = -Math.PI + i / HN * TAU, hh = Math.max(-.88, .3 - 1.3 * Math.pow((1 - Math.cos(al)) / 2, 1.2)), rho = Math.sqrt(1 - hh * hh), a = Math.cos(al) * rho, b = Math.sin(al) * rho;
        arc.push({ v: vis(a, b) > -.03, p: S3(a * 1.02, b * 1.02, hh) }); }
      let st = arc.findIndex((q, i) => q.v && !arc[(i - 1 + HN) % HN].v); const hl = [];
      if (st < 0 && arc[0].v) st = 0; if (st >= 0) for (let k = 0; k < HN; k++) { const q = arc[(st + k) % HN]; if (!q.v) break; hl.push(q.p); }
      if (hl.length > 1 && hl[0][0] > hl[hl.length - 1][0]) hl.reverse();
      if (hl.length > 1) { const R2 = r + 2.6, f0 = hl[0], f1 = hl[hl.length - 1];
        const a0 = Math.atan2(f0[1] - Hc[1], f0[0] - Hc[0]), a1 = Math.atan2(f1[1] - Hc[1], f1[0] - Hc[0]);
        // close the cap over the top of the skull: from the last hairline point around the top back to the first
        let e1 = a1, e0 = a0; while (e0 > e1) e0 -= TAU; const viaTop = (e0 + e1) / 2; let ccw = Math.sin(viaTop) < 0;
        g.save(); headCircle(R2 + .5); g.clip();
        cel(g, () => { g.beginPath(); g.moveTo(f0[0], f0[1]); for (const q of hl) g.lineTo(q[0], q[1]);
          g.lineTo(Hc[0] + Math.cos(a1) * (R2 + 6), Hc[1] + Math.sin(a1) * (R2 + 6));
          if (ccw) { for (let t = e1; t >= e0 - 1e-6; t -= .12) g.lineTo(Hc[0] + Math.cos(t) * (R2 + 6), Hc[1] + Math.sin(t) * (R2 + 6)); }
          else { let t1 = a1, t0 = a0; while (t0 < t1) t0 += TAU; for (let t = t1; t <= t0 + 1e-6; t += .12) g.lineTo(Hc[0] + Math.cos(t) * (R2 + 6), Hc[1] + Math.sin(t) * (R2 + 6)); }
          g.lineTo(Hc[0] + Math.cos(a0) * (R2 + 6), Hc[1] + Math.sin(a0) * (R2 + 6)); g.closePath(); }, C.hair, { d: 2.4, hi: 'rgba(130,145,200,.7)', ink: false });
        g.restore(); }
      const feat = (a, b, c) => ({ p: S3(a, b, c), v: vis(a, b) });
      for (const sd of [1, -1]) { const bl = feat(.66, sd * .5, -.55); if (bl.v > .25) { g.fillStyle = 'rgba(240,120,110,.25)'; g.beginPath(); g.ellipse(bl.p[0], bl.p[1], 5 * bl.v, 2.6, 0, 0, TAU); g.fill(); } }
      if (LK.whiskers) for (const sd of [1, -1]) for (const c of [-.46, -.56, -.66]) { const a = feat(.8, sd * .36, c), b = feat(.6, sd * .72, c + (c + .56) * .4); if (a.v < .1) continue; stroke(g, [a.p, b.p], 1.5, 'rgba(60,40,40,.75)'); }
      const eyeSide = LK.bandEye === 'L' ? -1 : LK.bandEye === 'R' ? 1 : 0;
      for (const sd of [1, -1]) { const E = feat(.82, sd * .4, -.26); if (E.v < .12 || sd === eyeSide) continue;
        const oc = feat(.5, sd * .72, -.28), m = Math.sign(oc.p[0] - E.p[0]) || 1, nrm = Math.hypot(.82, .4);
        if (p.closed) curve(g, [E.p[0] - 6 * m * E.v, E.p[1] - 2], [E.p[0], E.p[1] + 3], [E.p[0] + 6 * m * E.v, E.p[1] - 3], 2.4, INK);
        else eye(g, E.p[0], E.p[1], clamp(E.v / nrm, .3, 1), m, 1.22 * HS * (LK.eyeSize || 1), iris);
        const B = feat(.84, sd * .42, .06); if (B.v > .12) curve(g, [B.p[0] - m * 6 * E.v, B.p[1] + 1], [B.p[0], B.p[1] - 1.6], [B.p[0] + m * 6 * E.v, B.p[1] + 1.6], 2.2, INK); }
      if (LK.mask) { const MC = tones(LK.mask), mk = []; for (let i = 0; i <= 30; i++) { const al = -Math.PI / 2 - .25 + (Math.PI + .5) * i / 30, c = -.3 + .05 * Math.cos(al * 2), rho = Math.sqrt(1 - c * c) * 1.04; mk.push(S3(Math.cos(al) * rho, Math.sin(al) * rho, c)); }
        const vm = mk.filter((q, i) => vis(Math.cos(-Math.PI / 2 - .25 + (Math.PI + .5) * i / 30), Math.sin(-Math.PI / 2 - .25 + (Math.PI + .5) * i / 30)) > -.05);
        if (vm.length > 2) { g.save(); g.beginPath(); facePath(); g.clip();
          vm.sort((u, v) => u[0] - v[0]); cel(g, () => { g.beginPath(); g.moveTo(vm[0][0] - 4, vm[0][1]); for (const q of vm) g.lineTo(q[0], q[1]); g.lineTo(vm[vm.length - 1][0] + 4, vm[vm.length - 1][1]); g.lineTo(Hc[0] + 40, Hc[1] + 50); g.lineTo(Hc[0] - 40, Hc[1] + 50); g.closePath(); }, MC, { d: 2, ink: false }); g.restore();
          stroke(g, vm, 2.2, INK); } }
      const N = feat(.86, 0, -.6); if (N.v > .2) stroke(g, [[N.p[0] + HF[0] * 2.4, N.p[1] - 1], [N.p[0] + HF[0] * 1.2, N.p[1] + 2]], 1.3, 'rgba(150,80,60,.8)');
      const Mo = feat(.7, 0, -.86); if (Mo.v > .15 && !LK.mask) { const w = 3.2 * Math.max(.4, Mo.v);
        if (p.mouth) { g.fillStyle = '#6b2328'; g.beginPath(); g.ellipse(Mo.p[0], Mo.p[1] + .5, w, 2.4, 0, 0, TAU); g.fill(); g.lineWidth = 1.2; g.strokeStyle = INK; g.stroke(); }
        else curve(g, [Mo.p[0] - w, Mo.p[1]], [Mo.p[0], Mo.p[1] + 1.4], [Mo.p[0] + w, Mo.p[1] - .3], 1.4, INK); }
      infront.forEach(drawLock);
      // face paint (Kanwar paint), the forehead tattoo (a kanji), a diamond, a goatee, dark glasses
      if (LK.paint) for (const sd of [1, -1]) { const a = feat(.8, sd * .36, .2), b = feat(.85, sd * .3, -.5), c = feat(.62, sd * .62, -.75); if (a.v > .1) { stroke(g, [a.p, b.p], 2.4, LK.paint); stroke(g, [b.p, c.p], 2.2, LK.paint); } }
      if (LK.paint) { const n0 = feat(.94, 0, .1), n1 = feat(.9, 0, -.55); if (n0.v > .1) stroke(g, [n0.p, n1.p], 2.4, LK.paint); }
      if (LK.tattoo) { const T = feat(.78, .42, .36); if (T.v > .2) { g.save(); g.translate(T.p[0], T.p[1]); g.scale(T.v, 1); g.fillStyle = '#b02a2a'; g.font = '900 9px "Yu Mincho",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(LK.tattoo, 0, 0); g.restore(); } }
      if (LK.diamond) { const D = feat(.9, 0, .32); if (D.v > .2) { g.fillStyle = LK.diamond; g.beginPath(); g.moveTo(D.p[0], D.p[1] - 3.4); g.lineTo(D.p[0] + 2.4 * D.v, D.p[1]); g.lineTo(D.p[0], D.p[1] + 3.4); g.lineTo(D.p[0] - 2.4 * D.v, D.p[1]); g.closePath(); g.fill(); } }
      if (LK.beard) { const b0 = feat(.72, 0, -.98), b1 = feat(.5, 0, -1.32); if (b0.v > .05) { stroke(g, [b0.p, b1.p], 6, INK); stroke(g, [b0.p, b1.p], 4, LK.beard); } }
      if (LK.glasses) { const gl = []; for (const sd of [1, -1]) { const E = feat(.86, sd * .4, -.24); if (E.v > .12) gl.push(E); }
        for (const E of gl) { g.fillStyle = 'rgba(20,20,26,.92)'; g.beginPath(); g.ellipse(E.p[0], E.p[1], 6.5 * Math.max(.4, E.v), 4.2, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(E.p[0] - 3, E.p[1] - 2.5, 2.5, 1.4); }
        if (gl.length === 2) stroke(g, [gl[0].p, gl[1].p], 1.6, '#141418'); }
      if (LK.flower) { const fl2 = S3(-.15, .72, .85); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; g.fillStyle = k % 2 ? '#e8eef8' : '#a8c0f0'; g.beginPath(); g.ellipse(fl2[0] + Math.cos(a) * 3.6, fl2[1] + Math.sin(a) * 2.8, 3.4, 2, a, 0, TAU); g.fill(); } g.fillStyle = '#f2d060'; g.beginPath(); g.arc(fl2[0], fl2[1], 1.6, 0, TAU); g.fill(); }
      if (LK.hood && LK.hoodEars) for (const sd of [1, -1]) { const e0 = S3(-.1, sd * .45, 1.0), e1 = S3(-.2, sd * .62, 1.55), e2 = S3(-.25, sd * .8, 1.0); cel(g, () => { g.beginPath(); g.moveTo(e0[0], e0[1]); g.lineTo(e1[0], e1[1]); g.lineTo(e2[0], e2[1]); g.closePath(); }, tones(LK.coat), { d: 1.2, lw: 1.8 }); }
      if (LK.headband) { const cloth = tones(typeof LK.headband === 'string' ? LK.headband : '#2a3350'), band = [];
        const lift = LK.bandTop ? .38 : 0, drop = al => eyeSide ? 1.5 * Math.max(0, eyeSide * Math.sin(al)) * clamp(Math.cos(al) + .05, 0, 1) : 0, BW = eyeSide ? 1.2 : 1;
        for (let i = 0; i <= 40; i++) { const al = -Math.PI + i / 40 * TAU, c = .3 + lift + .1 * Math.cos(al) - drop(al), rho = Math.sqrt(1 - c * c) * 1.05; if (vis(Math.cos(al), Math.sin(al)) > -.02) band.push(S3(Math.cos(al) * rho, Math.sin(al) * rho, c)); }
        band.sort((u, v) => u[0] - v[0]); if (band.length > 1) { stroke(g, band, 8.5 * BW, INK); stroke(g, band, 6 * BW, cloth[1]); stroke(g, band.map(q => [q[0], q[1] - 1.2 * BW]), 2, cloth[0]); }
        const pv = vis(1, 0); if (pv > .05) { const pl = []; for (const [al, c0] of [[-.42, .5], [.42, .5], [.42, .24], [-.42, .24]]) { const c = c0 + lift - drop(al) * .45, rho = Math.sqrt(1 - c * c) * 1.08; pl.push(S3(Math.cos(al) * rho, Math.sin(al) * rho, c)); }
          cel(g, () => { g.beginPath(); g.moveTo(pl[0][0], pl[0][1]); for (const q of pl.slice(1)) g.lineTo(q[0], q[1]); g.closePath(); }, ['#d7dde2', '#a3abb3', '#6f7880'], { d: 1.4, hi: 'rgba(255,255,255,.9)', lw: 2 });
          const mc = S3(1.06, 0, .37 + lift); g.save(); g.translate(mc[0], mc[1]); g.scale(pv, 1); g.strokeStyle = '#3d454c'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(-4.5, 0); g.lineTo(0, -2.4); g.lineTo(4.5, 0); g.lineTo(0, 2.4); g.closePath(); g.moveTo(-6.5, 0); g.lineTo(6.5, 0); g.stroke(); g.restore(); }
        if (vis(-1, 0) > .15) { const kn = S3(-1.02, 0, .22 + lift); for (const sd of [-1, 1]) tube(g, [[kn[0], kn[1]], [kn[0] - wind * 10 * (F[0] || .3) + sd * 5, kn[1] + 14 - wind * 6]], (s2, u) => 2.6 - u, cloth, { d: 1, lw: 1.6 }); } }

    });

    if (p.chakra && fists.length === 2) put(80, () => { const c = [(fists[0][0] + fists[1][0]) / 2, (fists[0][1] + fists[1][1]) / 2], t = (o.phase || 0) * TAU;
      const q = g.createRadialGradient(c[0], c[1], 1, c[0], c[1], 22); q.addColorStop(0, 'rgba(230,250,255,.95)'); q.addColorStop(.3, 'rgba(110,210,255,.55)'); q.addColorStop(1, 'rgba(60,140,255,0)');
      g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = q; g.beginPath(); g.arc(c[0], c[1], 22 * p.chakra, 0, TAU); g.fill();
      for (let i = 0; i < 3; i++) { const an = t * 2 + i * 2.1; curve(g, [c[0] + Math.cos(an) * 14, c[1] + Math.sin(an) * 9], [c[0] + Math.cos(an + 1) * 4, c[1] + Math.sin(an + 1) * 3], [c[0] + Math.cos(an + 2) * 12, c[1] + Math.sin(an + 2) * 8 - 6], 1.6, 'rgba(160,230,255,.8)'); }
      g.restore(); });
    items.sort((a, b) => a.k - b.k); for (const it of items) it.fn();
  }

  /* bake frames at a pixel height for one of the 8 yaws (0 = facing the camera, 90 = right, 180 = away) */
  function bake(anim, frames, px, yaw, opts) {
    const k = px / 185, out = [];
    for (let i = 0; i < frames; i++) { const c = document.createElement('canvas'); c.width = Math.ceil(190 * k); c.height = Math.ceil(215 * k); const g = c.getContext('2d');
      g.scale(k, k); g.translate(95, 200); draw(g, Object.assign({ anim, phase: i / frames, yaw }, opts)); out.push(c); }
    out.ax = 95 * k; out.ay = 200 * k; return out;
  }
  return { draw, bake, eye, cel, tubePts, tube, smooth, curve, stroke, tones, mixHex };
})();
