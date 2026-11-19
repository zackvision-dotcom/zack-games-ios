/* BRAISE — Era VIII · Le Signal. Nouvelle Babel, ≈ 2200: a re-wilded megacity under a light ring.
   Engineered light-trees and tree ferns, phosphorescent turf, glass and recycled-metal blocks,
   capsule shelters, water purifiers, solar trees, glass towers. Heir: Aïon (Homo Deus, circuits on the cheek,
   a companion drone). Fauna: gardener robots that graze the lawns, the Murmurs of the Oubli at night,
   and the Oubli itself, the living dark of the bible. Origin = ground contact, y up negative. */
window.BRAISE_ERA_ART = window.BRAISE_ERA_ART || {};
BRAISE_ERA_ART[7] = (() => {
  const K = BRAISE_ART.K, H = HEIR_KIT;
  const { TAU, INK, lerp, mulberry, vnoise, ell, ink, fillInk, poly, smoothPath, blobPts, line, inkLine, inkCurve, shaded, dsEye, head, ears, torsoPath, mouth, lineageMark, boot, faunaFoot, faunaJoint } = K;
  const GLOW = '#6ff0e6';
  const glow = (g, fn) => { g.save(); g.globalCompositeOperation = 'lighter'; fn(); g.restore(); };

  /* ======================= AÏON ======================= */
  const AI = { skin: '#ece4ee', skinS: '#d4ccd8', suit: '#eef1f4', suitS: '#d6dce4', seam: '#2b3140' };
  const bootA = (g, x, y, side, far) => { if (side) { g.beginPath(); g.moveTo(-6, y - 10); g.lineTo(5, y - 10); g.quadraticCurveTo(12, y - 4, 11, y + 1); g.lineTo(-7, y + 1); g.closePath(); fillInk(g, far ? '#c4cad2' : '#dfe4ea', 1.5); glow(g, () => line(g, [[-5, y - 2], [10, y - 2]], 1, GLOW)); } else { boot(g, x, y, far ? '#c4cad2' : '#dfe4ea'); glow(g, () => line(g, [[x - 4, y - 3], [x + 4, y - 3]], 1, GLOW)); } };
  const LEGS = { leg: AI.suit, legFar: AI.suitS, legW: 7.5, foot: bootA, wrap: (g, hx, hy, kx, ky, fx, fy) => { line(g, [[kx - 3.5, ky], [kx + 3.5, ky]], 1, AI.seam); } };
  const ARMS = { sleeve: AI.suit, sleeveFar: AI.suitS, skin: AI.skin, armW: 6.8, cuff: (g, x, y) => { glow(g, () => line(g, [[x - 3.4, y - 3], [x + 3.4, y - 3]], 1.2, GLOW)); } };
  function suit(g, back) {
    shaded(g, () => torsoPath(g, 14, 11, -68, -34), AI.suit, { hatch: back ? [-20, -70, -6, -30] : [6, -70, 20, -30], hc: 'rgba(40,50,70,.2)' });
    shaded(g, () => { g.beginPath(); g.moveTo(-11, -36); g.lineTo(11, -36); g.lineTo(10, -30); g.lineTo(-10, -30); g.closePath(); }, AI.seam, {});
    glow(g, () => { if (back) { line(g, [[0, -64], [0, -38]], 1.2, GLOW); line(g, [[-8, -60], [8, -60]], 1, GLOW); } else { line(g, [[0, -64], [0, -38]], 1.2, GLOW); line(g, [[-9, -56], [-3, -50], [-3, -42]], 1, GLOW); line(g, [[9, -56], [3, -50], [3, -42]], 1, GLOW); } });
  }
  function halo(g, t) { glow(g, () => { g.strokeStyle = 'rgba(111,240,230,.25)'; g.lineWidth = 7; ell(g, 0, -122 + Math.sin(t * 2) * 1.5, 31, 9); g.stroke(); g.strokeStyle = GLOW; g.lineWidth = 1.6; g.stroke(); }); }
  function drone(g, t, x) { const dy = Math.sin(t * 2.4) * 3; ell(g, x, -112 + dy, 7, 7); fillInk(g, '#e4e8ee', 1.8); ell(g, x + 1.5, -112 + dy, 3, 3); g.fillStyle = '#0d1a20'; g.fill(); glow(g, () => { g.fillStyle = GLOW; ell(g, x + 1.5, -112 + dy, 1.4, 1.4); g.fill(); g.fillStyle = 'rgba(111,240,230,.18)'; ell(g, x, -112 + dy, 14, 14); g.fill(); }); line(g, [[x, -119 + dy], [x, -124 + dy]], 1.2, INK); }
  function aion(g, o) {
    o = o || {}; const t = performance.now() / 1000; if (o.view === 'side') return aionSide(g, o, t); if (o.view === 'back') return aionBack(g, o, t);
    halo(g, t);
    H.legs(g, o, false, LEGS);
    suit(g);
    H.limb(g, o, false, false, ARMS);
    g.beginPath(); g.rect(-6, -74, 12, 8); fillInk(g, AI.skin, 1.5); shaded(g, () => { g.beginPath(); g.moveTo(-10, -66); g.lineTo(-7, -75); g.lineTo(7, -75); g.lineTo(10, -66); g.closePath(); }, AI.suit, { lw: 1.6 });
    head(g, 'deus', AI.skin, 'rgba(120,100,140,.16)');
    lineageMark(g, 13, -83, 'circuit');
    glow(g, () => { line(g, [[17, -80], [19, -96], [14, -110], [5, -118]], 1, 'rgba(111,240,230,.8)'); g.fillStyle = GLOW; ell(g, 5, -118, 1.4, 1.4); g.fill(); });
    dsEye(g, -9.5, -90, { rx: 3.8, ry: 5.6, scared: o.mood === 'scared', blink: o.blink }); dsEye(g, 9.5, -90, { rx: 3.8, ry: 5.6, lens: GLOW });
    g.strokeStyle = 'rgba(60,50,70,.4)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-14, -99); g.lineTo(-5, -100); g.moveTo(5, -100); g.lineTo(14, -99); g.stroke();
    g.beginPath(); g.moveTo(.5, -84); g.quadraticCurveTo(2, -81.5, 0, -81); ink(g, 1.1);
    mouth(g, o.mood === 'scared' ? 'scared' : 'calm', -76, 3);
    drone(g, t, -32);
    H.limb(g, o, true, false, ARMS);
  }
  function aionSide(g, o, t) {
    halo(g, t);
    H.legs(g, o, true, LEGS);
    H.limb(g, o, false, true, ARMS);
    shaded(g, () => { g.beginPath(); g.moveTo(-10, -68); g.quadraticCurveTo(4, -72, 10, -66); g.quadraticCurveTo(12, -50, 11, -34); g.lineTo(-10, -34); g.quadraticCurveTo(-12, -50, -10, -68); g.closePath(); }, AI.suit, { hatch: [-12, -70, 0, -32], hc: 'rgba(40,50,70,.2)' });
    glow(g, () => line(g, [[6, -64], [6, -38]], 1.2, GLOW));
    const prof = () => { g.beginPath(); g.moveTo(-17, -92); g.bezierCurveTo(-20, -128, 14, -130, 17, -102); g.quadraticCurveTo(18, -94, 20, -88); g.lineTo(22.5, -83); g.lineTo(19.5, -81); g.quadraticCurveTo(20.5, -77, 18.5, -75); g.quadraticCurveTo(19, -71, 15, -70); g.quadraticCurveTo(6, -68.5, 0, -70); g.bezierCurveTo(-10, -73, -17, -78, -17, -92); g.closePath(); };
    shaded(g, prof, AI.skin, { lw: 2.4 });
    dsEye(g, 12, -90, { rx: 2.6, ry: 4.6, lens: GLOW });
    g.beginPath(); g.moveTo(18, -76); g.quadraticCurveTo(15.5, -75, 13, -76); ink(g, 1.2);
    lineageMark(g, 4, -84, 'circuit');
    drone(g, t, -28);
    H.limb(g, o, true, true, ARMS);
  }
  function aionBack(g, o, t) {
    halo(g, t);
    H.legs(g, o, false, LEGS);
    H.limb(g, o, false, false, ARMS); H.limb(g, o, true, false, ARMS);
    suit(g, true);
    g.beginPath(); g.rect(-6, -74, 12, 8); fillInk(g, AI.skin, 1.5);
    shaded(g, () => { g.beginPath(); g.ellipse(0, -100, 22, 28, 0, 0, TAU); }, AI.skin, { lw: 2.4 });
    glow(g, () => { line(g, [[0, -76], [0, -96], [-8, -108], [-8, -118]], 1, 'rgba(111,240,230,.8)'); line(g, [[0, -96], [8, -110]], 1, 'rgba(111,240,230,.8)'); });
    drone(g, t, 30);
  }

  /* ======================= FAUNA ======================= */
  /* gardener robot — four jointed legs, mower head, solar back (role of the grazing herd) */
  function gardener(g, p, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const fleeing = o.state === 'flee' || o.state === 'fleeing' || o.speed > 140, grazing = !moving && (o.state === 'graze' || o.state === 'grazing');
    const by = moving ? Math.cos(phase * 2) * .6 : 0;
    const legs = [{ x: -12, far: true, back: true, ph: .5 }, { x: 12, far: true, back: false, ph: .25 }, { x: -15, far: false, back: true, ph: 0 }, { x: 15, far: false, back: false, ph: .75 }];
    const leg = L => { const st = moving ? faunaFoot(phase + L.ph * TAU, fleeing ? 11 : 6, fleeing ? 10 : 5, .6) : [0, 0]; faunaJoint(g, [L.x, by - 26], [L.x + st[0], st[1] - (L.far ? 1.4 : 0)], 13, 14, L.back ? -1 : 1, L.far ? 2 : 2.6, L.far ? '#8a92a0' : '#b8c0cc', true); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(0, by);
    shaded(g, () => { g.beginPath(); g.moveTo(-20, -24); g.lineTo(-18, -36); g.quadraticCurveTo(0, -42, 18, -36); g.lineTo(20, -24); g.quadraticCurveTo(0, -18, -20, -24); g.closePath(); }, '#e6eaf0', { hatch: [-20, -42, -6, -20], hc: 'rgba(40,50,70,.25)' });
    shaded(g, () => poly(g, [[-16, -38], [-12, -46], [12, -46], [16, -38]]), '#2a3a5a', { lw: 1.4, extra: () => { g.strokeStyle = 'rgba(140,180,220,.6)'; g.lineWidth = .8; for (let x = -12; x < 14; x += 6) { g.beginPath(); g.moveTo(x, -46); g.lineTo(x + 2, -38); g.stroke(); } } });
    const hy = grazing ? -12 + Math.sin(time * 5) * 1.5 : -26;
    inkLine(g, [[16, -30], [22, hy]], 2.2, '#8a92a0', .8);
    shaded(g, () => { g.beginPath(); g.rect(18, hy - 5, 14, 9); }, '#e6eaf0', { lw: 1.4 });
    glow(g, () => { g.fillStyle = fleeing ? '#ff6a5a' : GLOW; ell(g, 28, hy - 1, 2, 2); g.fill(); g.fillStyle = 'rgba(111,240,230,.15)'; ell(g, 28, hy - 1, 6, 6); g.fill(); });
    if (grazing) for (let i = 0; i < 3; i++) line(g, [[24 + i * 3, hy + 4], [23 + i * 3, hy + 8]], 1, '#7aa04a');
    g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }
  /* a Murmur of the Oubli — living shadow, pale eyes, ragged hem (role of the night pack) */
  function murmur(g, p, angry, options, scale) {
    const o = options || {}, time = Number.isFinite(o.time) ? o.time : 0, s = scale || 1;
    const attacking = o.state === 'attack' && Number.isFinite(o.attack) && o.attack >= 0 && o.attack < 1.05, a = attacking ? o.attack : -1;
    const hostile = !!angry || attacking || o.state === 'warn' || o.state === 'stalk' || o.state === 'chase';
    const lunge = attacking && a >= .45 && a < .75 ? Math.sin((a - .45) / .3 * Math.PI) : 0;
    g.save(); g.translate(lunge * 10, -Math.sin(time * 2.2) * 3); g.scale(s, s);
    g.fillStyle = 'rgba(5,3,8,.25)'; ell(g, 0, 3, 22, 5); g.fill();
    g.globalAlpha = hostile ? .92 : .6; g.fillStyle = '#050306';
    g.beginPath(); const n = 16; for (let i = 0; i <= n; i++) { const an = Math.PI + i / n * Math.PI, r = 24 + vnoise(i * 1.3, time * 3, 7) * 14; const xx = Math.cos(an) * r, yy = Math.sin(an) * r * 1.5 - 26; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.lineTo(24, -6); g.lineTo(-24, -6); g.closePath(); g.fill();
    for (let i = 0; i < 6; i++) { const bx = -20 + i * 8; g.beginPath(); g.moveTo(bx - 3, -8); g.quadraticCurveTo(bx + Math.sin(time * 3 + i) * 8, 2, bx + Math.sin(time * 2 + i) * 6, 6 + vnoise(i, time, 9) * 6); g.lineTo(bx + 3, -8); g.fill(); }
    g.globalAlpha = 1; g.fillStyle = hostile ? '#f2e8d6' : '#bfb6a8'; ell(g, -7, -44, 5, 1.6, -.2); g.fill(); ell(g, 7, -44, 5, 1.6, .2); g.fill();
    if (hostile) { g.strokeStyle = '#f2e8d6'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-8, -32); for (let i = 0; i < 7; i++) g.lineTo(-8 + i * 2.6, -32 + (i % 2 ? 3 : 0)); g.stroke(); }
    g.restore();
  }
  const murmurPack = (g, p, angry, o) => murmur(g, p, angry, o, 1);
  /* the Oubli: the living night, a towering Murmur with many eyes (last-night predator) */
  function oubli(g, p, options) {
    const o = options || {}, time = Number.isFinite(o.time) ? o.time : 0;
    murmur(g, p, true, o, 1.5);
    g.save(); g.translate(0, -Math.sin(time * 2.2) * 3);
    for (const [x, y] of [[-14, -48], [14, -50], [0, -72], [-22, -64], [22, -66]]) { g.fillStyle = '#f2e8d6'; ell(g, x, y, 3.4, 1.2, x * .01); g.fill(); }
    glow(g, () => { g.fillStyle = 'rgba(111,240,230,.06)'; ell(g, 0, -50, 70, 60); g.fill(); });
    g.restore();
  }

  /* ======================= FLORA ======================= */
  /* light-tree: engineered trunk with glowing seed pods (role "pine", size k) */
  function lightTree(g, k, seed) {
    const r = mulberry(seed), h = (200 + r() * 40) * k;
    g.fillStyle = 'rgba(10,20,30,.25)'; ell(g, 0, -2, 40 * k, 9 * k); g.fill();
    inkCurve(g, [[0, 0], [-3 * k, -h * .4], [2 * k, -h * .7]], 9 * k, '#4a4e6a', 1.6);
    for (const [x, y] of [[-28, .66], [30, .7], [-14, .84], [16, .88]]) inkCurve(g, [[0, -h * .6], [x * .5 * k, -h * y], [x * k, -h * (y + .06)]], 3 * k, '#4a4e6a', 1);
    for (let i = 0; i < 6; i++) { smoothPath(g, blobPts((-40 + i * 16) * k, -h * (.78 + Math.sin(i) * .08), 22 * k, 16 * k, 12, .3, r)); fillInk(g, i % 2 ? '#2e5a5a' : '#285050', 1.6); }
    glow(g, () => { for (let i = 0; i < 12; i++) { const x = (r() - .5) * 100 * k, y = -h * (.7 + r() * .26); g.fillStyle = 'rgba(111,240,230,.85)'; ell(g, x, y, 2.2 * k, 3 * k); g.fill(); g.fillStyle = 'rgba(111,240,230,.15)'; ell(g, x, y, 8 * k, 8 * k); g.fill(); } });
  }
  /* tree fern of the vertical gardens (role "oak") */
  function treeFern(g, v) {
    const r = mulberry(270 + v);
    g.fillStyle = 'rgba(10,20,30,.22)'; ell(g, 0, -2, 50, 10); g.fill();
    inkCurve(g, [[0, 0], [4, -60], [0, -120]], 10, '#5a4a3a', 1.6); for (let i = 0; i < 10; i++) line(g, [[-5, -10 - i * 11], [5, -14 - i * 11]], 1.4, '#3a2e24');
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i / 8 - .5) * 3.2, L = 60 + r() * 14, ex = Math.cos(a) * L, ey = -120 + Math.sin(a) * L * .6 + 14; g.beginPath(); g.moveTo(0, -120); g.quadraticCurveTo(ex * .5, -136, ex, ey); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); for (let j = 1; j < 9; j++) { const t = j / 9, px = ex * t, py = lerp(-120, ey, t) - Math.sin(t * Math.PI) * 14; line(g, [[px, py], [px + Math.cos(a + 1.3) * 8, py + 5]], 1.6, '#3e8a5a'); line(g, [[px, py], [px + Math.cos(a - 1.3) * 8, py + 5]], 1.6, '#2e7a4a'); } }
  }
  /* dead solar tree, panels cracked (role "dead") */
  function deadSolar(g, v) { const r = mulberry(370 + v); g.fillStyle = 'rgba(10,20,30,.2)'; ell(g, 0, -2, 26, 6); g.fill(); inkLine(g, [[0, 0], [0, -110]], 5, '#6a6e7a', 1.4); for (let i = 0; i < 4; i++) { const s = i % 2 ? 1 : -1, y = -50 - i * 16; inkLine(g, [[0, y], [s * 20, y - 10]], 2, '#6a6e7a', .8); g.save(); g.translate(s * 24, y - 12); g.rotate(s * .4 + (r() - .5) * .6); shaded(g, () => { g.beginPath(); g.rect(-10, -6, 20, 12); }, '#2a3040', { lw: 1.2 }); line(g, [[-8, -4], [6, 4]], .8, '#8a92a0'); g.restore(); } }
  /* phosphorescent turf (role "tuft") */
  function glowGrass(g, picked) { const r = mulberry(530); g.fillStyle = 'rgba(10,20,30,.16)'; ell(g, 0, -1, 20, 4); g.fill(); for (let i = 0; i < (picked ? 7 : 16); i++) { const x = (r() - .5) * 24, L = picked ? 6 : 18 + r() * 14; line(g, [[x, 0], [x + (r() - .5) * 6, -L]], 1.6, i % 3 ? '#2e6a6a' : '#3a8a7a'); if (!picked && i % 3 === 0) glow(g, () => { g.fillStyle = 'rgba(111,240,230,.8)'; ell(g, x + (r() - .5) * 4, -L, 1.4, 1.4); g.fill(); }); } }
  /* pearl-berry bush (role "berry") */
  function pearlBush(g, picked, v) { const r = mulberry(670 + v); g.fillStyle = 'rgba(10,20,30,.18)'; ell(g, 0, -1, 32, 7); g.fill(); for (let i = 0; i < 6; i++) { smoothPath(g, blobPts(-26 + i * 10, -16 - (i % 2) * 8, 13, 10, 10, .4, r)); fillInk(g, i % 2 ? '#3a4a7a' : '#2e3e6a', 1.4); } if (!picked) for (let i = 0; i < 12; i++) { const x = -24 + r() * 48, y = -28 + r() * 18; ell(g, x, y, 2.6, 2.6); fillInk(g, '#e8e0f8', .6); glow(g, () => { g.fillStyle = 'rgba(200,170,255,.3)'; ell(g, x, y, 5, 5); g.fill(); }); } }
  /* block of recycled glass and metal (role "boulder") */
  function glassBlock(g, v, stage) { const r = mulberry(780 + v), w = 40 - stage * 9, h = 40 - stage * 11; g.fillStyle = 'rgba(10,20,30,.22)'; ell(g, 0, -2, w + 6, 8); g.fill(); shaded(g, () => poly(g, [[-w, 0], [-w + 6, -h], [w * .4, -h - 8], [w, -h * .5], [w, 0]]), '#7aa8b8', { light: '#c8e8f0', lb: [-w * .3, -h * .7, w * .4, h * .3], hatch: [w * .2, -h - 8, w, 0], hc: 'rgba(20,40,60,.35)', lw: 2 }); for (let i = 0; i < 4 - stage; i++) { const x = -w * .5 + r() * w, y = -h * .3 - r() * h * .5; poly(g, [[x, y], [x + 6, y - 3], [x + 4, y + 4]]); fillInk(g, '#8a92a0', .8); } glow(g, () => line(g, [[-w + 8, -h * .6], [w * .3, -h * .8]], 1, 'rgba(180,250,255,.6)')); }
  /* blue root (role "carrot") */
  function blueRoot(g) { ell(g, 0, -4, 6, 5); fillInk(g, '#4a6ad8', 1); for (const a of [-.5, 0, .5]) inkCurve(g, [[0, -8], [a * 14, -18], [a * 22, -24]], 2, '#3a8a7a', .5); glow(g, () => { g.fillStyle = 'rgba(111,170,255,.5)'; ell(g, 0, -4, 4, 3); g.fill(); }); }
  /* optical-fibre filaments (role "reeds") */
  function fibres(g, v) { const r = mulberry(1010 + v); for (let i = 0; i < 12; i++) { const x = (r() - .5) * 26, L = 40 + r() * 30, a = (r() - .5) * .5; line(g, [[x, 0], [x + Math.sin(a) * L, -L]], 1.2, '#4a5a7a'); glow(g, () => { g.fillStyle = i % 2 ? 'rgba(111,240,230,.9)' : 'rgba(200,150,255,.9)'; ell(g, x + Math.sin(a) * L, -L, 1.6, 1.6); g.fill(); }); } }
  /* glowing flowers */
  function flower(g, v) { const cols = ['#6ff0e6', '#c896ff', '#ffd27a', '#ff8ab0', '#8ab8ff']; line(g, [[0, 0], [0, -15]], 1.2, '#2e6a6a'); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ell(g, Math.cos(a) * 3, -16 + Math.sin(a) * 3, 1.6, 2.6, a + Math.PI / 2); fillInk(g, cols[v], .4); } glow(g, () => { g.fillStyle = 'rgba(255,255,255,.35)'; ell(g, 0, -16, 6, 6); g.fill(); }); }
  /* grafted sapling (role "sapling") */
  function graft(g, picked) { inkLine(g, [[0, 0], [0, picked ? -10 : -30]], 2, '#5a4a3a', .6); if (!picked) { for (const s of [-1, 1]) { ell(g, s * 7, -28, 7, 3.4, s * .4); fillInk(g, '#3a8a7a', .6); } inkLine(g, [[-3, -14], [3, -14]], 3, '#8a92a0', .6); glow(g, () => { g.fillStyle = GLOW; ell(g, 0, -14, 1.4, 1.4); g.fill(); }); } }

  /* ======================= PLACES ======================= */
  /* capsule shelter: white dome with a wide doorway (shelter, cave volume) */
  function capsule(g) {
    g.fillStyle = 'rgba(10,20,30,.25)'; ell(g, 0, -1, 160, 18); g.fill();
    shaded(g, () => { g.beginPath(); g.moveTo(-154, 0); g.bezierCurveTo(-154, -120, -80, -190, 0, -190); g.bezierCurveTo(80, -190, 154, -120, 154, 0); g.closePath(); }, '#e6eaf0', { light: '#f6f8fc', lb: [-40, -150, 70, 30], hatch: [60, -192, 156, 0], hc: 'rgba(40,50,70,.25)', lw: 2.4,
      extra: () => { g.strokeStyle = 'rgba(120,130,150,.5)'; g.lineWidth = 1; for (let i = 1; i < 5; i++) { g.beginPath(); g.ellipse(0, 0, 154 * i / 5, 190, 0, Math.PI, 0); g.stroke(); } } });
    g.beginPath(); g.moveTo(-112, 0); g.lineTo(-112, -70); g.quadraticCurveTo(-110, -110, 0, -112); g.quadraticCurveTo(110, -110, 112, -70); g.lineTo(112, 0); g.closePath(); const gr = g.createLinearGradient(0, -112, 0, 0); gr.addColorStop(0, '#0e1a24'); gr.addColorStop(1, '#2a3a4a'); g.fillStyle = gr; g.fill(); ink(g, 2);
    glow(g, () => { g.strokeStyle = GLOW; g.lineWidth = 2; g.beginPath(); g.moveTo(-112, -70); g.quadraticCurveTo(-110, -110, 0, -112); g.quadraticCurveTo(110, -110, 112, -70); g.stroke(); g.fillStyle = 'rgba(111,240,230,.12)'; ell(g, 0, -30, 100, 30); g.fill(); });
  }
  /* water purifier basin, ringed with light (role "waterhole") */
  function purifier(g) {
    smoothPath(g, blobPts(0, 0, 76, 24, 28, .01, mulberry(102))); fillInk(g, '#d6dce4', 2.2);
    ell(g, 0, 1, 66, 18); g.fillStyle = '#3a8aa8'; g.fill(); g.strokeStyle = 'rgba(20,60,80,.6)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = 'rgba(220,250,255,.5)'; ell(g, -14, -3, 26, 5); g.fill();
    glow(g, () => { g.strokeStyle = 'rgba(111,240,230,.6)'; g.lineWidth = 2; ell(g, 0, 1, 60, 15); g.stroke(); });
    for (const x of [-60, 60]) { shaded(g, () => { g.beginPath(); g.rect(x - 5, -36, 10, 32); }, '#c8d0da', { lw: 1.4 }); glow(g, () => { g.fillStyle = GLOW; ell(g, x, -32, 2.4, 2.4); g.fill(); }); }
  }
  /* the Murmurs' nest: a black rift in the ground (role "den") */
  function rift(g) { const r = mulberry(995); smoothPath(g, blobPts(0, -6, 62, 18, 18, .4, r)); g.fillStyle = '#050306'; g.fill(); ink(g, 2); for (let i = 0; i < 6; i++) { const x = -50 + i * 20; g.beginPath(); g.moveTo(x - 4, -12); g.quadraticCurveTo(x + (r() - .5) * 20, -40 - r() * 30, x + 4, -12); g.fillStyle = 'rgba(5,3,8,.7)'; g.fill(); } for (const [x, y] of [[-14, -14], [12, -10]]) { g.fillStyle = '#bfb6a8'; ell(g, x, y, 3, 1); g.fill(); ell(g, x + 7, y, 3, 1); g.fill(); } }
  /* shattered museum case: fossil bones on the floor (role "carcass", gives bones) */
  function museumBones(g) { shaded(g, () => { g.beginPath(); g.rect(-40, -10, 80, 10); }, '#c8d0da', { lw: 1.6 }); for (let i = 0; i < 6; i++) poly(g, [[-36 + i * 13, -10], [-30 + i * 13, -22 - (i % 2) * 6], [-28 + i * 13, -10]]); g.fillStyle = 'rgba(180,220,240,.45)'; g.fill(); for (let i = 0; i < 4; i++) { const x = -22 + i * 9; g.beginPath(); g.moveTo(x, -12); g.quadraticCurveTo(x + 3, -24, x + 8, -20); g.lineWidth = 3.8; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.2; g.strokeStyle = '#d8ccae'; g.stroke(); } }
  /* fusion heart: a small reactor whose core holds the flame (source of fire) */
  function fusionHeart(g, lit) {
    g.fillStyle = 'rgba(10,20,30,.26)'; ell(g, 0, -1, 40, 9); g.fill();
    shaded(g, () => poly(g, [[-28, 0], [-18, -36], [18, -36], [28, 0]]), '#2b2550', { lw: 2 });
    for (const s of [-1, 1]) { poly(g, [[s * 14, -36], [s * 24, -70], [s * 8, -56]]); fillInk(g, '#7d6ad8', 1.6); }
    ell(g, 0, -40, 16, 5); g.fillStyle = lit ? '#0a1018' : '#2a2a3a'; g.fill(); ink(g, 1.4);
    glow(g, () => { const rr = 16 + Math.sin(performance.now() / 200) * 2; const gr = g.createRadialGradient(0, -46, 0, 0, -46, rr * 2); gr.addColorStop(0, lit ? 'rgba(200,250,255,.6)' : 'rgba(80,90,120,.3)'); gr.addColorStop(1, 'rgba(80,200,255,0)'); g.fillStyle = gr; g.fillRect(-rr * 2, -46 - rr * 2, rr * 4, rr * 4); });
  }
  /* glass tower with gardens on its terraces */
  function glassTower(g, v) {
    const r = mulberry(1900 + v), w = 70 + v * 10, h = 300 + v * 60;
    g.fillStyle = 'rgba(10,20,30,.25)'; ell(g, 0, -1, w + 20, 16); g.fill();
    shaded(g, () => poly(g, [[-w, 0], [-w * .8, -h], [w * .8, -h], [w, 0]]), '#5a7a9a', { light: '#8ab0c8', lb: [-w * .4, -h * .6, w * .4, h * .3], hatch: [w * .3, -h, w, 0], hc: 'rgba(20,30,50,.35)', lw: 2.4,
      extra: () => { g.strokeStyle = 'rgba(200,230,240,.35)'; g.lineWidth = 1; for (let y = -16; y > -h; y -= 16) { g.beginPath(); g.moveTo(-w, y); g.lineTo(w, y); g.stroke(); } for (let x = -w; x < w; x += 14) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x * .8, -h); g.stroke(); } } });
    for (const y of [-h * .3, -h * .6, -h * .9]) { const ww = w * (1 - (-y / h) * .2); shaded(g, () => { g.beginPath(); g.rect(-ww - 8, y, ww * 2 + 16, 8); }, '#d6dce4', { lw: 1.4 }); for (let i = 0; i < 6; i++) { smoothPath(g, blobPts(-ww + i * ww / 3, y - 4, 10, 7, 8, .4, r)); fillInk(g, '#3e7a4a', 1); } }
    glow(g, () => { g.fillStyle = 'rgba(111,240,230,.5)'; for (let i = 0; i < 18; i++) { const y = -20 - r() * (h - 40), x = (r() - .5) * w * 1.4 * (1 + y / h * .2); g.fillRect(x, y, 6, 4); } });
    line(g, [[0, -h], [0, -h - 30]], 1.6, INK); glow(g, () => { g.fillStyle = '#ff6a5a'; ell(g, 0, -h - 30, 2.4, 2.4); g.fill(); });
  }
  /* solar tree, petals of panels (also a night light) */
  function solarTree(g) { g.fillStyle = 'rgba(10,20,30,.2)'; ell(g, 0, -1, 30, 7); g.fill(); inkLine(g, [[0, 0], [0, -130]], 5, '#c8d0da', 1.4); for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i / 6 - .5) * 2.6, L = 44; inkLine(g, [[0, -120], [Math.cos(a) * L * .7, -120 + Math.sin(a) * L * .5]], 1.6, '#c8d0da', .6); g.save(); g.translate(Math.cos(a) * L, -120 + Math.sin(a) * L * .6); g.rotate(a + Math.PI / 2); shaded(g, () => { g.beginPath(); g.ellipse(0, 0, 13, 7, 0, 0, TAU); }, '#2a3a6a', { lw: 1.2, extra: () => { g.strokeStyle = 'rgba(140,180,240,.6)'; g.lineWidth = .7; g.beginPath(); g.moveTo(-10, 0); g.lineTo(10, 0); g.stroke(); } }); g.restore(); } glow(g, () => { g.fillStyle = GLOW; ell(g, 0, -120, 4, 4); g.fill(); }); }

  /* ======================= GROUND ======================= */
  function ground(g, o) {
    const { x0, y0, CH, land, rng } = o;
    // smart paving on the "rock" biome: hexagonal tiles with glowing seams
    for (let j = 0; j < CH; j += 18) for (let i = (j / 18 % 2) * 15; i < CH; i += 30) { if (land(i, j) !== 3) continue; g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; g.lineTo(i + Math.cos(a) * 14, j + Math.sin(a) * 9); } g.closePath(); g.fillStyle = rng() < .5 ? '#3a4058' : '#343a50'; g.fill(); g.strokeStyle = 'rgba(111,240,230,.25)'; g.lineWidth = 1; g.stroke(); }
    g.lineCap = 'round';
    for (let k = 0; k < 480; k++) {
      const px = rng() * CH, py = rng() * CH, b = land(px, py); if (!b || b === 3) continue;
      if (b === 1) { g.strokeStyle = rng() < .5 ? 'rgba(60,120,110,.5)' : 'rgba(40,90,90,.5)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (rng() - .5) * 2, py - 4 - rng() * 3); g.stroke(); if (rng() < .05) { g.fillStyle = 'rgba(111,240,230,.7)'; ell(g, px, py - 5, 1.2, 1.2); g.fill(); } }
      else if (b === 2) { g.fillStyle = rng() < .5 ? 'rgba(60,70,110,.45)' : 'rgba(30,60,60,.4)'; ell(g, px, py, 2.4, 1.4, rng() * 3); g.fill(); }
      else if (b === 4) { if (rng() < .06) { ell(g, px, py, 12 + rng() * 16, 3 + rng() * 5); g.fillStyle = 'rgba(60,120,160,.5)'; g.fill(); g.strokeStyle = 'rgba(111,240,230,.4)'; g.lineWidth = 1; g.stroke(); } else { g.strokeStyle = 'rgba(70,100,140,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (rng() - .5) * 3, py - 6 - rng() * 4); g.stroke(); } }
    }
  }
  const BCOL = [[52, 84, 84], [44, 56, 78], [62, 66, 88], [44, 70, 92]];

  return {
    ground, bcol: BCOL,
    heir: aion, mobs: { antelope: gardener, hyena: murmurPack, machairodont: oubli },
    flora: { pine: lightTree, oak: treeFern, dead: deadSolar, tuft: glowGrass, berry: pearlBush, boulder: glassBlock, carrot: blueRoot, reeds: fibres, flower, sapling: graft },
    places: { cave: capsule, waterhole: purifier, den: rift, carcass: museumBones, source: fusionHeart, glassTower, solarTree }
  };
})();
