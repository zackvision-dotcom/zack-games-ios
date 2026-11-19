/* BRAISE — Era VII · La Vapeur. Paris, 1889: the Exposition universelle and its iron tower.
   Plane trees and horse chestnuts, granite setts, gas lamps, Haussmann buildings, a Baltard iron market hall,
   a factory chimney, Morris columns, square ponds, sewer mouths, coal heaps.
   Heir: Ada (mechanic, soot on the cheek, brass goggles). Fauna: pigeons, sewer rats, the tiger escaped from
   the menagerie. Origin = ground contact, y up negative. */
window.BRAISE_ERA_ART = window.BRAISE_ERA_ART || {};
BRAISE_ERA_ART[6] = (() => {
  const K = BRAISE_ART.K, H = HEIR_KIT;
  const { TAU, INK, lerp, mulberry, ell, ink, fillInk, poly, smoothPath, blobPts, line, inkLine, inkCurve, shaded, dsEye, head, ears, torsoPath, brows, mouth, eyes, lineageMark, boot, faunaFoot, faunaJoint } = K;

  /* ======================= ADA ======================= */
  const A = { skin: '#f0dbc6', skinS: '#d4bca6', shirt: '#ece6da', shirtS: '#cfc8ba', vest: '#3a3644', trou: '#4a3a30', trouF: '#3a2e26', hair: '#5a2e1e', glove: '#7a5232' };
  const bootF = (g, x, y, side, far) => { if (side) { g.beginPath(); g.moveTo(-6, y - 11); g.lineTo(5, y - 11); g.quadraticCurveTo(12, y - 4, 11, y + 1); g.lineTo(-7, y + 1); g.closePath(); fillInk(g, far ? '#141012' : '#1f1a1c', 1.6); line(g, [[-5, y - 2], [10, y - 2]], 1, '#55505a'); } else { boot(g, x, y, far ? '#141012' : '#1f1a1c'); line(g, [[x - 3, y - 5], [x + 3, y - 5]], 1, '#55505a'); } };
  const LEGS = { leg: A.trou, legFar: A.trouF, legW: 8, foot: bootF };
  const ARMS = { sleeve: A.shirt, sleeveFar: A.shirtS, skin: A.glove, armW: 8, cuff: (g, x, y) => { inkLine(g, [[x - 4, y - 9], [x + 4, y - 9]], 3, '#d8d0c0', 1); } };
  function vest(g, back) {
    shaded(g, () => torsoPath(g, 16, 13, -68, -34), A.shirt, { hatch: back ? [-22, -70, -6, -30] : [6, -70, 22, -30], hc: 'rgba(80,70,60,.3)' });
    if (back) shaded(g, () => { g.beginPath(); g.moveTo(-14, -64); g.lineTo(14, -64); g.lineTo(14, -34); g.lineTo(-14, -34); g.closePath(); }, A.vest, { hatch: [-14, -66, 0, -30], hc: 'rgba(10,8,15,.5)', extra: () => { inkLine(g, [[-8, -40], [8, -40]], 1.6, '#55505a', .6); } });
    else { shaded(g, () => { g.beginPath(); g.moveTo(-13, -64); g.lineTo(-4, -64); g.lineTo(0, -54); g.lineTo(4, -64); g.lineTo(13, -64); g.lineTo(14, -34); g.lineTo(0, -31); g.lineTo(-14, -34); g.closePath(); }, A.vest, { hatch: [2, -66, 18, -30], hc: 'rgba(10,8,15,.5)' });
      g.fillStyle = '#c9a24a'; for (const y of [-50, -44, -38]) { ell(g, 2.5, y, 1.3, 1.3); g.fill(); } g.beginPath(); g.moveTo(-9, -44); g.quadraticCurveTo(-3, -40, 3, -43); g.strokeStyle = '#d9b25a'; g.lineWidth = 1.2; g.stroke(); ell(g, -9.5, -44, 2, 2); fillInk(g, '#d9b25a', .9);
      poly(g, [[-4, -66], [4, -66], [2.5, -60], [-2.5, -60]]); fillInk(g, '#a8322e', 1.2); }
    shaded(g, () => { g.beginPath(); g.moveTo(-14, -35); g.lineTo(14, -35); g.lineTo(13, -26); g.lineTo(-13, -26); g.closePath(); }, A.trou, {});
  }
  function goggles(g, y, side) { inkLine(g, [[side ? -20 : -23, y + 1], [side ? 16 : 23, y + 1]], 3.4, '#3a2a20', 1); for (const s of side ? [1] : [-1, 1]) { const x = side ? 8 : s * 8.5; ell(g, x, y, 7, 6); fillInk(g, '#c9a24a', 1.8); ell(g, x, y, 4.6, 3.8); fillInk(g, '#7fa3a8', 1.2); ell(g, x - 1.5, y - 1.5, 1.4, 1); g.fillStyle = '#e6f2f2'; g.fill(); } }
  function ada(g, o) {
    o = o || {}; if (o.view === 'side') return adaSide(g, o); if (o.view === 'back') return adaBack(g, o);
    H.legs(g, o, false, LEGS);
    vest(g);
    H.limb(g, o, false, false, ARMS);
    g.beginPath(); g.rect(-6, -73, 12, 7); fillInk(g, A.skin, 1.5);
    head(g, 'sapiens', A.skin);
    smoothPath(g, blobPts(0, -122, 14, 9, 10, .25, mulberry(31))); fillInk(g, A.hair, 2);
    g.beginPath(); g.moveTo(-23, -88); g.bezierCurveTo(-26, -120, 26, -120, 23, -88); g.quadraticCurveTo(14, -104, 4, -101); g.quadraticCurveTo(-10, -106, -23, -88); g.closePath(); fillInk(g, A.hair, 2.2);
    inkCurve(g, [[-21, -92], [-24, -82], [-21, -74]], 1.4, A.hair, .8); inkCurve(g, [[20, -94], [24, -84], [22, -77]], 1.4, A.hair, .8);
    goggles(g, -104);
    eyes(g, o.mood, { blink: o.blink }); brows(g, o.mood, -96); mouth(g, o.mood, -75, 4);
    g.beginPath(); g.moveTo(.5, -83); g.quadraticCurveTo(2.5, -80.5, 0, -80); ink(g, 1.2);
    g.fillStyle = 'rgba(30,25,25,.3)'; ell(g, -11, -77, 4.5, 2.6); g.fill(); ell(g, 3, -71, 3, 1.4); g.fill();
    lineageMark(g, 14, -82, 'soot');
    H.limb(g, o, true, false, ARMS);
  }
  function adaSide(g, o) {
    H.legs(g, o, true, LEGS);
    H.limb(g, o, false, true, ARMS);
    shaded(g, () => { g.beginPath(); g.moveTo(-11, -68); g.quadraticCurveTo(4, -72, 11, -66); g.quadraticCurveTo(13, -50, 12, -34); g.lineTo(-11, -34); g.quadraticCurveTo(-13, -50, -11, -68); g.closePath(); }, A.vest, { hatch: [-13, -70, 0, -32], hc: 'rgba(10,8,15,.5)' });
    line(g, [[9, -66], [6, -34]], 1.2, '#ece6da'); g.fillStyle = '#c9a24a'; for (const y of [-56, -48, -40]) { ell(g, 9, y, 1.2, 1.2); g.fill(); }
    shaded(g, () => { g.beginPath(); g.moveTo(-11, -35); g.lineTo(12, -35); g.lineTo(11, -26); g.lineTo(-10, -26); g.closePath(); }, A.trou, {});
    const prof = () => { g.beginPath(); g.moveTo(-19, -92); g.bezierCurveTo(-21, -116, 12, -120, 18, -100); g.quadraticCurveTo(19, -94, 21, -88); g.lineTo(24.5, -82); g.lineTo(20.5, -80); g.quadraticCurveTo(22, -76, 20, -74); g.quadraticCurveTo(21.5, -70.5, 17, -68.5); g.quadraticCurveTo(8, -66.5, 0, -69); g.bezierCurveTo(-12, -72, -19, -78, -19, -92); g.closePath(); };
    shaded(g, prof, A.skin, { lw: 2.4 });
    dsEye(g, 13, -89, { blink: o.blink, rx: 2.6, ry: 4.2 }); g.beginPath(); g.moveTo(8, -97); g.quadraticCurveTo(13, -99.5, 18, -97); ink(g, 2.2);
    g.beginPath(); g.moveTo(19.5, -73.5); g.quadraticCurveTo(16.5, -72.5, 14, -73.5); ink(g, 1.3);
    ell(g, -4, -86, 3.6, 5.2); fillInk(g, A.skin, 1.5); lineageMark(g, 6, -82, 'soot');
    g.beginPath(); g.moveTo(-21, -88); g.bezierCurveTo(-23, -118, 10, -122, 17, -103); g.quadraticCurveTo(6, -106, 0, -100); g.quadraticCurveTo(-8, -97, -12, -88); g.closePath(); fillInk(g, A.hair, 2.1);
    smoothPath(g, blobPts(-14, -116, 10, 8, 10, .25, mulberry(32))); fillInk(g, A.hair, 1.8);
    goggles(g, -104, true);
    H.limb(g, o, true, true, ARMS);
  }
  function adaBack(g, o) {
    H.legs(g, o, false, LEGS);
    H.limb(g, o, false, false, ARMS); H.limb(g, o, true, false, ARMS);
    vest(g, true);
    g.beginPath(); g.rect(-6, -73, 12, 7); fillInk(g, A.skin, 1.5);
    ears(g, A.skin, -90); ell(g, 0, -95, 24, 23); fillInk(g, A.hair, 2.2);
    smoothPath(g, blobPts(0, -118, 14, 10, 10, .25, mulberry(33))); fillInk(g, A.hair, 2);
    g.strokeStyle = 'rgba(150,90,60,.5)'; g.lineWidth = 1; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 5, -108); g.quadraticCurveTo(i * 6, -94, i * 5, -76); g.stroke(); }
    inkLine(g, [[-24, -102], [24, -102]], 3.4, '#3a2a20', 1);
  }

  /* ======================= FAUNA ======================= */
  /* rock pigeon — pecks, bobs, takes off when scared (role of the grazing herd) */
  function pigeon(g, p, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const fleeing = o.state === 'flee' || o.state === 'fleeing' || o.speed > 140, grazing = !moving && (o.state === 'graze' || o.state === 'grazing');
    const C = '#8a8e9a', CD = '#4a4e5a', IR = '#5a8a7a';
    const fly = fleeing && moving, lift = fly ? 18 + Math.sin(phase) * 4 : 0, peck = grazing ? Math.max(0, Math.sin(time * 6)) : 0;
    g.fillStyle = 'rgba(20,20,30,.2)'; ell(g, 0, 0, 10, 3); g.fill();
    if (!fly) for (const s of [-1, 1]) { const st = moving ? Math.sin(phase * 3 + (s > 0 ? Math.PI : 0)) * 3 : 0; line(g, [[s * 2, -7], [s * 2 + st, -1]], 1.4, '#c85a5a'); }
    g.save(); g.translate(0, -lift);
    shaded(g, () => { g.beginPath(); g.moveTo(-12, -12); g.lineTo(-18, -14); g.lineTo(-12, -16); g.quadraticCurveTo(0, -22, 8, -16); g.quadraticCurveTo(10, -8, 2, -6); g.quadraticCurveTo(-8, -6, -12, -12); g.closePath(); }, C, { extra: () => { g.strokeStyle = CD; g.lineWidth = 1.2; for (const x of [-6, -2]) { g.beginPath(); g.moveTo(x, -18); g.lineTo(x - 1, -11); g.stroke(); } } });
    if (fly) for (const s of [0, 1]) { g.save(); g.translate(-2, -16); g.rotate(-1.2 - Math.sin(phase * 6 + s) * .7); ell(g, 0, -8, 4, 10); fillInk(g, s ? CD : C, 1); g.restore(); }
    g.save(); g.translate(6, -16); g.rotate(peck * 1.1); g.translate(-6, 16);
    ell(g, 8, -18, 4.4, 4.6); fillInk(g, CD, 1); g.fillStyle = IR; ell(g, 7, -14, 3, 2); g.fill();
    poly(g, [[12, -19], [15, -18], [12, -17]]); fillInk(g, '#2a2a2a', .6); dsEye(g, 9, -19, { rx: .8, ry: .9, socket: false });
    g.restore(); g.restore();
  }
  /* sewer rat — big, scaly tail, red eyes in the dark (role of the night pack) */
  function rat(g, p, angry, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const attacking = o.state === 'attack' && Number.isFinite(o.attack) && o.attack >= 0 && o.attack < 1.05, a = attacking ? o.attack : -1;
    const threat = !!angry || attacking || o.state === 'warn';
    const lunge = attacking && a >= .45 && a < .75 ? Math.sin((a - .45) / .3 * Math.PI) : 0, loco = moving && !attacking;
    const C = '#5e544c', CD = '#2e2824', CL = '#9a8e84';
    const by = loco ? -Math.abs(Math.sin(phase * 2)) * 2 : 0, push = lunge * 8;
    g.fillStyle = 'rgba(20,20,20,.2)'; ell(g, 0, 0, 20, 4); g.fill();
    g.save(); g.translate(push, by);
    inkCurve(g, [[-16, -8], [-30, -6], [-40, -2], [-46, -6]], 2.2, '#c8a0a0', .8);
    for (const s of [-1, 1]) { const st = loco ? Math.sin(phase * 2 + (s > 0 ? 0 : Math.PI)) * 4 : 0; ell(g, -8 + st, -2, 3.4, 2); fillInk(g, '#c8a0a0', .8); ell(g, 8 - st, -2, 3, 1.8); fillInk(g, '#c8a0a0', .8); }
    shaded(g, () => smoothPath(g, blobPts(-2, -11, 17, 9, 14, .1, mulberry(71))), C, { extra: () => { g.fillStyle = CL; ell(g, 0, -4, 12, 2.4); g.fill(); }, hatch: [-19, -20, 15, -2], hc: 'rgba(20,16,12,.3)', sp: 2.4 });
    const hx = 14, hy = threat ? -8 : -12;
    shaded(g, () => { g.beginPath(); g.moveTo(hx - 4, hy - 6); g.quadraticCurveTo(hx + 6, hy - 6, hx + 14, hy + 1); g.quadraticCurveTo(hx + 6, hy + 5, hx - 4, hy + 4); g.closePath(); }, C, {});
    ell(g, hx, hy - 6, 4, 4); fillInk(g, '#a88a8a', 1); ell(g, hx + 14, hy + 1, 1.6, 1.4); fillInk(g, '#d8a0a0', .6);
    for (const s of [-1, 1]) line(g, [[hx + 12, hy + 1], [hx + 20, hy + s * 3]], .5, '#2a2a2a');
    dsEye(g, hx + 5, hy - 2, { rx: 1.2, ry: 1.2, socket: false, lens: threat ? '#e84a3a' : null });
    if (threat) { g.fillStyle = '#f2e6b0'; g.fillRect(hx + 11, hy + 2, 2, 3); }
    g.restore();
  }
  /* tiger escaped from the menagerie of the Jardin des Plantes (last-night predator) */
  function tiger(g, p, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const attacking = o.state === 'attack' && Number.isFinite(o.attack) && o.attack >= 0 && o.attack < 1.05, a = attacking ? o.attack : -1;
    const lunge = attacking && a >= .45 && a < .75 ? Math.sin((a - .45) / .3 * Math.PI) : 0, wind = attacking && a < .45 ? Math.sin(Math.min(1, a / .32) * Math.PI / 2) : 0;
    const stalk = o.state === 'stalk' || o.state === 'approach', run = o.speed > 120;
    const C = '#e0882e', CD = '#9a5218', CL = '#f8eedc', far = '#b86a22', ST = '#1c120c';
    const by = (moving ? Math.cos(phase * 2) * .6 : Math.sin(time * 1.6) * .3) + wind * 6 + (stalk ? 5 : 0), push = lunge * 15;
    const legs = [{ x: -18, far: true, back: true, ph: run ? .1 : .5 }, { x: 18, far: true, back: false, ph: run ? .6 : .25 }, { x: -22, far: false, back: true, ph: 0 }, { x: 22, far: false, back: false, ph: run ? .5 : .75 }];
    const leg = Lg => { const st = moving && !attacking ? faunaFoot(phase + Lg.ph * TAU, run ? 13 : 7.5, run ? 12 : 5.5, run ? .42 : .64) : [0, 0]; faunaJoint(g, [Lg.x + push * .4, by - 31], [Lg.x + st[0] + (Lg.back ? 0 : push), st[1] - (Lg.far ? 1.5 : 0)], 16, 16, Lg.back ? -1 : 1, Lg.far ? 3.4 : 4.2, Lg.far ? far : C, false); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(push * .5, by);
    g.save(); g.translate(-29, -38); g.rotate(.45 + Math.sin(time * 1.9) * .2); inkCurve(g, [[0, 0], [-12, 6], [-20, 18], [-18, 28]], 3, C, 1.2); for (let i = 0; i < 4; i++) { g.save(); g.translate(-8 - i * 4, 4 + i * 6); g.rotate(.8); g.fillStyle = ST; g.fillRect(-3, -1, 6, 2); g.restore(); } g.restore();
    shaded(g, () => { g.beginPath(); g.moveTo(-30, -38); g.bezierCurveTo(-29, -52, 20, -54, 27, -44); g.quadraticCurveTo(31, -31, 22, -25); g.quadraticCurveTo(0, -21, -22, -25); g.quadraticCurveTo(-31, -29, -30, -38); g.closePath(); }, C,
      { extra: () => { g.fillStyle = CL; ell(g, 0, -24, 22, 3.4); g.fill(); g.fillStyle = ST; for (let i = 0; i < 9; i++) { const x = -24 + i * 6; g.beginPath(); g.moveTo(x, -52); g.quadraticCurveTo(x + 3, -44, x - 1, -34); g.lineTo(x + 1, -34); g.quadraticCurveTo(x + 5, -44, x + 3, -52); g.closePath(); g.fill(); } } });
    const hx = 30 + lunge * 6, hy = stalk ? -40 : -48;
    shaded(g, () => smoothPath(g, blobPts(hx, hy, 12, 11, 14, .12, mulberry(72))), C, { extra: () => { g.fillStyle = CL; ell(g, hx + 6, hy + 5, 7, 4.4); g.fill(); ell(g, hx - 6, hy + 4, 5, 3.4); g.fill(); g.fillStyle = ST; for (const [x, y, r2] of [[-2, -8, .3], [3, -9, -.2], [-8, -2, .6]]) { g.save(); g.translate(hx + x, hy + y); g.rotate(r2); g.fillRect(-.8, -4, 1.6, 7); g.restore(); } } });
    for (const dx of [-7, 2]) { ell(g, hx + dx, hy - 10, 3.4, 3); fillInk(g, dx < 0 ? far : C, 1.1); }
    g.fillStyle = '#c86a6a'; ell(g, hx + 11, hy + 1.6, 2.4, 1.6); g.fill();
    dsEye(g, hx + 4, hy - 3, { rx: 1.6, ry: 1.9, socket: false, angry: stalk || attacking, lens: '#e8c040' });
    if (attacking || stalk) { g.beginPath(); g.moveTo(hx + 2, hy + 7.5); g.quadraticCurveTo(hx + 8, hy + 10.5, hx + 13, hy + 6.5); ink(g, 1.3); g.fillStyle = '#f2ead8'; poly(g, [[hx + 5, hy + 8], [hx + 6, hy + 12.5], [hx + 7.5, hy + 8.4]]); g.fill(); }
    g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }

  /* ======================= FLORA ======================= */
  /* London plane: mottled bark, broad crown (role "pine", size k) */
  function plane(g, k, seed) {
    const r = mulberry(seed), h = (200 + r() * 30) * k;
    g.fillStyle = 'rgba(30,30,30,.2)'; ell(g, 0, -2, 54 * k, 11 * k); g.fill();
    inkCurve(g, [[0, 0], [2, -h * .4], [0, -h * .62]], 11 * k, '#c8bca0', 1.6);
    for (let i = 0; i < 10; i++) { g.fillStyle = r() < .5 ? 'rgba(120,130,90,.6)' : 'rgba(220,214,190,.8)'; ell(g, (r() - .5) * 8 * k, -r() * h * .6, 3 * k, 5 * k); g.fill(); }
    for (const [x, y] of [[-30, -.7], [28, -.74]]) inkCurve(g, [[0, -h * .55], [x * .5 * k, -h * .66], [x * k, -h * -y]], 4 * k, '#c8bca0', 1.2);
    const cl = [[-38, -.76, 34, 28], [36, -.78, 34, 26], [0, -.9, 44, 30], [-20, -1, 30, 20], [22, -1, 28, 20]];
    for (const [x, y, w, hh] of cl) { smoothPath(g, blobPts(x * k, h * y, w * k, hh * k, 14, .28, r)); fillInk(g, '#4e7038', 1.9); }
    for (let i = 0; i < 36; i++) { g.fillStyle = r() < .5 ? 'rgba(140,180,90,.55)' : 'rgba(30,50,20,.4)'; ell(g, (r() - .5) * 130 * k, -h * (.7 + r() * .3), 4 * k, 2.6 * k, r() * 3); g.fill(); }
    inkCurve(g, [[-36 * k, -h * .1], [0, -h * .02], [36 * k, -h * .1]], 1, '#1c1c1c', .2);
  }
  /* horse chestnut in flower (role "oak") */
  function chestnut(g, v) {
    const r = mulberry(260 + v);
    g.fillStyle = 'rgba(30,30,30,.2)'; ell(g, 0, -2, 62, 12); g.fill();
    inkCurve(g, [[0, 0], [-2, -50], [0, -80]], 13, '#5a4a3e', 1.8);
    smoothPath(g, blobPts(0, -130, 68, 58, 18, .18, r)); fillInk(g, '#3e6a2e', 2);
    for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(110,150,70,.5)'; smoothPath(g, blobPts(-46 + r() * 92, -150 + r() * 56, 14, 9, 9, .4, r)); g.fill(); }
    for (let i = 0; i < 16; i++) { const x = -54 + r() * 108, y = -170 + r() * 76; poly(g, [[x - 3, y + 4], [x, y - 8], [x + 3, y + 4]]); fillInk(g, '#fbf6ee', .6); g.fillStyle = '#e8a0b0'; ell(g, x, y, .9, .9); g.fill(); }
  }
  /* pollarded plane in winter (role "dead") */
  function bareTree(g, v) { const r = mulberry(360 + v); g.fillStyle = 'rgba(30,30,30,.18)'; ell(g, 0, -2, 26, 6); g.fill(); inkCurve(g, [[0, 0], [1, -60], [0, -100]], 9, '#b8ac90', 1.6); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i / 4 - .5) * 1.8; smoothPath(g, blobPts(Math.cos(a) * 10, -100 + Math.sin(a) * 6, 5, 4, 7, .3, r)); fillInk(g, '#a8a080', 1); for (let k = 0; k < 4; k++) line(g, [[Math.cos(a) * 10, -100 + Math.sin(a) * 6], [Math.cos(a) * (18 + r() * 14), -110 - r() * 26]], 1.1, '#8a8070'); } }
  /* lawn tuft, trimmed (role "tuft") */
  function lawnTuft(g, picked) { const r = mulberry(520); g.fillStyle = 'rgba(30,30,30,.14)'; ell(g, 0, -1, 18, 4); g.fill(); for (let i = 0; i < (picked ? 8 : 18); i++) { const x = (r() - .5) * 24, L2 = picked ? 5 : 14 + r() * 12; line(g, [[x, 0], [x + (r() - .5) * 5, -L2]], 1.6, ['#5a8a3a', '#7aa04a', '#4a7a32'][i % 3]); } if (!picked) for (let i = 0; i < 2; i++) { g.fillStyle = '#fbfaf2'; ell(g, (r() - .5) * 16, -14 - r() * 6, 2, 2); g.fill(); } }
  /* raspberry canes in a workers' garden (role "berry") */
  function raspberry(g, picked, v) { const r = mulberry(660 + v); g.fillStyle = 'rgba(30,30,30,.16)'; ell(g, 0, -1, 30, 6); g.fill(); inkLine(g, [[-24, 0], [-24, -40]], 1.6, '#8a6a4a', .5); inkLine(g, [[24, 0], [24, -40]], 1.6, '#8a6a4a', .5); line(g, [[-24, -32], [24, -32]], .8, '#a8a8a8'); for (let i = 0; i < 6; i++) inkCurve(g, [[-14 + i * 6, 0], [-14 + i * 6 + 3, -24], [-14 + i * 6 + 8, -38]], 1.6, '#8a4a3a', .5); for (let i = 0; i < 12; i++) { ell(g, -24 + r() * 48, -36 + r() * 26, 5, 3, r() * 3); fillInk(g, i % 2 ? '#5a8a3a' : '#4a7a32', .6); } if (!picked) for (let i = 0; i < 10; i++) { ell(g, -20 + r() * 40, -30 + r() * 20, 2, 2.2); fillInk(g, '#d83a4a', .4); } }
  /* coal heap by the factory (role "boulder") */
  function coal(g, v, stage) { const r = mulberry(770 + v), w = 46 - stage * 10, h = 36 - stage * 10; g.fillStyle = 'rgba(20,20,20,.25)'; ell(g, 0, -2, w + 6, 8); g.fill(); smoothPath(g, blobPts(0, -h * .45, w, h * .6, 14, .2, r).map(([x, y]) => [x, Math.min(0, y)])); fillInk(g, '#2a2a2e', 2); for (let i = 0; i < 30 - stage * 8; i++) { const x = -w * .8 + r() * w * 1.6, y = -r() * h; poly(g, blobPts(x, y, 3, 2.4, 5, .5, r)); fillInk(g, r() < .5 ? '#3a3a40' : '#1c1c20', .5); g.fillStyle = 'rgba(160,170,190,.5)'; ell(g, x - 1, y - 1, .8, .6); g.fill(); } }
  /* potato plants (role "carrot") */
  function potato(g) { for (const dx of [-8, 8]) { for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i / 4 - .5) * 2; inkCurve(g, [[dx, 0], [dx + Math.cos(a) * 8, -8 + Math.sin(a) * 6], [dx + Math.cos(a) * 12, -10 + Math.sin(a) * 10]], 1.4, '#4a7a32', .4); ell(g, dx + Math.cos(a) * 12, -10 + Math.sin(a) * 10, 3, 2, a); fillInk(g, '#5a8a3a', .4); } g.fillStyle = '#fbfaf2'; ell(g, dx, -20, 1.6, 1.6); g.fill(); } }
  /* cattails in the canal (role "reeds") */
  function cattail(g, v) { const r = mulberry(1000 + v); for (let i = 0; i < 10; i++) { const x = (r() - .5) * 26, L2 = 40 + r() * 30; line(g, [[x, 0], [x + (r() - .5) * 6, -L2 - 10]], 1.4, '#6a8a3a'); if (i % 2) { ell(g, x + (r() - .5) * 2, -L2, 2.4, 7); fillInk(g, '#6a4a2a', .6); line(g, [[x, -L2 - 7], [x, -L2 - 14]], .8, '#6a8a3a'); } } }
  /* park flowers: red geranium, dahlia, tulip, pansy, marigold */
  function flower(g, v) {
    line(g, [[0, 0], [0, -15]], 1.2, '#4a7a32');
    if (v === 0) { for (let i = 0; i < 6; i++) { ell(g, (i % 3 - 1) * 3, -17 - Math.floor(i / 3) * 3, 2, 2); fillInk(g, '#d8282a', .4); } }
    else if (v === 1) { for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ell(g, Math.cos(a) * 3.4, -17 + Math.sin(a) * 3.4, 1.2, 3, a + Math.PI / 2); fillInk(g, '#c83a8a', .3); } }
    else if (v === 2) { g.beginPath(); g.moveTo(-3.6, -16); g.quadraticCurveTo(-4, -22, -2, -24); g.lineTo(0, -21); g.lineTo(2, -24); g.quadraticCurveTo(4, -22, 3.6, -16); g.quadraticCurveTo(0, -13, -3.6, -16); g.closePath(); fillInk(g, '#e8c040', .6); }
    else if (v === 3) { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2; ell(g, Math.cos(a) * 2.6, -16 + Math.sin(a) * 2.6, 2.4, 2, a); fillInk(g, i < 2 ? '#5a3a9a' : '#e8d04a', .4); } }
    else { for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ell(g, Math.cos(a) * 3, -16 + Math.sin(a) * 3, 1.2, 2.6, a + Math.PI / 2); fillInk(g, '#f0a020', .3); } }
  }
  /* lilac bush (role "sapling") */
  function lilac(g, picked) { const r = mulberry(440); for (let i = 0; i < 5; i++) { const a = (i / 4 - .5) * 1.1, L2 = picked ? 12 : 34; inkCurve(g, [[0, 0], [Math.sin(a) * L2 * .5, -L2 * .5], [Math.sin(a) * L2, -Math.cos(a) * L2]], 1.6, '#6a5a4a', .5); if (!picked) { for (let j = 0; j < 3; j++) { ell(g, Math.sin(a) * L2 * (.5 + j * .2) + 3, -Math.cos(a) * L2 * (.5 + j * .2), 4, 2.6, a); fillInk(g, '#4a7a32', .4); } smoothPath(g, blobPts(Math.sin(a) * L2, -Math.cos(a) * L2 - 6, 4, 7, 8, .4, r)); fillInk(g, '#b08ad0', .6); } } }

  /* ======================= PLACES ======================= */
  /* Baltard pavilion: iron columns, glass roof, open front (shelter, cave volume) */
  function baltard(g) {
    g.fillStyle = 'rgba(20,20,20,.22)'; ell(g, 0, -1, 166, 18); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-152, -132, 304, 132); }, '#c8b89a', { lw: 2.4, extra: () => { g.strokeStyle = 'rgba(80,70,50,.35)'; g.lineWidth = 1; for (let y = -126; y < 0; y += 9) { g.beginPath(); g.moveTo(-152, y); g.lineTo(152, y); g.stroke(); } } });
    g.beginPath(); g.rect(-114, -110, 228, 110); const gr = g.createLinearGradient(0, -110, 0, 0); gr.addColorStop(0, '#2e3438'); gr.addColorStop(1, '#5a5a56'); g.fillStyle = gr; g.fill(); ink(g, 2);
    for (const x of [-152, -114, 114, 152]) { inkLine(g, [[x, 0], [x, -132]], 4, '#3a4a4e', 1); ell(g, x, -134, 4, 3); fillInk(g, '#3a4a4e', 1); }
    for (let x = -114; x < 114; x += 28) { g.beginPath(); g.arc(x + 14, -110, 14, Math.PI, 0); g.lineWidth = 1.6; g.strokeStyle = '#3a4a4e'; g.stroke(); }
    shaded(g, () => poly(g, [[-170, -132], [-120, -184], [120, -184], [170, -132]]), '#9ab8c4', { lw: 2.2, extra: () => { g.strokeStyle = 'rgba(40,60,70,.7)'; g.lineWidth = 1.2; for (let x = -164; x < 166; x += 16) { g.beginPath(); g.moveTo(x, -132); g.lineTo(x * .72, -184); g.stroke(); } g.beginPath(); g.moveTo(-150, -150); g.lineTo(150, -150); g.moveTo(-136, -166); g.lineTo(136, -166); g.stroke(); g.fillStyle = 'rgba(255,255,255,.35)'; poly(g, [[-80, -140], [-60, -180], [-40, -180], [-60, -140]]); g.fill(); } });
    shaded(g, () => poly(g, [[-122, -184], [-80, -206], [80, -206], [122, -184]]), '#4a5a62', { lw: 2 });
    for (let i = 0; i < 4; i++) { poly(g, [[-90 + i * 50, -40], [-70 + i * 50, -40], [-66 + i * 50, -22], [-94 + i * 50, -22]]); fillInk(g, ['#c8783a', '#7a9a3a', '#d8c04a', '#a83a3a'][i], 1); }
  }
  /* square's round pond with a little fountain (role "waterhole") */
  function pond(g) {
    smoothPath(g, blobPts(0, 0, 76, 24, 28, .01, mulberry(101))); fillInk(g, '#b8b0a0', 2.2);
    ell(g, 0, 1, 66, 18); g.fillStyle = '#4a6e78'; g.fill(); g.strokeStyle = 'rgba(30,50,60,.6)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = 'rgba(220,240,245,.45)'; ell(g, -14, -3, 26, 5); g.fill();
    shaded(g, () => { g.beginPath(); g.moveTo(-6, 0); g.lineTo(-4, -28); g.lineTo(4, -28); g.lineTo(6, 0); g.closePath(); }, '#3a4a4e', { lw: 1.6 }); ell(g, 0, -30, 12, 3.4); fillInk(g, '#3a4a4e', 1.4);
    for (const s of [-1, 1]) inkCurve(g, [[s * 4, -36], [s * 14, -44], [s * 22, -26], [s * 26, -6]], 1.6, '#cfe8ee', .3);
    poly(g, [[30, 6], [44, 6], [40, 0], [36, 0]]); fillInk(g, '#f2eee2', .8); line(g, [[37, 0], [37, -10]], .8, INK); poly(g, [[37, -10], [44, -4], [37, -4]]); fillInk(g, '#fbfaf2', .6);
  }
  /* sewer mouth with an iron grate (role "den") */
  function sewer(g) {
    shaded(g, () => poly(g, [[-66, 0], [-64, -50], [64, -50], [66, 0]]), '#9a9080', { lw: 2.2, extra: () => { g.strokeStyle = 'rgba(60,50,40,.4)'; g.lineWidth = 1; for (let y = -44; y < 0; y += 9) for (let x = -64 + (y / 9 % 2) * 9; x < 66; x += 18) g.strokeRect(x, y, 18, 9); } });
    g.beginPath(); g.moveTo(-30, 0); g.lineTo(-30, -20); g.arc(0, -20, 30, Math.PI, 0); g.lineTo(30, 0); g.closePath(); g.fillStyle = '#121010'; g.fill(); ink(g, 2);
    for (let x = -24; x <= 24; x += 8) line(g, [[x, 0], [x, -Math.sqrt(Math.max(0, 900 - x * x)) - 20 + 6]], 2, '#3a3a3a');
    g.fillStyle = 'rgba(70,90,70,.6)'; ell(g, 0, 4, 34, 4); g.fill();
    for (const [x, y] of [[-8, -10], [10, -14]]) { g.fillStyle = '#e84a3a'; ell(g, x, y, 1.2, 1); g.fill(); ell(g, x + 4, y, 1.2, 1); g.fill(); }
  }
  /* bones of a cab horse (role "carcass") */
  function horseBones(g) { smoothPath(g, blobPts(0, -4, 36, 8, 12, .25, mulberry(452))); g.fillStyle = 'rgba(60,60,60,.3)'; g.fill(); for (let i = 0; i < 6; i++) { const x = -26 + i * 8; g.beginPath(); g.moveTo(x, -4); g.quadraticCurveTo(x + 3, -18, x + 8, -14); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.4; g.strokeStyle = '#efe6d2'; g.stroke(); } shaded(g, () => { g.beginPath(); g.moveTo(22, -6); g.lineTo(26, -16); g.lineTo(46, -12); g.lineTo(46, -6); g.closePath(); }, '#efe6d2', {}); g.fillStyle = INK; ell(g, 30, -11, 1.6, 2); g.fill(); poly(g, [[-36, -2], [-30, -8], [-28, 0]]); fillInk(g, '#5a5a5a', .8); }
  /* stationary steam engine's boiler with its firebox open (source of fire) */
  function boiler(g, lit) {
    g.fillStyle = 'rgba(20,20,20,.24)'; ell(g, 0, -1, 46, 10); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-34, -40, 68, 40); }, '#5a3a2e', { lw: 2, extra: () => { g.strokeStyle = 'rgba(30,15,10,.45)'; g.lineWidth = 1; for (let y = -34; y < 0; y += 6) { g.beginPath(); g.moveTo(-34, y); g.lineTo(34, y); g.stroke(); } } });
    shaded(g, () => { g.beginPath(); g.ellipse(0, -56, 30, 18, 0, 0, TAU); }, '#3a3e44', { hatch: [0, -74, 30, -38], hc: 'rgba(10,10,15,.4)', lw: 2 });
    g.fillStyle = '#c9a24a'; for (let i = 0; i < 7; i++) { const a = Math.PI * (1.1 + i * .13); ell(g, Math.cos(a) * 26, -56 + Math.sin(a) * 15, 1.4, 1.4); g.fill(); }
    inkLine(g, [[18, -70], [18, -96]], 6, '#2e3236', 1.2); ell(g, -12, -74, 5, 5); fillInk(g, '#e6dcc0', 1.2); line(g, [[-12, -74], [-10, -77]], 1, INK);
    g.beginPath(); g.rect(-12, -26, 24, 16); g.fillStyle = lit ? '#2a120a' : '#2a2222'; g.fill(); ink(g, 1.6);
    if (lit) { g.fillStyle = 'rgba(255,150,50,.65)'; g.fillRect(-10, -24, 20, 12); }
  }
  /* Haussmann building: dressed stone, wrought-iron balconies, zinc mansard */
  function haussmann(g, v) {
    const r = mulberry(1800 + v), w = 120;
    g.fillStyle = 'rgba(20,20,20,.22)'; ell(g, 0, -1, w + 18, 16); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-w, -250, w * 2, 250); }, '#e6dcc4', { light: '#f0e8d4', lb: [-40, -200, 70, 50], hatch: [w * .5, -250, w, 0], hc: 'rgba(90,80,60,.3)', lw: 2.4, extra: () => { g.strokeStyle = 'rgba(140,130,110,.4)'; g.lineWidth = 1; for (let y = -244; y < 0; y += 12) { g.beginPath(); g.moveTo(-w, y); g.lineTo(w, y); g.stroke(); } } });
    for (let x = -w + 12; x < w - 20; x += 46) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, -44); g.arc(x + 15, -44, 15, Math.PI, 0); g.lineTo(x + 30, 0); g.closePath(); fillInk(g, v % 2 ? '#3a5a4a' : '#5a2a2a', 1.6); g.fillStyle = 'rgba(230,200,120,.6)'; g.fillRect(x + 4, -40, 22, 14); }
    for (const [y, bal] of [[-110, 1], [-160, 0], [-208, 1]]) for (let x = -w + 18; x < w - 14; x += 46) { g.beginPath(); g.rect(x, y, 22, 36); fillInk(g, '#2a2e34', 1.2); line(g, [[x + 11, y], [x + 11, y + 36]], 1, '#e6dcc4'); if (bal) { g.strokeStyle = INK; g.lineWidth = 1.2; g.strokeRect(x - 3, y + 26, 28, 10); for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(x + 1 + k * 4.4, y + 31, 2, 0, TAU); g.stroke(); } } }
    shaded(g, () => { g.beginPath(); g.rect(-w - 6, -64, w * 2 + 12, 8); }, '#d6ccb4', { lw: 1.6 });
    shaded(g, () => poly(g, [[-w - 8, -250], [-w + 10, -296], [w - 10, -296], [w + 8, -250]]), '#7a8a96', { hatch: [0, -296, w + 8, -250], hc: 'rgba(30,40,50,.4)', lw: 2.2 });
    for (let x = -w + 30; x < w - 20; x += 50) { shaded(g, () => { g.beginPath(); g.rect(x, -290, 18, 26); }, '#e6dcc4', { lw: 1.4 }); g.fillStyle = '#2a2e34'; g.fillRect(x + 4, -284, 10, 16); }
    for (const x of [-w + 20, w - 34]) { shaded(g, () => { g.beginPath(); g.rect(x, -320, 16, 26); }, '#b8604a', { lw: 1.4 }); }
  }
  /* factory with its tall brick chimney */
  function factory(g) {
    g.fillStyle = 'rgba(20,20,20,.22)'; ell(g, 0, -1, 150, 16); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-140, -110, 210, 110); }, '#a8583e', { hatch: [10, -110, 70, 0], hc: 'rgba(50,20,10,.4)', lw: 2.4, extra: () => { g.strokeStyle = 'rgba(60,25,15,.4)'; g.lineWidth = 1; for (let y = -104; y < 0; y += 8) { g.beginPath(); g.moveTo(-140, y); g.lineTo(70, y); g.stroke(); } } });
    for (let i = 0; i < 4; i++) shaded(g, () => poly(g, [[-140 + i * 52, -110], [-140 + i * 52, -146], [-88 + i * 52, -110]]), '#5a6068', { lw: 1.8, extra: () => { g.fillStyle = 'rgba(160,200,220,.6)'; poly(g, [[-136 + i * 52, -114], [-136 + i * 52, -138], [-100 + i * 52, -114]]); g.fill(); } });
    for (let x = -126; x < 60; x += 40) { g.beginPath(); g.moveTo(x, -30); g.lineTo(x, -70); g.arc(x + 12, -70, 12, Math.PI, 0); g.lineTo(x + 24, -30); g.closePath(); fillInk(g, '#2a2e34', 1.4); g.fillStyle = 'rgba(240,190,90,.5)'; g.fillRect(x + 3, -66, 18, 30); }
    shaded(g, () => poly(g, [[86, 0], [94, -360], [118, -360], [126, 0]]), '#9a4a34', { hatch: [106, -360, 126, 0], hc: 'rgba(50,20,10,.4)', lw: 2.4, extra: () => { g.strokeStyle = 'rgba(60,25,15,.45)'; g.lineWidth = 1; for (let y = -354; y < 0; y += 9) { g.beginPath(); g.moveTo(80, y); g.lineTo(130, y); g.stroke(); } } });
    shaded(g, () => { g.beginPath(); g.rect(88, -376, 36, 16); }, '#7a3a2a', { lw: 1.8 });
  }
  /* gas lamp */
  function gasLamp(g) { g.fillStyle = 'rgba(20,20,20,.2)'; ell(g, 0, -1, 14, 4); g.fill(); shaded(g, () => { g.beginPath(); g.rect(-7, -16, 14, 16); }, '#2e3a36', { lw: 1.4 }); inkLine(g, [[0, -16], [0, -112]], 3.6, '#2e3a36', 1.2); inkLine(g, [[-10, -98], [10, -98]], 2, '#2e3a36', .8); poly(g, [[-10, -112], [10, -112], [7, -136], [-7, -136]]); fillInk(g, '#f6d27a', 1.6); line(g, [[0, -112], [0, -136]], 1, '#2e3a36'); poly(g, [[-12, -136], [0, -148], [12, -136]]); fillInk(g, '#2e3a36', 1.4); }
  /* Morris column with posters */
  function morris(g) { g.fillStyle = 'rgba(20,20,20,.2)'; ell(g, 0, -1, 24, 6); g.fill(); shaded(g, () => { g.beginPath(); g.rect(-18, -110, 36, 110); }, '#3a5a4a', { lw: 2 }); for (const [y, c] of [[-100, '#e8c04a'], [-70, '#d8504a'], [-40, '#f2eee2']]) { shaded(g, () => { g.beginPath(); g.rect(-14, y, 28, 26); }, c, { lw: 1 }); line(g, [[-10, y + 6], [8, y + 6]], 1.4, INK); line(g, [[-10, y + 12], [4, y + 12]], 1, INK); } shaded(g, () => { g.beginPath(); g.moveTo(-24, -110); g.quadraticCurveTo(0, -140, 24, -110); g.closePath(); }, '#3a5a4a', { lw: 2 }); ell(g, 0, -134, 4, 4); fillInk(g, '#3a5a4a', 1); }

  /* ======================= GROUND ======================= */
  function ground(g, o) {
    const { x0, y0, CH, land, rng } = o;
    // granite setts in rows on the "rock" biome
    for (let j = 0; j < CH; j += 7) for (let i = (j / 7 % 2) * 6; i < CH; i += 12) { if (land(i, j) !== 3) continue; g.fillStyle = rng() < .5 ? '#7a7a80' : '#6a6a72'; g.fillRect(i - 5, j - 3, 10, 5.6); g.strokeStyle = 'rgba(30,30,36,.6)'; g.lineWidth = .9; g.strokeRect(i - 5, j - 3, 10, 5.6); }
    g.lineCap = 'round';
    for (let k = 0; k < 520; k++) {
      const px = rng() * CH, py = rng() * CH, b = land(px, py); if (!b || b === 3) continue;
      if (b === 1) { g.strokeStyle = ['rgba(70,120,50,.5)', 'rgba(120,160,70,.45)', 'rgba(50,90,40,.45)'][(rng() * 3) | 0]; g.lineWidth = 1.1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (rng() - .5) * 2, py - 3 - rng() * 3); g.stroke(); }
      else if (b === 2) { g.fillStyle = rng() < .6 ? 'rgba(200,190,160,.5)' : 'rgba(120,100,70,.4)'; ell(g, px, py, 1.6, 1.2); g.fill(); if (rng() < .05) { g.fillStyle = 'rgba(180,120,50,.6)'; ell(g, px, py, 3, 1.6, rng() * 3); g.fill(); } }
      else if (b === 4) { if (rng() < .06) { ell(g, px, py, 12 + rng() * 16, 3 + rng() * 5); g.fillStyle = 'rgba(60,80,80,.55)'; g.fill(); } else { g.strokeStyle = 'rgba(60,100,50,.5)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (rng() - .5) * 3, py - 6 - rng() * 4); g.stroke(); } }
    }
  }
  const BCOL = [[96, 128, 70], [130, 120, 96], [118, 116, 118], [84, 108, 92]];

  return {
    ground, bcol: BCOL,
    heir: ada, mobs: { antelope: pigeon, hyena: rat, machairodont: tiger },
    flora: { pine: plane, oak: chestnut, dead: bareTree, tuft: lawnTuft, berry: raspberry, boulder: coal, carrot: potato, reeds: cattail, flower, sapling: lilac },
    places: { cave: baltard, waterhole: pond, den: sewer, carcass: horseBones, source: boiler, haussmann, factory, gasLamp, morris }
  };
})();
