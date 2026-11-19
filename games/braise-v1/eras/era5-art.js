/* BRAISE — Era V · L'Empire. Rome, 80 AD, the year the Colosseum opens.
   Umbrella pines and cypresses, olive groves, the Tiber's giant cane, basalt-paved streets,
   brick insulae with tiled roofs, a portico, marble fountains, aqueduct arches, the round temple of Vesta.
   Heir: Livia (servant of the Vestals, keeper of the sacred fire). Fauna: sheep flock, stray molossus dogs,
   a leopard escaped from the games. Origin = ground contact, y up negative. */
window.BRAISE_ERA_ART = window.BRAISE_ERA_ART || {};
BRAISE_ERA_ART[4] = (() => {
  const K = BRAISE_ART.K, H = HEIR_KIT;
  const { TAU, INK, lerp, mulberry, ell, ink, fillInk, poly, smoothPath, blobPts, line, inkLine, inkCurve, shaded, dsEye, head, ears, torsoPath, brows, mouth, eyes, blush, faunaFoot, faunaJoint } = K;

  /* ======================= LIVIA ======================= */
  const L = { skin: '#d8a882', skinS: '#b98b68', stola: '#f2eadc', stolaS: '#d6ccb8', palla: '#8a2a2a', pallaS: '#6a1e1e', hair: '#4a2a18', sandal: '#8a5a32' };
  const sandal = (g, x, y, side, far) => { const c = far ? L.skinS : L.skin; if (side) { ell(g, 1, y - 2, 7.5, 2.6); fillInk(g, c, 1.3); g.beginPath(); g.moveTo(-7, y); g.lineTo(10, y); g.lineTo(9, y + 1.6); g.lineTo(-7, y + 1.6); g.closePath(); fillInk(g, L.sandal, 1); for (const xx of [-2, 3]) line(g, [[xx, y - 4], [xx + 1, y]], 1.1, L.sandal); }
    else { ell(g, x, y - 1.6, 6, 2.8); fillInk(g, c, 1.3); ell(g, x, y, 7.5, 2.2); fillInk(g, L.sandal, 1); for (const k of [-3, 0, 3]) line(g, [[x + k, y - 3.6], [x + k * .7, y - .4]], 1, L.sandal); } };
  const LEGS = { leg: L.stolaS, legFar: '#c4baa6', legW: 9, foot: sandal };
  const ARMS = { sleeve: L.skin, sleeveFar: L.skinS, skin: L.skin, armW: 6.8, cuff: (g, x, y) => { inkLine(g, [[x - 3, y - 2.6], [x + 3, y - 2.6]], 1.6, '#c8a24a', .6); } };
  function stola(g, back) {
    // long stola falling to the ankles, palla wrapped over the shoulder
    shaded(g, () => { g.beginPath(); g.moveTo(-14, -66); g.quadraticCurveTo(0, -69, 14, -66); g.quadraticCurveTo(18, -40, 19, -10); g.quadraticCurveTo(0, -6, -19, -10); g.quadraticCurveTo(-18, -40, -14, -66); g.closePath(); }, L.stola, { hatch: back ? [-20, -68, -4, -8] : [4, -68, 20, -8], hc: 'rgba(120,100,80,.3)', extra: () => { g.strokeStyle = 'rgba(140,120,100,.45)'; g.lineWidth = 1; for (const x of [-10, -4, 3, 9]) { g.beginPath(); g.moveTo(x * .8, -46); g.quadraticCurveTo(x * 1.1, -26, x * 1.2, -10); g.stroke(); } } });
    inkLine(g, [[-13, -50], [13, -50]], 1.6, '#c8a24a', .7);
    shaded(g, () => { g.beginPath(); g.moveTo(back ? 14 : -15, -66); g.quadraticCurveTo(0, -58, back ? -16 : 16, -36); g.lineTo(back ? -19 : 19, -26); g.quadraticCurveTo(back ? -6 : 6, -40, back ? 12 : -12, -54); g.closePath(); }, L.palla, { hatch: [back ? -20 : 4, -66, back ? 0 : 20, -26], hc: 'rgba(40,10,10,.35)' });
  }
  function hairFront(g) {
    // centre parting, waves, bun behind (seen as a crown) and a fillet ribbon
    g.beginPath(); g.moveTo(-23, -86); g.bezierCurveTo(-26, -120, 26, -120, 23, -86); g.quadraticCurveTo(18, -100, 1, -104); g.lineTo(-1, -104); g.quadraticCurveTo(-18, -100, -23, -86); g.closePath(); fillInk(g, L.hair, 2.2);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(s * (8 + i * 5), -104 + i * 4, 3.4, 0, Math.PI); g.strokeStyle = 'rgba(140,90,60,.6)'; g.lineWidth = 1; g.stroke(); }
    inkCurve(g, [[-21, -98], [0, -108], [21, -98]], 2, '#f2eadc', .8);
  }
  function vesta(g, x, y) { for (let i = 0; i < 3; i++) line(g, [[x - 4, y + i * 3.2 - 1], [x + 4, y + i * 3.2 + 1.4]], 1.6, '#8a2a2a'); }
  function livia(g, o) {
    o = o || {}; if (o.view === 'side') return liviaSide(g, o); if (o.view === 'back') return liviaBack(g, o);
    H.legs(g, o, false, LEGS);
    stola(g);
    H.limb(g, o, false, false, ARMS);
    g.beginPath(); g.rect(-5.5, -73, 11, 7); fillInk(g, L.skin, 1.4);
    head(g, 'sapiens', L.skin);
    hairFront(g);
    eyes(g, o.mood, { blink: o.blink }); brows(g, o.mood, -98); blush(g, 'rgba(215,110,100,.3)'); mouth(g, o.mood);
    g.beginPath(); g.moveTo(.5, -84); g.quadraticCurveTo(2.2, -81.5, 0, -81); ink(g, 1.2);
    vesta(g, 13, -84);
    H.limb(g, o, true, false, ARMS);
  }
  function liviaSide(g, o) {
    H.legs(g, o, true, LEGS);
    H.limb(g, o, false, true, ARMS);
    shaded(g, () => { g.beginPath(); g.moveTo(-10, -66); g.quadraticCurveTo(4, -70, 11, -64); g.quadraticCurveTo(16, -40, 16, -10); g.lineTo(-14, -10); g.quadraticCurveTo(-14, -40, -10, -66); g.closePath(); }, L.stola, { hatch: [-15, -68, 0, -8], hc: 'rgba(120,100,80,.3)' });
    shaded(g, () => { g.beginPath(); g.moveTo(-12, -66); g.quadraticCurveTo(4, -60, 14, -40); g.lineTo(16, -30); g.quadraticCurveTo(-2, -44, -12, -54); g.closePath(); }, L.palla, { hatch: [-12, -66, 16, -30], hc: 'rgba(40,10,10,.35)' });
    const prof = () => { g.beginPath(); g.moveTo(-19, -92); g.bezierCurveTo(-21, -116, 12, -120, 18, -100); g.quadraticCurveTo(19, -94, 21, -88); g.lineTo(24.5, -82); g.lineTo(20.5, -80); g.quadraticCurveTo(22, -76, 20, -74); g.quadraticCurveTo(21.5, -70.5, 17, -68.5); g.quadraticCurveTo(8, -66.5, 0, -69); g.bezierCurveTo(-12, -72, -19, -78, -19, -92); g.closePath(); };
    shaded(g, prof, L.skin, { lw: 2.4 });
    dsEye(g, 13, -89, { blink: o.blink, rx: 2.6, ry: 4.2 }); g.beginPath(); g.moveTo(8, -97); g.quadraticCurveTo(13, -99.5, 18, -97); ink(g, 2.2);
    g.beginPath(); g.moveTo(19.5, -73.5); g.quadraticCurveTo(16.5, -72.5, 14, -73.5); ink(g, 1.3);
    g.fillStyle = 'rgba(215,110,100,.3)'; ell(g, 9, -79, 4, 2.3); g.fill();
    ell(g, -4, -86, 3.6, 5.2); fillInk(g, L.skin, 1.5); vesta(g, 6, -83);
    g.beginPath(); g.moveTo(-21, -88); g.bezierCurveTo(-23, -118, 10, -122, 17, -103); g.quadraticCurveTo(6, -106, 0, -100); g.quadraticCurveTo(-8, -97, -12, -88); g.closePath(); fillInk(g, L.hair, 2.1);
    smoothPath(g, blobPts(-20, -90, 9, 8, 10, .2, mulberry(55))); fillInk(g, L.hair, 1.8); inkCurve(g, [[-14, -108], [-24, -98]], 1.8, '#f2eadc', .7);
    H.limb(g, o, true, true, ARMS);
  }
  function liviaBack(g, o) {
    H.legs(g, o, false, LEGS);
    H.limb(g, o, false, false, ARMS); H.limb(g, o, true, false, ARMS);
    stola(g, true);
    ears(g, L.skin, -90); ell(g, 0, -95, 24, 23); fillInk(g, L.hair, 2.2);
    smoothPath(g, blobPts(0, -80, 11, 9, 12, .2, mulberry(56))); fillInk(g, L.hair, 1.8);
    g.strokeStyle = 'rgba(140,90,60,.5)'; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(0, -80, 3 + i * 2.4, 0, Math.PI * 1.6); g.stroke(); }
    inkCurve(g, [[-22, -100], [0, -96], [22, -100]], 2, '#f2eadc', .8);
  }

  /* ======================= FAUNA ======================= */
  /* sheep of the Roman Campagna — creamy fleece, dark face (role of the grazing herd) */
  function sheep(g, p, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const fleeing = o.state === 'flee' || o.state === 'fleeing' || o.speed > 140, grazing = !moving && (o.state === 'graze' || o.state === 'grazing');
    const W = '#ece2cc', WD = '#c8bca4', F = '#3a2e26', far = '#2a221c';
    const graze = grazing ? .96 + Math.sin(time * 1.9) * .018 : 0, by = (moving ? (fleeing ? -2.6 * Math.max(0, Math.sin(phase * 2)) : Math.cos(phase * 2) * .5) : Math.sin(time * 2) * .2);
    const legs = [{ x: -11, far: true, back: true, ph: .5 }, { x: 11, far: true, back: false, ph: .25 }, { x: -14, far: false, back: true, ph: 0 }, { x: 14, far: false, back: false, ph: .75 }];
    const leg = Lg => { const st = moving ? faunaFoot(phase + Lg.ph * TAU, fleeing ? 9 : 5, fleeing ? 9 : 4.5, .6) : [0, 0]; faunaJoint(g, [Lg.x, by - 20], [Lg.x + st[0], st[1] - (Lg.far ? 1.3 : 0)], 10, 11, Lg.back ? -1 : 1, Lg.far ? 2 : 2.4, Lg.far ? far : F, true); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(0, by);
    shaded(g, () => smoothPath(g, blobPts(0, -30, 22, 13, 18, .18, mulberry(61))), W, { extra: () => { g.strokeStyle = 'rgba(150,130,100,.5)'; g.lineWidth = 1; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; g.beginPath(); g.arc(Math.cos(a) * 12, -30 + Math.sin(a) * 6, 3, 0, Math.PI * 1.4); g.stroke(); } }, hatch: [-22, -43, -6, -17], hc: 'rgba(120,100,70,.25)' });
    g.save(); g.translate(18, -32); g.rotate(graze * 1.1); g.translate(-18, 32);
    shaded(g, () => { g.beginPath(); g.moveTo(16, -40); g.quadraticCurveTo(26, -44, 32, -36); g.quadraticCurveTo(33, -30, 28, -28); g.quadraticCurveTo(20, -28, 16, -32); g.closePath(); }, F, {});
    ell(g, 18, -40, 5, 4); fillInk(g, W, 1); ell(g, 20, -36, 4, 1.8, -.4); fillInk(g, F, .8);
    dsEye(g, 26, -36, { rx: 1.1, ry: 1.4, socket: false, blink: ((time + .7) % 5) > 4.86 });
    g.restore(); g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }
  /* molossus stray — heavy-jawed brindle dog with a broken collar (role of the night pack) */
  function molossus(g, p, angry, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const attacking = o.state === 'attack' && Number.isFinite(o.attack) && o.attack >= 0 && o.attack < 1.05, a = attacking ? o.attack : -1;
    const threat = !!angry || attacking || o.state === 'warn';
    const lunge = attacking && a >= .45 && a < .75 ? Math.sin((a - .45) / .3 * Math.PI) : 0, run = o.speed > 115 || o.state === 'chase', loco = moving && !attacking;
    const C = '#6a5440', CD = '#2e241a', CL = '#a88a6a', far = '#4e3e2e';
    const by = (loco ? (run ? -2 * Math.max(0, Math.sin(phase * 2)) : Math.cos(phase * 2) * .5) : 0) + (threat ? 2.4 : 0), push = lunge * 10;
    const legs = [{ x: -13, far: true, back: true, ph: run ? .1 : .5 }, { x: 13, far: true, back: false, ph: run ? .6 : .25 }, { x: -16, far: false, back: true, ph: 0 }, { x: 16, far: false, back: false, ph: run ? .5 : .75 }];
    const leg = Lg => { const st = loco ? faunaFoot(phase + Lg.ph * TAU, run ? 11 : 6, run ? 10 : 5, run ? .42 : .62) : [0, 0]; faunaJoint(g, [Lg.x + push * .5, by - 26], [Lg.x + st[0] + (Lg.back ? 0 : push), st[1] - (Lg.far ? 1.4 : 0)], 13, 14, Lg.back ? -1 : 1, Lg.far ? 3 : 3.6, Lg.far ? far : C, false); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(push * .6, by);
    inkCurve(g, [[-20, -34], [-27, -38], [-30, -44]], 2.2, C, 1);
    shaded(g, () => { g.beginPath(); g.moveTo(-21, -32); g.bezierCurveTo(-20, -44, 12, -46, 20, -38); g.quadraticCurveTo(23, -27, 16, -22); g.quadraticCurveTo(0, -20, -18, -23); g.quadraticCurveTo(-23, -26, -21, -32); g.closePath(); }, C,
      { extra: () => { g.strokeStyle = 'rgba(30,20,12,.45)'; g.lineWidth = 2; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(-14 + i * 5, -42); g.lineTo(-16 + i * 5, -26); g.stroke(); } g.fillStyle = CL; ell(g, 2, -22, 14, 2.4); g.fill(); } });
    const hx = 20 + lunge * 5, hy = threat ? -32 : -40;
    shaded(g, () => { g.beginPath(); g.moveTo(hx - 7, hy - 7); g.quadraticCurveTo(hx + 4, hy - 11, hx + 11, hy - 5); g.lineTo(hx + 16, hy - 1); g.quadraticCurveTo(hx + 17, hy + 6, hx + 11, hy + 8); g.quadraticCurveTo(hx, hy + 10, hx - 7, hy + 4); g.closePath(); }, C, { extra: () => { g.fillStyle = CD; ell(g, hx + 13, hy + 2, 5, 4); g.fill(); } });
    ell(g, hx - 3, hy - 7, 4, 3, .6); fillInk(g, far, 1);
    inkCurve(g, [[hx - 8, hy + 2], [hx - 4, hy + 8], [hx - 9, hy + 10]], 2.2, '#8a5a2a', .8);
    dsEye(g, hx + 4, hy - 3, { rx: 1.3, ry: 1.6, socket: false, angry: threat });
    if (threat) { g.beginPath(); g.moveTo(hx + 6, hy + 6); g.lineTo(hx + 16, hy + 5); ink(g, 1.1); for (const x of [hx + 8, hx + 13]) { poly(g, [[x, hy + 5.6], [x + 1, hy + 8.6], [x + 2, hy + 5.6]]); g.fillStyle = '#f2ead8'; g.fill(); } }
    g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }
  /* leopard escaped from the arena — rosettes, long tail, a scrap of chain (last-night predator) */
  function leopard(g, p, options) {
    const o = options || {}, phase = Number.isFinite(p) ? p : 0, time = Number.isFinite(o.time) ? o.time : phase;
    const moving = o.moving === undefined ? Math.abs(phase) > .001 : o.moving;
    const attacking = o.state === 'attack' && Number.isFinite(o.attack) && o.attack >= 0 && o.attack < 1.05, a = attacking ? o.attack : -1;
    const lunge = attacking && a >= .45 && a < .75 ? Math.sin((a - .45) / .3 * Math.PI) : 0, wind = attacking && a < .45 ? Math.sin(Math.min(1, a / .32) * Math.PI / 2) : 0;
    const stalk = o.state === 'stalk' || o.state === 'approach', run = o.speed > 120;
    const C = '#d8a85a', CD = '#8a6030', CL = '#f6ead0', far = '#b08848', SP = '#2a1e14';
    const by = (moving ? Math.cos(phase * 2) * .5 : Math.sin(time * 1.6) * .3) + wind * 6 + (stalk ? 5 : 0), push = lunge * 16;
    const legs = [{ x: -16, far: true, back: true, ph: run ? .1 : .5 }, { x: 16, far: true, back: false, ph: run ? .6 : .25 }, { x: -19, far: false, back: true, ph: 0 }, { x: 19, far: false, back: false, ph: run ? .5 : .75 }];
    const leg = Lg => { const st = moving && !attacking ? faunaFoot(phase + Lg.ph * TAU, run ? 13 : 7, run ? 12 : 5, run ? .42 : .64) : [0, 0]; faunaJoint(g, [Lg.x + push * .4, by - 27], [Lg.x + st[0] + (Lg.back ? 0 : push), st[1] - (Lg.far ? 1.4 : 0)], 14, 14, Lg.back ? -1 : 1, Lg.far ? 2.8 : 3.4, Lg.far ? far : C, false); };
    legs.filter(l => l.far).forEach(leg);
    g.save(); g.translate(push * .5, by);
    g.save(); g.translate(-26, -32); g.rotate(.3 + Math.sin(time * 2) * .25); inkCurve(g, [[0, 0], [-14, 4], [-24, 14], [-24, 26], [-18, 30]], 3, C, 1.2); for (let i = 0; i < 4; i++) { g.fillStyle = SP; ell(g, -10 - i * 4, 6 + i * 6, 1.6, 2); g.fill(); } g.restore();
    shaded(g, () => { g.beginPath(); g.moveTo(-27, -32); g.bezierCurveTo(-26, -46, 18, -48, 24, -38); g.quadraticCurveTo(27, -26, 20, -21); g.quadraticCurveTo(0, -18, -20, -21); g.quadraticCurveTo(-28, -25, -27, -32); g.closePath(); }, C,
      { extra: () => { g.fillStyle = CL; ell(g, 0, -20, 20, 3); g.fill(); const r = mulberry(66); for (let i = 0; i < 22; i++) { const x = -22 + r() * 44, y = -42 + r() * 18; g.strokeStyle = SP; g.lineWidth = 1.4; g.beginPath(); g.arc(x, y, 2.4, 0, Math.PI * 1.5); g.stroke(); } } });
    const hx = 26 + lunge * 6, hy = stalk ? -32 : -42;
    shaded(g, () => smoothPath(g, blobPts(hx, hy, 10, 9, 12, .14, mulberry(67))), C, { extra: () => { g.fillStyle = CL; ell(g, hx + 6, hy + 4, 5, 3.4); g.fill(); g.fillStyle = SP; for (const [x, y] of [[-4, -4], [0, -6], [-6, 0]]) { ell(g, hx + x, hy + y, 1, 1); g.fill(); } } });
    for (const dx of [-5, 1]) { ell(g, hx + dx, hy - 8, 2.6, 2.4); fillInk(g, dx < 0 ? far : C, 1); }
    g.fillStyle = '#5a3a2a'; ell(g, hx + 9.5, hy + 1, 1.6, 1.2); g.fill();
    dsEye(g, hx + 3, hy - 2.5, { rx: 1.4, ry: 1.7, socket: false, angry: stalk || attacking });
    inkCurve(g, [[hx - 8, hy + 6], [hx - 14, hy + 12], [hx - 10, hy + 18]], 1.6, '#8a8a8a', .6);
    if (attacking || stalk) { g.beginPath(); g.moveTo(hx + 2, hy + 5.6); g.quadraticCurveTo(hx + 6, hy + 8, hx + 10, hy + 4.6); ink(g, 1.1); }
    g.restore();
    legs.filter(l => !l.far).forEach(leg);
  }

  /* ======================= FLORA ======================= */
  /* umbrella (stone) pine: tall bare trunk, flat dark parasol (role "pine", size k) */
  function stonePine(g, k, seed) {
    const r = mulberry(seed), h = (200 + r() * 40) * k, lean = (r() - .5) * 30 * k;
    g.fillStyle = 'rgba(60,50,30,.2)'; ell(g, lean * .6, -2, 50 * k, 10 * k); g.fill();
    inkCurve(g, [[0, 0], [lean * .4, -h * .5], [lean, -h * .82]], 8 * k, '#8a5a3a', 1.6);
    for (const s of [-1, 1]) inkCurve(g, [[lean * .9, -h * .8], [lean + s * 30 * k, -h * .9], [lean + s * 54 * k, -h * .92]], 4 * k, '#8a5a3a', 1.2);
    smoothPath(g, blobPts(lean, -h * .98, 76 * k, 22 * k, 20, .14, r)); fillInk(g, '#3e5a34', 2);
    g.save(); smoothPath(g, blobPts(lean, -h * .98, 76 * k, 22 * k, 20, .14, mulberry(seed))); g.clip(); g.fillStyle = '#56763e'; ell(g, lean - 14 * k, -h - 8 * k, 56 * k, 12 * k); g.fill(); g.restore();
    for (let i = 0; i < 26; i++) { g.fillStyle = r() < .5 ? 'rgba(130,160,90,.5)' : 'rgba(30,50,25,.4)'; ell(g, lean + (r() - .5) * 140 * k, -h * .98 + (r() - .5) * 26 * k, 5 * k, 2 * k); g.fill(); }
  }
  /* olive tree: twisted silver trunk, grey-green crown, olives (role "oak") */
  function olive(g, v) {
    const r = mulberry(240 + v);
    g.fillStyle = 'rgba(60,50,30,.2)'; ell(g, 0, -2, 54, 11); g.fill();
    inkCurve(g, [[-8, 0], [6, -26], [-6, -50], [4, -76]], 12, '#9a9286', 1.8); inkCurve(g, [[2, -40], [26, -66]], 5, '#9a9286', 1.2);
    g.strokeStyle = 'rgba(60,55,50,.6)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-4, -4); g.quadraticCurveTo(6, -30, -2, -56); g.stroke();
    for (let i = 0; i < 7; i++) { smoothPath(g, blobPts(-48 + i * 16, -90 - Math.sin(i / 6 * Math.PI) * 18, 22, 15, 12, .4, r)); fillInk(g, i % 2 ? '#7a8a6a' : '#6a7a5c', 1.6); }
    for (let i = 0; i < 40; i++) { g.fillStyle = r() < .6 ? 'rgba(200,210,190,.55)' : 'rgba(60,70,50,.45)'; ell(g, -55 + r() * 110, -112 + r() * 40, 3, 1.2, r() * 3); g.fill(); }
    for (let i = 0; i < 10; i++) { ell(g, -40 + r() * 80, -88 + r() * 20, 1.6, 2); fillInk(g, '#3a3a2a', .4); }
  }
  /* burnt olive stump after a field fire (role "dead") */
  function burntOlive(g, v) { const r = mulberry(340 + v); g.fillStyle = 'rgba(60,50,30,.18)'; ell(g, 0, -2, 28, 7); g.fill(); inkCurve(g, [[-6, 0], [4, -30], [-4, -60], [4, -86]], 10, '#3a3430', 1.6); for (let i = 0; i < 4; i++) { const s = i % 2 ? 1 : -1; inkCurve(g, [[0, -40 - i * 12], [s * 16, -54 - i * 12], [s * 24, -58 - i * 12 - r() * 8]], 3 - i * .4, '#3a3430', 1); } g.fillStyle = 'rgba(200,90,40,.5)'; ell(g, 2, -24, 3, 6); g.fill(); }
  /* tall meadow grass with poppies (role "tuft") */
  function meadowGrass(g, picked) {
    const r = mulberry(510); g.fillStyle = 'rgba(60,50,30,.16)'; ell(g, 0, -1, 22, 5); g.fill();
    for (let i = 0; i < (picked ? 8 : 20); i++) { const x = (r() - .5) * 26, L2 = picked ? 7 + r() * 4 : 24 + r() * 18, a = (r() - .5) * 1; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + Math.sin(a) * L2 * .4, -L2 * .6, x + Math.sin(a) * L2, -L2); g.strokeStyle = ['#7a9a46', '#a8b05a', '#5e7e38'][i % 3]; g.lineWidth = 1.5; g.stroke(); }
    if (!picked) for (let i = 0; i < 3; i++) { const x = (r() - .5) * 22, y = -28 - r() * 12; line(g, [[x, 0], [x, y]], 1, '#5e7e38'); for (let k = 0; k < 4; k++) { const a = k / 4 * TAU; ell(g, x + Math.cos(a) * 2.4, y + Math.sin(a) * 2.4, 2.4, 2, a); fillInk(g, '#d8322a', .4); } }
  }
  /* fig bush with ripe purple figs (role "berry") */
  function figBush(g, picked, v) {
    const r = mulberry(640 + v); g.fillStyle = 'rgba(60,50,30,.18)'; ell(g, 0, -1, 34, 7); g.fill();
    for (let i = 0; i < 4; i++) inkCurve(g, [[(i - 1.5) * 6, 0], [(i - 1.5) * 12, -20], [(i - 1.5) * 18, -32]], 2.4, '#9a8a7a', .8);
    for (let i = 0; i < 9; i++) { const x = -28 + (i % 5) * 14, y = -26 - Math.floor(i / 5) * 12 - r() * 6; for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + (k - 1) * .9; ell(g, x + Math.cos(a) * 5, y + Math.sin(a) * 5, 5, 3.4, a); fillInk(g, i % 2 ? '#4e7a34' : '#5e8a3e', .8); } }
    if (!picked) for (let i = 0; i < 9; i++) { const x = -24 + r() * 48, y = -30 + r() * 16; smoothPath(g, [[x, y - 4], [x + 3, y], [x, y + 3], [x - 3, y]]); fillInk(g, '#5a2a4a', .6); }
  }
  /* travertine block, porous, from Tivoli (role "boulder") */
  function travertine(g, v, stage) {
    const r = mulberry(750 + v), w = 42 - stage * 9, h = 40 - stage * 11;
    g.fillStyle = 'rgba(60,50,30,.2)'; ell(g, 0, -2, w + 6, 8); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-w, -h, w * 2, h); }, '#e8dcc0', { light: '#f4ecd8', lb: [-w * .4, -h * .7, w * .5, h * .3], hatch: [w * .3, -h, w, 0], hc: 'rgba(110,90,60,.35)', lw: 2.2 });
    for (let i = 0; i < 18 - stage * 5; i++) { g.fillStyle = 'rgba(150,130,100,.6)'; ell(g, -w + 4 + r() * (w * 2 - 8), -h + 4 + r() * (h - 8), 1.6 + r() * 1.4, .9); g.fill(); }
    for (let i = 1; i < 3; i++) line(g, [[-w, -h * i / 3], [w, -h * i / 3]], .8, 'rgba(150,130,100,.6)');
  }
  /* leeks in a garden row (role "carrot") */
  function leek(g) { for (const dx of [-7, 0, 7]) { inkLine(g, [[dx, 0], [dx, -14]], 3.4, '#ece8d8', .6); for (const a of [-.3, 0, .3]) inkCurve(g, [[dx, -14], [dx + a * 20, -24], [dx + a * 34, -30]], 1.8, '#4a7a4a', .5); } }
  /* giant cane (Arundo) of the Tiber banks (role "reeds") */
  function cane(g, v) { const r = mulberry(980 + v); for (let i = 0; i < 9; i++) { const x = (r() - .5) * 28, L2 = 70 + r() * 30, a = (r() - .5) * .25; line(g, [[x, 0], [x + Math.sin(a) * L2, -L2]], 2.2, '#9aa060'); for (let k = 1; k < 5; k++) { const y = -L2 * k / 5; inkCurve(g, [[x + Math.sin(a) * -y, y], [x + Math.sin(a) * -y + (k % 2 ? 12 : -12), y + 6]], 1.4, '#6a8a3a', .3); } smoothPath(g, blobPts(x + Math.sin(a) * L2, -L2 - 6, 3, 9, 7, .4, r)); fillInk(g, '#c8b89a', .5); } }
  /* Roman garden flowers: lavender, oleander, iris, chamomile, rose */
  function flower(g, v) {
    line(g, [[0, 0], [0, -15]], 1.2, '#5a7a3a');
    if (v === 0) { for (let i = 0; i < 6; i++) { ell(g, (i % 2 ? 1 : -1), -14 - i * 2.2, 1.6, 1.6); fillInk(g, '#8a6ac8', .4); } }
    else if (v === 1) { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ell(g, Math.cos(a) * 3, -16 + Math.sin(a) * 3, 2.4, 1.8, a); fillInk(g, '#e87aa0', .5); } }
    else if (v === 2) { for (const a of [-.6, 0, .6]) { ell(g, Math.sin(a) * 4, -17 + Math.abs(a) * 3, 2, 4.4, a); fillInk(g, '#5a4ab8', .5); } ell(g, 0, -15, 1, 1); g.fillStyle = '#f0c030'; g.fill(); }
    else if (v === 3) { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ell(g, Math.cos(a) * 3, -15 + Math.sin(a) * 3, 1.2, 2.4, a + Math.PI / 2); fillInk(g, '#fbfaf2', .4); } ell(g, 0, -15, 1.6, 1.6); fillInk(g, '#f0c030', .4); }
    else { for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ell(g, Math.cos(a) * 2.6, -16 + Math.sin(a) * 2.6, 2.6, 2.2, a); fillInk(g, '#c83a4a', .5); } }
  }
  /* laurel shoot (role "sapling") */
  function laurel(g, picked) { const r = mulberry(430); for (let i = 0; i < 5; i++) { const a = (i / 4 - .5) * 1, L2 = picked ? 12 : 32 + r() * 8; inkCurve(g, [[0, 0], [Math.sin(a) * L2 * .5, -L2 * .5], [Math.sin(a) * L2, -Math.cos(a) * L2]], 1.6, '#6a5a3a', .6); if (!picked) for (let j = 0; j < 4; j++) { ell(g, Math.sin(a) * L2 * (.4 + j * .16) + (j % 2 ? 3 : -3), -Math.cos(a) * L2 * (.4 + j * .16), 4.4, 1.8, a + (j % 2 ? .6 : -.6)); fillInk(g, '#3e6a34', .5); } } }

  /* ======================= PLACES ======================= */
  /* portico: tiled roof on columns, a shaded walk behind (shelter, cave volume) */
  function portico(g) {
    g.fillStyle = 'rgba(60,50,30,.22)'; ell(g, 0, -1, 160, 18); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-150, -150, 300, 150); }, '#c86a44', { hatch: [60, -150, 150, 0], hc: 'rgba(60,20,10,.3)', lw: 2.4, extra: () => { g.strokeStyle = 'rgba(80,30,15,.35)'; g.lineWidth = 1; for (let y = -144; y < 0; y += 8) { g.beginPath(); g.moveTo(-150, y); g.lineTo(150, y); g.stroke(); } } });
    g.beginPath(); g.moveTo(-112, 0); g.lineTo(-112, -104); g.lineTo(112, -104); g.lineTo(112, 0); g.closePath(); const gr = g.createLinearGradient(0, -104, 0, 0); gr.addColorStop(0, '#2a1e18'); gr.addColorStop(1, '#5a4636'); g.fillStyle = gr; g.fill(); ink(g, 2);
    for (const x of [-140, -100, -50, 50, 100, 140]) { shaded(g, () => { g.beginPath(); g.rect(x - 8, -118, 16, 118); }, '#f2ead8', { hatch: [x, -118, x + 8, 0], hc: 'rgba(120,100,80,.35)', lw: 1.8 }); for (const dx of [-3, 3]) line(g, [[x + dx, -114], [x + dx, -4]], .8, 'rgba(140,120,100,.6)'); shaded(g, () => { g.beginPath(); g.rect(x - 11, -124, 22, 7); }, '#e6dcc8', { lw: 1.4 }); }
    shaded(g, () => { g.beginPath(); g.rect(-160, -140, 320, 18); }, '#ece2cc', { lw: 2 });
    shaded(g, () => poly(g, [[-170, -140], [-150, -178], [150, -178], [170, -140]]), '#b85a3a', { hatch: [40, -178, 170, -140], hc: 'rgba(60,20,10,.4)', lw: 2.2, extra: () => { g.strokeStyle = 'rgba(80,30,15,.55)'; g.lineWidth = 1.2; for (let x = -164; x < 166; x += 10) { g.beginPath(); g.moveTo(x, -140); g.lineTo(x + (x * -.12), -178); g.stroke(); } } });
  }
  /* marble fountain with a lion-head spout (role "waterhole") */
  function fountain(g, t) {
    smoothPath(g, blobPts(0, 0, 74, 23, 26, .02, mulberry(98))); fillInk(g, '#ece6d8', 2.2);
    ell(g, 0, 1, 64, 18); g.fillStyle = '#4a8a9a'; g.fill(); g.strokeStyle = 'rgba(30,60,70,.6)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = 'rgba(220,240,245,.45)'; ell(g, -14, -3, 26, 5); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-12, -46, 24, 40); }, '#f2ead8', { lw: 1.8 }); smoothPath(g, blobPts(0, -50, 12, 10, 10, .2, mulberry(9))); fillInk(g, '#d8c8a0', 1.6);
    inkCurve(g, [[0, -46], [8, -38], [12, -20], [14, -4]], 2.4, '#bde4ec', .4);
    g.strokeStyle = 'rgba(230,245,250,.7)'; g.lineWidth = 1; for (const rr of [5, 9]) { g.beginPath(); g.ellipse(14, -2, rr, rr * .3, 0, 0, TAU); g.stroke(); }
  }
  /* the dogs' lair in a collapsed tomb by the road (role "den") */
  function ruinDen(g) {
    const r = mulberry(993);
    shaded(g, () => poly(g, [[-66, 0], [-64, -54], [-30, -60], [-20, -48], [30, -60], [64, -46], [66, 0]]), '#c86a44', { hatch: [20, -60, 66, 0], hc: 'rgba(60,20,10,.35)', lw: 2.2, extra: () => { g.strokeStyle = 'rgba(80,30,15,.4)'; g.lineWidth = 1; for (let y = -50; y < 0; y += 7) { g.beginPath(); g.moveTo(-66, y); g.lineTo(66, y); g.stroke(); } } });
    g.beginPath(); g.moveTo(-26, 0); g.lineTo(-26, -30); g.arc(0, -30, 26, Math.PI, 0); g.lineTo(26, 0); g.closePath(); g.fillStyle = '#1c140e'; g.fill(); ink(g, 2);
    for (let i = 0; i < 5; i++) { poly(g, blobPts(-60 + r() * 120, 2, 7, 4, 6, .3, r)); fillInk(g, '#c86a44', 1.2); }
    inkLine(g, [[-46, -2], [-32, 2]], 2.4, '#ece2cc', 1);
  }
  /* sheep bones (role "carcass") */
  function sheepBones(g) {
    smoothPath(g, blobPts(0, -4, 30, 7, 12, .25, mulberry(450))); g.fillStyle = 'rgba(110,90,60,.3)'; g.fill();
    for (let i = 0; i < 5; i++) { const x = -22 + i * 8; g.beginPath(); g.moveTo(x, -4); g.quadraticCurveTo(x + 3, -16, x + 8, -12); g.lineWidth = 3.8; g.strokeStyle = INK; g.stroke(); g.lineWidth = 2.2; g.strokeStyle = '#efe6d2'; g.stroke(); }
    shaded(g, () => smoothPath(g, blobPts(26, -10, 9, 6, 10, .2, mulberry(3))), '#efe6d2', {}); for (const s of [-1, 1]) { g.beginPath(); g.arc(26 + s * 7, -14, 5, 0, Math.PI * 1.6); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.lineWidth = 1.6; g.strokeStyle = '#e8dcc0'; g.stroke(); }
  }
  /* altar of Vesta's fire: marble altar and bronze fire bowl (source of fire) */
  function vestaAltar(g, lit) {
    g.fillStyle = 'rgba(60,50,30,.24)'; ell(g, 0, -1, 38, 9); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-24, -34, 48, 34); }, '#f2ead8', { hatch: [8, -34, 24, 0], hc: 'rgba(120,100,80,.35)', lw: 2 });
    shaded(g, () => { g.beginPath(); g.rect(-28, -40, 56, 7); }, '#e6dcc8', { lw: 1.6 }); shaded(g, () => { g.beginPath(); g.rect(-28, -4, 56, 5); }, '#e6dcc8', { lw: 1.4 });
    for (let x = -18; x <= 18; x += 12) { g.beginPath(); g.arc(x, -22, 4, 0, TAU); g.strokeStyle = 'rgba(120,100,80,.6)'; g.lineWidth = 1; g.stroke(); }
    ell(g, 0, -42, 22, 6); fillInk(g, '#a8783a', 1.6); ell(g, 0, -43, 16, 3.6); g.fillStyle = lit ? '#2a120a' : '#4a3a2a'; g.fill();
  }
  /* insula: brick apartment block with shops below, tiled roof */
  function insula(g, v) {
    const r = mulberry(1600 + v), w = 110, h = 190;
    g.fillStyle = 'rgba(60,50,30,.22)'; ell(g, 0, -1, w + 20, 16); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-w, -h, w * 2, h); }, '#c8744a', { light: '#d8885a', lb: [-40, -150, 60, 40], hatch: [w * .4, -h, w, 0], hc: 'rgba(70,25,10,.32)', lw: 2.4, extra: () => { g.strokeStyle = 'rgba(90,35,15,.3)'; g.lineWidth = 1; for (let y = -h + 6; y < 0; y += 6) { g.beginPath(); g.moveTo(-w, y); g.lineTo(w, y); g.stroke(); } } });
    for (let x = -w + 8; x < w - 20; x += 44) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, -40); g.arc(x + 15, -40, 15, Math.PI, 0); g.lineTo(x + 30, 0); g.closePath(); g.fillStyle = '#2a1e18'; g.fill(); ink(g, 1.6); }
    for (const y of [-96, -146]) for (let x = -w + 18; x < w - 10; x += 36) { g.beginPath(); g.rect(x, y, 14, 20); g.fillStyle = '#2a1e18'; g.fill(); ink(g, 1.2); line(g, [[x - 2, y + 20], [x + 16, y + 20]], 2, '#e6dcc8'); }
    shaded(g, () => { g.beginPath(); g.rect(-w - 4, -64, w * 2 + 8, 8); }, '#7a5a3a', { lw: 1.4 }); for (let x = -w; x <= w; x += 22) inkLine(g, [[x, -56], [x, -48]], 1.6, '#7a5a3a', .6);
    shaded(g, () => poly(g, [[-w - 10, -h], [-w + 10, -h - 26], [w - 10, -h - 26], [w + 10, -h]]), '#b85a3a', { hatch: [0, -h - 26, w + 10, -h], hc: 'rgba(60,20,10,.4)', lw: 2.2 });
    if (v % 2) for (let i = 0; i < 4; i++) { g.fillStyle = ['#d8322a', '#e8c04a', '#6a8ad8', '#fbfaf2'][i]; ell(g, -w + 30 + i * 8, -100 + Math.sin(i) * 2, 3, 2); g.fill(); }
  }
  /* temple of Vesta: round marble tholos, conical roof with smoke hole */
  function vestaTemple(g, t) {
    g.fillStyle = 'rgba(60,50,30,.22)'; ell(g, 0, -1, 130, 20); g.fill();
    shaded(g, () => { g.beginPath(); g.ellipse(0, -10, 120, 18, 0, 0, Math.PI); g.lineTo(-120, -26); g.ellipse(0, -26, 120, 18, 0, Math.PI, 0, false); g.closePath(); }, '#e6dcc8', { lw: 2 });
    shaded(g, () => { g.beginPath(); g.rect(-86, -170, 172, 144); }, '#d8ccb4', { lw: 2.2 });
    g.beginPath(); g.moveTo(-16, -26); g.lineTo(-16, -96); g.lineTo(16, -96); g.lineTo(16, -26); g.closePath(); g.fillStyle = '#2a1e16'; g.fill(); ink(g, 1.6);
    g.fillStyle = 'rgba(255,170,70,.55)'; ell(g, 0, -40, 10, 6); g.fill();
    for (let i = 0; i < 9; i++) { const a = Math.PI * (1 - i / 8), x = Math.cos(a) * 104; if (Math.abs(x) < 24) continue; shaded(g, () => { g.beginPath(); g.rect(x - 7, -176, 14, 150); }, '#f6f0e2', { hatch: [x, -176, x + 7, -26], hc: 'rgba(120,100,80,.35)', lw: 1.6 }); shaded(g, () => { g.beginPath(); g.rect(x - 10, -182, 20, 7); }, '#ece2cc', { lw: 1.2 }); }
    shaded(g, () => { g.beginPath(); g.ellipse(0, -186, 116, 14, 0, 0, TAU); }, '#ece2cc', { lw: 2 });
    shaded(g, () => { g.beginPath(); g.moveTo(-118, -188); g.quadraticCurveTo(-60, -236, -12, -248); g.lineTo(12, -248); g.quadraticCurveTo(60, -236, 118, -188); g.closePath(); }, '#a8783a', { hatch: [20, -250, 118, -188], hc: 'rgba(60,30,10,.4)', lw: 2.2 });
    for (let i = 0; i < 3; i++) { smoothPath(g, blobPts(i * 6, -262 - i * 16, 9 + i * 4, 6 + i * 2, 8, .4, mulberry(i + 9))); g.fillStyle = 'rgba(225,225,220,' + (.6 - i * .15) + ')'; g.fill(); }
  }
  /* aqueduct arches of tufa and brick */
  function aqueduct(g) {
    const w = 300;
    g.fillStyle = 'rgba(60,50,30,.22)'; ell(g, 0, -1, w + 20, 16); g.fill();
    shaded(g, () => { g.beginPath(); g.rect(-w, -190, w * 2, 190); }, '#c4a07a', { hatch: [w * .4, -190, w, 0], hc: 'rgba(70,40,20,.32)', lw: 2.4, extra: () => { g.strokeStyle = 'rgba(90,60,30,.3)'; g.lineWidth = 1; for (let y = -184; y < 0; y += 9) { g.beginPath(); g.moveTo(-w, y); g.lineTo(w, y); g.stroke(); } } });
    g.save(); g.globalCompositeOperation = 'destination-out'; for (let x = -w + 22; x < w - 40; x += 75) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, -100); g.arc(x + 26.5, -100, 26.5, Math.PI, 0); g.lineTo(x + 53, 0); g.closePath(); g.fill(); g.beginPath(); g.rect(x + 8, -168, 37, 34); g.fill(); } g.restore();
    for (let x = -w + 22; x < w - 40; x += 75) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, -100); g.arc(x + 26.5, -100, 26.5, Math.PI, 0); g.lineTo(x + 53, 0); ink(g, 2); g.beginPath(); g.rect(x + 8, -168, 37, 34); ink(g, 1.6); }
    shaded(g, () => { g.beginPath(); g.rect(-w - 6, -204, w * 2 + 12, 16); }, '#b48c66', { lw: 2 });
  }

  /* ======================= GROUND ======================= */
  function ground(g, o) {
    const { x0, y0, CH, land, rng } = o;
    g.lineCap = 'round';
    // basalt paving (selce) on the "rock" biome: Rome's streets and squares
    for (let j = 0; j < CH; j += 14) for (let i = (j / 14 % 2) * 7; i < CH; i += 14) { if (land(i, j) !== 3) continue; poly(g, blobPts(i, j, 6.4, 6, 6, .28, rng)); g.fillStyle = rng() < .5 ? '#6a6a70' : '#5a5a62'; g.fill(); g.strokeStyle = 'rgba(30,30,34,.7)'; g.lineWidth = 1.2; g.stroke(); }
    for (let k = 0; k < 520; k++) {
      const px = rng() * CH, py = rng() * CH, b = land(px, py); if (!b || b === 3) continue;
      if (b === 1) { g.strokeStyle = ['rgba(110,140,60,.5)', 'rgba(170,170,90,.45)', 'rgba(80,110,50,.45)'][(rng() * 3) | 0]; g.lineWidth = 1.2; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (rng() - .5) * 2, py - 5 - rng() * 4); g.stroke(); if (rng() < .02) { g.fillStyle = '#d8322a'; ell(g, px, py - 6, 1.6, 1.6); g.fill(); } }
      else if (b === 2) { if (rng() < .15) { g.strokeStyle = 'rgba(130,90,50,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + 6, py - 1); g.stroke(); } else { g.fillStyle = rng() < .5 ? 'rgba(150,110,60,.35)' : 'rgba(70,80,40,.35)'; ell(g, px, py, 2.4, 1.2, rng() * 3); g.fill(); } }
      else if (b === 4) { if (rng() < .05) { ell(g, px, py, 12 + rng() * 16, 3 + rng() * 5); g.fillStyle = 'rgba(80,110,100,.55)'; g.fill(); } else { g.strokeStyle = 'rgba(90,120,60,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (rng() - .5) * 3, py - 7 - rng() * 5); g.stroke(); } }
    }
  }
  const BCOL = [[128, 138, 76], [92, 96, 58], [112, 108, 104], [100, 120, 84]];

  return {
    ground, bcol: BCOL,
    heir: livia, mobs: { antelope: sheep, hyena: molossus, machairodont: leopard },
    flora: { pine: stonePine, oak: olive, dead: burntOlive, tuft: meadowGrass, berry: figBush, boulder: travertine, carrot: leek, reeds: cane, flower, sapling: laurel },
    places: { cave: portico, waterhole: fountain, den: ruinDen, carcass: sheepBones, source: vestaAltar, insula, vestaTemple, aqueduct }
  };
})();
