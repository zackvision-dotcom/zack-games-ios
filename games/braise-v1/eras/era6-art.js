/* BRAISE — Era VI · La Cathédrale. Paris, 1250: the Île de la Cité while Notre-Dame's towers rise.
   Seine poplars and willows, walnut trees, rye fields outside the wall, cut Lutetian limestone,
   half-timbered houses, the masons' lodge, a treadwheel crane, a tower of Philip Augustus' wall, a wash-house.
   Heir: Ysabel (woad dyer's daughter, apprentice on the building site). Fauna: geese, the wolves that slip into
   the city in winter, and Courtaud, the great black wolf. Origin = ground contact, y up negative. */
window.BRAISE_ERA_ART = window.BRAISE_ERA_ART || {};
BRAISE_ERA_ART[5] = (() => {
  const K = BRAISE_ART.K, H = HEIR_KIT;
  const { TAU, INK, lerp, mulberry, ell, ink, fillInk, poly, smoothPath, blobPts, line, inkLine, inkCurve, shaded, dsEye, head, ears, torsoPath, brows, mouth, eyes, blush, faunaFoot, faunaJoint } = K;

  /* ======================= YSABEL ======================= */
  const Y = { skin: '#e2b896', skinS: '#c49878', cotte: '#3c5fa0', cotteS: '#2e4a80', apron: '#d8ccb0', coif: '#f2eee2', hair: '#8a4a22', hose: '#5a4632', shoe: '#3a2a1e', woad: '#3c5fa0' };
  const shoe = (g, x, y, side, far) => { g.beginPath(); if (side) { g.moveTo(-6, y - 6); g.quadraticCurveTo(6, y - 8, 12, y - 1); g.lineTo(11, y + 1); g.lineTo(-7, y + 1); g.closePath(); } else { g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y - 6); g.quadraticCurveTo(x + 9, y - 1, x + 7, y + 1); g.lineTo(x - 7, y + 1); g.quadraticCurveTo(x - 9, y - 2, x - 6, y - 6); } g.closePath(); fillInk(g, far ? '#2a1e14' : Y.shoe, 1.4); };
  const LEGS = { leg: Y.hose, legFar: '#4a3a28', legW: 7, foot: shoe };
  const ARMS = { sleeve: Y.cotte, sleeveFar: Y.cotteS, skin: Y.skin, armW: 8, cuff: (g, x, y) => { inkLine(g, [[x - 3.6, y - 2], [x + 3.6, y - 2]], 1.6, '#2e4a80', .6); } };
  function cotte(g, back) {
    shaded(g, () => { g.beginPath(); g.moveTo(-15, -66); g.quadraticCurveTo(0, -69, 15, -66); g.quadraticCurveTo(19, -42, 21, -18); g.quadraticCurveTo(0, -14, -21, -18); g.quadraticCurveTo(-19, -42, -15, -66); g.closePath(); }, Y.cotte, { hatch: back ? [-22, -68, -4, -16] : [4, -68, 22, -16], hc: 'rgba(10,20,50,.35)' });
    inkLine(g, [[-16, -46], [16, -46]], 2.2, '#6a4a2a', .8); ell(g, 8, -41, 3, 4.4); fillInk(g, '#8a6a3a', 1);
    if (!back) shaded(g, () => { g.beginPath(); g.moveTo(-11, -46); g.lineTo(11, -46); g.lineTo(13, -20); g.quadraticCurveTo(0, -17, -13, -20); g.closePath(); }, Y.apron, { lw: 1.6, extra: () => { g.fillStyle = 'rgba(60,95,160,.45)'; ell(g, -4, -30, 5, 3); g.fill(); ell(g, 5, -24, 3, 2); g.fill(); } });
  }
  function coifFront(g) {
    g.beginPath(); g.moveTo(-25, -74); g.lineTo(-26, -96); g.bezierCurveTo(-26, -122, 26, -122, 26, -96); g.lineTo(25, -74); g.quadraticCurveTo(22, -70, 19, -74); g.lineTo(20, -94); g.quadraticCurveTo(0, -104, -20, -94); g.lineTo(-19, -74); g.quadraticCurveTo(-22, -70, -25, -74); g.closePath(); fillInk(g, Y.coif, 2);
    g.strokeStyle = 'rgba(150,140,120,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-20, -94); g.quadraticCurveTo(0, -104, 20, -94); g.stroke();
    g.beginPath(); g.moveTo(-19, -92); g.quadraticCurveTo(-10, -100, 0, -98); g.quadraticCurveTo(10, -100, 19, -92); g.quadraticCurveTo(10, -95, 0, -94); g.quadraticCurveTo(-10, -95, -19, -92); g.closePath(); fillInk(g, Y.hair, 1.4);
    inkCurve(g, [[-19, -74], [0, -64], [19, -74]], 1.4, Y.coif, .6);
  }
  function woad(g, x, y) { for (let i = 0; i < 3; i++) line(g, [[x - 4, y + i * 3.2 - 1], [x + 4, y + i * 3.2 + 1.4]], 1.8, Y.woad); }
  function ysabel(g, o) {
    o = o || {}; if (o.view === 'side') return ysabelSide(g, o); if (o.view === 'back') return ysabelBack(g, o);
    H.legs(g, o, false, LEGS);
    cotte(g);
    H.limb(g, o, false, false, ARMS);
    g.beginPath(); g.rect(-5.5, -73, 11, 7); fillInk(g, Y.skin, 1.4);
    head(g, 'sapiens', Y.skin);
    eyes(g, o.mood, { blink: o.blink }); brows(g, o.mood, -96); blush(g, 'rgba(225,110,100,.32)'); mouth(g, o.mood);
    g.beginPath(); g.moveTo(.5, -84); g.quadraticCurveTo(2.2, -81.5, 0, -81); ink(g, 1.2);
    g.fillStyle = 'rgba(140,80,40,.5)'; for (const [x, y] of [[-12, -80], [-9, -78], [10, -79], [13, -77]]) { ell(g, x, y, .8, .8); g.fill(); }
    woad(g, 13, -84);
    coifFront(g);
    H.limb(g, o, true, false, ARMS);
  }
  function ysabelSide(g, o) {
    H.legs(g, o, true, LEGS);
    H.limb(g, o, false, true, ARMS);
    shaded(g, () => { g.beginPath(); g.moveTo(-11, -66); g.quadraticCurveTo(4, -70, 12, -64); g.quadraticCurveTo(17, -42, 18, -18); g.lineTo(-15, -18); g.quadraticCurveTo(-15, -42, -11, -66); g.closePath(); }, Y.cotte, { hatch: [-16, -68, 0, -16], hc: 'rgba(10,20,50,.35)' });
    shaded(g, () => { g.beginPath(); g.moveTo(10, -46); g.lineTo(16, -46); g.lineTo(19, -20); g.lineTo(13, -19); g.closePath(); }, Y.apron, { lw: 1.4 });
    inkLine(g, [[-12, -46], [15, -46]], 2.2, '#6a4a2a', .8);
    const prof = () => { g.beginPath(); g.moveTo(-19, -92); g.bezierCurveTo(-21, -116, 12, -120, 18, -100); g.quadraticCurveTo(19, -94, 21, -88); g.lineTo(24.5, -82); g.lineTo(20.5, -80); g.quadraticCurveTo(22, -76, 20, -74); g.quadraticCurveTo(21.5, -70.5, 17, -68.5); g.quadraticCurveTo(8, -66.5, 0, -69); g.bezierCurveTo(-12, -72, -19, -78, -19, -92); g.closePath(); };
    shaded(g, prof, Y.skin, { lw: 2.4 });
    dsEye(g, 13, -89, { blink: o.blink, rx: 2.6, ry: 4.2 }); g.beginPath(); g.moveTo(8, -97); g.quadraticCurveTo(13, -99.5, 18, -97); ink(g, 2.2);
    g.beginPath(); g.moveTo(19.5, -73.5); g.quadraticCurveTo(16.5, -72.5, 14, -73.5); ink(g, 1.3);
    g.fillStyle = 'rgba(225,110,100,.3)'; ell(g, 9, -79, 4, 2.3); g.fill();
    woad(g, 6, -84);
    g.beginPath(); g.moveTo(-24, -70); g.lineTo(-25, -96); g.bezierCurveTo(-24, -124, 18, -124, 18, -102); g.quadraticCurveTo(6, -100, 0, -96); g.lineTo(-2, -72); g.quadraticCurveTo(-12, -66, -24, -70); g.closePath(); fillInk(g, Y.coif, 2);
    g.beginPath(); g.moveTo(-2, -98); g.quadraticCurveTo(8, -102, 17, -100); g.quadraticCurveTo(8, -98, 0, -94); g.closePath(); fillInk(g, Y.hair, 1.2);
    H.limb(g, o, true, true, ARMS);
  }
  function ysabelBack(g, o) {
    H.legs(g, o, false, LEGS);
    H.limb(g, o, false, false, ARMS); H.limb(g, o, true, false, ARMS);
    cotte(g, true);
    inkLine(g, [[-10, -46], [10, -46]], 2.2, '#6a4a2a', .8); inkCurve(g, [[0, -46], [-4, -38], [-2, -30]], 1.6, '#d8ccb0', .6); inkCurve(g, [[0, -46], [5, -37], [3, -30]], 1.6, '#d8ccb0', .6);
    g.beginPath(); g.moveTo(-25, -68); g.lineTo(-26, -96); g.bezierCurveTo(-26, -122, 26, -122, 26, -96); g.lineTo(25, -68); g.quadraticCurveTo(0, -62, -25, -68); g.closePath(); fillInk(g, Y.coif, 2);
    g.strokeStyle = 'rgba(150,140,120,.6)'; g.lineWidth = 1; for (const x of [-12, 0, 12]) { g.beginPath(); g.moveTo(x, -114); g.quadraticCurveTo(x * 1.2, -90, x, -68); g.stroke(); }
  }

  /* ======================= FAUNA ======================= */
  /* grey goose — waddles, honks, flaps when scared (role of the grazing herd) */
  function goose(g, p, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const fleeing = o.state === 'flee' || o.state === 'fleeing' || o.speed > 140, grazing = !moving && (o.state === 'graze' || o.state === 'grazing');
    const C = '#9a968c', CD = '#6a665e', CL = '#f2eee6', OR = '#e2862a';
    const sway = moving ? Math.sin(phase * 2) * .06 : 0, by = moving ? -Math.abs(Math.sin(phase * 2)) * 1.4 : 0, graze = grazing ? .9 + Math.sin(time * 2.2) * .05 : 0;
    for (const s of [-1, 1]) { const st = moving ? Math.sin(phase * 2 + (s > 0 ? Math.PI : 0)) * 5 : 0; inkLine(g, [[s * 3, -12 + by], [s * 3 + st, -2]], 1.6, OR, .7); ell(g, s * 3 + st + 2, -1, 4, 1.6); fillInk(g, OR, .8); }
    g.save(); g.translate(0, by); g.rotate(sway);
    shaded(g, () => { g.beginPath(); g.moveTo(-18, -20); g.quadraticCurveTo(-24, -26, -16, -30); g.quadraticCurveTo(0, -34, 12, -26); g.quadraticCurveTo(14, -14, 4, -11); g.quadraticCurveTo(-12, -10, -18, -20); g.closePath(); }, C, { extra: () => { g.fillStyle = CL; ell(g, -2, -12, 12, 3); g.fill(); g.strokeStyle = CD; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-14 + i * 5, -26); g.quadraticCurveTo(-8 + i * 5, -22, -10 + i * 5, -16); g.stroke(); } } });
    if (fleeing && moving) { for (const s of [0, 1]) { g.save(); g.translate(-2, -26); g.rotate(-1.4 - Math.sin(phase * 4 + s) * .5); ell(g, 0, -10, 5, 12); fillInk(g, s ? CD : C, 1); g.restore(); } }
    g.save(); g.translate(10, -24); g.rotate(graze * 1.6); g.translate(-10, 24);
    inkCurve(g, [[8, -24], [14, -36], [13, -46]], 4.4, CD, 1.2);
    ell(g, 14, -48, 5, 4.2); fillInk(g, CD, 1.2); poly(g, [[18, -50], [25, -47], [18, -45]]); fillInk(g, OR, .8);
    dsEye(g, 15, -49, { rx: .9, ry: 1.1, socket: false });
    g.restore(); g.restore();
  }
  /* medieval wolf — gaunt, brown-grey winter coat, ribs showing (role of the night pack) */
  function lean(g, p, angry, options, big) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const attacking = o.state === 'attack' && Number.isFinite(o.attack) && o.attack >= 0 && o.attack < 1.05, a = attacking ? o.attack : -1;
    const threat = !!angry || attacking || o.state === 'warn' || o.state === 'stalk';
    const lunge = attacking && a >= .45 && a < .75 ? Math.sin((a - .45) / .3 * Math.PI) : 0, run = o.speed > 115 || o.state === 'chase', loco = moving && !attacking;
    const C = big ? '#2e2a28' : '#7a6a58', CD = big ? '#141210' : '#3e342a', CL = big ? '#5a524a' : '#c8b8a0', far = big ? '#221e1c' : '#5a4e40';
    const by = (loco ? (run ? -2.2 * Math.max(0, Math.sin(phase * 2)) : Math.cos(phase * 2) * .5) : 0) + (threat ? 3 : 0), push = lunge * 11;
    const legs = [{ x: -14, far: true, back: true, ph: run ? .1 : .5 }, { x: 14, far: true, back: false, ph: run ? .6 : .25 }, { x: -17, far: false, back: true, ph: 0 }, { x: 17, far: false, back: false, ph: run ? .5 : .75 }];
    const leg = Lg => { const st = loco ? faunaFoot(phase + Lg.ph * TAU, run ? 12 : 7, run ? 11 : 6, run ? .42 : .62) : [0, 0]; faunaJoint(g, [Lg.x + push * .5, by - 31], [Lg.x + st[0] + (Lg.back ? 0 : push), st[1] - (Lg.far ? 1.5 : 0)], 16, 17, Lg.back ? -1 : 1, Lg.far ? 2.3 : 2.8, Lg.far ? far : CD, false); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(push * .6, by);
    g.save(); g.translate(-22, -36); g.rotate(threat ? .75 : .5 + Math.sin(time * 2.2) * .08); inkCurve(g, [[0, 0], [-8, 6], [-14, 16], [-14, 24]], 4, C, 1.2); g.restore();
    shaded(g, () => { g.beginPath(); g.moveTo(-23, -36); g.bezierCurveTo(-22, -48, 14, -50, 21, -42); g.quadraticCurveTo(24, -32, 16, -28); g.quadraticCurveTo(4, -24, -8, -30); g.quadraticCurveTo(-18, -28, -23, -36); g.closePath(); }, C,
      { extra: () => { g.strokeStyle = 'rgba(20,14,10,.4)'; g.lineWidth = 1; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-6 + i * 4, -42); g.quadraticCurveTo(-3 + i * 4, -36, -6 + i * 4, -30); g.stroke(); } g.fillStyle = CL; ell(g, 6, -29, 9, 2.2); g.fill(); }, hatch: [-23, -50, -4, -28], hc: 'rgba(20,14,10,.3)' });
    if (big) { line(g, [[-8, -44], [2, -40]], 1.4, '#a88a6a'); line(g, [[-6, -46], [4, -41]], 1, '#a88a6a'); }
    const hx = 21 + lunge * 6, hy = threat ? -36 : -46;
    smoothPath(g, blobPts(17, -42, 9, 9, 10, .45, mulberry(42))); fillInk(g, C, 1.5);
    shaded(g, () => { g.beginPath(); g.moveTo(hx - 6, hy - 6); g.quadraticCurveTo(hx + 4, hy - 10, hx + 10, hy - 4); g.lineTo(hx + 21, hy); g.quadraticCurveTo(hx + 20, hy + 4, hx + 14, hy + 5); g.quadraticCurveTo(hx + 2, hy + 8, hx - 6, hy + 4); g.closePath(); }, C, { extra: () => { g.fillStyle = CL; ell(g, hx + 12, hy + 3.5, 6, 1.8); g.fill(); } });
    for (const dx of [-2, 3]) { poly(g, [[hx + dx - 3, hy - 6], [hx + dx - 1, hy - 15], [hx + dx + 3, hy - 6]]); fillInk(g, dx < 0 ? far : C, 1.1); }
    g.fillStyle = INK; ell(g, hx + 20.5, hy + .5, 1.6, 1.3); g.fill();
    dsEye(g, hx + 6, hy - 2.5, { rx: 1.5, ry: 1.9, socket: false, angry: threat, lens: big ? '#e8c040' : null });
    if (threat) { g.beginPath(); g.moveTo(hx + 8, hy + 4); g.lineTo(hx + 19, hy + 3.5); ink(g, 1.1); g.fillStyle = '#f2ead8'; for (let i = 0; i < 3; i++) { poly(g, [[hx + 10 + i * 3, hy + 3.6], [hx + 11 + i * 3, hy + 6.4], [hx + 12 + i * 3, hy + 3.6]]); g.fill(); } }
    g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }
  const wolf = (g, p, angry, o) => lean(g, p, angry, o, false);
  /* Courtaud, the great black wolf of the winter tales (last-night predator, drawn larger by the engine) */
  const courtaud = (g, p, o) => { g.save(); g.scale(1.05, 1.05); lean(g, p, o && (o.state === 'stalk' || o.state === 'attack'), o, true); g.restore(); };

  /* ======================= FLORA ======================= */
  /* black poplar of the Seine banks: tall, columnar (role "pine", size k) */
  function poplar(g, k, seed) {
    const r = mulberry(seed), h = (230 + r() * 40) * k;
    g.fillStyle = 'rgba(30,40,20,.2)'; ell(g, 0, -2, 30 * k, 8 * k); g.fill();
    inkCurve(g, [[0, 0], [1, -h * .4], [0, -h * .7]], 8 * k, '#6a5e50', 1.6);
    g.beginPath(); g.moveTo(0, -h); g.bezierCurveTo(30 * k, -h * .8, 34 * k, -h * .4, 16 * k, -h * .22); g.quadraticCurveTo(0, -h * .18, -16 * k, -h * .22); g.bezierCurveTo(-34 * k, -h * .4, -30 * k, -h * .8, 0, -h); g.closePath(); fillInk(g, '#4a6a34', 2);
    for (let i = 0; i < 46; i++) { const y = -h * (.25 + r() * .7), w = Math.sin((-y / h - .2) / .8 * Math.PI) * 26 * k; g.fillStyle = r() < .5 ? 'rgba(150,180,90,.55)' : 'rgba(30,50,20,.4)'; ell(g, (r() - .5) * 2 * w, y, 3.4 * k, 2.4 * k, r() * 3); g.fill(); }
  }
  /* walnut tree: round crown, pale grey trunk (role "oak") */
  function walnut(g, v) {
    const r = mulberry(250 + v);
    g.fillStyle = 'rgba(30,40,20,.2)'; ell(g, 0, -2, 64, 12); g.fill();
    inkCurve(g, [[0, 0], [-2, -50], [2, -86]], 13, '#a09a8e', 1.8); inkCurve(g, [[0, -70], [-36, -100]], 5, '#a09a8e', 1.2); inkCurve(g, [[0, -70], [34, -104]], 5, '#a09a8e', 1.2);
    smoothPath(g, blobPts(0, -128, 72, 52, 20, .2, r)); fillInk(g, '#5a7a3a', 2);
    for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(130,160,80,.5)'; smoothPath(g, blobPts(-50 + r() * 100, -150 + r() * 50, 14, 9, 9, .4, r)); g.fill(); }
    for (let i = 0; i < 12; i++) { ell(g, -50 + r() * 100, -110 + r() * 30, 2.6, 2.6); fillInk(g, '#7a9a3a', .5); }
  }
  /* pollarded willow, dead and hollow (role "dead") */
  function deadWillow(g, v) { const r = mulberry(350 + v); g.fillStyle = 'rgba(30,40,20,.18)'; ell(g, 0, -2, 28, 7); g.fill(); shaded(g, () => { g.beginPath(); g.moveTo(-12, 0); g.quadraticCurveTo(-16, -40, -14, -70); g.lineTo(14, -72); g.quadraticCurveTo(16, -40, 12, 0); g.closePath(); }, '#7a6e5e', { lw: 2 }); ell(g, 0, -30, 5, 10); g.fillStyle = '#1c1612'; g.fill(); for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i / 8 - .5) * 2.2; inkLine(g, [[Math.cos(a) * 8, -72], [Math.cos(a) * 30, -72 + Math.sin(a) * 50]], 1.6, '#8a7e6a', .6); } }
  /* rye, tall and bluish (role "tuft") */
  function rye(g, picked) { g.fillStyle = 'rgba(30,40,20,.16)'; ell(g, 0, -1, 22, 5); g.fill(); for (let i = 0; i < (picked ? 7 : 12); i++) { const x = (i - 6) * 3.2, h = picked ? 9 : 44 + (i % 3) * 8, lean = (i - 6) * .7; line(g, [[x, 0], [x + lean, -h]], 1.2, picked ? '#b8a060' : '#8aa070'); if (!picked) { ell(g, x + lean, -h - 6, 1.6, 7); fillInk(g, '#c8b070', .4); line(g, [[x + lean, -h - 12], [x + lean + 1, -h - 22]], .5, '#b8a060'); } } }
  /* redcurrant bush (role "berry") */
  function currant(g, picked, v) { const r = mulberry(650 + v); g.fillStyle = 'rgba(30,40,20,.18)'; ell(g, 0, -1, 32, 7); g.fill(); for (let i = 0; i < 6; i++) inkCurve(g, [[(i - 2.5) * 4, 0], [(i - 2.5) * 9, -22], [(i - 2.5) * 13, -36]], 1.6, '#7a5a4a', .6); for (let i = 0; i < 12; i++) { const x = -26 + r() * 52, y = -36 + r() * 24; ell(g, x, y, 5, 4, r() * 3); fillInk(g, i % 2 ? '#5a8a3a' : '#4a7a32', .7); } if (!picked) for (let i = 0; i < 8; i++) { const x = -22 + r() * 44, y = -30 + r() * 14; for (let k = 0; k < 5; k++) { ell(g, x + k * .6, y + k * 2.4, 1.6, 1.6); fillInk(g, '#d8282a', .4); } } }
  /* cut block of Lutetian limestone with mason's marks (role "boulder") */
  function cutStone(g, v, stage) {
    const r = mulberry(760 + v), w = 40 - stage * 8, h = 34 - stage * 9;
    g.fillStyle = 'rgba(30,40,20,.2)'; ell(g, 0, -2, w + 6, 8); g.fill();
    shaded(g, () => poly(g, [[-w, 0], [-w, -h], [-w + 12, -h - 9], [w + 12, -h - 9], [w + 12, -9], [w, 0]]), '#e6d8b8', { lw: 0 });
    shaded(g, () => poly(g, [[-w, -h], [-w + 12, -h - 9], [w + 12, -h - 9], [w, -h]]), '#f2e8d0', { lw: 1.6 });
    shaded(g, () => poly(g, [[w, 0], [w, -h], [w + 12, -h - 9], [w + 12, -9]]), '#c8b890', { lw: 1.6 });
    shaded(g, () => { g.beginPath(); g.rect(-w, -h, w * 2, h); }, '#e6d8b8', { lw: 2 });
    g.strokeStyle = 'rgba(110,90,60,.6)'; g.lineWidth = 1.2; g.beginPath(); const mx = -w * .4 + r() * w * .6, my = -h * .5; if (v % 2) { g.moveTo(mx - 4, my - 4); g.lineTo(mx + 4, my + 4); g.moveTo(mx + 4, my - 4); g.lineTo(mx - 4, my + 4); } else { g.moveTo(mx, my - 5); g.lineTo(mx, my + 5); g.moveTo(mx - 4, my - 1); g.lineTo(mx + 4, my - 1); } g.stroke();
    for (let i = 0; i < 5; i++) line(g, [[-w + 3 + i * 6, -h + 2], [-w + 5 + i * 6, -h + 6]], .8, 'rgba(110,90,60,.45)');
  }
  /* turnip (role "carrot") */
  function turnip(g) { ell(g, 0, -5, 7, 6); fillInk(g, '#f0e8f0', 1.2); g.fillStyle = '#a05a9a'; ell(g, 0, -8, 6.4, 3); g.fill(); for (const a of [-.4, 0, .4]) { inkCurve(g, [[0, -10], [a * 14, -22], [a * 22, -28]], 2.4, '#4a7a3a', .5); } }
  /* Seine rushes and yellow flag iris (role "reeds") */
  function rushes(g, v) { const r = mulberry(990 + v); for (let i = 0; i < 14; i++) { const x = (r() - .5) * 28, L2 = 40 + r() * 26; line(g, [[x, 0], [x + (r() - .5) * 8, -L2]], 1.4, '#5a7a3a'); } for (let i = 0; i < 2; i++) { const x = -8 + i * 14; line(g, [[x, 0], [x, -44]], 1.2, '#5a7a3a'); for (const a of [-.6, 0, .6]) { ell(g, x + Math.sin(a) * 4, -46 + Math.abs(a) * 3, 1.8, 4, a); fillInk(g, '#f0c830', .4); } } }
  /* medieval meadow flowers: madonna lily, marigold, violet, columbine, daisy */
  function flower(g, v) {
    line(g, [[0, 0], [0, -15]], 1.2, '#5a7a3a');
    if (v === 0) { for (const a of [-.7, 0, .7]) { ell(g, Math.sin(a) * 4, -19 + Math.abs(a) * 2, 1.8, 5, a); fillInk(g, '#fbfaf2', .5); } }
    else if (v === 1) { for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ell(g, Math.cos(a) * 3, -16 + Math.sin(a) * 3, 1.2, 2.6, a + Math.PI / 2); fillInk(g, '#f09020', .4); } }
    else if (v === 2) { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ell(g, Math.cos(a) * 2.4, -15 + Math.sin(a) * 2.4, 2, 1.6, a); fillInk(g, '#6a3a9a', .4); } }
    else if (v === 3) { for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i / 4 - .5) * 2; ell(g, Math.cos(a) * 3, -17 + Math.sin(a) * 3, 1.6, 3.4, a + Math.PI / 2); fillInk(g, '#5a6ac8', .4); } }
    else { for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; ell(g, Math.cos(a) * 3, -15 + Math.sin(a) * 3, 1, 2.4, a + Math.PI / 2); fillInk(g, '#fbfaf2', .3); } ell(g, 0, -15, 1.4, 1.4); fillInk(g, '#f0c030', .3); }
  }
  /* osier withies (role "sapling") */
  function osier(g, picked) { for (let i = 0; i < 9; i++) { const a = (i / 8 - .5) * .9, L2 = picked ? 10 : 44; line(g, [[0, 0], [Math.sin(a) * L2, -Math.cos(a) * L2]], 1.8, i % 2 ? '#a05a2a' : '#c8783a'); if (!picked) for (let j = 1; j < 4; j++) { ell(g, Math.sin(a) * L2 * j / 4 + 2, -Math.cos(a) * L2 * j / 4, 3.4, 1.2, a + .5); g.fillStyle = '#7a9a5a'; g.fill(); } } }

  /* ======================= PLACES ======================= */
  /* the masons' lodge: timber-framed open shed, tiles, tools on the wall (shelter, cave volume) */
  function lodge(g) {
    g.fillStyle = 'rgba(30,40,20,.22)'; ell(g, 0, -1, 160, 18); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-150, -140, 300, 140); }, '#e8dcc0', { hatch: [70, -140, 150, 0], hc: 'rgba(90,70,40,.3)', lw: 2.4 });
    g.beginPath(); g.rect(-112, -106, 224, 106); const gr = g.createLinearGradient(0, -106, 0, 0); gr.addColorStop(0, '#2a2018'); gr.addColorStop(1, '#5a4a36'); g.fillStyle = gr; g.fill(); ink(g, 2);
    for (const x of [-150, -112, 112, 150]) inkLine(g, [[x, 0], [x, -140]], 6, '#5a3e26', 1.2);
    inkLine(g, [[-150, -106], [150, -106]], 6, '#5a3e26', 1.2); inkLine(g, [[-150, -72], [-112, -106]], 4, '#5a3e26', 1); inkLine(g, [[150, -72], [112, -106]], 4, '#5a3e26', 1);
    for (const [x, y, k] of [[-80, -70, 0], [-50, -76, 1], [60, -70, 2]]) { if (k === 0) { inkLine(g, [[x, y], [x, y + 30]], 2, '#8a6a4a', .8); poly(g, [[x - 8, y], [x + 8, y], [x + 6, y + 8], [x - 6, y + 8]]); fillInk(g, '#8a8a8a', 1); } else if (k === 1) { inkLine(g, [[x - 14, y + 20], [x + 14, y + 20]], 2, '#8a6a4a', .8); inkLine(g, [[x - 14, y + 20], [x - 14, y]], 2, '#8a6a4a', .8); } else { inkLine(g, [[x, y], [x + 4, y + 26]], 3, '#8a6a4a', .8); ell(g, x, y, 8, 5); fillInk(g, '#a07a50', 1); } }
    shaded(g, () => poly(g, [[-172, -136], [-120, -196], [120, -196], [172, -136]]), '#a8583a', { hatch: [30, -196, 172, -136], hc: 'rgba(60,20,10,.4)', lw: 2.2, extra: () => { g.strokeStyle = 'rgba(70,25,10,.5)'; g.lineWidth = 1; for (let y = -190; y < -136; y += 8) { g.beginPath(); g.moveTo(-180, y); g.lineTo(180, y); g.stroke(); } } });
  }
  /* wash-house on the Seine bank: stone basin under a little roof (role "waterhole") */
  function lavoir(g) {
    smoothPath(g, blobPts(0, 0, 76, 24, 24, .03, mulberry(99))); fillInk(g, '#d8ccb0', 2.2);
    smoothPath(g, blobPts(0, 1, 66, 18, 22, .03, mulberry(100))); g.fillStyle = '#5a7a7a'; g.fill(); g.strokeStyle = 'rgba(30,50,50,.6)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = 'rgba(220,235,235,.45)'; ell(g, -12, -3, 26, 5); g.fill();
    for (const x of [-56, -20, 20, 56]) { poly(g, [[x - 10, -18], [x + 10, -18], [x + 12, -12], [x - 12, -12]]); fillInk(g, '#8a6a4a', 1.2); }
    for (const x of [-30, 30]) { inkLine(g, [[x, -20], [x + 6, -50]], 1.6, '#8a6a4a', .6); } inkCurve(g, [[-24, -48], [0, -44], [34, -50]], 1, '#6a5a4a', .3);
    for (const [x, c] of [[-14, '#f2eee2'], [0, '#3c5fa0'], [14, '#f2eee2']]) { poly(g, [[x - 5, -46], [x + 5, -45], [x + 4, -34], [x - 4, -35]]); fillInk(g, c, .8); }
  }
  /* wolves' lair in rubble under the old wall, brambles (role "den") */
  function wolfLair(g) {
    const r = mulberry(994);
    shaded(g, () => poly(g, [[-68, 0], [-62, -40], [-20, -58], [30, -54], [66, -36], [70, 0]]), '#cfc2a2', { hatch: [20, -58, 70, 0], hc: 'rgba(90,70,40,.35)', lw: 2.2, extra: () => { g.strokeStyle = 'rgba(110,90,60,.45)'; g.lineWidth = 1; for (let y = -48; y < 0; y += 10) for (let x = -66 + (y / 10 % 2) * 10; x < 68; x += 20) g.strokeRect(x, y, 20, 10); } });
    g.beginPath(); g.moveTo(-24, 0); g.bezierCurveTo(-26, -24, -10, -34, 2, -34); g.bezierCurveTo(18, -34, 28, -20, 26, 0); g.closePath(); g.fillStyle = '#1a1410'; g.fill(); ink(g, 2);
    for (let i = 0; i < 5; i++) { smoothPath(g, blobPts(-60 + i * 30, -50 + (i % 2) * 8, 14, 10, 9, .45, r)); fillInk(g, '#3e5030', 1.4); }
    inkLine(g, [[34, -2], [48, 2]], 2.4, '#ece2cc', 1);
  }
  /* pig bones by the midden (role "carcass") */
  function pigBones(g) { smoothPath(g, blobPts(0, -4, 30, 7, 12, .25, mulberry(451))); g.fillStyle = 'rgba(90,70,40,.3)'; g.fill(); for (let i = 0; i < 5; i++) { const x = -22 + i * 8; g.beginPath(); g.moveTo(x, -4); g.quadraticCurveTo(x + 3, -16, x + 8, -12); g.lineWidth = 3.8; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.2; g.strokeStyle = '#efe6d2'; g.stroke(); } shaded(g, () => { g.beginPath(); g.moveTo(20, -6); g.lineTo(22, -18); g.quadraticCurveTo(32, -20, 40, -12); g.lineTo(40, -6); g.closePath(); }, '#efe6d2', {}); g.fillStyle = INK; ell(g, 27, -12, 1.6, 2); g.fill(); }
  /* the site's iron brazier where the masons warm their hands (source of fire) */
  function brazier(g, lit) {
    g.fillStyle = 'rgba(30,21,15,.24)'; ell(g, 0, -1, 34, 8); g.fill();
    for (const s of [-1, 0, 1]) inkLine(g, [[s * 16, 0], [s * 8, -30]], 2.6, '#3a3430', 1);
    g.beginPath(); g.moveTo(-24, -32); g.quadraticCurveTo(0, -12, 24, -32); g.lineTo(26, -38); g.lineTo(-26, -38); g.closePath(); fillInk(g, '#4a4440', 1.8);
    for (let x = -18; x <= 18; x += 6) line(g, [[x, -36], [x * .8, -24]], 1, '#2a2420');
    ell(g, 0, -38, 26, 5); g.fillStyle = lit ? '#2a120a' : '#3a3430'; g.fill(); ink(g, 1.4);
  }
  /* half-timbered house, jettied upper floor, tiled roof */
  function timberHouse(g, v) {
    const r = mulberry(1700 + v), w = 76;
    g.fillStyle = 'rgba(30,40,20,.22)'; ell(g, 0, -1, w + 18, 15); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-w, -84, w * 2, 84); }, '#ece2c8', { hatch: [w * .4, -84, w, 0], hc: 'rgba(90,70,40,.3)', lw: 2.2 });
    shaded(g, () => { g.beginPath(); g.rect(-w - 8, -170, w * 2 + 16, 86); }, '#f0e6cc', { hatch: [w * .4, -170, w + 8, -84], hc: 'rgba(90,70,40,.3)', lw: 2.2 });
    const T = '#4a3222';
    for (const x of [-w, -w * .4, w * .4, w]) inkLine(g, [[x, 0], [x, -84]], 4, T, .8);
    for (const x of [-w - 8, -w * .5, 0, w * .5, w + 8]) inkLine(g, [[x, -84], [x, -170]], 4, T, .8);
    inkLine(g, [[-w - 10, -84], [w + 10, -84]], 5, T, 1); inkLine(g, [[-w - 8, -128], [w + 8, -128]], 3, T, .8);
    inkLine(g, [[-w - 8, -128], [-w * .5, -170]], 3, T, .8); inkLine(g, [[w + 8, -128], [w * .5, -170]], 3, T, .8); inkLine(g, [[-w * .5, -84], [0, -128]], 3, T, .8); inkLine(g, [[w * .5, -84], [0, -128]], 3, T, .8);
    g.beginPath(); g.moveTo(-14, 0); g.lineTo(-14, -48); g.quadraticCurveTo(0, -58, 14, -48); g.lineTo(14, 0); g.closePath(); fillInk(g, '#5a3e26', 1.6);
    for (const x of [-w * .7, w * .7]) { g.beginPath(); g.rect(x - 10, -64, 20, 18); fillInk(g, '#2a2420', 1.2); }
    for (const x of [-w * .25, w * .25]) { g.beginPath(); g.rect(x - 9, -122, 18, 22); fillInk(g, v % 2 ? '#e8c060' : '#2a2420', 1.2); }
    shaded(g, () => poly(g, [[-w - 18, -168], [0, -256], [w + 18, -168]]), '#8a4a34', { hatch: [0, -256, w + 18, -168], hc: 'rgba(50,20,10,.4)', lw: 2.4, extra: () => { g.strokeStyle = 'rgba(60,25,15,.5)'; g.lineWidth = 1; for (let y = -248; y < -168; y += 8) { g.beginPath(); g.moveTo(-w - 20, y); g.lineTo(w + 20, y); g.stroke(); } } });
    if (v % 2 === 0) { g.beginPath(); g.rect(w * .3, -246, 14, 40); fillInk(g, '#a85a3a', 1.4); }
    if (v === 1) { inkLine(g, [[w + 8, -150], [w + 34, -150]], 2.4, T, .8); poly(g, [[w + 22, -150], [w + 36, -150], [w + 36, -130], [w + 22, -130]]); fillInk(g, '#3c5fa0', 1); }
  }
  /* treadwheel crane lifting a block to the scaffold */
  function crane(g) {
    g.fillStyle = 'rgba(30,40,20,.22)'; ell(g, 0, -1, 90, 14); g.fill();
    const T = '#6a4a2e';
    for (const s of [-1, 1]) inkLine(g, [[s * 50, 0], [s * 16, -150]], 5, T, 1); inkLine(g, [[0, 0], [0, -170]], 6, T, 1.2);
    inkLine(g, [[-10, -168], [110, -200]], 5, T, 1.2); inkLine(g, [[0, -120], [70, -186]], 3, T, .8);
    g.beginPath(); g.arc(-40, -60, 46, 0, TAU); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.lineWidth = 4; g.strokeStyle = '#8a6a4a'; g.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(g, [[-40, -60], [-40 + Math.cos(a) * 44, -60 + Math.sin(a) * 44]], 2, T); }
    g.beginPath(); g.arc(-40, -60, 30, 0, TAU); g.lineWidth = 1.6; g.strokeStyle = T; g.stroke();
    line(g, [[108, -198], [108, -86]], 1.4, '#c8b07a'); line(g, [[-40, -60], [108, -198]], 1.2, '#c8b07a');
    shaded(g, () => { g.beginPath(); g.rect(92, -86, 32, 22); }, '#e6d8b8', { lw: 1.6 });
  }
  /* round tower of Philip Augustus' city wall, with a stretch of curtain */
  function wallTower(g) {
    g.fillStyle = 'rgba(30,40,20,.22)'; ell(g, 0, -1, 140, 16); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-150, -120, 300, 120); }, '#d8ccb0', { hatch: [60, -120, 150, 0], hc: 'rgba(90,70,40,.3)', lw: 2.2, extra: () => { g.strokeStyle = 'rgba(110,90,60,.35)'; g.lineWidth = 1; for (let y = -112; y < 0; y += 10) { g.beginPath(); g.moveTo(-150, y); g.lineTo(150, y); g.stroke(); } } });
    for (let x = -150; x < 150; x += 20) { g.beginPath(); g.rect(x, -132, 12, 12); fillInk(g, '#d8ccb0', 1.2); }
    shaded(g, () => { g.beginPath(); g.moveTo(-50, 4); g.lineTo(-50, -190); g.quadraticCurveTo(0, -200, 50, -190); g.lineTo(50, 4); g.quadraticCurveTo(0, 14, -50, 4); g.closePath(); }, '#e2d6ba', { light: '#ece2ca', lb: [-20, -150, 20, 60], hatch: [16, -196, 52, 8], hc: 'rgba(90,70,40,.35)', lw: 2.4 });
    for (const y of [-60, -130]) { g.beginPath(); g.rect(-3, y, 6, 22); g.fillStyle = '#1c1612'; g.fill(); }
    shaded(g, () => poly(g, [[-56, -188], [0, -270], [56, -188]]), '#5a6470', { hatch: [0, -270, 56, -188], hc: 'rgba(10,15,20,.4)', lw: 2.2 });
    line(g, [[0, -270], [0, -290]], 1.4, INK); poly(g, [[0, -290], [16, -286], [0, -281]]); fillInk(g, '#3c5fa0', 1);
  }

  /* ======================= GROUND ======================= */
  function ground(g, o) {
    const { x0, y0, CH, land, rng } = o;
    g.lineCap = 'round';
    // cobbled lanes on the "rock" biome
    for (let j = 0; j < CH; j += 10) for (let i = (j / 10 % 2) * 5; i < CH; i += 10) { if (land(i, j) !== 3) continue; ell(g, i, j, 4.4, 3.4); g.fillStyle = rng() < .5 ? '#9a9080' : '#8a8070'; g.fill(); g.strokeStyle = 'rgba(50,44,36,.6)'; g.lineWidth = 1; g.stroke(); }
    for (let k = 0; k < 520; k++) {
      const px = rng() * CH, py = rng() * CH, b = land(px, py); if (!b || b === 3) continue;
      if (b === 1) { g.strokeStyle = ['rgba(80,120,50,.5)', 'rgba(140,160,80,.45)', 'rgba(60,100,40,.45)'][(rng() * 3) | 0]; g.lineWidth = 1.1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (rng() - .5) * 2, py - 4 - rng() * 4); g.stroke(); if (rng() < .025) { g.fillStyle = ['#fbfaf2', '#f09020', '#6a3a9a'][(rng() * 3) | 0]; ell(g, px, py - 5, 1.5, 1.5); g.fill(); } }
      else if (b === 2) { g.fillStyle = rng() < .5 ? 'rgba(120,90,40,.4)' : 'rgba(60,80,40,.35)'; ell(g, px, py, 2.6, 1.6, rng() * 3); g.fill(); }
      else if (b === 4) { if (rng() < .06) { ell(g, px, py, 12 + rng() * 16, 3 + rng() * 5); g.fillStyle = 'rgba(70,100,100,.55)'; g.fill(); } else { g.strokeStyle = 'rgba(70,110,60,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (rng() - .5) * 3, py - 7 - rng() * 5); g.stroke(); } }
    }
  }
  const BCOL = [[104, 132, 70], [70, 92, 52], [150, 142, 124], [88, 116, 92]];

  return {
    ground, bcol: BCOL,
    heir: ysabel, mobs: { antelope: goose, hyena: wolf, machairodont: courtaud },
    flora: { pine: poplar, oak: walnut, dead: deadWillow, tuft: rye, berry: currant, boulder: cutStone, carrot: turnip, reeds: rushes, flower, sapling: osier },
    places: { cave: lodge, waterhole: lavoir, den: wolfLair, carcass: pigBones, source: brazier, timberHouse, crane, wallTower }
  };
})();
