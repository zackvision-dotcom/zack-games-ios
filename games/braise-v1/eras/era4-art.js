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
