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