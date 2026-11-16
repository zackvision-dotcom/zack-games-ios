/* Kunai Online — tiny 2.5D renderer.
   Buildings are modelled in 3D (x right, y toward the viewer, z up) and projected with one fixed
   orthographic camera, so every building shares exactly the same 3/4 perspective as the game.
   Faces get painted textures mapped in their own plane, per-face sun lighting, ambient occlusion,
   outlines and a cast shadow on the ground. */
window.ISO = (() => {
  const TAU = Math.PI * 2;
  const CAM = { pitch: 38 * Math.PI / 180, yaw: 0 };
  let SP, CP, SY, CY;
  function camera(pitchDeg, yawDeg) { CAM.pitch = pitchDeg * Math.PI / 180; CAM.yaw = (yawDeg || 0) * Math.PI / 180; SP = Math.sin(CAM.pitch); CP = Math.cos(CAM.pitch); SY = Math.sin(CAM.yaw); CY = Math.cos(CAM.yaw); }
  camera(38, 0);
  const rot = ([x, y, z]) => [x * CY - y * SY, x * SY + y * CY, z];
  const proj = p => { const [x, y, z] = rot(p); return [x, y * SP - z * CP]; };
  const projV = v => { const [x, y, z] = rot(v); return [x, y * SP - z * CP]; };          // linear part
  const depth = p => { const [, y, z] = rot(p); return y * CP + z * SP; };              // bigger = nearer the eye
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const SUN = norm([-.55, .5, .78]);       // light from the top-left, slightly in front

  /* ---------- scene building ---------- */
  function Scene() { this.faces = []; this.lines = []; this.sprites = []; }
  /* painted sprite (trees…) standing at a 3D point; obj has render(g, s, {layer}) and bounds() in world units */
  Scene.prototype.sprite = function (x, y, z, obj, o) { this.sprites.push({ p: [x, y, z], obj, bias: (o && o.bias) || 0 }); return this; };
  Scene.prototype.face = function (pts, mat, o) {
    o = o || {}; const n = o.n || norm(cross(sub(pts[1], pts[0]), sub(pts[pts.length - 1], pts[0])));
    this.faces.push({ pts, holes: o.holes || null, mat, n, U: o.U, V: o.V, O: o.O || pts[0], bias: o.bias || 0, edges: o.edges !== false, ao: o.ao, smooth: o.smooth, cull: o.cull !== false, glyph: o.glyph, ground: o.ground, eave: o.eave, toff: o.toff || 0, edgeMask: o.edgeMask, depthAt: o.depthAt });
    return this;
  };
  /* axis-aligned box; mats: {front, back, left, right, top} (missing = skipped) */
  Scene.prototype.box = function (x0, x1, y0, y1, z0, z1, mats, o) {
    o = o || {}; const m = typeof mats === 'object' && !mats.tex && !mats.color ? mats : { front: mats, top: mats, left: mats, right: mats, back: mats };
    const P = (x, y, z) => [x, y, z];
    if (m.front) this.face([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], m.front, { n: [0, 1, 0], O: P(x0, y1, z1), U: [1, 0, 0], V: [0, 0, -1], ao: true, bias: o.bias, eave: o.eave });
    if (m.top) this.face([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], m.top, { n: [0, 0, 1], O: P(x0, y0, z1), U: [1, 0, 0], V: [0, 1, 0], bias: o.bias });
    if (m.left) this.face([P(x0, y0, z0), P(x0, y1, z0), P(x0, y1, z1), P(x0, y0, z1)], m.left, { n: [-1, 0, 0], O: P(x0, y0, z1), U: [0, 1, 0], V: [0, 0, -1], ao: true, bias: o.bias });
    if (m.right) this.face([P(x1, y1, z0), P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1)], m.right, { n: [1, 0, 0], O: P(x1, y1, z1), U: [0, -1, 0], V: [0, 0, -1], ao: true, bias: o.bias });
    if (m.back) this.face([P(x1, y0, z0), P(x0, y0, z0), P(x0, y0, z1), P(x1, y0, z1)], m.back, { n: [0, -1, 0], O: P(x1, y0, z1), U: [-1, 0, 0], V: [0, 0, -1], bias: o.bias });
    return this;
  };
  /* a slab rotated around a vertical hinge (doors) */
  Scene.prototype.leaf = function (hx, hy, ang, w, t, z0, z1, matFace, matEdge, o) {
    o = o || {}; const ca = Math.cos(ang), sa = Math.sin(ang);
    const L = (u, v, z) => [hx + u * ca - v * sa, hy + u * sa + v * ca, z];
    const fu = [ca, sa, 0], fn = [-sa, ca, 0];
    this.face([L(0, t, z0), L(w, t, z0), L(w, t, z1), L(0, t, z1)], matFace, { n: fn, O: L(0, t, z1), U: fu, V: [0, 0, -1], ao: true, glyph: o.glyph, bias: o.bias });
    this.face([L(0, 0, z0), L(0, t, z0), L(0, t, z1), L(0, 0, z1)], matEdge, { n: mul(fu, -1), O: L(0, 0, z1), U: fn, V: [0, 0, -1], bias: o.bias });
    this.face([L(w, t, z0), L(w, 0, z0), L(w, 0, z1), L(w, t, z1)], matEdge, { n: fu, O: L(w, t, z1), U: mul(fn, -1), V: [0, 0, -1], bias: o.bias });
    this.face([L(0, 0, z1), L(w, 0, z1), L(w, t, z1), L(0, t, z1)], matEdge, { n: [0, 0, 1], O: L(0, 0, z1), U: fu, V: fn, bias: o.bias });
    this.face([L(w, 0, z0), L(0, 0, z0), L(0, 0, z1), L(w, 0, z1)], matFace, { n: mul(fn, -1), O: L(w, 0, z1), U: mul(fu, -1), V: [0, 0, -1], ao: true, bias: o.bias });
    return this;
  };
  /* extrude a profile drawn in the x–z plane between y = yFront and y = yBack (with optional holes) */
  Scene.prototype.extrude = function (outer, holes, yFront, yBack, matFront, matEdge, o) {
    o = o || {}; const F = outer.map(([x, z]) => [x, yFront, z]);
    const H = (holes || []).map(h => h.map(([x, z]) => [x, yFront, z]));
    const zMax = Math.max(...outer.map(p => p[1])), xMin = Math.min(...outer.map(p => p[0]));
    this.face(F, matFront, { n: [0, 1, 0], holes: H, O: [xMin, yFront, zMax], U: [1, 0, 0], V: [0, 0, -1], ao: true, bias: o.bias, glyph: o.glyph, eave: o.eave });
    const ring = (pts, inner) => { for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if (a[1] === 0 && b[1] === 0) continue; const A = [a[0], yFront, a[1]], B = [b[0], yFront, b[1]], A2 = [a[0], yBack, a[1]], B2 = [b[0], yBack, b[1]];
      let n = norm(cross(sub(B, A), sub(A2, A))); if (inner) n = mul(n, -1);
      this.face(inner ? [B, A, A2, B2] : [A, B, B2, A2], matEdge, { n, O: A2, U: norm(sub(B, A)), V: [0, 1, 0], bias: (o.bias || 0) - .5, edges: o.edgeLines !== false }); } };
    ring(outer, false); (holes || []).forEach(h => ring(h, true));
    return this;
  };
  /* camera-facing test used at build time to outline the silhouette of curved surfaces */
  const visN = n => n[0] * SY * CP + n[1] * CY * CP + n[2] * SP > 0.0001;
  /* frustum strip between radius r0 at z0 and r1 at z1 (r0 = r1 → cylinder), over the angle range a0..a1.
     Texture runs around the surface continuously (toff = arc length). inward: normals point to the axis (inner walls). */
  Scene.prototype.frustum = function (cx, cy, r0, r1, z0, z1, mat, o) {
    o = o || {}; const seg = o.seg || 32, A0 = o.a0 ?? 0, A1 = o.a1 ?? TAU, inw = o.inward ? -1 : 1, full = Math.abs(A1 - A0 - TAU) < 1e-6;
    const P = (r, a, z) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z], segs = [];
    for (let i = 0; i < seg; i++) { const a0 = A0 + (A1 - A0) * i / seg, a1 = A0 + (A1 - A0) * (i + 1) / seg, am = (a0 + a1) / 2;
      const n = norm([Math.cos(am) * (z1 - z0) * inw, Math.sin(am) * (z1 - z0) * inw, (r0 - r1) * inw || 0]); segs.push({ a0, a1, am, n: n[2] === 0 && z1 === z0 ? [0, 0, 1] : n, v: false }); }
    segs.forEach(sg => { sg.v = visN(sg.n); });
    const mean = (r0 + r1) / 2;
    segs.forEach((sg, i) => {
      const prev = segs[(i - 1 + seg) % seg], next = segs[(i + 1) % seg], em = o.edgeMask ? o.edgeMask.slice() : [0, 2];
      if (!full ? (i === 0 || !prev.v) : !prev.v) em.push(3); if (!full ? (i === seg - 1 || !next.v) : !next.v) em.push(1);
      const pts = inw > 0 ? [P(r0, sg.a0, z0), P(r0, sg.a1, z0), P(r1, sg.a1, z1), P(r1, sg.a0, z1)] : [P(r0, sg.a1, z0), P(r0, sg.a0, z0), P(r1, sg.a0, z1), P(r1, sg.a1, z1)];
      const top = pts[3], down = sub(pts[0], pts[3]), L = Math.hypot(...down) || 1;
      this.face(pts, mat, { n: sg.n, O: top, U: norm(sub(pts[2], pts[3])), V: [down[0] / L, down[1] / L, down[2] / L], edgeMask: em, smooth: true, bias: o.bias, ao: o.ao !== false && Math.abs(sg.n[2]) < .3,
        toff: (inw > 0 ? sg.a0 - A0 : A1 - sg.a1) * mean, eave: o.eave }); });
    return this;
  };
  Scene.prototype.cylinder = function (cx, cy, r, z0, z1, mat, seg, o) {
    o = o || {}; this.frustum(cx, cy, r, r, z0, z1, mat, Object.assign({ seg: seg || 32 }, o));
    if (o.cap !== false) this.disc(cx, cy, r, z1, o.capMat || mat, { bias: o.bias, seg: seg || 32 });
    return this;
  };
  /* flat disc / ring (holes) at height z */
  Scene.prototype.disc = function (cx, cy, r, z, mat, o) {
    o = o || {}; const seg = o.seg || 40, pts = []; for (let i = 0; i < seg; i++) { const a = i / seg * TAU; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]); }
    let holes = null; if (o.hole) { const h = []; for (let i = 0; i < seg; i++) { const a = i / seg * TAU; h.push([cx + Math.cos(a) * o.hole, cy + Math.sin(a) * o.hole, z]); } holes = [h]; }
    this.face(pts, mat, { n: [0, 0, 1], O: [cx - r, cy - r, z], U: [1, 0, 0], V: [0, 1, 0], bias: o.bias, ground: o.ground, holes, edges: o.edges !== false });
    return this;
  };
  /* sphere made of latitude bands (canopies, bushes, lanterns) */
  Scene.prototype.sphere = function (cx, cy, cz, r, mat, o) {
    o = o || {}; const b = o.bands || 6, sq = o.squash || 1;
    for (let i = 0; i < b; i++) { const p0 = -Math.PI / 2 + Math.PI * i / b, p1 = -Math.PI / 2 + Math.PI * (i + 1) / b;
      this.frustum(cx, cy, Math.max(.01, r * Math.cos(p0)), Math.max(.01, r * Math.cos(p1)), cz + r * Math.sin(p0) * sq, cz + r * Math.sin(p1) * sq, mat, { seg: o.seg || 18, edgeMask: i === b - 1 ? [] : [], bias: o.bias, ao: false }); }
    return this;
  };
  /* a flat decal on a front wall (windows, doors, signs) */
  Scene.prototype.decal = function (x0, x1, y, z0, z1, mat, o) {
    o = o || {}; this.face([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], mat, { n: [0, 1, 0], O: [x0, y, z1], U: [1, 0, 0], V: [0, 0, -1], bias: o.bias ?? 2, edges: o.edges !== false, ao: false, depthAt: o.wall ? [(x0 + x1) / 2, y, (o.wall[0] + o.wall[1]) / 2] : null });
    return this;
  };
  /* a curved wall (ring segment) with thickness, from angle a0 to a1 */
  Scene.prototype.ringWall = function (cx, cy, rIn, rOut, z0, z1, a0, a1, matSide, matTop, o) {
    o = o || {};
    this.frustum(cx, cy, rOut, rOut, z0, z1, matSide, { a0, a1, seg: o.seg || 24, bias: o.bias, eave: o.eave });
    this.frustum(cx, cy, rIn, rIn, z0, z1, matSide, { a0, a1, seg: o.seg || 24, inward: true, bias: (o.bias || 0) - 30 });
    const seg = o.seg || 24, P = (r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z1];
    for (let i = 0; i < seg; i++) { const b0 = a0 + (a1 - a0) * i / seg, b1 = a0 + (a1 - a0) * (i + 1) / seg;
      this.face([P(rIn, b0), P(rOut, b0), P(rOut, b1), P(rIn, b1)], matTop, { n: [0, 0, 1], O: P(rIn, b0), U: [1, 0, 0], V: [0, 1, 0], edgeMask: [1, 3], bias: (o.bias || 0) + 1 }); }
    for (const a of [a0, a1]) { if (o.caps && !o.caps[a === a0 ? 0 : 1]) continue;   // caps: [start, end] — slices of one long wall leave their joints open
      const c = Math.cos(a), sn = Math.sin(a), d = a === a0 ? -1 : 1, n = [-sn * d, c * d, 0];
      const pts = [[cx + c * rIn, cy + sn * rIn, z0], [cx + c * rOut, cy + sn * rOut, z0], [cx + c * rOut, cy + sn * rOut, z1], [cx + c * rIn, cy + sn * rIn, z1]];
      this.face(d > 0 ? pts : pts.slice().reverse(), matSide, { n, O: pts[3], U: norm(sub(pts[1], pts[0])), V: [0, 0, -1], bias: o.bias }); }
    return this;
  };
  /* gable roof, ridge along x, with overhang; mats: slope, gable end */
  Scene.prototype.gable = function (x0, x1, y0, y1, zE, zR, mat, o) {
    o = o || {}; const ym = (y0 + y1) / 2, ov = o.over || 0, X0 = x0 - ov, X1 = x1 + ov;
    const sf = norm([0, y1 - ym, zE - zR]), V1 = sf, V2 = norm([0, y0 - ym, zE - zR]);
    this.face([[X0, ym, zR], [X1, ym, zR], [X1, y1, zE], [X0, y1, zE]], mat, { O: [X0, ym, zR], U: [1, 0, 0], V: V1, bias: o.bias });
    this.face([[X1, ym, zR], [X0, ym, zR], [X0, y0, zE], [X1, y0, zE]], mat, { O: [X1, ym, zR], U: [-1, 0, 0], V: V2, bias: o.bias });
    if (o.end) for (const x of [x0, x1]) { const pts = x === x0 ? [[x, y1, zE], [x, ym, zR], [x, y0, zE]] : [[x, y0, zE], [x, ym, zR], [x, y1, zE]]; this.face(pts, o.end, { n: [x === x0 ? -1 : 1, 0, 0], O: [x, y0, zR], U: [0, 1, 0], V: [0, 0, -1], bias: o.bias }); }
    if (o.fascia) this.box(X0, X1, y1, y1 + (o.fasciaT || 4), zE - (o.fasciaH || 6), zE, { front: o.fascia }, { bias: (o.bias || 0) + 1 });
    return this;
  };
  /* hipped roof (4 slopes) over a rectangle */
  Scene.prototype.hip = function (x0, x1, y0, y1, zE, zR, mat, o) {
    o = o || {}; const ov = o.over || 0, X0 = x0 - ov, X1 = x1 + ov, Y0 = y0 - ov, Y1 = y1 + ov, inset = Math.min(X1 - X0, Y1 - Y0) / 2 * (o.ridge ?? .9);
    const r0 = [X0 + inset, (Y0 + Y1) / 2, zR], r1 = [X1 - inset, (Y0 + Y1) / 2, zR];
    this.face([r0, r1, [X1, Y1, zE], [X0, Y1, zE]], mat, { O: r0, U: [1, 0, 0], V: norm(sub([r0[0], Y1, zE], r0)), bias: o.bias });
    this.face([r1, r0, [X0, Y0, zE], [X1, Y0, zE]], mat, { O: r1, U: [-1, 0, 0], V: norm(sub([r1[0], Y0, zE], r1)), bias: o.bias });
    this.face([r0, [X0, Y1, zE], [X0, Y0, zE]], mat, { O: r0, U: [0, 1, 0], V: norm(sub([X0, r0[1], zE], r0)), bias: o.bias });
    this.face([r1, [X1, Y0, zE], [X1, Y1, zE]], mat, { O: r1, U: [0, -1, 0], V: norm(sub([X1, r1[1], zE], r1)), bias: o.bias });
    if (o.fascia) this.box(X0, X1, Y1, Y1 + (o.fasciaT || 3), zE - (o.fasciaH || 5), zE, { front: o.fascia }, { bias: (o.bias || 0) + 1 });
    return this;
  };
  /* tube along a 3D polyline (pipes, cables, rails) */
  Scene.prototype.tube = function (path, r, mat, o) { this.lines.push({ path, r, mat, o: o || {} }); return this; };

  /* ---------- textures ---------- */
  const texCache = {}; let SHC = null;   // one scratch canvas for every cast shadow, emptied after use
  function texture(id, w, h, draw) { if (texCache[id]) return texCache[id]; const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); texCache[id] = c; return c; }

  /* ---------- rendering ---------- */
  function shadeOf(n) { const d = dot(n, SUN); return .58 + .5 * Math.max(0, d) + (n[2] > .5 ? .06 : 0); }
  function facing(f) { const v = [SY * CP, CY * CP, SP]; return dot(f.n, v) > 0.0001; }
  function pathPts(g, pts) { const p0 = proj(pts[0]); g.moveTo(p0[0], p0[1]); for (let i = 1; i < pts.length; i++) { const p = proj(pts[i]); g.lineTo(p[0], p[1]); } g.closePath(); }
  function drawFace(g, f, s) {
    g.beginPath(); pathPts(g, f.pts); if (f.holes) for (const h of f.holes) pathPts(g, h);
    const mat = f.mat; g.save(); g.clip('evenodd');
    // base: texture in the face's own plane, or flat colour
    if (mat.tex) {
      const tex = mat.tex, U = f.U || [1, 0, 0], V = f.V || [0, 0, -1], o = proj(f.O), u = projV(U), v = projV(V);
      g.save(); g.transform(u[0], u[1], v[0], v[1], o[0], o[1]); if (f.toff) g.translate(-(f.toff % mat.tw), 0); const k = mat.tw / tex.width; g.scale(k, k);
      if (mat.whole) g.drawImage(tex, 0, 0); else { const pat = g.createPattern(tex, 'repeat'); g.fillStyle = pat; g.fillRect(-tex.width * 4, -tex.height * 4, tex.width * 40, tex.height * 40); }
      g.restore();
    } else { g.fillStyle = mat.color; g.fill('evenodd'); }
    // light
    const k = shadeOf(f.n) * (mat.lit || 1);
    if (k < 1) { g.fillStyle = `rgba(36,16,30,${(1 - k) * .9})`; g.fillRect(-1e4, -1e4, 2e4, 2e4); }
    else { g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(255,236,190,${Math.min(.6, (k - 1) * 2.2)})`; g.fillRect(-1e4, -1e4, 2e4, 2e4); g.globalCompositeOperation = 'source-over'; }
    // cylinder gloss: rim highlight on lit segments
    if (f.smooth && Math.abs(f.n[2]) < .3 && dot(f.n, SUN) > .55) { g.fillStyle = `rgba(255,255,255,${(dot(f.n, SUN) - .55) * .9})`; g.fillRect(-1e4, -1e4, 2e4, 2e4); }
    // ambient occlusion: walls darken toward the ground and under the eaves
    if (f.ao && Math.abs(f.n[2]) < .3) { const zs = f.pts.map(p => p[2]), z0 = Math.min(...zs), z1 = Math.max(...zs), a = proj([f.pts[0][0], f.pts[0][1], z0]), b = proj([f.pts[0][0], f.pts[0][1], z0 + Math.min(40, (z1 - z0) * .5)]);
      const q = g.createLinearGradient(a[0], a[1], b[0], b[1]); q.addColorStop(0, 'rgba(30,14,10,.45)'); q.addColorStop(1, 'rgba(30,14,10,0)'); g.fillStyle = q; g.fillRect(-1e4, -1e4, 2e4, 2e4); }
    // shadow under an overhang: darkens the top of a wall
    if (f.eave) { const zs = f.pts.map(p => p[2]), z1 = Math.max(...zs), a = proj([f.pts[0][0], f.pts[0][1], z1]), b = proj([f.pts[0][0], f.pts[0][1], z1 - f.eave]);
      const q = g.createLinearGradient(a[0], a[1], b[0], b[1]); q.addColorStop(0, 'rgba(30,12,10,.62)'); q.addColorStop(.55, 'rgba(30,12,10,.42)'); q.addColorStop(1, 'rgba(30,12,10,0)'); g.fillStyle = q; g.fillRect(-1e4, -1e4, 2e4, 2e4); }
    if (f.glyph) f.glyph(g, f);
    g.restore();
    if (f.edgeMask) { g.beginPath(); for (const e of f.edgeMask) { const a = proj(f.pts[e]), b = proj(f.pts[(e + 1) % f.pts.length]); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } g.lineCap = 'round'; g.lineWidth = 1.6 / s; g.strokeStyle = 'rgba(42,20,10,.85)'; g.stroke(); }
    else if (f.edges) { g.beginPath(); pathPts(g, f.pts); if (f.holes) for (const h of f.holes) pathPts(g, h); g.lineJoin = 'round'; g.lineWidth = 1.5 / s; g.strokeStyle = 'rgba(42,20,10,.85)'; g.stroke(); }
  }
  function drawTube(g, t, s) {
    const pts = t.path.map(proj);
    const stroke = (w, col) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = w; g.strokeStyle = col; g.stroke(); };
    stroke(t.r * 2 + 3 / s, 'rgba(42,20,10,.9)'); stroke(t.r * 2, t.mat.color); if (t.o.shine !== false) { g.save(); g.translate(-t.r * .35, -t.r * .35); stroke(Math.max(1, t.r * .55), t.mat.shine || 'rgba(255,255,255,.55)'); g.restore(); }
  }
  /* screen-space bounds (world units at scale 1), including the cast shadow */
  Scene.prototype.bounds = function () {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const k = 1 / SUN[2];
    const eat = p => { const q = proj(p); if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; };
    for (const f of this.faces) for (const p of f.pts) { eat(p); if (!f.ground) eat([p[0] - SUN[0] * p[2] * k, p[1] - SUN[1] * p[2] * k, 0]); }
    for (const t of this.lines) for (const p of t.path) { eat(p); eat([p[0] - SUN[0] * p[2] * k, p[1] - SUN[1] * p[2] * k, 0]); }
    for (const sp of this.sprites) { const q = proj(sp.p), b = sp.obj.bounds(); eat([0, 0, 0]); x0 = Math.min(x0, q[0] + b.x0); x1 = Math.max(x1, q[0] + b.x1); y0 = Math.min(y0, q[1] + b.y0); y1 = Math.max(y1, q[1] + b.y1); }
    return { x0: x0 - 30, y0: y0 - 30, x1: x1 + 30, y1: y1 + 30 };
  };
  /* render once into an offscreen canvas; s = css px per world unit, dpr = device ratio (capped so the canvas stays < 4096 px) */
  Scene.prototype.bake = function (s, dpr, o) {
    const b = this.bounds(); let d = dpr || 1; const w = (b.x1 - b.x0) * s, h = (b.y1 - b.y0) * s; d = Math.min(d, 4096 / Math.max(w, h, 1));
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w * d)); c.height = Math.max(1, Math.ceil(h * d)); const g = c.getContext('2d');
    g.setTransform(d * s, 0, 0, d * s, -b.x0 * d * s, -b.y0 * d * s); this.render(g, s * d, o);
    return { canvas: c, ox: -b.x0 * s, oy: -b.y0 * s, w, h };
  };
  /* sort and draw; returns the bounds used */
  Scene.prototype.render = function (g, s, o) {
    o = o || {}; const layer = o.layer;   // 'ground' = floors + cast shadow only, 'objects' = everything standing
    // ground decals first (aprons, floors), so the cast shadow lands on them
    if (layer !== 'objects') for (const f of this.faces) if (f.ground) drawFace(g, f, s);
    // cast shadow on the ground (drawn once, merged, so overlaps do not stack)
    if (o.shadow !== false && layer !== 'objects') {
      const sh = SHC || (SHC = document.createElement('canvas')), W = g.canvas.width, H = g.canvas.height; if (sh.width !== W || sh.height !== H) { sh.width = W; sh.height = H; } const q = sh.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, W, H); q.setTransform(g.getTransform());
      q.fillStyle = '#000'; const k = 1 / SUN[2];
      for (const f of this.faces) { if (f.ground) continue; q.beginPath(); const pts = f.pts.map(p => [p[0] - SUN[0] * p[2] * k, p[1] - SUN[1] * p[2] * k, 0]); pathPts(q, pts); q.fill(); }
      for (const t of this.lines) { q.beginPath(); const pts = t.path.map(p => proj([p[0] - SUN[0] * p[2] * k, p[1] - SUN[1] * p[2] * k, 0])); q.moveTo(pts[0][0], pts[0][1]); for (const p of pts) q.lineTo(p[0], p[1]); q.lineWidth = t.r * 2; q.strokeStyle = '#000'; q.stroke(); }
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = o.shadowA || .28; g.filter = 'blur(1.5px)'; g.drawImage(sh, 0, 0); g.filter = 'none'; g.restore(); sh.width = sh.height = 0;   // give the memory back at once
    }
    for (const sp of this.sprites) { if (layer === 'objects') break; const q = proj(sp.p); g.save(); g.translate(q[0], q[1]); sp.obj.render(g, s, { layer: 'ground' }); g.restore(); }
    if (layer === 'ground') return;
    const items = [];
    for (const f of this.faces) { if (f.ground || (f.cull && !facing(f))) continue; const c = f.depthAt || f.pts.reduce((a, p) => add(a, p), [0, 0, 0]).map(v => v / f.pts.length); items.push({ d: depth(c) + f.bias, f }); }
    for (const t of this.lines) { const c = t.path[t.path.length >> 1]; items.push({ d: depth(c) + (t.o.bias || 0), t }); }
    for (const sp of this.sprites) items.push({ d: depth(sp.p) + sp.bias, sp });
    items.sort((a, b) => a.d - b.d);
    for (const it of items) { if (it.sp) { const q = proj(it.sp.p); g.save(); g.translate(q[0], q[1]); it.sp.obj.render(g, s, { layer: 'objects' }); g.restore(); } else if (it.f) drawFace(g, it.f, s); else drawTube(g, it.t, s); }
  };
  return { Scene, camera, proj, depth, texture, SUN, norm, cross, sub, CAM };
})();
