/* Kunai Online — the whole village of Aozora, laid out from the top-down plan (model metres, +x east, +y south,
   wall circle radius 150 m centred on 0,0, main gate at the south).
   Extra builders for the landmarks seen on the plan + the building list read from it, quarter by quarter. */
window.KWORLD = (() => {
  const M = 24, K = KGATE, TW = KTOWN, m = v => v * M;
  const mat = (t, tw, x) => Object.assign({ tex: t, tw: m(tw) }, x || {});
  const base = () => { const t = K.textures(); return { WOOD: mat(t.wall, 4), WOOD2: mat(t.wall2, 4), DARK: mat(t.dark, 2), STONE: mat(t.stone, 4), FLAG: mat(t.flag, 4) }; };
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), tohex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return tohex(A.map((v, i) => v + (B[i] - v) * t)); };
  const wallOf = roof => mixc(roof, '#efe6d2', .72);                     // pastel wall that goes with a roof colour

  /* ---------- landmark builders ---------- */
  // a window or door laid flat on a curved wall: tangent to the drum at angle a, pushed out just enough to clear the curve
  // (low panels get extra depth so the painter sort keeps them in front of their wall)
  function curvedPanel(S, cx, cy, r, a, z0, z1, w, M, bias, wallH) { bias = (bias || 3) + (wallH ? Math.max(0, wallH / 2 - (z0 + z1) / 2) * 24 * .62 + 4 : 0); const ux = Math.sin(a), uy = -Math.cos(a), rr = r + w * w / (8 * r) + .03, px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr;
    const A = [m(px - ux * w / 2), m(py - uy * w / 2)], B = [m(px + ux * w / 2), m(py + uy * w / 2)];
    // U runs left to right as seen from outside (the camera side), V goes down the texture
    S.face([[A[0], A[1], m(z0)], [B[0], B[1], m(z0)], [B[0], B[1], m(z1)], [A[0], A[1], m(z1)]], M, { n: [Math.cos(a), Math.sin(a), 0], O: [A[0], A[1], m(z1)], U: [ux, uy, 0], V: [0, 0, -1], bias }); }
  function round(o) { // round building: plaster drum, tiled skirt, flat or domed top
    o = Object.assign({ r: 5, floors: 2, roof: '#8a4a2a', wall: null, dome: false, seed: 1 }, o);
    const S = new ISO.Scene(), b = base(), W = mat(TW.plaster(o.wall || wallOf(o.roof), o.seed), 4), R = mat(TW.tiles(o.roof, o.seed), 2.6), hgt = 2.9 * o.floors + .4;
    S.cylinder(0, 0, m(o.r), 0, m(hgt), W, 28, { cap: false, eave: m(.8) });
    S.frustum(0, 0, m(o.r + .38), m(o.r + .02), 0, m(.6), b.STONE, { seg: 28, bias: 1 });   // sloped stone footing (an open plinth ring showed its back half on the sides)
    const RW = mat(TW.windowTexPub('#4a3a2a'), 1, { whole: true });
    for (let f = 0; f < o.floors; f++) for (const a of [Math.PI / 2 - .5, Math.PI / 2, Math.PI / 2 + .5]) { if (!f && a === Math.PI / 2) continue; curvedPanel(S, 0, 0, o.r, a, f * 2.9 + 1, f * 2.9 + 2.3, 1, RW, 3, hgt); }
    // the entrance faces the street (the camera side)
    curvedPanel(S, 0, 0, o.r, Math.PI / 2, .55, 2.6, 1.7, mat(TW.doorTexPub('#3a2a20'), 1.7, { whole: true }), 5, hgt);
    S.box(m(-1.15), m(1.15), m(o.r - .1), m(o.r + .45), m(2.6), m(2.85), { front: b.DARK, top: b.DARK }, { bias: 6 + (hgt / 2 - 2.7) * 24 * .62 + 4 });
    S.box(m(-1), m(1), m(o.r - .1), m(o.r + .9), 0, m(.5), { front: b.STONE, top: b.STONE }, { bias: 5 });
    S.frustum(0, 0, m(o.r + .9), m(o.r + .9), m(hgt - .2), m(hgt), b.DARK, { seg: 28, bias: 2 });
    if (o.dome) S.sphere(0, 0, m(hgt), m(o.r + .8), R, { bands: 5, seg: 28, squash: .55, bias: 3 });
    else { S.frustum(0, 0, m(o.r + .9), m(o.r * .55), m(hgt), m(hgt + o.r * .4), R, { seg: 28, bias: 3 }); S.disc(0, 0, m(o.r * .55), m(hgt + o.r * .4), mat(TW.plaster('#c9c2b4', 3), 3), { seg: 24, bias: 4 }); }
    return S; }
  function dome(o) { o = Object.assign({ r: 9, col: '#2f5fb0' }, o); const S = new ISO.Scene(), b = base();
    S.cylinder(0, 0, m(o.r), 0, m(1.2), b.STONE, 30, { cap: false });
    S.sphere(0, 0, m(1.2), m(o.r), mat(TW.tiles(o.col, 4), 3), { bands: 7, seg: 30, squash: .8, bias: 2 });
    // a stone porch in front of the dome with the door set in it (the dome wall itself is too low for a door)
    S.box(m(-1.6), m(1.6), m(o.r - 1.2), m(o.r + .6), 0, m(3.1), { front: b.STONE, top: b.DARK }, { bias: 28 });
    S.decal(m(-1), m(1), m(o.r + .63), m(.15), m(2.6), mat(TW.doorTexPub('#3a2a20'), 2, { whole: true }), { bias: 31 });
    return S; }
  // one angular slice of the arena (each slice gets its own depth in the painter sort), or the floor alone
  function arenaPart(o) { o = Object.assign({ r: 21, a0: 0, a1: Math.PI * 2, floor: false }, o); const S = new ISO.Scene(), RED = mat(TW.plaster('#a84a32', 7), 4), R = mat(TW.tiles('#b8643a', 7), 3);
    if (o.floor) { S.disc(0, 0, m(o.r - 4), .02, mat(TW.plaster('#7ea657', 9), 6), { ground: true, seg: 48 }); return S; }
    const gap = 2.6 / (o.r - 2), G0 = Math.PI / 2 - gap, G1 = Math.PI / 2 + gap, segs = [];   // the south entrance is open
    if (o.a1 <= G0 || o.a0 >= G1) segs.push([o.a0, o.a1]); else { if (o.a0 < G0) segs.push([o.a0, G0]); if (o.a1 > G1) segs.push([G1, o.a1]); }
    for (const [a0, a1] of segs) S.ringWall(0, 0, m(o.r - 4), m(o.r), 0, m(6), a0, a1, RED, R, { seg: Math.max(2, Math.ceil((a1 - a0) / (Math.PI * 2) * 64)), eave: m(1), caps: [a0 === G1, a1 === G0] });
    if (o.a0 < Math.PI / 2 && o.a1 > Math.PI / 2) for (const a of [G0 - .03, G1 + .03]) { const x = Math.cos(a) * m(o.r - 2), y = Math.sin(a) * m(o.r - 2);
      S.box(x - m(1), x + m(1), y - m(2.1), y + m(2.1), 0, m(7.5), { front: RED, top: R, left: RED, right: RED }, { bias: 22 }); }
    for (const a of [-Math.PI / 2, 0, Math.PI]) { if (a < o.a0 || a >= o.a1) continue; const x = Math.cos(a) * m(o.r - 2), y = Math.sin(a) * m(o.r - 2);
      S.box(x - m(2.2), x + m(2.2), y - m(2.2), y + m(2.2), m(5), m(8.5), { front: RED, top: R, left: RED, right: RED }, { bias: 20 }); }
    return S; }
  function arena(o) { o = Object.assign({ r: 21 }, o); const S = new ISO.Scene(), b = base(), RED = mat(TW.plaster('#a84a32', 7), 4), R = mat(TW.tiles('#b8643a', 7), 3);
    S.disc(0, 0, m(o.r - 4), .02, mat(TW.plaster('#7ea657', 9), 6), { ground: true, seg: 48 });
    S.ringWall(0, 0, m(o.r - 4), m(o.r), 0, m(6), 0, Math.PI * 2, RED, R, { seg: 64, eave: m(1) });
    for (const a of [Math.PI / 2, -Math.PI / 2, 0, Math.PI]) { const x = Math.cos(a) * m(o.r - 2), y = Math.sin(a) * m(o.r - 2); S.box(x - m(2.2), x + m(2.2), y - m(2.2), y + m(2.2), m(5), m(8.5), { front: RED, top: R, left: RED, right: RED }, { bias: Math.sin(a) > 0 ? 40 : -10 }); }
    return S; }
  function lshape(o) { // the long L-shaped hall north-west, with its round annex
    const S = new ISO.Scene(), b = base(), W = mat(TW.plaster('#e2a070', 11), 5), R = mat(TW.plaster('#a9a9b2', 12), 5), T = mat(TW.tiles('#b8643a', 11), 3);
    const block = (x0, x1, y0, y1) => { S.box(m(x0), m(x1), m(y0), m(y1), 0, m(7), { front: W, top: R }, { eave: m(.8) }); S.box(m(x0 - .6), m(x1 + .6), m(y1), m(y1 + .8), m(6.4), m(7.2), { front: T, top: T }, { bias: 4 }); };
    block(-10, 0, -45, 0); block(0, 11, -45, -36);
    for (let i = 0; i < 6; i++) S.decal(m(-8.5 + (i % 2) * 4), m(-6.5 + (i % 2) * 4), m(.02), m(1 + Math.floor(i / 2) * 2), m(2.6 + Math.floor(i / 2) * 2), mat(TW.windowTexPub('#5a3a22'), 2, { whole: true }), { wall: [0, m(7)], bias: 4 });
    return S; }
  // capsule-shaped hall (two drums joined by a straight body) along its long axis: plaster walls with windows,
  // a yellow tiled pent skirt that follows the outline, a parapet round the flat roof, a door at the front
  function oval(o) { o = Object.assign({ w: 8, d: 23 }, o); const S = new ISO.Scene(), b = base(), Y = mat(TW.tiles('#d9b03a', 15), 2.6), RF = mat(TW.plaster('#a9a596', 15), 4),
      WL = mat(TW.plaster('#efe2b8', 15), 4), PAR = mat(TW.plaster('#f6eed2', 16), 3), WIN = mat(TW.windowTexPub('#5a3a22'), 1, { whole: true });
    const alongY = o.d >= o.w, r = Math.min(o.w, o.d) / 2, L = Math.max(o.w, o.d), H = 6.2, zs = 3.1;
    const C = alongY ? [[0, -o.d + r], [0, -r]] : [[-o.w / 2 + r, -o.d / 2], [o.w / 2 - r, -o.d / 2]];
    const halves = alongY ? [[Math.PI, Math.PI * 2], [0, Math.PI]] : [[Math.PI / 2, Math.PI * 1.5], [-Math.PI / 2, Math.PI / 2]];
    // walls
    for (const [x, y] of C) S.cylinder(m(x), m(y), m(r), 0, m(H), WL, 28, { cap: false, eave: m(.5) });
    if (alongY) S.box(m(-r), m(r), m(C[0][1]), m(C[1][1]), 0, m(H), { front: WL, top: RF }, { eave: m(.5) });
    else S.box(m(C[0][0]), m(C[1][0]), m(-o.d), 0, 0, m(H), { front: WL, top: RF }, { eave: m(.5) });
    for (const [x, y] of C) S.disc(m(x), m(y), m(r), m(H), RF, { seg: 28, bias: 3 });
    // windows on both storeys, around the drums (facing the camera half) and along the straight front
    for (const [cx, cy] of C) for (let k = 0; k < 7; k++) { const an = .25 + k * (Math.PI - .5) / 6; if (alongY && cy === C[0][1]) continue;
      const x = cx + Math.cos(an) * r; if (!alongY && Math.abs(x) < Math.abs(cx) - .1) continue;
      for (const z0 of [1, zs + .9]) { if (z0 === 1 && Math.abs(an - Math.PI / 2) < .3 && Math.abs(cx) < .1) continue; curvedPanel(S, cx, cy, r, an, z0, z0 + 1.2, .9, WIN, 3, H); } }
    if (!alongY) for (let x = C[0][0] + 1.2; x < C[1][0] - .8; x += 2.2) for (const z0 of [1, zs + .9]) S.decal(m(x - .45), m(x + .45), m(.02), m(z0), m(z0 + 1.2), WIN, { wall: [0, m(H)], bias: 4 });
    // pent skirt: conical bands round the drums + sloped strips along the straight sides
    const out = .9, z1 = m(zs + .35), z0 = m(zs - .2);
    for (let i = 0; i < 2; i++) { const [x, y] = C[i], [a0, a1] = halves[i]; S.ringWall(m(x), m(y), m(r - .05), m(r + .02), z0, z1, a0, a1, Y, Y, { seg: 16, bias: 6 });
      S.frustum(m(x), m(y), m(r + out), m(r), z0, z1, Y, { seg: 28, bias: 6 }); }
    if (alongY) for (const sx of [-1, 1]) S.face([[m(sx * r), m(C[0][1]), z1], [m(sx * r), m(C[1][1]), z1], [m(sx * (r + out)), m(C[1][1]), z0], [m(sx * (r + out)), m(C[0][1]), z0]], Y, { O: [m(sx * r), m(C[0][1]), z1], U: [0, 1, 0], V: ISO.norm([sx * out, 0, -.55]), bias: 6 });
    else for (const sy of [0, -o.d]) { const dir = sy === 0 ? 1 : -1; S.face([[m(C[0][0]), m(sy), z1], [m(C[1][0]), m(sy), z1], [m(C[1][0]), m(sy + dir * out), z0], [m(C[0][0]), m(sy + dir * out), z0]], Y, { O: [m(C[0][0]), m(sy), z1], U: [1, 0, 0], V: ISO.norm([0, dir * out, -.55]), bias: 6 }); }
    // parapet following the outline
    for (let i = 0; i < 2; i++) { const [x, y] = C[i], [a0, a1] = halves[i]; S.ringWall(m(x), m(y), m(r - .35), m(r + .05), m(H), m(H + .55), a0, a1, PAR, b.DARK, { seg: 16, bias: 7 }); }
    if (alongY) for (const sx of [-1, 1]) S.box(m(sx > 0 ? r - .35 : -r - .05), m(sx > 0 ? r + .05 : -r + .35), m(C[0][1]), m(C[1][1]), m(H), m(H + .55), { front: PAR, top: b.DARK }, { bias: 7 });
    else for (const sy of [0, -o.d]) S.box(m(C[0][0]), m(C[1][0]), m(sy - (sy ? -.05 : .35)), m(sy + (sy ? .35 : .05)), m(H), m(H + .55), { front: PAR, top: b.DARK }, { bias: 7 });
    // rooftop: a small water tank and a hatch
    const [tx, ty] = C[0]; S.cylinder(m(tx), m(ty), m(.9), m(H), m(H + 1.6), mat(TW.plaster('#9aa2a6', 3), 2), 14, { cap: true, bias: 8 });
    // door at the front
    if (alongY) curvedPanel(S, C[1][0], C[1][1], r, Math.PI / 2, 0, 2.3, 1.6, mat(TW.doorTexPub('#3a2a20'), 1.6, { whole: true }), 30, H);
    else S.decal(m(-.8), m(.8), m(.03), 0, m(2.3), mat(TW.doorTexPub('#3a2a20'), 1.6, { whole: true }), { bias: 30 });
    return S; }
  function temple(o) { o = Object.assign({ w: 14, d: 19 }, o); const S = new ISO.Scene(), b = base(), RW = mat(TW.plaster('#b43a2e', 21), 5), RR = mat(TW.tiles('#8a2a24', 21), 3);
    S.box(m(-o.w / 2 - 1), m(o.w / 2 + 1), m(-o.d - 1), m(1), 0, m(1), { front: b.STONE, top: b.STONE });
    S.box(m(-o.w / 2), m(o.w / 2), m(-o.d), 0, m(1), m(6), { front: RW, top: b.DARK }, { eave: m(1) });
    for (const x of [-o.w / 2 + 1, -2, 2, o.w / 2 - 1]) S.cylinder(m(x), m(.6), m(.35), m(1), m(6), { color: '#d24a35' }, 10, { cap: false, bias: 5 });
    S.hip(m(-o.w / 2), m(o.w / 2), m(-o.d), m(.6), m(6), m(10), RR, { over: m(1.4), fascia: b.DARK, ridge: .55, bias: 8 });
    S.box(m(-1.2), m(1.2), m(-o.d / 2 - 3), m(-o.d / 2 + 3), m(9.6), m(10.6), { front: { color: '#e6b43a' }, top: { color: '#f2cc5a' } }, { bias: 9 });
    return S; }
  function field(o) { o = Object.assign({ w: 16, d: 10 }, o); const S = new ISO.Scene();
    S.face([[m(-o.w / 2), m(-o.d), .02], [m(o.w / 2), m(-o.d), .02], [m(o.w / 2), 0, .02], [m(-o.w / 2), 0, .02]], { color: '#6f9e4a' }, { n: [0, 0, 1], ground: true, edges: false });
    const L = (pts) => S.face(pts.map(([x, y]) => [m(x), m(y), .04]), { color: '#f2f2e6' }, { n: [0, 0, 1], ground: true, edges: false });
    const W2 = o.w / 2, t = .18; L([[-W2, -o.d], [W2, -o.d], [W2, -o.d + t], [-W2, -o.d + t]]); L([[-W2, -t], [W2, -t], [W2, 0], [-W2, 0]]); L([[-W2, -o.d], [-W2 + t, -o.d], [-W2 + t, 0], [-W2, 0]]); L([[W2 - t, -o.d], [W2, -o.d], [W2, 0], [W2 - t, 0]]); L([[-t / 2, -o.d], [t / 2, -o.d], [t / 2, 0], [-t / 2, 0]]);
    return S; }
  function wallArc(a0, a1, c0, c1) { // a piece of the village wall ring (c0/c1: close the start/end)
    const S = new ISO.Scene(), b = base(), R = 150;
    S.ringWall(0, 0, m(R - 1.2), m(R), 0, m(5), a0, a1, mat(K.textures().wall2, 4.5), b.DARK, { seg: Math.max(4, Math.round((a1 - a0) * R / 3)), eave: m(.8), caps: [!!c0, !!c1] });
    return S; }

  /* ---------- the plan, read quarter by quarter: [type, x0, y0, x1, y1, roofColour, floors] ---------- */
  const H = (x0, y0, x1, y1, roof, fl) => ['h', x0, y0, x1, y1, roof, fl || 2];
  const PLAN = [
    // north-west
    ['dome', -46, -82, 9, '#2f5fb0'], ['L', -61, -25], ['round', -56, -31, 5.5, '#c06a3a', 2, true], ['round', -90, -43, 6.5, '#b8643a', 2], H(-96, -32, -85, -17, '#b8643a', 2),
    ['arena', -121, -2, 21], H(-96, -14, -90, -9, '#b83a32', 2), H(-90, -14, -83, -8, '#8a8f9a', 2), H(-96, -8, -90, 4, '#4a4f5c', 3), H(-89, -6, -82, 4, '#9aa0a8', 2), ['round', -90, 6, 3.5, '#d8c9a2', 1],
    ['oval', -75, 9, 8, 23], H(-69, -8, -63, 2, '#9a3a7a', 2), H(-62, -10, -52, -2, '#3a8a8a', 2), H(-52, -6, -47, -1, '#c9a46a', 1), H(-62, 3, -50, 13, '#5a3a24', 2),
    H(-33, -24, -26, -18, '#d07a3a', 1), H(-25, -21, -21, -17, '#7a6a4a', 1), ['round', -12, -36, 3.5, '#9a3a6a', 2, true], H(-10, -33, -5, -27, '#6aa8d0', 3), H(-17, -29, -10, -24, '#d07a3a', 2), H(-18, -23, -8, -17, '#b8323a', 2),
    H(-31, -9, -22, 0, '#d07a3a', 2), H(-36, -11, -29, -3, '#5a8ab0', 2), H(-31, 1, -21, 9, '#5a5a5a', 2), ['h', -34, 9, -25, 30, '#3a8aa0', 4], H(-21, -11, -14, -3, '#c94a3a', 2), H(-12, -7, -6, 0, '#e2c43a', 2), H(-14, 1, -6, 9, '#8a8f9a', 2), H(-20, 10, -12, 19, '#b8323a', 2), H(-11, 11, -6, 19, '#d0d0d0', 2),
    H(-74, 14, -63, 30, '#efe6d2', 2), H(-60, 18, -51, 30, '#c9a46a', 2), H(-50, 20, -43, 32, '#5a7a8a', 2), H(-15, 20, -5, 34, '#6a8a9a', 3),
    // north-east
    ['hokage', 0, -78], H(13, -44, 19, -37, '#9a3a6a', 2), H(5, -35, 12, -27, '#dcdcdc', 2), ['round', 15, -30, 3.5, '#9aa0a8', 2], ['oval', 9.5, -17, 9, 6], H(20, -37, 30, -27, '#6a8a6a', 2),
    H(17, -14, 25, -10, '#c94a3a', 1), ['round', 9, -6, 4, '#8a9aa8', 2, true], ['round', 26, -4, 5, '#5a8ac0', 2, true], H(11, -6, 17, 0, '#9aa0a8', 2),
    ['round', 45, -2, 8, '#7ab0d0', 2, true], H(100, -10, 112, -1, '#4a8ab0', 2), ['round', 115, -3, 6, '#3a7aa0', 2, true],
    H(5, 0, 12, 20, '#8a8f9a', 3), ['round', 21, 10, 5, '#5aa04a', 2], H(25, 4, 35, 22, '#c94a5a', 2),
    H(42, -86, 50, -76, '#3a8a8a', 3), H(44, -72, 50, -62, '#3a8a8a', 2), H(60, -72, 90, -62, '#3a8a8a', 2), H(85, -60, 118, -45, '#3a8a8a', 3), H(56, -45, 66, -28, '#3a8a8a', 2), H(75, -45, 90, -28, '#3a8a8a', 2),
    // south-west
    H(-110, 42, -100, 62, '#2a2e44', 2), H(-125, 52, -112, 68, '#2a2e44', 2), H(-112, 62, -100, 70, '#2a2e44', 1), H(-98, 56, -90, 66, '#2a2e44', 2), H(-98, 66, -90, 72, '#2a2e44', 1), H(-90, 70, -80, 80, '#2a2e44', 2), H(-110, 78, -100, 90, '#2a2e44', 2), H(-90, 42, -80, 50, '#2a2e44', 2),
    ['round', -125, 43, 4.5, '#3a8a7a', 2], ['round', -118, 72, 3, '#a8323a', 1], ['round', -95, 45, 4, '#c97a6a', 1],
    H(-74, 34, -66, 42, '#b8323a', 2), H(-70, 40, -64, 46, '#c9a46a', 1), H(-37, 40, -29, 55, '#8a7a6a', 2), H(-29, 40, -21, 56, '#b8323a', 3), H(-21, 40, -12, 52, '#e2c43a', 2), ['oval', -7.5, 55, 9, 17],
    ['round', -24, 70, 5, '#5aa04a', 2], ['round', -31, 77, 5, '#9aa0a8', 1], H(-21, 72, -14, 80, '#9aa0a8', 2), ['round', -53, 82, 8, '#e2b83a', 2, true],
    H(-78, 101, -68, 108, '#c9a46a', 2), H(-72, 110, -58, 122, '#c9a46a', 2), H(-88, 112, -78, 124, '#3a8a8a', 2), H(-78, 124, -63, 132, '#2a2e44', 2),
    ['round', -27, 115, 6, '#a8323a', 2, true], ['round', -21, 121, 3, '#9aa0a8', 1], H(-20, 108, -12, 114, '#3a8a8a', 1), ['round', -28, 130, 5, '#c06a3a', 3], H(-31, 133, -25, 145, '#b8643a', 2),
    // south-east
    ['temple', 38, 43, 14, 19], H(3, 25, 13, 34, '#efe6d2', 2), ['round', 7, 38, 5, '#c06a3a', 1], H(4, 46, 10, 50, '#9aa0a8', 1), H(12, 50, 24, 58, '#efe6d2', 1), H(1, 63, 8, 74, '#a8323a', 2), H(8, 66, 14, 74, '#c97a8a', 2),
    H(3, 80, 8, 90, '#5a9ac0', 2), H(8, 82, 15, 91, '#6a4a2a', 1), H(15, 80, 30, 91, '#9aa0a8', 2),
    H(59, 22, 69, 34, '#9aa0a8', 2), H(75, 19, 85, 33, '#9aa0a8', 2), H(89, 20, 99, 32, '#9aa0a8', 2), H(104, 17, 116, 27, '#9aa0a8', 2), H(61, 38, 71, 50, '#9aa0a8', 2), H(78, 39, 90, 49, '#9aa0a8', 2), H(91, 34, 101, 46, '#9aa0a8', 2),
    H(106, 45, 118, 55, '#9aa0a8', 2), H(68, 53, 80, 63, '#9aa0a8', 2), H(89, 51, 99, 61, '#9aa0a8', 2), H(100, 55, 120, 69, '#9aa0a8', 3), H(116, 57, 128, 67, '#9aa0a8', 2), H(65, 68, 75, 80, '#9aa0a8', 2), H(79, 69, 89, 79, '#9aa0a8', 2),
    H(99, 74, 113, 86, '#9aa0a8', 2), H(64, 84, 76, 96, '#9aa0a8', 2), H(72, 96, 88, 104, '#9aa0a8', 2), H(91, 83, 101, 97, '#9aa0a8', 2), H(105, 84, 117, 96, '#9aa0a8', 3),
    H(52, 100, 62, 107, '#d07a3a', 2), H(56, 94, 66, 101, '#d8d8d8', 1), H(58, 108, 64, 114, '#e2c43a', 1), H(65, 108, 72, 113, '#5a9ac0', 1),
    ['field', 70, 128, 18, 11], ['field', 88, 126, 9, 9],
    H(6, 108, 16, 118, '#a8323a', 2), H(17, 108, 25, 116, '#efe6d2', 2), H(20, 118, 28, 124, '#c9a46a', 1), ['round', 28, 119, 3, '#a8323a', 1], ['round', 32, 133, 5, '#a8323a', 2, true], H(35, 130, 45, 138, '#5a9ac0', 2), ['round', 24, 140, 4, '#8a5a3a', 1], H(31, 140, 38, 145, '#5a9ac0', 1),
  ];
  return { PLAN, round, dome, arena, arenaPart, lshape, oval, temple, field, wallArc, wallOf };
})();
