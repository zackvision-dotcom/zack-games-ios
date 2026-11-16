/* Kunai Online — flat-vector isometric trees, after the user's references:
   no ink outline, canopies made of hundreds of small leaves placed on 3D volumes and lit per leaf (light top-left),
   slim grey-brown trunk forking into branches, soft leafy cast shadow to the right, grass tufts at the foot.
   Drawn in world units (24 per metre). TREES.make({kind, h, seed}) → object with render/bake/bounds like an ISO scene. */
window.TREES = (() => {
  const M = 24, TAU = Math.PI * 2;
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const PAL = {
    green:  ['#2f5a24', '#46762c', '#5f9334', '#7bae3c', '#9cc84c', '#bedb6a'],
    olive:  ['#3a5a26', '#557a30', '#6f9538', '#8db044', '#accb58', '#cadf78'],
    dark:   ['#21452a', '#2f5d34', '#3f7540', '#558f4c', '#71aa5c', '#93c472'],
    sakura: ['#b65a82', '#cf7097', '#e38fb0', '#f0aac4', '#f8c7d8', '#fde3ec'],
    deep:   ['#0f2216', '#18321e', '#214426', '#2c5830', '#3b6e3c', '#52864c'],   // the Forest of Death: dark, wet foliage
    maple:  ['#6a1a14', '#8e2418', '#b8341e', '#d8502a', '#ec7a3a', '#f6a860'],   // momiji
    ginkgo: ['#8a6a14', '#b08a1a', '#d0a828', '#e6c43a', '#f2d860', '#f8ea96'],
    spring: ['#3a6a26', '#4f8a30', '#6aa83a', '#8ac44a', '#acd866', '#d0ec92'],
    mist:   ['#1e302e', '#2c4440', '#3c5a54', '#527268', '#6e8c82', '#93aca2'],   // Kiri: blue-green foliage dulled by the fog
    autumn: ['#7a3a1e', '#9e4f22', '#c46a28', '#e08a32', '#f0ab44', '#f7cc6a'],
  };
  const LIGHT = [-.5, -.62, .6];                    // screen x, screen y (up = negative), toward viewer
  const BARK = ['#5e504a', '#7b6a62', '#9a8a80'];

  // canopy volumes per kind: [x, y(up negative), z(depth), radius] in units of canopy size
  function volumes(kind, r0) {
    if (kind === 'round') return [[0, -.15, 0, .55], [-.45, .15, .1, .38], [.42, .1, .05, .4], [.05, -.65, -.05, .36]];
    if (kind === 'cypress') { const v = []; for (let i = 0; i < 7; i++) v.push([(r0() - .5) * .08, .55 - i * .27, 0, .26 - i * .018]); return v; }
    if (kind === 'pine') { const v = []; for (let i = 0; i < 9; i++) { const w = .52 - i * .052, y = .45 - i * .135; v.push([0, y - .04, 0, w * .62]); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + i; v.push([Math.cos(a) * w * .7, y, Math.sin(a) * w * .5, w * .5]); } } return v; }
    if (kind === 'bush') return [[-.3, .1, 0, .38], [.3, .12, .05, .36], [0, -.12, -.05, .42]];
    const v = [[0, -.1, 0, .5], [-.5, .1, .05, .36], [.5, .08, 0, .38], [-.25, -.45, -.1, .38], [.28, -.48, .05, .36], [0, .12, .2, .3], [-.65, -.15, -.1, .26], [.66, -.18, -.05, .26]];
    return v.map(q => [q[0] + (r0() - .5) * .08, q[1] + (r0() - .5) * .08, q[2], q[3] * (.92 + r0() * .16)]);
  }
  function leafShape(g, x, y, s, a, kind) {
    g.save(); g.translate(x, y); g.rotate(a);
    if (kind === 'pine' || kind === 'cypress') { g.beginPath(); g.moveTo(-s * 1.1, 0); g.lineTo(0, -s * .45); g.lineTo(s * 1.1, 0); g.lineTo(0, s * .45); g.closePath(); }
    else { g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(-s * .2, -s * .95, s * .9, -s * .1); g.quadraticCurveTo(s * .1, s * .9, -s, 0); g.closePath(); }
    g.fill(); g.restore();
  }
  function paint(g, o, layer) {
    const r0 = rng(o.seed || 1), kind = o.kind, pal = PAL[o.pal || (kind === 'sakura' ? 'sakura' : kind === 'pine' || kind === 'cypress' ? 'dark' : (o.seed % 3 ? 'green' : 'olive'))];
    const H = o.h * M, size = kind === 'bush' ? .8 * M * (o.w || 1.6) : kind === 'cypress' ? H * .34 : kind === 'pine' ? H * .62 : H * .58;
    const cx = 0, cy = kind === 'bush' ? -size * .45 : kind === 'cypress' ? -H * .57 : kind === 'pine' ? -H * .58 : -H * .7;
    const vol = volumes(kind, r0);
    // leaves: random points on the volumes' surfaces, lit by their normal
    const leaves = [], N = kind === 'bush' ? 380 : kind === 'cypress' ? 700 : 1500, ls = (kind === 'bush' ? 4.4 : 5.2) * (o.leaf || 1) * Math.max(.75, Math.min(1.3, H / (7 * M) * 1.1));
    for (let i = 0; i < N; i++) { const v = vol[(r0() * vol.length) | 0], u = r0() * 2 - 1, th = r0() * TAU, sq = Math.sqrt(1 - u * u), n = [Math.cos(th) * sq, -Math.abs(u) * (u < -.2 ? -1 : 1) * .0 + u, Math.sin(th) * sq];
      // n = (x, y(up neg), z toward viewer); keep mostly front/top facing so the canopy reads as a solid volume
      if (n[2] < -.35 && r0() < .7) continue;
      const rr = v[3] * size * (.92 + r0() * .12), x = cx + (v[0] * size + n[0] * rr), y = cy + (v[1] * size + n[1] * rr * .92), z = v[2] * size + n[2] * rr;
      let k = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]; k += (r0() - .5) * .35; leaves.push({ x, y, z, k, a: r0() * TAU, s: ls * (.75 + r0() * .5) }); }
    // sprigs: small leaves reaching past the volume on the lit side, so the silhouette is ragged like real foliage
    for (let i = 0; i < N * .14; i++) { const v = vol[(r0() * vol.length) | 0], th = -Math.PI + r0() * Math.PI * 1.15 - .1, n = [Math.cos(th), Math.sin(th) * .9, .2];
      const rr = v[3] * size * (1.08 + r0() * .16), k = n[0] * LIGHT[0] + n[1] * LIGHT[1] + .2 + (r0() - .5) * .3;
      leaves.push({ x: cx + v[0] * size + n[0] * rr, y: cy + v[1] * size + n[1] * rr * .92, z: v[2] * size + .1, k, a: th + (r0() - .5), s: ls * (.55 + r0() * .35) }); }
    if (layer !== 'objects') {
      // leafy cast shadow on the ground, to the right/back (light from the top-left)
      // one path, one fill: overlapping leaves never darken the shadow
      g.fillStyle = 'rgba(70,72,60,.17)'; g.beginPath();
      for (const L of leaves) { if (r0() < .5) continue; const gx = L.x + (-L.y) * .62 + 6, gy = (-L.y) * -.12 + L.z * .2 + 2; g.moveTo(gx + L.s * 1.4, gy); g.ellipse(gx, gy, L.s * 1.4, L.s * .75, 0, 0, TAU); }
      g.moveTo(4 + size * .16, 0); g.ellipse(4, 0, size * .16, size * .06, 0, 0, TAU); g.fill();
      if (layer === 'ground') return;
    }
    // grass tufts at the foot
    if (kind !== 'bush' && o.grass !== false) for (let t = 0; t < 4; t++) { const gx = (r0() - .5) * size * .9, gy = (r0() - .3) * size * .25; for (let b = 0; b < 9; b++) { const a = -Math.PI / 2 + (b - 4) * .2 + (r0() - .5) * .1, l = 9 + r0() * 8;
      g.strokeStyle = b % 2 ? '#7da642' : '#5f8a34'; g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(gx + (b - 4) * .9, gy); g.quadraticCurveTo(gx + Math.cos(a) * l * .5, gy + Math.sin(a) * l * .6, gx + Math.cos(a) * l, gy + Math.sin(a) * l); g.stroke(); } }
    // trunk forking into branches (behind the front leaves)
    const tw = kind === 'bush' || o.trunk === false ? 0 : Math.max(4, H * (kind === 'cypress' ? .03 : .045)), ty = cy + size * (kind === 'pine' ? .35 : .3);
    const back = leaves.filter(L => L.z < 0).sort((a, b) => a.z - b.z), front = leaves.filter(L => L.z >= 0).sort((a, b) => a.z - b.z);
    const drawLeaves = list => { for (const L of list) { const t = Math.max(0, Math.min(5, Math.round((L.k + .55) * 3.4)));
        g.fillStyle = 'rgba(20,40,15,.16)'; leafShape(g, L.x + L.s * .25, L.y + L.s * .3, L.s, L.a, kind);
        g.fillStyle = pal[t]; leafShape(g, L.x, L.y, L.s, L.a, kind);
        if (t >= 4 && kind !== 'pine' && kind !== 'cypress') { g.strokeStyle = 'rgba(255,255,225,.38)'; g.lineWidth = Math.max(.6, L.s * .14); g.beginPath(); g.moveTo(L.x - Math.cos(L.a) * L.s * .6, L.y - Math.sin(L.a) * L.s * .6); g.lineTo(L.x + Math.cos(L.a) * L.s * .5, L.y + Math.sin(L.a) * L.s * .5); g.stroke(); } } };
    // solid base so the canopy never shows holes
    g.fillStyle = pal[1]; for (const v of vol) { g.beginPath(); g.ellipse(cx + v[0] * size, cy + v[1] * size, v[3] * size * .9, v[3] * size * .84, 0, 0, TAU); g.fill(); }
    drawLeaves(back);
    if (tw) { const lim = (x0, y0, x1, y1, w0, w1) => { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
        g.beginPath(); g.moveTo(x0 + nx * w0, y0 + ny * w0); g.lineTo(x1 + nx * w1, y1 + ny * w1); g.lineTo(x1 - nx * w1, y1 - ny * w1); g.lineTo(x0 - nx * w0, y0 - ny * w0); g.closePath();
        const q = g.createLinearGradient(x0 + nx * w0, y0 + ny * w0, x0 - nx * w0, y0 - ny * w0); q.addColorStop(0, BARK[2]); q.addColorStop(.45, BARK[1]); q.addColorStop(1, BARK[0]); g.fillStyle = q; g.fill(); };
      const fx = (r0() - .5) * tw, fy = ty;
      lim(0, 0, fx, fy, tw, tw * .72);
      g.fillStyle = BARK[1]; g.beginPath(); g.ellipse(0, 0, tw * 1.25, tw * .4, 0, 0, TAU); g.fill();
      var branches = () => { if (kind !== 'pine' && kind !== 'cypress') for (const [bx, by, w] of [[-size * .32, ty - size * .3, .5], [size * .3, ty - size * .34, .5], [size * .04, ty - size * .5, .45], [-size * .12, ty - size * .2, .32], [size * .18, ty - size * .16, .3]]) lim(fx, fy, bx, by, tw * w * 1.2, tw * w * .5); };
      branches(); }
    // front leaves on top, with a few shadow pockets under the lowest ones
    drawLeaves(front);
    if (tw && typeof branches === 'function') { g.save(); g.beginPath(); g.rect(-size * 2, ty - size * .12, size * 4, size * 2); g.clip(); branches(); g.restore(); }
    g.fillStyle = 'rgba(30,50,20,.18)'; for (const v of vol) { if (v[1] < .05) continue; g.beginPath(); g.ellipse(cx + v[0] * size, cy + v[1] * size + v[3] * size * .55, v[3] * size * .7, v[3] * size * .22, 0, 0, TAU); g.fill(); }
    if (kind === 'sakura') { for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(255,236,244,.95)'; g.beginPath(); g.ellipse((r0() - .5) * size * 1.4, (r0() - .1) * size * .4, 2.4, 1.4, r0() * 3, 0, TAU); g.fill(); } }
  }
  function make(o) {
    o = Object.assign({ kind: 'broad', h: 7, seed: 1 }, o);
    if (o.kind === 'bush') o.h = 1.6;
    const H = o.h * M, wide = o.kind === 'cypress' ? H * .25 : o.kind === 'bush' ? M * (o.w || 1.6) * .7 : H * .45;
    return {
      bounds: () => ({ x0: -wide * 1.3, y0: -H * 1.12, x1: wide * 1.3 + H * .6, y1: wide * .5 + 10 }),
      render(g, s, ro) { paint(g, o, (ro || {}).layer); },
      bake(s, dpr, ro) { const b = this.bounds(); let d = dpr || 1; const w = (b.x1 - b.x0) * s, hh = (b.y1 - b.y0) * s; d = Math.min(d, 4096 / Math.max(w, hh, 1));
        const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w * d)); c.height = Math.max(1, Math.ceil(hh * d)); const g = c.getContext('2d');
        g.setTransform(d * s, 0, 0, d * s, -b.x0 * d * s, -b.y0 * d * s); this.render(g, s * d, ro); return { canvas: c, ox: -b.x0 * s, oy: -b.y0 * s, w, h: hh }; },
      faces: [], lines: [], sprites: [],
    };
  }
  return { make, kinds: ['broad', 'round', 'cypress', 'pine', 'bush', 'sakura'] };
})();
