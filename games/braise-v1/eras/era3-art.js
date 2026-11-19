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
