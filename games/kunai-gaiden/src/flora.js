/* Kunai Online — custom village vegetation, flat-vector style (same look as trees.js, validated by the user):
   no ink outline, foliage built from hundreds of small leaves on 3D volumes, lit per leaf from the top-left,
   soft union cast shadow to the right. World units (24 per metre); camera like ISO (depth .616, height .788).
   FLORA.make({kind, seed, ...}) → { render(g,s,{layer}), bake(), bounds() } usable as an ISO sprite.
   Kinds: giant, jpine, maple, bamboo, hedge, planter, azalea, hydrangea, fern, tallgrass. */
window.FLORA = (() => {
  const M = 24, TAU = Math.PI * 2, SP = .616, CP = .788;
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const LIGHT = [-.5, -.62, .6];
  const PAL = {
    forest: ['#1e3d22', '#2b5530', '#3b6e3a', '#4f8a42', '#6aa64e', '#8cc062'],
    pine:   ['#18321f', '#22452a', '#2f5c34', '#3f7440', '#56904e', '#77ad66'],
    maple:  ['#6e1a16', '#93241c', '#b93a24', '#d9572c', '#ee7d3a', '#f8a95a'],
    bamboo: ['#3f5f22', '#557a2c', '#6c9636', '#86b043', '#a2c858', '#c4de7c'],
    hedge:  ['#24452a', '#325a32', '#43723c', '#588c46', '#71a654', '#92c06a'],
    bush:   ['#2c5026', '#3d692e', '#538438', '#6c9e42', '#88b652', '#a8cc6a'],
  };
  const BARK = ['#4e423d', '#6c5d55', '#8f8076'];
  const P2 = (x, y, z) => [x, y * SP - z * CP];          // world (x right, y toward viewer, z up) → screen

  function leafPath(g, x, y, s, a, shape) {
    g.save(); g.translate(x, y); g.rotate(a); g.beginPath();
    if (shape === 'needle') { g.moveTo(-s * 1.2, 0); g.lineTo(0, -s * .38); g.lineTo(s * 1.2, 0); g.lineTo(0, s * .38); }
    else if (shape === 'blade') { g.moveTo(-s * 1.8, 0); g.quadraticCurveTo(0, -s * .42, s * 1.8, 0); g.quadraticCurveTo(0, s * .3, -s * 1.8, 0); }
    else if (shape === 'star') { for (let i = 0; i < 10; i++) { const r = i % 2 ? s * .45 : s * 1.05, t = i / 10 * TAU - Math.PI / 2; g.lineTo(Math.cos(t) * r, Math.sin(t) * r); } }
    else if (shape === 'dot') { g.arc(0, 0, s * .55, 0, TAU); }
    else { g.moveTo(-s, 0); g.quadraticCurveTo(-s * .2, -s * .95, s * .9, -s * .1); g.quadraticCurveTo(s * .1, s * .9, -s, 0); }
    g.closePath(); g.fill(); g.restore();
  }
  /* foliage engine: vols = [[x, y(screen, up negative), z(depth toward viewer), r, squash]] in world units */
  function foliage(r0, vols, n, size, shape, opts) {
    opts = opts || {}; const out = [];
    for (let i = 0; i < n; i++) { const v = vols[(r0() * vols.length) | 0], u = r0() * 2 - 1, th = r0() * TAU, sq = Math.sqrt(1 - u * u), nn = [Math.cos(th) * sq, u, Math.sin(th) * sq];
      if (nn[2] < -.35 && r0() < .75) continue; const r = v[3] * (.92 + r0() * .12), ys = v[4] || .92;
      let k = nn[0] * LIGHT[0] + nn[1] * LIGHT[1] * (ys < .7 ? 1.4 : 1) + nn[2] * LIGHT[2] + (r0() - .5) * .35;
      out.push({ x: v[0] + nn[0] * r, y: v[1] + nn[1] * r * ys, z: v[2] + nn[2] * r, k, a: opts.angle != null ? opts.angle + (r0() - .5) * .9 : r0() * TAU, s: size * (.75 + r0() * .5), shape }); }
    return out;
  }
  const tone = (pal, k) => pal[Math.max(0, Math.min(5, Math.round((k + .55) * 3.4)))];
  function drawLeaves(g, list, pal) { for (const L of list) { g.fillStyle = L.col || tone(pal, L.k); leafPath(g, L.x, L.y, L.s, L.a, L.shape); } }
  function baseFill(g, vols, col) { g.fillStyle = col; for (const v of vols) { g.beginPath(); g.ellipse(v[0], v[1], v[3] * .9, v[3] * .84 * (v[4] || .92), 0, 0, TAU); g.fill(); } }
  function shadowOf(g, leaves, r0, extra) { g.fillStyle = 'rgba(70,72,60,.17)'; g.beginPath();
    for (const L of leaves) { if (r0() < .5) continue; const h = Math.max(0, -L.y), gx = L.x + h * .62 + 6, gy = -h * .12 + L.z * .2 + 2; g.moveTo(gx + L.s * 1.4, gy); g.ellipse(gx, gy, L.s * 1.4, L.s * .75, 0, 0, TAU); }
    if (extra) extra(g); g.fill(); }
  function limb(g, x0, y0, x1, y1, w0, w1, cx, cy) { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    g.beginPath(); g.moveTo(x0 + nx * w0, y0 + ny * w0); if (cx != null) g.quadraticCurveTo(cx + nx * (w0 + w1) / 2, cy + ny * (w0 + w1) / 2, x1 + nx * w1, y1 + ny * w1); else g.lineTo(x1 + nx * w1, y1 + ny * w1);
    g.lineTo(x1 - nx * w1, y1 - ny * w1); if (cx != null) g.quadraticCurveTo(cx - nx * (w0 + w1) / 2, cy - ny * (w0 + w1) / 2, x0 - nx * w0, y0 - ny * w0); else g.lineTo(x0 - nx * w0, y0 - ny * w0); g.closePath();
    const q = g.createLinearGradient(x0 + nx * w0, y0 + ny * w0, x0 - nx * w0, y0 - ny * w0); q.addColorStop(0, BARK[2]); q.addColorStop(.45, BARK[1]); q.addColorStop(1, BARK[0]); g.fillStyle = q; g.fill(); }
  function tufts(g, r0, n, spread, col) { for (let t = 0; t < n; t++) { const gx = (r0() - .5) * spread, gy = (r0() - .3) * spread * .3; for (let b = 0; b < 9; b++) { const a = -Math.PI / 2 + (b - 4) * .2 + (r0() - .5) * .1, l = 8 + r0() * 8;
    g.strokeStyle = b % 2 ? (col || '#7da642') : '#5f8a34'; g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(gx + (b - 4) * .9, gy); g.quadraticCurveTo(gx + Math.cos(a) * l * .5, gy + Math.sin(a) * l * .6, gx + Math.cos(a) * l, gy + Math.sin(a) * l); g.stroke(); } } }

  /* ---------- species ---------- */
  const SPECIES = {
    // the huge trees around Aozora: thick flared trunk with roots, high wide canopy
    giant(g, o, layer, r0) { const H = (o.h || 15) * M, tw = H * .045, top = -H * .55, pal = PAL.forest;
      const vols = [[0, -H * .78, 0, H * .26], [-H * .3, -H * .66, .05 * H, H * .2], [H * .3, -H * .68, 0, H * .21], [-H * .14, -H * .92, -.05 * H, H * .18], [H * .16, -H * .93, .05 * H, H * .17], [-H * .45, -H * .58, -.05 * H, H * .14], [H * .46, -H * .6, -.04 * H, H * .14]];
      const leaves = foliage(r0, vols, 2600, 7.5, 'leaf');
      if (layer !== 'objects') { shadowOf(g, leaves, r0, q => { q.moveTo(tw * 3.5, 4); q.ellipse(6, 4, tw * 3.5, tw * 1.1, 0, 0, TAU); }); if (layer === 'ground') return; }
      tufts(g, r0, 6, H * .35);
      baseFill(g, vols, pal[1]); drawLeaves(g, leaves.filter(L => L.z < 0).sort((a, b) => a.z - b.z), pal);
      // roots flaring out, then the trunk, then heavy branches
      for (const [ex, ey] of [[-tw * 3.2, 3], [tw * 3, 4], [-tw * 1.4, 10], [tw * 1.6, 9], [0, 12]]) limb(g, 0, -tw * 1.6, ex, ey, tw * .7, tw * .2, ex * .4, -tw * .2);
      limb(g, 0, 0, 0, top, tw * 1.05, tw * .7, tw * .2, top / 2);
      for (const [bx, by, w] of [[-H * .3, -H * .7, .55], [H * .3, -H * .72, .55], [-H * .08, -H * .9, .45], [H * .12, -H * .86, .4]]) limb(g, 0, top + tw, bx, by, tw * w, tw * w * .35, bx * .3, (top + by) / 2);
      g.strokeStyle = 'rgba(40,30,25,.35)'; g.lineWidth = 2; for (let i = 0; i < 7; i++) { const x = (r0() - .5) * tw * 1.4; g.beginPath(); g.moveTo(x, -tw); g.quadraticCurveTo(x + (r0() - .5) * 8, top * .5, x * .7, top * .9); g.stroke(); }
      const front = leaves.filter(L => L.z >= 0).sort((a, b) => a.z - b.z); drawLeaves(g, front, pal);
      g.save(); g.beginPath(); g.rect(-H, top - tw * 2, H * 2, H); g.clip(); for (const [bx, by, w] of [[-H * .3, -H * .7, .55], [H * .3, -H * .72, .55]]) limb(g, 0, top + tw, bx, by, tw * w, tw * w * .35, bx * .3, (top + by) / 2); g.restore(); },
    // Japanese black pine: leaning S trunk, horizontal cloud pads of needles
    jpine(g, o, layer, r0) { const H = (o.h || 6) * M, tw = H * .045, pal = PAL.pine, lean = (r0() < .5 ? -1 : 1) * H * .12;
      const pads = [[lean * 1.2, -H * .95, 0, H * .2, .42], [lean * -1.1 - H * .22, -H * .7, .05 * H, H * .18, .4], [lean * .9 + H * .25, -H * .58, 0, H * .17, .38], [lean * .4, -H * .8, -.06 * H, H * .16, .4], [lean * -.6 - H * .05, -H * .45, .02 * H, H * .14, .36]];
      const leaves = foliage(r0, pads, 1700, 5.2, 'needle', { angle: -.25 });
      if (layer !== 'objects') { shadowOf(g, leaves, r0); if (layer === 'ground') return; }
      tufts(g, r0, 3, H * .4);
      baseFill(g, pads, pal[1]); drawLeaves(g, leaves.filter(L => L.z < 0).sort((a, b) => a.z - b.z), pal);
      limb(g, 0, 0, lean, -H * .55, tw, tw * .55, -lean * .9, -H * .25); limb(g, lean, -H * .55, lean * 1.2, -H * .92, tw * .55, tw * .3, lean * 1.6, -H * .74);
      for (const p of pads.slice(1)) limb(g, lean * .6, -H * .6 + (p[1] + H * .6) * .3, p[0], p[1] + p[3] * .25, tw * .4, tw * .18);
      drawLeaves(g, leaves.filter(L => L.z >= 0).sort((a, b) => a.z - b.z), pal);
      g.fillStyle = 'rgba(15,35,20,.25)'; for (const p of pads) { g.beginPath(); g.ellipse(p[0], p[1] + p[3] * .3, p[3] * .8, p[3] * .16, 0, 0, TAU); g.fill(); } },
    // momiji maple: star leaves in autumn reds
    maple(g, o, layer, r0) { const H = (o.h || 5.5) * M, tw = H * .042, pal = PAL[o.pal || 'maple'];
      const vols = [[0, -H * .7, 0, H * .27], [-H * .26, -H * .6, .05 * H, H * .18], [H * .27, -H * .62, 0, H * .19], [-H * .1, -H * .88, -.04 * H, H * .17], [H * .14, -H * .86, .04 * H, H * .16]];
      const leaves = foliage(r0, vols, 1500, 4.8, 'star');
      if (layer !== 'objects') { shadowOf(g, leaves, r0); if (layer === 'ground') return; }
      tufts(g, r0, 3, H * .4);
      baseFill(g, vols, pal[1]); drawLeaves(g, leaves.filter(L => L.z < 0).sort((a, b) => a.z - b.z), pal);
      limb(g, 0, 0, tw * .3, -H * .5, tw, tw * .6); for (const [bx, by] of [[-H * .26, -H * .66], [H * .25, -H * .68], [0, -H * .86]]) limb(g, tw * .3, -H * .5, bx, by, tw * .45, tw * .2, bx * .4, -H * .62);
      drawLeaves(g, leaves.filter(L => L.z >= 0).sort((a, b) => a.z - b.z), pal);
      g.save(); g.beginPath(); g.rect(-H, -H * .52, H * 2, H); g.clip(); for (const [bx, by] of [[-H * .26, -H * .66], [H * .25, -H * .68]]) limb(g, tw * .3, -H * .5, bx, by, tw * .45, tw * .2, bx * .4, -H * .62); g.restore();
      for (let i = 0; i < 16; i++) { g.fillStyle = tone(pal, .4 + r0() * .4); leafPath(g, (r0() - .5) * H * .8, (r0() - .2) * H * .12, 3.4, r0() * TAU, 'star'); } },
    // bamboo grove: slim segmented culms, narrow leaf sprays
    bamboo(g, o, layer, r0) { const H = (o.h || 7) * M, n = o.n || 9, pal = PAL.bamboo, culms = [];
      for (let i = 0; i < n; i++) { const bx = (r0() - .5) * M * 2.2, bz = (r0() - .5) * M * 1.4, hh = H * (.75 + r0() * .3), bend = (r0() - .5) * H * .18; culms.push({ bx, by: bz * SP, bz, hh, bend, w: 2.6 + r0() * 1.4 }); }
      culms.sort((a, b) => a.bz - b.bz);
      const vols = []; for (const c of culms) for (let k = 0; k < 4; k++) { const u = .45 + k * .17; vols.push([c.bx + c.bend * u * u, c.by - c.hh * u, c.bz, M * (.9 - k * .12), .7]); }
      const leaves = foliage(r0, vols, 1400, 5, 'blade', { angle: .5 });
      if (layer !== 'objects') { shadowOf(g, leaves, r0); if (layer === 'ground') return; }
      tufts(g, r0, 4, M * 2.4);
      drawLeaves(g, leaves.filter(L => L.z < -M * .3), pal);
      for (const c of culms) { g.strokeStyle = '#5f8a2c'; g.lineWidth = c.w; g.lineCap = 'round'; g.beginPath(); g.moveTo(c.bx, c.by); g.quadraticCurveTo(c.bx, c.by - c.hh * .6, c.bx + c.bend, c.by - c.hh); g.stroke();
        g.strokeStyle = '#9cc35a'; g.lineWidth = c.w * .35; g.beginPath(); g.moveTo(c.bx - c.w * .25, c.by); g.quadraticCurveTo(c.bx - c.w * .25, c.by - c.hh * .6, c.bx + c.bend - c.w * .25, c.by - c.hh); g.stroke();
        for (let k = 1; k < 12; k++) { const u = k / 12, x = c.bx + c.bend * u * u, y = c.by - c.hh * u; g.strokeStyle = '#3f5f1f'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - c.w * .6, y); g.lineTo(x + c.w * .6, y); g.stroke(); } }
      drawLeaves(g, leaves.filter(L => L.z >= -M * .3).sort((a, b) => a.z - b.z), pal); },
    // trimmed hedge: a box of small leaves (front face + top face lit differently)
    hedge(g, o, layer, r0) { const w = (o.w || 3) * M, d = (o.d || .8) * M, h = (o.hh || 1.1) * M, pal = PAL.hedge;
      const fr = [P2(-w / 2, d / 2, 0), P2(w / 2, d / 2, 0), P2(w / 2, d / 2, h), P2(-w / 2, d / 2, h)], tp = [P2(-w / 2, -d / 2, h), P2(w / 2, -d / 2, h), P2(w / 2, d / 2, h), P2(-w / 2, d / 2, h)];
      if (layer !== 'objects') { g.fillStyle = 'rgba(70,72,60,.17)'; g.beginPath(); const sx = h * .62; g.moveTo(fr[1][0], fr[1][1]); g.lineTo(fr[1][0] + sx, fr[1][1] - h * .12); g.lineTo(tp[1][0] + sx, tp[1][1] + h * CP - h * .12); g.lineTo(tp[1][0], tp[1][1] + h * CP); g.closePath(); g.fill(); if (layer === 'ground') return; }
      const poly = (pts, col) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = col; g.fill(); };
      poly(fr, pal[2]); poly(tp, pal[3]);
      const N = Math.round(w * h / 9 + w * d / 9);
      for (let i = 0; i < N; i++) { const top = r0() < (d / (d + h)) * .9, u = r0(), v = r0();
        const p = top ? P2(-w / 2 + u * w, -d / 2 + v * d, h + (r0() - .5) * 3) : P2(-w / 2 + u * w, d / 2 + (r0() - .5) * 3, v * h);
        const k = top ? .55 + (1 - v) * .1 - u * .25 : .05 + v * .35 - u * .25 + (r0() - .5) * .3; g.fillStyle = tone(pal, k + (r0() - .5) * .3); leafPath(g, p[0], p[1], 3.8 + r0() * 1.6, r0() * TAU, 'leaf'); }
      g.fillStyle = 'rgba(20,40,20,.25)'; g.fillRect(fr[0][0], fr[0][1] - 3, w, 3); },
    // wooden planter with a bush and flowers
    planter(g, o, layer, r0) { const w = (o.w || 1.6) * M, d = (o.d || .7) * M, h = .55 * M;
      if (layer !== 'objects') { g.fillStyle = 'rgba(70,72,60,.17)'; g.beginPath(); g.ellipse(w * .2, 2, w * .7, d * .5, 0, 0, TAU); g.fill(); if (layer === 'ground') return; }
      const fr = [P2(-w / 2, d / 2, 0), P2(w / 2, d / 2, 0), P2(w / 2, d / 2, h), P2(-w / 2, d / 2, h)], tp = [P2(-w / 2, -d / 2, h), P2(w / 2, -d / 2, h), P2(w / 2, d / 2, h), P2(-w / 2, d / 2, h)];
      const poly = (pts, col) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = col; g.fill(); };
      poly(tp, '#5a4030'); poly(fr, '#a8784c'); g.strokeStyle = 'rgba(70,40,20,.45)'; g.lineWidth = 1.4; for (let k = 1; k < 3; k++) { const y = fr[0][1] - h * CP * k / 3; g.beginPath(); g.moveTo(fr[0][0], y); g.lineTo(fr[1][0], y); g.stroke(); }
      const vols = [[-w * .22, tp[3][1] - M * .25, 0, M * .42, .85], [w * .22, tp[3][1] - M * .22, 0, M * .4, .85], [0, tp[3][1] - M * .45, -4, M * .42, .85]];
      const leaves = foliage(r0, vols, 420, 3.8, 'leaf'); baseFill(g, vols, PAL.bush[1]); drawLeaves(g, leaves.sort((a, b) => a.z - b.z), PAL.bush);
      const fl = o.flowers || ['#f2f0e6', '#f4d35e', '#e86a8a'][(o.seed || 0) % 3]; for (let i = 0; i < 18; i++) { const L = leaves[(r0() * leaves.length) | 0]; if (L.k < .1) continue; g.fillStyle = fl; g.beginPath(); g.arc(L.x, L.y, 2.6, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,240,150,.9)'; g.beginPath(); g.arc(L.x, L.y, .9, 0, TAU); g.fill(); } },
    // flowering bushes
    azalea(g, o, layer, r0) { SPECIES._flowerBush(g, o, layer, r0, ['#c2416e', '#d9578a', '#ec79a6', '#f59cc0', '#fbbfd6', '#fde0ea'], 'dot'); },
    hydrangea(g, o, layer, r0) { SPECIES._flowerBush(g, o, layer, r0, ['#3d4f9a', '#5266b8', '#6d82d0', '#8ea2e2', '#b0bff0', '#d2dcfa'], 'ball'); },
    _flowerBush(g, o, layer, r0, fpal, mode) { const w = (o.w || 1.5) * M;
      const vols = [[-w * .28, -w * .32, 0, w * .32, .8], [w * .28, -w * .3, .05 * w, w * .3, .8], [0, -w * .48, -.05 * w, w * .34, .8]];
      const leaves = foliage(r0, vols, 520, 4.2, 'leaf');
      if (layer !== 'objects') { shadowOf(g, leaves, r0); if (layer === 'ground') return; }
      baseFill(g, vols, PAL.bush[1]); drawLeaves(g, leaves.sort((a, b) => a.z - b.z), PAL.bush);
      if (mode === 'ball') { for (let i = 0; i < 9; i++) { const L = leaves[(r0() * leaves.length) | 0], R = 6 + r0() * 3; for (let k = 0; k < 14; k++) { const a = r0() * TAU, rr = r0() * R; g.fillStyle = tone(fpal, (L.k + (Math.cos(a) * -.4 - Math.sin(a) * .4) * rr / R) * .9); g.beginPath(); g.arc(L.x + Math.cos(a) * rr, L.y + Math.sin(a) * rr * .9, 2.4, 0, TAU); g.fill(); } } }
      else for (let i = 0; i < 70; i++) { const L = leaves[(r0() * leaves.length) | 0]; g.fillStyle = tone(fpal, L.k); leafPath(g, L.x, L.y, 3.4, r0() * TAU, 'star'); } },
    fern(g, o, layer, r0) { const R = (o.w || 1.2) * M, pal = PAL.forest;
      if (layer !== 'objects') { g.fillStyle = 'rgba(70,72,60,.17)'; g.beginPath(); g.ellipse(R * .25, 2, R * .7, R * .25, 0, 0, TAU); g.fill(); if (layer === 'ground') return; }
      const fronds = []; for (let i = 0; i < 11; i++) { const a = -Math.PI / 2 + (i - 5) * .27 + (r0() - .5) * .1, l = R * (.7 + r0() * .4); fronds.push({ a, l, z: Math.sin(a) }); }
      fronds.sort((a, b) => Math.abs(a.a + Math.PI / 2) < Math.abs(b.a + Math.PI / 2) ? -1 : 1).reverse();
      for (const f of fronds) { const ex = Math.cos(f.a) * f.l, ey = Math.sin(f.a) * f.l * .75, cx = ex * .5, cy = ey * .9 - f.l * .2;
        g.strokeStyle = pal[2]; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(cx, cy, ex, ey); g.stroke();
        for (let k = 1; k < 12; k++) { const u = k / 12, x = 2 * (1 - u) * u * cx + u * u * ex, y = 2 * (1 - u) * u * cy + u * u * ey, tx = 2 * (1 - u) * cx + 2 * u * (ex - cx), ty = 2 * (1 - u) * cy + 2 * u * (ey - cy), ang = Math.atan2(ty, tx), sz = (1 - u * .7) * 5;
          for (const sd of [-1, 1]) { g.fillStyle = tone(pal, .1 + (sd < 0 ? .35 : 0) + (1 - u) * .2); leafPath(g, x + Math.cos(ang + sd * 1.2) * sz * .8, y + Math.sin(ang + sd * 1.2) * sz * .8, sz, ang + sd * .9, 'leaf'); } } } },
    tallgrass(g, o, layer, r0) { const R = (o.w || 1) * M;
      if (layer !== 'objects') { g.fillStyle = 'rgba(70,72,60,.15)'; g.beginPath(); g.ellipse(R * .2, 2, R * .55, R * .18, 0, 0, TAU); g.fill(); if (layer === 'ground') return; }
      for (let b = 0; b < 46; b++) { const x0 = (r0() - .5) * R * .7, a = -Math.PI / 2 + (r0() - .5) * 1.1, l = R * (.5 + r0() * .6), x1 = x0 + Math.cos(a) * l, y1 = Math.sin(a) * l, c = ['#5f8a34', '#7da642', '#94b84e', '#b5c96a'][(r0() * 4) | 0];
        g.fillStyle = c; g.beginPath(); g.moveTo(x0 - 1.8, 0); g.quadraticCurveTo((x0 + x1) / 2 + (r0() - .5) * 6, y1 * .5, x1, y1); g.quadraticCurveTo((x0 + x1) / 2, y1 * .5, x0 + 1.8, 0); g.closePath(); g.fill();
        if (r0() < .12) { g.fillStyle = '#d9c98a'; g.beginPath(); g.ellipse(x1, y1, 2.2, 5, a + Math.PI / 2, 0, TAU); g.fill(); } } },
    // reeds and cattails at the water's edge
    reeds(g, o, layer, r0) { const R = (o.w || 1.4) * M;
      if (layer !== 'objects') { g.fillStyle = 'rgba(30,55,45,.18)'; g.beginPath(); g.ellipse(R * .25, 3, R * .7, R * .2, 0, 0, TAU); g.fill(); if (layer === 'ground') return; }
      const blades = []; for (let b = 0; b < 44; b++) { const x0 = (r0() - .5) * R * .9; blades.push({ x0, a: -Math.PI / 2 + x0 / R * .7 + (r0() - .5) * .35, l: R * (.7 + r0() * 1.1) * (1 - Math.abs(x0) / R * .5), w: 1.6 + r0() * 1.6, t: r0(), bend: (r0() - .5) * R * .4 }); }
      blades.sort((p, q) => p.t - q.t);
      const PAL = [['#33582a', '#46703a'], ['#4b7a34', '#6a9a44'], ['#5f8f3c', '#86b356'], ['#78a64a', '#a8cc6e']];
      for (const B of blades) { const x1 = B.x0 + Math.cos(B.a) * B.l + B.bend, y1 = Math.sin(B.a) * B.l, mx = B.x0 + B.bend * .25, my = y1 * .55, p = PAL[Math.min(3, (B.t * 4) | 0)];
        g.fillStyle = p[0]; g.beginPath(); g.moveTo(B.x0 - B.w, 0); g.quadraticCurveTo(mx - B.w * .6, my, x1, y1); g.quadraticCurveTo(mx + B.w * .6, my, B.x0 + B.w, 0); g.closePath(); g.fill();
        g.fillStyle = p[1]; g.beginPath(); g.moveTo(B.x0 - B.w * .9, 0); g.quadraticCurveTo(mx - B.w * .6, my, x1, y1); g.quadraticCurveTo(mx - B.w * .05, my, B.x0, 0); g.closePath(); g.fill();
        if (B.t > .8) { g.strokeStyle = 'rgba(230,250,190,.45)'; g.lineWidth = .7; g.beginPath(); g.moveTo(B.x0 - B.w * .5, -2); g.quadraticCurveTo(mx - B.w * .5, my, x1, y1); g.stroke(); } }
      const nc = 3 + ((r0() * 4) | 0);
      for (let i = 0; i < nc; i++) { const x = (r0() - .5) * R * .6, h = R * (1.3 + r0() * .6), lean = (r0() - .5) * 6;
        g.strokeStyle = '#4e6e2e'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + lean * .3, -h * .6, x + lean, -h - 4); g.stroke();
        g.fillStyle = '#4a2c18'; g.beginPath(); g.ellipse(x + lean * .92, -h + 6, 3, 8, lean * .02, 0, TAU); g.fill();
        g.fillStyle = '#7a4a28'; g.beginPath(); g.ellipse(x + lean * .92 - .8, -h + 5, 1.9, 6.6, lean * .02, 0, TAU); g.fill();
        g.fillStyle = 'rgba(255,225,185,.4)'; g.beginPath(); g.ellipse(x + lean * .92 - 1.4, -h + 3.5, .8, 3.6, 0, 0, TAU); g.fill(); } },
    // lily pads on the water (ground layer only: characters and boats pass over them)
    lily(g, o, layer, r0) { if (layer === 'objects') return; const R = (o.w || 2) * M;
      for (let i = 0; i < 7; i++) { const x = (r0() - .5) * R, y = (r0() - .5) * R * .5, rr = R * (.1 + r0() * .1), a0 = r0() * TAU;
        g.fillStyle = 'rgba(20,60,70,.25)'; g.beginPath(); g.ellipse(x + 2, y + 2, rr, rr * .6, 0, 0, TAU); g.fill();
        g.fillStyle = ['#5f9a3e', '#73ad48', '#4f8a36'][i % 3]; g.beginPath(); g.moveTo(x, y); g.ellipse(x, y, rr, rr * .6, 0, a0 + .35, a0 + TAU - .05); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(200,240,150,.4)'; g.lineWidth = 1; g.beginPath(); g.ellipse(x - rr * .1, y - rr * .08, rr * .7, rr * .4, 0, Math.PI * 1.1, Math.PI * 1.7); g.stroke();
        if (r0() < .3) { for (let p = 0; p < 6; p++) { const a = p / 6 * TAU; g.fillStyle = p % 2 ? '#f6c6d6' : '#fbe2ea'; g.beginPath(); g.ellipse(x + Math.cos(a) * 3, y - 3 + Math.sin(a) * 1.8, 3.2, 1.6, a, 0, TAU); g.fill(); } g.fillStyle = '#f4d35e'; g.beginPath(); g.arc(x, y - 3, 1.6, 0, TAU); g.fill(); } } },
  };
  const SIZE = { giant: [9, 17], jpine: [4.5, 7], maple: [4.5, 6], bamboo: [3, 8.5], hedge: [3, 2], planter: [2, 2], azalea: [2, 2], hydrangea: [2, 2], fern: [2, 1.5], tallgrass: [1.5, 1.5], reeds: [2, 2.6], lily: [3, 1] };
  function make(o) {
    o = Object.assign({ kind: 'jpine', seed: 1 }, o); const [w0, h0] = SIZE[o.kind] || [4, 6], sc = o.h ? o.h / (h0 * .82) : 1, W = w0 * M * sc * (o.w ? o.w / (w0 * .4) : 1), H = h0 * M * sc;
    return {
      bounds: () => ({ x0: -W * .75, y0: -H * 1.05, x1: W * .75 + H * .65, y1: M * 1.2 }),
      render(g, s, ro) { const r0 = rng(o.seed || 1); SPECIES[o.kind](g, o, (ro || {}).layer, r0); },
      bake(s, dpr, ro) { const b = this.bounds(); let d = dpr || 1; const w = (b.x1 - b.x0) * s, hh = (b.y1 - b.y0) * s; d = Math.min(d, 4096 / Math.max(w, hh, 1));
        const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w * d)); c.height = Math.max(1, Math.ceil(hh * d)); const g = c.getContext('2d');
        g.setTransform(d * s, 0, 0, d * s, -b.x0 * d * s, -b.y0 * d * s); this.render(g, s * d, ro); return { canvas: c, ox: -b.x0 * s, oy: -b.y0 * s, w, h: hh }; },
      faces: [], lines: [], sprites: [],
    };
  }
  return { make, kinds: Object.keys(SIZE) };
})();
