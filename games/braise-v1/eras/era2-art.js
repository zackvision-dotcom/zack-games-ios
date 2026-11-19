/* BRAISE — Era II · Le Grand Froid. The Vézère valley ≈ 17 000 years ago (Lascaux).
   Mammoth steppe: rust and khaki tussocks, snow patches, Scots pines and dwarf birches,
   pale limestone cliffs with rock shelters, a half-frozen river.
   Heir: Néa (Homo sapiens). Fauna: reindeer, wolves, the cave lion.
   Drawn from scratch in the ink style of art.js. Origin = ground contact, y up negative. */
window.BRAISE_ERA_ART = window.BRAISE_ERA_ART || {};
BRAISE_ERA_ART[1] = (() => {
  const K = BRAISE_ART.K, H = HEIR_KIT;
  const { TAU, INK, lerp, mulberry, vnoise, ell, ink, fillInk, poly, smoothPath, blobPts, line, curve, inkLine, inkCurve, hatch, shaded, dsEye, lineageMark, head, ears, hand, torsoPath, hairTicks, brows, mouth, blush, eyes, faunaFoot, faunaJoint } = K;

  /* ======================= NÉA ======================= */
  const N = { skin: '#d6ab85', skinS: '#b98b68', fur: '#7b5b3d', furD: '#5a4128', furF: '#654a31', trim: '#e9e1d2', hair: '#1d1510', leg: '#5d4430', legF: '#4a3626', boot: '#8a6a48', bootT: '#e1d6c0', ochre: '#b5452b', ivory: '#efe6cf' };
  const furBoot = (g, x, y, side, far) => {
    g.beginPath(); if (side) { g.moveTo(-6, y - 10); g.lineTo(5, y - 10); g.quadraticCurveTo(12, y - 3, 11, y + 1); g.lineTo(-7, y + 1); g.quadraticCurveTo(-8, y - 5, -6, y - 10); }
    else { g.moveTo(x - 6, y - 10); g.lineTo(x + 6, y - 10); g.quadraticCurveTo(x + 9, y - 3, x + 8, y + 1); g.lineTo(x - 8, y + 1); g.quadraticCurveTo(x - 9, y - 4, x - 6, y - 10); }
    g.closePath(); fillInk(g, far ? '#735638' : N.boot, 1.6);
    smoothPath(g, blobPts(side ? 0 : x, y - 10, 7.5, 2.6, 9, .45, mulberry(7))); fillInk(g, N.bootT, 1.2);
    line(g, [[side ? -4 : x - 4, y - 5], [side ? 6 : x + 4, y - 4]], .9, 'rgba(40,24,12,.6)');
  };
  const LEGS = { leg: N.leg, legFar: N.legF, legW: 8.5, foot: furBoot,
    wrap: (g, hx, hy, kx, ky, fx, fy) => { for (let t = .25; t < .9; t += .22) { const x = lerp(kx, fx, t), y = lerp(ky, fy - 4, t); line(g, [[x - 4.5, y - 1], [x + 4.5, y + 1]], 1, 'rgba(225,214,192,.75)'); } } };
  const ARMS = { sleeve: N.fur, sleeveFar: N.furF, skin: N.skin, armW: 9,
    cuff: (g, x, y) => { smoothPath(g, blobPts(x, y, 5.6, 4.2, 9, .45, mulberry(9))); fillInk(g, N.trim, 1.2); } };
  const parkaFront = () => { const p = []; return g => torsoPath(g, 16, 19, -68, -24, 2); };
  function hem(g, y, w) { smoothPath(g, blobPts(0, y, w, 4.4, 18, .5, mulberry(22))); fillInk(g, N.trim, 1.6); }
  function pendant(g) { g.beginPath(); g.moveTo(-6, -64); g.lineTo(0, -56); g.lineTo(6, -64); ink(g, 1); ell(g, 0, -54, 4.2, 3); fillInk(g, N.ivory, 1.1); line(g, [[3.4, -53], [4.8, -49.5]], 1.4, N.ivory); }
  function hoodFront(g) { smoothPath(g, blobPts(0, -92, 32, 29, 18, .14, mulberry(21))); fillInk(g, N.trim, 2); ell(g, 0, -92, 25, 23.5); fillInk(g, '#3a2a1c', 1.6); }
  function braidsFront(g) { for (const s of [-1, 1]) { for (let i = 0; i < 6; i++) { ell(g, s * (19 + (i % 2 ? 1 : -1)), -80 + i * 5.2, 4.2 - i * .2, 3.4); fillInk(g, N.hair, 1.3); } g.beginPath(); g.rect(s * 19 - 2.5, -49, 5, 3.4); fillInk(g, N.ivory, 1); } }
  function hairCap(g) { g.beginPath(); g.moveTo(-23, -88); g.bezierCurveTo(-26, -120, 26, -120, 23, -88); g.quadraticCurveTo(18, -100, 1, -105); g.lineTo(-1, -105); g.quadraticCurveTo(-18, -100, -23, -88); g.closePath(); fillInk(g, N.hair, 2.2);
    g.strokeStyle = 'rgba(120,100,90,.45)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(-4, -112); g.quadraticCurveTo(-14, -106, -19, -94); g.moveTo(4, -112); g.quadraticCurveTo(14, -106, 19, -94); g.stroke(); }
  function nea(g, o) {
    o = o || {}; if (o.view === 'side') return neaSide(g, o); if (o.view === 'back') return neaBack(g, o);
    if (o.weapon !== false) { inkLine(g, [[24, -4], [28, -142]], 2.8, '#6e4a2c', 1.7); poly(g, [[26.4, -141], [28.6, -158], [30.6, -140]]); fillInk(g, '#4a5460', 1.3); }
    H.legs(g, o, false, LEGS);
    hoodFront(g);
    shaded(g, () => torsoPath(g, 16, 19, -68, -26, 2), N.fur, { hatch: [4, -70, 26, -22], hc: 'rgba(30,15,5,.42)' });
    line(g, [[0, -66], [0, -28]], 1.3, INK); for (let y = -62; y < -32; y += 6) line(g, [[-2, y], [2, y + 3]], 1, '#c9a46e');
    hem(g, -26, 22);
    inkLine(g, [[-16, -45], [16, -45]], 2.4, '#4a3424', 1);
    H.limb(g, o, false, false, ARMS);
    smoothPath(g, blobPts(0, -68, 18, 5.4, 14, .45, mulberry(25))); fillInk(g, N.trim, 1.6);
    pendant(g);
    head(g, 'sapiens', N.skin, 'rgba(150,90,60,.18)');
    braidsFront(g); hairCap(g);
    eyes(g, o.mood, { blink: o.blink }); brows(g, o.mood, -98); blush(g, 'rgba(215,100,90,.35)'); mouth(g, o.mood);
    g.beginPath(); g.moveTo(.5, -84); g.quadraticCurveTo(2.2, -81.5, 0, -81); ink(g, 1.2);
    lineageMark(g, 14, -83, 'ochre');
    H.limb(g, o, true, false, ARMS);
  }
  function neaSide(g, o) {
    H.legs(g, o, true, LEGS);
    H.limb(g, o, false, true, ARMS);
    // hood hangs on the back
    smoothPath(g, blobPts(-14, -78, 13, 16, 12, .25, mulberry(31))); fillInk(g, N.trim, 1.8); ell(g, -12, -78, 8, 11); fillInk(g, '#3a2a1c', 1.2);
    shaded(g, () => { g.beginPath(); g.moveTo(-11, -68); g.quadraticCurveTo(4, -73, 12, -66); g.quadraticCurveTo(15, -48, 14, -26); g.lineTo(-13, -26); g.quadraticCurveTo(-15, -48, -11, -68); g.closePath(); }, N.fur, { hatch: [-16, -70, 0, -24], hc: 'rgba(30,15,5,.42)' });
    smoothPath(g, blobPts(0, -26, 15, 4, 14, .5, mulberry(32))); fillInk(g, N.trim, 1.5);
    inkLine(g, [[-12, -45], [13, -45]], 2.4, '#4a3424', 1);
    if (o.weapon !== false) { inkLine(g, [[-30, -42], [54, -52]], 2.8, '#6e4a2c', 1.7); poly(g, [[53, -55], [68, -53.5], [53.4, -49.6]]); fillInk(g, '#4a5460', 1.3); }
    smoothPath(g, blobPts(1, -68, 12, 4.6, 12, .45, mulberry(33))); fillInk(g, N.trim, 1.4);
    // braid down the back
    for (let i = 0; i < 6; i++) { ell(g, -15 - (i % 2), -80 + i * 5, 3.8 - i * .2, 3.2); fillInk(g, N.hair, 1.2); } g.beginPath(); g.rect(-18.5, -50, 5, 3.2); fillInk(g, N.ivory, 1);
    // sapiens profile: high forehead, small nose, a chin
    const prof = () => { g.beginPath(); g.moveTo(-19, -92); g.bezierCurveTo(-21, -116, 12, -120, 18, -100); g.quadraticCurveTo(19, -94, 21, -88); g.lineTo(24.5, -82); g.lineTo(20.5, -80); g.quadraticCurveTo(22, -76, 20, -74); g.quadraticCurveTo(21.5, -70.5, 17, -68.5); g.quadraticCurveTo(8, -66.5, 0, -69); g.bezierCurveTo(-12, -72, -19, -78, -19, -92); g.closePath(); };
    shaded(g, prof, N.skin, { lw: 2.4, extra: () => { g.fillStyle = 'rgba(150,90,60,.18)'; ell(g, 10, -78, 10, 8); g.fill(); } });
    dsEye(g, 13, -89, { blink: o.blink, rx: 2.6, ry: 4.2 });
    g.beginPath(); g.moveTo(8, -97); g.quadraticCurveTo(13, -99.5, 18, -97); ink(g, 2.2);
    g.beginPath(); g.moveTo(19.5, -73.5); g.quadraticCurveTo(16.5, -72.5, 14, -73.5); ink(g, 1.3);
    g.fillStyle = 'rgba(215,100,90,.32)'; ell(g, 9, -79, 4, 2.3); g.fill();
    ell(g, -4, -86, 3.6, 5.2); fillInk(g, N.skin, 1.5);
    lineageMark(g, 6, -82, 'ochre');
    g.beginPath(); g.moveTo(-21, -90); g.bezierCurveTo(-23, -118, 10, -122, 17, -103); g.quadraticCurveTo(6, -106, 0, -100); g.quadraticCurveTo(-8, -97, -12, -88); g.closePath(); fillInk(g, N.hair, 2.1);
    H.limb(g, o, true, true, ARMS);
  }
  function neaBack(g, o) {
    if (o.weapon !== false) { inkLine(g, [[-24, -4], [-28, -142]], 2.8, '#6e4a2c', 1.7); poly(g, [[-26.4, -141], [-28.6, -158], [-30.6, -140]]); fillInk(g, '#4a5460', 1.3); }
    H.legs(g, o, false, LEGS);
    H.limb(g, o, false, false, ARMS); H.limb(g, o, true, false, ARMS);
    shaded(g, () => torsoPath(g, 16, 19, -68, -26, 2), N.fur, { hatch: [-24, -70, -4, -22], hc: 'rgba(30,15,5,.42)' });
    hem(g, -26, 22); inkLine(g, [[-16, -45], [16, -45]], 2.4, '#4a3424', 1);
    for (let y = -64; y < -30; y += 8) line(g, [[-14, y], [14, y + 1]], 1, 'rgba(30,15,5,.35)');
    ears(g, N.skin, -90);
    ell(g, 0, -95, 25, 24); fillInk(g, N.hair, 2.2);
    g.strokeStyle = 'rgba(120,100,90,.45)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(0, -118); g.lineTo(0, -76); for (let i = 1; i < 4; i++) { g.moveTo(-i * 5, -116); g.quadraticCurveTo(-i * 7, -98, -i * 6, -78); g.moveTo(i * 5, -116); g.quadraticCurveTo(i * 7, -98, i * 6, -78); } g.stroke();
    // hood thrown back over the shoulders, braids over it
    smoothPath(g, blobPts(0, -70, 24, 12, 16, .3, mulberry(34))); fillInk(g, N.trim, 1.8); ell(g, 0, -70, 17, 7); fillInk(g, N.furD, 1.3);
    for (const s of [-1, 1]) { for (let i = 0; i < 6; i++) { ell(g, s * (8 + (i % 2)), -76 + i * 5, 3.8 - i * .2, 3.2); fillInk(g, N.hair, 1.2); } g.beginPath(); g.rect(s * 8 - 2.5, -46, 5, 3.2); fillInk(g, N.ivory, 1); }
  }

  /* ======================= FAUNA ======================= */
  /* reindeer — grey-brown, pale neck mane and rump, great antlers (role of the antelope) */
  function reindeer(g, p, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const fleeing = o.state === 'flee' || o.state === 'fleeing' || o.speed > 140, grazing = !moving && (o.state === 'graze' || o.state === 'grazing');
    const C = '#8a7a66', CD = '#5e4f40', CL = '#e4dccb', far = '#6f6252';
    const graze = grazing ? .96 + Math.sin(time * 1.9) * .018 : 0;
    const lift = moving ? (fleeing ? -3 * Math.max(0, Math.sin(phase * 2)) : Math.cos(phase * 2) * .6) : Math.sin(time * 2) * .25;
    const by = lift + graze * 1.4;
    const legs = [{ x: -15, far: true, back: true, ph: fleeing ? .12 : .5 }, { x: 16, far: true, back: false, ph: fleeing ? .62 : .25 }, { x: -21, far: false, back: true, ph: 0 }, { x: 22, far: false, back: false, ph: fleeing ? .5 : .75 }];
    const leg = L => { const st = moving ? faunaFoot(phase + L.ph * TAU, fleeing ? 12 : 7, fleeing ? 14 : 6.5, fleeing ? .44 : .64) : [0, 0]; faunaJoint(g, [L.x, by - 34], [L.x + st[0], st[1] - (L.far ? 1.6 : 0)], 19, 20, L.back ? -1 : 1, L.far ? 2.6 : 3.2, L.far ? far : CD, true); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(0, by);
    // short tail and pale rump
    ell(g, -27, -42, 4, 3); fillInk(g, CL, 1);
    shaded(g, () => { g.beginPath(); g.moveTo(-27, -44); g.bezierCurveTo(-28, -56, 18, -58, 26, -48); g.quadraticCurveTo(30, -34, 22, -28); g.quadraticCurveTo(0, -24, -22, -28); g.quadraticCurveTo(-30, -34, -27, -44); g.closePath(); }, C,
      { extra: () => { g.fillStyle = CL; ell(g, -22, -38, 7, 9); g.fill(); g.fillStyle = CD; ell(g, 0, -27, 24, 4); g.fill(); }, hatch: [-26, -56, -6, -28], hc: 'rgba(40,30,20,.25)', sp: 3.4 });
    g.save(); g.translate(18, -46); g.rotate(graze * 1.15 + (moving ? Math.sin(phase + .4) * .04 : Math.sin(time * 1.3) * .02)); g.translate(-18, 46);
    // neck with the pale hanging mane
    shaded(g, () => { g.beginPath(); g.moveTo(12, -52); g.quadraticCurveTo(22, -66, 30, -70); g.lineTo(37, -64); g.quadraticCurveTo(30, -50, 26, -36); g.quadraticCurveTo(18, -40, 12, -52); g.closePath(); }, C, {});
    for (let i = 0; i < 6; i++) { g.beginPath(); const x = 22 + i * 1.6, y = -52 + i * 2.6; g.moveTo(x, y); g.lineTo(x - 1 + Math.sin(time * 3 + i) * .6, y + 8); g.strokeStyle = CL; g.lineWidth = 2.2; g.stroke(); }
    // head, muzzle
    shaded(g, () => { g.beginPath(); g.moveTo(28, -74); g.quadraticCurveTo(36, -78, 44, -70); g.lineTo(46, -64); g.quadraticCurveTo(40, -61, 32, -63); g.quadraticCurveTo(27, -66, 28, -74); g.closePath(); }, C, { extra: () => { g.fillStyle = CL; ell(g, 43, -64, 3.5, 2.4); g.fill(); } });
    g.fillStyle = INK; ell(g, 45, -66.4, 1.4, 1); g.fill();
    dsEye(g, 35, -71, { rx: 1.5, ry: 2, socket: false, blink: ((time + .4) % 5.1) > 4.95 });
    g.save(); g.translate(30, -75); g.rotate(-.6 + Math.sin(time * 4.1) * .12); ell(g, -3, -1, 4.6, 2); fillInk(g, C, 1); g.restore();
    // antlers: two beams sweeping back then forward, brow tine over the face
    const tine = (pts, w) => inkCurve(g, pts, w, '#d8ccb2', 1);
    tine([[31, -76], [24, -92], [20, -108], [28, -122]], 2.2); tine([[22, -100], [12, -106]], 1.6); tine([[21, -112], [14, -122]], 1.5); tine([[27, -120], [34, -128]], 1.4);
    tine([[33, -76], [30, -90], [34, -106], [42, -116]], 2); tine([[31, -96], [40, -98]], 1.4); tine([[30, -80], [40, -82], [44, -76]], 1.6);
    g.restore(); g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }
  /* wolf — grey, long legs, bushy tail (role of the hyena) */
  function wolf(g, p, angry, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const attacking = o.state === 'attack' && Number.isFinite(o.attack) && o.attack >= 0 && o.attack < 1.05, a = attacking ? o.attack : -1;
    const threat = !!angry || attacking || o.state === 'warn';
    const wind = attacking && a < .45 ? Math.sin(Math.min(1, a / .32) * Math.PI / 2) : 0, lunge = attacking && a >= .45 && a < .75 ? Math.sin((a - .45) / .3 * Math.PI) : 0;
    const run = o.speed > 115 || o.state === 'chase' || o.state === 'flee', loco = moving && !attacking;
    const C = '#8c8a86', CD = '#4f4c49', CL = '#ddd8cc', far = '#6c6a66';
    const crouch = wind * 5 + (threat && !attacking ? 2.5 : 0), push = lunge * 10;
    const legs = [{ x: -14, far: true, back: true, ph: run ? .1 : .5 }, { x: 14, far: true, back: false, ph: run ? .6 : .25 }, { x: -18, far: false, back: true, ph: 0 }, { x: 18, far: false, back: false, ph: run ? .5 : .75 }];
    const by = (loco ? (run ? -2.4 * Math.max(0, Math.sin(phase * 2)) : Math.cos(phase * 2) * .5) : 0) + crouch;
    const leg = L => { const st = loco ? faunaFoot(phase + L.ph * TAU, run ? 12 : 7, run ? 12 : 6, run ? .42 : .62) : [0, 0]; faunaJoint(g, [L.x + push * .5, by - 30], [L.x + st[0] + (L.back ? 0 : push), st[1] - (L.far ? 1.5 : 0)], 16, 17, L.back ? -1 : 1, L.far ? 2.4 : 3, L.far ? far : CD, false); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(push * .6, by);
    // bushy tail, low when threatening
    g.save(); g.translate(-22, -36); g.rotate(threat ? .55 : .25 + Math.sin(time * 2.4) * .08);
    smoothPath(g, [[0, 0], [-10, 2], [-20, 8], [-24, 16], [-18, 18], [-8, 10]]); fillInk(g, C, 1.4); g.fillStyle = CD; ell(g, -21, 15, 3.4, 3); g.fill(); g.restore();
    shaded(g, () => { g.beginPath(); g.moveTo(-24, -38); g.bezierCurveTo(-22, -48, 14, -50, 22, -42); g.quadraticCurveTo(26, -32, 18, -26); g.quadraticCurveTo(0, -24, -20, -28); g.quadraticCurveTo(-26, -32, -24, -38); g.closePath(); }, C,
      { extra: () => { g.fillStyle = CL; ell(g, 2, -27, 18, 3.6); g.fill(); g.fillStyle = 'rgba(60,56,52,.5)'; ell(g, -2, -45, 16, 4); g.fill(); }, hatch: [-24, -50, -4, -26], hc: 'rgba(30,28,26,.25)' });
    // ruff and head
    const hx = 22 + lunge * 6, hy = threat ? -38 : -46;
    smoothPath(g, blobPts(17, -40, 10, 10, 11, .4, mulberry(41))); fillInk(g, C, 1.6);
    shaded(g, () => { g.beginPath(); g.moveTo(hx - 6, hy - 6); g.quadraticCurveTo(hx + 4, hy - 10, hx + 10, hy - 4); g.lineTo(hx + 20, hy); g.quadraticCurveTo(hx + 20, hy + 4, hx + 14, hy + 5); g.quadraticCurveTo(hx + 2, hy + 8, hx - 6, hy + 4); g.closePath(); }, C, { extra: () => { g.fillStyle = CL; ell(g, hx + 12, hy + 3.5, 6, 2); g.fill(); } });
    for (const dx of [-2, 3]) { poly(g, [[hx + dx - 3, hy - 6], [hx + dx - 1, hy - 15], [hx + dx + 3, hy - 6]]); fillInk(g, dx < 0 ? far : C, 1.1); }
    g.fillStyle = INK; ell(g, hx + 19.5, hy + .5, 1.6, 1.3); g.fill();
    dsEye(g, hx + 6, hy - 2.5, { rx: 1.5, ry: 1.9, socket: false, angry: threat, blink: !threat && ((time + 1.3) % 4.4) > 4.28 });
    if (threat) { g.beginPath(); g.moveTo(hx + 8, hy + 4); g.lineTo(hx + 18, hy + 3.5); ink(g, 1.1); g.fillStyle = '#f2ead8'; for (let i = 0; i < 3; i++) { poly(g, [[hx + 10 + i * 3, hy + 3.6], [hx + 11 + i * 3, hy + 6], [hx + 12 + i * 3, hy + 3.6]]); g.fill(); } }
    g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }
  /* cave lion — pale tawny, no mane, faint stripes, heavy (role of the last-night predator) */
  function caveLion(g, p, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const attacking = o.state === 'attack' && Number.isFinite(o.attack) && o.attack >= 0 && o.attack < 1.05, a = attacking ? o.attack : -1;
    const wind = attacking && a < .45 ? Math.sin(Math.min(1, a / .32) * Math.PI / 2) : 0, lunge = attacking && a >= .45 && a < .75 ? Math.sin((a - .45) / .3 * Math.PI) : 0;
    const stalk = o.state === 'stalk' || o.state === 'approach', run = o.speed > 120;
    const C = '#c9a978', CD = '#8a6a44', CL = '#efe2c4', far = '#a48a62';
    const crouch = wind * 7 + (stalk ? 5 : 0), push = lunge * 14, by = (moving ? Math.cos(phase * 2) * .6 : Math.sin(time * 1.6) * .3) + crouch;
    const legs = [{ x: -18, far: true, back: true, ph: run ? .1 : .5 }, { x: 18, far: true, back: false, ph: run ? .6 : .25 }, { x: -22, far: false, back: true, ph: 0 }, { x: 22, far: false, back: false, ph: run ? .5 : .75 }];
    const leg = L => { const st = moving && !attacking ? faunaFoot(phase + L.ph * TAU, run ? 13 : 7.5, run ? 12 : 5.5, run ? .42 : .64) : [0, 0]; faunaJoint(g, [L.x + push * .4, by - 32], [L.x + st[0] + (L.back ? 0 : push), st[1] - (L.far ? 1.5 : 0)], 17, 17, L.back ? -1 : 1, L.far ? 3.4 : 4.2, L.far ? far : C, false); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(push * .5, by);
    g.save(); g.translate(-30, -40); g.rotate(.4 + Math.sin(time * 1.7) * .15); inkCurve(g, [[0, 0], [-12, 6], [-20, 18], [-16, 26]], 2.6, C, 1.2); ell(g, -16, 27, 3.2, 4); fillInk(g, CD, 1); g.restore();
    shaded(g, () => { g.beginPath(); g.moveTo(-31, -40); g.bezierCurveTo(-30, -56, 22, -58, 30, -46); g.quadraticCurveTo(34, -32, 24, -26); g.quadraticCurveTo(0, -22, -24, -26); g.quadraticCurveTo(-33, -30, -31, -40); g.closePath(); }, C,
      { extra: () => { g.fillStyle = CL; ell(g, 0, -26, 24, 4); g.fill(); g.strokeStyle = 'rgba(120,90,55,.35)'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-20 + i * 7, -54); g.quadraticCurveTo(-22 + i * 7, -46, -19 + i * 7, -40); g.stroke(); } }, hatch: [-30, -56, -10, -26], hc: 'rgba(70,50,30,.25)' });
    const hx = 30 + lunge * 6, hy = stalk ? -42 : -52;
    shaded(g, () => { smoothPath(g, blobPts(16, -46, 12, 12, 12, .3, mulberry(53))); }, C, {});
    for (const dx of [-8, -3]) { poly(g, [[hx + dx - 3, hy - 7], [hx + dx - 1, hy - 12.5], [hx + dx + 3, hy - 8]]); fillInk(g, dx < -5 ? far : C, 1.1); }
    shaded(g, () => { g.beginPath(); g.moveTo(hx - 10, hy - 4); g.quadraticCurveTo(hx - 6, hy - 11, hx + 4, hy - 9); g.quadraticCurveTo(hx + 12, hy - 7, hx + 17, hy - 2); g.quadraticCurveTo(hx + 20, hy + 2, hx + 17, hy + 5); g.quadraticCurveTo(hx + 8, hy + 10, hx - 2, hy + 9); g.quadraticCurveTo(hx - 11, hy + 6, hx - 10, hy - 4); g.closePath(); }, C, { extra: () => { g.fillStyle = CL; ell(g, hx + 11, hy + 5, 7, 3.4); g.fill(); g.fillStyle = 'rgba(120,90,55,.35)'; ell(g, hx - 2, hy - 5, 6, 2); g.fill(); } });
    g.fillStyle = '#5a3a2a'; ell(g, hx + 17, hy - .6, 2.2, 1.6); g.fill(); line(g, [[hx + 17, hy + 1], [hx + 15, hy + 4]], .9, '#5a3a2a');
    dsEye(g, hx + 5, hy - 3.5, { rx: 1.6, ry: 1.9, socket: false, angry: stalk || attacking });
    if (attacking || stalk) { g.beginPath(); g.moveTo(hx + 4, hy + 8); g.quadraticCurveTo(hx + 10, hy + 10, hx + 16, hy + 5); ink(g, 1.3); g.fillStyle = '#f2ead8'; poly(g, [[hx + 5, hy + 8], [hx + 6, hy + 12.5], [hx + 7.5, hy + 8.4]]); g.fill(); poly(g, [[hx + 10, hy + 7.8], [hx + 11, hy + 12], [hx + 12.2, hy + 7.4]]); g.fill(); }
    g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }

  /* ======================= FLORA ======================= */
  const SNOW = '#f2f4f2', SNOWS = '#c9d3d8';
  /* Scots pine: orange upper trunk, flat dark clumps, snow on the tiers (role "pine", size k) */
  function scotsPine(g, k, seed) {
    const r = mulberry(seed), h = (190 + r() * 30) * k, lean = (r() - .5) * 14 * k;
    g.fillStyle = 'rgba(40,40,50,.18)'; ell(g, 0, -2, 34 * k, 8 * k); g.fill();
    inkCurve(g, [[0, 0], [lean * .4, -h * .45], [lean, -h * .82]], 7 * k, '#7a4e32', 1.6);
    line(g, [[lean * .3, -h * .5], [lean * .9, -h * .8]], 3 * k, '#c4703e');
    const clumps = [[-.05, .92, 34, 16], [.18, .8, 30, 13], [-.22, .74, 28, 12], [.06, .62, 26, 11], [-.16, .55, 20, 9]];
    for (const [dx, t, w, hh] of clumps) {
      const cx = lean * t + dx * 120 * k, cy = -h * t; inkLine(g, [[lean * t * .9, cy + 6 * k], [cx, cy]], 2.6 * k, '#6a4430', 1.2);
      smoothPath(g, blobPts(cx, cy, w * k, hh * k, 13, .28, r)); fillInk(g, '#2f4334', 1.8);
      g.save(); smoothPath(g, blobPts(cx, cy, w * k, hh * k, 13, .28, mulberry(seed + t * 99))); g.clip(); g.fillStyle = '#41594a'; ell(g, cx - 6 * k, cy - 3 * k, w * .7 * k, hh * .5 * k); g.fill(); g.restore();
      smoothPath(g, blobPts(cx, cy - hh * .55 * k, w * .86 * k, hh * .42 * k, 11, .4, r)); fillInk(g, SNOW, 1.3);
      g.fillStyle = SNOWS; ell(g, cx + w * .25 * k, cy - hh * .45 * k, w * .3 * k, 2 * k); g.fill();
    }
  }
  /* downy birch clump: white bark with black marks, a few gold leaves (role "oak") */
  function birch(g, v) {
    const r = mulberry(200 + v);
    g.fillStyle = 'rgba(40,40,50,.16)'; ell(g, 0, -2, 46, 10); g.fill();
    const trunks = [[-14, -150, -.08], [6, -176, .05], [20, -130, .16]].slice(0, 2 + (v % 2));
    for (const [x, h, a] of trunks) {
      const tx = x + Math.sin(a) * -h, pts = [[x, 0], [x + (tx - x) * .5 + 3, h * .5], [tx, h]];
      inkCurve(g, pts, 7, '#efeae0', 1.6);
      for (let i = 0; i < 7; i++) { const t = .1 + i * .12, px = lerp(x, tx, t), py = h * t; line(g, [[px - 3, py], [px + 2, py - 1]], 1.6, '#2a2420'); }
      for (let i = 0; i < 4; i++) { const t = .55 + i * .1, px = lerp(x, tx, t), py = h * t, s = i % 2 ? 1 : -1; inkCurve(g, [[px, py], [px + s * 16, py - 18], [px + s * 24, py - 22]], 1.6, '#8a7a6a', .8); }
    }
    for (let i = 0; i < 26; i++) { const x = -40 + r() * 80, y = -110 - r() * 80; ell(g, x, y, 3.4, 2.4, r() * 3); fillInk(g, ['#d8a23a', '#c9832c', '#e8c25a'][i % 3], .7); }
    for (let i = 0; i < 6; i++) { g.fillStyle = SNOW; ell(g, -30 + r() * 60, -60 - r() * 70, 5, 1.6); g.fill(); }
  }
  /* wind-snapped larch, silver-grey (role "dead") */
  function snag(g, v) {
    const r = mulberry(300 + v), h = 120 + r() * 40;
    g.fillStyle = 'rgba(40,40,50,.16)'; ell(g, 0, -2, 26, 6); g.fill();
    inkCurve(g, [[0, 0], [-2, -h * .5], [3, -h]], 6, '#9a948a', 1.6);
    poly(g, [[0, -h - 2], [6, -h - 14], [2, -h + 4]]); fillInk(g, '#b8b2a6', 1.2);
    for (let i = 0; i < 6; i++) { const y = -30 - i * h / 7, s = i % 2 ? 1 : -1; inkLine(g, [[0, y], [s * (14 + r() * 10), y - 6 - r() * 6]], 1.3, '#8a847a', .8); }
    for (let i = 0; i < 4; i++) { g.fillStyle = SNOW; ell(g, (r() - .5) * 20, -30 - i * 26, 6, 1.6); g.fill(); }
  }
  /* steppe tussock: rust, khaki and straw blades (role "tuft") */
  function tussock(g, picked) {
    const r = mulberry(500), n = picked ? 9 : 26;
    g.fillStyle = 'rgba(40,30,20,.18)'; ell(g, 0, -1, 22, 5); g.fill();
    smoothPath(g, blobPts(0, -4, 17, 6, 10, .3, mulberry(51))); fillInk(g, '#7a5a34', 1.4);
    for (let i = 0; i < n; i++) { const a = (i / n - .5) * 2.4 + (r() - .5) * .25, L = picked ? 8 + r() * 5 : 26 + r() * 22, x = (r() - .5) * 18;
      g.beginPath(); g.moveTo(x, -4); g.quadraticCurveTo(x + Math.sin(a) * L * .4, -4 - L * .6, x + Math.sin(a) * L * .9, -4 - Math.cos(a) * L); g.strokeStyle = ['#b07a3a', '#c8a45c', '#8a7a46', '#d9c08a', '#9a5a2a'][i % 5]; g.lineWidth = 1.7; g.stroke(); }
    if (!picked) for (let i = 0; i < 3; i++) { g.fillStyle = SNOW; ell(g, (r() - .5) * 20, -3, 6, 2); g.fill(); }
  }
  /* lingonberry mat: glossy dark leaves, red berries (role "berry") */
  function lingon(g, picked, v) {
    const r = mulberry(600 + v);
    g.fillStyle = 'rgba(40,30,20,.18)'; ell(g, 0, -1, 36, 8); g.fill();
    for (let i = 0; i < 5; i++) { smoothPath(g, blobPts(-26 + i * 13, -12 - (i % 2) * 6, 14, 10, 10, .35, r)); fillInk(g, i % 2 ? '#2e4a32' : '#3a5a3c', 1.6); }
    for (let i = 0; i < 34; i++) { ell(g, -30 + r() * 60, -24 + r() * 18, 2.6, 1.6, r() * 3); g.fillStyle = r() < .5 ? '#4e7450' : '#22382a'; g.fill(); }
    if (!picked) for (let i = 0; i < 14; i++) { const x = -26 + r() * 52, y = -26 + r() * 16; ell(g, x, y, 2.8, 2.8); fillInk(g, '#c5262a', .9); g.fillStyle = '#ffb0a8'; ell(g, x - .9, y - .9, .8, .8); g.fill(); }
    for (let i = 0; i < 4; i++) { g.fillStyle = SNOW; ell(g, -24 + r() * 48, -26 + r() * 8, 6, 1.8); g.fill(); }
  }
  /* limestone block: cream strata, dark flint nodules; stage 1-2 = quarried (role "boulder") */
  function limestone(g, v, stage) {
    const r = mulberry(700 + v), w = 46 - stage * 10, h = 54 - stage * 15;
    g.fillStyle = 'rgba(40,40,50,.2)'; ell(g, 0, -2, w + 6, 9); g.fill();
    const pts = [[-w, 0], [-w - 2, -h * .5], [-w * .7, -h], [w * .2, -h - 6], [w * .9, -h * .8], [w + 2, -h * .3], [w, 0]];
    shaded(g, () => poly(g, pts), '#d8cfb8', { light: '#ece6d4', lb: [-w * .3, -h * .8, w * .6, h * .3], hatch: [w * .2, -h - 6, w + 4, 0], hc: 'rgba(60,50,40,.35)', lw: 2.2 });
    g.strokeStyle = 'rgba(110,96,76,.55)'; g.lineWidth = 1.2; for (let i = 1; i < 4; i++) { const y = -h * i / 4; g.beginPath(); g.moveTo(-w + 2, y + 2); g.quadraticCurveTo(0, y - 3, w - 1, y + 1); g.stroke(); }
    g.strokeStyle = 'rgba(70,70,80,.35)'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { const x = -w * .6 + i * w * .5; g.beginPath(); g.moveTo(x, -h * .9); g.quadraticCurveTo(x + 2, -h * .5, x - 1, -h * .15); g.stroke(); }
    for (let i = 0; i < 3 - stage; i++) { const x = -w * .5 + r() * w, y = -h * .25 - r() * h * .5; smoothPath(g, blobPts(x, y, 6, 4.4, 8, .4, r)); fillInk(g, '#3e4450', 1.2); g.fillStyle = '#7d8696'; ell(g, x - 1.5, y - 1.2, 2, 1.2); g.fill(); }
    if (!stage) { g.fillStyle = SNOW; smoothPath(g, blobPts(-w * .2, -h - 2, w * .55, 4, 10, .4, r)); g.fill(); }
  }
  /* bistort: pink-white spike over a rosette, edible rhizome (role "carrot") */
  function bistort(g) { for (const s of [-1, 1]) { ell(g, s * 7, -3, 8, 3, s * .3); fillInk(g, '#4f6a3a', 1.1); } inkLine(g, [[0, -2], [1, -30]], 1.2, '#6a7a4a', .6); for (let i = 0; i < 7; i++) { ell(g, 1 + (i % 2 ? 1.6 : -1.6), -30 - i * 2.6, 2, 1.6); fillInk(g, i < 3 ? '#e8c2c8' : '#f2ecec', .6); } }
  /* frozen sedge with ice at the foot (role "reeds") */
  function sedge(g, v) { const r = mulberry(950 + v); ell(g, 0, -2, 22, 5); g.fillStyle = 'rgba(200,225,235,.7)'; g.fill(); g.strokeStyle = 'rgba(120,150,170,.6)'; g.lineWidth = 1; g.stroke(); for (let i = 0; i < 16; i++) { const x = (r() - .5) * 26, L = 26 + r() * 30, a = (r() - .5) * .7; line(g, [[x, -3], [x + Math.sin(a) * L, -3 - Math.cos(a) * L]], 1.4, i % 3 ? '#8a8a5a' : '#b0a070'); } for (let i = 0; i < 3; i++) { const x = (r() - .5) * 20; ell(g, x, -34 - r() * 10, 1.6, 4); fillInk(g, '#5a4a3a', .6); } }
  /* tundra flowers: mountain avens, purple saxifrage, arctic poppy, cottongrass, pasqueflower */
  function flower(g, v) {
    line(g, [[0, 0], [0, -14]], 1.2, '#5a6a3a');
    if (v === 0) { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ell(g, Math.cos(a) * 4, -16 + Math.sin(a) * 4, 2.6, 1.6, a); fillInk(g, '#f6f2e8', .6); } ell(g, 0, -16, 2, 2); fillInk(g, '#e8c040', .6); }
    else if (v === 1) { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ell(g, Math.cos(a) * 3, -15 + Math.sin(a) * 3, 2.4, 2, a); fillInk(g, '#a2508a', .6); } }
    else if (v === 2) { for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + .4; ell(g, Math.cos(a) * 3, -16 + Math.sin(a) * 3, 3, 2.4, a); fillInk(g, '#f2d24a', .6); } ell(g, 0, -16, 1.4, 1.4); g.fillStyle = '#7a8a3a'; g.fill(); }
    else if (v === 3) { for (const dx of [-3, 3]) { line(g, [[dx * .3, -6], [dx, -18]], 1, '#6a7a4a'); ell(g, dx, -21, 3.4, 4.2); g.fillStyle = '#fbfaf6'; g.fill(); g.strokeStyle = 'rgba(120,120,120,.5)'; g.lineWidth = .6; g.stroke(); } }
    else { for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i / 5 - .5) * 1.6; ell(g, Math.cos(a) * 3.4, -17 + Math.sin(a) * 3.4, 1.8, 3.8, a + Math.PI / 2); fillInk(g, '#8a6ab8', .6); } ell(g, 0, -16, 1.4, 1.4); g.fillStyle = '#f0c040'; g.fill(); }
  }
  /* dwarf willow (role "sapling") */
  function willow(g, picked) { const r = mulberry(400); for (let i = 0; i < 6; i++) { const a = (i / 5 - .5) * 1.8, L = picked ? 12 : 24 + r() * 10; inkCurve(g, [[0, 0], [Math.sin(a) * L * .5, -L * .5], [Math.sin(a) * L, -Math.cos(a) * L]], 1.4, '#7a4a3a', .7); if (!picked) for (let j = 0; j < 4; j++) { ell(g, Math.sin(a) * L * (.5 + j * .15) + (j % 2 ? 2 : -2), -Math.cos(a) * L * (.5 + j * .15), 3, 1.6, a); fillInk(g, '#8a9a5a', .6); } } if (!picked) for (let i = 0; i < 4; i++) { ell(g, -10 + r() * 20, -30 + r() * 8, 2.6, 3.4); g.fillStyle = '#f0ece0'; g.fill(); } }

  /* ======================= PLACES ======================= */
  /* weathering streaks of the Perigord cliffs: thin, broken, grey to black, wider at the top */
  function drips(g, x0, x1, y0, y1, n, r) {
    g.save(); g.lineCap = 'round';
    for (let i = 0; i < n; i++) { const x = lerp(x0 + 20, x1 - 20, (i + r() * .8) / n), len = (y1 - y0) * (.35 + r() * .6), a = .12 + r() * .2;
      for (let k = 0; k < 3; k++) { g.strokeStyle = 'rgba(48,46,50,' + (a * (1 - k * .28)) + ')'; g.lineWidth = 5 - k * 1.6; g.beginPath(); g.moveTo(x + k * 3, y0 + 4); g.bezierCurveTo(x + k * 3 + 4, y0 + len * .3, x + k * 2 - 3, y0 + len * .7, x + k * 2 + (r() - .5) * 4, y0 + len * (1 - k * .2)); g.stroke(); } }
    g.restore();
  }
  /* broken crest along a cliff top: turf, a few shrubs, snow lying in the hollows */
  function crest(g, pts, r) {
    for (let i = 0; i < pts.length - 1; i++) { const [x, y] = pts[i]; if (r() < .55) { smoothPath(g, blobPts(x, y - 2, 10 + r() * 10, 5, 8, .5, r)); fillInk(g, r() < .5 ? '#6f6a3e' : '#8a7a46', 1.3); } }
    for (let i = 1; i < pts.length - 1; i += 2) { const [x, y] = pts[i]; smoothPath(g, blobPts(x + 6, y - 1, 14, 3, 8, .4, r)); g.fillStyle = SNOW; g.fill(); }
  }
  /* rock shelter (abri sous roche) of the Vézère: pale limestone bands, black streaks, a deep overhang.
     Fits the engine's cave volume: walls at ±98, roof to −180, walkable mouth in the middle. */
  function shelter(g) {
    const r = mulberry(81);
    const top = [[-150, -150], [-136, -182], [-112, -190], [-96, -204], [-70, -200], [-48, -212], [-20, -206], [6, -214], [36, -208], [62, -212], [88, -198], [112, -194], [134, -172], [152, -140]];
    const cliff = () => { g.beginPath(); g.moveTo(-150, 0); g.lineTo(-152, -70); g.lineTo(-146, -110); for (const [x, y] of top) g.lineTo(x, y); g.lineTo(156, -90); g.lineTo(150, 0); g.closePath(); };
    shaded(g, cliff, '#d9ceb4', { light: '#ece4cf', lb: [-50, -170, 90, 28], hatch: [70, -210, 156, 0], hc: 'rgba(70,60,50,.4)', lw: 2.8 });
    g.save(); cliff(); g.clip();
    g.strokeStyle = 'rgba(120,104,82,.6)'; g.lineWidth = 1.6; for (const y of [-40, -86, -132, -170]) { g.beginPath(); g.moveTo(-160, y + 4); for (let x = -160; x <= 160; x += 20) g.lineTo(x, y + Math.sin(x * .05 + y) * 3); g.stroke(); }
    drips(g, -150, 150, -206, -60, 7, r);
    g.fillStyle = 'rgba(160,110,60,.25)'; for (let i = 0; i < 5; i++) { ell(g, -120 + r() * 240, -60 - r() * 120, 18, 8); g.fill(); }
    g.restore(); crest(g, top, r);
    // the overhang and the deep hollow under it
    g.beginPath(); g.moveTo(-112, 0); g.bezierCurveTo(-120, -40, -110, -86, -50, -98); g.quadraticCurveTo(0, -106, 50, -98); g.bezierCurveTo(110, -86, 120, -40, 112, 0); g.closePath();
    const gr = g.createLinearGradient(0, -116, 0, 0); gr.addColorStop(0, '#120e0c'); gr.addColorStop(.7, '#2a221c'); gr.addColorStop(1, '#4a3c30'); g.fillStyle = gr; g.fill(); ink(g, 2.6);
    shaded(g, () => { g.beginPath(); g.moveTo(-130, -88); g.quadraticCurveTo(-60, -120, 0, -118); g.quadraticCurveTo(60, -120, 130, -88); g.quadraticCurveTo(70, -104, 0, -104); g.quadraticCurveTo(-70, -104, -130, -88); g.closePath(); }, '#bfb397', { lw: 2 });
    g.fillStyle = 'rgba(60,50,40,.35)'; g.beginPath(); g.moveTo(-120, -86); g.quadraticCurveTo(0, -100, 120, -86); g.quadraticCurveTo(0, -92, -120, -80); g.fill();
    // ochre handprints near the entrance, snow on the ledges, fallen blocks
    for (const [x, y, a] of [[-128, -66, -.2], [126, -80, .25]]) { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = 'rgba(181,69,43,.55)'; ell(g, 0, 0, 6, 7); g.fill(); for (let i = 0; i < 4; i++) { ell(g, -4.5 + i * 3, -8.5, 1.3, 3.2); g.fill(); } ell(g, 6, -2, 1.3, 3, .8); g.fill(); g.restore(); }
    for (const [x, y, s] of [[-128, -4, 16], [132, -6, 18], [-110, -14, 9], [92, -2, 10]]) { poly(g, blobPts(x, y, s, s * .65, 7, .35, r)); fillInk(g, '#cfc4aa', 1.8); }
  }
  /* the river pool: shelf ice around open dark water (role "waterhole") */
  function icePool(g) {
    smoothPath(g, blobPts(0, 0, 76, 24, 20, .12, mulberry(91))); fillInk(g, '#dfe8ec', 2);
    smoothPath(g, blobPts(0, 1, 62, 18, 18, .14, mulberry(92))); g.fillStyle = '#9fb8c4'; g.fill();
    smoothPath(g, blobPts(4, 2, 46, 13, 16, .2, mulberry(93))); g.fillStyle = '#2c4250'; g.fill(); g.strokeStyle = 'rgba(20,30,40,.6)'; g.lineWidth = 1.2; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.2; for (const [x0, y0, x1, y1] of [[-58, -8, -40, 4], [-40, 4, -28, -2], [40, -10, 56, 2], [22, 12, 46, 14]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    g.fillStyle = 'rgba(200,230,240,.35)'; ell(g, -10, -1, 22, 4); g.fill();
    for (const [x, y] of [[-18, 4], [26, 0]]) { smoothPath(g, blobPts(x, y, 9, 3, 8, .4, mulberry(x + 99))); fillInk(g, '#e8f0f2', 1); }
  }
  /* wolf den under a limestone ledge, bones at the mouth (role "den") */
  function wolfDen(g) {
    const r = mulberry(990);
    poly(g, [[-66, 0], [-58, -46], [-30, -70], [20, -74], [58, -52], [68, 0]]); fillInk(g, '#cfc4aa', 2.2);
    g.strokeStyle = 'rgba(110,96,76,.55)'; g.lineWidth = 1.2; for (const y of [-22, -44]) { g.beginPath(); g.moveTo(-60, y); g.quadraticCurveTo(0, y - 6, 62, y + 2); g.stroke(); }
    g.beginPath(); g.moveTo(-30, 0); g.bezierCurveTo(-32, -30, -14, -40, 2, -40); g.bezierCurveTo(20, -40, 34, -26, 32, 0); g.closePath(); g.fillStyle = '#1a1512'; g.fill(); ink(g, 2);
    for (const [x, y, a] of [[-44, -4, .4], [40, -2, -.3], [10, 4, .1]]) { g.save(); g.translate(x, y); g.rotate(a); inkLine(g, [[-9, 0], [9, 0]], 2.6, '#ece2cc', 1); ell(g, -10, 0, 2.6, 2.6); fillInk(g, '#ece2cc', .9); ell(g, 10, 0, 2.6, 2.6); fillInk(g, '#ece2cc', .9); g.restore(); }
    smoothPath(g, blobPts(-6, -74, 40, 4, 10, .4, r)); g.fillStyle = SNOW; g.fill();
  }
  /* reindeer carcass: ribs, hide, an antler (role "carcass") */
  function carcassR(g) {
    smoothPath(g, blobPts(0, -6, 40, 10, 14, .25, mulberry(447))); fillInk(g, '#7a6a58', 1.8);
    for (let i = 0; i < 6; i++) { const x = -22 + i * 9; g.beginPath(); g.moveTo(x, -8); g.quadraticCurveTo(x + 4, -26, x + 10, -20); g.lineWidth = 4.4; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.6; g.strokeStyle = '#ece2cc'; g.stroke(); }
    inkCurve(g, [[30, -8], [40, -24], [36, -40], [46, -50]], 2, '#d8ccb2', 1); inkCurve(g, [[38, -30], [48, -32]], 1.5, '#d8ccb2', 1);
    g.fillStyle = 'rgba(150,40,30,.5)'; ell(g, -8, -4, 10, 3); g.fill(); g.fillStyle = SNOW; ell(g, -30, -2, 10, 2.4); g.fill();
  }
  /* the clan's hearth under the shelter: stone slabs, bone fuel, a fat lamp (the era's source of fire) */
  function clanHearth(g, lit) {
    g.fillStyle = 'rgba(30,21,15,.24)'; ell(g, 0, -1, 40, 10); g.fill();
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; if (Math.sin(a) < 0) { smoothPath(g, blobPts(Math.cos(a) * 30, Math.sin(a) * 10 - 4, 9, 6, 8, .3, mulberry(i + 3))); fillInk(g, '#cfc4aa', 1.4); } }
    for (const a of [-.4, .5, .05]) { g.save(); g.translate(0, -8); g.rotate(a); inkLine(g, [[-22, 0], [22, 0]], 4.4, '#ece2cc', 1.2); ell(g, -23, 0, 3.6, 3.2); fillInk(g, '#ece2cc', .9); ell(g, 23, 0, 3.6, 3.2); fillInk(g, '#ece2cc', .9); g.restore(); }
    g.fillStyle = lit ? '#2a1a12' : '#4a4038'; ell(g, 0, -6, 16, 5); g.fill();
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; if (Math.sin(a) >= 0) { smoothPath(g, blobPts(Math.cos(a) * 30, Math.sin(a) * 10 - 4, 9.5, 6.5, 8, .3, mulberry(i + 20))); fillInk(g, '#d9ceb4', 1.5); } }
    // fat lamp of carved sandstone beside the hearth
    g.save(); g.translate(40, -4); ell(g, 0, 0, 10, 4.4); fillInk(g, '#b89a6a', 1.3); ell(g, 0, -1, 6.4, 2.2); g.fillStyle = '#5a4220'; g.fill(); inkLine(g, [[9, 0], [18, 2]], 3, '#b89a6a', 1); g.restore();
  }
  /* limestone cliff segment that shapes the valley (solid scenery) */
  function cliffBand(g, v) {
    const r = mulberry(1200 + v), w = 260;
    const top = []; for (let x = -w + 10; x <= w - 10; x += 26) top.push([x, -150 - Math.sin((x + v * 70) * .018) * 18 - r() * 14 + (Math.abs(x) > w - 40 ? 40 : 0)]);
    const p = () => { g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w - 4, -70); for (const [x, y] of top) g.lineTo(x, y); g.lineTo(w + 4, -80); g.lineTo(w, 0); g.closePath(); };
    shaded(g, p, '#dbd0b6', { light: '#ede6d2', lb: [-80, -150, 140, 30], hatch: [w * .4, -180, w + 4, 0], hc: 'rgba(70,60,50,.38)', lw: 2.6 });
    g.save(); p(); g.clip();
    g.strokeStyle = 'rgba(120,104,82,.55)'; g.lineWidth = 1.4; for (const y of [-30, -64, -100, -138]) { g.beginPath(); g.moveTo(-w, y); for (let x = -w; x <= w; x += 24) g.lineTo(x, y + Math.sin(x * .04 + y + v) * 3); g.stroke(); }
    drips(g, -w, w, -182, -40, 9, r);
    for (const y of [-58, -112]) { g.beginPath(); g.moveTo(-w, y); for (let x = -w; x <= w; x += 30) g.quadraticCurveTo(x + 15, y + 8 + r() * 6, x + 30, y + (r() - .5) * 4); g.lineTo(w, y + 10); g.lineTo(-w, y + 10); g.closePath(); g.fillStyle = 'rgba(60,50,40,.28)'; g.fill(); }
    for (let i = 0; i < 3; i++) { const x = -w + 60 + r() * (w * 2 - 120), y = -20 - r() * 40; g.beginPath(); g.moveTo(x - 30, y); g.quadraticCurveTo(x, y - 30, x + 30, y); g.closePath(); g.fillStyle = 'rgba(30,24,20,.55)'; g.fill(); }
    g.restore(); crest(g, top, r);
    for (let i = 0; i < 6; i++) { const x = -w + r() * w * 2; poly(g, blobPts(x, -2, 10 + r() * 10, 7, 7, .35, r)); fillInk(g, '#cfc4aa', 1.6); }
  }
  /* hide tent of the reindeer hunters, frame of poles and antlers */
  function hideTent(g) {
    g.fillStyle = 'rgba(30,21,15,.22)'; ell(g, 0, -1, 70, 14); g.fill();
    for (const [a, b] of [[[-18, -150], [26, -184]], [[18, -150], [-24, -182]], [[0, -150], [4, -190]]]) inkLine(g, [a, b], 3, '#6e4a2c', 1.2);
    shaded(g, () => { g.beginPath(); g.moveTo(-70, 0); g.quadraticCurveTo(-40, -80, -16, -150); g.lineTo(16, -150); g.quadraticCurveTo(40, -80, 70, 0); g.quadraticCurveTo(0, 10, -70, 0); g.closePath(); }, '#a88a62', { hatch: [10, -150, 72, 4], hc: 'rgba(60,40,20,.35)', lw: 2.4, extra: () => { g.strokeStyle = 'rgba(80,56,30,.6)'; g.lineWidth = 1.4; for (const x of [-46, -16, 16, 46]) { g.beginPath(); g.moveTo(x, 4); g.lineTo(x * .3, -148); g.stroke(); } } });
    g.beginPath(); g.moveTo(-20, 2); g.quadraticCurveTo(-20, -56, 0, -62); g.quadraticCurveTo(20, -56, 20, 2); g.closePath(); g.fillStyle = '#2a1e16'; g.fill(); ink(g, 2);
    for (const s of [-1, 1]) inkCurve(g, [[s * 4, -170], [s * 14, -184], [s * 10, -198]], 1.6, '#d8ccb2', 1);
    smoothPath(g, blobPts(0, -150, 18, 3, 8, .4, mulberry(5))); g.fillStyle = SNOW; g.fill();
  }

  /* ======================= GROUND ======================= */
  /* painted over each ground chunk. land(px,py) gives the biome (0 water, 1 steppe, 2 taiga, 3 limestone, 4 frozen bog).
     Snow lies in drifts that follow a world-space noise, so it continues from chunk to chunk. */
  function ground(g, o) {
    const { x0, y0, CH, land, fbm, seed, rng } = o, STEP = 8;
    for (let j = 0; j < CH; j += STEP) for (let i = 0; i < CH; i += STEP) {
      const b = land(i + 4, j + 4); if (!b) continue; const wx = x0 + i, wy = y0 + j;
      const n = fbm(wx * .0019, wy * .0019, seed + 301, 3) + (b === 2 ? -.05 : b === 3 ? .04 : b === 4 ? .08 : 0), d = fbm(wx * .03, wy * .03, seed + 302, 1);
      if (n > .53) { const a = Math.min(.92, (n - .53) * 6) * (.82 + d * .3); g.fillStyle = 'rgba(240,244,244,' + a.toFixed(3) + ')'; ell(g, i + 4 + (d - .5) * 4, j + 4, 8.5, 7); g.fill(); }
      else if (n > .49) { g.fillStyle = 'rgba(214,224,228,' + ((n - .49) * 4).toFixed(3) + ')'; ell(g, i + 4, j + 4, 7, 6); g.fill(); }
    }
    g.lineCap = 'round';
    for (let k = 0; k < 520; k++) {
      const px = rng() * CH, py = rng() * CH, b = land(px, py); if (!b) continue;
      const wx = x0 + px, wy = y0 + py, snow = fbm(wx * .0019, wy * .0019, seed + 301, 3) > .56;
      if (b === 1) { if (snow && rng() < .7) continue; g.strokeStyle = ['rgba(150,92,46,.55)', 'rgba(196,164,96,.55)', 'rgba(110,104,60,.5)'][(rng() * 3) | 0]; g.lineWidth = 1.3; g.beginPath(); for (let q = 0; q < 4; q++) { const ox = px + q * 2; g.moveTo(ox, py); g.quadraticCurveTo(ox + 1.5, py - 4, ox + (q - 1.5) * 2.2, py - 8 - rng() * 4); } g.stroke(); }
      else if (b === 2) { if (rng() < .2) { g.fillStyle = 'rgba(50,62,50,.4)'; ell(g, px, py, 6 + rng() * 8, 3 + rng() * 3); g.fill(); } else { g.strokeStyle = rng() < .6 ? 'rgba(70,52,36,.5)' : 'rgba(160,150,120,.4)'; g.lineWidth = 1; g.beginPath(); const a = rng() * TAU; g.moveTo(px, py); g.lineTo(px + Math.cos(a) * 5, py + Math.sin(a) * 2.5); g.stroke(); } }
      else if (b === 3) { if (rng() < .1) { g.strokeStyle = 'rgba(110,100,84,.55)'; g.lineWidth = 1.1; g.beginPath(); let x = px, y = py; g.moveTo(x, y); for (let q = 0; q < 4; q++) { x += (rng() - .3) * 16; y += (rng() - .5) * 6; g.lineTo(x, y); } g.stroke(); } else if (rng() < .3) { ell(g, px, py, 1.6 + rng() * 2.6, 1 + rng() * 1.6); g.fillStyle = rng() < .5 ? '#e4dcc8' : '#b8ad94'; g.fill(); } }
      else if (b === 4) { if (rng() < .05) { const rx = 14 + rng() * 22, ry = 5 + rng() * 7; ell(g, px, py, rx, ry); g.fillStyle = 'rgba(176,206,220,.75)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1; g.stroke(); g.beginPath(); g.moveTo(px - rx * .5, py); g.lineTo(px + rx * .2, py - ry * .3); g.lineTo(px + rx * .5, py + ry * .2); g.strokeStyle = 'rgba(90,120,140,.5)'; g.stroke(); } else { g.strokeStyle = rng() < .6 ? 'rgba(120,110,70,.5)' : 'rgba(80,70,50,.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (rng() - .5) * 3, py - 5 - rng() * 4); g.stroke(); } }
    }
  }
  const BCOL = [[150, 128, 84], [92, 100, 84], [204, 194, 170], [158, 172, 172]];

  return {
    ground, bcol: BCOL, water: [[150, 176, 186], [40, 60, 74]],
    heir: nea, mobs: { antelope: reindeer, hyena: wolf, machairodont: caveLion },
    flora: { pine: scotsPine, oak: birch, dead: snag, tuft: tussock, berry: lingon, boulder: limestone, carrot: bistort, reeds: sedge, flower, sapling: willow },
    places: { cave: shelter, waterhole: icePool, den: wolfDen, carcass: carcassR, source: clanHearth, cliff: cliffBand, tent: hideTent }
  };
})();
