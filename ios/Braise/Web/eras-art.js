/* BRAISE — articulated rig shared by the heirs of the lineage (eras II to VIII).
   Same joints and clocks as Ka's (walkT, bob, crouch, nearAngle/farAngle, action, actionT, drawHeld),
   so the engine animates every heir the same way. Each heir brings its own costume, head and props.
   Origin = between the feet, y up negative. Requires art.js (BRAISE_ART.K). */
window.BRAISE_HEIRS = window.BRAISE_HEIRS || {};
window.HEIR_KIT = (() => {
  const K = BRAISE_ART.K, { ell, fillInk, line, inkCurve, arm, hand } = K;
  /* legs: C = {leg, legFar, foot(g,x,y,side,col), wrap} */
  function legs(g, o, side, C) {
    const moving = o.moving, phase = o.walkT || 0, bob = o.bob || 0, crouch = o.crouch || 0;
    for (const sign of [-1, 1]) {
      const ph = phase + (sign > 0 ? Math.PI : 0), stride = moving ? Math.sin(ph) : 0;
      const hipX = side ? 0 : sign * 6, hipY = -38 - bob + crouch;
      const footX = side ? stride * 17 : sign * 7 + stride * 2;
      const lift = moving ? Math.max(0, Math.cos(ph)) * 9 : 0, footY = -3 - lift;
      const kneeX = (hipX + footX) / 2 + (side ? 4 + crouch * .35 : sign * 2), kneeY = (hipY + footY) / 2 - 2;
      const col = side && sign < 0 ? (C.legFar || C.leg) : C.leg;
      inkCurve(g, [[hipX, hipY], [kneeX, kneeY], [footX, footY - 4]], C.legW || 8, col, 1.8);
      if (C.wrap) C.wrap(g, hipX, hipY, kneeX, kneeY, footX, footY, sign, side);
      g.save(); g.translate(footX, footY); g.rotate(side ? stride * .13 : stride * .05);
      C.foot(g, 0, 1, side, side && sign < 0); g.restore();
    }
    g.translate(0, -bob + crouch);
    const lean = (side ? (o.moving ? .045 : 0) : o.moving ? Math.sin(phase) * .025 : 0) + (o.action === 'pick' ? .07 * Math.sin((o.actionT || 0) * Math.PI) : 0);
    g.translate(0, -38); g.rotate(lean); g.translate(0, 38);
  }
  /* one arm: C = {sleeve, sleeveFar, skin, cuff(g,x,y)} */
  function limb(g, o, near, side, C) {
    const angle = near ? (o.nearAngle || 0) : (o.farAngle || 0), x = side ? (near ? 2 : -5) : (near ? 16 : -16);
    g.save(); g.translate(x, -64);
    const col = !near && side ? (C.sleeveFar || C.sleeve) : C.sleeve, w = C.armW || 8.5;
    if (near && o.action === 'eat') {
      const lift = Math.min(1, (o.actionT || 0) * 5), hx = side ? 18 : -13, hy = -10 * lift;
      arm(g, 0, 0, side ? 22 : 10, 15, hx, hy, w, col);
      g.save(); g.translate(hx, hy); if (o.drawHeld) o.drawHeld(g); g.restore(); hand(g, hx, hy, C.skin, 4.2); g.restore(); return;
    }
    let reach = 28; if (o.action === 'pick' && near) reach += Math.sin((o.actionT || 0) * Math.PI) * 12;
    let rotation;
    if (side || o.action) rotation = -angle * (side ? 1 : near ? 1 : -1);
    else { reach = 25 + Math.sin(angle) * 7; rotation = (near ? -1 : 1) * (.10 + Math.abs(angle) * .12); }
    g.rotate(rotation);
    arm(g, 0, 0, side ? 3 : near ? 3 : -3, reach * .5, 0, reach - 3, w, col);
    if (C.cuff) C.cuff(g, 0, reach - 4);
    if (near && o.drawHeld) { g.save(); g.translate(0, reach); g.rotate(-rotation + (o.toolAngle || 0)); o.drawHeld(g); g.restore(); }
    hand(g, 0, reach + 1, C.skin, 4.2);
    g.restore();
  }
  return { legs, limb };
})();

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

/* BRAISE — Era III · La Graine. Salisbury Plain ≈ 2 500 BC, the people who raised Stonehenge.
   Chalk downland: short green turf, white chalk scars with flints, oak and hazel woods, the Avon meadows.
   Square houses of chalk cob under tall thatch (Durrington Walls), emmer fields, a long barrow.
   Heir: Oro (Neolithic farmer). Fauna: red deer, wild boar, brown bear. Origin = ground contact, y up negative. */
window.BRAISE_ERA_ART = window.BRAISE_ERA_ART || {};
BRAISE_ERA_ART[2] = (() => {
  const K = BRAISE_ART.K, H = HEIR_KIT;
  const { TAU, INK, lerp, mulberry, ell, ink, fillInk, poly, smoothPath, blobPts, line, inkLine, inkCurve, shaded, dsEye, lineageMark, head, ears, torsoPath, brows, mouth, eyes, faunaFoot, faunaJoint } = K;

  /* ======================= ORO ======================= */
  const O = { skin: '#b98b62', skinS: '#9a7050', lin: '#d9c8a0', linF: '#bfae86', linD: '#8a5a34', belt: '#7a5232', hair: '#2a1d14', straw: '#d9b864', strawD: '#a88a3c' };
  const shoe = (g, x, y, side, far) => { g.beginPath(); if (side) { g.moveTo(-6, y - 5); g.quadraticCurveTo(4, y - 7, 10, y - 2); g.quadraticCurveTo(10, y + 1, 6, y + 1); g.lineTo(-7, y + 1); g.closePath(); } else { ell(g, x, y - 1.5, 7.5, 3.6); } fillInk(g, far ? '#6a4628' : '#7a5232', 1.5); line(g, [[side ? -3 : x - 4, y - 4], [side ? 4 : x + 4, y - 4]], 1, '#4a2e18'); };
  const LEGS = { leg: O.skin, legFar: O.skinS, legW: 6.8, foot: shoe, wrap: (g, hx, hy, kx, ky, fx, fy) => { for (let t = .55; t < .95; t += .14) { const x = lerp(kx, fx, t), y = lerp(ky, fy - 4, t); line(g, [[x - 3.5, y - 1], [x + 3.5, y + 1]], 1, '#7a5232'); } } };
  const ARMS = { sleeve: O.skin, sleeveFar: O.skinS, skin: O.skin, armW: 7, cuff: (g, x, y) => { inkLine(g, [[x - 3, y - 6], [x + 3, y - 6]], 1.6, '#c9a24a', .7); } };
  function tunic(g, back) {
    shaded(g, () => torsoPath(g, 15, 17, -68, -26, 1), O.lin, { hatch: back ? [-24, -70, -4, -22] : [4, -70, 24, -22], hc: 'rgba(80,60,30,.35)', extra: () => { g.fillStyle = O.linD; for (let x = -18; x < 18; x += 4) { poly(g, [[x, -26], [x + 2, -31], [x + 4, -26]]); g.fill(); } } });
    g.beginPath(); g.rect(-15, -47, 30, 5); fillInk(g, O.belt, 1.4); for (let x = -13; x < 14; x += 4) { g.fillStyle = '#c9a46e'; g.fillRect(x, -46, 2, 3); }
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 15, -67); g.quadraticCurveTo(s * 20, -66, s * 19, -58); g.lineTo(s * 13, -60); g.closePath(); fillInk(g, O.lin, 1.3); }
  }
  function hat(g) {
    shaded(g, () => { g.beginPath(); g.moveTo(-24, -105); g.lineTo(0, -132); g.lineTo(24, -105); g.closePath(); }, O.straw, { hatch: [0, -134, 26, -100], hc: 'rgba(110,80,20,.45)' });
    shaded(g, () => ell(g, 0, -105, 34, 7.5), '#d6b65e', { extra: () => { g.strokeStyle = 'rgba(130,95,30,.6)'; g.lineWidth = .9; g.beginPath(); for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; g.moveTo(Math.cos(a) * 12, -105 + Math.sin(a) * 2.6); g.lineTo(Math.cos(a) * 33, -105 + Math.sin(a) * 7.2); } g.stroke(); } });
    inkLine(g, [[-20, -109], [20, -109]], 2.6, O.belt, 1);
  }
  function oro(g, o) {
    o = o || {}; if (o.view === 'side') return oroSide(g, o); if (o.view === 'back') return oroBack(g, o);
    H.legs(g, o, false, LEGS);
    tunic(g);
    H.limb(g, o, false, false, ARMS);
    g.beginPath(); g.rect(-6, -73, 12, 7); fillInk(g, O.skin, 1.5);
    head(g, 'sapiens', O.skin);
    g.beginPath(); g.moveTo(-20, -84); g.quadraticCurveTo(-18, -70, 0, -66); g.quadraticCurveTo(18, -70, 20, -84); g.quadraticCurveTo(14, -76, 6, -77); g.quadraticCurveTo(0, -79, -6, -77); g.quadraticCurveTo(-14, -76, -20, -84); g.closePath(); fillInk(g, O.hair, 1.8);
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 23, -100); g.quadraticCurveTo(s * 26, -90, s * 22, -84); g.lineTo(s * 19, -92); g.closePath(); fillInk(g, O.hair, 1.6); }
    eyes(g, o.mood, { blink: o.blink }); brows(g, o.mood, -98); mouth(g, o.mood, -73.5, 3.5);
    g.beginPath(); g.moveTo(.5, -83); g.quadraticCurveTo(2.5, -80.5, 0, -80); ink(g, 1.2);
    lineageMark(g, 13, -84, 'tattoo');
    hat(g);
    H.limb(g, o, true, false, ARMS);
  }
  function oroSide(g, o) {
    H.legs(g, o, true, LEGS);
    H.limb(g, o, false, true, ARMS);
    shaded(g, () => { g.beginPath(); g.moveTo(-11, -68); g.quadraticCurveTo(4, -72, 11, -66); g.quadraticCurveTo(14, -48, 13, -26); g.lineTo(-12, -26); g.quadraticCurveTo(-14, -48, -11, -68); g.closePath(); }, O.lin, { hatch: [-16, -70, 0, -24], hc: 'rgba(80,60,30,.35)', extra: () => { g.fillStyle = O.linD; for (let x = -12; x < 13; x += 4) { poly(g, [[x, -26], [x + 2, -31], [x + 4, -26]]); g.fill(); } } });
    g.beginPath(); g.rect(-12, -47, 25, 5); fillInk(g, O.belt, 1.4);
    // profile with the short beard
    const prof = () => { g.beginPath(); g.moveTo(-19, -92); g.bezierCurveTo(-21, -116, 12, -120, 18, -100); g.quadraticCurveTo(19, -94, 21, -88); g.lineTo(24.5, -82); g.lineTo(20.5, -80); g.quadraticCurveTo(22, -76, 20, -74); g.quadraticCurveTo(21.5, -70.5, 17, -68.5); g.quadraticCurveTo(8, -66.5, 0, -69); g.bezierCurveTo(-12, -72, -19, -78, -19, -92); g.closePath(); };
    shaded(g, prof, O.skin, { lw: 2.4 });
    g.beginPath(); g.moveTo(-6, -84); g.quadraticCurveTo(0, -66, 12, -65); g.quadraticCurveTo(20, -66, 21, -72); g.quadraticCurveTo(15, -73, 12, -77); g.quadraticCurveTo(4, -80, -6, -84); g.closePath(); fillInk(g, O.hair, 1.6);
    dsEye(g, 13, -89, { blink: o.blink, rx: 2.6, ry: 4.2 });
    g.beginPath(); g.moveTo(8, -97); g.quadraticCurveTo(13, -99.5, 18, -97); ink(g, 2.2);
    ell(g, -4, -86, 3.6, 5.2); fillInk(g, O.skin, 1.5);
    lineageMark(g, 6, -84, 'tattoo');
    g.save(); g.translate(0, 0); hat(g); g.restore();
    H.limb(g, o, true, true, ARMS);
  }
  function oroBack(g, o) {
    H.legs(g, o, false, LEGS);
    H.limb(g, o, false, false, ARMS); H.limb(g, o, true, false, ARMS);
    tunic(g, true);
    g.beginPath(); g.rect(-6, -73, 12, 7); fillInk(g, O.skin, 1.5);
    ears(g, O.skin, -90);
    ell(g, 0, -94, 23, 22); fillInk(g, O.hair, 2.2);
    g.strokeStyle = 'rgba(120,100,90,.45)'; g.lineWidth = 1.1; g.beginPath(); for (let i = -3; i <= 3; i++) { g.moveTo(i * 5, -112); g.quadraticCurveTo(i * 7, -96, i * 6, -76); } g.stroke();
    hat(g);
  }

  /* ======================= FAUNA ======================= */
  /* red deer — russet summer coat, pale rump, branched antlers (role of the antelope) */
  function redDeer(g, p, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const fleeing = o.state === 'flee' || o.state === 'fleeing' || o.speed > 140, grazing = !moving && (o.state === 'graze' || o.state === 'grazing');
    const C = '#a2603a', CD = '#6e3e22', CL = '#e8d4b0', far = '#7e4a2c';
    const graze = grazing ? .96 + Math.sin(time * 1.9) * .018 : 0, by = (moving ? (fleeing ? -3.4 * Math.max(0, Math.sin(phase * 2)) : Math.cos(phase * 2) * .6) : Math.sin(time * 2) * .25) + graze * 1.4;
    const legs = [{ x: -15, far: true, back: true, ph: fleeing ? .12 : .5 }, { x: 16, far: true, back: false, ph: fleeing ? .62 : .25 }, { x: -20, far: false, back: true, ph: 0 }, { x: 21, far: false, back: false, ph: fleeing ? .5 : .75 }];
    const leg = L => { const st = moving ? faunaFoot(phase + L.ph * TAU, fleeing ? 13 : 7, fleeing ? 15 : 7, fleeing ? .43 : .64) : [0, 0]; faunaJoint(g, [L.x, by - 36], [L.x + st[0], st[1] - (L.far ? 1.6 : 0)], 21, 22, L.back ? -1 : 1, L.far ? 2.3 : 2.9, L.far ? far : CD, true); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(0, by);
    ell(g, -25, -46, 3, 4); fillInk(g, CL, 1);
    shaded(g, () => { g.beginPath(); g.moveTo(-25, -48); g.bezierCurveTo(-26, -60, 18, -62, 25, -52); g.quadraticCurveTo(29, -38, 21, -32); g.quadraticCurveTo(0, -28, -21, -32); g.quadraticCurveTo(-28, -38, -25, -48); g.closePath(); }, C,
      { extra: () => { g.fillStyle = CL; ell(g, -22, -42, 6, 8); g.fill(); g.fillStyle = 'rgba(60,30,15,.35)'; ell(g, 0, -31, 22, 3); g.fill(); }, hatch: [-24, -60, -6, -32], hc: 'rgba(60,30,15,.25)' });
    g.save(); g.translate(18, -50); g.rotate(graze * 1.2 + (moving ? Math.sin(phase + .4) * .04 : Math.sin(time * 1.3) * .02)); g.translate(-18, 50);
    shaded(g, () => { g.beginPath(); g.moveTo(14, -56); g.quadraticCurveTo(22, -72, 28, -80); g.lineTo(35, -75); g.quadraticCurveTo(30, -60, 25, -42); g.quadraticCurveTo(18, -46, 14, -56); g.closePath(); }, '#8a5030', {});
    shaded(g, () => { g.beginPath(); g.moveTo(26, -84); g.quadraticCurveTo(34, -88, 44, -80); g.lineTo(47, -75); g.quadraticCurveTo(40, -72, 32, -73); g.quadraticCurveTo(25, -76, 26, -84); g.closePath(); }, C, {});
    g.fillStyle = INK; ell(g, 46, -77, 1.4, 1); g.fill();
    dsEye(g, 33, -81, { rx: 1.5, ry: 2, socket: false, blink: ((time + .9) % 5.3) > 5.15 });
    g.save(); g.translate(28, -86); g.rotate(-.7 + Math.sin(time * 4.3) * .12); ell(g, -2, -2, 5, 2.2); fillInk(g, C, 1); g.restore();
    const tine = pts => inkCurve(g, pts, 2, '#c8b08a', 1);
    tine([[30, -87], [26, -102], [22, -118], [24, -132]]); tine([[27, -98], [36, -102]]); tine([[24, -110], [32, -116]]); tine([[23, -124], [16, -132]]); tine([[24, -130], [30, -138]]);
    tine([[32, -87], [32, -100], [36, -114], [40, -124]]); tine([[33, -98], [42, -98]]);
    g.restore(); g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }
  /* wild boar — bristly dark coat, mane along the spine, tusks (role of the night pack) */
  function boar(g, p, angry, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const attacking = o.state === 'attack' && Number.isFinite(o.attack) && o.attack >= 0 && o.attack < 1.05, a = attacking ? o.attack : -1;
    const threat = !!angry || attacking || o.state === 'warn';
    const lunge = attacking && a >= .45 && a < .75 ? Math.sin((a - .45) / .3 * Math.PI) : 0, wind = attacking && a < .45 ? Math.sin(Math.min(1, a / .32) * Math.PI / 2) : 0;
    const run = o.speed > 115 || o.state === 'chase', loco = moving && !attacking;
    const C = '#4e3e30', CD = '#2e241c', CL = '#7a6650', far = '#3a2e24';
    const by = (loco ? (run ? -2 * Math.max(0, Math.sin(phase * 2)) : Math.cos(phase * 2) * .5) : 0) + wind * 3, push = lunge * 12;
    const legs = [{ x: -14, far: true, back: true, ph: run ? .1 : .5 }, { x: 13, far: true, back: false, ph: run ? .6 : .25 }, { x: -17, far: false, back: true, ph: 0 }, { x: 16, far: false, back: false, ph: run ? .5 : .75 }];
    const leg = L => { const st = loco ? faunaFoot(phase + L.ph * TAU, run ? 9 : 5, run ? 8 : 4.5, run ? .42 : .62) : [0, 0]; faunaJoint(g, [L.x + push * .5, by - 22], [L.x + st[0] + (L.back ? 0 : push), st[1] - (L.far ? 1.4 : 0)], 11, 11, L.back ? -1 : 1, L.far ? 3 : 3.8, L.far ? far : CD, true); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(push * .6, by);
    inkCurve(g, [[-24, -34], [-30, -30], [-29, -24]], 1.4, C, .8);
    shaded(g, () => { g.beginPath(); g.moveTo(-25, -30); g.bezierCurveTo(-26, -46, -4, -52, 14, -48); g.quadraticCurveTo(24, -42, 24, -30); g.quadraticCurveTo(10, -18, -20, -20); g.quadraticCurveTo(-27, -24, -25, -30); g.closePath(); }, C,
      { extra: () => { g.fillStyle = 'rgba(120,100,80,.35)'; ell(g, -4, -44, 16, 4); g.fill(); }, hatch: [-25, -52, 24, -18], hc: 'rgba(20,14,10,.35)', sp: 2.6 });
    g.strokeStyle = CD; g.lineWidth = 1.6; g.beginPath(); for (let x = -16; x < 16; x += 3) { g.moveTo(x, -48 + Math.abs(x) * .05); g.lineTo(x + 1, -54 + Math.abs(x) * .1); } g.stroke();
    const hx = 24 + lunge * 4, hy = threat ? -28 : -32;
    shaded(g, () => { g.beginPath(); g.moveTo(hx - 6, hy - 14); g.quadraticCurveTo(hx + 6, hy - 14, hx + 18, hy - 2); g.lineTo(hx + 20, hy + 4); g.quadraticCurveTo(hx + 8, hy + 8, hx - 4, hy + 6); g.quadraticCurveTo(hx - 10, hy - 4, hx - 6, hy - 14); g.closePath(); }, C, {});
    ell(g, hx + 20, hy + 1, 3, 4); fillInk(g, '#8a6a5a', 1.1); g.fillStyle = INK; ell(g, hx + 20.5, hy, .8, 1); g.fill(); ell(g, hx + 20.5, hy + 2.4, .8, 1); g.fill();
    poly(g, [[hx - 3, hy - 13], [hx - 1, hy - 22], [hx + 3, hy - 13]]); fillInk(g, far, 1.1);
    g.beginPath(); g.moveTo(hx + 13, hy + 4); g.quadraticCurveTo(hx + 16, hy - 2, hx + 13, hy - 6); g.lineWidth = 2.4; g.strokeStyle = '#efe6cf'; g.stroke(); ink(g, .6);
    dsEye(g, hx + 6, hy - 6, { rx: 1.3, ry: 1.6, socket: false, angry: threat });
    g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }
  /* brown bear — massive hump, round ears, rises on its hind legs to strike (last-night predator) */
  function bear(g, p, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const attacking = o.state === 'attack' && Number.isFinite(o.attack) && o.attack >= 0 && o.attack < 1.05, a = attacking ? o.attack : -1;
    const rear = attacking ? Math.sin(Math.min(1, a / .5) * Math.PI / 2) * (a < .8 ? 1 : (1.05 - a) / .25) : 0, stalk = o.state === 'stalk' || o.state === 'approach';
    const C = '#6a4a30', CD = '#3e2a1a', CL = '#8a6a48', far = '#523a26';
    const by = moving && !attacking ? Math.cos(phase * 2) * .7 : Math.sin(time * 1.4) * .3;
    g.save(); g.translate(-18, 0); g.rotate(-rear * .9); g.translate(18, 0);
    const legs = [{ x: -16, far: true, back: true, ph: .5 }, { x: 16, far: true, back: false, ph: .25 }, { x: -20, far: false, back: true, ph: 0 }, { x: 20, far: false, back: false, ph: .75 }];
    const leg = L => { const st = moving && !attacking ? faunaFoot(phase + L.ph * TAU, 7, 5, .64) : [0, 0]; faunaJoint(g, [L.x, by - 28], [L.x + st[0], st[1] - (L.far ? 1.5 : 0)], 14, 14, L.back ? -1 : 1, L.far ? 5 : 6, L.far ? far : CD, false); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(0, by);
    shaded(g, () => { g.beginPath(); g.moveTo(-26, -30); g.bezierCurveTo(-30, -50, -6, -60, 10, -58); g.quadraticCurveTo(26, -54, 28, -36); g.quadraticCurveTo(22, -20, 0, -20); g.quadraticCurveTo(-24, -20, -26, -30); g.closePath(); }, C,
      { extra: () => { g.fillStyle = CL; ell(g, -2, -52, 14, 5); g.fill(); }, hatch: [-26, -60, 28, -20], hc: 'rgba(30,18,10,.3)', sp: 3 });
    const hx = 30, hy = stalk ? -36 : -42;
    shaded(g, () => smoothPath(g, blobPts(hx, hy, 11, 10, 12, .12, mulberry(71))), C, {});
    shaded(g, () => { g.beginPath(); g.moveTo(hx + 4, hy - 4); g.quadraticCurveTo(hx + 16, hy - 4, hx + 18, hy + 2); g.quadraticCurveTo(hx + 14, hy + 7, hx + 4, hy + 5); g.closePath(); }, CL, {});
    for (const dx of [-6, 2]) { ell(g, hx + dx, hy - 9, 3.6, 3.4); fillInk(g, dx < 0 ? far : C, 1.1); }
    g.fillStyle = INK; ell(g, hx + 17.5, hy + 1, 2, 1.6); g.fill();
    dsEye(g, hx + 5, hy - 2.5, { rx: 1.4, ry: 1.7, socket: false, angry: stalk || attacking });
    if (attacking) { g.beginPath(); g.moveTo(hx + 6, hy + 6); g.quadraticCurveTo(hx + 12, hy + 9, hx + 17, hy + 5); ink(g, 1.2); for (const [x, y] of [[hx + 8, hy + 6.5], [hx + 14, hy + 6]]) { poly(g, [[x, y], [x + 1, y + 3.5], [x + 2, y]]); g.fillStyle = '#f2ead8'; g.fill(); } }
    g.restore();
    legs.filter(l => !l.far).forEach(leg);
    g.restore();
  }

  /* ======================= FLORA ======================= */
  /* pedunculate oak: broad lobed crown, rugged trunk (role "pine", size k) */
  function oak(g, k, seed) {
    const r = mulberry(seed), h = (170 + r() * 30) * k;
    g.fillStyle = 'rgba(30,40,20,.2)'; ell(g, 0, -2, 60 * k, 13 * k); g.fill();
    inkCurve(g, [[0, 0], [-3 * k, -h * .35], [2 * k, -h * .55]], 15 * k, '#6a5440', 1.8);
    for (const [x, y] of [[-34, -.62], [30, -.66], [-6, -.8]]) inkCurve(g, [[0, -h * .5], [x * .5 * k, h * y * .9], [x * k, h * y]], 6 * k, '#6a5440', 1.4);
    g.strokeStyle = 'rgba(40,30,20,.5)'; g.lineWidth = 1; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-5 * k + i * 2.5 * k, -4); g.lineTo(-4 * k + i * 2.5 * k, -h * .4); g.stroke(); }
    const cl = [[-44, -.68, 36, 28], [40, -.72, 36, 28], [0, -.84, 46, 32], [-24, -.96, 34, 24], [24, -.98, 32, 22], [0, -.6, 34, 20]];
    for (const [x, y, w, hh] of cl) { smoothPath(g, blobPts(x * k, h * y, w * k, hh * k, 15, .3, r)); fillInk(g, '#4f6a2c', 2); }
    for (const [x, y, w, hh] of cl) { g.fillStyle = '#6f8c3c'; smoothPath(g, blobPts((x - 8) * k, h * y - 8 * k, w * .6 * k, hh * .5 * k, 11, .4, r)); g.fill(); }
    for (let i = 0; i < 40; i++) { const x = (r() - .5) * 140 * k, y = -h * (.6 + r() * .4); g.fillStyle = r() < .5 ? 'rgba(150,180,80,.55)' : 'rgba(40,60,20,.4)'; ell(g, x, y, 3.4 * k, 2.2 * k, r() * 3); g.fill(); }
  }
  /* hawthorn: small gnarled tree, white blossom (role "oak") */
  function hawthorn(g, v) {
    const r = mulberry(220 + v);
    g.fillStyle = 'rgba(30,40,20,.18)'; ell(g, 0, -2, 44, 10); g.fill();
    inkCurve(g, [[0, 0], [-8, -40], [4, -70], [-2, -96]], 8, '#5a4636', 1.6);
    inkCurve(g, [[2, -60], [26, -86]], 4, '#5a4636', 1.2); inkCurve(g, [[-4, -50], [-30, -78]], 4, '#5a4636', 1.2);
    for (let i = 0; i < 7; i++) { smoothPath(g, blobPts(-34 + i * 11, -96 - (i % 3) * 12, 18, 14, 11, .4, r)); fillInk(g, i % 2 ? '#5a7834' : '#4c6a2c', 1.6); }
    for (let i = 0; i < 40; i++) { const x = -40 + r() * 80, y = -128 + r() * 46; g.fillStyle = r() < .8 ? '#f6f2ea' : '#f0c8d0'; ell(g, x, y, 2, 2); g.fill(); }
  }
  /* lightning-killed elm, bark falling off (role "dead") */
  function deadElm(g, v) {
    const r = mulberry(320 + v), h = 130 + r() * 30;
    g.fillStyle = 'rgba(30,40,20,.16)'; ell(g, 0, -2, 28, 6); g.fill();
    inkCurve(g, [[0, 0], [2, -h * .5], [-4, -h]], 9, '#8a7a68', 1.6);
    for (let i = 0; i < 5; i++) { const y = -h * (.45 + i * .1), s = i % 2 ? 1 : -1; inkCurve(g, [[0, y], [s * 16, y - 18], [s * (26 + r() * 10), y - 26 - r() * 10]], 3.2 - i * .3, '#8a7a68', 1); }
    line(g, [[-2, -h * .3], [2, -h * .8]], 1.6, '#4a3e32');
  }
  /* emmer wheat stand (role "tuft": gives straw/grass) */
  function emmer(g, picked) {
    g.fillStyle = 'rgba(40,30,20,.16)'; ell(g, 0, -1, 22, 5); g.fill();
    for (let i = 0; i < (picked ? 7 : 11); i++) { const x = (i - 5) * 3.6, h = picked ? 10 : 40 + (i % 3) * 7, lean = (i - 5) * .7;
      line(g, [[x, 0], [x + lean, -h]], 1.4, picked ? '#a88a4a' : '#9aa04a');
      if (!picked) { for (let k = 0; k < 4; k++) { ell(g, x + lean + (k % 2 ? 1.4 : -1.4), -h - 3 - k * 3.6, 1.8, 2.8, (k % 2 ? .4 : -.4)); fillInk(g, '#d6b456', .6); } line(g, [[x + lean, -h - 14], [x + lean + 1, -h - 24]], .6, '#c8a248'); } }
  }
  /* bramble with blackberries (role "berry") */
  function bramble(g, picked, v) {
    const r = mulberry(620 + v);
    g.fillStyle = 'rgba(30,40,20,.18)'; ell(g, 0, -1, 38, 8); g.fill();
    for (let i = 0; i < 6; i++) inkCurve(g, [[(r() - .5) * 30, 0], [(r() - .5) * 50, -26 - r() * 14], [(r() - .5) * 70, -10 - r() * 20]], 1.6, '#6a3a3a', .6);
    for (let i = 0; i < 6; i++) { smoothPath(g, blobPts(-28 + i * 11, -18 - (i % 2) * 8, 13, 10, 10, .4, r)); fillInk(g, i % 2 ? '#3e5a2c' : '#4a6a30', 1.5); }
    if (!picked) for (let i = 0; i < 14; i++) { const x = -26 + r() * 52, y = -30 + r() * 20; for (let k = 0; k < 4; k++) { ell(g, x + (k % 2) * 2 - 1, y + (k > 1 ? 2 : 0) - 1, 1.6, 1.6); fillInk(g, r() < .3 ? '#a8323a' : '#2a1a2a', .5); } }
  }
  /* sarsen stone: grey-green sandstone with lichen (role "boulder") */
  function sarsen(g, v, stage) {
    const r = mulberry(720 + v), w = 42 - stage * 9, h = 48 - stage * 13;
    g.fillStyle = 'rgba(30,40,20,.2)'; ell(g, 0, -2, w + 6, 9); g.fill();
    const pts = blobPts(0, -h * .5, w, h * .55, 11, .2, r).map(([x, y]) => [x, Math.min(0, y)]);
    shaded(g, () => poly(g, pts), '#9a9a8a', { light: '#b8b8a6', lb: [-w * .3, -h * .7, w * .5, h * .3], hatch: [w * .1, -h * 1.2, w + 4, 0], hc: 'rgba(40,40,30,.35)', lw: 2.2 });
    for (let i = 0; i < 6; i++) { g.fillStyle = r() < .5 ? 'rgba(200,190,100,.7)' : 'rgba(170,190,160,.7)'; ell(g, -w * .6 + r() * w * 1.2, -h * .2 - r() * h * .7, 3 + r() * 4, 2 + r() * 2); g.fill(); }
  }
  /* wild parsnip: umbel of yellow flowers (role "carrot") */
  function parsnip(g) { for (const s of [-1, 1]) { ell(g, s * 7, -4, 7, 3.4, s * .4); fillInk(g, '#5a7a34', 1); } inkLine(g, [[0, -2], [0, -30]], 1.2, '#6a8a3a', .6); for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i / 6 - .5) * 2; line(g, [[0, -30], [Math.cos(a) * 9, -30 + Math.sin(a) * 5]], .8, '#6a8a3a'); ell(g, Math.cos(a) * 9, -31 + Math.sin(a) * 5, 2.2, 1.6); fillInk(g, '#e8d04a', .5); } }
  /* common reed of the Avon, brown plumes (role "reeds") */
  function reed(g, v) { const r = mulberry(960 + v); for (let i = 0; i < 12; i++) { const x = (r() - .5) * 30, L = 50 + r() * 34, a = (r() - .5) * .3; line(g, [[x, 0], [x + Math.sin(a) * L, -L]], 1.6, '#7a8a46'); smoothPath(g, blobPts(x + Math.sin(a) * L + 2, -L - 6, 3, 9, 7, .4, r)); fillInk(g, '#8a6a4a', .6); ell(g, x + Math.sin(a) * L * .6 + 5, -L * .6, 6, 1.4, .5); g.fillStyle = '#6a8a3a'; g.fill(); } }
  /* downland flowers: cowslip, poppy, cornflower, ox-eye daisy, harebell */
  function flower(g, v) {
    line(g, [[0, 0], [0, -15]], 1.2, '#5a7a3a');
    if (v === 0) { for (let i = 0; i < 5; i++) { ell(g, -3 + i * 1.6, -16 - (i % 2) * 2, 1.6, 2.6, .4); fillInk(g, '#f2d040', .5); } }
    else if (v === 1) { for (let i = 0; i < 4; i++) { const a = i / 4 * TAU; ell(g, Math.cos(a) * 3, -17 + Math.sin(a) * 3, 3.4, 3, a); fillInk(g, '#d8322a', .6); } ell(g, 0, -17, 1.4, 1.4); g.fillStyle = '#1a1a1a'; g.fill(); }
    else if (v === 2) { for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; ell(g, Math.cos(a) * 3.4, -17 + Math.sin(a) * 3.4, 1.6, 2.8, a + Math.PI / 2); fillInk(g, '#3a6ad8', .5); } }
    else if (v === 3) { for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ell(g, Math.cos(a) * 4, -17 + Math.sin(a) * 4, 1.4, 3, a + Math.PI / 2); fillInk(g, '#fbfaf2', .5); } ell(g, 0, -17, 2, 2); fillInk(g, '#f0c030', .5); }
    else { inkCurve(g, [[0, -15], [3, -19], [5, -17]], .8, '#5a7a3a', .3); g.beginPath(); g.moveTo(2, -17); g.quadraticCurveTo(5, -22, 8, -17); g.lineTo(7, -15); g.lineTo(3, -15); g.closePath(); fillInk(g, '#7a8ad8', .6); }
  }
  /* hazel shoot with catkins (role "sapling") */
  function hazel(g, picked) { const r = mulberry(410); for (let i = 0; i < 5; i++) { const a = (i / 4 - .5) * 1.2, L = picked ? 12 : 34 + r() * 10; inkCurve(g, [[0, 0], [Math.sin(a) * L * .5, -L * .5], [Math.sin(a) * L, -Math.cos(a) * L]], 1.8, '#8a6a4a', .7); if (!picked) for (let j = 0; j < 3; j++) { ell(g, Math.sin(a) * L * (.5 + j * .2) + 3, -Math.cos(a) * L * (.5 + j * .2), 5, 3.4, a); fillInk(g, '#6a8a3a', .6); } } if (!picked) for (let i = 0; i < 3; i++) { line(g, [[-8 + i * 8, -34], [-8 + i * 8 + 1, -26]], 2, '#d8c860'); } }

  /* ======================= PLACES ======================= */
  /* long barrow: earthen mound with a façade of sarsens and a dark stone chamber (shelter, cave volume) */
  function barrow(g) {
    const r = mulberry(85);
    shaded(g, () => { g.beginPath(); g.moveTo(-160, 0); g.bezierCurveTo(-150, -110, -60, -150, 40, -150); g.bezierCurveTo(120, -148, 160, -100, 162, 0); g.closePath(); }, '#7e9a4a', { light: '#9ab45a', lb: [-40, -130, 90, 24], hatch: [60, -152, 164, 0], hc: 'rgba(40,60,20,.35)', lw: 2.6 });
    g.strokeStyle = 'rgba(60,80,30,.5)'; g.lineWidth = 1.2; for (let i = 0; i < 40; i++) { const x = -140 + r() * 280, y = -10 - r() * 120; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 5); g.stroke(); }
    // chalk scar along the base
    g.fillStyle = 'rgba(240,236,224,.55)'; g.beginPath(); g.moveTo(-160, 0); g.quadraticCurveTo(0, -20, 162, 0); g.closePath(); g.fill();
    // chamber entrance
    g.beginPath(); g.moveTo(-50, 0); g.lineTo(-48, -86); g.lineTo(50, -88); g.lineTo(52, 0); g.closePath(); g.fillStyle = '#16120e'; g.fill(); ink(g, 2.2);
    const st = (x, y, w, h, c) => { shaded(g, () => { g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w / 2 + 3, y - h); g.quadraticCurveTo(x, y - h - 6, x + w / 2 - 3, y - h); g.lineTo(x + w / 2, y); g.closePath(); }, c || '#9a9a8a', { hatch: [x, y - h - 6, x + w / 2 + 2, y], hc: 'rgba(40,40,30,.35)' }); };
    st(-118, 4, 30, 72); st(-86, 2, 30, 96); st(86, 2, 30, 98); st(118, 4, 30, 70);
    st(-60, 0, 22, 92, '#a4a494'); st(60, 0, 22, 94, '#a4a494');
    shaded(g, () => { g.beginPath(); g.moveTo(-74, -86); g.lineTo(-70, -104); g.lineTo(72, -106); g.lineTo(76, -88); g.closePath(); }, '#8e8e7e', { hatch: [0, -108, 76, -86], hc: 'rgba(40,40,30,.35)' });
    for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(200,190,100,.7)'; ell(g, -110 + r() * 220, -20 - r() * 60, 3, 2); g.fill(); }
  }
  /* dew pond: chalk-lined round pool (role "waterhole") */
  function dewPond(g) {
    smoothPath(g, blobPts(0, 0, 76, 25, 22, .06, mulberry(94))); fillInk(g, '#ece6d4', 2);
    smoothPath(g, blobPts(0, 1, 64, 19, 20, .06, mulberry(95))); g.fillStyle = '#4c7a86'; g.fill(); g.strokeStyle = 'rgba(30,50,60,.6)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = 'rgba(210,235,240,.4)'; ell(g, -14, -3, 26, 5); g.fill();
    g.strokeStyle = 'rgba(220,240,240,.6)'; g.lineWidth = 1; for (const [x, y, rr] of [[20, 4, 8], [-30, 6, 5]]) { g.beginPath(); g.arc(x, y, rr, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    for (const [x, y] of [[-70, -6], [66, -4], [10, -24]]) { for (let i = 0; i < 5; i++) line(g, [[x + i * 2 - 4, y], [x + i * 2 - 4 + (i - 2), y - 14]], 1.4, '#6a8a3a'); }
  }
  /* boar wallow in a blackthorn thicket (role "den") */
  function wallow(g) {
    const r = mulberry(991);
    ell(g, 0, -4, 52, 14); g.fillStyle = '#4a3a2a'; g.fill(); ink(g, 1.8); g.fillStyle = 'rgba(120,100,80,.4)'; ell(g, -10, -6, 20, 4); g.fill();
    for (let i = 0; i < 9; i++) { const x = -70 + i * 17, y = -16 - (i % 2) * 8; if (Math.abs(x) < 30) continue; smoothPath(g, blobPts(x, y - 14, 18, 18, 11, .45, r)); fillInk(g, i % 2 ? '#3e5030' : '#2e4024', 1.6); for (let k = 0; k < 6; k++) { g.fillStyle = '#f2eee2'; ell(g, x - 10 + r() * 20, y - 24 + r() * 18, 1.4, 1.4); g.fill(); } }
    for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(60,40,25,.6)'; ell(g, -30 + r() * 60, 6 + r() * 6, 2, 1.4); g.fill(); }
  }
  /* aurochs skull and bones (role "carcass") */
  function aurochsBones(g) {
    smoothPath(g, blobPts(0, -4, 36, 8, 12, .25, mulberry(448))); g.fillStyle = 'rgba(80,70,50,.35)'; g.fill();
    for (let i = 0; i < 5; i++) { const x = -26 + i * 9; g.beginPath(); g.moveTo(x, -4); g.quadraticCurveTo(x + 4, -20, x + 10, -16); g.lineWidth = 4.4; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.6; g.strokeStyle = '#ece2cc'; g.stroke(); }
    shaded(g, () => { g.beginPath(); g.moveTo(22, -6); g.lineTo(26, -22); g.quadraticCurveTo(34, -26, 42, -22); g.lineTo(44, -8); g.quadraticCurveTo(34, -2, 22, -6); g.closePath(); }, '#ece2cc', {});
    for (const s of [-1, 1]) inkCurve(g, [[33 + s * 8, -22], [33 + s * 22, -30], [33 + s * 24, -44]], 3.2, '#e2d6b8', 1.2);
    g.fillStyle = INK; ell(g, 29, -15, 2, 2.4); g.fill(); ell(g, 37, -15, 2, 2.4); g.fill();
  }
  /* the village hearth: clay-lined pit, stones, a pot (source of fire) */
  function villageHearth(g, lit) {
    g.fillStyle = 'rgba(30,21,15,.24)'; ell(g, 0, -1, 40, 10); g.fill();
    ell(g, 0, -4, 34, 10); fillInk(g, '#c9a074', 1.6); ell(g, 0, -5, 24, 6.4); g.fillStyle = lit ? '#2a1a12' : '#5a4a3a'; g.fill();
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; smoothPath(g, blobPts(Math.cos(a) * 30, Math.sin(a) * 9 - 4, 7, 4.6, 8, .3, mulberry(i + 40))); fillInk(g, '#a8a090', 1.2); }
    // Grooved Ware pot on stones beside it
    g.save(); g.translate(40, -4); g.beginPath(); g.moveTo(-9, 0); g.lineTo(-11, -18); g.lineTo(11, -18); g.lineTo(9, 0); g.closePath(); fillInk(g, '#9a6a44', 1.4); for (let y = -15; y < -2; y += 4) line(g, [[-9, y], [9, y]], 1, '#5a3a22'); for (let x = -8; x < 9; x += 4) line(g, [[x, -17], [x + 2, -13]], .8, '#5a3a22'); g.restore();
  }
  /* Durrington-style house: square chalk-cob walls, tall hipped thatch */
  function house(g, v) {
    const r = mulberry(1300 + v);
    g.fillStyle = 'rgba(30,40,20,.22)'; ell(g, 0, -1, 84, 16); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-62, -58, 124, 58); }, '#e6dcc4', { hatch: [20, -58, 62, 0], hc: 'rgba(90,80,60,.3)', lw: 2.2, extra: () => { g.strokeStyle = 'rgba(120,100,70,.4)'; g.lineWidth = 1; for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(-60 + i * 9, -56); g.lineTo(-58 + i * 9, -2); g.stroke(); } } });
    g.beginPath(); g.moveTo(-14, 0); g.lineTo(-12, -38); g.lineTo(12, -38); g.lineTo(14, 0); g.closePath(); g.fillStyle = '#2a1e16'; g.fill(); ink(g, 1.8);
    shaded(g, () => { g.beginPath(); g.moveTo(-78, -50); g.lineTo(-24, -170); g.lineTo(24, -170); g.lineTo(78, -50); g.quadraticCurveTo(0, -40, -78, -50); g.closePath(); }, '#c8a458', { light: '#dcbc6a', lb: [-30, -130, 30, 40], hatch: [20, -172, 80, -44], hc: 'rgba(100,70,20,.45)', lw: 2.4,
      extra: () => { g.strokeStyle = 'rgba(110,80,30,.5)'; g.lineWidth = 1; for (let i = 0; i < 22; i++) { const t = i / 21, x0 = lerp(-78, 78, t), x1 = lerp(-24, 24, t); g.beginPath(); g.moveTo(x0, -50); g.lineTo(x1, -168); g.stroke(); } g.fillStyle = 'rgba(120,90,40,.35)'; for (let y = -150; y < -54; y += 22) { g.beginPath(); g.moveTo(-80, y + 22); g.quadraticCurveTo(0, y + 14, 80, y + 22); g.lineTo(80, y + 25); g.quadraticCurveTo(0, y + 17, -80, y + 25); g.fill(); } } });
    inkLine(g, [[-24, -170], [24, -170]], 3, '#8a6a34', 1.2);
    if (v % 2) { for (let i = 0; i < 3; i++) { smoothPath(g, blobPts(-6 + i * 10, -184 - i * 14, 8 + i * 3, 5 + i * 2, 8, .4, r)); g.fillStyle = 'rgba(220,220,215,' + (.5 - i * .12) + ')'; g.fill(); } }
  }
  /* timber circle (Woodhenge): carved oak posts in rings */
  function woodhenge(g) {
    g.fillStyle = 'rgba(240,236,224,.5)'; ell(g, 0, -10, 150, 40); g.fill(); g.strokeStyle = 'rgba(150,140,120,.6)'; g.lineWidth = 2; g.stroke();
    const posts = []; for (const [rx, ry, n] of [[130, 34, 16], [86, 22, 12], [44, 11, 8]]) for (let i = 0; i < n; i++) { const a = i / n * TAU; posts.push([Math.cos(a) * rx, -10 + Math.sin(a) * ry, rx]); }
    posts.sort((a, b) => a[1] - b[1]);
    for (const [x, y, rx] of posts) { const h = 40 + (130 - rx) * .5; shaded(g, () => { g.beginPath(); g.rect(x - 5, y - h, 10, h); }, '#8a6a4a', { hatch: [x, y - h, x + 6, y], hc: 'rgba(40,25,10,.4)', lw: 1.6 }); line(g, [[x - 4, y - h + 8], [x + 4, y - h + 10]], 1, '#5a3a22'); }
  }
  /* emmer field with a wattle fence */
  function field(g, v) {
    const r = mulberry(1400 + v);
    g.fillStyle = '#7a5e3a'; g.beginPath(); g.moveTo(-150, 0); g.lineTo(-130, -60); g.lineTo(140, -64); g.lineTo(156, 0); g.closePath(); g.fill(); ink(g, 1.8);
    for (let row = 0; row < 6; row++) { const y = -6 - row * 10; for (let i = 0; i < 26; i++) { const x = lerp(-140 + row * 3, 146 - row * 2, i / 25) + (r() - .5) * 3, h = 16 + r() * 6; line(g, [[x, y], [x + .6, y - h]], 1.2, '#a8a04a'); ell(g, x + .6, y - h - 3, 1.6, 3); g.fillStyle = '#e2c25a'; g.fill(); } }
    for (let i = 0; i <= 12; i++) { const x = -152 + i * 26; inkLine(g, [[x, 4], [x, -22]], 2.6, '#7a5a3a', 1); } for (const y of [-6, -16]) inkCurve(g, [[-152, y + 4], [0, y + 2], [160, y + 4]], 2, '#a08058', .8);
  }

  /* ======================= GROUND ======================= */
  function ground(g, o) {
    const { x0, y0, CH, land, fbm, seed, rng } = o;
    g.lineCap = 'round';
    for (let k = 0; k < 600; k++) {
      const px = rng() * CH, py = rng() * CH, b = land(px, py); if (!b) continue;
      const wx = x0 + px, wy = y0 + py;
      if (b === 1) { const chalk = fbm(wx * .004, wy * .004, seed + 410, 2) > .66; if (chalk && rng() < .4) { ell(g, px, py, 6 + rng() * 10, 2 + rng() * 3); g.fillStyle = 'rgba(244,240,228,.6)'; g.fill(); continue; } g.strokeStyle = ['rgba(90,140,50,.5)', 'rgba(150,180,80,.45)', 'rgba(60,100,40,.45)'][(rng() * 3) | 0]; g.lineWidth = 1.1; g.beginPath(); for (let q = 0; q < 3; q++) { const ox = px + q * 2; g.moveTo(ox, py); g.lineTo(ox + (q - 1), py - 4 - rng() * 3); } g.stroke(); if (rng() < .03) { g.fillStyle = ['#f2d040', '#fbfaf2', '#d8322a'][(rng() * 3) | 0]; ell(g, px, py - 3, 1.4, 1.4); g.fill(); } }
      else if (b === 2) { if (rng() < .3) { g.fillStyle = ['rgba(150,100,40,.5)', 'rgba(110,80,40,.45)', 'rgba(90,110,40,.4)'][(rng() * 3) | 0]; ell(g, px, py, 2.6, 1.6, rng() * 3); g.fill(); } else { g.strokeStyle = 'rgba(40,50,20,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + 3, py - 3); g.stroke(); } }
      else if (b === 3) { if (rng() < .25) { smoothPath(g, blobPts(px, py, 2.6 + rng() * 2, 2 + rng() * 1.4, 6, .5, rng)); g.fillStyle = '#4a4e5a'; g.fill(); g.strokeStyle = 'rgba(240,240,236,.8)'; g.lineWidth = .8; g.stroke(); } else { ell(g, px, py, 1.6 + rng() * 3, 1 + rng() * 1.6); g.fillStyle = rng() < .6 ? 'rgba(250,248,240,.8)' : 'rgba(200,196,180,.7)'; g.fill(); } }
      else if (b === 4) { if (rng() < .04) { ell(g, px, py, 10 + rng() * 16, 3 + rng() * 5); g.fillStyle = 'rgba(80,120,130,.6)'; g.fill(); g.strokeStyle = 'rgba(200,230,230,.5)'; g.lineWidth = 1; g.stroke(); } else { g.strokeStyle = rng() < .6 ? 'rgba(60,110,50,.55)' : 'rgba(150,170,70,.45)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (rng() - .5) * 3, py - 6 - rng() * 5); g.stroke(); } }
    }
  }
  const BCOL = [[116, 150, 74], [76, 98, 52], [214, 208, 186], [96, 128, 84]];

  return {
    ground, bcol: BCOL,
    heir: oro, mobs: { antelope: redDeer, hyena: boar, machairodont: bear },
    flora: { pine: oak, oak: hawthorn, dead: deadElm, tuft: emmer, berry: bramble, boulder: sarsen, carrot: parsnip, reeds: reed, flower, sapling: hazel },
    places: { cave: barrow, waterhole: dewPond, den: wallow, carcass: aurochsBones, source: villageHearth, house, woodhenge, field }
  };
})();

/* BRAISE — Era IV · Le Bronze. The Giza plateau ≈ 2 560 BC, the builders of the Great Pyramid.
   The Nile floodplain (barley and flax fields, irrigation basins), date and doum palms, sycamore figs,
   papyrus marshes, the desert plateau of sand and limestone; mud-brick workers' houses, granaries,
   a mastaba tomb, stone blocks on sledges. Heir: Meret (stone haulers' daughter, kohl and malachite).
   Fauna: dorcas gazelle, golden jackals, the lion of the desert edge. Origin = ground contact, y up negative. */
window.BRAISE_ERA_ART = window.BRAISE_ERA_ART || {};
BRAISE_ERA_ART[3] = (() => {
  const K = BRAISE_ART.K, H = HEIR_KIT;
  const { TAU, INK, lerp, mulberry, ell, ink, fillInk, poly, smoothPath, blobPts, line, inkLine, inkCurve, shaded, dsEye, head, ears, torsoPath, brows, mouth, eyes, faunaFoot, faunaJoint } = K;

  /* ======================= MERET ======================= */
  const M = { skin: '#a9714a', skinS: '#8c5c3a', lin: '#f1ead8', linS: '#d8ccb0', hair: '#141016', collar: ['#3a8a8a', '#d8a83a', '#2a5a9a', '#c84a3a'], sandal: '#c8a464', kohl: '#141016', mal: '#2e8a6a' };
  const sandal = (g, x, y, side, far) => { if (side) { g.beginPath(); g.moveTo(-7, y); g.lineTo(10, y); g.lineTo(9, y + 1.6); g.lineTo(-7, y + 1.6); g.closePath(); fillInk(g, M.sandal, 1); ell(g, 1, y - 2, 7.5, 2.6); fillInk(g, far ? M.skinS : M.skin, 1.3); line(g, [[0, y - 4], [3, y]], 1, '#7a5a2a'); }
    else { ell(g, x, y, 7.5, 2.4); fillInk(g, M.sandal, 1); ell(g, x, y - 1.8, 6, 2.8); fillInk(g, far ? M.skinS : M.skin, 1.3); line(g, [[x - 3, y - 3], [x, y - .4], [x + 3, y - 3]], 1, '#7a5a2a'); } };
  const LEGS = { leg: M.skin, legFar: M.skinS, legW: 6.4, foot: sandal };
  const ARMS = { sleeve: M.skin, sleeveFar: M.skinS, skin: M.skin, armW: 6.6, cuff: (g, x, y) => { inkLine(g, [[x - 3.4, y - 3], [x + 3.4, y - 3]], 2, '#d8a83a', .6); } };
  function dress(g, back) {
    // sheath dress of fine linen, pleated, from under the collar to the calves
    shaded(g, () => { g.beginPath(); g.moveTo(-14, -66); g.quadraticCurveTo(0, -69, 14, -66); g.quadraticCurveTo(16, -46, 14, -18); g.lineTo(-14, -18); g.quadraticCurveTo(-16, -46, -14, -66); g.closePath(); }, M.lin, { hatch: back ? [-16, -68, -2, -16] : [4, -68, 16, -16], hc: 'rgba(120,100,70,.3)', extra: () => { g.strokeStyle = 'rgba(150,130,100,.45)'; g.lineWidth = .9; for (let x = -10; x <= 10; x += 4) { g.beginPath(); g.moveTo(x, -44); g.lineTo(x * 1.1, -19); g.stroke(); } } });
    inkLine(g, [[-14, -44], [14, -44]], 2, '#c84a3a', .8);
  }
  function collar(g) { for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(0, -70, 9 + k * 3.2, Math.PI * .12, Math.PI * .88); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.2; g.strokeStyle = M.collar[k]; g.stroke(); } }
  function wigFront(g) {
    g.beginPath(); g.moveTo(-25, -66); g.lineTo(-27, -96); g.bezierCurveTo(-27, -124, 27, -124, 27, -96); g.lineTo(25, -66); g.lineTo(18, -66); g.lineTo(19, -92); g.quadraticCurveTo(0, -100, -19, -92); g.lineTo(-18, -66); g.closePath(); fillInk(g, M.hair, 2.2);
    g.strokeStyle = 'rgba(110,100,130,.45)'; g.lineWidth = 1; g.beginPath(); for (let x = -24; x <= 24; x += 4) { if (Math.abs(x) < 18) continue; g.moveTo(x, -96); g.lineTo(x, -68); } g.stroke();
    inkLine(g, [[-24, -100], [24, -100]], 1.6, '#d8a83a', .6);
  }
  function kohlEyes(g, mood, blink) { eyes(g, mood, { blink }); if (!blink) for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 5, -92); g.quadraticCurveTo(s * 11, -94, s * 17, -90); ink(g, 1.6); } }
  function malachite(g, x, y) { for (let i = 0; i < 3; i++) line(g, [[x - 4, y + i * 3.2 - 1], [x + 4, y + i * 3.2 + 1.4]], 1.8, M.mal); }
  function meret(g, o) {
    o = o || {}; if (o.view === 'side') return meretSide(g, o); if (o.view === 'back') return meretBack(g, o);
    H.legs(g, o, false, LEGS);
    dress(g);
    H.limb(g, o, false, false, ARMS);
    g.beginPath(); g.rect(-5.5, -73, 11, 7); fillInk(g, M.skin, 1.4);
    collar(g);
    head(g, 'sapiens', M.skin, 'rgba(90,50,30,.2)');
    wigFront(g);
    kohlEyes(g, o.mood, o.blink); brows(g, o.mood, -99); mouth(g, o.mood);
    g.beginPath(); g.moveTo(.5, -84); g.quadraticCurveTo(2.2, -81.5, 0, -81); ink(g, 1.2);
    malachite(g, 12, -84);
    H.limb(g, o, true, false, ARMS);
  }
  function meretSide(g, o) {
    H.legs(g, o, true, LEGS);
    H.limb(g, o, false, true, ARMS);
    shaded(g, () => { g.beginPath(); g.moveTo(-10, -66); g.quadraticCurveTo(4, -70, 11, -64); g.quadraticCurveTo(13, -44, 12, -18); g.lineTo(-11, -18); g.quadraticCurveTo(-13, -44, -10, -66); g.closePath(); }, M.lin, { hatch: [-13, -68, 0, -16], hc: 'rgba(120,100,70,.3)' });
    inkLine(g, [[-11, -44], [12, -44]], 2, '#c84a3a', .8);
    for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(3, -70, 7 + k * 3, Math.PI * .1, Math.PI * .6); g.lineWidth = 3.2; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2; g.strokeStyle = M.collar[k]; g.stroke(); }
    const prof = () => { g.beginPath(); g.moveTo(-19, -92); g.bezierCurveTo(-21, -116, 12, -120, 18, -100); g.quadraticCurveTo(19, -94, 21, -88); g.lineTo(24.5, -82); g.lineTo(20.5, -80); g.quadraticCurveTo(22, -76, 20, -74); g.quadraticCurveTo(21.5, -70.5, 17, -68.5); g.quadraticCurveTo(8, -66.5, 0, -69); g.bezierCurveTo(-12, -72, -19, -78, -19, -92); g.closePath(); };
    shaded(g, prof, M.skin, { lw: 2.4 });
    dsEye(g, 13, -89, { blink: o.blink, rx: 2.4, ry: 4 }); if (!o.blink) { g.beginPath(); g.moveTo(10, -91); g.lineTo(20, -92); ink(g, 1.5); }
    g.beginPath(); g.moveTo(8, -98); g.quadraticCurveTo(13, -100, 18, -97); ink(g, 2.2);
    g.beginPath(); g.moveTo(19.5, -73.5); g.quadraticCurveTo(16.5, -72.5, 14, -73.5); ink(g, 1.3);
    malachite(g, 6, -84);
    g.beginPath(); g.moveTo(-24, -62); g.lineTo(-26, -96); g.bezierCurveTo(-24, -124, 18, -124, 20, -100); g.quadraticCurveTo(8, -104, 0, -98); g.lineTo(-2, -64); g.closePath(); fillInk(g, M.hair, 2.2);
    g.strokeStyle = 'rgba(110,100,130,.45)'; g.lineWidth = 1; g.beginPath(); for (let x = -22; x <= -4; x += 4) { g.moveTo(x, -98); g.lineTo(x, -64); } g.stroke();
    H.limb(g, o, true, true, ARMS);
  }
  function meretBack(g, o) {
    H.legs(g, o, false, LEGS);
    H.limb(g, o, false, false, ARMS); H.limb(g, o, true, false, ARMS);
    dress(g, true);
    g.beginPath(); g.moveTo(-25, -60); g.lineTo(-27, -96); g.bezierCurveTo(-27, -124, 27, -124, 27, -96); g.lineTo(25, -60); g.closePath(); fillInk(g, M.hair, 2.2);
    g.strokeStyle = 'rgba(110,100,130,.45)'; g.lineWidth = 1; g.beginPath(); for (let x = -22; x <= 22; x += 4) { g.moveTo(x, -112 + Math.abs(x) * .3); g.lineTo(x, -62); } g.stroke();
    inkLine(g, [[-25, -100], [25, -100]], 1.6, '#d8a83a', .6);
  }

  /* ======================= FAUNA ======================= */
  /* dorcas gazelle — sand-coloured, dark flank stripe, lyre horns (role of the antelope) */
  function gazelle(g, p, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const fleeing = o.state === 'flee' || o.state === 'fleeing' || o.speed > 140, grazing = !moving && (o.state === 'graze' || o.state === 'grazing');
    const C = '#d6a868', CD = '#8a5a30', CL = '#f6ecd8', far = '#b08850';
    const graze = grazing ? .96 + Math.sin(time * 1.9) * .018 : 0, by = (moving ? (fleeing ? -3.6 * Math.max(0, Math.sin(phase * 2)) : Math.cos(phase * 2) * .6) : Math.sin(time * 2) * .25) + graze * 1.2;
    const legs = [{ x: -11, far: true, back: true, ph: fleeing ? .12 : .5 }, { x: 12, far: true, back: false, ph: fleeing ? .62 : .25 }, { x: -15, far: false, back: true, ph: 0 }, { x: 16, far: false, back: false, ph: fleeing ? .5 : .75 }];
    const leg = L => { const st = moving ? faunaFoot(phase + L.ph * TAU, fleeing ? 12 : 6.5, fleeing ? 14 : 6, fleeing ? .42 : .64) : [0, 0]; faunaJoint(g, [L.x, by - 30], [L.x + st[0], st[1] - (L.far ? 1.4 : 0)], 17, 18, L.back ? -1 : 1, L.far ? 1.8 : 2.3, L.far ? far : C, true); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(0, by);
    inkCurve(g, [[-19, -36], [-23, -32]], 1.6, CD, .8);
    shaded(g, () => ell(g, 0, -33, 20, 8.6), C, { extra: () => { g.fillStyle = CL; ell(g, 0, -27, 18, 4); g.fill(); line(g, [[-18, -31], [18, -31]], 2, CD); g.fillStyle = CL; ell(g, -18, -33, 3.4, 5); g.fill(); } });
    g.save(); g.translate(14, -34); g.rotate(graze * 1.3 + (moving ? Math.sin(phase + .4) * .04 : 0)); g.translate(-14, 34);
    shaded(g, () => { g.beginPath(); g.moveTo(11, -37); g.quadraticCurveTo(17, -52, 22, -56); g.lineTo(27, -52); g.quadraticCurveTo(22, -42, 19, -31); g.closePath(); }, C, {});
    shaded(g, () => ell(g, 27, -57, 7, 4.2, .35), C, { extra: () => { line(g, [[22, -58], [32, -55]], 1.2, CD); } });
    g.fillStyle = INK; ell(g, 33.4, -54.6, 1.2, .9); g.fill();
    dsEye(g, 26, -59, { rx: 1.5, ry: 2, socket: false, blink: ((time + .3) % 4.8) > 4.66 });
    for (const s of [0, 1]) { g.beginPath(); g.moveTo(24 + s * 2, -61); g.bezierCurveTo(20 + s * 2, -70, 26 + s * 3, -74, 22 + s * 3, -82); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.lineWidth = 1.4; g.strokeStyle = '#3a2a1a'; g.stroke(); }
    g.save(); g.translate(22, -62); g.rotate(-.6 + Math.sin(time * 4.4) * .12); ell(g, -2, -3, 2.2, 5); fillInk(g, C, 1); g.restore();
    g.restore(); g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }
  /* golden jackal — slim, tawny with a dark saddle, big ears (role of the night pack) */
  function jackal(g, p, angry, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const attacking = o.state === 'attack' && Number.isFinite(o.attack) && o.attack >= 0 && o.attack < 1.05, a = attacking ? o.attack : -1;
    const threat = !!angry || attacking || o.state === 'warn';
    const lunge = attacking && a >= .45 && a < .75 ? Math.sin((a - .45) / .3 * Math.PI) : 0, run = o.speed > 115 || o.state === 'chase', loco = moving && !attacking;
    const C = '#c8964e', CD = '#3a2e22', CL = '#f0e2c4', far = '#a07a40';
    const by = (loco ? (run ? -2 * Math.max(0, Math.sin(phase * 2)) : Math.cos(phase * 2) * .5) : 0) + (threat ? 2 : 0), push = lunge * 10;
    const legs = [{ x: -12, far: true, back: true, ph: run ? .1 : .5 }, { x: 12, far: true, back: false, ph: run ? .6 : .25 }, { x: -15, far: false, back: true, ph: 0 }, { x: 15, far: false, back: false, ph: run ? .5 : .75 }];
    const leg = L => { const st = loco ? faunaFoot(phase + L.ph * TAU, run ? 11 : 6, run ? 10 : 5, run ? .42 : .62) : [0, 0]; faunaJoint(g, [L.x + push * .5, by - 26], [L.x + st[0] + (L.back ? 0 : push), st[1] - (L.far ? 1.4 : 0)], 14, 14, L.back ? -1 : 1, L.far ? 2 : 2.5, L.far ? far : C, false); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(push * .6, by);
    g.save(); g.translate(-19, -31); g.rotate(threat ? .7 : .45 + Math.sin(time * 2.5) * .1); smoothPath(g, [[0, 0], [-8, 3], [-15, 10], [-16, 16], [-11, 15], [-5, 8]]); fillInk(g, C, 1.2); g.fillStyle = CD; ell(g, -14, 14, 2.6, 2.4); g.fill(); g.restore();
    shaded(g, () => { g.beginPath(); g.moveTo(-20, -32); g.bezierCurveTo(-18, -42, 12, -43, 19, -36); g.quadraticCurveTo(21, -27, 15, -23); g.quadraticCurveTo(0, -21, -17, -24); g.quadraticCurveTo(-22, -27, -20, -32); g.closePath(); }, C,
      { extra: () => { g.fillStyle = 'rgba(50,40,30,.55)'; g.beginPath(); g.moveTo(-16, -38); g.quadraticCurveTo(0, -46, 14, -38); g.quadraticCurveTo(0, -34, -16, -34); g.fill(); g.fillStyle = CL; ell(g, 0, -23, 15, 2.6); g.fill(); } });
    const hx = 19 + lunge * 5, hy = threat ? -32 : -40;
    shaded(g, () => { g.beginPath(); g.moveTo(hx - 5, hy - 5); g.quadraticCurveTo(hx + 4, hy - 8, hx + 9, hy - 3); g.lineTo(hx + 18, hy + 1); g.quadraticCurveTo(hx + 16, hy + 5, hx + 10, hy + 5); g.quadraticCurveTo(hx, hy + 7, hx - 5, hy + 3); g.closePath(); }, C, { extra: () => { g.fillStyle = CL; ell(g, hx + 10, hy + 3.6, 5, 1.6); g.fill(); } });
    for (const dx of [-3, 2]) { poly(g, [[hx + dx - 3.4, hy - 4], [hx + dx - 1, hy - 16], [hx + dx + 3.4, hy - 4]]); fillInk(g, dx < 0 ? far : C, 1.1); }
    g.fillStyle = INK; ell(g, hx + 17.5, hy + 1, 1.4, 1.1); g.fill();
    dsEye(g, hx + 5, hy - 1.6, { rx: 1.3, ry: 1.7, socket: false, angry: threat });
    if (threat) { g.beginPath(); g.moveTo(hx + 7, hy + 4.4); g.lineTo(hx + 16, hy + 3.6); ink(g, 1); }
    g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }
  /* lion of the desert edge — maned male, tufted tail (role of the last-night predator) */
  function lion(g, p, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const attacking = o.state === 'attack' && Number.isFinite(o.attack) && o.attack >= 0 && o.attack < 1.05, a = attacking ? o.attack : -1;
    const lunge = attacking && a >= .45 && a < .75 ? Math.sin((a - .45) / .3 * Math.PI) : 0, wind = attacking && a < .45 ? Math.sin(Math.min(1, a / .32) * Math.PI / 2) : 0;
    const stalk = o.state === 'stalk' || o.state === 'approach', run = o.speed > 120;
    const C = '#d2a466', CD = '#8a6036', CL = '#f2e2c0', far = '#a88050', MANE = '#7a4a26';
    const by = (moving ? Math.cos(phase * 2) * .6 : Math.sin(time * 1.6) * .3) + wind * 6 + (stalk ? 4 : 0), push = lunge * 14;
    const legs = [{ x: -17, far: true, back: true, ph: run ? .1 : .5 }, { x: 17, far: true, back: false, ph: run ? .6 : .25 }, { x: -21, far: false, back: true, ph: 0 }, { x: 21, far: false, back: false, ph: run ? .5 : .75 }];
    const leg = L => { const st = moving && !attacking ? faunaFoot(phase + L.ph * TAU, run ? 13 : 7.5, run ? 12 : 5.5, run ? .42 : .64) : [0, 0]; faunaJoint(g, [L.x + push * .4, by - 31], [L.x + st[0] + (L.back ? 0 : push), st[1] - (L.far ? 1.5 : 0)], 16, 16, L.back ? -1 : 1, L.far ? 3.2 : 4, L.far ? far : C, false); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(push * .5, by);
    g.save(); g.translate(-28, -38); g.rotate(.5 + Math.sin(time * 1.8) * .2); inkCurve(g, [[0, 0], [-10, 8], [-16, 20], [-12, 28]], 2.4, C, 1.1); smoothPath(g, blobPts(-12, 30, 4, 5, 8, .4, mulberry(5))); fillInk(g, MANE, 1); g.restore();
    shaded(g, () => { g.beginPath(); g.moveTo(-29, -38); g.bezierCurveTo(-28, -52, 18, -54, 26, -44); g.quadraticCurveTo(30, -32, 22, -26); g.quadraticCurveTo(0, -22, -22, -26); g.quadraticCurveTo(-31, -30, -29, -38); g.closePath(); }, C, { extra: () => { g.fillStyle = CL; ell(g, 0, -25, 22, 3.6); g.fill(); }, hatch: [-28, -54, -8, -26], hc: 'rgba(90,60,30,.25)' });
    const hx = 30 + lunge * 6, hy = stalk ? -40 : -48;
    smoothPath(g, blobPts(hx - 4, hy + 2, 18, 19, 18, .32, mulberry(81))); fillInk(g, MANE, 2);
    g.strokeStyle = 'rgba(40,20,10,.45)'; g.lineWidth = 1.2; for (let i = 0; i < 10; i++) { const a2 = i / 10 * TAU; g.beginPath(); g.moveTo(hx - 4 + Math.cos(a2) * 8, hy + 2 + Math.sin(a2) * 8); g.lineTo(hx - 4 + Math.cos(a2) * 16, hy + 2 + Math.sin(a2) * 17); g.stroke(); }
    shaded(g, () => { g.beginPath(); g.moveTo(hx - 8, hy - 5); g.quadraticCurveTo(hx, hy - 11, hx + 9, hy - 6); g.quadraticCurveTo(hx + 16, hy - 2, hx + 16, hy + 3); g.quadraticCurveTo(hx + 10, hy + 9, hx, hy + 8); g.quadraticCurveTo(hx - 9, hy + 5, hx - 8, hy - 5); g.closePath(); }, C, { extra: () => { g.fillStyle = CL; ell(g, hx + 10, hy + 4, 6, 3); g.fill(); } });
    g.fillStyle = '#4a2a1a'; ell(g, hx + 15.5, hy - .5, 2, 1.5); g.fill();
    dsEye(g, hx + 4, hy - 3.5, { rx: 1.5, ry: 1.8, socket: false, angry: stalk || attacking });
    if (attacking || stalk) { g.beginPath(); g.moveTo(hx + 3, hy + 6.6); g.quadraticCurveTo(hx + 9, hy + 9.6, hx + 15, hy + 5); ink(g, 1.3); for (const x of [hx + 6, hx + 11]) { poly(g, [[x, hy + 7], [x + 1, hy + 11], [x + 2, hy + 7]]); g.fillStyle = '#f2ead8'; g.fill(); } }
    g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }

  /* ======================= FLORA ======================= */
  /* date palm: ringed trunk, arching fronds, date clusters (role "pine", size k) */
  function datePalm(g, k, seed) {
    const r = mulberry(seed), h = (190 + r() * 40) * k, lean = (r() - .5) * 40 * k, top = [lean, -h];
    g.fillStyle = 'rgba(80,60,30,.2)'; ell(g, lean * .5, -2, 40 * k, 9 * k); g.fill();
    inkCurve(g, [[0, 0], [lean * .25, -h * .5], top], 9 * k, '#9a7a52', 1.6);
    for (let i = 1; i < 14; i++) { const t = i / 14, x = lean * t * t * .9 + lean * .1 * t, y = -h * t; line(g, [[x - 4.4 * k, y + 2], [x + 4.4 * k, y - 1]], 1.2, 'rgba(70,50,25,.65)'); }
    for (let i = 0; i < 11; i++) { const a = -Math.PI / 2 + (i / 10 - .5) * 3.6, L = (64 + r() * 24) * k, ex = top[0] + Math.cos(a) * L, ey = top[1] + Math.sin(a) * L * .55 + 26 * k;
      g.beginPath(); g.moveTo(top[0], top[1]); g.quadraticCurveTo((top[0] + ex) / 2, top[1] - 20 * k, ex, ey); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke();
      for (let j = 1; j < 9; j++) { const t = j / 9, px = lerp(top[0], ex, t), py = lerp(top[1], ey, t) - Math.sin(t * Math.PI) * 14 * k; line(g, [[px, py], [px + Math.cos(a + 1.2) * 9 * k, py + 6 * k]], 1.6, i % 2 ? '#5a7a3a' : '#6e8c44'); line(g, [[px, py], [px + Math.cos(a - 1.2) * 9 * k, py + 6 * k]], 1.6, i % 2 ? '#4e6e34' : '#628038'); } }
    for (const s of [-1, 1]) { for (let i = 0; i < 9; i++) { ell(g, top[0] + s * (6 + (i % 3) * 3) * k, top[1] + (8 + Math.floor(i / 3) * 4) * k, 2.4 * k, 2.4 * k); fillInk(g, '#c8642a', .5); } }
  }
  /* sycamore fig: wide low crown, figs on the trunk (role "oak") */
  function sycamore(g, v) {
    const r = mulberry(230 + v);
    g.fillStyle = 'rgba(80,60,30,.2)'; ell(g, 0, -2, 70, 13); g.fill();
    inkCurve(g, [[-6, 0], [-10, -40], [0, -70]], 16, '#8a7a5a', 1.8); inkCurve(g, [[0, -60], [-40, -86]], 6, '#8a7a5a', 1.2); inkCurve(g, [[2, -60], [44, -84]], 6, '#8a7a5a', 1.2);
    for (let i = 0; i < 8; i++) { smoothPath(g, blobPts(-66 + i * 19, -100 - Math.sin(i / 7 * Math.PI) * 26, 26, 18, 12, .3, r)); fillInk(g, i % 2 ? '#56763a' : '#4a6a32', 1.8); }
    for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(160,190,90,.5)'; ell(g, -70 + r() * 140, -110 - r() * 40, 3, 2); g.fill(); }
    for (let i = 0; i < 6; i++) { ell(g, -8 + r() * 12, -20 - r() * 40, 2.4, 2.4); fillInk(g, '#c88a5a', .5); }
  }
  /* dead doum palm, forked trunk (role "dead") */
  function deadDoum(g, v) {
    const r = mulberry(330 + v), h = 120 + r() * 30;
    g.fillStyle = 'rgba(80,60,30,.18)'; ell(g, 0, -2, 26, 6); g.fill();
    inkCurve(g, [[0, 0], [2, -h * .5]], 8, '#a08a68', 1.6); inkCurve(g, [[2, -h * .5], [-14, -h * .8], [-20, -h]], 6, '#a08a68', 1.4); inkCurve(g, [[2, -h * .5], [16, -h * .85], [22, -h * .98]], 6, '#a08a68', 1.4);
    for (const [x, y] of [[-20, -h], [22, -h * .98]]) for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i / 4 - .5) * 2.6; line(g, [[x, y], [x + Math.cos(a) * 18, y + Math.sin(a) * 10 + 8]], 1.6, '#8a7450'); }
  }
  /* barley in the floodplain field (role "tuft") */
  function barley(g, picked) {
    g.fillStyle = 'rgba(80,60,30,.16)'; ell(g, 0, -1, 22, 5); g.fill();
    for (let i = 0; i < (picked ? 7 : 12); i++) { const x = (i - 6) * 3.4, h = picked ? 9 : 36 + (i % 4) * 6, lean = (i - 6) * .9;
      line(g, [[x, 0], [x + lean, -h]], 1.3, picked ? '#b8984e' : '#b0a650');
      if (!picked) { ell(g, x + lean + 1, -h - 7, 2.2, 7, lean * .03); fillInk(g, '#e2c66a', .5); for (let k = 0; k < 5; k++) line(g, [[x + lean, -h - 4 - k * 2], [x + lean + 6, -h - 12 - k * 2.4]], .6, '#c8aa58'); } }
  }
  /* grapevine on a pole, black grapes (role "berry") */
  function vine(g, picked, v) {
    const r = mulberry(630 + v);
    g.fillStyle = 'rgba(80,60,30,.18)'; ell(g, 0, -1, 30, 7); g.fill();
    inkLine(g, [[-20, 0], [-20, -44]], 2.4, '#8a6a4a', 1); inkLine(g, [[20, 0], [20, -44]], 2.4, '#8a6a4a', 1); inkLine(g, [[-24, -44], [24, -44]], 2.4, '#8a6a4a', 1);
    inkCurve(g, [[0, 0], [-6, -24], [4, -42]], 3, '#6a4a3a', 1);
    for (let i = 0; i < 9; i++) { smoothPath(g, blobPts(-24 + i * 6, -44 - (i % 2) * 6, 8, 6, 9, .4, r)); fillInk(g, i % 2 ? '#5a7a32' : '#6a8a3a', 1.2); }
    if (!picked) for (const x of [-12, 4, 14]) for (let k = 0; k < 7; k++) { ell(g, x + (k % 3) * 2.6 - 2.6, -36 + Math.floor(k / 3) * 3, 1.8, 1.8); fillInk(g, '#3a2a4a', .5); }
  }
  /* limestone outcrop of the plateau, chisel marks (role "boulder") */
  function quarryStone(g, v, stage) {
    const r = mulberry(740 + v), w = 44 - stage * 10, h = 40 - stage * 11;
    g.fillStyle = 'rgba(80,60,30,.2)'; ell(g, 0, -2, w + 6, 8); g.fill();
    const pts = [[-w, 0], [-w + 4, -h * .8], [-w * .4, -h], [w * .5, -h * 1.05], [w, -h * .6], [w + 2, 0]];
    shaded(g, () => poly(g, pts), '#e6d2a6', { light: '#f4e6c4', lb: [-w * .3, -h * .8, w * .5, h * .3], hatch: [w * .3, -h * 1.1, w + 4, 0], hc: 'rgba(110,80,40,.35)', lw: 2.2 });
    g.strokeStyle = 'rgba(130,100,60,.6)'; g.lineWidth = 1; for (let i = 0; i < 5 - stage; i++) { const x = -w * .6 + r() * w * 1.2, y = -h * .3 - r() * h * .5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 5, y - 2); g.stroke(); }
    if (stage) { line(g, [[-w * .3, -h], [-w * .3, 0]], 1.4, 'rgba(110,80,40,.7)'); }
  }
  /* onion bed (role "carrot") */
  function onion(g) { for (const dx of [-7, 0, 7]) { ell(g, dx, -4, 4.6, 4); fillInk(g, '#e8d0c0', 1); for (const a of [-.2, .1]) line(g, [[dx, -7], [dx + a * 20, -26]], 1.6, '#6a9a4a'); } }
  /* papyrus clump with umbrella heads (role "reeds") — Nile species, taller than era I's */
  function papyrusN(g, v) { const r = mulberry(970 + v); for (let i = 0; i < 9; i++) { const x = (r() - .5) * 28, L = 60 + r() * 30, a = (r() - .5) * .3, tx = x + Math.sin(a) * L, ty = -L; line(g, [[x, 0], [tx, ty]], 1.8, '#5a8a3a'); for (let k = 0; k < 9; k++) { const b = -Math.PI / 2 + (k / 8 - .5) * 2.6; line(g, [[tx, ty], [tx + Math.cos(b) * 10, ty + Math.sin(b) * 8 + 4]], .9, '#7aa04a'); } } }
  /* Nile flowers: blue lotus, white lotus, cornflower, mandrake, chamomile */
  function flower(g, v) {
    if (v < 2) { ell(g, 0, -2, 10, 3); fillInk(g, '#3a7a5a', .8); for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i / 6 - .5) * 2; ell(g, Math.cos(a) * 4, -6 + Math.sin(a) * 6, 1.6, 4, a + Math.PI / 2); fillInk(g, v ? '#f6f4ee' : '#6a8ad8', .5); } return; }
    line(g, [[0, 0], [0, -14]], 1.2, '#5a7a3a');
    if (v === 2) { for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; ell(g, Math.cos(a) * 3.4, -16 + Math.sin(a) * 3.4, 1.6, 2.8, a + Math.PI / 2); fillInk(g, '#4a7ad8', .5); } }
    else if (v === 3) { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ell(g, Math.cos(a) * 3, -15 + Math.sin(a) * 3, 2.4, 1.6, a); fillInk(g, '#e8c04a', .5); } }
    else { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ell(g, Math.cos(a) * 3, -15 + Math.sin(a) * 3, 1.2, 2.4, a + Math.PI / 2); fillInk(g, '#fbfaf2', .4); } ell(g, 0, -15, 1.6, 1.6); fillInk(g, '#f0c030', .4); }
  }
  /* tamarisk bush (role "sapling") */
  function tamarisk(g, picked) { const r = mulberry(420); for (let i = 0; i < 6; i++) { const a = (i / 5 - .5) * 1.4, L = picked ? 12 : 34 + r() * 8; inkCurve(g, [[0, 0], [Math.sin(a) * L * .5, -L * .5], [Math.sin(a) * L, -Math.cos(a) * L]], 1.4, '#8a5a4a', .6); if (!picked) for (let j = 0; j < 6; j++) { g.fillStyle = j % 2 ? '#8aa07a' : '#e4b0c0'; ell(g, Math.sin(a) * L * (.4 + j * .1) + (r() - .5) * 4, -Math.cos(a) * L * (.4 + j * .1), 2.4, 1.6); g.fill(); } } }

  /* ======================= PLACES ======================= */
  /* mastaba tomb: sloping mud-brick and limestone block, false door, a dark shaft entrance (shelter) */
  function mastaba(g) {
    const r = mulberry(86);
    shaded(g, () => poly(g, [[-160, 0], [-140, -140], [140, -140], [160, 0]]), '#e2cc98', { light: '#f2e0b4', lb: [-60, -120, 90, 24], hatch: [80, -142, 162, 0], hc: 'rgba(110,80,40,.38)', lw: 2.6,
      extra: () => { g.strokeStyle = 'rgba(120,90,50,.45)'; g.lineWidth = 1; for (let y = -12, row = 0; y > -140; y -= 12, row++) { g.beginPath(); g.moveTo(-170, y); g.lineTo(170, y); g.stroke(); for (let x = -170 + (row % 2) * 14; x < 170; x += 28) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 12); g.stroke(); } } } });
    shaded(g, () => poly(g, [[-146, -140], [-138, -152], [138, -152], [146, -140]]), '#d4bc86', { lw: 1.8 });
    // false door with the offering table
    shaded(g, () => { g.beginPath(); g.rect(-118, -116, 40, 92); }, '#cdb27a', { lw: 1.6 }); g.beginPath(); g.rect(-108, -100, 20, 76); g.fillStyle = 'rgba(80,60,30,.35)'; g.fill(); ink(g, 1.2);
    g.fillStyle = '#5a3a2a'; for (let i = 0; i < 5; i++) g.fillRect(-114 + i * 7, -112, 3, 6);
    // shaft entrance in the middle
    g.beginPath(); g.moveTo(-50, 0); g.lineTo(-48, -92); g.lineTo(48, -92); g.lineTo(50, 0); g.closePath(); const gr = g.createLinearGradient(0, -92, 0, 0); gr.addColorStop(0, '#120c08'); gr.addColorStop(1, '#3a2a1a'); g.fillStyle = gr; g.fill(); ink(g, 2.2);
    shaded(g, () => { g.beginPath(); g.rect(-60, -104, 120, 14); }, '#efe0b8', { lw: 1.8 });
    for (let i = 0; i < 6; i++) { g.fillStyle = '#3a6aa0'; g.fillRect(-48 + i * 17, -100, 6, 6); }
    for (const [x, y, s] of [[-150, -2, 12], [154, -4, 14]]) { poly(g, blobPts(x, y, s, s * .6, 7, .35, r)); fillInk(g, '#e2cc98', 1.6); }
  }
  /* irrigation basin from the Nile, with a shaduf-less mud bank (role "waterhole") */
  function basin(g) {
    smoothPath(g, blobPts(0, 0, 78, 25, 22, .1, mulberry(96))); fillInk(g, '#7a5a3a', 2);
    smoothPath(g, blobPts(0, 1, 66, 19, 20, .1, mulberry(97))); g.fillStyle = '#3e7a7a'; g.fill(); g.strokeStyle = 'rgba(20,40,40,.6)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = 'rgba(200,230,220,.4)'; ell(g, -12, -3, 24, 5); g.fill();
    for (const [x, y, c] of [[-24, 3, '#6a8ad8'], [18, 6, '#f6f4ee'], [34, -2, '#6a8ad8']]) { ell(g, x, y, 7, 2.4); fillInk(g, '#3a7a5a', .7); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i / 4 - .5) * 1.8; ell(g, x + Math.cos(a) * 3, y - 3 + Math.sin(a) * 3, 1.2, 3, a + Math.PI / 2); fillInk(g, c, .4); } }
    for (const [x, y] of [[-72, -6], [70, -4]]) { g.save(); g.translate(x, y); g.scale(.6, .6); papyrusN(g, 0); g.restore(); }
  }
  /* jackal den in a rocky wadi (role "den") */
  function jackalDen(g) {
    const r = mulberry(992);
    poly(g, [[-70, 0], [-60, -40], [-24, -62], [26, -58], [62, -36], [72, 0]]); fillInk(g, '#d8be8a', 2.2);
    g.strokeStyle = 'rgba(120,90,50,.55)'; g.lineWidth = 1.2; for (const y of [-18, -38]) { g.beginPath(); g.moveTo(-64, y); g.quadraticCurveTo(0, y - 6, 66, y + 2); g.stroke(); }
    g.beginPath(); g.moveTo(-26, 0); g.bezierCurveTo(-28, -26, -10, -36, 4, -36); g.bezierCurveTo(20, -36, 30, -22, 28, 0); g.closePath(); g.fillStyle = '#1c140e'; g.fill(); ink(g, 2);
    for (const [x, y, a] of [[-42, -2, .3], [40, 0, -.4]]) { g.save(); g.translate(x, y); g.rotate(a); inkLine(g, [[-8, 0], [8, 0]], 2.4, '#ece2cc', 1); g.restore(); }
    for (let i = 0; i < 6; i++) { ell(g, -60 + r() * 120, 4 + r() * 4, 2.4, 1.4); g.fillStyle = '#c8a670'; g.fill(); }
  }
  /* ox bones by the field (role "carcass") */
  function oxBones(g) {
    smoothPath(g, blobPts(0, -4, 34, 8, 12, .25, mulberry(449))); g.fillStyle = 'rgba(110,80,40,.3)'; g.fill();
    for (let i = 0; i < 5; i++) { const x = -24 + i * 9; g.beginPath(); g.moveTo(x, -4); g.quadraticCurveTo(x + 4, -18, x + 9, -14); g.lineWidth = 4.2; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.4; g.strokeStyle = '#efe6d2'; g.stroke(); }
    shaded(g, () => { g.beginPath(); g.moveTo(22, -6); g.lineTo(25, -20); g.quadraticCurveTo(32, -24, 40, -20); g.lineTo(42, -8); g.quadraticCurveTo(32, -3, 22, -6); g.closePath(); }, '#efe6d2', {});
    for (const s of [-1, 1]) inkCurve(g, [[32 + s * 7, -20], [32 + s * 14, -30], [32 + s * 10, -36]], 2.6, '#e8dcc0', 1);
  }
  /* copper workshop furnace: clay bowl hearth, reed blowpipes (the era's source of fire) */
  function furnace(g, lit) {
    g.fillStyle = 'rgba(80,60,30,.24)'; ell(g, 0, -1, 42, 10); g.fill();
    shaded(g, () => { g.beginPath(); g.moveTo(-26, 0); g.quadraticCurveTo(-30, -22, -18, -30); g.lineTo(18, -30); g.quadraticCurveTo(30, -22, 26, 0); g.closePath(); }, '#9a6a44', { hatch: [6, -30, 28, 0], hc: 'rgba(60,30,15,.4)', lw: 2 });
    ell(g, 0, -30, 18, 5); g.fillStyle = lit ? '#2a120a' : '#4a3a2a'; g.fill(); ink(g, 1.6);
    if (lit) { g.fillStyle = 'rgba(255,140,40,.6)'; ell(g, 0, -30, 12, 3); g.fill(); }
    for (const s of [-1, 1]) { inkLine(g, [[s * 18, -28], [s * 44, -12]], 2.2, '#c8b07a', .8); ell(g, s * 46, -10, 4, 3); fillInk(g, '#8a6a4a', .8); }
    g.save(); g.translate(40, 2); ell(g, 0, 0, 8, 3); fillInk(g, '#4a6a5a', 1); ell(g, 0, -1, 4, 1.4); g.fillStyle = '#c8783a'; g.fill(); g.restore();
  }
  /* workers' mud-brick house: flat roof, stair, palm-rib awning */
  function mudHouse(g, v) {
    const r = mulberry(1500 + v);
    g.fillStyle = 'rgba(80,60,30,.22)'; ell(g, 0, -1, 86, 15); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-70, -96, 140, 96); }, '#b88a5a', { light: '#c99a68', lb: [-30, -80, 50, 30], hatch: [30, -96, 70, 0], hc: 'rgba(70,40,20,.38)', lw: 2.4, extra: () => { g.strokeStyle = 'rgba(80,50,25,.35)'; g.lineWidth = 1; for (let y = -88, row = 0; y < 0; y += 8, row++) { g.beginPath(); g.moveTo(-72, y); g.lineTo(72, y); g.stroke(); for (let x = -72 + (row % 2) * 9; x < 72; x += 18) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 8); g.stroke(); } } } });
    shaded(g, () => { g.beginPath(); g.rect(-74, -104, 148, 10); }, '#a87a4a', { lw: 1.8 });
    g.beginPath(); g.moveTo(-12, 0); g.lineTo(-12, -46); g.quadraticCurveTo(0, -54, 12, -46); g.lineTo(12, 0); g.closePath(); g.fillStyle = '#2a1a12'; g.fill(); ink(g, 1.8);
    g.fillStyle = '#2a1a12'; g.fillRect(-52, -76, 14, 8); g.fillRect(36, -76, 14, 8);
    for (let i = 0; i < 4; i++) { shaded(g, () => { g.beginPath(); g.rect(76 - i * 3, -i * 20 - 20, 18, 20); }, '#b88a5a', { lw: 1.4 }); }
    if (v % 2 === 0) { for (const x of [-60, -30, 0]) inkLine(g, [[x, -104], [x + 6, -132]], 2, '#8a6a4a', .8); shaded(g, () => poly(g, [[-66, -128], [10, -138], [12, -128], [-64, -120]]), '#c8b080', { lw: 1.6 }); }
    for (let i = 0; i < 3; i++) { ell(g, -40 + i * 26, -108, 9, 4); fillInk(g, '#c8a060', 1); }
  }
  /* beehive granaries on a platform */
  function granary(g) {
    g.fillStyle = 'rgba(80,60,30,.22)'; ell(g, 0, -1, 80, 14); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-76, -16, 152, 16); }, '#a87a4a', { lw: 2 });
    for (const [x, s] of [[-46, 1], [0, 1.15], [46, 1]]) { shaded(g, () => { g.beginPath(); g.moveTo(x - 24 * s, -16); g.quadraticCurveTo(x - 26 * s, -90 * s, x, -100 * s); g.quadraticCurveTo(x + 26 * s, -90 * s, x + 24 * s, -16); g.closePath(); }, '#c99a68', { hatch: [x, -100 * s, x + 26 * s, -16], hc: 'rgba(80,50,25,.38)', lw: 2 }); g.beginPath(); g.rect(x - 5, -60 * s, 10, 12); g.fillStyle = '#2a1a12'; g.fill(); ink(g, 1); }
  }
  /* a limestone block on a sledge with its hauling ropes */
  function sledge(g) {
    g.fillStyle = 'rgba(80,60,30,.22)'; ell(g, 0, -1, 70, 12); g.fill();
    inkLine(g, [[-62, -4], [60, -4]], 4, '#8a6a4a', 1.2); inkCurve(g, [[60, -4], [68, -8], [70, -14]], 4, '#8a6a4a', 1.2);
    for (const x of [-48, -16, 16, 48]) inkLine(g, [[x, -4], [x, -12]], 3, '#8a6a4a', 1);
    shaded(g, () => { g.beginPath(); g.rect(-56, -62, 112, 50); }, '#efe0b8', { hatch: [20, -62, 56, -12], hc: 'rgba(110,80,40,.35)', lw: 2.2 });
    for (const y of [-20, -54]) inkCurve(g, [[-60, y], [0, y + 4], [60, y]], 1.6, '#c8a064', .6);
    for (const dy of [-6, 0]) inkCurve(g, [[70, -14 + dy], [120, -20 + dy], [170, -16 + dy]], 1.6, '#c8a064', .6);
  }

  /* ======================= GROUND ======================= */
  function ground(g, o) {
    const { x0, y0, CH, land, fbm, seed, rng } = o;
    // floodplain fields in long strips with irrigation ditches
    for (let s = 0; s < 3; s++) { const px = rng() * CH, py = rng() * CH; if (land(px, py) !== 1) continue; g.save(); g.translate(px, py); g.rotate(.05 + (rng() - .5) * .1);
      for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? 'rgba(160,170,80,.35)' : 'rgba(110,140,60,.35)'; g.fillRect(-90, i * 12 - 36, 180, 11); } g.strokeStyle = 'rgba(60,110,120,.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-96, 38); g.lineTo(96, 38); g.stroke(); g.restore(); }
    g.lineCap = 'round';
    for (let k = 0; k < 560; k++) {
      const px = rng() * CH, py = rng() * CH, b = land(px, py); if (!b) continue;
      if (b === 1) { g.strokeStyle = rng() < .5 ? 'rgba(90,120,50,.5)' : 'rgba(170,160,90,.45)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (rng() - .5) * 2, py - 4 - rng() * 4); g.stroke(); }
      else if (b === 2) { if (rng() < .12) { g.strokeStyle = 'rgba(120,100,60,.6)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + 8, py - 4, px + 16, py - 1); g.stroke(); } else { g.fillStyle = rng() < .5 ? 'rgba(70,60,40,.35)' : 'rgba(110,130,60,.35)'; ell(g, px, py, 2, 1.4); g.fill(); } }
      else if (b === 3) { if (rng() < .3) { g.strokeStyle = rng() < .5 ? 'rgba(180,140,80,.45)' : 'rgba(250,230,180,.5)'; g.lineWidth = 1.2; g.beginPath(); g.arc(px, py, 10 + rng() * 18, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } else if (rng() < .3) { ell(g, px, py, 1.6 + rng() * 2.6, 1 + rng() * 1.4); g.fillStyle = rng() < .6 ? 'rgba(250,240,220,.8)' : 'rgba(180,150,100,.6)'; g.fill(); } }
      else if (b === 4) { if (rng() < .05) { ell(g, px, py, 12 + rng() * 18, 3 + rng() * 5); g.fillStyle = 'rgba(60,110,110,.6)'; g.fill(); } else { g.strokeStyle = rng() < .6 ? 'rgba(80,130,60,.55)' : 'rgba(150,170,70,.45)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (rng() - .5) * 3, py - 7 - rng() * 5); g.stroke(); } }
    }
  }
  const BCOL = [[148, 146, 82], [96, 104, 62], [222, 196, 142], [96, 128, 92]];

  return {
    ground, bcol: BCOL,
    heir: meret, mobs: { antelope: gazelle, hyena: jackal, machairodont: lion },
    flora: { pine: datePalm, oak: sycamore, dead: deadDoum, tuft: barley, berry: vine, boulder: quarryStone, carrot: onion, reeds: papyrusN, flower, sapling: tamarisk },
    places: { cave: mastaba, waterhole: basin, den: jackalDen, carcass: oxBones, source: furnace, mudHouse, granary, sledge }
  };
})();

(function(){const {TAU,INK,ell,ink,fillInk,poly,smoothPath,blobPts,line,curve,inkLine,inkCurve,lineageMark,mulberry,vnoise,lerp}=BRAISE_ART.K;const burningTree=function(){};
/* BRAISE — Les lieux de la lignée. One landmark per era, drawn as large ink set pieces.
   Each function draws with its base centred on (0,0), y up negative.
   Requires ink.js (ell, ink, fillInk, poly, smoothPath, blobPts, line, inkLine, inkCurve, lineageMark, mulberry, vnoise, lerp, TAU, INK)
   and era1.js (burningTree) for the Olduvai scene. */
window.BraiseLandmarkSets = (() => {
  const R = s => mulberry(s);
  /* pen hatching with a ragged leading edge, like strokes laid by hand */
  function rag(g, x0, y0, x1, y1, col, sp, seed) {
    const r = R(seed || 5), h = y1 - y0, k = .62; g.strokeStyle = col || 'rgba(30,20,12,.38)'; g.lineWidth = 1; g.lineCap = 'round'; g.beginPath();
    for (let x = x0 - h * k; x < x1; x += (sp || 3.4)) { const xs = x0 + r() * 26, a = Math.max(0, (xs - x) / (h * k)), b = Math.min(1, (x1 - x) / (h * k)); if (a >= b) continue; const len = b - (r() * .12); g.moveTo(x + h * k * a, y1 - h * a); g.lineTo(x + h * k * len, y1 - h * len); }
    g.stroke();
  }
  /* fill + optional ragged hatch box + ink outline */
  function sh(g, fn, fill, o) {
    o = o || {}; fn(); g.fillStyle = fill; g.fill();
    if (o.hatch || o.extra) { g.save(); fn(); g.clip(); if (o.hatch) rag(g, o.hatch[0], o.hatch[1], o.hatch[2], o.hatch[3], o.hc, o.sp, o.seed); if (o.extra) o.extra(); g.restore(); }
    if (o.lw !== 0) { fn(); ink(g, o.lw || 2.2); }
  }
  const block = (g, x, y, w, h, col, lw) => { g.beginPath(); g.rect(x, y, w, h); fillInk(g, col, lw || 1.6); };
  const cloud = (g, x, y, s, a) => { g.save(); g.globalAlpha = a == null ? .9 : a; for (let i = 0; i < 5; i++) { ell(g, x + (i - 2) * 16 * s, y - Math.sin(i / 4 * Math.PI) * 9 * s, 18 * s, 11 * s); g.fillStyle = '#f3ead6'; g.fill(); } g.restore(); };

  /* I · Olduvai gorge under Kilimanjaro (broad flat-topped Kibo, jagged Mawenzi) */
  function olduvai(g, t) {
    t = t || 0;
    const mt = () => { g.beginPath(); g.moveTo(-330, -40); g.quadraticCurveTo(-230, -90, -150, -150); g.quadraticCurveTo(-110, -182, -60, -192); g.lineTo(40, -194); g.quadraticCurveTo(80, -186, 110, -164); g.lineTo(150, -168); g.lineTo(166, -186); g.lineTo(180, -170); g.lineTo(194, -182); g.lineTo(206, -160); g.quadraticCurveTo(260, -110, 330, -46); g.closePath(); };
    sh(g, mt, '#8f8ba3', { hatch: [60, -196, 330, -40], hc: 'rgba(40,35,60,.28)', lw: 2 });
    const snow = () => { g.beginPath(); g.moveTo(-96, -180); g.quadraticCurveTo(-70, -192, -60, -192); g.lineTo(40, -194); g.quadraticCurveTo(70, -188, 92, -174); g.lineTo(76, -170); g.lineTo(64, -180); g.lineTo(48, -168); g.lineTo(30, -182); g.lineTo(12, -166); g.lineTo(-6, -182); g.lineTo(-26, -170); g.lineTo(-44, -184); g.lineTo(-62, -170); g.lineTo(-78, -182); g.closePath(); };
    sh(g, snow, '#f2efe8', { hatch: [10, -196, 96, -164], hc: 'rgba(100,110,140,.35)', lw: 1.8 });
    poly(g, [[160, -178], [166, -186], [172, -176]]); fillInk(g, '#f2efe8', 1.2);
    cloud(g, -170 + Math.sin(t * .1) * 20, -140, 1.2, .85); cloud(g, 200 + Math.sin(t * .08 + 2) * 18, -122, 1, .8); cloud(g, -10 + Math.sin(t * .06 + 4) * 30, -206, .8, .7);
    g.beginPath(); g.rect(-340, -42, 680, 46); g.fillStyle = '#c9a85a'; g.fill();
    for (const [x, s] of [[-270, .55], [-140, .4], [200, .5], [270, .35], [120, .3]]) { g.save(); g.translate(x, -40); g.scale(s, s); acaciaSil(g); g.restore(); }
    // stratified gorge walls
    const bands = ['#b8673a', '#d9a066', '#9c4f2c', '#e0b878', '#a85a34'];
    for (const side of [-1, 1]) {
      const edge = (i, off) => { const pts = []; for (let x = 340; x >= 46; x -= 14) pts.push([side * x, -38 + i * 7.5 + off + Math.sin(x * .07 + i) * 2.4 + (x < 110 ? (110 - x) * .45 : 0)]); return pts; };
      for (let i = 0; i < bands.length; i++) { const a = edge(i, 0), b = edge(i, 8).reverse(); g.beginPath(); g.moveTo(a[0][0], a[0][1]); for (const p of a) g.lineTo(p[0], p[1]); for (const p of b) g.lineTo(p[0], p[1]); g.closePath(); g.fillStyle = bands[i]; g.fill(); }
      const top = edge(0, 0); g.beginPath(); g.moveTo(top[0][0], top[0][1]); for (const p of top) g.lineTo(p[0], p[1]); ink(g, 2.2);
      g.save(); g.beginPath(); for (const p of top) g.lineTo(p[0], p[1]); const bot = edge(4, 8).reverse(); for (const p of bot) g.lineTo(p[0], p[1]); g.closePath(); g.clip(); rag(g, side > 0 ? 46 : -340, -40, side > 0 ? 340 : -46, 30, 'rgba(60,25,10,.25)', 5, 3); g.restore();
    }
    g.beginPath(); g.moveTo(-70, 16); g.quadraticCurveTo(0, -6, 70, 16); g.closePath(); g.fillStyle = '#8a5a34'; g.fill();
    g.save(); g.translate(0, 2); g.scale(.62, .62); burningTree(g, t, false); g.restore();
  }
  function acaciaSil(g) { line(g, [[0, 0], [-2, -40], [-18, -62]], 5, '#4a3c2c'); line(g, [[-2, -40], [14, -66]], 4, '#4a3c2c'); ell(g, -2, -70, 44, 8); g.fillStyle = '#5e6634'; g.fill(); ell(g, 4, -76, 30, 6); g.fill(); }

  /* II · Lascaux — the painted wall, lit by a torch */
  function lascaux(g, t) {
    t = t || 0;
    const wall = () => { g.beginPath(); g.moveTo(-420, 10); g.lineTo(-420, -120); g.bezierCurveTo(-360, -230, -220, -250, -60, -250); g.bezierCurveTo(120, -252, 300, -232, 420, -170); g.lineTo(420, 10); g.closePath(); };
    sh(g, wall, '#cdb48c', { hatch: [180, -260, 430, 10], hc: 'rgba(60,40,20,.2)', sp: 4, lw: 2.6 });
    g.strokeStyle = 'rgba(90,65,40,.38)'; g.lineWidth = 1.2; const r = R(31); for (let i = 0; i < 16; i++) { g.beginPath(); const x = -380 + r() * 760, y = -40 - r() * 180; g.arc(x, y, 14 + r() * 26, Math.PI * 1.1, Math.PI * 1.7); g.stroke(); }
    g.save(); g.globalCompositeOperation = 'multiply'; const fl = .86 + Math.sin(t * 9) * .05 + vnoise(t * 4, 1, 3) * .1; const gr = g.createRadialGradient(-60, -70, 20, -60, -70, 420 * fl); gr.addColorStop(0, 'rgba(255,222,175,1)'); gr.addColorStop(1, 'rgba(110,72,52,1)'); g.fillStyle = gr; wall(); g.fill(); g.restore();
    aurochs(g, -170, -160, 1.25); horse(g, 40, -180, .95, '#2a1d16'); horse(g, 130, -122, .8, '#9c3a20'); stag(g, -40, -98, .9); horse(g, 250, -186, .7, '#b5452b'); aurochs(g, 330, -110, .7);
    g.fillStyle = '#2a1d16'; for (let i = 0; i < 9; i++) { ell(g, 180 + i * 9, -64 + Math.sin(i) * 4, 2.6, 2.6); g.fill(); }
    for (const [x, y, a] of [[-320, -96, -.2], [-286, -62, .15], [300, -50, .1]]) handStencil(g, x, y, a);
    for (let i = 0; i < 13; i++) { poly(g, blobPts(-400 + i * 66 + r() * 20, 2, 12 + r() * 8, 7, 7, .35, r)); fillInk(g, '#a8957a', 1.5); }
  }
  function aurochs(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = 'rgba(30,20,14,.85)'; g.beginPath(); g.moveTo(-70, 0); g.bezierCurveTo(-74, -30, -40, -40, -10, -36); g.bezierCurveTo(20, -44, 50, -40, 64, -22); g.lineTo(80, -24); g.quadraticCurveTo(84, -12, 70, -8); g.quadraticCurveTo(50, 6, 30, 4); g.lineTo(28, 30); g.lineTo(20, 30); g.lineTo(16, 8); g.lineTo(-40, 8); g.lineTo(-46, 30); g.lineTo(-54, 30); g.lineTo(-56, 6); g.closePath(); g.fill(); g.strokeStyle = 'rgba(30,20,14,.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(70, -26); g.quadraticCurveTo(76, -46, 90, -48); g.moveTo(66, -26); g.quadraticCurveTo(64, -50, 52, -56); g.stroke(); g.fillStyle = 'rgba(181,69,43,.55)'; ell(g, -10, -14, 30, 12); g.fill(); g.restore(); }
  function horse(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.globalAlpha = .82; g.beginPath(); g.moveTo(-50, 0); g.bezierCurveTo(-52, -26, -20, -30, 10, -28); g.quadraticCurveTo(30, -46, 46, -48); g.quadraticCurveTo(58, -44, 56, -34); g.quadraticCurveTo(44, -32, 38, -20); g.quadraticCurveTo(30, 0, 20, 4); g.lineTo(18, 26); g.lineTo(12, 26); g.lineTo(8, 6); g.lineTo(-30, 6); g.lineTo(-36, 26); g.lineTo(-42, 26); g.lineTo(-44, 4); g.quadraticCurveTo(-60, 0, -64, 14); g.quadraticCurveTo(-60, -4, -50, 0); g.closePath(); g.fill(); g.globalAlpha = 1; g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < 6; i++) { g.moveTo(14 + i * 5, -34 - i * 2.4); g.lineTo(20 + i * 5, -42 - i * 2); } g.stroke(); g.restore(); }
  function stag(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#2a1d16'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-36, 0); g.quadraticCurveTo(0, -14, 30, -6); g.lineTo(42, -26); g.moveTo(-30, 0); g.lineTo(-32, 24); g.moveTo(-20, 2); g.lineTo(-18, 24); g.moveTo(20, -2); g.lineTo(22, 24); g.moveTo(28, -4); g.lineTo(32, 24); g.moveTo(42, -26); g.lineTo(54, -22); g.stroke(); g.lineWidth = 1.8; g.beginPath(); for (const sd of [-1, 1]) { g.moveTo(42, -28); g.quadraticCurveTo(36 + sd * 8, -50, 30 + sd * 16, -64); for (let k = 0; k < 3; k++) { const yy = -40 - k * 8; g.moveTo(38 + sd * (4 + k * 3), yy); g.lineTo(30 + sd * (10 + k * 4), yy - 6); } } g.stroke(); g.restore(); }
  function handStencil(g, x, y, a) { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = 'rgba(181,69,43,.4)'; ell(g, 0, 0, 30, 34); g.fill(); g.fillStyle = '#e8d6b0'; ell(g, 0, 6, 10, 12); g.fill(); for (let i = 0; i < 4; i++) { ell(g, -7 + i * 4.6, -12 - (i === 1 || i === 2 ? 4 : 0), 2.2, 9); g.fill(); } ell(g, 11, 2, 2.2, 7, -.8); g.fill(); g.restore(); }

  /* III · Stonehenge at the solstice */
  function stonehenge(g, t) {
    const r = R(51); g.fillStyle = 'rgba(27,22,18,.15)'; ell(g, 0, -6, 300, 40); g.fill();
    const sarsen = (x, y, w, h, tilt, col) => { g.save(); g.translate(x, y); g.rotate(tilt || 0); const p = () => { g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(-w / 2 + 2, -h); g.quadraticCurveTo(0, -h - 4, w / 2 - 2, -h); g.lineTo(w / 2, 0); g.closePath(); }; sh(g, p, col || '#a8a49a', { hatch: [0, -h - 4, w / 2 + 2, 2], hc: 'rgba(25,25,25,.4)', seed: x | 0 }); g.fillStyle = 'rgba(160,170,90,.55)'; for (let i = 0; i < 3; i++) { ell(g, (r() - .5) * w * .7, -r() * h, 3 + r() * 3, 2 + r() * 2); g.fill(); } g.strokeStyle = 'rgba(40,40,40,.35)'; g.lineWidth = .9; g.beginPath(); g.moveTo(-w * .2, -h * .2); g.lineTo(-w * .15, -h * .8); g.stroke(); g.restore(); };
    const lintel = (x0, x1, y, h) => sh(g, () => { g.beginPath(); g.moveTo(x0 - 3, y); g.lineTo(x0 - 1, y - h); g.lineTo(x1 + 1, y - h); g.lineTo(x1 + 3, y); g.closePath(); }, '#b4b0a5', { hatch: [x0, y - h, x1, y], hc: 'rgba(25,25,25,.3)', seed: x0 | 0 });
    // the rising sun between the great trilithon
    g.save(); g.globalCompositeOperation = 'lighter'; const sun = g.createRadialGradient(0, -90, 4, 0, -90, 140); sun.addColorStop(0, 'rgba(255,230,170,.9)'); sun.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = sun; g.fillRect(-160, -240, 320, 240); g.restore();
    for (let i = 0; i < 9; i++) sarsen(-200 + i * 50, -36, 22, 60, 0, '#99958c'); lintel(-212, 212, -96, 10);
    for (const [x, y, h] of [[-112, -12, 92], [-72, -12, 92], [72, -12, 100], [112, -12, 100], [-22, -22, 116], [22, -22, 116]]) sarsen(x, y, 30, h);
    lintel(-128, -56, -104, 14); lintel(56, 128, -112, 14); lintel(-38, 38, -138, 16);
    for (let i = 0; i < 8; i++) { if (i === 3) continue; sarsen(-245 + i * 70, 8, 26, 72); }
    lintel(-258, -162, -64, 12); lintel(150, 250, -64, 12);
    g.save(); g.translate(-30, 10); g.rotate(-.1); sh(g, () => { g.beginPath(); g.moveTo(-50, 0); g.lineTo(-48, -20); g.lineTo(50, -22); g.lineTo(52, 0); g.closePath(); }, '#a8a49a', { hatch: [-50, -22, 52, 2] }); g.restore();
    sarsen(272, 12, 34, 56, .18, '#9c9284'); for (let i = 0; i < 7; i++) sarsen(-150 + i * 50, 18, 12, 22, 0, '#7f8aa0');
  }

  /* IV · Giza — pyramids, the Sphinx, palms of the Nile (building = top unfinished, ramp) */
  function giza(g, t, building) {
    const duneTop = () => { g.moveTo(-420, -4); g.quadraticCurveTo(-200, -26, -60, -12); g.quadraticCurveTo(120, 2, 420, -18); };
    g.beginPath(); duneTop(); g.lineTo(420, 20); g.lineTo(-420, 20); g.closePath(); g.fillStyle = '#e2c690'; g.fill(); g.beginPath(); duneTop(); ink(g, 2);
    const pyr = (x, s, casing, unfinished) => {
      g.save(); g.translate(x, 0); g.scale(s, s);
      g.save(); if (unfinished) { g.beginPath(); g.rect(-200, -100, 400, 120); g.clip(); }
      sh(g, () => poly(g, [[-120, 0], [0, -150], [0, 0]]), '#dcc088', { lw: 0 });
      sh(g, () => poly(g, [[0, -150], [100, 0], [0, 0]]), '#b48e58', { hatch: [0, -150, 100, 0], hc: 'rgba(70,40,15,.45)', lw: 0, seed: x | 0 });
      g.save(); poly(g, [[-120, 0], [0, -150], [100, 0]]); g.clip(); g.strokeStyle = 'rgba(80,55,25,.32)'; g.lineWidth = .9;
      for (let y = -6; y > -150; y -= 6) { g.beginPath(); g.moveTo(-130, y); g.lineTo(110, y); g.stroke(); for (let xx = -130 + (y % 12 ? 0 : 6); xx < 110; xx += 12) { g.beginPath(); g.moveTo(xx, y); g.lineTo(xx, y + 6); g.stroke(); } } g.restore();
      if (casing) { poly(g, [[-22, -122], [0, -150], [19, -126]]); fillInk(g, '#f1e6c8', 1.4); }
      if (unfinished) { poly(g, [[-120, 0], [-40, -100], [33, -100], [100, 0]]); ink(g, 2.4); line(g, [[0, -100], [0, 0]], 1.6, INK); } else { poly(g, [[-120, 0], [0, -150], [100, 0]]); ink(g, 2.4); line(g, [[0, -150], [0, 0]], 1.6, INK); }
      g.restore();
      if (unfinished) {
        sh(g, () => { g.beginPath(); g.moveTo(-190, 0); g.lineTo(-40, -100); g.lineTo(-14, -100); g.lineTo(-150, 0); g.closePath(); }, '#c7a56e', { hatch: [-190, -100, -14, 0], hc: 'rgba(70,40,15,.35)' });
        for (let i = 0; i < 6; i++) { const k = i / 6, xx = lerp(-168, -40, k), yy = lerp(-12, -96, k); block(g, xx - 6, yy - 8, 12, 8, '#e2cc98', 1.2); }
        for (const xx of [-22, 0, 22]) line(g, [[xx, -100], [xx, -120]], 1.6, '#6a4a2a'); line(g, [[-26, -116], [26, -116]], 1.4, '#6a4a2a');
        poly(g, [[-6, -126], [0, -138], [6, -126]]); fillInk(g, '#f6e2a0', 1.2); // the golden capstone waiting
      }
      g.restore();
    };
    for (const xx of [270, 300, 328]) pyr(xx, .16, false);
    pyr(-230, .55, false); pyr(160, .86, true); pyr(-40, 1.08, false, !!building);
    sphinx(g, 78, 30, 1.05);
    for (const [xx, s] of [[-330, .85], [-298, .62], [340, .75], [370, .55]]) palm(g, xx, 14, s);
  }
  function sphinx(g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    sh(g, () => { g.beginPath(); g.moveTo(-104, 0); g.quadraticCurveTo(-108, -22, -88, -30); g.quadraticCurveTo(-40, -36, 4, -34); g.lineTo(18, -30); g.lineTo(18, 0); g.closePath(); }, '#c9a46c', { hatch: [-104, -36, 18, 2], hc: 'rgba(70,40,15,.38)' });
    inkCurve(g, [[-104, -10], [-118, -14], [-116, -2]], 3, '#c9a46c', 1.4);
    for (const [px, w] of [[14, 46], [20, 40]]) sh(g, () => { g.beginPath(); g.moveTo(px, -12); g.lineTo(px + w, -12); g.quadraticCurveTo(px + w + 6, -6, px + w, 0); g.lineTo(px, 0); g.closePath(); }, '#cfab72', { lw: 1.6 });
    // nemes headdress with stripes, face, beard-less, broken nose
    const head = () => { g.beginPath(); g.moveTo(-12, -32); g.lineTo(-16, -60); g.quadraticCurveTo(-4, -84, 16, -80); g.quadraticCurveTo(30, -70, 30, -56); g.lineTo(36, -32); g.closePath(); };
    sh(g, head, '#d6b27c', { extra: () => { g.strokeStyle = 'rgba(70,90,140,.5)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(-18 + i * 6, -86); g.lineTo(-16 + i * 6, -30); g.stroke(); } } });
    sh(g, () => { g.beginPath(); g.moveTo(4, -70); g.quadraticCurveTo(22, -72, 26, -60); g.lineTo(28, -44); g.quadraticCurveTo(22, -36, 12, -38); g.lineTo(6, -46); g.closePath(); }, '#e2c08a', { lw: 1.8 });
    ell(g, 17, -60, 3.2, 2.2); g.fillStyle = INK; g.fill(); line(g, [[13, -63], [21, -64]], 1.6, INK);
    line(g, [[27, -54], [29, -50], [26, -49]], 1.4, INK); line(g, [[18, -44], [24, -45]], 1.6, INK);
    g.restore();
  }
  function palm(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); inkCurve(g, [[0, 0], [4, -40], [-2, -80]], 5, '#7a5a3a', 1.6); for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i / 6 - .5) * 2.8; g.beginPath(); g.moveTo(-2, -80); g.quadraticCurveTo(-2 + Math.cos(a) * 20, -84 + Math.sin(a) * 18, -2 + Math.cos(a) * 34, -76 + Math.sin(a) * 14); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3.4; g.strokeStyle = '#5f7a34'; g.stroke(); } g.restore(); }

  /* V · Rome — the Colosseum in its prime, 80 AD */
  function colosseum(g, t) {
    const W = 270, tiers = [44, 42, 42, 34], sag = 26;
    g.fillStyle = 'rgba(27,22,18,.15)'; ell(g, 0, 6, 296, 30); g.fill();
    // far inner wall and cavea seen above the front façade
    const topY = -tiers.reduce((a, b) => a + b, 0);
    sh(g, () => { g.beginPath(); g.ellipse(0, topY, W, 40, 0, Math.PI, 0); g.lineTo(W, topY + 2); g.ellipse(0, topY + 8, W - 22, 30, 0, 0, Math.PI, true); g.closePath(); }, '#b39c74', { hatch: [60, topY - 42, W, topY + 10], hc: 'rgba(60,40,20,.3)' });
    g.save(); g.beginPath(); g.ellipse(0, topY + 8, W - 22, 30, 0, Math.PI, 0); g.closePath(); g.clip(); g.fillStyle = '#9c8662'; g.fillRect(-W, topY - 30, 2 * W, 40); g.strokeStyle = 'rgba(40,28,14,.5)'; g.lineWidth = 1; for (let k = 1; k < 6; k++) { g.beginPath(); g.ellipse(0, topY + 8 + k * 4, W - 22 - k * 16, 30 - k * 3, 0, Math.PI, 0); g.stroke(); } g.restore();
    let y = 0; const orders = ['tuscan', 'ionic', 'corinthian', 'attic'];
    tiers.forEach((h, k) => {
      const yTop = y - h;
      const band = () => { g.beginPath(); g.moveTo(-W, yTop); g.quadraticCurveTo(0, yTop + sag, W, yTop); g.lineTo(W, y); g.quadraticCurveTo(0, y + sag, -W, y); g.closePath(); };
      sh(g, band, k === 3 ? '#cdb58a' : '#d8c296', { hatch: [W * .35, yTop - 6, W + 4, y + sag], hc: 'rgba(70,45,20,.36)', seed: k + 3, lw: 0 });
      const n = 16;
      for (let i = 0; i < n; i++) {
        const u = -1 + (i + .5) / n * 2, x = u * W * .985, curve = (1 - u * u) * sag, w = (2 * W / n) * (1 - Math.abs(u) * .45) * .62;
        if (orders[k] === 'attic') { if (i % 2 === 0) block(g, x - w * .22, yTop + curve + 12, w * .44, 10, '#3d342a', 1.1); }
        else { const ah = h - 12, ay = y + curve - 3; g.beginPath(); g.moveTo(x - w / 2, ay); g.lineTo(x - w / 2, ay - ah + w / 2); g.arc(x, ay - ah + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w / 2, ay); g.closePath(); fillInk(g, '#3d342a', 1.4);
          if (k > 0) { ell(g, x, ay - 8, w * .16, 7); fillInk(g, '#e6dcc4', .9); ell(g, x, ay - 17, w * .12, 3); fillInk(g, '#e6dcc4', .8); }
          const cx = x + (2 * W / n) * (1 - Math.abs(u) * .45) * .5; if (i < n - 1) line(g, [[cx, y + (1 - u * u) * sag - 2], [cx, yTop + curve + 4]], 2.4, k === 2 ? '#efe0be' : '#e5d3ac'); }
      }
      band(); ink(g, 2); y = yTop;
    });
    for (let i = 0; i < 12; i++) { const u = -1 + (i + .5) / 12 * 2, x = u * W * .97, cy = y + (1 - u * u) * sag; line(g, [[x, cy], [x, cy - 16]], 1.6, '#5a4632'); }
    // little banners
    for (const u of [-.5, 0, .5]) { const x = u * W, cy = y + (1 - u * u) * sag - 16; poly(g, [[x, cy], [x + 10, cy + 3], [x, cy + 6]]); fillInk(g, '#a8322e', .8); }
  }

  /* VI · Notre-Dame de Paris, about 1250 (building = south tower in scaffolding, no flèche yet) */
  function notreDame(g, t, building) {
    const S = '#d3c09c', S2 = '#c3ae88', DK = '#2c2e30';
    const W = 120, Hp = 92, Hk = 112, Hr = 206, Hg = 232, Ht = 330; // portals, kings, rose level top, gallery top, towers top
    // nave + flying buttresses behind, to the right
    sh(g, () => poly(g, [[W, -Hr + 20], [W + 30, -Hr - 6], [W + 210, -Hr - 6], [W + 236, -Hr + 20]]), '#5d6870', { hatch: [W, -Hr - 6, W + 236, -Hr + 20], hc: 'rgba(10,15,20,.4)' });
    sh(g, () => { g.beginPath(); g.rect(W, -Hr + 20, 230, Hr - 20); }, '#bba887', { hatch: [W, -Hr + 20, W + 230, 0], hc: 'rgba(60,45,25,.3)' });
    for (let i = 0; i < 5; i++) { const x = W + 26 + i * 44; g.beginPath(); g.moveTo(x - 7, -40); g.lineTo(x - 7, -120); g.quadraticCurveTo(x, -132, x + 7, -120); g.lineTo(x + 7, -40); g.closePath(); fillInk(g, '#3a4a6a', 1.3); inkCurve(g, [[x + 20, -10], [x + 30, -100], [x + 8, -160]], 3, S2, 1.2); }
    if (!building) { line(g, [[W + 120, -Hr - 6], [W + 120, -Hr - 90]], 3, '#4a4f55'); poly(g, [[W + 113, -Hr - 66], [W + 120, -Hr - 104], [W + 127, -Hr - 66]]); fillInk(g, '#5d6870', 1.4); }
    // main façade block
    sh(g, () => { g.beginPath(); g.rect(-W, -Hg, 2 * W, Hg); }, S, { hatch: [W * .35, -Hg, W, 0], hc: 'rgba(60,45,25,.3)' });
    // towers
    const tower = (cx, scaf) => {
      const w = 80, x = cx - w / 2;
      sh(g, () => { g.beginPath(); g.rect(x, -Ht, w, Ht - Hg + 2); }, S, { hatch: [cx + 4, -Ht, x + w, -Hg], hc: 'rgba(60,45,25,.33)', seed: cx | 0 });
      for (let j = 0; j < 2; j++) { const xx = x + 22 + j * 36, top = -Ht + 22; g.beginPath(); g.moveTo(xx - 11, -Hg - 6); g.lineTo(xx - 11, top + 16); g.quadraticCurveTo(xx, top, xx + 11, top + 16); g.lineTo(xx + 11, -Hg - 6); g.closePath(); fillInk(g, DK, 1.6); for (let k = 0; k < 9; k++) line(g, [[xx - 10, top + 22 + k * 7], [xx + 10, top + 25 + k * 7]], 1.2, '#7a7062'); }
      block(g, x - 4, -Ht - 8, w + 8, 8, '#d9c8a4'); for (let k = 0; k < 8; k++) block(g, x - 2 + k * (w + 4) / 8, -Ht - 15, 6, 7, '#d9c8a4', 1);
      for (const dx of [0, w]) line(g, [[x + dx, -Hg], [x + dx, -Ht]], 3, S2);
      if (scaf) { g.strokeStyle = '#6a4a2a'; g.lineWidth = 1.6; g.beginPath(); for (let k = 0; k < 5; k++) { const xx = x - 6 + k * (w + 12) / 4; g.moveTo(xx, -Ht + 60); g.lineTo(xx, -Ht - 44); } for (let k = 0; k < 6; k++) { g.moveTo(x - 8, -Ht - 38 + k * 18); g.lineTo(x + w + 8, -Ht - 38 + k * 18); } g.moveTo(x - 6, -Ht - 38); g.lineTo(x + w + 6, -Ht + 52); g.stroke();
        line(g, [[x + w + 6, -Ht - 44], [x + w + 46, -Ht - 70]], 2.6, '#5a3a20'); line(g, [[x + w + 46, -Ht - 70], [x + w + 46, -Ht - 22]], 1, '#8a7a60'); block(g, x + w + 40, -Ht - 22, 12, 8, '#d9c8a4', 1.2);
        for (let k = 0; k < 3; k++) block(g, x + 10 + k * 22, -Ht - 6, 16, 6, '#d9c8a4', 1); }
    };
    tower(-W + 40, false); tower(W - 40, !!building);
    // gallery of chimeras (open arcade) across the whole façade
    block(g, -W, -Hg, 2 * W, 26, '#cbb791'); for (let i = 0; i < 20; i++) { const x = -W + 6 + i * 12; g.beginPath(); g.moveTo(x, -Hg + 24); g.lineTo(x, -Hg + 10); g.arc(x + 4, -Hg + 10, 4, Math.PI, 0); g.lineTo(x + 8, -Hg + 24); g.closePath(); g.fillStyle = DK; g.fill(); }
    // rose window level: rose + flanking tower windows
    const ry = -(Hk + Hr) / 2 - 4; ell(g, 0, ry, 40, 40); fillInk(g, '#2e3448', 2.6);
    g.save(); g.globalCompositeOperation = 'lighter'; const sp = .5 + Math.sin(t * 1.4) * .15; g.fillStyle = `rgba(80,120,200,${sp * .35})`; ell(g, 0, ry, 36, 36); g.fill(); g.restore();
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; line(g, [[Math.cos(a) * 8, ry + Math.sin(a) * 8], [Math.cos(a) * 36, ry + Math.sin(a) * 36]], 1.8, '#c8b48a'); ell(g, Math.cos(a) * 27, ry + Math.sin(a) * 27, 3.6, 3.6); g.fillStyle = ['#b5452b', '#3c5fa0', '#c9a24a'][i % 3]; g.fill(); }
    ell(g, 0, ry, 9, 9); fillInk(g, '#c9a24a', 1.2); ell(g, 0, ry, 44, 44); ink(g, 2);
    for (const cx of [-W + 40, W - 40]) for (const dx of [-14, 14]) { const xx = cx + dx; g.beginPath(); g.moveTo(xx - 8, -Hk - 16); g.lineTo(xx - 8, -Hr + 40); g.quadraticCurveTo(xx, -Hr + 26, xx + 8, -Hr + 40); g.lineTo(xx + 8, -Hk - 16); g.closePath(); fillInk(g, DK, 1.4); }
    // gallery of kings
    block(g, -W, -Hk - 8, 2 * W, 20, S2); for (let i = 0; i < 28; i++) { const x = -W + 6 + i * 8.4; ell(g, x + 2, -Hk + 2, 2.6, 6.4); fillInk(g, '#8a7a5c', .8); }
    // buttresses splitting the façade in three
    for (const x of [-W, -W + 80, W - 80, W]) line(g, [[x, 0], [x, -Hg]], 3.4, S2);
    // three portals with stepped archivolts
    for (const [x, w] of [[-W + 40, 40], [0, 54], [W - 40, 40]]) { g.beginPath(); g.moveTo(x - w / 2, 0); g.lineTo(x - w / 2, -46); g.quadraticCurveTo(x - w / 2, -78, x, -86); g.quadraticCurveTo(x + w / 2, -78, x + w / 2, -46); g.lineTo(x + w / 2, 0); g.closePath(); fillInk(g, '#2a2724', 2); for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x - w / 2 - k * 3.4, 0); g.lineTo(x - w / 2 - k * 3.4, -46); g.quadraticCurveTo(x - w / 2 - k * 3.4, -80 - k * 3, x, -88 - k * 3.4); g.quadraticCurveTo(x + w / 2 + k * 3.4, -80 - k * 3, x + w / 2 + k * 3.4, -46); g.lineTo(x + w / 2 + k * 3.4, 0); g.strokeStyle = 'rgba(60,45,25,.55)'; g.lineWidth = 1.2; g.stroke(); } poly(g, [[x - w / 2 + 3, -46], [x, -80], [x + w / 2 - 3, -46]]); fillInk(g, '#b8a37c', 1.2); line(g, [[x, 0], [x, -44]], 1.8, '#8a7a5c'); }
    // gargoyles on tower corners
    for (const x of [-W, -W + 80, W - 80, W]) { g.save(); g.translate(x, -Hg - 4); g.scale(x < 0 ? -1 : 1, 1); poly(g, [[0, 0], [16, -4], [21, 2], [14, 6], [4, 6]]); fillInk(g, '#8a7a5c', 1.2); g.restore(); }
  }

  /* VII · Paris 1889 — the Eiffel Tower on true proportions (building = 1888, stopped at 2nd floor) */
  function eiffel(g, t, building) {
    const P = '#6e5a46', PL = '#9a7f60', H = 330, y1 = -63, y2 = -127, y3 = -304;
    const hw = y => { const u = -y / H; return 6 + 64 * Math.pow(1 - u, 2.15); }; // half-width profile
    const lattice = (fn, x0, ya, x1, yb, sp) => { g.save(); fn(); g.clip(); g.strokeStyle = 'rgba(28,20,14,.72)'; g.lineWidth = .9; g.beginPath(); for (let y = ya; y > yb; y -= sp) { g.moveTo(x0, y); g.lineTo(x1, y - sp); g.moveTo(x1, y); g.lineTo(x0, y - sp); } g.stroke(); g.restore(); };
    // four legs (two visible pairs), curved, to the first platform
    for (const s of [-1, 1]) {
      const leg = () => { g.beginPath(); g.moveTo(s * hw(0), 0); for (let y = 0; y >= y1; y -= 6) g.lineTo(s * hw(y), y); g.lineTo(s * (hw(y1) - 18), y1); for (let y = y1; y <= 0; y += 6) g.lineTo(s * (hw(y) - 26 - (y - y1) * .02), y); g.closePath(); };
      sh(g, leg, P, { lw: 0 }); lattice(leg, s * 80, 0, s * 20, y1, 7); leg(); ink(g, 2);
    }
    // great decorative arch
    g.beginPath(); g.moveTo(-(hw(0) - 26), -2); g.bezierCurveTo(-36, -60, 36, -60, hw(0) - 26, -2); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3.4; g.strokeStyle = PL; g.stroke();
    // first platform with its arcade
    block(g, -hw(y1) - 6, y1 - 10, 2 * hw(y1) + 12, 10, PL, 2); for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(-hw(y1) - 2 + i * (2 * hw(y1) + 4) / 12 + 4, y1 - 4, 3.4, Math.PI, 0); g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); }
    // second section: two converging legs to the second platform
    for (const s of [-1, 1]) {
      const sec = () => { g.beginPath(); g.moveTo(s * hw(y1 - 10), y1 - 10); for (let y = y1 - 10; y >= y2; y -= 6) g.lineTo(s * hw(y), y); g.lineTo(s * 2, y2); g.lineTo(s * 10, y1 - 10); g.closePath(); };
      sh(g, sec, P, { lw: 0 }); lattice(sec, s * 50, y1 - 10, 0, y2, 6); sec(); ink(g, 1.8);
    }
    block(g, -hw(y2) - 5, y2 - 8, 2 * hw(y2) + 10, 8, PL, 1.8);
    if (building) {
      line(g, [[-6, y2 - 8], [-6, y2 - 52]], 2.6, '#3a3028'); line(g, [[-6, y2 - 52], [44, y2 - 40]], 2, '#3a3028'); line(g, [[44, y2 - 40], [44, y2 - 16]], 1, '#3a3028'); block(g, 38, y2 - 16, 12, 8, '#8a7a60', 1.2);
    } else {
      const shaft = () => { g.beginPath(); g.moveTo(-hw(y2 - 8), y2 - 8); for (let y = y2 - 8; y >= y3; y -= 6) g.lineTo(-hw(y), y); g.lineTo(hw(y3), y3); for (let y = y3; y <= y2 - 8; y += 6) g.lineTo(hw(y), y); g.closePath(); };
      sh(g, shaft, P, { lw: 0 }); lattice(shaft, -20, y2 - 8, 20, y3, 5); shaft(); ink(g, 1.8);
      block(g, -9, y3 - 8, 18, 8, PL, 1.4); block(g, -5, y3 - 18, 10, 10, '#d9c094', 1.2); line(g, [[0, y3 - 18], [0, -H - 14]], 2, INK);
      g.save(); g.globalCompositeOperation = 'lighter'; const b = Math.sin(t * 2) * .5 + .5; g.fillStyle = `rgba(255,${200 + b * 40 | 0},140,${.22 + b * .2})`; ell(g, 0, y3 - 13, 24, 24); g.fill(); g.restore();
      const fy = -H - 14; g.fillStyle = '#3c5fa0'; g.fillRect(1, fy, 6, 6); g.fillStyle = '#f1ead8'; g.fillRect(7, fy, 6, 6); g.fillStyle = '#b5452b'; g.fillRect(13, fy, 6, 6); g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(1, fy, 18, 6);
    }
    // Haussmann buildings framing the Champ-de-Mars
    const r = R(71); let x = -420;
    while (x < 420) { const w = 50 + r() * 40, h = 46 + r() * 26; if (x + w > -110 && x < 110) { x += 12; continue; }
      sh(g, () => { g.beginPath(); g.rect(x, -h, w, h + 8); }, '#e3d6bb', { hatch: [x + w * .55, -h, x + w, 8], hc: 'rgba(60,45,25,.3)', seed: x | 0 });
      sh(g, () => poly(g, [[x - 2, -h], [x + 8, -h - 22], [x + w - 8, -h - 22], [x + w + 2, -h]]), '#7d8a96', { hatch: [x, -h - 22, x + w, -h], hc: 'rgba(20,25,35,.35)', seed: (x | 0) + 1 });
      for (let k = 0; k < Math.floor(w / 16); k++) { const xx = x + 8 + k * 16; block(g, xx, -h + 12, 7, 12, '#4a4f58', 1); block(g, xx, -h + 30, 7, 12, '#4a4f58', 1); line(g, [[xx - 2, -h + 25], [xx + 9, -h + 25]], 1.4, '#2a2a2a'); }
      for (let k = 0; k < 2; k++) block(g, x + 10 + k * (w - 24), -h - 34, 6, 12, '#b56a4a', 1.2);
      x += w + 2; }
  }

  /* VIII · Nouvelle Babel — the megacity and the Signal tower */
  function babel(g, t) {
    t = t || 0; const GLOW = '#6ff0e6', r = R(91);
    for (let i = 0; i < 22; i++) { const x = -420 + i * 40 + r() * 10, w = 22 + r() * 16, h = 80 + r() * 120; g.fillStyle = '#3e4c66'; g.fillRect(x, -h, w, h); g.fillStyle = 'rgba(111,240,230,.18)'; for (let k = 0; k < 6; k++) g.fillRect(x + 4, -h + 10 + k * 14, w - 8, 2); }
    const ring = front => { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(111,240,230,.3)'; g.lineWidth = 8; g.beginPath(); g.ellipse(0, -170, 320, 34, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); g.stroke(); g.strokeStyle = GLOW; g.lineWidth = 1.6; g.stroke(); g.restore(); };
    ring(false);
    const tower = (x, w, h, kind) => {
      const tp = () => { g.beginPath(); if (kind === 'twist') { g.moveTo(x - w / 2, 0); g.bezierCurveTo(x - w * .8, -h * .3, x + w * .1, -h * .6, x - w * .15, -h); g.lineTo(x + w * .15, -h); g.bezierCurveTo(x + w * .5, -h * .6, x - w * .1, -h * .3, x + w / 2, 0); } else if (kind === 'dome') { g.moveTo(x - w / 2, 0); g.lineTo(x - w / 2, -h * .7); g.quadraticCurveTo(x, -h * 1.15, x + w / 2, -h * .7); g.lineTo(x + w / 2, 0); } else { g.moveTo(x - w / 2, 0); g.bezierCurveTo(x - w / 2 - 8, -h * .5, x - w * .2, -h * .9, x, -h); g.bezierCurveTo(x + w * .2, -h * .9, x + w / 2 + 8, -h * .5, x + w / 2, 0); } g.closePath(); };
      sh(g, tp, '#e6ecf2', { hatch: [x, -h, x + w / 2 + 12, 0], hc: 'rgba(40,60,90,.3)', lw: 2.2, seed: x | 0, extra: () => { g.strokeStyle = 'rgba(40,60,90,.3)'; g.lineWidth = 1; for (let k = 1; k < 16; k++) { const yy = -k * h / 16; g.beginPath(); g.moveTo(x - w, yy); g.lineTo(x + w, yy); g.stroke(); } g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 12; k++) { const yy = -14 - k * h / 13, on = Math.sin(t * 2 + k * 1.7 + x) > .2; g.fillStyle = on ? 'rgba(111,240,230,.5)' : 'rgba(111,240,230,.1)'; g.fillRect(x - w * .35, yy, w * .7, 2); } } });
      for (const f of [.35, .62]) { smoothPath(g, blobPts(x, -h * f, w * .66, 6, 10, .3, r)); fillInk(g, '#6f9a5a', 1.4); for (let k = 0; k < 4; k++) { ell(g, x - w * .5 + k * w * .33, -h * f - 6, 4, 6); fillInk(g, '#4f7a3a', 1); } }
    };
    tower(-250, 64, 200, 'dome'); tower(-160, 48, 290, 'twist'); tower(170, 54, 270, 'spire'); tower(262, 66, 190, 'dome');
    // the Signal tower
    const st = () => { g.beginPath(); g.moveTo(-40, 0); g.bezierCurveTo(-32, -120, -12, -250, -4, -420); g.lineTo(4, -420); g.bezierCurveTo(12, -250, 32, -120, 40, 0); g.closePath(); };
    sh(g, st, '#f4f7fa', { hatch: [0, -420, 42, 0], hc: 'rgba(40,60,90,.3)', lw: 2.4 });
    for (const yy of [-90, -170, -250]) { const w2 = 40 - (-yy) * .08; ell(g, 0, yy, w2 + 14, 6); fillInk(g, '#dfe6ee', 1.6); }
    g.save(); g.globalCompositeOperation = 'lighter'; const pulse = (t * .8) % 1; g.fillStyle = 'rgba(111,240,230,.85)'; ell(g, 0, -420 * pulse, 5, 9); g.fill(); g.fillStyle = 'rgba(111,240,230,.25)'; ell(g, 0, -420 * pulse, 20, 30); g.fill(); line(g, [[0, -10], [0, -420]], 1.2, 'rgba(111,240,230,.7)'); g.restore();
    ring(true);
    const pod = (t * .35) % 1 * TAU; const px = Math.cos(pod) * 320, py = -170 + Math.sin(pod) * 34; if (Math.sin(pod) > 0) block(g, px - 10, py - 5, 20, 8, '#e6ecf2', 1.4);
    g.save(); g.translate(64, -320); g.scale(4, 4); lineageMark(g, 0, 0, 'circuit'); g.restore();
    for (let i = 0; i < 5; i++) { const x = -280 + i * 140 + Math.sin(t + i) * 20, y = -250 - i * 16 + Math.cos(t * 1.3 + i) * 8; ell(g, x, y, 5, 3); fillInk(g, '#e6ecf2', 1); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = GLOW; ell(g, x, y + 4, 2, 1); g.fill(); g.restore(); }
  }

  return [
    { id: 'olduvai', era: 'I · L\'Étincelle', place: 'Gorges d\'Olduvai, Tanzanie', when: '≈ 1,8 Ma', sky: ['#f1c67c', '#e9a35c'], ground: '#b58a4f', scale: 1.55, draw: olduvai, work: 'Voler le feu à l\'acacia foudroyé et le garder trois nuits.' },
    { id: 'lascaux', era: 'II · Le Grand Froid', place: 'Grotte de Lascaux, France', when: '≈ 17 000 ans', sky: ['#2a1c18', '#120c0a'], ground: '#3a2a22', scale: 1.5, draw: lascaux, work: 'Peindre la mémoire de la tribu sur la paroi.' },
    { id: 'stonehenge', era: 'III · La Graine', place: 'Stonehenge, Angleterre', when: '≈ 2 500 av. J.-C.', sky: ['#b9c4c8', '#f0d9a8'], ground: '#7f8f4e', scale: 1.55, draw: stonehenge, work: 'Lever les trilithes alignés sur le solstice.' },
    { id: 'giza', era: 'IV · Le Bronze', place: 'Plateau de Gizeh, Égypte', when: '≈ 2 560 av. J.-C.', sky: ['#f6d79a', '#e9b06a'], ground: '#d9bb80', scale: 1.5, draw: (g, t) => giza(g, t, false), drawBuild: (g, t) => giza(g, t, true), work: 'Poser la dernière pierre de la grande pyramide.' },
    { id: 'colosseum', era: 'V · L\'Empire', place: 'Colisée, Rome', when: '80 apr. J.-C.', sky: ['#a9c4dc', '#f0dcb4'], ground: '#b9a47a', scale: 1.5, draw: colosseum, work: 'Survivre aux jeux et rallumer la flamme de Vesta.' },
    { id: 'notredame', era: 'VI · La Cathédrale', place: 'Notre-Dame, Paris', when: '1250', sky: ['#9aa6b4', '#d6cdb8'], ground: '#8a8a7a', scale: 1.1, draw: (g, t) => notreDame(g, t, false), drawBuild: (g, t) => notreDame(g, t, true), work: 'Achever la tour sud avant l\'hiver.' },
    { id: 'eiffel', era: 'VII · La Vapeur', place: 'Exposition universelle, Paris', when: '1889', sky: ['#e8b98a', '#c97a5a'], ground: '#6a6a6a', scale: 1.15, draw: (g, t) => eiffel(g, t, false), drawBuild: (g, t) => eiffel(g, t, true), work: 'Allumer le phare de la tour le soir de l\'ouverture.' },
    { id: 'babel', era: 'VIII · Le Signal', place: 'Nouvelle Babel', when: '≈ 2200', sky: ['#1a2440', '#3a4a7a'], ground: '#2a3040', scale: .92, draw: babel, work: 'Envoyer la Braise vers le passé.' }
  ];
})();

})();